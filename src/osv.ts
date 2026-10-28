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
    if (affected.package && affected.package.name !== name) continue;
    for (const range of affected.ranges ?? []) {
      if (range.type !== "SEMVER" && range.type !== "ECOSYSTEM") continue;
      let introduced: string | null = null;
      for (const event of range.events) {
        if (event.introduced !== undefined) introduced = event.introduced;
        const end = event.fixed ?? event.last_affected;
        if (end === undefined || introduced === null) continue;
        const from = introduced === "0" ? "0.0.0" : introduced;
        if (!semver.valid(from) || !semver.valid(end) || !semver.valid(version)) continue;
        if (semver.gte(version, from) && (event.fixed ? semver.lt(version, end) : semver.lte(version, end))) {
          return event.fixed ?? null;
        }
        introduced = null;
      }
    }
  }
  return null;
}

function firstLine(text?: string): string | undefined {
  return text?.split("\n").find((l) => l.trim())?.trim();
}
