import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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
  externalReferences?: { type: string; url: string }[];
}

export interface CycloneDx {
  bomFormat: string;
  specVersion?: string;
  metadata?: { component?: CdxComponent };
  components?: CdxComponent[];
  dependencies?: { ref: string; dependsOn?: string[] }[];
}

/**
 * Finds the SBOM for a service folder: a CycloneDX or SPDX file the team
 * already produces (bom.json, sbom.spdx.json), a Gradle lockfile for Java
 * services, or the npm lockfile. Nothing is installed or run.
 */
export function loadSbom(dir: string): CycloneDx {
  for (const name of ["bom.json", "sbom.cdx.json", "sbom.spdx.json", "bom.spdx.json"]) {
    if (existsSync(join(dir, name))) return toCycloneDx(JSON.parse(readFileSync(join(dir, name), "utf8")));
  }
  if (existsSync(join(dir, "gradle.lockfile"))) return gradleLockfileToCycloneDx(readFileSync(join(dir, "gradle.lockfile"), "utf8"));
  return generateNpmSbom(dir);
}

/** Accepts CycloneDX as is and converts SPDX 2.x JSON. */
export function toCycloneDx(doc: Record<string, any>): CycloneDx {
  if (doc.bomFormat === "CycloneDX") return doc as CycloneDx;
  if (doc.spdxVersion || doc.sbom?.spdxVersion) return spdxToCycloneDx(doc.sbom ?? doc);
  throw new Error("CycloneDX 또는 SPDX JSON만 읽을 수 있습니다");
}

interface SpdxPackage {
  SPDXID: string;
  name: string;
  versionInfo?: string;
  externalRefs?: { referenceType: string; referenceLocator: string }[];
}

/**
 * SPDX keeps the dependency graph in relationships. Packages without a purl
 * and a concrete version cannot be matched against advisories, so they drop out.
 */
export function spdxToCycloneDx(doc: { packages?: SpdxPackage[]; relationships?: { spdxElementId: string; relationshipType: string; relatedSpdxElement: string }[]; documentDescribes?: string[] }): CycloneDx {
  const purlOf = (p: SpdxPackage) => p.externalRefs?.find((r) => r.referenceType === "purl")?.referenceLocator;
  const usable = (p: SpdxPackage) => {
    const purl = purlOf(p);
    return purl && purl.includes("@") && p.versionInfo && /^\d/.test(p.versionInfo) && !/[\^~*<>|]/.test(p.versionInfo);
  };
  const packages = doc.packages ?? [];
  const described = new Set(doc.documentDescribes ?? []);
  const graph = new Map<string, string[]>();
  for (const r of doc.relationships ?? []) {
    if (r.relationshipType === "DESCRIBES") described.add(r.relatedSpdxElement);
    const [from, to] = r.relationshipType === "DEPENDS_ON" ? [r.spdxElementId, r.relatedSpdxElement] : r.relationshipType === "DEPENDENCY_OF" ? [r.relatedSpdxElement, r.spdxElementId] : [];
    if (from && to) graph.set(from, [...(graph.get(from) ?? []), to]);
  }
  const rootDeps = [...described].flatMap((id) => graph.get(id) ?? []);
  return {
    bomFormat: "CycloneDX",
    metadata: { component: { "bom-ref": "spdx:root", name: "root" } },
    components: packages
      .filter((p) => !described.has(p.SPDXID) && usable(p))
      .map((p) => ({ "bom-ref": p.SPDXID, name: p.name, version: p.versionInfo, purl: decodeURIComponent(purlOf(p)!) })),
    dependencies: [{ ref: "spdx:root", dependsOn: rootDeps }, ...[...graph].map(([ref, dependsOn]) => ({ ref, dependsOn }))],
  };
}

/**
 * A Gradle lockfile lists every resolved module with the classpaths it is on.
 * A module only on compile or test classpaths never ships, so it counts as
 * dev-only. The lockfile has no graph, so direct and transitive are unknown.
 */
export function gradleLockfileToCycloneDx(text: string): CycloneDx {
  const components: CdxComponent[] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = /^([^#=\s:]+):([^=\s:]+):([^=\s:]+)=(.*)$/.exec(line.trim());
    if (!m) continue;
    const [, group, artifact, version, confs] = m;
    const shipped = confs.split(",").some((c) => /^(production)?[rR]untimeClasspath$/.test(c.trim()));
    components.push({
      "bom-ref": `${group}:${artifact}@${version}`,
      group,
      name: artifact,
      version,
      purl: `pkg:maven/${group}/${artifact}@${version}`,
      properties: shipped ? [] : [{ name: "cdx:npm:package:development", value: "true" }],
      externalReferences: [{ type: "distribution", url: "https://repo1.maven.org/maven2" }],
    });
  }
  return { bomFormat: "CycloneDX", metadata: { component: { "bom-ref": "gradle:root", name: "root" } }, components, dependencies: [] };
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
        externalReferences: e.resolved ? [{ type: "distribution", url: e.resolved }] : [],
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
        path: paths.get(ref) ?? (children.size ? [ref] : []),
        fromRegistry: isFromRegistry(c),
      };
    });
}

/** Without a distribution reference the source is unknown, and the registry is the common case. */
function isFromRegistry(c: CdxComponent): boolean {
  const refs = c.externalReferences ?? [];
  if (refs.some((r) => r.type === "vcs")) return false;
  const dist = refs.find((r) => r.type === "distribution")?.url;
  return !dist || /^https?:\/\/[^/]*registry/.test(dist);
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
