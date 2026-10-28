import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { getVuln, queryVulnIds, toAdvisory } from "./osv.ts";
import { decide } from "./prioritize.ts";
import { loadSbom, parseCycloneDx, type CycloneDx } from "./sbom.ts";
import { loadEpss, loadKev } from "./threat.ts";
import type { Component, Finding, ServiceContext } from "./types.ts";
import { scanUsage } from "./usage.ts";

export interface Triage {
  context: ServiceContext;
  components: Component[];
  findings: Finding[];
  sources: { osv: string; epssDate: string | null; kevVersion: string };
}

export function loadContext(dir: string): ServiceContext {
  const file = join(dir, "fixgate.json");
  const defaults: ServiceContext = { service: basename(dir), exposure: "internet", criticality: "medium", personalData: false };
  if (!existsSync(file)) return defaults;
  return { ...defaults, ...(JSON.parse(readFileSync(file, "utf8")) as Partial<ServiceContext>) };
}

/**
 * Reads the service's SBOM, matches every component against OSV, adds
 * exploitation data and source usage, and decides a tier for each finding.
 * Nothing here calls an LLM: every fact comes from a public database or the
 * service's own files.
 */
export async function triage(dir: string, opts: { sbom?: CycloneDx } = {}): Promise<Triage> {
  const context = loadContext(dir);
  const components = parseCycloneDx(opts.sbom ?? loadSbom(dir));
  const byPurl = new Map(components.map((c) => [c.purl, c]));

  const ids = await queryVulnIds(components.map((c) => c.purl));
  const pairs: { component: Component; id: string }[] = [];
  for (const [purl, list] of ids) for (const id of list) pairs.push({ component: byPurl.get(purl)!, id });

  const vulns = await mapLimit(pairs, 8, (p) => getVuln(p.id));
  const advisories = pairs.map((p, i) => ({ component: p.component, advisory: toAdvisory(vulns[i], p.component) }));

  const cves = advisories.map((a) => a.advisory.cve).filter((c): c is string => c !== null);
  const [epss, kev] = await Promise.all([loadEpss(cves), loadKev()]);
  const usage = scanUsage(dir, [...new Set(components.filter((c) => c.direct).map((c) => c.name))]);

  const findings: Finding[] = advisories.map(({ component, advisory }) => {
    const facts = {
      component,
      advisory,
      epss: advisory.cve ? epss.get(advisory.cve) ?? null : null,
      kev: advisory.cve ? kev.byCve.get(advisory.cve) ?? null : null,
      usage: usage.get(component.name) ?? { imports: [], members: [], calls: [] },
      context,
    };
    return { ...facts, ...decide(facts) };
  });

  const epssDate = [...epss.values()][0]?.date ?? null;
  return { context, components, findings, sources: { osv: "api.osv.dev", epssDate, kevVersion: kev.version } };
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}
