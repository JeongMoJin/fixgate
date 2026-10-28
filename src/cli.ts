#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { diagnose, type Diagnosis } from "./diagnose.ts";
import { llmFromEnv } from "./llm.ts";
import { planFixes } from "./remediate.ts";
import { renderHtml, renderMarkdown, renderVex, type RunResult } from "./report.ts";
import type { CycloneDx } from "./sbom.ts";
import { triage } from "./triage.ts";
import { makeWorkCopy, runTests, verifyActions, type Attempt } from "./verify.ts";

const USAGE = `FixGate — SBOM 취약점 경보를 처리 순서와 검증된 조치로 바꿉니다

  fixgate scan <서비스 폴더> [--sbom <CycloneDX.json>] [--out <폴더>]
      읽기만 합니다. SBOM → 취약점 매칭 → 실제 악용 정보 → 처리 순서 보고서

  fixgate fix <서비스 폴더> [--out <폴더>]
      scan 후 작업 사본에서 조치를 적용하고, 설치·테스트·재스캔·새 취약점 관문을
      모두 통과한 조치만 남깁니다. 원본 폴더는 건드리지 않습니다.

  FIXGATE_LLM=claude-code 이면 테스트 관문에서 실패한 조치의 원인과 선택지를
  Claude Code(로그인한 구독)로 설명합니다. FIXGATE_LLM_MODEL(기본 sonnet),
  FIXGATE_LLM_MAX_CALLS(기본 10). 답은 .fixgate-cache/llm에 남아 다시 묻지 않습니다.`;

async function main(argv: string[]): Promise<number> {
  const [command, target] = argv;
  if (!command || !target || !["scan", "fix"].includes(command)) {
    console.log(USAGE);
    return command ? 1 : 0;
  }
  const dir = resolve(target);
  const sbomPath = flag(argv, "--sbom");
  const sbom = sbomPath ? (JSON.parse(readFileSync(sbomPath, "utf8")) as CycloneDx) : undefined;

  const before = await triage(dir, { sbom });
  const out = resolve(flag(argv, "--out") ?? join("fixgate-out", before.context.service));
  mkdirSync(out, { recursive: true });

  let after = null;
  let attempts: Attempt[] = [];
  let diff = "";
  const diagnoses: Record<string, Diagnosis> = {};
  if (command === "fix") {
    const work = makeWorkCopy(dir, before.context.service);
    const baseline = runTests(work);
    if (!baseline.ok) {
      console.error(baseline.missing ? "테스트가 없어 조치를 검증할 수 없습니다. scan만 실행하세요." : "기존 테스트가 이미 실패합니다. 먼저 테스트를 고쳐야 조치를 검증할 수 있습니다.");
      return 2;
    }
    console.log(`작업 사본: ${work}`);
    attempts = await verifyActions(work, await planFixes(before.findings, "direct"));
    const middle = await triage(work);
    attempts.push(...(await verifyActions(work, await planFixes(middle.findings, "override"))));
    after = await triage(work);

    const llm = llmFromEnv();
    if (llm) {
      for (const at of attempts.filter((t) => t.tries.some((x) => x.gates.some((g) => g.name === "test" && !g.ok)))) {
        const usage = before.findings.find((f) => f.component.name === at.action.name)?.usage ?? { imports: [], members: [], calls: [] };
        const d = await diagnose(llm, dir, at, usage, before.context);
        if (d) diagnoses[at.action.name] = d;
      }
      console.log(`LLM(${llm.model}) 새 호출 ${llm.calls()}회`);
    }
    const raw = spawnSync("git", ["diff", "--no-index", "--no-color", join(dir, "package.json"), join(work, "package.json")], { encoding: "utf8" }).stdout;
    diff = raw ? ["--- package.json (원본)", "+++ package.json (조치 후)", ...raw.split("\n").slice(4)].join("\n").trimEnd() : "";
    copyFileSync(join(work, "package.json"), join(out, "package.json"));
    copyFileSync(join(work, "package-lock.json"), join(out, "package-lock.json"));
  }

  const run: RunResult = { before, after, attempts, diagnoses, generatedAt: new Date().toISOString().slice(0, 16).replace("T", " "), diff };
  writeFileSync(join(out, "report.md"), renderMarkdown(run));
  writeFileSync(join(out, "report.html"), renderHtml(run));
  writeFileSync(join(out, "vex.json"), JSON.stringify(renderVex(before), null, 2) + "\n");
  writeFileSync(join(out, "findings.json"), JSON.stringify({ before: before.findings, after: after?.findings ?? null, attempts }, null, 2) + "\n");

  console.log(renderMarkdown(run).split("\n## 처리 순서")[0]);
  console.log(`보고서: ${join(out, "report.html")}`);
  return 0;
}

function flag(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}

process.exitCode = await main(process.argv.slice(2));
