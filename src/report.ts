import type { Diagnosis } from "./diagnose.ts";
import type { Triage } from "./triage.ts";
import type { Finding, Tier } from "./types.ts";
import { TIER_LABEL, TIER_ORDER } from "./types.ts";
import type { Attempt } from "./verify.ts";

export interface RunResult {
  before: Triage;
  after: Triage | null;
  attempts: Attempt[];
  /** LLM explanations of failed test gates, by package name. */
  diagnoses: Record<string, Diagnosis>;
  generatedAt: string;
  diff: string;
}

const RISK: Record<string, string> = { low: "위험 낮음", medium: "위험 보통", high: "위험 높음" };

function diagnosisLines(d: Diagnosis): string[] {
  return [
    "",
    `  **원인 설명 (LLM ${d.model}, 확신 ${d.confidence}${d.insufficient_evidence ? ", 근거 부족으로 판단 보류" : ""})**: ${d.cause}`,
    "",
    ...d.evidence.map((id) => `  - 근거 [${id}] ${d.facts[id]}`),
    ...(d.rejected.length ? [`  - 사실 목록에 없는 근거 ${d.rejected.length}개는 버림: ${d.rejected.join(", ")}`] : []),
    "",
    ...d.options.map((o, i) => `  ${i + 1}. ${i === d.recommended ? "**추천** " : ""}${o.title} (${RISK[o.risk]}) — ${o.detail}`),
  ];
}

function diagnosisHtml(d: Diagnosis): string {
  return `<div class="diag"><p><b>원인 설명</b> <small>LLM ${esc(d.model)} · 확신 ${esc(d.confidence)}${d.insufficient_evidence ? " · 근거 부족으로 판단 보류" : ""} · 아래 근거 밖의 사실은 쓰지 않도록 제한</small></p><p>${esc(d.cause)}</p><ul>${d.evidence
    .map((id) => `<li><code>${esc(id)}</code> ${esc(d.facts[id])}</li>`)
    .join("")}${d.rejected.length ? `<li><small>사실 목록에 없는 근거 ${d.rejected.length}개는 버림: ${esc(d.rejected.join(", "))}</small></li>` : ""}</ul><ol>${d.options
    .map((o, i) => `<li>${i === d.recommended ? '<span class="chip plan">추천</span> ' : ""}<b>${esc(o.title)}</b> <span class="gate ${o.risk === "high" ? "bad" : "ok"}">${RISK[o.risk]}</span><br><small>${esc(o.detail)}</small></li>`)
    .join("")}</ol></div>`;
}

export function countTiers(findings: Finding[]): Record<Tier, number> {
  const counts: Record<Tier, number> = { now: 0, week: 0, plan: 0, none: 0 };
  for (const f of findings) counts[f.tier]++;
  return counts;
}

interface PackageRow {
  tier: Tier;
  name: string;
  version: string;
  direct: boolean;
  findings: Finding[];
}

/** One row per vulnerable package: the unit a person actually fixes. */
export function packageRows(findings: Finding[]): PackageRow[] {
  const rows = new Map<string, PackageRow>();
  for (const f of findings) {
    const key = `${f.component.name}@${f.component.version}`;
    const row = rows.get(key) ?? { tier: f.tier, name: f.component.name, version: f.component.version, direct: f.component.direct, findings: [] };
    row.findings.push(f);
    if (TIER_ORDER.indexOf(f.tier) < TIER_ORDER.indexOf(row.tier)) row.tier = f.tier;
    rows.set(key, row);
  }
  return [...rows.values()].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || b.findings.length - a.findings.length,
  );
}

function worst(row: PackageRow): Finding {
  return row.findings.find((f) => f.tier === row.tier)!;
}

