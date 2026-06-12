// Section 3 — the centerpiece. Drag the dimensionality slider and watch the
// distribution of angles between random vectors collapse onto a spike at 90°.
// THIS is why adding token + position doesn't destroy either: in high
// dimensions random directions are almost always orthogonal.

import { useMemo, useState } from 'react'
import { scaleLinear } from 'd3-scale'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Slider } from '../ui/Slider'
import { mulberry32, gaussian } from '../math/rng'
import { cosine } from '../math/vector'

const DIMS = [2, 3, 8, 16, 32, 64, 128, 256, 512, 1024]
const SAMPLES = 600
const BINS = 36 // 5° each over 0..180

function randomUnit(dim: number, rng: () => number): Float32Array {
  const v = new Float32Array(dim)
  let n = 0
  for (let i = 0; i < dim; i++) {
    v[i] = gaussian(rng)
    n += v[i] * v[i]
  }
  n = Math.sqrt(n) || 1
  for (let i = 0; i < dim; i++) v[i] /= n
  return v
}

function computeAngles(dim: number) {
  const rng = mulberry32(20240611)
  const counts = new Array(BINS).fill(0)
  let angleSum = 0
  let angleSqSum = 0
  let absCosSum = 0
  let near = 0 // within 10 degrees of perpendicular
  for (let s = 0; s < SAMPLES; s++) {
    const c = cosine(randomUnit(dim, rng), randomUnit(dim, rng))
    const deg = (Math.acos(Math.min(1, Math.max(-1, c))) * 180) / Math.PI
    counts[Math.min(BINS - 1, Math.floor((deg / 180) * BINS))]++
    angleSum += deg
    angleSqSum += deg * deg
    absCosSum += Math.abs(c)
    if (Math.abs(deg - 90) <= 10) near++
  }
  const meanAngle = angleSum / SAMPLES
  const variance = Math.max(0, angleSqSum / SAMPLES - meanAngle * meanAngle)
  return {
    counts,
    meanAngle,
    spread: Math.sqrt(variance),
    pctNearPerp: (100 * near) / SAMPLES,
    meanAbsCos: absCosSum / SAMPLES,
  }
}

function Histogram({ counts }: { counts: number[] }) {
  const W = 460
  const H = 240
  const PAD = 30
  const maxCount = Math.max(...counts, 1)
  const x = scaleLinear().domain([0, 180]).range([PAD, W - PAD])
  const y = scaleLinear().domain([0, maxCount]).range([H - PAD, PAD])
  const bw = (W - 2 * PAD) / counts.length

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" className="rounded-xl bg-surface-2">
      <line x1={x(90)} y1={PAD} x2={x(90)} y2={H - PAD} stroke="#a78bfa" strokeOpacity={0.5} strokeDasharray="3 3" />
      {counts.map((c, i) => {
        const deg = (i + 0.5) * (180 / counts.length)
        const closeness = 1 - Math.abs(deg - 90) / 90
        return (
          <rect
            key={i}
            x={PAD + i * bw + 0.5}
            y={y(c)}
            width={bw - 1}
            height={H - PAD - y(c)}
            fill="#a78bfa"
            opacity={0.35 + 0.55 * closeness}
          />
        )
      })}
      {[0, 45, 90, 135, 180].map((t) => (
        <text key={t} x={x(t)} y={H - 10} textAnchor="middle" className="fill-[#6f6c80] text-[10px]">
          {t}°
        </text>
      ))}
      <text x={W - PAD} y={16} textAnchor="end" className="fill-[#6f6c80] text-[11px]">
        angle between two random vectors
      </text>
    </svg>
  )
}

export function HighDimSection() {
  const [dimIndex, setDimIndex] = useState(0)
  const dim = DIMS[dimIndex]
  const { counts, spread, pctNearPerp, meanAbsCos } = useMemo(
    () => computeAngles(dim),
    [dim],
  )

  return (
    <SectionShell
      id="high-dim"
      eyebrow="Why it works"
      title="High dimensions give everything its own room"
      visual={() => (
        <Card>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-prose-dim">typical angle</p>
              <p className="font-mono text-3xl text-combined-soft">
                90° <span className="text-prose-dim">±</span> {spread.toFixed(0)}°
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-prose-dim">dimensions</p>
              <p className="font-mono text-3xl text-prose-bright">{dim}</p>
            </div>
          </div>
          <Histogram counts={counts} />
          <p className="mt-2 text-center text-sm text-prose-dim">
            {pctNearPerp.toFixed(0)}% of pairs within 10° of perpendicular ·
            typical overlap |cos| = {meanAbsCos.toFixed(3)}
          </p>
        </Card>
      )}
    >
      <p>
        You might object: even in <strong>2D</strong>, two random arrows are{' '}
        <em>on average</em> 90° apart, so what's special? You'd be right — the{' '}
        <em>average</em> is 90° in every dimension. The average is not the point.
      </p>
      <p>
        What matters is the <strong className="text-combined-soft">spread</strong>.
        In 2D the angle is equally likely to be anything from 0° to 180°: loads of
        pairs come out nearly parallel (lots of overlap) or nearly opposite. The
        histogram is flat. Now raise the dimensionality and watch the ± shrink.
      </p>
      <Slider
        label="dimensionality"
        min={0}
        max={DIMS.length - 1}
        step={1}
        value={dimIndex}
        format={() => `${dim}D`}
        onChange={setDimIndex}
      />
      <p>
        As dimensions grow, the distribution{' '}
        <strong className="text-combined-soft">clamps down around 90°</strong>.
        It's not that the average moves — it's that 90° becomes almost the{' '}
        <em>only</em> outcome. By a few hundred dimensions, nearly every pair of
        random directions is perpendicular to within a few degrees.
      </p>
      <Callout accent="combined">
        That's the "room": meaning can claim a direction and be almost certain
        nothing else is sitting on top of it. So position can take its own
        direction too — and adding the two barely disturbs either one.
      </Callout>
    </SectionShell>
  )
}
