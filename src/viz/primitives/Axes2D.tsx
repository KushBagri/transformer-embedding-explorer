// A reusable 2D Cartesian frame: gridlines, zero-axes, and tick labels. D3
// computes the scales; React renders the SVG so there's no D3/React DOM tug of
// war. Children receive the scale fns to plot data in data-space coordinates.

import type { ReactNode } from 'react'
import { scaleLinear } from 'd3-scale'

export interface Scales {
  /** data-x -> pixel-x */
  x: (v: number) => number
  /** data-y -> pixel-y (y points up in data space) */
  y: (v: number) => number
}

export interface Axes2DProps {
  width: number
  height: number
  xDomain: [number, number]
  yDomain: [number, number]
  xLabel?: string
  yLabel?: string
  children?: (scales: Scales) => ReactNode
}

const PAD = 28

function ticks(domain: [number, number]): number[] {
  const out: number[] = []
  const lo = Math.ceil(domain[0])
  const hi = Math.floor(domain[1])
  for (let v = lo; v <= hi; v++) out.push(v)
  return out
}

export function Axes2D({
  width,
  height,
  xDomain,
  yDomain,
  xLabel,
  yLabel,
  children,
}: Axes2DProps) {
  const xScale = scaleLinear().domain(xDomain).range([PAD, width - PAD])
  const yScale = scaleLinear().domain(yDomain).range([height - PAD, PAD])
  const scales: Scales = { x: (v) => xScale(v), y: (v) => yScale(v) }

  const x0 = xScale(0)
  const y0 = yScale(0)

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      className="rounded-xl bg-surface-2"
      role="img"
    >
      {/* gridlines */}
      {ticks(xDomain).map((t) => (
        <line
          key={`gx-${t}`}
          x1={xScale(t)}
          y1={PAD}
          x2={xScale(t)}
          y2={height - PAD}
          stroke="#ffffff"
          strokeOpacity={t === 0 ? 0.18 : 0.05}
        />
      ))}
      {ticks(yDomain).map((t) => (
        <line
          key={`gy-${t}`}
          x1={PAD}
          y1={yScale(t)}
          x2={width - PAD}
          y2={yScale(t)}
          stroke="#ffffff"
          strokeOpacity={t === 0 ? 0.18 : 0.05}
        />
      ))}

      {/* axis labels */}
      {xLabel && (
        <text x={width - PAD} y={y0 - 8} textAnchor="end" className="fill-[#6f6c80] text-[11px]">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text x={x0 + 8} y={PAD + 4} className="fill-[#6f6c80] text-[11px]">
          {yLabel}
        </text>
      )}

      {children?.(scales)}
    </svg>
  )
}
