// Measures FixGate's triage on public repositories that commit an npm lockfile.
// Only package.json and package-lock.json are downloaded; no project code is
// fetched or run. Every service is assumed internet-facing with medium
// criticality, since the real deployment context of these projects is unknown.
//
//   node scripts/bench.ts owner/repo@sha [owner/repo@sha ...] [--local name=dir ...]

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fetchText } from "../src/http.ts";
import { countTiers, packageRows } from "../src/report.ts";
import { triage } from "../src/triage.ts";

interface Row {
  name: string;
  components: number;
  findings: number;
  tiers: Record<string, number>;
  urgentPackages: number;
  allPackages: number;
}

async function measure(name: string, dir: string): Promise<Row> {
  const t = await triage(dir);
  const tiers = countTiers(t.findings);
  const prod = t.findings.filter((f) => f.tier !== "none");
  return {
    name,
    components: t.components.length,
    findings: t.findings.length,
    tiers,
    urgentPackages: packageRows(prod.filter((f) => f.tier === "now" || f.tier === "week")).length,
    allPackages: packageRows(prod).length,
  };
}

async function main(args: string[]): Promise<void> {
  const rows: Row[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--local") {
      const [name, dir] = args[++i].split("=");
      rows.push(await measure(name, dir));
      continue;
    }
    const [repo, sha] = args[i].split("@");
    const dir = join(".fixgate-cache", "bench", `${repo.replace("/", "__")}@${sha.slice(0, 7)}`);
    mkdirSync(dir, { recursive: true });
    for (const file of ["package.json", "package-lock.json"]) {
      const text = await fetchText(`https://raw.githubusercontent.com/${repo}/${sha}/${file}`);
      if (!text) throw new Error(`${repo}: ${file} not found`);
      writeFileSync(join(dir, file), text);
    }
    writeFileSync(join(dir, "fixgate.json"), JSON.stringify({ service: repo, exposure: "internet", criticality: "medium" }));
    rows.push(await measure(`${repo}@${sha.slice(0, 7)}`, dir));
    console.error(`measured ${repo}`);
  }

  const sum = (key: "now" | "week" | "plan" | "none") => rows.reduce((n, r) => n + r.tiers[key], 0);
  const total = rows.reduce((n, r) => n + r.findings, 0);
  const lines = [
    "| 저장소 | 구성요소 | 경보 | 즉시 | 이번 주 | 계획 | 영향 없음 | 즉시·이번 주 패키지 |",
    "|---|---|---|---|---|---|---|---|",
    ...rows.map((r) => `| ${r.name} | ${r.components} | ${r.findings} | ${r.tiers.now} | ${r.tiers.week} | ${r.tiers.plan} | ${r.tiers.none} | ${r.urgentPackages} / ${r.allPackages} |`),
    `| **합계** | ${rows.reduce((n, r) => n + r.components, 0)} | ${total} | ${sum("now")} | ${sum("week")} | ${sum("plan")} | ${sum("none")} | ${rows.reduce((n, r) => n + r.urgentPackages, 0)} / ${rows.reduce((n, r) => n + r.allPackages, 0)} |`,
  ];
  console.log(lines.join("\n"));
  console.log(`\n즉시·이번 주 비율: ${(((sum("now") + sum("week")) / total) * 100).toFixed(1)}% (${sum("now") + sum("week")} / ${total})`);
}

await main(process.argv.slice(2));
