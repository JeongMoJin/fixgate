// Compares an LLM answering from memory with FixGate's tool-backed answer on
// the same question: for each production dependency the service declares,
// is this version vulnerable, which advisories apply, and what is the smallest
// upgrade that clears them? OSV at run time is the ground truth.
//
//   FIXGATE_LLM=claude-code node scripts/baseline.ts <service dir> [<service dir> ...]

import semver from "semver";
import { llmFromEnv } from "../src/llm.ts";
import { getVuln, queryVulnIds } from "../src/osv.ts";
import { listVersions } from "../src/remediate.ts";
import { generateNpmSbom, parseCycloneDx } from "../src/sbom.ts";

interface Answer {
  package: string;
  vulnerable: "yes" | "no" | "unknown";
  advisories: string[];
  upgradeTo: string | null;
}

const SCHEMA = {
  type: "object",
  properties: {
    answers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          package: { type: "string" },
          vulnerable: { type: "string", enum: ["yes", "no", "unknown"] },
          advisories: { type: "array", items: { type: "string" } },
          upgradeTo: { type: ["string", "null"] },
        },
        required: ["package", "vulnerable", "advisories", "upgradeTo"],
        additionalProperties: false,
      },
    },
  },
  required: ["answers"],
  additionalProperties: false,
};

const llm = llmFromEnv({ ...process.env, FIXGATE_LLM_MAX_CALLS: process.env.FIXGATE_LLM_MAX_CALLS ?? "20" });
if (!llm) throw new Error("FIXGATE_LLM=claude-code 로 실행하세요");

const totals = { packages: 0, truthVulnerable: 0, saidYes: 0, saidYesCorrect: 0, caught: 0, missed: 0, unknown: 0, ids: 0, idsCorrect: 0, truthIds: 0, truthIdsNamed: 0, versions: 0, versionsExist: 0, versionsClean: 0 };

for (const dir of process.argv.slice(2)) {
  const deps = parseCycloneDx(generateNpmSbom(dir)).filter((c) => c.direct && !c.dev && c.ecosystem === "npm").slice(0, 60);
  const truth = await queryVulnIds(deps.map((c) => c.purl));

  const answers: Answer[] = [];
  for (let i = 0; i < deps.length; i += 30) {
    const chunk = deps.slice(i, i + 30);
    const prompt = [
      "아래는 한 서비스가 운영에 쓰는 npm 패키지와 버전이다. 도구 없이 알고 있는 지식만으로 답하라.",
      "각 패키지마다: 이 버전에 알려진 보안 취약점이 있는가(yes/no/unknown), 해당하는 권고 ID(CVE 또는 GHSA),",
      "그리고 알려진 취약점을 모두 없애는 가장 작은 업그레이드 버전(없거나 모르면 null)을 답하라.",
      "",
      ...chunk.map((c) => `${c.name}@${c.version}`),
    ].join("\n");
    const out = await llm.askJson<{ answers: Answer[] }>(`baseline ${dir} ${i}`, prompt, SCHEMA);
    answers.push(...(out?.answers ?? []));
  }

  // Models often echo the name with its version ("axios@0.21.1"); compare names only.
  const nameOf = (p: string) => p.replace(/(?<=.)@[^@/]*$/, "");
  for (const c of deps) {
    const a = answers.find((x) => nameOf(x.package) === c.name);
    const ids = truth.get(c.purl) ?? [];
    const names = new Map<string, Set<string>>();
    for (const id of ids) names.set(id, new Set([id, ...((await getVuln(id)).aliases ?? [])]));
    const known = new Set([...names.values()].flatMap((s) => [...s]));
    totals.packages++;
    if (ids.length) totals.truthVulnerable++;
    totals.truthIds += ids.length;
    if (!a || a.vulnerable === "unknown") totals.unknown++;
    if (a?.vulnerable === "yes") {
      totals.saidYes++;
      if (ids.length) totals.saidYesCorrect++;
    }
    if (ids.length && a?.vulnerable === "yes") totals.caught++;
    if (ids.length && a?.vulnerable !== "yes") totals.missed++;
    for (const id of a?.advisories ?? []) {
      totals.ids++;
      if (known.has(id)) totals.idsCorrect++;
    }
    const named = a?.advisories ?? [];
    totals.truthIdsNamed += [...names.values()].filter((same) => named.some((n) => same.has(n))).length;

    if (a?.upgradeTo && ids.length) {
      totals.versions++;
      const versions = await listVersions(c.name);
      if (versions.some((v) => v.version === semver.clean(a.upgradeTo!))) {
        totals.versionsExist++;
        const left = await queryVulnIds([`pkg:npm/${c.name.replace("@", "%40")}@${semver.clean(a.upgradeTo!)}`]);
        if (!left.size) totals.versionsClean++;
      }
    }
  }
  console.error(`measured ${dir}: ${deps.length} packages`);
}

const pct = (n: number, d: number) => (d ? `${((n / d) * 100).toFixed(1)}%` : "-");
console.log(JSON.stringify({ model: llm.model, newCalls: llm.calls(), ...totals }, null, 2));
console.log(`
| 질문 | LLM 단독 (${llm.model}, 도구 없음) | FixGate |
|---|---|---|
| 취약한 패키지를 찾아냄 | ${totals.caught} / ${totals.truthVulnerable} (${pct(totals.caught, totals.truthVulnerable)}) | ${totals.truthVulnerable} / ${totals.truthVulnerable} — OSV 조회 |
| '취약하다'고 한 것 중 실제로 취약 | ${totals.saidYesCorrect} / ${totals.saidYes} (${pct(totals.saidYesCorrect, totals.saidYes)}) | 100% — OSV에 있는 것만 보고 |
| 말한 권고 ID가 실제로 그 버전에 해당 | ${totals.idsCorrect} / ${totals.ids} (${pct(totals.idsCorrect, totals.ids)}) | 100% — ID를 만들지 않음 |
| 실제 권고 중 이름을 댄 것 | ${totals.truthIdsNamed} / ${totals.truthIds} (${pct(totals.truthIdsNamed, totals.truthIds)}) | ${totals.truthIds} / ${totals.truthIds} |
| 제안한 버전이 npm에 실제로 있음 | ${totals.versionsExist} / ${totals.versions} (${pct(totals.versionsExist, totals.versions)}) | 100% — registry 목록에서 고름 |
| 제안한 버전에 알려진 취약점이 없음 | ${totals.versionsClean} / ${totals.versions} (${pct(totals.versionsClean, totals.versions)}) | 100% — 후보마다 OSV 확인 |
| 모른다고 답함 | ${totals.unknown} / ${totals.packages} | — |`);
