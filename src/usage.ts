import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { Usage, UsageEvidence } from "./types.ts";

const SOURCE = /\.(c|m)?(j|t)sx?$/;
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", "coverage", "test", "tests", "__tests__"]);
const TEST_FILE = /\.(test|spec)\.(c|m)?(j|t)sx?$/;

/**
 * Finds where production source code imports each package, and which members
 * it calls on the imported binding. Test files are skipped because code that
 * only tests import does not ship.
 */
export function scanUsage(dir: string, packages: string[]): Map<string, Usage> {
  const wanted = new Set(packages);
  const usage = new Map<string, Usage>(packages.map((p) => [p, { imports: [], members: [], calls: [] }]));

  for (const file of sourceFiles(dir)) {
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    const bindings = new Map<string, string>();
    lines.forEach((text, i) => {
      for (const { pkg, binding } of importsOn(text)) {
        if (!wanted.has(pkg)) continue;
        const entry = usage.get(pkg)!;
        const evidence: UsageEvidence = { file: relative(dir, file).replaceAll("\\", "/"), line: i + 1, text: text.trim() };
        if (entry.imports.length < 5) entry.imports.push(evidence);
        if (binding) bindings.set(binding, pkg);
      }
    });
    for (const [binding, pkg] of bindings) {
      const { members, calls } = usage.get(pkg)!;
      const pattern = new RegExp(`(?<![\\w$.])${escape(binding)}\\.(\\w+)`, "g");
      lines.forEach((text, i) => {
        const found = [...text.matchAll(pattern)];
        for (const m of found) if (!members.includes(m[1])) members.push(m[1]);
        if (found.length && calls.length < 8) calls.push({ file: relative(dir, file).replaceAll("\\", "/"), line: i + 1, text: text.trim() });
      });
    }
  }
  return usage;
}

/** Package name and local binding for require() and import statements on one line. */
export function importsOn(text: string): { pkg: string; binding: string | null }[] {
  const found: { pkg: string; binding: string | null }[] = [];
  const req = /(?:const|let|var)\s+([\w$]+)\s*=\s*require\(\s*["']([^"']+)["']\s*\)|require\(\s*["']([^"']+)["']\s*\)/g;
  for (const m of text.matchAll(req)) found.push({ pkg: packageOf(m[2] ?? m[3]), binding: m[1] ?? null });
  const imp = /import\s+(?:(?:\*\s+as\s+)?([\w$]+)\s*,?\s*)?(?:\{[^}]*\}\s*)?from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
  for (const m of text.matchAll(imp)) found.push({ pkg: packageOf(m[2] ?? m[3]), binding: m[1] ?? null });
  return found.filter((f) => !f.pkg.startsWith(".") && !f.pkg.startsWith("node:"));
}

function packageOf(specifier: string): string {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function* sourceFiles(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (!SKIP_DIRS.has(name) && !name.startsWith(".")) yield* sourceFiles(path);
    } else if (SOURCE.test(name) && !TEST_FILE.test(name)) {
      yield path;
    }
  }
}

function escape(s: string): string {
  return s.replace(/[$]/g, "\\$");
}
