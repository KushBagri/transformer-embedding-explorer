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
import { SubHeading } from '../ui/SubHeading'
import { MathInline } from '../ui/MathInline'
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
      <SubHeading>Why a flat world runs out of room</SubHeading>
      <p>
        On a flat map you get only <strong>two</strong> perpendicular directions:
        East and North. Want to store a third thing — say, altitude — and there's
        no room left; it has to lie partly on top of the others, and now reading
        one drags in the rest. With more things to encode than perpendicular
        directions, interference is forced.
      </p>
      <p>
        But a language model doesn't live on a flat map. It lives in{' '}
        <strong>hundreds or thousands of dimensions</strong>, and every extra
        dimension is a fresh right-angle direction to stash something in. Room
        stops being the problem.
      </p>

      <SubHeading>The surprise: random arrows are nearly perpendicular</SubHeading>
      <p>
        Better still, in high dimensions you don't even have to{' '}
        <em>arrange</em> the directions carefully. Throw two arrows down
        completely at random and they come out almost perfectly perpendicular —
        for free. That sounds wrong, so here's why it's true. It comes down to
        coin flips.
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

      <SubHeading>Watch the spread collapse</SubHeading>
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

      <SubHeading>The mechanism, step by step</SubHeading>
      <p>
        Why do the angles pile onto 90°? It all rides on one number: the cosine of
        the angle between two unit-length arrows, which is exactly their dot
        product — march through the coordinates, multiply each pair, and add them
        up: <MathInline>cos = a₁b₁ + a₂b₂ + … + a_d b_d</MathInline>. Cosine near 0
        means angle near 90°, so we only need to know how big that sum tends to be.
        Four steps:
      </p>
      <ol className="flex list-decimal flex-col gap-2 pl-5 marker:text-prose-dim">
        <li>
          <strong className="text-prose-bright">One coordinate is about ±1/√d.</strong>{' '}
          A unit arrow has length 1, so{' '}
          <MathInline>a₁² + … + a_d² = 1</MathInline>. Spread evenly over{' '}
          <MathInline>d</MathInline> coordinates, each is around{' '}
          <MathInline>±1/√d</MathInline> — tiny in 100 dimensions (~0.1), large in
          2 (~0.7).
        </li>
        <li>
          <strong className="text-prose-bright">On average the sum is exactly 0.</strong>{' '}
          Each product <MathInline>aᵢbᵢ</MathInline> is positive half the time and
          negative half the time, so it averages 0; add{' '}
          <MathInline>d</MathInline> of them and the average is still 0. The cosine
          averages 0 — a right angle — in <em>every</em> dimension, even 2D. (That
          is why the average alone told you nothing.)
        </li>
        <li>
          <strong className="text-prose-bright">But it jitters by about 1/√d.</strong>{' '}
          Each term is roughly <MathInline>1/d</MathInline> in size; with{' '}
          <MathInline>d</MathInline> random ± signs they mostly cancel — a
          coin-flip walk of <MathInline>d</MathInline> steps of size{' '}
          <MathInline>1/d</MathInline> lands a typical distance of{' '}
          <MathInline>√d × (1/d) = 1/√d</MathInline> from zero.
        </li>
        <li>
          <strong className="text-prose-bright">So cos ≈ 0 ± 1/√d.</strong>{' '}
          <MathInline>d = 4 → ±0.50</MathInline> (angles all over the place);{' '}
          <MathInline>d = 100 → ±0.10</MathInline>;{' '}
          <MathInline>d = 10,000 → ±0.01</MathInline> (basically a right angle).
        </li>
      </ol>
      <p>
        More dimensions, more coins, more complete cancellation — the cosine
        clamps tighter to 0 and the angle to 90°.
      </p>

      <SubHeading>A worked number</SubHeading>
      <p>
        Worked out exactly, the typical overlap is{' '}
        <MathInline>|cos| ≈ √(2/πd)</MathInline>. At{' '}
        <MathInline>d = 512</MathInline> that's{' '}
        <MathInline>√(2/π·512) ≈ 0.035</MathInline> — set the slider to 512 and
        read "typical overlap" under the chart; it sits right there. A cosine of
        0.035 is an angle of about 88°: nearly perpendicular. Meanwhile{' '}
        <MathInline>d = 2</MathInline> has too few coin flips for the cancellation
        to bite, so the angle is spread evenly across 0–180° (the ±52° you see) —
        the <MathInline>1/√d</MathInline> clamping only kicks in as dimensions
        grow.
      </p>

      <SubHeading>Why this is the whole answer</SubHeading>
      <p>
        Perpendicular means <strong className="text-combined-soft">non-interfering</strong>:
        reading off meaning picks up basically none of position, and vice versa.
        High dimensions hand out a near-endless supply of non-interfering
        directions, so meaning gets its own, position gets its own, and the sum of
        the two can still be split cleanly. That is the resolution of the whole
        paradox.
      </p>

      <SubHeading>More rooms than there are dimensions</SubHeading>
      <p>
        Here's the part that sounds impossible. A 512-dimensional space has exactly{' '}
        <strong>512</strong> directions that are <em>perfectly</em> perpendicular to
        one another — no more, just as a flat map has exactly 2 (East, North) and a
        room has exactly 3 (length, width, height). Try to add a 513th perfectly
        perpendicular direction and there is literally nowhere to put it. So far it
        looks like room runs out at 512 things.
      </p>
      <p>
        But you don't need <em>perfect</em> right angles. You only need{' '}
        <strong className="text-combined-soft">non-interfering</strong>, and the
        section already showed that a tiny overlap is as good as zero. So relax the
        rule from "exactly 90°" to "between 80° and 100°" — a hair off square — and
        the count of directions you can fit stops being{' '}
        <MathInline>d</MathInline> and starts growing <strong>exponentially</strong>{' '}
        with <MathInline>d</MathInline>. Where 3D buys you 3 axes, a few hundred
        dimensions buy you <em>billions</em> of nearly-square directions. That is why
        one vector has room for not just meaning and position but thousands of
        features at once — part of speech, tense, sentiment, topic — each on its own
        almost-perpendicular direction.
      </p>

      <Analogy label="Picture this — darts on a globe">
        <p>
          You and a friend each throw a dart, blindfolded, at a globe. On a small
          beach ball the darts often land close together — there just isn't much
          surface, so near-misses are common. That's the flat, low-dimensional world,
          where two random arrows easily end up pointing the same way.
        </p>
        <p>
          Now blow the globe up to a million dimensions. The surface is so vast that
          two blind throws land <strong>far apart, every time</strong> — and you can
          keep throwing darts and they keep landing far from <em>all</em> the earlier
          ones. Each dart is a feature claiming its own near-square direction; the
          enormous surface is why there's room for so many.
        </p>
      </Analogy>

      <p>
        This near-perpendicular packing has a name: <strong>quasi-orthogonality</strong>,
        a consequence of what mathematicians call the{' '}
        <strong>Johnson–Lindenstrauss</strong> result — the fact that you can crowd far
        more "almost-square" directions into <MathInline>d</MathInline> dimensions than{' '}
        <MathInline>d</MathInline> itself. Storing many features in one vector this way,
        leaning on that tiny tolerated overlap, is called{' '}
        <strong className="text-combined-soft">superposition</strong>.
      </p>
      <Detail summary="Dig deeper: how many directions, and where superposition comes from">
        <p>
          A quick sense of the scale. Pack random unit arrows into{' '}
          <MathInline>d = 512</MathInline> dimensions and any two of them overlap by
          only about <MathInline>|cos| ≈ 0.035</MathInline> — the same 88° figure the
          chart shows at 512. The number you can pack before <em>some</em> pair drifts
          past your tolerance grows like <MathInline>e^{`{c·d}`}</MathInline>:
          exponential in <MathInline>d</MathInline>. That is the gap between{' '}
          <strong>512</strong> perfectly-perpendicular axes and <strong>billions</strong>{' '}
          of merely-near-perpendicular ones.
        </p>
        <p>
          Anthropic's paper <strong>"Toy Models of Superposition"</strong> studies this
          directly: it shows small networks deliberately storing <em>more</em> distinct
          features than they have dimensions, by tucking each onto its own
          almost-orthogonal direction and tolerating the faint crosstalk. Meaning plus
          position is just the two-feature case of that same trick.
        </p>
      </Detail>

      <SubHeading>"Different directions," not "different dimensions"</SubHeading>
      <p>
        Now the clarification that trips up almost everyone — and it fixes
        something you may have noticed me fudge earlier. Back at the treasure map
        I said meaning goes along one axis (East) and position along another
        (North), as if{' '}
        <strong>dimensions 0–9 store position and 10–511 store meaning</strong>,
        each in its own private columns. That is <strong>not</strong> what
        happens. The coin-flip picture already gave it away: every vector has a
        value in <em>every</em> dimension. The meaning vector uses all 512
        coordinates; so does the position vector. Nobody gets their own columns.
      </p>
      <p>
        So how can they be "separate" if they share all the coordinates? Because
        separate means <strong>perpendicular directions</strong>, not separate
        coordinates — and a direction is usually a <em>tilted blend</em> of all
        the coordinates at once, not a single axis.
      </p>

      <Analogy label="Picture this — a tilted ruler">
        <p>
          Back on the map, instead of East and North, use{' '}
          <strong>Northeast</strong> and <strong>Northwest</strong>. Each of those
          uses the East coordinate <em>and</em> the North coordinate — neither is a
          pure axis. Yet they're still at a perfect right angle to each other.
        </p>
        <p>
          So "walk 3 along Northeast, then 4 along Northwest" still works: you
          recover each walk by measuring with a ruler turned 45°. Sharing the
          underlying coordinates changes nothing. The <strong>right angle</strong>{' '}
          is what lets you separate them.
        </p>
      </Analogy>

      <p>
        That's exactly the real setup. Meaning lives along one tilted direction
        (spread across all the dimensions); position lives along another tilted
        direction (also spread across all of them); and the two directions are
        perpendicular. "Different dimensions" was a white lie to get us moving —
        the honest version is <strong>different perpendicular directions, each
        woven through every dimension</strong>.
      </p>

      <Detail summary="Then how does the model 'read one back out'? (the projection)">
        <p>
          To pull meaning out of the sum, the model <strong>projects</strong> the
          combined vector onto meaning's direction — it takes the dot product with
          meaning's unit arrow <span className="font-mono">û</span>.
        </p>
        <p>
          Write the sum as <span className="font-mono">combined = A + B</span>,
          where <span className="font-mono">A</span> is the meaning part (pointing
          along <span className="font-mono">û</span>) and{' '}
          <span className="font-mono">B</span> is the position part (along a
          perpendicular direction <span className="font-mono">v̂</span>). The
          projection is{' '}
          <span className="font-mono">(A + B) · û = A·û + B·û</span>. Because{' '}
          <span className="font-mono">B</span> is perpendicular to{' '}
          <span className="font-mono">û</span>, the term{' '}
          <span className="font-mono">B·û = 0</span> — position contributes{' '}
          <em>nothing</em>. Out comes meaning, with zero leakage.
        </p>
        <p>
          That one dot product <em>is</em> the separation. And the{' '}
          <span className="text-prose-bright">Q/K/V</span> projections coming up in
          the attention section are precisely these learned "read-out directions."
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
