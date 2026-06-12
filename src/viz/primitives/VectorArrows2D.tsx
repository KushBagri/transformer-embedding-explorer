// Draws vectors as arrows from the origin on an Axes2D frame, with an optional
// parallelogram showing a + b = (a+b). Used by the addition section.

import { Axes2D, type Scales } from './Axes2D'

export interface Arrow {
  vector: [number, number]
  color: string
  label?: string
  width?: number
}

export interface VectorArrows2DProps {
  vectors: Arrow[]
  /** Axis half-extent; defaults to fit the data with headroom. */
  range?: number
  size?: number
  /** If true, draw dashed parallelogram sides assuming v2 = v0 + v1. */
  parallelogram?: boolean
}

function arrowHead(x1: number, y1: number, x2: number, y2: number, size = 9): string {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const a1 = angle + Math.PI - 0.42
  const a2 = angle + Math.PI + 0.42
  const p1 = `${x2 + size * Math.cos(a1)},${y2 + size * Math.sin(a1)}`
  const p2 = `${x2 + size * Math.cos(a2)},${y2 + size * Math.sin(a2)}`
  return `${x2},${y2} ${p1} ${p2}`
}

function ArrowShape({ arrow, s }: { arrow: Arrow; s: Scales }) {
  const [vx, vy] = arrow.vector
  const ox = s.x(0)
  const oy = s.y(0)
  const tx = s.x(vx)
  const ty = s.y(vy)
  return (
    <g>
      <line x1={ox} y1={oy} x2={tx} y2={ty} stroke={arrow.color} strokeWidth={arrow.width ?? 3} />
      <polygon points={arrowHead(ox, oy, tx, ty)} fill={arrow.color} />
      {arrow.label && (
        <text x={tx + 8} y={ty - 6} fill={arrow.color} className="text-[12px] font-medium">
          {arrow.label}
        </text>
      )}
    </g>
  )
}

export function VectorArrows2D({
  vectors,
  range,
  size = 360,
  parallelogram = false,
}: VectorArrows2DProps) {
  const auto =
    range ??
    Math.max(
      2,
      ...vectors.flatMap(({ vector }) => [Math.abs(vector[0]), Math.abs(vector[1])]),
    ) * 1.25
  const dom: [number, number] = [-auto, auto]

  return (
    <Axes2D width={size} height={size} xDomain={dom} yDomain={dom} xLabel="dim 1" yLabel="dim 2">
      {(s) => (
        <>
          {parallelogram && vectors.length >= 3 && (
            <>
              <line
                x1={s.x(vectors[0].vector[0])}
                y1={s.y(vectors[0].vector[1])}
                x2={s.x(vectors[2].vector[0])}
                y2={s.y(vectors[2].vector[1])}
                stroke="#6f6c80"
                strokeDasharray="4 4"
              />
              <line
                x1={s.x(vectors[1].vector[0])}
                y1={s.y(vectors[1].vector[1])}
                x2={s.x(vectors[2].vector[0])}
                y2={s.y(vectors[2].vector[1])}
                stroke="#6f6c80"
                strokeDasharray="4 4"
              />
            </>
          )}
          {vectors.map((a, i) => (
            <ArrowShape key={a.label ?? i} arrow={a} s={s} />
          ))}
        </>
      )}
    </Axes2D>
  )
}
