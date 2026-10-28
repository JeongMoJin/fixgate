export type Tier = "now" | "week" | "plan" | "none";

export const TIER_ORDER: Tier[] = ["now", "week", "plan", "none"];

export const TIER_LABEL: Record<Tier, string> = {
  now: "즉시",
  week: "이번 주",
  plan: "계획",
  none: "영향 없음",
};

export type Severity = "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | "UNKNOWN";

export interface Component {
  ref: string;
  name: string;
  version: string;
  purl: string;
  ecosystem: string;
  /** Only needed to build or test, never shipped to production. */
  dev: boolean;
  /** Declared by the service itself rather than pulled in by another package. */
  direct: boolean;
  /** Shortest chain of refs from the service root to this component. */
  path: string[];
}

export interface Advisory {
  id: string;
  cve: string | null;
  aliases: string[];
  summary: string;
  severity: Severity;
  /** First version that is no longer affected, for the installed version. Null when no fix exists. */
  fixed: string | null;
  url: string;
}

export interface Epss {
  score: number;
  percentile: number;
  date: string;
}

export interface Kev {
  dateAdded: string;
  knownRansomware: boolean;
  requiredAction: string;
}

export interface UsageEvidence {
  file: string;
  line: number;
  text: string;
}

export interface Usage {
  /** Places in production source code that import the package. Empty for transitive packages. */
  imports: UsageEvidence[];
  /** Members called on the imported binding, such as "template" for lodash.template. */
  members: string[];
  /** Lines where those members are called. */
  calls: UsageEvidence[];
}

export interface ServiceContext {
  service: string;
  exposure: "internet" | "internal";
  criticality: "high" | "medium" | "low";
  personalData: boolean;
  owner?: string;
}

/** Every reason names where its fact came from, so nothing in a report is unsourced. */
export interface Reason {
  text: string;
  source: string;
}

export interface Finding {
  component: Component;
  advisory: Advisory;
  epss: Epss | null;
  kev: Kev | null;
  usage: Usage;
  tier: Tier;
  reasons: Reason[];
}
