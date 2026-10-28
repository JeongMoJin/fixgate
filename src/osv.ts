import semver from "semver";
import { fetchJson } from "./http.ts";
import type { Advisory, Component, Severity } from "./types.ts";

const API = "https://api.osv.dev/v1";

export interface OsvVuln {
  id: string;
  aliases?: string[];
  published?: string;
  summary?: string;
  details?: string;
  severity?: { type: string; score: string }[];
  database_specific?: { severity?: string };
  affected?: {
    package?: { name: string; ecosystem: string; purl?: string };
    ranges?: { type: string; events: Record<string, string>[] }[];
    versions?: string[];
  }[];
  references?: { type: string; url: string }[];
}

/** Returns the advisory ids that affect each purl. */
export async function queryVulnIds(purls: string[]): Promise<Map<string, string[]>> {
  const ids = new Map<string, string[]>();
  for (let i = 0; i < purls.length; i += 500) {
    const chunk = purls.slice(i, i + 500);
    const res = await fetchJson<{ results: { vulns?: { id: string }[] }[] }>(`${API}/querybatch`, {
      queries: chunk.map((purl) => ({ package: { purl } })),
    });
    res.results.forEach((r, j) => {
      if (r.vulns?.length) ids.set(chunk[j], r.vulns.map((v) => v.id));
    });
  }
  return ids;
}

export function getVuln(id: string): Promise<OsvVuln> {
  return fetchJson<OsvVuln>(`${API}/vulns/${id}`);
}

export function toAdvisory(vuln: OsvVuln, component: Component): Advisory {
  const aliases = vuln.aliases ?? [];
  return {
    id: vuln.id,
    cve: [vuln.id, ...aliases].find((a) => a.startsWith("CVE-")) ?? null,
    aliases,
    summary: vuln.summary ?? firstLine(vuln.details) ?? vuln.id,
    severity: severityOf(vuln),
    fixed: fixedVersion(vuln, component.name, component.version),
    lastAffected: lastAffectedVersion(vuln, component.name, component.version),
    url: `https://osv.dev/vulnerability/${vuln.id}`,
  };
}

function severityOf(vuln: OsvVuln): Severity {
  const label = vuln.database_specific?.severity?.toUpperCase();
  if (label === "CRITICAL" || label === "HIGH" || label === "MODERATE" || label === "LOW") return label;
  if (label === "MEDIUM") return "MODERATE";
  return "UNKNOWN";
}

/**
 * Finds the "fixed" event of the range that contains the installed version.
 * Returns null when the version is affected but no fixed release exists.
 */
export function fixedVersion(vuln: OsvVuln, name: string, version: string): string | null {
  for (const affected of vuln.affected ?? []) {
    if (affected.package && !samePackage(affected.package.name, name)) continue;
    for (const range of affected.ranges ?? []) {
      if (range.type !== "SEMVER" && range.type !== "ECOSYSTEM") continue;
      let introduced: string | null = null;
      for (const event of range.events) {
        if (event.introduced !== undefined) introduced = event.introduced;
        const end = event.fixed ?? event.last_affected;
        if (end === undefined || introduced === null) continue;
        if (!isVersion(introduced) || !isVersion(end) || !isVersion(version)) continue;
        const after = compareVersions(version, introduced) >= 0;
        const before = event.fixed ? compareVersions(version, end) < 0 : compareVersions(version, end) <= 0;
        if (after && before) {
          return event.fixed ?? null;
        }
        introduced = null;
      }
    }
  }
  return null;
}

/** The "last_affected" bound of the range that contains the installed version, if that is how it ends. */
export function lastAffectedVersion(vuln: OsvVuln, name: string, version: string): string | null {
  for (const affected of vuln.affected ?? []) {
    if (affected.package && !samePackage(affected.package.name, name)) continue;
    for (const range of affected.ranges ?? []) {
      let introduced: string | null = null;
      for (const event of range.events) {
        if (event.introduced !== undefined) introduced = event.introduced;
        if (event.last_affected === undefined || introduced === null) continue;
        const end = event.last_affected;
        if (isVersion(introduced) && isVersion(end) && isVersion(version) && compareVersions(version, introduced) >= 0 && compareVersions(version, end) <= 0) {
          return end;
        }
        introduced = null;
      }
    }
  }
  return null;
}

/**
 * Maven and other ecosystems use versions like "2.21", "1.1.10.7" or
 * "4.2.9.Final" that are not strict semver. Those are compared number by
 * number over every numeric part, so 1.1.10.7 sorts before 1.1.10.9.
 */
export function compareVersions(a: string, b: string): number {
  const bothSemver = semver.valid(a) !== null && semver.valid(b) !== null;
  if (bothSemver && !semver.prerelease(a) && !semver.prerelease(b)) return semver.compare(a, b);
  const nums = (v: string) => (/^\d+(\.\d+)*/.exec(v)?.[0] ?? "0").split(".").map(Number);
  const x = nums(a);
  const y = nums(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d) return Math.sign(d);
  }
  // Same numbers: "-jre" or ".Final" only names a build; npm pre-releases still order by semver.
  const preRelease = (v: string) => /^(alpha|beta|rc|pre|preview|canary|next|dev|snapshot|m\d*|\d+)$/i.test(String(semver.prerelease(v)?.[0] ?? ""));
  return bothSemver && (preRelease(a) || preRelease(b)) ? semver.compare(a, b) : 0;
}

/** OSV writes Maven names as group:artifact, the SBOM as group/artifact. */
function samePackage(osvName: string, name: string): boolean {
  return osvName === name || osvName.replace(":", "/") === name;
}

/** True when the string starts like a version number. */
export function isVersion(v: string): boolean {
  return /^\d/.test(v);
}

function firstLine(text?: string): string | undefined {
  return text?.split("\n").find((l) => l.trim())?.trim();
}
