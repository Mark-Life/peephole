import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { EyeOff, FileEdit, ShieldCheck } from "lucide-react";
import {
  LINK_GRAPH_LEGEND,
  type LinkGraphLegendKind,
  LinkGraphSvg,
} from "@/components/link-graph-svg";
import { SAMPLE_MEMORY } from "@/lib/categories";

interface GaugeBar {
  label: string;
  limitLabel: string;
  ratio: number;
  usedLabel: string;
}

const GAUGE_BARS: readonly GaugeBar[] = [
  {
    label: "Index lines",
    usedLabel: String(SAMPLE_MEMORY.lines.used),
    limitLabel: String(SAMPLE_MEMORY.lines.limit),
    ratio: SAMPLE_MEMORY.lines.used / SAMPLE_MEMORY.lines.limit,
  },
  {
    label: "Index bytes",
    usedLabel: SAMPLE_MEMORY.bytes.usedLabel,
    limitLabel: SAMPLE_MEMORY.bytes.limitLabel,
    ratio: SAMPLE_MEMORY.bytes.used / SAMPLE_MEMORY.bytes.limit,
  },
];

/** Fill ratio at which a gauge switches from emerald to the amber warning. */
const AMBER_THRESHOLD = 0.9;

/** Upper bound for a gauge fill, expressed as a percentage width. */
const MAX_FILL_PERCENT = 100;

/**
 * Map a fill ratio to a semantic gauge color: emerald when comfortably under
 * budget, amber when approaching the cliff, destructive once over. The memory
 * sample is over budget on both meters, so both bars render destructive.
 */
const gaugeFillClass = (ratio: number) => {
  if (ratio >= 1) {
    return "bg-destructive";
  }
  if (ratio >= AMBER_THRESHOLD) {
    return "bg-amber-500";
  }
  return "bg-emerald-500";
};

/**
 * Swatch classes keyed to the link-graph legend encodings so the legend chips
 * match the emerald/amber/dashed-red vocabulary drawn inside the SVG.
 */
const legendSwatch = (kind: LinkGraphLegendKind) => {
  if (kind === "indexed") {
    return (
      <span aria-hidden="true" className="size-3 rounded-full bg-emerald-500" />
    );
  }
  if (kind === "orphan") {
    return (
      <span
        aria-hidden="true"
        className="size-3 rounded-full border border-dashed"
        style={{ borderColor: "#d29922", backgroundColor: "#d29922" }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="h-0 w-4 border-destructive border-t border-dashed"
    />
  );
};

/**
 * Memory-forensics section: gauges Claude's MEMORY.md index against the hard
 * 200-line / 25 KB load cliff, flags entries below the fold, and pairs a static
 * wikilink graph with the atomic-CRUD editing guarantees. Claude-only scope.
 */
export const MemoryForensics = () => (
  <section className="bg-muted/30 py-20" id="memory-forensics">
    <div className="mx-auto w-full max-w-6xl px-4">
      <p className="font-mono text-primary text-sm uppercase tracking-[0.2em]">
        MEMORY FORENSICS · peektrace memory ls / show
      </p>
      <h2 className="mt-4 max-w-3xl font-heading text-3xl md:text-4xl">
        Stop writing memories the model never loads.
      </h2>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        MEMORY.md is Claude&apos;s always-loaded index — but only the first 200
        lines / 25 KB actually reach context. Peektrace gauges your index
        against that hard cliff and flags every entry past it.
      </p>

      <Card className="mt-10">
        <CardContent className="grid gap-5">
          {GAUGE_BARS.map((bar) => (
            <div key={bar.label}>
              <div className="flex items-baseline justify-between gap-3 font-mono text-sm tabular-nums">
                <span className="text-foreground">{bar.label}</span>
                <span className="text-muted-foreground">
                  {bar.usedLabel} / {bar.limitLabel} —{" "}
                  <span className="text-destructive">OVER BUDGET</span>
                </span>
              </div>
              <div
                aria-hidden="true"
                className="mt-2 h-3 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className={cn(
                    "h-full rounded-full",
                    gaugeFillClass(bar.ratio)
                  )}
                  style={{
                    width: `${Math.min(MAX_FILL_PERCENT, bar.ratio * MAX_FILL_PERCENT)}%`,
                  }}
                />
              </div>
            </div>
          ))}

          <Alert variant="destructive">
            <EyeOff aria-hidden="true" />
            <AlertDescription>
              {SAMPLE_MEMORY.belowFoldEntries} entries are below the fold —{" "}
              <span className="font-mono uppercase">invisible to claude</span>.
              Present in the file. Never seen by the model.
            </AlertDescription>
          </Alert>

          <p className="font-mono text-muted-foreground text-xs">
            Illustrative sample
          </p>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">
              Memory is a knowledge base that rots.
            </CardTitle>
            <CardDescription>
              Peektrace parses [[wikilinks]] and markdown links, resolves them
              by slug, and renders your vault as a graph: node size by file
              weight, emerald for in-index, amber for orphans, dashed red for
              dangling references. An index-vs-files diff surfaces orphan files
              and dead MEMORY.md pointers with line numbers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto max-w-xs">
              <LinkGraphSvg />
            </div>
            <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {LINK_GRAPH_LEGEND.map((entry) => (
                <li
                  className="flex items-center gap-2 font-mono text-muted-foreground text-xs"
                  key={entry.label}
                >
                  {legendSwatch(entry.kind)}
                  {entry.label}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-muted">
                <FileEdit
                  aria-hidden="true"
                  className="size-5 text-foreground"
                />
              </div>
              <div className="grid size-10 place-items-center rounded-lg bg-muted">
                <ShieldCheck
                  aria-hidden="true"
                  className="size-5 text-foreground"
                />
              </div>
            </div>
            <CardTitle className="mt-4 font-heading">
              And it&apos;s fully editable.
            </CardTitle>
            <CardDescription>
              View, create, edit, and delete Claude memories across every
              project. Every write is atomic (temp-file + rename) with
              compare-and-swap on mtime and sha256 — concurrent edits are
              detected (FileChangedError) and offered reload-or-overwrite, never
              silently clobbered.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <code className="inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              FileChangedError → reload or overwrite
            </code>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 font-mono text-muted-foreground text-xs">
        Memory is a Claude-only surface today. Codex and Pi sessions are
        supported; per-project memory dirs are Claude markdown only.
      </p>
    </div>
  </section>
);
