import semver from "semver";
import { fetchJson, fetchText } from "./http.ts";

const NAMES = ["CHANGELOG.md", "History.md", "HISTORY.md", "CHANGES.md"];
const BREAKING = /breaking|no longer|removed|drop(ped)?\b|must|require[sd]?\b|deprecat|default/i;

/**
 * Pulls the release notes for the versions a fix skips over, straight from the
 * published package. When a fix fails the test gate these notes are usually
 * where the cause is written down, so they go to the person who takes over.
 */
export async function releaseNotes(name: string, from: string, to: string): Promise<{ file: string; lines: string[] } | null> {
  const places = NAMES.map((file) => ({ url: `https://unpkg.com/${name}@${to}/${file}`, label: `${name}@${to}/${file}` }));
  const repo = await githubRepo(name, to);
  if (repo) places.push(...NAMES.map((file) => ({ url: `https://raw.githubusercontent.com/${repo}/HEAD/${file}`, label: `github.com/${repo}/${file}` })));

  for (const place of places) {
    const text = await fetchText(place.url);
    if (!text) continue;
    const lines = notesBetween(text, from, to);
    if (lines.length) return { file: place.label, lines };
  }
  return null;
}

/** Many packages keep their changelog in the repository rather than the published tarball. */
async function githubRepo(name: string, version: string): Promise<string | null> {
  const meta = await fetchJson<{ repository?: string | { url?: string } } | null>(
    `https://registry.npmjs.org/${name.replace("/", "%2F")}/${version}`,
  );
  const url = typeof meta?.repository === "string" ? meta.repository : meta?.repository?.url;
  const m = url ? /github\.com[/:]([\w.-]+\/[\w.-]+?)(\.git)?$/.exec(url) : null;
  return m ? m[1] : null;
}

/**
 * Lines of the sections for versions in (from, to]. When that is too long,
 * only the version headings and lines that read like breaking changes stay.
 */
export function notesBetween(text: string, from: string, to: string, max = 25): string[] {
  const picked: { line: string; heading: boolean }[] = [];
  let inRange = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const heading = /^#{1,4}\s.*?v?(\d+\.\d+\.\d+)/.exec(line) ?? /^v?(\d+\.\d+\.\d+)\s*(\/|$)/.exec(line);
    if (heading) {
      const v = heading[1];
      inRange = semver.valid(v) !== null && semver.gt(v, from) && semver.lte(v, to);
      if (inRange) picked.push({ line, heading: true });
    } else if (inRange && line && !/^[=-]+$/.test(line)) {
      picked.push({ line, heading: false });
    }
  }
  const kept = picked.length <= max ? picked : picked.filter((p) => p.heading || BREAKING.test(p.line));
  return kept.slice(0, max).map((p) => p.line);
}