function summaryLines(run: RunResult): string[] {
  const { before, after, attempts } = run;
  const b = countTiers(before.findings);
  const vulnerable = new Set(before.findings.map((f) => f.component.ref)).size;
  const lines = [
    `구성요소 ${before.components.length}개 중 ${vulnerable}개에서 경보 ${before.findings.length}건`,
    `즉시 ${b.now} · 이번 주 ${b.week} · 계획 ${b.plan} · 영향 없음 ${b.none}`,
    `처리 단위로 묶으면 패키지 ${packageRows(before.findings.filter((f) => f.tier !== "none")).length}개`,
  ];
  if (after) {
    const a = countTiers(after.findings);
    const passed = attempts.filter((t) => t.passed).length;
    lines.push(
      `검증 관문을 통과한 조치 ${passed}건 적용 → 경보 ${before.findings.length}건 → ${after.findings.length}건, 즉시·이번 주 ${b.now + b.week}건 → ${a.now + a.week}건`,
      `사람 검토로 넘긴 조치 ${attempts.length - passed}건`,
    );
  }
  return lines;
}

export function renderMarkdown(run: RunResult): string {
  const { before, after, attempts } = run;
  const c = before.context;
  const out: string[] = [
    `# FixGate 보고서 · ${c.service}`,
    "",
    `생성 ${run.generatedAt} · 데이터: OSV(${before.sources.osv}), EPSS ${before.sources.epssDate ?? "-"}, CISA KEV ${before.sources.kevVersion}`,
    `서비스: 노출 ${c.exposure === "internet" ? "인터넷" : "내부"} · 중요도 ${c.criticality} · 개인정보 ${c.personalData ? "처리" : "없음"}${c.owner ? ` · 담당 ${c.owner}` : ""}`,
    "",
    "## 요약",
    "",
    ...summaryLines(run).map((l) => `- ${l}`),
    "",
    "## 처리 순서",
    "",
    "| 단계 | 패키지 | 경보 | 가장 급한 이유 |",
    "|---|---|---|---|",
    ...packageRows(before.findings).map((row) => {
      const f = worst(row);
      return `| ${TIER_LABEL[row.tier]} | ${row.name}@${row.version}${row.direct ? "" : " (간접)"} | ${row.findings.length} | ${f.reasons[0].text} [${f.reasons[0].source}] |`;
    }),
  ];

  if (attempts.length) {
    out.push("", "## 검증된 조치", "");
    for (const at of attempts) {
      const a = at.action;
      out.push(`### ${at.passed ? "✅" : "⛔"} ${a.name} ${a.current} → ${at.version ?? a.target ?? "고친 버전 없음"} (${a.kind === "direct" ? "직접 의존성" : "override"}, 대상 경보 ${a.resolves.length}건)`);
      if (!at.tries.length) out.push("", `- ${a.note}`);
      for (const t of at.tries) {
        out.push("", `- ${t.version}: ${t.gates.map((g) => `${g.ok ? "통과" : "실패"} ${g.detail}`).join(" / ")}`);
        if (t.notes) out.push("", `  릴리스 노트 (${t.notes.file}):`, "", "```", ...t.notes.lines, "```");
        if (t.log) out.push("", "  테스트 기록:", "", "```", t.log, "```");
      }
      const d = run.diagnoses[a.name];
      if (d) out.push(...diagnosisLines(d));
      if (!at.passed) out.push("", "→ 사람 검토 필요. 위 기록과 함께 담당 개발팀에 넘깁니다.");
      out.push("");
    }
    if (run.diff) out.push("### package.json 변경", "", "```diff", run.diff, "```", "");
  }

  out.push("", "## 경보 상세", "");
  for (const tier of TIER_ORDER) {
    const list = before.findings.filter((f) => f.tier === tier);
    if (!list.length) continue;
    out.push(`### ${TIER_LABEL[tier]} (${list.length})`, "");
    for (const f of list) {
      const a = f.advisory;
      out.push(
        `- **${f.component.name}@${f.component.version}** · [${a.id}](${a.url})${a.cve ? ` ${a.cve}` : ""} · ${a.severity} · 고친 버전 ${a.fixed ?? "없음"} — ${a.summary}`,
        ...f.reasons.map((r) => `  - ${r.text} [${r.source}]`),
      );
    }
    out.push("");
  }
  if (after) out.push(`조치 후 다시 스캔한 결과: ${after.findings.length}건 (${Object.entries(countTiers(after.findings)).map(([t, n]) => `${TIER_LABEL[t as Tier]} ${n}`).join(" · ")})`);
  return out.join("\n") + "\n";
}

