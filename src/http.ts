import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CACHE_DIR = process.env.FIXGATE_CACHE_DIR ?? ".fixgate-cache";
const TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Fetches a URL and keeps a copy on disk for a day, so a report can be rerun
 * with the same facts and public APIs are not hit on every run.
 */
async function fetchCached(url: string, body: unknown, headers: Record<string, string>): Promise<string | null> {
  const key = createHash("sha1").update(url + (body === undefined ? "" : JSON.stringify(body))).digest("hex");
  const file = join(CACHE_DIR, key);
  try {
    if (Date.now() - statSync(file).mtimeMs < TTL_MS) {
      const cached = readFileSync(file, "utf8");
      return cached === "\u0000404" ? null : cached;
    }
  } catch {
    // not cached yet
  }

  const res = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? headers : { ...headers, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status !== 404 && !res.ok) throw new Error(`${res.status} ${res.statusText} from ${url}`);
  const text = res.status === 404 ? null : await res.text();
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(file, text ?? "\u0000404");
  return text;
}

export async function fetchJson<T>(url: string, body?: unknown, headers: Record<string, string> = {}): Promise<T> {
  const text = await fetchCached(url, body, headers);
  return (text === null ? null : JSON.parse(text)) as T;
}

export function fetchText(url: string): Promise<string | null> {
  return fetchCached(url, undefined, {});
}
