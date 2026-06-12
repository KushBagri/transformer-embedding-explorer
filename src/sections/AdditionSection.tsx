// Section 2 — what "adding" actually means, in 2D you can poke. Drag the
// sliders and watch the parallelogram: the combined vector still leans toward
// both inputs, and subtracting either one recovers the other exactly.

import { useState } from 'react'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Slider } from '../ui/Slider'
import { Analogy } from '../ui/Analogy'
import { SubHeading } from '../ui/SubHeading'
import { MathInline } from '../ui/MathInline'
import { VectorArrows2D } from '../viz/primitives/VectorArrows2D'
import { ROLE_COLOR } from '../viz/primitives/ColorScale'

const fmt = (v: number) => v.toFixed(1)
const fmtVec = (v: [number, number]) => `[${v[0].toFixed(1)}, ${v[1].toFixed(1)}]`

export function AdditionSection() {
  const [token, setToken] = useState<[number, number]>([2, 1])
  const [position, setPosition] = useState<[number, number]>([-1, 2])
  const combined: [number, number] = [token[0] + position[0], token[1] + position[1]]

  return (
    <SectionShell
      id="addition"
      eyebrow="The worry"
      title="Doesn't adding destroy the parts?"
      visual={() => (
        <Card>
          <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="text-token-soft">● token {fmtVec(token)}</span>
            <span className="text-position-soft">● position {fmtVec(position)}</span>
            <span className="text-combined-soft">● combined {fmtVec(combined)}</span>
          </div>
          <VectorArrows2D
            parallelogram
            vectors={[
              { vector: token, color: ROLE_COLOR.token, label: 'token', width: 3 },
              { vector: position, color: ROLE_COLOR.position, label: 'position', width: 3 },
              { vector: combined, color: ROLE_COLOR.combined, label: 'combined', width: 4 },
            ]}
          />
        </Card>
      )}
    >
      <p>
        We just said the model takes a word's{' '}
        <span className="text-token-soft">meaning</span> and{' '}
        <span className="text-position-soft">position</span> and adds them into
        one <span className="text-combined-soft">combined</span> vector. Here's
        the worry, and it's a good one: if you only ever see the sum, how could
        you possibly tell which part was meaning and which was position? Doesn't
        adding just scramble them together, like mixing two colors of paint?
      </p>

      <Analogy label="Picture this — a treasure map">
        <p>
          I give you directions to buried treasure: "walk{' '}
          <span className="text-token-soft">3 steps East</span>, then{' '}
          <span className="text-position-soft">4 steps North</span>." You end up
          standing on one spot.
        </p>
        <p>
          Now — just from where you're standing — can you work out how far East
          and how far North you walked? <strong>Yes.</strong> How far <em>right</em>{' '}
          you are is the East walk; how far <em>up</em> you are is the North walk.
          The single end-spot still holds both numbers, perfectly.
        </p>
      </Analogy>

      <p>
        That's all adding two vectors is. The{' '}
        <span className="text-combined-soft">combined</span> arrow is your final
        spot; the <span className="text-token-soft">token</span> and{' '}
        <span className="text-position-soft">position</span> arrows are the two
        walks that got you there. Both walks survive in the destination.
      </p>

      <SubHeading>What "adding" actually does to the numbers</SubHeading>
      <p>
        A vector is just a list of numbers, and adding two of them means adding
        slot by slot: the first number of{' '}
        <span className="text-token-soft">meaning</span> plus the first number of{' '}
        <span className="text-position-soft">position</span>, then the second plus
        the second, and so on. Nothing is averaged, nothing is rounded, nothing is
        thrown away — every input number is still sitting inside the result. Right
        now the panel is computing{' '}
        <MathInline>{fmtVec(token)}</MathInline> +{' '}
        <MathInline>{fmtVec(position)}</MathInline> ={' '}
        <MathInline>{fmtVec(combined)}</MathInline>, drawn as the dashed
        parallelogram. The combined arrow is the diagonal, and notice it still
        leans partly toward <em>both</em> inputs.
      </p>

      <SubHeading>When you can undo it — and when you can't</SubHeading>
      <p>
        Why could you recover both walks on the map? Because{' '}
        <strong>East and North don't interfere</strong>: walking East never
        changes how far North you are, so reading off one walk ignores the other
        completely.
      </p>
      <p>
        It <em>fails</em> the moment the two walks share a direction. "Walk{' '}
        <span className="text-token-soft">3 steps Northeast</span>, then{' '}
        <span className="text-position-soft">4 steps Northeast</span>" leaves you 7
        steps along a single line — and now nothing can tell 3 + 4 apart from
        5 + 2. Same direction = blurred together. That is the paint-mixing case,
        and it's exactly the fear you started with — it's just not what happens
        when the directions differ.
      </p>
      <p>
        Drag the sliders and feel both regimes: swing the token and position
        arrows to point nearly the same way and the split turns ambiguous; pull
        them apart toward a right angle and each becomes cleanly readable from the
        violet sum.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-token-soft">Token</p>
          <Slider label="x" min={-4} max={4} step={0.1} value={token[0]} format={fmt} accent="token" onChange={(x) => setToken([x, token[1]])} />
          <Slider label="y" min={-4} max={4} step={0.1} value={token[1]} format={fmt} accent="token" onChange={(y) => setToken([token[0], y])} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-position-soft">Position</p>
          <Slider label="x" min={-4} max={4} step={0.1} value={position[0]} format={fmt} accent="position" onChange={(x) => setPosition([x, position[1]])} />
          <Slider label="y" min={-4} max={4} step={0.1} value={position[1]} format={fmt} accent="position" onChange={(y) => setPosition([position[0], y])} />
        </div>
      </div>

      <SubHeading>A worked example with real numbers</SubHeading>
      <p>
        Suppose the combined vector is <MathInline>C = (5, 3)</MathInline>. Split
        it back into meaning + position. On its own you <strong>can't</strong>:{' '}
        <MathInline>(4, 1) + (1, 2)</MathInline>,{' '}
        <MathInline>(5, 0) + (0, 3)</MathInline>, and infinitely many other pairs
        all sum to <MathInline>(5, 3)</MathInline>. The information is there, but
        the split is not unique.
      </p>
      <p>
        Now add one rule — "<span className="text-token-soft">meaning</span> only
        lives along the x-axis,{' '}
        <span className="text-position-soft">position</span> only along the
        y-axis" — and the split becomes forced and unique:{' '}
        <MathInline>(5, 0)</MathInline> for meaning,{' '}
        <MathInline>(0, 3)</MathInline> for position. Reading meaning is now just
        "take the x-coordinate," which completely ignores the y (position) part.
        The constraint that each signal lives along its own direction is the whole
        trick.
      </p>

      <SubHeading>Why this matters</SubHeading>
      <p>
        So the question is never "is the information still there?" — it always is;
        addition keeps every number. The real question is whether it's{' '}
        <em>laid out</em> so it can be pulled back apart, and we now have the
        condition: <strong>meaning and position must point in different
        directions</strong>, ideally perpendicular ones.
      </p>
      <p>
        But a word carries far more than two things — its meaning, its position,
        its part of speech, its tense, and on and on. Each needs its own
        non-interfering direction. Is there always enough room for all of them? In
        two dimensions, plainly not. The next section shows why hundreds of
        dimensions change everything.
      </p>

      <Callout accent="combined">
        Adding keeps both contributions in the sum. Pulling them apart needs one
        more ingredient — meaning and position must point in different directions.
        That's where dimensions come in.
      </Callout>
    </SectionShell>
  )
}
