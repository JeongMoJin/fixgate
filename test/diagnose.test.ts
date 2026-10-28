import assert from "node:assert/strict";
import { test } from "node:test";
import { diagnose, gatherFacts } from "../src/diagnose.ts";
import type { Llm } from "../src/llm.ts";
import type { FixAction } from "../src/remediate.ts";
import type { Attempt } from "../src/verify.ts";

const attempt: Attempt = {
  action: { name: "jsonwebtoken", current: "8.5.1", target: "9.0.0", resolves: ["GHSA-1"] } as FixAction,
  passed: false,
  version: null,
  tries: [
    {
      version: "9.0.0",
      passed: false,
      gates: [
        { name: "install", ok: true, detail: "" },
        { name: "test", ok: false, detail: "" },
      ],
      log: "test at test\\app.test.js:35:1\n  500 !== 200",
      notes: { file: "CHANGELOG.md", lines: ["## 9.0.0", "- RSA key size must be 2048 bits or greater."] },
    },
  ],
};
const usage = { imports: [{ file: "src/app.js", line: 2, text: 'const jwt = require("jsonwebtoken");' }], members: ["sign"], calls: [{ file: "src/app.js", line: 14, text: "jwt.sign(...)" }] };

test("gatherFacts labels release notes, code, the failing test file and the log", () => {
  const facts = gatherFacts("examples/shop-api", attempt, usage);
  assert.match(facts.N2, /2048 bits/);
  assert.match(facts.C2, /^src\/app\.js:14/);
  assert.match(facts.T9, /modulusLength: 1024/);
  assert.match(facts.L2, /500 !== 200/);
});

test("diagnose keeps only evidence ids that exist among the facts", async () => {
  const llm: Llm = {
    model: "fake",
    calls: () => 0,
    askJson: async <T,>() =>
      ({ cause: "키 크기", evidence: ["[N2]", "T9", "X42"], options: [{ title: "키 교체", detail: "", risk: "low" }], recommended: 5, confidence: "high", insufficient_evidence: false }) as T,
  };
  const d = await diagnose(llm, "examples/shop-api", attempt, usage, { service: "s", exposure: "internet", criticality: "high", personalData: true });
  assert.deepEqual(d!.evidence, ["N2", "T9"]);
  assert.deepEqual(d!.rejected, ["X42"]);
  assert.equal(d!.recommended, 0);
  assert.equal(d!.insufficient_evidence, false, "a test line (observed failure) plus a release note is enough");
});

test("diagnose holds back when no cited fact shows the observed failure", async () => {
  const llm: Llm = {
    model: "fake",
    calls: () => 0,
    askJson: async <T,>() =>
      ({ cause: "릴리스 노트상 키 크기 변경", evidence: ["[N2]"], options: [{ title: "키 교체", detail: "", risk: "low" }], recommended: 0, confidence: "high", insufficient_evidence: false }) as T,
  };
  const d = await diagnose(llm, "examples/shop-api", attempt, usage, { service: "s", exposure: "internet", criticality: "high", personalData: true });
  assert.equal(d!.insufficient_evidence, true);
});

test("without FIXGATE_LLM the LLM step stays off", async () => {
  const { llmFromEnv } = await import("../src/llm.ts");
  assert.equal(llmFromEnv({}), null);
});
