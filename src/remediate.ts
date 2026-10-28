import semver from "semver";
import { fetchJson, fetchText } from "./http.ts";
import { compareVersions, isVersion, queryVulnIds } from "./osv.ts";
import { maxTier } from "./prioritize.ts";
import type { Component, Finding, Tier } from "./types.ts";
import { TIER_ORDER } from "./types.ts";

export interface FixAction {
  name: string;
  current: string;
  target: string | null;
  /** Next clean releases to try, in order, when the target fails the re-scan gates. */
  alternatives: string[];
  /**
   * "direct" edits the service's own npm dependency; "override" pins a
   * transitive npm package; "pin" is a build-tool version constraint (Gradle
   * constraints, Maven dependencyManagement) that FixGate plans but does not apply.
   */
  kind: "direct" | "override" | "pin";
  /** True when the target leaves the range a caret (^current) would allow, so code may need changes. */
  outsideCaret: boolean;
  tier: Tier;
  resolves: string[];
  note: string;
}

interface Packument {
  versions: Record<string, { deprecated?: string }>;
}

const PRERELEASE = /(alpha|beta|rc|cr|snapshot|preview|milestone|-m\d|\.m\d|ea\b)/i;

export async function listVersions(name: string, ecosystem = "npm"): Promise<{ version: string; deprecated: boolean }[]> {
  if (ecosystem === "maven") return parseMavenMetadata(await fetchText(mavenMetadataUrl(name)));
  const doc = await fetchJson<Packument | null>(`https://registry.npmjs.org/${name.replace("/", "%2F")}`, undefined, {
    accept: "application/vnd.npm.install-v1+json",
  });
  if (!doc) return [];
  return Object.entries(doc.versions)
    .filter(([v]) => semver.valid(v) && !semver.prerelease(v))
    .map(([version, meta]) => ({ version, deprecated: Boolean(meta.deprecated) }))
    .sort((a, b) => semver.compare(a.version, b.version));
}

function mavenMetadataUrl(name: string): string {
  const [group, artifact] = name.split("/");
  return `https://repo1.maven.org/maven2/${group.replaceAll(".", "/")}/${artifact}/maven-metadata.xml`;
}

/** Release versions from a Maven Central maven-metadata.xml, oldest first. */
export function parseMavenMetadata(xml: string | null): { version: string; deprecated: boolean }[] {
  if (!xml) return [];
  return [...xml.matchAll(/<version>([^<]+)<\/version>/g)]
    .map((m) => m[1].trim())
    .filter((v) => !PRERELEASE.test(v) && isVersion(v))
    .sort(compareVersions)
    .map((version) => ({ version, deprecated: false }));
}

const gt = (a: string, b: string) => compareVersions(a, b) > 0;
const gte = (a: string, b: string) => compareVersions(a, b) >= 0;
const parts = (v: string) => (/^\d+(\.\d+)*/.exec(v)?.[0] ?? "0").split(".").map(Number);
/** Same rule as npm's caret: same major, or same minor while the major is 0. */
const inCaret = (v: string, current: string) => {
  const [a, b] = [parts(v), parts(current)];
  return a[0] === b[0] && (b[0] !== 0 || a[1] === b[1]);
};
/** The part after the numbers, such as "-jre" or ".Final": a different one is a different build. */
const flavor = (v: string) => v.replace(/^\d+(\.\d+)*/, "");

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
    .filter((c) => !c.deprecated && flavor(c.version) === flavor(current) && gt(c.version, current) && gte(c.version, floor))
    .map((c) => c.version)
    .filter(isClean);
  const near = clean.filter((v) => inCaret(v, current));
  return [...near, ...clean.filter((v) => !near.includes(v))];
}

/**
 * When the first target drags in a vulnerable sub-dependency, the newest
 * release in the same caret range is the one most likely to have updated it,
 * so retries go newest first and stay in range when they can.
 */
export function retryOrder(rest: string[], current: string): string[] {
  const near = rest.filter((v) => inCaret(v, current));
  return (near.length ? [...near].reverse() : rest).slice(0, 4);
}

function purlFor(component: Component, version: string): string {
  if (component.ecosystem === "maven") return `pkg:maven/${component.name}@${version}`;
  return `pkg:npm/${component.name.replace("@", "%40")}@${version}`;
}

/**
 * Groups production findings into one action per package, most urgent first.
 * npm packages are split into direct and override actions so the direct ones
 * can be tried first; Maven packages become version pins in the "direct" pass.
 */
export async function planFixes(findings: Finding[], scope: "direct" | "override"): Promise<FixAction[]> {
  const groups = new Map<string, Finding[]>();
  for (const f of findings) {
    const eco = f.component.ecosystem;
    if (f.tier === "none" || (eco !== "npm" && eco !== "maven")) continue;
    if (eco === "npm" && (scope === "direct") !== f.component.direct) continue;
    if (eco === "maven" && scope !== "direct") continue;
    const key = `${f.component.name}@${f.component.version}`;
    groups.set(key, [...(groups.get(key) ?? []), f]);
  }

  const actions: FixAction[] = [];
  for (const group of groups.values()) {
    const component: Component = group[0].component;
    if (!isVersion(component.version)) continue;
    const fixes = group.flatMap((f) => [f.advisory.fixed, f.advisory.lastAffected]).filter((v): v is string => v !== null && isVersion(v));
    const floor = fixes.length ? fixes.reduce((a, b) => (gt(a, b) ? a : b)) : component.version;
    const candidates = (await listVersions(component.name, component.ecosystem)).filter((c) => gte(c.version, floor)).slice(0, 200);
    const vulnerable = await queryVulnIds(candidates.map((c) => purlFor(component, c.version)));
    const dirty = new Set([...vulnerable.keys()].map((purl) => purl.slice(purl.lastIndexOf("@") + 1)));
    const ranked = rankTargets(component.version, floor, candidates, (v) => !dirty.has(v));
    const target = ranked[0] ?? null;
    const outsideCaret = target !== null && !inCaret(target, component.version);
    const kind = component.ecosystem === "maven" ? "pin" : scope;

    actions.push({
      name: component.name,
      current: component.version,
      target,
      alternatives: retryOrder(ranked.slice(1), component.version),
      kind,
      outsideCaret,
      tier: maxTier(group.map((f) => f.tier)),
      resolves: [...new Set(group.map((f) => f.advisory.id))],
      note:
        target === null
          ? "알려진 취약점이 없는 릴리스가 없음 — 대체 패키지나 보완 통제 필요"
          : kind === "pin"
            ? `빌드 도구 버전 고정으로 조치 (Gradle constraints, Maven dependencyManagement)${outsideCaret ? " — 메이저 변경, 테스트로 확인 필요" : ""}`
            : outsideCaret
              ? "호환 범위(^) 밖 버전 — 테스트로 동작 확인 필요"
              : "호환 범위 안 버전",
    });
  }
  return actions.sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || b.resolves.length - a.resolves.length);
}
