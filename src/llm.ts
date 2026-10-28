import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * The LLM step runs through the Claude Code CLI in headless mode, so it uses
 * the subscription the developer is already logged in with instead of a paid
 * API key. It is off unless FIXGATE_LLM=claude-code.
 *
 * Every answer is cached on disk forever (same question, same answer, no
 * second call), and a run stops calling after FIXGATE_LLM_MAX_CALLS.
 */
export interface Llm {
  model: string;
  askJson<T>(task: string, prompt: string, schema: object): Promise<T | null>;
  calls(): number;
}

const SYSTEM = [
  "You review software supply-chain fixes for a security team.",
  "Use only the facts you are given. When you cite a fact, use its id in square brackets as given, such as N3 or C1.",
  "Never invent package versions, advisory ids, APIs or behaviour that the facts do not show; say it is uncertain instead.",
  "Write every sentence for people in Korean, short and plain.",
  "Return only the JSON the schema asks for.",
].join(" ");

export function llmFromEnv(env = process.env): Llm | null {
  if (env.FIXGATE_LLM !== "claude-code") return null;
  const model = env.FIXGATE_LLM_MODEL ?? "sonnet";
  const maxCalls = Number(env.FIXGATE_LLM_MAX_CALLS ?? 10);
  const cacheDir = join(env.FIXGATE_CACHE_DIR ?? ".fixgate-cache", "llm");
  let made = 0;

  return {
    model,
    calls: () => made,
    async askJson<T>(task: string, prompt: string, schema: object): Promise<T | null> {
      const key = createHash("sha1").update(JSON.stringify([model, SYSTEM, prompt, schema])).digest("hex");
      const file = join(cacheDir, `${key}.json`);
      if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8")).output as T;
      if (made >= maxCalls) {
        console.error(`LLM 호출 상한(${maxCalls}회)에 닿아 '${task}'를 건너뜁니다.`);
        return null;
      }
      made++;
      // An empty working directory keeps project files and settings out of the prompt.
      const cwd = mkdtempSync(join(tmpdir(), "fixgate-llm-"));
      const r = spawnSync(
        "claude",
        [
          "-p",
          "--output-format", "json",
          "--model", model,
          "--no-session-persistence",
          "--tools", "",
          "--setting-sources", "",
          "--system-prompt", SYSTEM,
          "--json-schema", JSON.stringify(schema),
        ],
        { cwd, input: prompt, encoding: "utf8", timeout: 5 * 60 * 1000, maxBuffer: 32 * 1024 * 1024 },
      );
      if (r.status !== 0) {
        console.error(`LLM 호출 실패 (${task}): ${(r.stderr || r.stdout || "").slice(0, 300)}`);
        return null;
      }
      const out = JSON.parse(r.stdout) as { is_error?: boolean; structured_output?: T; result?: string };
      if (out.is_error || out.structured_output === undefined) {
        console.error(`LLM 응답에 구조화된 결과가 없음 (${task})`);
        return null;
      }
      mkdirSync(cacheDir, { recursive: true });
      writeFileSync(file, JSON.stringify({ task, model, at: new Date().toISOString(), output: out.structured_output }, null, 2));
      return out.structured_output;
    },
  };
}
