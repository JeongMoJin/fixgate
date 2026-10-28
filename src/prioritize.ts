import type { Advisory, Component, Epss, Kev, Reason, ServiceContext, Tier, Usage } from "./types.ts";
import { TIER_ORDER } from "./types.ts";

export interface Facts {
  component: Component;
  advisory: Advisory;
  epss: Epss | null;
  kev: Kev | null;
  usage: Usage;
  context: ServiceContext;
}

/** EPSS at or above this is treated as likely to be exploited soon. */
export const EPSS_HIGH = 0.1;
export const EPSS_HIGH_PERCENTILE = 0.95;

/**
 * Decides how soon one finding must be fixed. The rules follow the shape of
 * CISA's SSVC decision tree: exploitation first, then exposure and impact.
 * Every rule that fires adds a reason with the source of its fact.
 */
export function decide(f: Facts): { tier: Tier; reasons: Reason[] } {
  const { component, advisory, epss, kev, usage, context } = f;
  const reasons: Reason[] = [];
  const osv = `OSV ${advisory.id}`;

  if (component.dev) {
    reasons.push({ text: "개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음", source: "SBOM cdx:npm:package:development" });
    return { tier: "none", reasons };
  }

  const internet = context.exposure === "internet";
  const severe = advisory.severity === "CRITICAL" || advisory.severity === "HIGH";
  let tier: Tier;

  if (kev) {
    reasons.push({ text: `실제 악용이 확인된 취약점 (CISA KEV, ${kev.dateAdded} 등재)`, source: `CISA KEV ${advisory.cve}` });
    tier = "now";
  } else if (epss && (epss.score >= EPSS_HIGH || epss.percentile >= EPSS_HIGH_PERCENTILE)) {
    reasons.push({ text: `30일 내 악용 확률 ${pct(epss.score)} (상위 ${pct(1 - epss.percentile)})`, source: `EPSS ${epss.date}` });
    tier = internet ? "now" : "week";
  } else if (severe) {
    reasons.push({ text: `심각도 ${advisory.severity}`, source: osv });
    tier = internet || context.criticality === "high" ? "week" : "plan";
  } else {
    reasons.push({ text: `심각도 ${advisory.severity}, 악용 확률 ${epss ? pct(epss.score) : "정보 없음"}`, source: epss ? `${osv}, EPSS ${epss.date}` : osv });
    tier = "plan";
  }

  if (internet) reasons.push({ text: "인터넷에 노출된 서비스", source: "fixgate.json exposure" });
  if (context.personalData) reasons.push({ text: "개인정보를 처리하는 서비스", source: "fixgate.json personalData" });

  if (component.direct && usage.imports.length) {
    const at = usage.imports[0];
    const members = usage.members.length ? ` (${usage.members.slice(0, 4).join(", ")} 호출)` : "";
    reasons.push({ text: `운영 코드에서 직접 사용${members}`, source: `${at.file}:${at.line}` });
  } else if (component.direct) {
    reasons.push({ text: "선언만 있고 운영 코드에서 import가 보이지 않음 — 삭제 검토", source: "소스 검색" });
  } else {
    reasons.push({ text: `간접 의존성: ${component.path.join(" → ")}`, source: "SBOM dependencies" });
  }

  if (!advisory.fixed && tier !== "plan") {
    reasons.push({ text: "고친 버전이 없어 임시 완화책이 필요함", source: osv });
  }
  return { tier, reasons };
}

export function maxTier(tiers: Tier[]): Tier {
  return tiers.reduce((a, b) => (TIER_ORDER.indexOf(a) <= TIER_ORDER.indexOf(b) ? a : b), "none" as Tier);
}

function pct(n: number): string {
  const p = n * 100;
  return `${p < 1 ? p.toFixed(2) : p.toFixed(1)}%`;
}
