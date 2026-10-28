import { execSync } from "node:child_process";
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

/** Builds a CycloneDX SBOM from the lockfile without installing or running anything. */
export function generateNpmSbom(dir: string): CycloneDx {
  const out = execSync("npm sbom --sbom-format cyclonedx --package-lock-only", {
    cwd: dir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 256 * 1024 * 1024,
  });
  return JSON.parse(out) as CycloneDx;
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
