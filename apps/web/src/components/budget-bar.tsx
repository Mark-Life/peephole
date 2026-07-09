import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { cn } from "@workspace/ui/lib/utils";
import type { BudgetSlice } from "@/lib/categories";

const numberFormat = new Intl.NumberFormat("en-US");

const PERCENT = 100;

/** Sum a slice list's token counts. */
const sumTokens = (slices: readonly BudgetSlice[]) =>
  slices.reduce((total, slice) => total + slice.tokens, 0);

interface BudgetBarProps {
  className?: string;
  height?: "sm" | "md";
  showLegend?: boolean;
  slices: readonly BudgetSlice[];
}

/**
 * Signature horizontal budget bar: one full-width rounded track partitioned
 * into per-category segments whose widths are the share of the summed slices
 * (so the bar always reads full), each filled with its inline category hex.
 * The bar is a single meaningful figure for assistive tech; segments are hidden.
 */
export const BudgetBar = ({
  slices,
  height = "md",
  showLegend = false,
  className,
}: BudgetBarProps) => {
  const total = sumTokens(slices);
  const lastIndex = slices.length - 1;
  const label = `Context budget at peak: ${slices
    .map((slice) => `${slice.label} ${slice.pct.toFixed(1)}%`)
    .join(", ")}`;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        aria-label={label}
        className={cn(
          "flex w-full overflow-hidden rounded-full",
          height === "sm" ? "h-3" : "h-6"
        )}
        role="img"
      >
        {slices.map((slice, index) => (
          <div
            aria-hidden="true"
            className={cn(
              "h-full ring-1 ring-background/40 ring-inset",
              index === 0 && "rounded-l-full",
              index === lastIndex && "rounded-r-full"
            )}
            key={slice.label}
            style={{
              width: `${total === 0 ? 0 : (slice.tokens / total) * PERCENT}%`,
              backgroundColor: slice.hex,
            }}
          />
        ))}
      </div>

      {showLegend ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {slices.map((slice) => (
            <li className="flex items-center gap-1.5" key={slice.label}>
              <span
                aria-hidden="true"
                className="size-2.5 rounded-[3px]"
                style={{ backgroundColor: slice.hex }}
              />
              <span className="text-muted-foreground text-xs">
                {slice.label}
              </span>
              <span className="font-mono text-xs tabular-nums">
                {slice.pct.toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

interface BudgetTableProps {
  className?: string;
  slices: readonly BudgetSlice[];
}

/**
 * Accessible per-category breakdown of a budget: category, token count, and
 * share of the assumed window. Token counts are grouped with en-US separators
 * and both numeric columns are right-aligned with tabular figures.
 */
export const BudgetTable = ({ slices, className }: BudgetTableProps) => (
  <Table className={className}>
    <TableHeader>
      <TableRow>
        <TableHead>Category</TableHead>
        <TableHead className="text-right">Tokens</TableHead>
        <TableHead className="text-right">% of window</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {slices.map((slice) => (
        <TableRow key={slice.label}>
          <TableCell>
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-3 rounded-[3px]"
                style={{ backgroundColor: slice.hex }}
              />
              {slice.label}
            </span>
          </TableCell>
          <TableCell className="text-right font-mono tabular-nums">
            {numberFormat.format(slice.tokens)}
          </TableCell>
          <TableCell className="text-right font-mono tabular-nums">
            {slice.pct.toFixed(1)}%
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
