// Section 2 — what "adding" actually means, in 2D you can poke. Drag the
// sliders and watch the parallelogram: the combined vector still leans toward
// both inputs, and subtracting either one recovers the other exactly.

import { useState } from 'react'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Slider } from '../ui/Slider'
import { Detail } from '../ui/Detail'
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
        Here is the worry, and it's a good one. Two vectors add tip-to-tail into
        a third. If all the model ever receives is the{' '}
        <span className="text-combined-soft">combined</span> vector, how could it
        ever tell which part was <span className="text-token-soft">meaning</span>{' '}
        and which was <span className="text-position-soft">position</span>?
      </p>
      <p>
        Drag the sliders. Many different token/position pairs land on the{' '}
        <em>same</em> combined arrow — so in general, you genuinely{' '}
        <strong>cannot</strong> undo the addition. Your intuition is right.
      </p>

      <Detail summary="So how is it ever recoverable? (the key idea)">
        <p>
          It's recoverable only if the two parts are constrained to point in{' '}
          <strong>different directions</strong>. Suppose I tell you a sum is{' '}
          <MathInline>C = (5, 3)</MathInline> and nothing else — you can't split
          it; <MathInline>(4,1) + (1,2)</MathInline> works just as well as{' '}
          <MathInline>(5,0) + (0,3)</MathInline>.
        </p>
        <p>
          But if I also tell you "<span className="text-token-soft">meaning</span>{' '}
          only lives along the x-axis, <span className="text-position-soft">position</span>{' '}
          only along the y-axis," the split is forced:{' '}
          <MathInline>(5,0)</MathInline> and <MathInline>(0,3)</MathInline>. The
          constraint that each signal lives in its own subspace is exactly what
          makes the sum reversible.
        </p>
        <p>
          That's the whole resolution of the paradox — and it's why you'll soon
          hear about <em>separate dimensions for meaning and position</em>. The
          next two sections show why high-dimensional space has room for such
          independent directions, and how the network ends up using them.
        </p>
      </Detail>

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
