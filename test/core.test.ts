import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { notesBetween } from "../src/changelog.ts";
import { compareVersions, fixedVersion, type OsvVuln } from "../src/osv.ts";
import { citedIds } from "../src/diagnose.ts";
import { rankTargets, retryOrder, type FixAction } from "../src/remediate.ts";
import { gradleLockfileToCycloneDx, lockfileToCycloneDx, parseCycloneDx, sbomQuality, spdxToCycloneDx } from "../src/sbom.ts";
import { importsOn, scanUsage } from "../src/usage.ts";
import { applyVersion } from "../src/verify.ts";

test("parseCycloneDx marks direct, dev-only and the path from the root", () => {
  const components = parseCycloneDx({
    bomFormat: "CycloneDX",
    metadata: { component: { "bom-ref": "app@1.0.0", name: "app" } },
    components: [
      { "bom-ref": "a@1.0.0", name: "a", version: "1.0.0", purl: "pkg:npm/a@1.0.0" },
      { "bom-ref": "b@2.0.0", name: "b", version: "2.0.0", purl: "pkg:npm/b@2.0.0" },
      { "bom-ref": "t@3.0.0", name: "t", version: "3.0.0", purl: "pkg:npm/t@3.0.0", scope: "optional", properties: [{ name: "cdx:npm:package:development", value: "true" }] },
      { "bom-ref": "core@4.0.0", group: "org.acme", name: "core", version: "4.0.0", purl: "pkg:maven/org.acme/core@4.0.0" },
    ],
    dependencies: [
      { ref: "app@1.0.0", dependsOn: ["a@1.0.0", "t@3.0.0"] },
      { ref: "a@1.0.0", dependsOn: ["b@2.0.0"] },
    ],
  });
  const by = Object.fromEntries(components.map((c) => [c.name, c]));
  assert.equal(by.a.direct, true);
  assert.equal(by.b.direct, false);
  assert.deepEqual(by.b.path, ["a@1.0.0", "b@2.0.0"]);
  assert.equal(by.t.dev, true);
  assert.equal(by["org.acme/core"].ecosystem, "maven");
});

test("lockfileToCycloneDx matches npm's own SBOM for the example service", () => {
  const lock = JSON.parse(readFileSync("examples/shop-api/package-lock.json", "utf8"));
  const components = parseCycloneDx(lockfileToCycloneDx(lock));
  assert.equal(components.length, 149);
  const by = (name: string) => components.filter((c) => c.name === name);
  assert.deepEqual(by("express").map((c) => [c.version, c.direct, c.dev]), [["4.17.1", true, false]]);
  assert.deepEqual(by("qs")[0].path, ["express@4.17.1", "qs@6.7.0"]);
  assert.equal(by("nanoid")[0].dev, true);
  assert.ok(by("ms").some((c) => c.version === "2.1.3" && !c.dev), "a version shipped anywhere counts as shipped");
});

test("lockfileToCycloneDx marks packages installed from git as outside the registry", () => {
  const components = parseCycloneDx(
    lockfileToCycloneDx({
      packages: {
        "": { name: "app", dependencies: { a: "^1.0.0", internal: "github:org/internal#abc" } },
        "node_modules/a": { version: "1.0.0", resolved: "https://registry.npmjs.org/a/-/a-1.0.0.tgz" },
        "node_modules/internal": { version: "1.0.0", resolved: "git+ssh://git@github.com/org/internal.git#abc" },
      },
    }),
  );
  const by = Object.fromEntries(components.map((c) => [c.name, c]));
  assert.equal(by.a.fromRegistry, true);
  assert.equal(by.internal.fromRegistry, false);
  assert.equal(by.internal.direct, true);
});

test("fixedVersion finds the fix for the range that contains the version", () => {
  const vuln: OsvVuln = {
    id: "GHSA-1",
    affected: [{ package: { name: "x", ecosystem: "npm" }, ranges: [{ type: "SEMVER", events: [{ introduced: "0" }, { fixed: "1.2.0" }, { introduced: "2.0.0" }, { fixed: "2.3.1" }] }] }],
  };
  assert.equal(fixedVersion(vuln, "x", "1.1.9"), "1.2.0");
  assert.equal(fixedVersion(vuln, "x", "2.1.0"), "2.3.1");
  const noFix: OsvVuln = { id: "GHSA-2", affected: [{ package: { name: "x", ecosystem: "npm" }, ranges: [{ type: "SEMVER", events: [{ introduced: "0" }, { last_affected: "3.0.0" }] }] }] };
  assert.equal(fixedVersion(noFix, "x", "2.0.0"), null);
});

test("Maven versions compare over every numeric part and match OSV's group:artifact names", () => {
  assert.equal(compareVersions("1.1.10.7", "1.1.10.9"), -1);
  assert.equal(compareVersions("2.21", "2.21.5"), -1);
  assert.equal(compareVersions("4.2.17.Final", "4.2.9.Final"), 1);
  assert.equal(compareVersions("33.7.2-jre", "33.7.2"), 0);
  assert.equal(compareVersions("33.7.2-jre", "33.6.0-jre"), 1);
  assert.equal(compareVersions("1.0.0-beta.1", "1.0.0"), -1);
  const vuln: OsvVuln = { id: "GHSA-m", affected: [{ package: { name: "org.xerial.snappy:snappy-java", ecosystem: "Maven" }, ranges: [{ type: "ECOSYSTEM", events: [{ introduced: "0" }, { fixed: "1.1.10.9" }] }] }] };
  assert.equal(fixedVersion(vuln, "org.xerial.snappy/snappy-java", "1.1.10.7"), "1.1.10.9");
  assert.equal(fixedVersion(vuln, "org.xerial.snappy/snappy-java", "1.1.10.12"), null);
});

