import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Brain, EyeOff, TrendingDown } from "lucide-react";

interface ProblemCard {
  body: string;
  icon: typeof Brain;
  title: string;
}

const PROBLEM_CARDS: readonly ProblemCard[] = [
  {
    icon: Brain,
    title: "“It started forgetting.”",
    body: "A compaction silently evicted history mid-session. Decisions you made before the cliff are gone from context — and nothing told you when.",
  },
  {
    icon: TrendingDown,
    title: "“The answers got worse, then it hit the wall.”",
    body: "Quality erodes long before you run out of tokens. Past ~40% of the window, models exhibit context rot. Fitting under the hard limit is not the same as being sharp.",
  },
  {
    icon: EyeOff,
    title: "“It ignores a memory I clearly wrote down.”",
    body: "MEMORY.md only loads its first 200 lines / 25 KB. Everything below that fold is on disk but invisible to Claude. You're debugging against knowledge the model has literally never read.",
  },
];

/**
 * Problem section: three forensic "symptom" cards framing the invisible
 * session-decay failure modes Peektrace exists to diagnose.
 */
export const Problem = () => (
  <section className="bg-background py-20" id="problem">
    <div className="mx-auto w-full max-w-6xl px-4">
      <p className="font-mono text-primary text-sm uppercase tracking-[0.2em]">
        THE PROBLEM
      </p>
      <h2 className="mt-4 font-heading text-3xl md:text-4xl">
        You can feel the session rotting. You just can&apos;t see it.
      </h2>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {PROBLEM_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              className="transition-colors hover:border-primary/40"
              key={card.title}
            >
              <CardHeader>
                <div className="grid size-10 place-items-center rounded-lg bg-muted">
                  <Icon aria-hidden="true" className="size-5 text-foreground" />
                </div>
                <CardTitle className="mt-4 font-heading">
                  {card.title}
                </CardTitle>
                <CardDescription>{card.body}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <p className="mt-14 text-balance text-center font-heading text-2xl">
        The transcript is a multi-megabyte{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
          .jsonl file
        </code>
        . The answer is in there. Peektrace does the accounting.
      </p>
    </div>
  </section>
);
