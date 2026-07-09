// biome-ignore-all lint/style/noMagicNumbers: hand-authored inline SVG chart where every data point, coordinate, and layout offset is intentional geometry

import { CAT_HEX, SAMPLE_SESSION } from "@/lib/categories";

/** Plot geometry: 60px left gutter, 20px right, 40px top, baseline at y=400. */
const PLOT = { left: 60, right: 980, top: 40, base: 400, span: 75 } as const;

/** Map a turn index (0..75) to an x pixel inside the plot. */
const sx = (turn: number) =>
  PLOT.left + (turn / PLOT.span) * (PLOT.right - PLOT.left);

/** Map a window-usage fraction (0..1) to a y pixel (1 = top of window). */
const sy = (frac: number) => PLOT.base - frac * (PLOT.base - PLOT.top);

/**
 * Build an SVG path string from a list of [x, y] points.
 * Set `close` to append a `Z` and produce a fillable polygon.
 */
const toPath = (
  points: readonly (readonly [number, number])[],
  close = false
) =>
  points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ") + (close ? " Z" : "");

/**
 * Per-turn total context as a fraction of the window. Hand-authored to rise,
 * cliff down at two compactions (duplicate x = vertical drop), then climb to a
 * peak. The 40%-of-window crossing lands exactly on turn 34.
 */
const TOTAL = [
  [0, 0.03],
  [5, 0.12],
  [11, 0.22],
  [17, 0.31],
  [23, 0.37],
  [26, 0.38],
  [26, 0.19],
  [30, 0.27],
  [34, 0.4],
  [40, 0.47],
  [46, 0.53],
  [48, 0.55],
  [48, 0.31],
  [53, 0.4],
  [59, 0.48],
  [65, 0.56],
  [70, 0.612],
  [75, 0.59],
] as const;

/** Relative thickness of each stacked category band, in CAT_HEX order. */
const LAYER_WEIGHTS = [
  0.06, 0.1, 0.09, 0.11, 0.08, 0.16, 0.12, 0.1, 0.08, 0.1,
] as const;

/** Formats token counts with grouping separators, e.g. 612140 -> "612,140". */
const numberFormat = new Intl.NumberFormat("en-US");

const DUMB_ZONE_FRAC = SAMPLE_SESSION.dumbZonePct / 100;
const PEAK = {
  turn: 70,
  frac: SAMPLE_SESSION.peakPct / 100,
  label: `peak ${numberFormat.format(SAMPLE_SESSION.peakTokens)}`,
} as const;
const CROSSING = {
  turn: SAMPLE_SESSION.dumbZoneTurn,
  frac: DUMB_ZONE_FRAC,
  label: `turn ${SAMPLE_SESSION.dumbZoneTurn}`,
} as const;
const CLIFFS = [26, 48] as const;
const Y_GRID = [0.2, 0.6, 0.8] as const;
const X_TICKS = [1, 15, 30, 45, 60, 75] as const;

const hexes = Object.values(CAT_HEX);
const rawWeights = hexes.map((_, i) => LAYER_WEIGHTS[i] ?? 0.1);
const weightSum = rawWeights.reduce((a, b) => a + b, 0);

/** Cumulative [lo, hi] fraction bounds per band, normalised to fill the total. */
const BAND_BOUNDS = rawWeights.reduce<[number, number][]>((acc, w) => {
  const lo = acc.at(-1)?.[1] ?? 0;
  acc.push([lo, lo + w / weightSum]);
  return acc;
}, []);

/**
 * Area path for one stacked band: the total silhouette scaled to the band's
 * lower bound (reversed) and upper bound, closed into a filled ribbon.
 */
const bandPath = (lo: number, hi: number) => {
  const top = TOTAL.map(([t, f]) => [sx(t), sy(f * hi)] as const);
  const bottom = TOTAL.map(([t, f]) => [sx(t), sy(f * lo)] as const).reverse();
  return toPath([...top, ...bottom], true);
};

const silhouette = toPath(TOTAL.map(([t, f]) => [sx(t), sy(f)] as const));
const yDumb = sy(DUMB_ZONE_FRAC);

/**
 * Static, hand-authored stacked-area chart of context growth across ~75 turns.
 * Shows the "dumb zone" danger band above ~40% of the window, two compaction
 * cliffs, the loaded peak, and the turn where usage first enters the band.
 */
