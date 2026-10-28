import { fetchJson } from "./http.ts";
import type { Epss, Kev } from "./types.ts";

const KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
const EPSS_URL = "https://api.first.org/data/v1/epss";

export interface KevCatalog {
  version: string;
  byCve: Map<string, Kev>;
}

/** CISA's list of vulnerabilities confirmed to be exploited in the wild. */
export async function loadKev(): Promise<KevCatalog> {
  const data = await fetchJson<{
    catalogVersion: string;
    vulnerabilities: { cveID: string; dateAdded: string; knownRansomwareCampaignUse: string; requiredAction: string }[];
  }>(KEV_URL);
  const byCve = new Map<string, Kev>();
  for (const v of data.vulnerabilities) {
    byCve.set(v.cveID, {
      dateAdded: v.dateAdded,
      knownRansomware: v.knownRansomwareCampaignUse === "Known",
      requiredAction: v.requiredAction,
    });
  }
  return { version: data.catalogVersion, byCve };
}

/** FIRST EPSS: probability that a CVE is exploited in the next 30 days. */
export async function loadEpss(cves: string[]): Promise<Map<string, Epss>> {
  const scores = new Map<string, Epss>();
  const unique = [...new Set(cves)];
  for (let i = 0; i < unique.length; i += 50) {
    const chunk = unique.slice(i, i + 50);
    const res = await fetchJson<{ data: { cve: string; epss: string; percentile: string; date: string }[] }>(
      `${EPSS_URL}?cve=${chunk.join(",")}`,
    );
    for (const row of res.data) {
      scores.set(row.cve, { score: Number(row.epss), percentile: Number(row.percentile), date: row.date });
    }
  }
  return scores;
}
