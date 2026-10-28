import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { releaseNotes } from "./changelog.ts";
import { queryVulnIds } from "./osv.ts";
import type { FixAction } from "./remediate.ts";
import { generateNpmSbom, parseCycloneDx } from "./sbom.ts";

export type GateName = "install" | "test" | "rescan" | "no-new";

export interface Gate {
  name: GateName;
  ok: boolean;
  detail: string;
}

export interface Try {
  version: string;
  gates: Gate[];
  passed: boolean;
  /** Last lines of the failing step, kept for the person who takes over. */
  log: string;
  /** Release notes between the current and tried version, fetched when tests fail. */
  notes: { file: string; lines: string[] } | null;
}

export interface Attempt {
  action: FixAction;
  tries: Try[];
  passed: boolean;
  /** The version that passed every gate, if any. */
  version: string | null;
}

const SKIP = new Set([".git", "fixgate-out", ".fixgate-cache"]);
const INSTALL = "npm install --ignore-scripts --no-audit --no-fund";

/** Copies the service so fixes are tried away from the original checkout. */
export function makeWorkCopy(dir: string, service: string): string {
  const work = mkdtempSync(join(tmpdir(), `fixgate-${service}-`));
  cpSync(dir, work, { recursive: true, filter: (src) => !SKIP.has(src.split(/[\\/]/).pop()!) });
  return work;
}

function run(command: string, cwd: string): { ok: boolean; out: string } {
  const r = spawnSync(command, { cwd, shell: true, encoding: "utf8", timeout: 10 * 60 * 1000, maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

/** Installs dependencies in a work copy that was made without node_modules. */
export function installDeps(dir: string): boolean {
  return existsSync(join(dir, "node_modules")) || run(INSTALL, dir).ok;
}

export function runTests(dir: string): { ok: boolean; out: string; missing: boolean } {
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  if (!pkg.scripts?.test || /no test specified/.test(pkg.scripts.test)) return { ok: false, out: "", missing: true };
  return { ...run("npm test", dir), missing: false };
}

async function advisoryIds(dir: string): Promise<Map<string, Set<string>>> {
  const components = parseCycloneDx(generateNpmSbom(dir)).filter((c) => !c.dev);
  const ids = await queryVulnIds(components.map((c) => c.purl));
  const byName = new Map<string, Set<string>>();
  for (const c of components) {
    for (const id of ids.get(c.purl) ?? []) byName.set(c.name, new Set([...(byName.get(c.name) ?? []), id]));
  }
  return byName;
}

export function applyVersion(pkg: Record<string, any>, action: FixAction, version: string): void {
  if (action.kind === "override") {
    pkg.overrides = { ...(pkg.overrides ?? {}), [action.name]: version };
    return;
  }
  for (const field of ["dependencies", "optionalDependencies"]) {
    const spec: string | undefined = pkg[field]?.[action.name];
    if (spec === undefined) continue;
    const prefix = /^[\^~]/.exec(spec)?.[0] ?? "";
    pkg[field][action.name] = `${prefix}${version}`;
  }
}

/**
 * Tries each action on the work copy and keeps it only when all four gates
 * pass: install succeeds, the existing tests pass, a fresh SBOM scan no longer
 * shows the advisories the action was meant to remove, and no new advisory
 * appears. When only the scan gates fail, the next candidate release is tried;
 * a test failure means code must change, so the action goes to a person.
 */
export async function verifyActions(work: string, actions: FixAction[]): Promise<Attempt[]> {
  const pkgFile = join(work, "package.json");
  const lockFile = join(work, "package-lock.json");
  let known = await advisoryIds(work);
  const attempts: Attempt[] = [];

  for (const action of actions) {
    const tries: Try[] = [];
    let passedVersion: string | null = null;

    for (const version of action.target ? [action.target, ...action.alternatives] : []) {
      const savedPkg = readFileSync(pkgFile, "utf8");
      const savedLock = readFileSync(lockFile, "utf8");
      const pkg = JSON.parse(savedPkg);
      applyVersion(pkg, action, version);
      writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + "\n");

      const { gates, log, after } = await checkGates(work, action, known);
      const passed = gates.length === 4 && gates.every((g) => g.ok);
      const testFailed = gates.some((g) => g.name === "test" && !g.ok);
      const notes = testFailed ? await releaseNotes(action.name, action.current, version).catch(() => null) : null;
      tries.push({ version, gates, passed, log: log.replaceAll(work, "<작업 사본>"), notes });

      if (passed) {
        known = after!;
        passedVersion = version;
        break;
      }
      writeFileSync(pkgFile, savedPkg);
      writeFileSync(lockFile, savedLock);
      run(INSTALL, work);
      if (gates.some((g) => (g.name === "install" || g.name === "test") && !g.ok)) break;
    }
    attempts.push({ action, tries, passed: passedVersion !== null, version: passedVersion });
  }
  return attempts;
}

async function checkGates(
  work: string,
  action: FixAction,
  known: Map<string, Set<string>>,
): Promise<{ gates: Gate[]; log: string; after: Map<string, Set<string>> | null }> {
  const gates: Gate[] = [];
  const install = run(INSTALL, work);
  gates.push({ name: "install", ok: install.ok, detail: install.ok ? "설치 성공" : "설치 실패" });
  if (!install.ok) return { gates, log: tail(install.out), after: null };

  const test = runTests(work);
  gates.push({
    name: "test",
    ok: test.ok,
    detail: test.missing ? "테스트 없음 — 검증할 수 없어 완료로 치지 않음" : test.ok ? "기존 테스트 통과" : "기존 테스트 실패",
  });
  if (!test.ok) return { gates, log: tail(test.out), after: null };

  const after = await advisoryIds(work);
  const left = [...(after.get(action.name) ?? [])].filter((id) => action.resolves.includes(id));
  gates.push({
    name: "rescan",
    ok: left.length === 0,
    detail: left.length ? `재스캔에 남은 취약점: ${left.join(", ")}` : `재스캔에서 대상 ${action.resolves.length}건 사라짐`,
  });
  const introduced: string[] = [];
  for (const [name, ids] of after) for (const id of ids) if (!known.get(name)?.has(id)) introduced.push(`${name} ${id}`);
  gates.push({
    name: "no-new",
    ok: introduced.length === 0,
    detail: introduced.length ? `새로 생긴 취약점: ${introduced.join(", ")}` : "새로 생긴 취약점 없음",
  });
  return { gates, log: "", after };
}

function tail(text: string, lines = 30): string {
  return text.split(/\r?\n/).filter((l) => l.trim()).slice(-lines).join("\n");
}