test("Gradle lockfiles: only runtime classpaths ship", () => {
  const components = parseCycloneDx(gradleLockfileToCycloneDx(["# comment", "a.b:core:1.2.3=compileClasspath,runtimeClasspath", "a.b:anno:7.1.0=compileClasspath", "a.b:junit:5.0=testRuntimeClasspath"].join("\n")));
  const by = Object.fromEntries(components.map((c) => [c.name, c]));
  assert.equal(by["a.b/core"].dev, false);
  assert.equal(by["a.b/anno"].dev, true);
  assert.equal(by["a.b/junit"].dev, true);
  assert.equal(by["a.b/core"].purl, "pkg:maven/a.b/core@1.2.3");
});

test("SPDX packages with a purl and a concrete version become components", () => {
  const components = parseCycloneDx(
    spdxToCycloneDx({
      documentDescribes: ["SPDXRef-root"],
      packages: [
        { SPDXID: "SPDXRef-root", name: "app" },
        { SPDXID: "SPDXRef-a", name: "a", versionInfo: "1.0.0", externalRefs: [{ referenceType: "purl", referenceLocator: "pkg:npm/a@1.0.0" }] },
        { SPDXID: "SPDXRef-b", name: "b", versionInfo: "^2.0.0", externalRefs: [{ referenceType: "purl", referenceLocator: "pkg:npm/b@%5E2.0.0" }] },
      ],
      relationships: [{ spdxElementId: "SPDXRef-root", relationshipType: "DEPENDS_ON", relatedSpdxElement: "SPDXRef-a" }],
    }),
  );
  assert.deepEqual(components.map((c) => [c.name, c.direct]), [["a", true]]);
});

test("sbomQuality reports what part of an SBOM can be matched", () => {
  const q = sbomQuality({ bomFormat: "CycloneDX", components: [{ name: "a", version: "1.0.0", purl: "pkg:npm/a@1.0.0" }, { name: "b" }], dependencies: [] });
  assert.deepEqual(q, { components: 2, matchable: 1, hasGraph: false, withSupplier: 0, hasTimestamp: false });
});

test("citedIds pulls fact ids out of evidence sentences", () => {
  assert.deepEqual(citedIds(["[A1] 설명", "R2 이유", "근거 없는 문장", "[C1][S3] 둘"]), ["A1", "R2", "C1", "S3"]);
});

test("rankTargets prefers the smallest clean release inside the caret range", () => {
  const versions = ["1.0.1", "1.0.2", "1.1.0", "2.0.0", "2.1.0"].map((version) => ({ version, deprecated: version === "1.1.0" }));
  const dirty = new Set(["1.0.1"]);
  assert.deepEqual(rankTargets("1.0.0", "1.0.1", versions, (v) => !dirty.has(v)), ["1.0.2", "2.0.0", "2.1.0"]);
  assert.deepEqual(rankTargets("1.0.0", "2.0.0", versions, () => true), ["2.0.0", "2.1.0"]);
});

test("retryOrder tries the newest release in range first", () => {
  assert.deepEqual(retryOrder(["4.21.0", "4.22.3", "5.0.0"], "4.17.1"), ["4.22.3", "4.21.0"]);
  assert.deepEqual(retryOrder(["1.0.0", "1.1.0"], "0.21.1"), ["1.0.0", "1.1.0"]);
});

test("applyVersion keeps the range prefix and pins transitive packages with overrides", () => {
  const action = (name: string, kind: FixAction["kind"]) => ({ name, kind }) as FixAction;
  const pkg: Record<string, any> = { dependencies: { a: "^1.0.0", b: "2.0.0" } };
  applyVersion(pkg, action("a", "direct"), "1.4.2");
  applyVersion(pkg, action("b", "direct"), "2.0.5");
  applyVersion(pkg, action("qs", "override"), "6.14.1");
  assert.deepEqual(pkg, { dependencies: { a: "^1.4.2", b: "2.0.5" }, overrides: { qs: "6.14.1" } });
});

test("importsOn reads require and import forms", () => {
  assert.deepEqual(importsOn(`const _ = require("lodash");`), [{ pkg: "lodash", binding: "_" }]);
  assert.deepEqual(importsOn(`import axios from 'axios'`), [{ pkg: "axios", binding: "axios" }]);
  assert.deepEqual(importsOn(`import { x } from "@scope/pkg/sub"`), [{ pkg: "@scope/pkg", binding: null }]);
  assert.deepEqual(importsOn(`const a = require("./local")`), []);
});

test("scanUsage finds production imports and the members called", () => {
  const usage = scanUsage("examples/shop-api", ["lodash", "jsonwebtoken", "mocha"]);
  assert.deepEqual(usage.get("lodash")!.imports.map((e) => e.file), ["src/receipt.js"]);
  assert.ok(usage.get("lodash")!.members.includes("template"));
  assert.ok(usage.get("jsonwebtoken")!.members.includes("sign"));
  assert.equal(usage.get("mocha")!.imports.length, 0);
});

test("notesBetween keeps the sections a fix skips over", () => {
  const text = ["# Changelog", "## 9.0.0 - 2022-12-21", "### Breaking changes", "- RSA key size must be 2048 bits or greater.", "## 8.5.1", "- old"].join("\n");
  assert.deepEqual(notesBetween(text, "8.5.1", "9.0.0"), ["## 9.0.0 - 2022-12-21", "### Breaking changes", "- RSA key size must be 2048 bits or greater."]);
});
