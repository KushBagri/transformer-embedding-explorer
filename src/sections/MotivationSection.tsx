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
  const [order, setOrder] = useState<string[]>(model.tokens)
  const [showPos, setShowPos] = useState(false)

  // keep in sync if the sentence changes elsewhere
  const words = order.length === model.tokens.length ? order : model.tokens

  return (
    <Card>
      <p className="mb-3 text-sm text-prose-dim">
        a transformer sees all tokens at once — a set, not a sequence
      </p>

      <div className="mb-5 flex min-h-24 flex-wrap items-stretch gap-2">
        {words.map((w, i) => (
          <div
            key={`${w}-${i}`}
            className="flex flex-col items-center justify-center rounded-xl bg-token/15 px-4 py-3 text-token-soft"
          >
            <span className="font-mono text-lg">{w}</span>
            {showPos && (
              <span className="mt-1 rounded bg-position/20 px-1.5 text-xs text-position-soft">
                pos {i}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Toggle label="stamp each slot with its position" checked={showPos} onChange={setShowPos} />
        <button
          type="button"
          onClick={() => setOrder(shuffled(words))}
          className="rounded-lg border border-edge bg-surface-2 px-3 py-2 text-sm text-prose hover:border-combined"
        >
          ⤮ shuffle the words
        </button>
        <p className="text-sm text-prose-dim">
          {showPos
            ? 'With position tags, shuffling changes which word sits where — order is now part of the input.'
            : 'Without position tags, a shuffle gives the model the exact same bag of vectors. Order is invisible to it.'}
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
        for free — it <em>is</em> the order of processing. The model literally
        can't see word 5 before it has walked through words 1–4.
      </p>
      <p>
        A transformer is different: it looks at <strong>every token at once</strong>,
        in parallel. That's what makes it fast and powerful — but it also means
        self-attention treats the input as an unordered <em>set</em>. To a
        transformer, <span className="font-mono text-token-soft">dog bites man</span>{' '}
        and <span className="font-mono text-token-soft">man bites dog</span> are
        the same bag of vectors. Try the shuffle.
      </p>
      <p>
        So we have to <em>hand</em> the model the order. The trick the original
        transformer uses is almost suspiciously simple: take each token's
        embedding and <strong className="text-combined-soft">add</strong> a second
        vector that says where it sits.
      </p>
      <Callout accent="neutral">
        Position isn't free here like it is in an RNN — we have to inject it. And
        the way we inject it is by addition. Which raises an obvious worry…
      </Callout>
    </SectionShell>
  )
}