const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);

export function renderHtml(run: RunResult): string {
  const { before, attempts } = run;
  const c = before.context;
  const counts = countTiers(before.findings);
  const tile = (tier: Tier) => `<div class="tile ${tier}"><b>${counts[tier]}</b><span>${TIER_LABEL[tier]}</span></div>`;

  const order = packageRows(before.findings)
    .map((row) => {
      const f = worst(row);
      return `<tr><td><span class="chip ${row.tier}">${TIER_LABEL[row.tier]}</span></td><td><b>${esc(row.name)}</b>@${esc(row.version)}${row.direct ? "" : ' <small>간접</small>'}</td><td>${row.findings.length}</td><td>${f.reasons.map((r) => `${esc(r.text)} <small>[${esc(r.source)}]</small>`).join("<br>")}</td></tr>`;
    })
    .join("");

  const fixes = attempts
    .map((at) => {
      const a = at.action;
      const tries = at.tries
        .map(
          (t) =>
            `<li><code>${esc(t.version)}</code> ${t.gates.map((g) => `<span class="gate ${g.ok ? "ok" : "bad"}">${esc(g.detail)}</span>`).join(" ")}${
              t.notes ? `<p><b>릴리스 노트</b> <small>${esc(t.notes.file)}</small></p><pre>${esc(t.notes.lines.join("\n"))}</pre>` : ""
            }${t.log ? `<p><b>테스트 기록</b></p><pre>${esc(t.log)}</pre>` : ""}</li>`,
        )
        .join("");
      const note = at.passed && a.outsideCaret ? "호환 범위(^) 밖 버전 — 기존 테스트로 동작 확인됨" : a.note;
      const d = run.diagnoses[a.name];
      return `<div class="fix ${at.passed ? "ok" : "bad"}"><h3>${at.passed ? "검증 통과" : "사람 검토 필요"} · ${esc(a.name)} ${esc(a.current)} → ${esc(at.version ?? a.target ?? "고친 버전 없음")}</h3><p>${a.kind === "direct" ? "직접 의존성" : "간접 의존성 override"} · 대상 경보 ${a.resolves.length}건 · ${esc(note)}</p>${d ? diagnosisHtml(d) : ""}<ul>${tries || `<li>${esc(a.note)}</li>`}</ul></div>`;
    })
    .join("");

  const detail = TIER_ORDER.map((tier) => {
    const list = before.findings.filter((f) => f.tier === tier);
    if (!list.length) return "";
    const rows = list
      .map((f) => {
        const a = f.advisory;
        return `<tr><td>${esc(f.component.name)}@${esc(f.component.version)}</td><td><a href="${a.url}">${esc(a.id)}</a><br><small>${esc(a.cve ?? "")}</small></td><td>${a.severity}</td><td>${f.epss ? (f.epss.score * 100).toFixed(2) + "%" : "-"}</td><td>${f.kev ? "KEV" : "-"}</td><td>${esc(a.fixed ?? "없음")}</td><td>${esc(a.summary)}</td></tr>`;
      })
      .join("");
    return `<details${tier === "now" ? " open" : ""}><summary><span class="chip ${tier}">${TIER_LABEL[tier]}</span> ${list.length}건</summary><table><tr><th>구성요소</th><th>권고</th><th>심각도</th><th>EPSS</th><th>KEV</th><th>고친 버전</th><th>내용</th></tr>${rows}</table></details>`;
  }).join("");

  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>FixGate · ${esc(c.service)}</title>
<style>
:root{--ink:#141414;--soft:#5a554f;--line:#e2e0dc;--now:#b42318;--week:#c4661f;--plan:#3d5a80;--none:#8a8580}
*{box-sizing:border-box}body{margin:0;background:#fff;color:var(--ink);font:15px/1.6 system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif}
main{max-width:1100px;margin:0 auto;padding:40px 20px 80px}h1{font-size:28px;margin:0 0 4px}h2{font-size:18px;margin:40px 0 12px;border-top:1px solid var(--ink);padding-top:14px}h3{font-size:15px;margin:0 0 4px}
.meta{color:var(--soft);font-size:13px;margin:0}.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:20px}.tile{border:1px solid var(--line);padding:14px}.tile b{display:block;font-size:30px;line-height:1}.tile span{font-size:13px;color:var(--soft)}
.tile.now b{color:var(--now)}.tile.week b{color:var(--week)}.tile.plan b{color:var(--plan)}.tile.none b{color:var(--none)}
ul.sum{padding-left:18px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{border-bottom:1px solid var(--line);padding:8px 6px;text-align:left;vertical-align:top}th{font-weight:600;color:var(--soft)}
small{color:var(--soft)}.chip{display:inline-block;padding:1px 8px;border-radius:99px;color:#fff;font-size:12px;white-space:nowrap}.chip.now{background:var(--now)}.chip.week{background:var(--week)}.chip.plan{background:var(--plan)}.chip.none{background:var(--none)}
.fix{border:1px solid var(--line);border-left:4px solid #2e7d32;padding:12px 14px;margin:10px 0}.fix.bad{border-left-color:var(--now)}.fix p{margin:0;color:var(--soft);font-size:13px}.fix ul{margin:8px 0 0;padding-left:18px}
.gate{display:inline-block;font-size:12px;padding:1px 6px;margin:2px;border:1px solid #2e7d32;color:#2e7d32}.gate.bad{border-color:var(--now);color:var(--now)}
pre{background:#f4f4f4;padding:10px;overflow:auto;font-size:12px;max-height:240px}.diag{background:#f6f8fb;border:1px solid #d9e2ef;padding:10px 14px;margin:10px 0}.diag p{color:var(--ink);margin:4px 0}.diag ul,.diag ol{margin:6px 0;padding-left:20px;font-size:13px}details{margin:8px 0}summary{cursor:pointer;padding:6px 0}
@media (max-width:640px){.tiles{grid-template-columns:repeat(2,1fr)}td:nth-child(n+5),th:nth-child(n+5){display:none}}
</style></head><body><main>
<h1>FixGate 보고서 · ${esc(c.service)}</h1>
<p class="meta">생성 ${esc(run.generatedAt)} · 데이터 OSV, EPSS ${esc(before.sources.epssDate ?? "-")}, CISA KEV ${esc(before.sources.kevVersion)}</p>
<p class="meta">노출 ${c.exposure === "internet" ? "인터넷" : "내부"} · 중요도 ${esc(c.criticality)} · 개인정보 ${c.personalData ? "처리" : "없음"}${c.owner ? ` · 담당 ${esc(c.owner)}` : ""}</p>
<div class="tiles">${TIER_ORDER.map(tile).join("")}</div>
<ul class="sum">${summaryLines(run).map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
<h2>처리 순서</h2><table><tr><th>단계</th><th>패키지</th><th>경보</th><th>근거 [출처]</th></tr>${order}</table>
${fixes ? `<h2>검증된 조치</h2>${fixes}${run.diff ? `<h3>package.json 변경</h3><pre>${esc(run.diff)}</pre>` : ""}` : ""}
<h2>경보 상세</h2>${detail}
</main></body></html>
`;
}

/**
 * CycloneDX VEX for findings judged "영향 없음". These are proposals: the
 * detail says so, and they take effect only after the owner approves them.
 */
export function renderVex(before: Triage): object {
  return {
    bomFormat: "CycloneDX",
    specVersion: "1.5",
    version: 1,
    vulnerabilities: before.findings
      .filter((f) => f.tier === "none")
      .map((f) => ({
        id: f.advisory.cve ?? f.advisory.id,
        source: { name: "OSV", url: f.advisory.url },
        affects: [{ ref: f.component.ref }],
        analysis: {
          state: "not_affected",
          justification: "code_not_present",
          detail: `FixGate 제안 (담당자 승인 전): ${f.reasons.map((r) => `${r.text} [${r.source}]`).join("; ")}`,
        },
      })),
  };
}
