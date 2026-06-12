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
import { Detail } from '../ui/Detail'
import { mulberry32, gaussian } from '../math/rng'
import { cosine } from '../math/vector'

const DIMS = [2, 3, 8, 16, 32, 64, 128, 256, 512, 1024]
const SAMPLES = 4000 // enough that the spread estimate is stable (~52° at 2D)
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
  const rng = mulberry32(1)
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
        Last section left us with a condition: meaning and position can only be
        pulled back apart if they point in <strong>different directions</strong> —
        ideally perpendicular ones, so neither leaks into the other. So the real
        question is: can the model always <em>find</em> enough perpendicular
        directions to give every signal its own? That depends on how many
        dimensions it has.
      </p>
      <p>
        Start in <strong>2D</strong> — a flat sheet. If meaning points east, the
        only direction that doesn't overlap it at all is due north. Pick a
        direction at random and it almost always lands somewhere diagonal,{' '}
        <em>partly on top of</em> meaning. Two random arrows here can sit at
        practically any angle: the chart is flat, and the spread is a huge{' '}
        <strong>±52°</strong> (that's 180/√12 — the spread of a perfectly even
        range of angles from 0° to 180°).
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
        Now drag the slider up, and here's the surprise: as you add dimensions,
        two directions picked at random become almost exactly perpendicular{' '}
        <em>on their own</em>. The histogram collapses to a spike at 90° and the
        ± shrinks toward zero. By a few hundred dimensions, nearly every pair is
        within a couple of degrees of a right angle.
      </p>
      <p>
        Perpendicular means <strong className="text-combined-soft">non-interfering</strong>:
        reading off "meaning" picks up essentially nothing of "position", and the
        reverse. High dimensions hand out a near-endless supply of these
        non-interfering directions — so the model can give meaning its own,
        position its own, and thousands of other features each their own, then
        stack them all by addition without them bleeding together.
      </p>

      <p>
        One thing to be precise about: what matters is that the directions are{' '}
        <strong>perpendicular</strong>, <em>not</em> that they sit on "separate
        coordinates." Lining meaning up with axis 1 and position with axis 2 is
        just the easiest perpendicular arrangement to picture — but{' '}
        <span className="font-mono">(1, 1)</span> and{' '}
        <span className="font-mono">(1, −1)</span> are perpendicular too, and
        neither is a single axis. The network usually uses tilted directions like
        that. The right angle is the whole point; the coordinate grid is not.
      </p>

      <Detail summary="Proof: why the angle locks onto 90° as dimensions grow">
        <p>
          The cosine of the angle between two unit vectors is just their dot
          product — add up the products of matching components:{' '}
          <span className="font-mono">cos = a₁b₁ + a₂b₂ + … + a_d b_d</span>.
        </p>
        <p>
          For random vectors, each term <span className="font-mono">aᵢbᵢ</span> is
          equally likely to be a little positive or a little negative. Adding{' '}
          <span className="font-mono">d</span> of these is a random walk of{' '}
          <span className="font-mono">d</span> coin-flip-sized steps: the steps
          mostly cancel, and the leftover sum grows only like{' '}
          <span className="font-mono">√d</span>. Meanwhile dividing by the vector
          lengths normalizes by about <span className="font-mono">d</span>. So the
          cosine shrinks like <span className="font-mono">√d / d = 1/√d</span> → 0.
        </p>
        <p>
          Concretely the typical overlap is{' '}
          <span className="font-mono">|cos| ≈ √(2/πd)</span>. Drag the slider to{' '}
          512 and read the "typical overlap" number under the chart: it sits right
          next to <span className="font-mono">√(2/π·512) ≈ 0.035</span> — the
          simulation and the formula agree to within sampling noise. Cosine near 0
          means angle near 90°, and the spread closes like{' '}
          <span className="font-mono">1/√d</span>.
        </p>
      </Detail>

      <Detail summary="What does 'interfere' actually mean here?">
        <p>
          Think of two audio tracks. Record a voice and a guitar onto{' '}
          <em>separate</em> tracks and you can still isolate each later. Mix them
          onto the <em>same</em> track and they're fused — boosting the voice
          boosts the guitar too. Directions in vector space are those tracks.
        </p>
        <p>
          When meaning and position sit on perpendicular directions, the linear
          "read it back out" step (a dot product) that recovers meaning multiplies
          position by ~zero, so position contributes nothing to the answer — no
          interference. When the directions overlap, recovering one drags in some
          of the other.
        </p>
      </Detail>

      <Callout accent="combined">
        That's the "room": in high dimensions, meaning can claim a direction and
        be almost certain nothing else is sitting on top of it. Adding position on
        its own direction barely disturbs it — and the sum stays separable.
      </Callout>
    </SectionShell>
  )
}
