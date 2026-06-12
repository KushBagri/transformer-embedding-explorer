// Section 2 — what "adding" actually means, in 2D you can poke. Drag the
// sliders and watch the parallelogram: the combined vector still leans toward
// both inputs, and subtracting either one recovers the other exactly.

import { useState } from 'react'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Slider } from '../ui/Slider'
import { Analogy } from '../ui/Analogy'
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
      <p>
        Why does it work? Because <strong>East and North don't interfere</strong>.
        Walking East never changes how far North you are. So reading off one walk
        ignores the other completely.
      </p>
      <p>
        When would it <em>fail</em>? If I'd said "walk{' '}
        <span className="text-token-soft">3 steps Northeast</span>, then{' '}
        <span className="text-position-soft">4 steps Northeast</span>" — both
        along the <em>same</em> direction. Now your end-spot only tells you the
        total, 7 steps. Was it 3 + 4? 5 + 2? No way to know. Same direction =
        blurred together. <strong>That</strong> is the paint-mixing case.
      </p>
      <p>
        So the rule is simple: two added arrows stay separable as long as they
        point in <strong>different directions</strong> — best of all, at right
        angles, like East and North. Drag the sliders below: swing the token and
        position arrows to point nearly the same way and they blur; pull them
        apart toward perpendicular and each is cleanly readable from the violet
        sum.
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

      <p>
        Note what addition does <em>not</em> do: it doesn't average or round
        anything off. Every number is still present in the sum —{' '}
        <MathInline>{fmtVec(combined)}</MathInline> — it's just entangled. The
        question is never "is the information still there?" (it is) but "is it{' '}
        <em>laid out</em> so it can be pulled back apart?"
      </p>

      <Callout accent="combined">
        Adding keeps both contributions in the sum. Separating them again needs
        one more ingredient — meaning and position must point in different
        directions. That's where dimensions come in.
      </Callout>
    </SectionShell>
  )
}
