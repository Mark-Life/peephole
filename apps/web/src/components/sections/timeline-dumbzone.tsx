import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { AlertTriangle, Diamond, Scissors } from "lucide-react";
import { GrowthTimelineSvg } from "@/components/growth-timeline-svg";
import { SAMPLE_SESSION } from "@/lib/categories";

/**
 * Explanatory chips beneath the timeline. Titles pair with a lucide glyph; the
 * dumb-zone cutoff and crossing turn are read from the illustrative sample so no
 * threshold is hardcoded here.
 */
const CHIPS = [
  {
    icon: AlertTriangle,
    title: "Dumb zone",
    body: `Usage at or above ${SAMPLE_SESSION.dumbZonePct}% of the window. Context-rot territory. In this sample you crossed it at turn ${SAMPLE_SESSION.dumbZoneTurn}.`,
  },
  {
    icon: Scissors,
    title: "Compaction cliff",
    body: "History summarized away. Detail discussed before the cliff may be gone from context.",
  },
  {
    icon: Diamond,
    title: "Peak",
    body: "The most-loaded turn. The last turn can look small after a compaction and hide how close you ran to the wall.",
  },
] as const;

/**
 * Context-growth timeline section: a static, hand-authored stacked-area chart
 * that shows context climbing into the dumb zone, the compaction cliffs where
 * history was evicted, and the peak, followed by three explanatory chips.
 */
export const TimelineDumbzone = () => (
  <section className="py-20" id="timeline-dumbzone">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
        CONTEXT GROWTH TIMELINE
      </p>
      <h2 className="mt-4 text-balance font-heading font-semibold text-3xl tracking-tight sm:text-4xl">
        Watch context climb into the dumb zone — and see every cliff where
        history got dropped.
      </h2>
      <p className="mt-4 max-w-2xl text-pretty text-muted-foreground">
        A per-turn stacked-area chart of real context from turn 1 to the
        ceiling. A red danger band marks the dumb zone (context at or above ~40%
        of the window, where attention and quality quietly degrade). Sharp
        downward cliffs mark compactions — the moments the agent summarized and
        evicted growable history. A diamond marks peak; a marker flags the exact
        turn you first crossed into the danger band.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-end">
          <Badge
            className="font-mono text-[0.65rem] uppercase tracking-wider"
            variant="outline"
          >
            Illustrative sample — not a captured run
          </Badge>
        </div>
        <GrowthTimelineSvg />
      </div>

      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {CHIPS.map(({ icon: Icon, title, body }) => (
          <li key={title}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Icon aria-hidden="true" className="size-4 text-primary" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-pretty text-muted-foreground text-sm">
                  {body}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
