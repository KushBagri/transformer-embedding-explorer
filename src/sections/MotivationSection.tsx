// Section 0a — purpose of the whole page. RNNs read tokens one at a time, so
// order is baked into the *order of processing*. Transformers read every token
// at once (self-attention is a set operation — permutation invariant), so order
// has to be supplied explicitly. The chosen way to supply it: add a position
// vector to each token. That sets up the paradox that follows.

import { useState } from 'react'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Toggle } from '../ui/Toggle'
import { useModel } from '../state/modelContext'

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function MotivationVisual() {
  const model = useModel()
  const [custom, setCustom] = useState<string[] | null>(null)
  const [showPos, setShowPos] = useState(false)
  const words = custom ?? model.tokens

  return (
    <Card>
      <p className="mb-4 text-sm text-prose-dim">
        the sentence as a transformer receives it — every token at once
      </p>

      <div className="mb-5 flex flex-wrap items-end gap-2">
        {words.map((w, i) => (
          <div key={`${w}-${i}`} className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider text-prose-dim">
              slot {i}
            </span>
            <div
              className={`flex w-20 flex-col items-center rounded-xl border px-2 py-3 transition-colors ${
                showPos
                  ? 'border-combined/60 bg-combined/15'
                  : 'border-token/50 bg-token/15'
              }`}
            >
              <span className="font-mono text-base text-token-soft">{w}</span>
              {showPos && (
                <span className="mt-2 rounded bg-position/20 px-1.5 py-0.5 font-mono text-[11px] text-position-soft">
                  + pos {i}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-edge pt-4">
        <Toggle
          label="add a position vector to each token"
          checked={showPos}
          onChange={setShowPos}
        />
        <button
          type="button"
          onClick={() => setCustom(shuffled(words))}
          className="self-start rounded-lg border border-edge bg-surface-2 px-3 py-1.5 text-sm text-prose transition-colors hover:border-combined hover:text-prose-bright"
        >
          ⤮ shuffle the word order
        </button>
        <p className="text-sm leading-relaxed text-prose-dim">
          {showPos
            ? 'Each token now carries which slot it came from. Shuffle and slot 0 holds a different word — the input genuinely changed.'
            : 'Without position, a shuffle hands the model the exact same bag of vectors. It literally cannot tell the orders apart.'}
        </p>
      </div>
    </Card>
  )
}

export function MotivationSection() {
  return (
    <SectionShell
      id="why-add"
      eyebrow="Why this page exists"
      title="A transformer has no built-in sense of order"
      visual={() => <MotivationVisual />}
    >
      <p>
        An RNN reads a sentence one word at a time, left to right. Order comes
        for free — it <em>is</em> the order of reading. The model can't reach
        word 5 until it has walked through words 1–4.
      </p>
      <p>
        A transformer is different: it looks at <strong>every token at once</strong>,
        in parallel. That's what makes it fast — but it also means attention
        treats the input as an unordered <em>set</em>. To a transformer,{' '}
        <span className="font-mono text-token-soft">dog bites man</span> and{' '}
        <span className="font-mono text-token-soft">man bites dog</span> start out
        as the same bag of vectors. Hit shuffle and watch.
      </p>
      <p>
        So we have to <em>hand</em> the model the order. The original
        transformer's fix is almost suspiciously simple: take each token's
        embedding and <strong className="text-combined-soft">add</strong> a second
        vector that says which slot it sits in. Flip the toggle to attach those.
      </p>
      <Callout accent="neutral">
        Order is free in an RNN. In a transformer we have to inject it — and the
        way we inject it is by addition. Which raises an obvious worry…
      </Callout>
    </SectionShell>
  )
}