export const GrowthTimelineSvg = () => (
  <div className="overflow-x-auto">
    <svg
      aria-labelledby="growth-title growth-desc"
      className="h-auto w-full min-w-[56rem]"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      viewBox="0 0 1000 440"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="growth-title">Context growth timeline</title>
      <desc id="growth-desc">
        A stacked-area chart of context-window usage over about 75 turns of a
        session. Usage climbs into a shaded danger band above{" "}
        {SAMPLE_SESSION.dumbZonePct}% of the window at turn{" "}
        {SAMPLE_SESSION.dumbZoneTurn}, drops sharply at two compaction cliffs
        where history was summarized away, and rises again to a peak of{" "}
        {numberFormat.format(SAMPLE_SESSION.peakTokens)} tokens near turn 70.
      </desc>

      {/* Dumb-zone danger band: everything above the 40%-of-window line. */}
      <rect
        fill="var(--destructive)"
        fillOpacity={0.07}
        height={yDumb - PLOT.top}
        width={PLOT.right - PLOT.left}
        x={PLOT.left}
        y={PLOT.top}
      />

      {/* Horizontal gridlines. */}
      {Y_GRID.map((f) => (
        <line
          key={f}
          stroke="var(--border)"
          x1={PLOT.left}
          x2={PLOT.right}
          y1={sy(f)}
          y2={sy(f)}
        />
      ))}
      {Y_GRID.map((f) => (
        <text
          className="font-mono"
          fill="var(--muted-foreground)"
          fontSize={11}
          key={`yl-${f}`}
          textAnchor="end"
          x={PLOT.left - 8}
          y={sy(f) + 4}
        >
          {`${f * 100}%`}
        </text>
      ))}

      {/* Stacked category bands, drawn in CAT_HEX order. */}
      {BAND_BOUNDS.map(([lo, hi], i) => (
        <path
          d={bandPath(lo, hi)}
          fill={hexes[i]}
          fillOpacity={0.85}
          key={hexes[i]}
        />
      ))}

      {/* True-total silhouette on top of the stack. */}
      <path
        d={silhouette}
        fill="none"
        stroke="var(--foreground)"
        strokeDasharray="4 3"
        strokeOpacity={0.7}
        strokeWidth={1.5}
      />

      {/* Dumb-zone boundary line at 40% of the window. */}
      <line
        stroke="var(--destructive)"
        strokeDasharray="6 4"
        strokeWidth={1.5}
        x1={PLOT.left}
        x2={PLOT.right}
        y1={yDumb}
        y2={yDumb}
      />
      <text
        className="font-mono"
        fill="var(--destructive)"
        fontSize={11}
        x={PLOT.left + 10}
        y={PLOT.top + 18}
      >
        dumb zone — above ~{SAMPLE_SESSION.dumbZonePct}% of window
      </text>

      {/* Compaction cliffs. */}
      {CLIFFS.map((turn) => (
        <g key={turn}>
          <line
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            x1={sx(turn)}
            x2={sx(turn)}
            y1={PLOT.top}
            y2={PLOT.base}
          />
          <text
            className="font-mono"
            fill="var(--muted-foreground)"
            fontSize={11}
            textAnchor="middle"
            x={sx(turn)}
            y={PLOT.top - 8}
          >
            compaction
          </text>
        </g>
      ))}

      {/* First crossing into the dumb zone. */}
      <circle
        cx={sx(CROSSING.turn)}
        cy={sy(CROSSING.frac)}
        fill="var(--destructive)"
        r={5}
      />
      <text
        className="font-mono"
        fill="var(--foreground)"
        fontSize={11}
        x={sx(CROSSING.turn) + 9}
        y={sy(CROSSING.frac) + 16}
      >
        {CROSSING.label}
      </text>

      {/* Peak marker (rotated square diamond). */}
      <rect
        fill="var(--foreground)"
        height={12}
        transform={`rotate(45 ${sx(PEAK.turn)} ${sy(PEAK.frac)})`}
        width={12}
        x={sx(PEAK.turn) - 6}
        y={sy(PEAK.frac) - 6}
      />
      <text
        className="font-mono"
        fill="var(--foreground)"
        fontSize={11}
        textAnchor="end"
        x={sx(PEAK.turn) - 6}
        y={sy(PEAK.frac) - 10}
      >
        {PEAK.label}
      </text>

      {/* Baseline axis. */}
      <line
        stroke="var(--border)"
        x1={PLOT.left}
        x2={PLOT.right}
        y1={PLOT.base}
        y2={PLOT.base}
      />
      {X_TICKS.map((turn) => (
        <text
          className="font-mono"
          fill="var(--muted-foreground)"
          fontSize={11}
          key={turn}
          textAnchor="middle"
          x={sx(turn)}
          y={PLOT.base + 20}
        >
          {turn}
        </text>
      ))}
      <text
        className="font-mono"
        fill="var(--muted-foreground)"
        fontSize={11}
        textAnchor="middle"
        x={(PLOT.left + PLOT.right) / 2}
        y={PLOT.base + 36}
      >
        turn
      </text>
    </svg>
  </div>
);
