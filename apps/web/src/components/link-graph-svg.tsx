interface RingPoint {
  x: number;
  y: number;
}

const ANGLE_OFFSET_DEG = -90;
const FULL_CIRCLE_DEG = 360;
const STRAIGHT_ANGLE_DEG = 180;
const DEG_TO_RAD = Math.PI / STRAIGHT_ANGLE_DEG;
const NODE_BASE_RADIUS = 6;
const NODE_WEIGHT_SCALE = 4;
const ORPHAN_RING_GAP = 3;
const BROKEN_STROKE_WIDTH = 1.5;
const LABEL_OFFSET_X = 4;
const LABEL_OFFSET_Y_TOP = 2;
const LABEL_OFFSET_Y_BOTTOM = 9;
const CENTER_LABEL_THRESHOLD = 10;

/**
 * Deterministically place a node on a circle. No randomness: the angle is a
 * pure function of the node's index and the total node count, so the graph
 * renders identically on every request (required for a server component).
 */
const pointOnRing = (
  index: number,
  total: number,
  radius: number,
  cx: number,
  cy: number
): RingPoint => {
  const angle =
    (ANGLE_OFFSET_DEG + (index * FULL_CIRCLE_DEG) / total) * DEG_TO_RAD;
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
};

type NodeState = "indexed" | "orphan";

interface GraphNode {
  name: string;
  state: NodeState;
  weight: number;
}

const CENTER = 160;
const RING = 88;
// Data colors carried as inline paint (not semantic tokens). `light-dark()` picks
// a darker light-mode value so each node clears the 3:1 non-text contrast minimum
// on a white card, while keeping the vivid dark-mode tone.
const INDEXED_FILL = "light-dark(#2b8a3e, #3fb950)";
const ORPHAN_FILL = "light-dark(#9a6d0a, #d29922)";

/** Nodes are laid out clockwise from the top; weight scales the circle radius. */
const NODES: readonly GraphNode[] = [
  { name: "memory-index", weight: 1.6, state: "indexed" },
  { name: "peektrace-rebrand", weight: 1.3, state: "indexed" },
  { name: "session-parsing", weight: 1.1, state: "indexed" },
  { name: "inspector-shell", weight: 0.9, state: "indexed" },
  { name: "native-installer", weight: 1, state: "indexed" },
  { name: "release-blockers", weight: 0.8, state: "indexed" },
  { name: "codex-support", weight: 1.2, state: "orphan" },
  { name: "pi-sessions", weight: 0.9, state: "orphan" },
  { name: "old-scratch-notes", weight: 0.7, state: "orphan" },
];

interface Edge {
  broken: boolean;
  from: number;
  to: number;
}

/** `broken: true` edges point at a slug with no backing file (a dead pointer). */
const EDGES: readonly Edge[] = [
  { from: 0, to: 1, broken: false },
  { from: 0, to: 2, broken: false },
  { from: 0, to: 4, broken: false },
  { from: 1, to: 3, broken: false },
  { from: 2, to: 5, broken: false },
  { from: 4, to: 6, broken: false },
  { from: 3, to: 5, broken: false },
  { from: 1, to: 7, broken: true },
  { from: 5, to: 8, broken: true },
];

const positions = NODES.map((_, i) =>
  pointOnRing(i, NODES.length, RING, CENTER, CENTER)
);

const nodeRadius = (weight: number) =>
  NODE_BASE_RADIUS + weight * NODE_WEIGHT_SCALE;

/** Horizontal text anchor for a label given its offset from the ring center. */
const getAnchor = (dx: number) => {
  if (Math.abs(dx) < CENTER_LABEL_THRESHOLD) {
    return "middle";
  }
  return dx < 0 ? "end" : "start";
};

/**
 * Static, dependency-free graph of a Claude `MEMORY.md` vault. Node fill and a
 * dashed orphan ring encode index membership; dashed destructive edges mark
 * dangling `[[wikilink]]` references. Legend referents live in
 * {@link LINK_GRAPH_LEGEND}.
 */
export const LinkGraphSvg = () => (
  <svg
    aria-labelledby="link-graph-title link-graph-desc"
    className="h-auto w-full overflow-visible"
    role="img"
    viewBox="0 0 320 320"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title id="link-graph-title">Memory vault link graph</title>
    <desc id="link-graph-desc">
      Nine memory files arranged on a ring. Green nodes are present in the
      MEMORY.md index; amber nodes with a dashed ring are orphan files absent
      from the index. Solid grey lines are resolved links; dashed red lines are
      broken references whose target file does not exist.
    </desc>

    <g>
      {EDGES.map((edge) => {
        const a = positions[edge.from];
        const b = positions[edge.to];
        if (!(a && b)) {
          return null;
        }
        return (
          <line
            key={`${edge.from}-${edge.to}`}
            stroke={edge.broken ? "var(--destructive)" : "var(--border)"}
            strokeDasharray={edge.broken ? "4 3" : undefined}
            strokeWidth={edge.broken ? BROKEN_STROKE_WIDTH : 1}
            x1={a.x}
            x2={b.x}
            y1={a.y}
            y2={b.y}
          />
        );
      })}
    </g>

    <g>
      {NODES.map((node, i) => {
        const p = positions[i];
        if (!p) {
          return null;
        }
        const r = nodeRadius(node.weight);
        const isOrphan = node.state === "orphan";
        const anchor = getAnchor(p.x - CENTER);
        const labelX =
          p.x + (p.x < CENTER ? -(r + LABEL_OFFSET_X) : r + LABEL_OFFSET_X);
        const labelY =
          p.y +
          (p.y < CENTER
            ? -(r + LABEL_OFFSET_Y_TOP)
            : r + LABEL_OFFSET_Y_BOTTOM);
        return (
          <g key={node.name}>
            {isOrphan ? (
              <circle
                cx={p.x}
                cy={p.y}
                fill="none"
                r={r + ORPHAN_RING_GAP}
                strokeDasharray="2 2"
                strokeWidth={1}
                style={{ stroke: ORPHAN_FILL }}
              />
            ) : null}
            <circle
              cx={p.x}
              cy={p.y}
              r={r}
              style={{ fill: isOrphan ? ORPHAN_FILL : INDEXED_FILL }}
            />
            <text
              fill="var(--muted-foreground)"
              fontFamily="var(--font-mono, monospace)"
              fontSize={7}
              textAnchor={anchor}
              x={labelX}
              y={labelY}
            >
              {node.name}
            </text>
          </g>
        );
      })}
    </g>
  </svg>
);

export type LinkGraphLegendKind = "indexed" | "orphan" | "broken";

interface LinkGraphLegendEntry {
  kind: LinkGraphLegendKind;
  label: string;
}

/** Legend rows kept in lockstep with the encodings drawn by {@link LinkGraphSvg}. */
export const LINK_GRAPH_LEGEND: readonly LinkGraphLegendEntry[] = [
  { label: "In index", kind: "indexed" },
  { label: "Orphan file", kind: "orphan" },
  { label: "Broken link", kind: "broken" },
];
