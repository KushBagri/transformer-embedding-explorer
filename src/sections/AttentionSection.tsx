// Section 8 — the payoff. Q·K → softmax → attention weights, computed live from
// the shared model. Edit the sentence, change the temperature, and flip
// positional encoding off to watch position-driven structure appear and vanish.

import { useState } from 'react'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Slider } from '../ui/Slider'
import { Toggle } from '../ui/Toggle'
import { Detail } from '../ui/Detail'
import { Heatmap } from '../viz/primitives/Heatmap'
import { useModel } from '../state/modelContext'
import { PEKind } from '../math/types'

export function AttentionSection() {
  const model = useModel()
  const [text, setText] = useState(model.tokens.join(' '))
  const [hover, setHover] = useState<number | null>(null)

  const peOn = model.peKind !== PEKind.None

  return (
    <SectionShell
      id="attention"
      eyebrow="The payoff"
      title="Attention reads the position back out"
      visual={() => (
        <Card>
          <p className="mb-2 text-sm text-prose-dim">
            attention weights — row {hover ?? '·'} {hover != null ? `(${model.tokens[hover]})` : ''}
          </p>
          <Heatmap
            data={model.attnWeights}
            mode="sequential"
            cell={Math.max(20, Math.min(40, 360 / Math.max(model.tokens.length, 1)))}
            rowLabels={model.tokens}
            colLabels={model.tokens}
            highlightRow={hover}
            onHoverRow={setHover}
            xTitle="key (attended to)"
            yTitle="query"
          />
          <p className="mt-2 text-center text-xs text-prose-dim">
            each row sums to 1 · brighter = more attention
          </p>
        </Card>
      )}
    >
      <p>
        Picture every token in a room. Each one holds up a{' '}
        <strong>query</strong> — "here's what I'm looking for" — and a{' '}
        <strong>key</strong> — "here's what I offer." Both are just linear
        projections of that token's combined vector.
      </p>
      <p>
        To decide how much token <em>i</em> should listen to token <em>j</em>,
        take the <strong>dot product</strong> of i's query with j's key: aligned
        directions score high (relevant), unaligned score low. Softmax turns each
        row of scores into an attention budget that sums to 1 — a row says "I
        spend this fraction of my attention on each other token." The token then
        pulls in a blend of everyone's <strong>value</strong> vectors, weighted by
        that budget. Hover a row to trace one token's budget.
      </p>

      <Detail summary="Where does position come into this?">
        <p>
          Because position survived the addition, a token's query and key can
          depend on <em>where</em> it is, not just <em>what</em> it is. That's
          how a head can learn a rule like "attend to the token just before me" —
          a purely positional pattern, visible as a stripe just off the diagonal.
        </p>
        <p>
          Strip position out and queries/keys depend on content alone. Attention
          becomes permutation-invariant: shuffle the words and the pattern follows
          them, because the model has no idea where anything sits.
        </p>
      </Detail>

      <label className="block">
        <span className="mb-1 block text-sm text-prose">sentence</span>
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            model.setSentence(e.target.value)
          }}
          className="w-full rounded-lg border border-edge bg-surface-2 px-3 py-2 font-mono text-sm text-prose-bright outline-none focus:border-combined"
        />
      </label>

      <Slider
        label="softmax temperature"
        min={0.2}
        max={4}
        step={0.1}
        value={model.temperature}
        format={(v) => v.toFixed(1)}
        onChange={(t) => model.setInputs({ temperature: t })}
      />

      <Toggle
        label="positional encoding"
        checked={peOn}
        onChange={(on) => model.setInputs({ peKind: on ? PEKind.Sinusoidal : PEKind.None })}
      />

      <p>
        Turn positional encoding <strong>off</strong> and the map flattens toward
        a position-blind blur — the order information that survived the addition
        is exactly what attention was using.
      </p>

      <Callout accent="combined">
        Because adding never destroyed the position, the network can recover it
        with a single linear projection — and attend by where, not just what.
      </Callout>
    </SectionShell>
  )
}
