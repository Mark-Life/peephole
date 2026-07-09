/**
 * Single source of truth for every illustrative sample number rendered on the
 * marketing page. No other file may hardcode these values — import from here.
 *
 * The forensics session numbers (peak, category slices, dumb-zone turn, memory
 * gauge) are an illustrative sample, not a captured run, and are labeled as such
 * wherever they render.
 */

/**
 * GitHub-dark data-viz hexes for the ten token-attribution categories, reused
 * verbatim from the inspector's own palette. `as const` keeps keys and hex
 * values as literal types so consumers get exact string unions.
 */
export const CAT_HEX = {
  thinking: "#db61a2",
  tool_results: "#f0883e",
  memory: "#bc8cff",
  assistant: "#d29922",
  system: "#6e7681",
  files: "#39c5cf",
  listings: "#58a6ff",
  prompts: "#3fb950",
  other: "#8b949e",
  unattributed: "#484f58",
} as const;

/** Category key — one of the ten attributed budget categories. */
export type CategoryKey = keyof typeof CAT_HEX;

/**
 * The ten ordered budget slices at peak context. Token values sum to exactly
 * 612,140 (the stated peak); `pct` is the share of the 1,000,000-token window,
 * to one decimal. `satisfies` validates each key against {@link CAT_HEX} while
 * still letting TypeScript infer a clean, reusable slice shape.
 */
export const SAMPLE_BUDGET = [
  {
    key: "thinking",
    label: "Thinking (retained reasoning)",
    tokens: 210_400,
    pct: 21.0,
    hex: CAT_HEX.thinking,
  },
  {
    key: "tool_results",
    label: "Tool results",
    tokens: 96_200,
    pct: 9.6,
    hex: CAT_HEX.tool_results,
  },
  {
    key: "memory",
    label: "CLAUDE.md + memory",
    tokens: 71_000,
    pct: 7.1,
    hex: CAT_HEX.memory,
  },
  {
    key: "assistant",
    label: "Assistant text",
    tokens: 60_100,
    pct: 6.0,
    hex: CAT_HEX.assistant,
  },
  {
    key: "system",
    label: "System + tool defs",
    tokens: 48_300,
    pct: 4.8,
    hex: CAT_HEX.system,
  },
  {
    key: "files",
    label: "Opened files",
    tokens: 40_000,
    pct: 4.0,
    hex: CAT_HEX.files,
  },
  {
    key: "listings",
    label: "Skill / agent / tool listings",
    tokens: 22_000,
    pct: 2.2,
    hex: CAT_HEX.listings,
  },
  {
    key: "prompts",
    label: "User prompts",
    tokens: 18_000,
    pct: 1.8,
    hex: CAT_HEX.prompts,
  },
  {
    key: "other",
    label: "Other",
    tokens: 30_140,
    pct: 3.0,
    hex: CAT_HEX.other,
  },
  {
    key: "unattributed",
    label: "Unattributed",
    tokens: 16_000,
    pct: 1.6,
    hex: CAT_HEX.unattributed,
  },
] satisfies readonly {
  key: CategoryKey;
  label: string;
  tokens: number;
  pct: number;
  hex: string;
}[];

/** One attributed budget slice, derived from the sample dataset shape. */
export type BudgetSlice = (typeof SAMPLE_BUDGET)[number];

/**
 * Session-level verdict metadata for the forensics sample. `windowTokens` is the
 * assumed 1,000,000-token Claude window; `peakPct` is `peakTokens / windowTokens`
 * as a percentage (one decimal). `dumbZonePct` is the ~40% context-rot cutoff.
 */
export const SAMPLE_SESSION = {
  peakTokens: 612_140,
  windowTokens: 1_000_000,
  windowAssumed: true,
  peakPct: 61.2,
  verdict: "Rotting",
  dumbZonePct: 40,
  dumbZoneTurn: 34,
  turnsInDumbZone: 41,
  compactions: 2,
  subagents: 3,
  branch: "feat/import-pipeline",
} as const;

/**
 * MEMORY.md budget gauge for the forensics sample. Both meters are over budget:
 * only the first 200 lines / 25,600 bytes (25 KB) of the index reach context, and
 * {@link SAMPLE_MEMORY.belowFoldEntries} entries sit past that fold — present in
 * the file, never read by the model. `*Label` fields carry the exact display
 * strings so no other file re-derives them.
 */
export const SAMPLE_MEMORY = {
  lines: { used: 241, limit: 200 },
  bytes: {
    used: 29_594,
    limit: 25_600,
    usedLabel: "28.9 KB",
    limitLabel: "25 KB",
  },
  belowFoldEntries: 6,
} as const;
