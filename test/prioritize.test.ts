import assert from "node:assert/strict";
import { test } from "node:test";
import { decide, maxTier, type Facts } from "../src/prioritize.ts";

function facts(over: Partial<Facts> & { severity?: Facts["advisory"]["severity"]; fixed?: string | null } = {}): Facts {
  return {
    component: { ref: "x@1.0.0", name: "x", version: "1.0.0", purl: "pkg:npm/x@1.0.0", ecosystem: "npm", dev: false, direct: true, path: ["x@1.0.0"], ...over.component },
    advisory: { id: "GHSA-1", cve: "CVE-2026-1", aliases: [], summary: "", severity: over.severity ?? "MODERATE", fixed: over.fixed === undefined ? "1.0.1" : over.fixed, url: "" },
    epss: over.epss ?? null,
    kev: over.kev ?? null,
    usage: over.usage ?? { imports: [{ file: "src/a.js", line: 1, text: "require('x')" }], members: ["run"] },
    context: { service: "s", exposure: "internet", criticality: "medium", personalData: false, ...over.context },
  };
}

test("dev-only dependencies are not affected in production", () => {
  const r = decide(facts({ component: { dev: true } as Facts["component"], severity: "CRITICAL" }));
  assert.equal(r.tier, "none");
  assert.match(r.reasons[0].source, /development/);
});

test("a KEV listing means fix now, whatever the severity", () => {
  const r = decide(facts({ kev: { dateAdded: "2026-01-01", knownRansomware: false, requiredAction: "" }, severity: "LOW" }));
  assert.equal(r.tier, "now");
  assert.match(r.reasons[0].source, /CISA KEV CVE-2026-1/);
});

test("likely exploitation is now on the internet and this week inside", () => {
  const epss = { score: 0.2, percentile: 0.97, date: "2026-10-27" };
  assert.equal(decide(facts({ epss })).tier, "now");
  assert.equal(decide(facts({ epss, context: { exposure: "internal" } as Facts["context"] })).tier, "week");
});

test("high severity without exploitation signals waits for the week or the plan", () => {
  assert.equal(decide(facts({ severity: "HIGH" })).tier, "week");
  assert.equal(decide(facts({ severity: "HIGH", context: { exposure: "internal", criticality: "low" } as Facts["context"] })).tier, "plan");
  assert.equal(decide(facts({ severity: "HIGH", context: { exposure: "internal", criticality: "high" } as Facts["context"] })).tier, "week");
});

test("every reason names its source", () => {
  const r = decide(facts({ severity: "HIGH", fixed: null, context: { personalData: true } as Facts["context"] }));
  assert.ok(r.reasons.length >= 4);
  for (const reason of r.reasons) assert.ok(reason.source.length > 0);
  assert.ok(r.reasons.some((x) => /고친 버전이 없어/.test(x.text)));
  assert.ok(r.reasons.some((x) => x.source === "src/a.js:1"));
});

test("transitive findings show how the package got in", () => {
  const r = decide(facts({ component: { direct: false, path: ["express@4.17.1", "qs@6.7.0"] } as Facts["component"] }));
  assert.ok(r.reasons.some((x) => x.text.includes("express@4.17.1 → qs@6.7.0")));
});

test("maxTier picks the most urgent", () => {
  assert.equal(maxTier(["plan", "week", "none"]), "week");
  assert.equal(maxTier([]), "none");
});
