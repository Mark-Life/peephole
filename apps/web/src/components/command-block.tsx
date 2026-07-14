import { cn } from "@workspace/ui/lib/utils";
import { CopyButton } from "@/components/copy-button";

interface CommandBlockProps {
  className?: string;
  command: string;
}

/**
 * Presentational mono command row: a muted `$` prompt, the command in a
 * horizontally-scrollable code element, and a right-pinned copy button.
 */
export const CommandBlock = ({ command, className }: CommandBlockProps) => (
  <div
    className={cn(
      "flex w-full min-w-0 items-start gap-3 overflow-hidden rounded-lg border bg-card px-4 py-3",
      className
    )}
  >
    <span
      aria-hidden="true"
      className="shrink-0 font-mono text-muted-foreground leading-6"
    >
      $
    </span>
    <code className="min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-sm leading-6">
      {command}
    </code>
    <div className="shrink-0">
      <CopyButton value={command} />
    </div>
  </div>
);
