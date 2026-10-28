// Grades FixGate's two LLM steps on fixed cases with known answers:
// "diagnose" (why did a tested upgrade fail?) and "path" (no clean release in
// reach: upgrade across a major, replace, mitigate or accept?).
//
//   FIXGATE_LLM=openai node scripts/eval.ts        # or FIXGATE_LLM=claude-code
//
// A case passes when the answer matches the known cause or path, every cited
// fact id exists, and the recommendation is not one that weakens security.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { diagnose } from "../src/diagnose.ts";
import { fetchText } from "../src/http.ts";
import { llmFromEnv } from "../src/llm.ts";
import { choosePath } from "../src/path.ts";
import { planFixes } from "../src/remediate.ts";
import { triage } from "../src/triage.ts";
import { installDeps, makeWorkCopy, verifyActions } from "../src/verify.ts";

interface Case {
  id: string;
  kind: "diagnose" | "path";
  dir?: string;
  gradle?: string;
  package: string;
  truth: string;
  causePattern?: string;
  paths?: string[];
  replacementPattern?: string;
  /** When the answer is replace, whether the replacement may be called drop-in. */
  replacementDropIn?: boolean;
}

interface Result {
  id: string;
  kind: string;
  correct: boolean;
  evidenceValid: boolean;
  safe: boolean;
  answer: string;
  cited: number;
  rejected: number;
  note: string;
}

const llm = llmFromEnv({ ...process.env, FIXGATE_LLM_MAX_CALLS: process.env.FIXGATE_LLM_MAX_CALLS ?? "10" });
if (!llm) throw new Error("FIXGATE_LLM=openai 또는 claude-code 로 실행하세요");
const cases = JSON.parse(readFileSync("eval/cases.json", "utf8")) as Case[];
const only = process.argv[2];

async function dirFor(c: Case): Promise<string> {
  if (c.dir) return c.dir;
  const [, spec, path] = /^([^:]+):(.+)$/.exec(c.gradle!)!;
  const [repo, sha] = spec.split("@");
  const dir = join(".fixgate-cache", "eval", c.id);
  if (!existsSync(join(dir, "gradle.lockfile"))) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "gradle.lockfile"), (await fetchText(`https://raw.githubusercontent.com/${repo}/${sha}/${path}`))!);
    writeFileSync(join(dir, "fixgate.json"), JSON.stringify({ service: `${repo} ${path}`, exposure: "internet", criticality: "high" }));
  }
  return dir;
}

async function run(c: Case): Promise<Result> {
  const dir = await dirFor(c);
  const t = await triage(dir);
  const action = (await planFixes(t.findings, "direct")).find((a) => a.name === c.package);
  if (!action) return { id: c.id, kind: c.kind, correct: false, evidenceValid: false, safe: false, answer: "", cited: 0, rejected: 0, note: "조치 계획에 패키지가 없음" };
  const component = t.findings.find((f) => f.component.name === c.package)!;

  if (c.kind === "diagnose") {
    const work = makeWorkCopy(dir, c.id);
    installDeps(work);
    const [attempt] = await verifyActions(work, [action]);
    if (!attempt.tries.some((x) => x.gates.some((g) => g.name === "test" && !g.ok))) {
      return { id: c.id, kind: c.kind, correct: false, evidenceValid: false, safe: false, answer: "", cited: 0, rejected: 0, note: `테스트가 깨지지 않음 (${attempt.version ?? action.target})` };
    }
    const d = await diagnose(llm!, dir, attempt, component.usage, t.context);
    if (!d) return { id: c.id, kind: c.kind, correct: false, evidenceValid: false, safe: false, answer: "", cited: 0, rejected: 0, note: "LLM 응답 없음" };
    return {
      id: c.id,
      kind: c.kind,
      correct: !d.insufficient_evidence && new RegExp(c.causePattern!, "i").test(d.cause),
      evidenceValid: d.evidence.length > 0 && d.rejected.length === 0,
      safe: d.options[d.recommended]?.risk !== "high",
      answer: `${d.cause} → 추천: ${d.options[d.recommended]?.title ?? "-"} (${d.options[d.recommended]?.risk ?? "-"})`,
      cited: d.evidence.length,
      rejected: d.rejected.length,
      note: `${action.current} → ${attempt.tries.at(-1)?.version}`,
    };
  }

  const p = await choosePath(llm!, action, component.component.ecosystem, component.usage, t.context);
  if (!p) return { id: c.id, kind: c.kind, correct: false, evidenceValid: false, safe: false, answer: "", cited: 0, rejected: 0, note: "LLM 응답 없음" };
  const replacementOk =
    p.path !== "replace" ||
    ((!c.replacementPattern || new RegExp(c.replacementPattern).test(p.replacement_name ?? "")) &&
      p.replacementCheck?.exists === true &&
      (c.replacementDropIn === undefined || p.replacement_drop_in === c.replacementDropIn));
  return {
    id: c.id,
    kind: c.kind,
    correct: c.paths!.includes(p.path) && replacementOk,
    evidenceValid: p.evidence.length > 0 && p.rejected.length === 0,
    safe: p.path !== "accept_risk",
    answer: `${p.path}${p.replacement_name ? ` → ${p.replacement_name}${p.replacementCheck ? ` (레지스트리 ${p.replacementCheck.exists ? `있음, 최신 ${p.replacementCheck.latest}, ${p.replacementCheck.clean ? "알려진 취약점 없음" : "취약점 있음"}` : "없음"})` : ""}` : ""} | ${p.steps[0] ?? ""}`,
    cited: p.evidence.length,
    rejected: p.rejected.length,
    note: `${action.current} → ${action.target ?? "깨끗한 버전 없음"}`,
  };
}

const results: Result[] = [];
for (const c of cases.filter((x) => !only || x.id === only)) {
  console.error(`case ${c.id}`);
  results.push(await run(c));
}

const ok = (b: boolean) => (b ? "통과" : "실패");
const pass = (k: keyof Result) => results.filter((r) => r[k] === true).length;
const lines = [
  `모델: ${llm.model} · 새 호출 ${llm.calls()}회 · ${new Date().toISOString().slice(0, 10)}`,
  "",
  "| 사례 | 종류 | 정답 | 근거 번호 유효 | 위험한 추천 없음 | 답 |",
  "|---|---|---|---|---|---|",
  ...results.map((r) => `| ${r.id} | ${r.kind === "diagnose" ? "실패 원인" : "조치 경로"} | ${ok(r.correct)} | ${ok(r.evidenceValid)} (${r.cited}개, 버림 ${r.rejected}) | ${ok(r.safe)} | ${r.answer.replaceAll("|", "/")} |`),
  "",
  `정답 ${pass("correct")}/${results.length} · 근거 번호 유효 ${pass("evidenceValid")}/${results.length} · 위험한 추천 없음 ${pass("safe")}/${results.length}`,
];
console.log(lines.join("\n"));
mkdirSync("eval/results", { recursive: true });
writeFileSync(join("eval/results", `${llm.model.replace(/[:/]/g, "_")}.json`), JSON.stringify({ model: llm.model, at: new Date().toISOString(), results }, null, 2) + "\n");
writeFileSync(join("eval/results", `${llm.model.replace(/[:/]/g, "_")}.md`), lines.join("\n") + "\n");
