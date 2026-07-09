import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Ghost } from "lucide-react";
import { BudgetBar, BudgetTable } from "@/components/budget-bar";
import { SAMPLE_BUDGET, SAMPLE_SESSION } from "@/lib/categories";

const numberFormat = new Intl.NumberFormat("en-US");

/**
 * Session-forensics section: an inspector-styled verdict card that shows where
 * the context window went at peak — a rounded peak gauge with a dumb-zone
 * marker, the shared stacked budget bar, a per-category breakdown table, and the
 * "thinking tax" callout. Every number is the illustrative sample from
 * lib/categories, labeled as not a captured run.
 */
export const BudgetForensics = () => {
  const {
    peakTokens,
    windowTokens,
    windowAssumed,
    peakPct,
    verdict,
    dumbZonePct,
    dumbZoneTurn,
    turnsInDumbZone,
    compactions,
    subagents,
    branch,
  } = SAMPLE_SESSION;

  const peakDisplayPct = Math.round(peakPct);
  const peakContext = `${numberFormat.format(peakTokens)} / ${numberFormat.format(
    windowTokens
  )}${windowAssumed ? " (assumed)" : ""} — ${peakDisplayPct}%`;
  const statusLine = `Entered dumb zone @ turn ${dumbZoneTurn} · ${turnsInDumbZone} turns spent there · ${compactions} compactions · ${subagents} subagents · branch ${branch}`;

  return (
    <section className="bg-muted/30 py-24" id="budget-forensics">
      <div className="mx-auto w-full max-w-6xl px-6">
        <p className="font-mono text-primary text-sm tracking-[0.2em]">
          SESSION FORENSICS · peektrace sessions analyze
        </p>
        <h2 className="mt-4 text-balance font-heading text-3xl md:text-4xl">
          See exactly where the window went — at peak, not just the end.
        </h2>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Peektrace finds the single turn where context was highest (the peak,
          often mid-session), then partitions that turn into 10 attributed
          categories that always sum to the real measured size.
        </p>

        <Card className="mt-10">
          <CardHeader className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="font-heading text-4xl text-destructive">
                {verdict}
              </span>
              <p className="mt-3 font-mono text-sm tabular-nums">
                <span className="text-muted-foreground">Peak context: </span>
                {peakContext}
              </p>
              <p className="mt-1 font-mono text-muted-foreground text-xs">
                {statusLine}
              </p>
            </div>
            <Badge className="font-mono" variant="outline">
              Illustrative sample — not a captured run
            </Badge>
          </CardHeader>

          <CardContent className="flex flex-col gap-8">
            <div
              aria-label={`Peak context ${peakDisplayPct}% of the assumed window; dumb zone begins at ${dumbZonePct}%`}
              className="relative h-3 w-full rounded-full bg-muted"
              role="img"
            >
              <div
                aria-hidden="true"
                className="h-full rounded-full bg-primary"
                style={{ width: `${peakPct}%` }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-y-0 w-px bg-destructive"
                style={{ left: `${dumbZonePct}%` }}
              />
              <div
                aria-hidden="true"
                className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-background bg-primary"
                style={{ left: `${peakPct}%` }}
              />
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-heading text-lg">Budget at peak</h3>
              <BudgetBar slices={SAMPLE_BUDGET} />
              <BudgetTable slices={SAMPLE_BUDGET} />
            </div>

            <Alert className="border-primary">
              <Ghost aria-hidden="true" className="size-4" />
              <AlertTitle className="font-heading">
                The thinking tax is real.
              </AlertTitle>
              <AlertDescription>
                Claude stores retained reasoning as empty strings in the
                transcript — invisible in raw text, but it still occupies the
                window. Peektrace reconstructs it from ground-truth usage
                (output_tokens minus visible text), recovering up to ~90% of
                context in heavy-reasoning sessions that would otherwise show as
                unexplained overhead.
              </AlertDescription>
            </Alert>

            <p className="font-mono text-muted-foreground text-xs">
              Full-fidelity attribution for Claude. Ground-truth usage for Codex
              (authoritative window) and Pi (model-inferred window).
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
