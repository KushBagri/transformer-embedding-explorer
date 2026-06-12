// Section 8 — the payoff. Q·K → softmax → attention weights, computed live from
// the shared model. Edit the sentence, change the temperature, and flip
// positional encoding off to watch position-driven structure appear and vanish.

import { useState } from 'react'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Slider } from '../ui/Slider'
import { Toggle } from '../ui/Toggle'
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
        Every token builds a <em>query</em> and a <em>key</em> by a linear
        projection of its combined vector. Their dot products, softmaxed, decide
        who attends to whom. Hover a row to trace one query.
      </p>

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
