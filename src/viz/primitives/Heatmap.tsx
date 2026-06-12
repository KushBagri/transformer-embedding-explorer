// Renders a Mat as a grid of colored cells. Diverging palette for signed data
// (embeddings, positional encodings), sequential for non-negative (attention).
// Optional row/column labels and row highlighting on hover.

import type { Mat } from '../../math/types'
import { divergingColor, sequentialColor, absMax } from './ColorScale'

export interface HeatmapProps {
  data: Mat
  mode?: 'diverging' | 'sequential'
  cell?: number
  rowLabels?: string[]
  colLabels?: string[]
  highlightRow?: number | null
  onHoverRow?: (row: number | null) => void
  xTitle?: string
  yTitle?: string
}

export function Heatmap({
  data,
  mode = 'diverging',
  cell = 26,
  rowLabels,
  colLabels,
  highlightRow = null,
  onHoverRow,
  xTitle,
  yTitle,
}: HeatmapProps) {
  const left = rowLabels ? 64 : 8
  const top = colLabels ? 56 : 8
  const gridW = data.cols * cell
  const gridH = data.rows * cell
  const width = left + gridW + 8
  const height = top + gridH + (xTitle ? 22 : 8)

  let max = 1
  if (mode === 'diverging') max = absMax(data.data) || 1
  else for (let i = 0; i < data.data.length; i++) max = Math.max(max, data.data[i])

  const color = (v: number) =>
    mode === 'diverging' ? divergingColor(v, max) : sequentialColor(v, max)

  const cells = []
  for (let r = 0; r < data.rows; r++) {
    for (let c = 0; c < data.cols; c++) {
      const v = data.data[r * data.cols + c]
      const dim = highlightRow != null && highlightRow !== r
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={left + c * cell}
          y={top + r * cell}
          width={cell - 1}
          height={cell - 1}
          fill={color(v)}
          opacity={dim ? 0.28 : 1}
          rx={2}
          onMouseEnter={onHoverRow ? () => onHoverRow(r) : undefined}
        >
          <title>{`[${r}, ${c}] = ${v.toFixed(3)}`}</title>
        </rect>,
      )
    }
  }

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      onMouseLeave={onHoverRow ? () => onHoverRow(null) : undefined}
    >
      {rowLabels?.map((label, r) => (
        <text
          key={`rl-${r}`}
          x={left - 8}
          y={top + r * cell + cell / 2}
          textAnchor="end"
          dominantBaseline="middle"
          className="fill-[#b9b6c6] text-[11px] font-mono"
          opacity={highlightRow != null && highlightRow !== r ? 0.4 : 1}
        >
          {label}
        </text>
      ))}
      {colLabels?.map((label, c) => (
        <text
          key={`cl-${c}`}
          x={left + c * cell + cell / 2}
          y={top - 8}
          textAnchor="start"
          className="fill-[#b9b6c6] text-[11px] font-mono"
          transform={`rotate(-45 ${left + c * cell + cell / 2} ${top - 8})`}
        >
          {label}
        </text>
      ))}
      {cells}
      {xTitle && (
        <text x={left + gridW / 2} y={height - 4} textAnchor="middle" className="fill-[#6f6c80] text-[11px]">
          {xTitle}
        </text>
      )}
      {yTitle && (
        <text
          x={12}
          y={top + gridH / 2}
          textAnchor="middle"
          className="fill-[#6f6c80] text-[11px]"
          transform={`rotate(-90 12 ${top + gridH / 2})`}
        >
          {yTitle}
        </text>
      )}
    </svg>
  )
}
