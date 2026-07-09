import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Lock, Terminal } from "lucide-react";
import { BudgetBar } from "@/components/budget-bar";
import { CommandBlock } from "@/components/command-block";
import { SAMPLE_BUDGET } from "@/lib/categories";

const INSTALL_COMMAND =
  "curl -fsSL https://raw.githubusercontent.com/Mark-Life/peektrace/main/scripts/install.sh | sh";

const PLATFORM_FACTS = [
  "Single self-contained binary",
  "macOS (arm64, x64)",
  "Linux (x64)",
  "Windows (x64)",
  "No Node, npm, or Bun required",
];

/**
 * Landing hero: positions Peektrace as context-window forensics, shows the
 * native install one-liner with a copy button, dual CTAs, and the signature
 * budget bar as an illustrative product shot. Static server component; the
 * copy button and scroll CTAs carry their own interactivity.
 */
export const Hero = () => (
  <section className="relative w-full overflow-hidden py-24 md:py-32" id="hero">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "radial-gradient(60% 50% at 50% 0%, oklch(from var(--primary-base) l c h / 0.10), transparent)",
      }}
    />

    <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-6">
        <span className="font-mono text-primary text-xs uppercase tracking-[0.2em]">
          Context-window forensics for coding agents
        </span>

        <h1 className="text-balance font-heading text-4xl tracking-tight md:text-6xl">
          {/* Each sentence is its own block so the line never breaks mid-clause. */}
          <span className="block">Your agent didn&apos;t get dumber.</span>
          <span className="block text-muted-foreground">
            Its context window filled up.
          </span>
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground">
          Peektrace reconstructs where every token in a Claude Code, Codex, or
          Pi session actually went — system, tools, memory, files, prompts, tool
          results, and the usually-invisible thinking band — then scores the
          session Healthy, Degrading, or Rotting and marks the turn it entered
          the dumb zone.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href="#install">Install Peektrace</a>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <a href="#budget-forensics">
              <Terminal aria-hidden="true" />
              See a real analysis
            </a>
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <CommandBlock className="rounded-xl" command={INSTALL_COMMAND} />
          <p className="font-mono text-muted-foreground text-xs">
            {PLATFORM_FACTS.join(" · ")}
          </p>
        </div>

        <p className="flex items-center gap-2 text-muted-foreground text-sm">
          <Lock aria-hidden="true" className="size-4 shrink-0" />
          Runs on 127.0.0.1 only. Not a cloud service. Not on npm. No account.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-mono font-normal text-muted-foreground text-sm">
            Illustrative sample — peak context, one session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetBar showLegend slices={SAMPLE_BUDGET} />
        </CardContent>
      </Card>
    </div>
  </section>
);
