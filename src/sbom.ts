import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Component } from "./types.ts";

interface CdxComponent {
  "bom-ref"?: string;
  group?: string;
  name: string;
  version?: string;
  purl?: string;
  scope?: string;
  properties?: { name: string; value: string }[];
}

export interface CycloneDx {
  bomFormat: string;
  specVersion?: string;
  metadata?: { component?: CdxComponent };
  components?: CdxComponent[];
  dependencies?: { ref: string; dependsOn?: string[] }[];
}

/**
 * Builds a CycloneDX SBOM from the lockfile without installing or running
 * anything. Peer-dependency conflicts, common in real projects, would make npm
 * refuse; they do not change which versions are installed, so they are ignored.
 */
export function generateNpmSbom(dir: string): CycloneDx {
  try {
    const out = execSync("npm sbom --sbom-format cyclonedx --package-lock-only --legacy-peer-deps", {
      cwd: dir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 256 * 1024 * 1024,
    });
    return JSON.parse(out) as CycloneDx;
  } catch {
    // npm refuses lockfiles that disagree with package.json; read the lockfile itself instead.
    return lockfileToCycloneDx(JSON.parse(readFileSync(join(dir, "package-lock.json"), "utf8")));
  }
}

interface LockEntry {
  name?: string;
  version?: string;
  link?: boolean;
  resolved?: string;
  dev?: boolean;
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Builds the same CycloneDX shape from a package-lock.json (v2 or v3), using
 * Node's lookup rule to connect each package to the copy it actually loads.
 * Workspace packages are the project's own code, so they join the graph but
 * are not listed as components.
 */
export function lockfileToCycloneDx(lock: { packages?: Record<string, LockEntry> }): CycloneDx {
  const packages = lock.packages;
  if (!packages) throw new Error("package-lock.json v2 or newer is required");
  const nameAt = (loc: string, e: LockEntry) => e.name ?? loc.slice(loc.lastIndexOf("node_modules/") + "node_modules/".length);
  const refOf = (loc: string): string | null => {
    const e = packages[loc];
    if (!e) return null;
    if (e.link && e.resolved !== undefined) return refOf(e.resolved);
    if (loc === "" || !loc.includes("node_modules/")) return `workspace:${loc || "."}`;
    return e.version ? `${nameAt(loc, e)}@${e.version}` : null;
  };
  const resolve = (from: string, dep: string): string | null => {
    for (let base = from; ; base = parentOf(base)) {
      const loc = base ? `${base}/node_modules/${dep}` : `node_modules/${dep}`;
      if (packages[loc]) return loc;
      if (!base) return null;
    }
  };

  const components = new Map<string, CdxComponent>();
  const graph = new Map<string, Set<string>>();
  for (const [loc, e] of Object.entries(packages)) {
    const ref = refOf(loc);
    if (!ref || e.link) continue;
    if (!ref.startsWith("workspace:")) {
      const name = nameAt(loc, e);
      // The same version can sit in several places; it ships if any copy does.
      const shipped = !e.dev || components.get(ref)?.properties?.length === 0;
      components.set(ref, {
        "bom-ref": ref,
        name,
        version: e.version,
        purl: `pkg:npm/${name.replace("@", "%40")}@${e.version}`,
        properties: shipped ? [] : [{ name: "cdx:npm:package:development", value: "true" }],
      });
    }
    const deps = { ...e.dependencies, ...e.optionalDependencies, ...(ref.startsWith("workspace:") ? e.devDependencies : {}) };
    const children = graph.get(ref) ?? new Set<string>();
    for (const dep of Object.keys(deps)) {
      const target = resolve(loc, dep);
      const child = target === null ? null : refOf(target);
      if (child) children.add(child);
    }
    graph.set(ref, children);
  }

  // The root depends on its own packages and on every workspace package's dependencies.
  const rootDeps = new Set<string>();
  for (const [ref, children] of graph) if (ref.startsWith("workspace:")) for (const c of children) rootDeps.add(c);
  return {
    bomFormat: "CycloneDX",
    specVersion: "1.5",
    metadata: { component: { "bom-ref": "workspace:root", name: "root" } },
    components: [...components.values()],
    dependencies: [
      { ref: "workspace:root", dependsOn: [...rootDeps].filter((r) => !r.startsWith("workspace:")) },
      ...[...graph].filter(([ref]) => !ref.startsWith("workspace:")).map(([ref, children]) => ({ ref, dependsOn: [...children] })),
    ],
  };
}

function parentOf(loc: string): string {
  const i = loc.lastIndexOf("/node_modules/");
  return i < 0 ? "" : loc.slice(0, i);
}

/**
 * Reads components from any CycloneDX SBOM. Dev-only marking and the dependency
 * graph are used when the generator provides them; without them every component
 * is treated as shipped to production, which is the safe default.
 */
export function parseCycloneDx(bom: CycloneDx): Component[] {
  if (bom.bomFormat !== "CycloneDX") throw new Error("Only CycloneDX SBOMs are supported");
  const rootRef = bom.metadata?.component?.["bom-ref"];
  const children = new Map<string, string[]>();
  for (const dep of bom.dependencies ?? []) children.set(dep.ref, dep.dependsOn ?? []);

  const paths = shortestPaths(rootRef, children);
  const direct = new Set(rootRef ? children.get(rootRef) ?? [] : []);

  return (bom.components ?? [])
    .filter((c) => c.purl && c.version)
    .map((c) => {
      const ref = c["bom-ref"] ?? c.purl!;
      return {
        ref,
        name: c.group ? `${c.group}/${c.name}` : c.name,
        version: c.version!,
        purl: c.purl!,
        ecosystem: purlType(c.purl!),
        dev: isDevOnly(c),
        direct: direct.has(ref),
        path: paths.get(ref) ?? [ref],
      };
    });
}

function isDevOnly(c: CdxComponent): boolean {
  if (c.scope === "excluded") return true;
  return (c.properties ?? []).some((p) => p.name === "cdx:npm:package:development" && p.value === "true");
}

function purlType(purl: string): string {
  return purl.slice(4, purl.indexOf("/")).toLowerCase();
}

function shortestPaths(rootRef: string | undefined, children: Map<string, string[]>): Map<string, string[]> {
  const paths = new Map<string, string[]>();
  if (!rootRef) return paths;
  const queue: string[][] = (children.get(rootRef) ?? []).map((ref) => [ref]);
  while (queue.length) {
    const path = queue.shift()!;
    const ref = path[path.length - 1];
    if (paths.has(ref)) continue;
    paths.set(ref, path);
    for (const next of children.get(ref) ?? []) if (!paths.has(next)) queue.push([...path, next]);
  }
  return paths;
}
