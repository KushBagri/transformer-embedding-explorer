// Section 2 — what "adding" actually means, in 2D you can poke. Drag the
// sliders and watch the parallelogram: the combined vector still leans toward
// both inputs, and subtracting either one recovers the other exactly.

import { useState } from 'react'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Slider } from '../ui/Slider'
import { MathInline } from '../ui/MathInline'
import { VectorArrows2D } from '../viz/primitives/VectorArrows2D'
import { ROLE_COLOR } from '../viz/primitives/ColorScale'

const fmt = (v: number) => v.toFixed(1)
const fmtVec = (v: [number, number]) => `[${v[0].toFixed(1)}, ${v[1].toFixed(1)}]`

export function AdditionSection() {
  const [token, setToken] = useState<[number, number]>([2, 1])
  const [position, setPosition] = useState<[number, number]>([-1, 2])
  const combined: [number, number] = [token[0] + position[0], token[1] + position[1]]
  const recoveredToken: [number, number] = [combined[0] - position[0], combined[1] - position[1]]

  return (
    <SectionShell
      id="addition"
      eyebrow="The addition"
      title="Adding is stacking, not blending"
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
        Two vectors add tip-to-tail into a third. The dashed parallelogram shows
        the <span className="text-combined-soft">combined</span> vector is built
        from <em>both</em> the <span className="text-token-soft">token</span> and
        the <span className="text-position-soft">position</span> — it still
        points partly toward each.
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
        Nothing was averaged away. Subtract the position back out and the token
        returns exactly:{' '}
        <MathInline>
          {fmtVec(combined)} − {fmtVec(position)} = {fmtVec(recoveredToken)}
        </MathInline>
        .
      </p>

      <Callout accent="combined">
        Addition is superposition, not compression — the parts are still in there,
        waiting to be read back out.
      </Callout>
    </SectionShell>
  )
}
