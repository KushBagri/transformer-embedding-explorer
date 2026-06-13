// Multi-series line plot. D3 builds the path strings and scales; React renders.
// Used for per-dimension sine waves and (later) loss curves.

import { line as d3line } from 'd3-shape'
import { scaleLinear } from 'd3-scale'
import { ROLE_COLOR } from './ColorScale'

export interface Point {
  x: number
  y: number
}

export interface Series {
  points: Point[]
  color: string
  width?: number
}

export interface LinePlotProps {
  series: Series[]
  width?: number
  height?: number
  xDomain?: [number, number]
  yDomain?: [number, number]
  xLabel?: string
  yLabel?: string
  /** Optional vertical cursor at this data-x (e.g. the position marker). */
  cursorX?: number
}

const PAD = 30

function extent(values: number[], fallback: [number, number]): [number, number] {
  if (values.length === 0) return fallback
  let lo = Infinity
  let hi = -Infinity
  for (const v of values) {
    if (v < lo) lo = v
    if (v > hi) hi = v
  }
  return lo === hi ? [lo - 1, hi + 1] : [lo, hi]
}

export function LinePlot({
  series,
  width = 460,
  height = 240,
  xDomain,
  yDomain,
  xLabel,
  yLabel,
  cursorX,
}: LinePlotProps) {
  const allX = series.flatMap((s) => s.points.map((p) => p.x))
  const allY = series.flatMap((s) => s.points.map((p) => p.y))
  const xd = xDomain ?? extent(allX, [0, 1])
  const yd = yDomain ?? extent(allY, [-1, 1])

  const x = scaleLinear().domain(xd).range([PAD, width - PAD])
  const y = scaleLinear().domain(yd).range([height - PAD, PAD])

  const gen = d3line<Point>()
    .x((p) => x(p.x))
    .y((p) => y(p.y))

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" className="rounded-xl bg-surface-2">
      {/* zero line */}
      {yd[0] < 0 && yd[1] > 0 && (
        <line x1={PAD} y1={y(0)} x2={width - PAD} y2={y(0)} stroke="#ffffff" strokeOpacity={0.12} />
      )}
      {cursorX != null && (
        <line
          x1={x(cursorX)}
          y1={PAD}
          x2={x(cursorX)}
          y2={height - PAD}
          stroke={ROLE_COLOR.combined}
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
      )}
      {series.map((s, i) => (
        <path
          key={i}
          d={gen(s.points) ?? undefined}
          fill="none"
          stroke={s.color}
          strokeWidth={s.width ?? 2}
          strokeLinejoin="round"
        />
      ))}
      {xLabel && (
        <text x={width - PAD} y={height - 8} textAnchor="end" className="fill-[#6f6c80] text-[11px]">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text x={PAD} y={16} className="fill-[#6f6c80] text-[11px]">
          {yLabel}
        </text>
      )}
    </svg>
  )
}
