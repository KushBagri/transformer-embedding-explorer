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
        Words only mean something in context. In{' '}
        <span className="italic text-prose-bright">
          "the animal didn't cross the road because <strong>it</strong> was tired"
        </span>
        , what does <em>"it"</em> point to — the animal or the road? To resolve
        that, the word <em>"it"</em> has to <strong>look at</strong> the other
        words. Attention is the mechanism that lets every word gather information
        from the rest. Here's how it works, in three steps.
      </p>
      <ol className="flex list-decimal flex-col gap-2 pl-5 marker:text-prose-dim">
        <li>
          <strong className="text-prose-bright">Ask and offer.</strong> From its
          combined vector, each word builds a <strong>query</strong> ("what am I
          looking for?") and a <strong>key</strong> ("what do I offer?"). Both are
          just small vectors — linear projections of the embedding.
        </li>
        <li>
          <strong className="text-prose-bright">Score the matches.</strong> For
          every pair, take the dot product of one word's query with another's
          key. Aligned ⇒ high score ⇒ "you're relevant to me." A softmax turns
          each word's row of scores into an <strong>attention budget</strong> —
          percentages that add up to 100%.
        </li>
        <li>
          <strong className="text-prose-bright">Blend.</strong> Each word then
          pulls in a mix of everyone's <strong>value</strong> vectors, weighted by
          that budget — its new, context-aware version of itself.
        </li>
      </ol>
      <p>
        The grid on the right is that budget. <strong>Each row is one word
        looking</strong>; the columns are who it looks at; brighter = more
        attention. Every row sums to 1. Hover a row to trace a single word's
        attention.
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
