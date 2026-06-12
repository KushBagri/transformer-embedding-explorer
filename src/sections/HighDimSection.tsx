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
import { Analogy } from '../ui/Analogy'
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
        The treasure map left us with a rule: meaning and position can be pulled
        apart only if they point in <strong>different directions</strong> — best
        of all, at right angles, like East and North. So the question becomes:
        can the model always find enough of those right-angle directions to go
        around?
      </p>
      <p>
        On a flat map you get only <strong>two</strong>: East and North. Want to
        store a third thing — say, altitude — and there's no room left; it has to
        lie partly on top of the others. But a language model doesn't live on a
        flat map. It lives in <strong>hundreds or thousands of dimensions</strong>,
        and every extra dimension is a fresh right-angle direction to stash
        something in. Plenty of room.
      </p>
      <p>
        And here's the part that feels like magic: in high dimensions you don't
        even have to <em>arrange</em> the directions carefully. Throw two arrows
        down completely at random and they come out almost perfectly
        perpendicular. Why? It comes down to coin flips.
      </p>

      <Analogy label="Picture this — coin flips">
        <p>
          To measure how much two arrows overlap, walk through them one dimension
          at a time. In each dimension, either they <em>agree</em> (both lean the
          same way, nudging the overlap up) or they <em>disagree</em> (nudging it
          down). For random arrows that's a coin flip: heads +, tails −.
        </p>
        <p>
          In <strong>2 dimensions</strong> you flip just 2 coins. Two heads in a
          row is easy — so the arrows often <em>do</em> overlap a lot. Unreliable.
        </p>
        <p>
          In <strong>1000 dimensions</strong> you flip 1000 coins and add them up.
          Roughly half land heads, half tails, and they cancel out — the total
          lands near <strong>zero</strong>. Near-zero overlap means the arrows are
          perpendicular. The more dimensions, the more thorough the cancellation.
        </p>
      </Analogy>

      <p>
        Drag the dimensionality up and watch it happen. At <strong>2D</strong> the
        chart is flat — any angle is fair game, with a huge spread of{' '}
        <strong>±52°</strong>. Crank it higher and the whole pile of angles{' '}
        <strong className="text-combined-soft">collapses onto 90°</strong>; by a
        few hundred dimensions nearly every random pair is a right angle, give or
        take a couple of degrees.
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
        That's the whole answer to "why doesn't adding destroy position?"
        Perpendicular means <strong className="text-combined-soft">non-interfering</strong>:
        reading off meaning picks up basically none of position, and vice versa.
        High dimensions hand out a near-endless supply of non-interfering
        directions, so meaning gets its own, position gets its own, and the sum of
        the two can still be split cleanly.
      </p>

      <p>
        (One bit of precision: what matters is the <strong>right angle</strong>,
        not lining things up with the coordinate grid. The arrows{' '}
        <span className="font-mono">(1, 1)</span> and{' '}
        <span className="font-mono">(1, −1)</span> are perpendicular without
        either being an axis — and tilted pairs like that are exactly what the
        network tends to use.)
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
