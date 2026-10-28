import semver from "semver";
import { fetchJson } from "./http.ts";
import { queryVulnIds } from "./osv.ts";
import { maxTier } from "./prioritize.ts";
import type { Component, Finding, Tier } from "./types.ts";
import { TIER_ORDER } from "./types.ts";

export interface FixAction {
  name: string;
  current: string;
  target: string | null;
  /** Next clean releases to try, in order, when the target fails the re-scan gates. */
  alternatives: string[];
  /** "direct" edits the service's own dependency; "override" pins a transitive package. */
  kind: "direct" | "override";
  /** True when the target leaves the range a caret (^current) would allow, so code may need changes. */
  outsideCaret: boolean;
  tier: Tier;
  resolves: string[];
  note: string;
}

interface Packument {
  versions: Record<string, { deprecated?: string }>;
}

export async function listVersions(name: string): Promise<{ version: string; deprecated: boolean }[]> {
  const doc = await fetchJson<Packument | null>(`https://registry.npmjs.org/${name.replace("/", "%2F")}`, undefined, {
    accept: "application/vnd.npm.install-v1+json",
  });
  if (!doc) return [];
  return Object.entries(doc.versions)
    .filter(([v]) => semver.valid(v) && !semver.prerelease(v))
    .map(([version, meta]) => ({ version, deprecated: Boolean(meta.deprecated) }))
    .sort((a, b) => semver.compare(a.version, b.version));
}

/**
 * Orders the releases with no known advisories so that the least change comes
 * first: releases inside the caret range of the current version (least likely
 * to break code), then the rest, each group from oldest to newest.
 */
export function rankTargets(
  current: string,
  floor: string,
  candidates: { version: string; deprecated: boolean }[],
  isClean: (version: string) => boolean,
): string[] {
  const clean = candidates
    .filter((c) => !c.deprecated && semver.gt(c.version, current) && semver.gte(c.version, floor))
    .map((c) => c.version)
    .filter(isClean);
  const inCaret = clean.filter((v) => semver.satisfies(v, `^${current}`));
  return [...inCaret, ...clean.filter((v) => !inCaret.includes(v))];
}

/**
 * When the first target drags in a vulnerable sub-dependency, the newest
 * release in the same caret range is the one most likely to have updated it,
 * so retries go newest first and stay in range when they can.
 */
export function retryOrder(rest: string[], current: string): string[] {
  const inCaret = rest.filter((v) => semver.satisfies(v, `^${current}`));
  return (inCaret.length ? [...inCaret].reverse() : rest).slice(0, 4);
}

/** Groups production findings into one action per package, most urgent first. */
export async function planFixes(findings: Finding[], scope: "direct" | "override"): Promise<FixAction[]> {
  const groups = new Map<string, Finding[]>();
  for (const f of findings) {
    if (f.tier === "none" || f.component.ecosystem !== "npm") continue;
    if ((scope === "direct") !== f.component.direct) continue;
    const key = `${f.component.name}@${f.component.version}`;
    groups.set(key, [...(groups.get(key) ?? []), f]);
  }

  const actions: FixAction[] = [];
  for (const group of groups.values()) {
    const component: Component = group[0].component;
    const fixes = group.map((f) => f.advisory.fixed).filter((v): v is string => v !== null && semver.valid(v) !== null);
    const floor = fixes.length ? fixes.reduce((a, b) => (semver.gt(a, b) ? a : b)) : component.version;
    const candidates = (await listVersions(component.name)).filter((c) => semver.gte(c.version, floor)).slice(0, 200);
    const vulnerable = await queryVulnIds(candidates.map((c) => `pkg:npm/${component.name.replace("@", "%40")}@${c.version}`));
    const dirty = new Set([...vulnerable.keys()].map((purl) => purl.slice(purl.lastIndexOf("@") + 1)));
    const ranked = rankTargets(component.version, floor, candidates, (v) => !dirty.has(v));
    const target = ranked[0] ?? null;
    const outsideCaret = target !== null && !semver.satisfies(target, `^${component.version}`);

    actions.push({
      name: component.name,
      current: component.version,
      target,
      alternatives: retryOrder(ranked.slice(1), component.version),
      kind: scope,
      outsideCaret,
      tier: maxTier(group.map((f) => f.tier)),
      resolves: [...new Set(group.map((f) => f.advisory.id))],
      note: target === null ? "알려진 취약점이 없는 릴리스가 없음 — 완화책 필요" : outsideCaret ? "호환 범위(^) 밖 버전 — 테스트로 동작 확인 필요" : "호환 범위 안 버전",
    });
  }
  return actions.sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || b.resolves.length - a.resolves.length);
}
