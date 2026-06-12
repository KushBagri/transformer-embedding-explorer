// Section — Q/K/V projections. The payoff the recovery + embedding scenes point
// at: query, key and value are the SAME combined vector, read three different
// ways. Each read-out is a learned matrix (a stack of the "shadow" projections),
// so q = W_Q·c, k = W_K·c, v = W_V·c. Reads the real matrices from the model.

import { useState } from 'react'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Detail } from '../ui/Detail'
import { MathInline } from '../ui/MathInline'
import { Heatmap } from '../viz/primitives/Heatmap'
import { divergingColor, absMax } from '../viz/primitives/ColorScale'
import { useModel } from '../state/modelContext'
import { row } from '../math/matrix'

const Q_COLOR = '#fb7185' // rose
const K_COLOR = '#34d399' // emerald
const V_COLOR = '#38bdf8' // sky
const COMBINED = '#a78bfa'

/** A vector drawn as a strip of diverging-colored cells. */
function VecStrip({ values, ring }: { values: number[]; ring?: string }) {
  const m = absMax(Float32Array.from(values)) || 1e-6
  return (
    <div className="overflow-x-auto">
      <div
        className="inline-flex gap-0.5 rounded-md p-1"
        style={ring ? { boxShadow: `inset 0 0 0 1.5px ${ring}66` } : undefined}
      >
        {values.map((v, i) => (
          <div
            key={i}
            className="h-5 w-5 shrink-0 rounded-sm"
            style={{ background: divergingColor(v, m) }}
            title={v.toFixed(2)}
          />
        ))}
      </div>
    </div>
  )
}

function Lane({
  letter,
  name,
  role,
  color,
  values,
}: {
  letter: string
  name: string
  role: string
  color: string
  values: number[]
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-sm font-bold"
        style={{ color, backgroundColor: `${color}22`, boxShadow: `inset 0 0 0 1px ${color}55` }}
      >
        {letter}
      </span>
      <div className="min-w-0">
        <p className="text-sm">
          <span className="font-medium text-prose-bright">{name}</span>{' '}
          <span className="text-prose-dim">— {role}</span>
        </p>
        <VecStrip values={values} ring={color} />
      </div>
    </div>
  )
}

export function QKVSection() {
  const model = useModel()
  const count = model.tokens.length
  const [sel, setSel] = useState(0)
  const i = count ? Math.min(sel, count - 1) : 0

  const combined = count ? Array.from(row(model.combined, i)) : []
  const q = count ? Array.from(row(model.q, i)) : []
  const k = count ? Array.from(row(model.k, i)) : []
  const v = count ? Array.from(row(model.v, i)) : []

  return (
    <SectionShell
      id="qkv"
      eyebrow="The read-out"
      title="Query, key and value are one vector, read three ways"
      visual={() => (
        <Card>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {model.tokens.map((t, idx) => (
              <button
                key={`${t}-${idx}`}
                type="button"
                onClick={() => setSel(idx)}
                className={`rounded-md px-2 py-1 font-mono text-sm transition-colors ${
                  idx === i
                    ? 'bg-combined/20 text-combined-soft ring-1 ring-combined/60'
                    : 'bg-white/5 text-prose hover:bg-white/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <p className="mb-1 text-sm text-prose-dim">
            combined vector for{' '}
            <span className="font-mono text-combined-soft">{model.tokens[i] ?? '—'}</span>
          </p>
          <VecStrip values={combined} ring={COMBINED} />

          <p className="my-3 text-center font-mono text-xs text-prose-dim">
            × W_Q &nbsp; × W_K &nbsp; × W_V &nbsp;↓
          </p>

          <div className="flex flex-col gap-4">
            <Lane letter="Q" name="query" role="what it's looking for" color={Q_COLOR} values={q} />
            <Lane letter="K" name="key" role="what it offers" color={K_COLOR} values={k} />
            <Lane letter="V" name="value" role="what it carries" color={V_COLOR} values={v} />
          </div>

          <div className="mt-7 border-t border-white/10 pt-5">
            <Detail summary="Show the learned read-out matrices">
            <p className="text-sm">
              Each output cell is one row of a matrix dotted with the combined
              vector — a projection. The matrix is the stack of read-out
              directions the network learns.
            </p>
            <div className="space-y-3">
              {([['W_Q', model.projections.wq], ['W_K', model.projections.wk], ['W_V', model.projections.wv]] as const).map(
                ([name, w]) => (
                  <div key={name}>
                    <p className="mb-1 font-mono text-xs text-prose-dim">{name} (d_head × d_model)</p>
                    <Heatmap data={w} mode="diverging" cell={14} />
                  </div>
                ),
              )}
            </div>
            </Detail>
          </div>
        </Card>
      )}
    >
      <p>
        In the attention section, each word raised a <em>question</em>, wore a{' '}
        <em>name-tag</em>, and carried some <em>content</em>. Where do those three
        come from? They're all made from the word's single{' '}
        <span className="text-combined-soft">combined</span> vector — read three
        different ways.
      </p>
      <p>
        "Read" here means exactly the <strong>shadow</strong> from a moment ago: a
        dot product that projects the combined vector along a chosen direction.
        Stack a handful of those read-outs into a matrix and you get a whole short
        vector out. That matrix —{' '}
        <span style={{ color: Q_COLOR }}>W_Q</span>,{' '}
        <span style={{ color: K_COLOR }}>W_K</span>, or{' '}
        <span style={{ color: V_COLOR }}>W_V</span> — is what the network learns.
      </p>
      <p>
        Same input, three different read-out matrices, three different outputs.
        Pick any token in the panel to watch its combined vector become a{' '}
        <span style={{ color: Q_COLOR }}>query</span>,{' '}
        <span style={{ color: K_COLOR }}>key</span>, and{' '}
        <span style={{ color: V_COLOR }}>value</span>.
      </p>
      <p>
        Because the read-outs are just chosen directions, a query can be tuned to
        pick up the <span className="text-position-soft">position</span> part of
        the sum or the <span className="text-token-soft">meaning</span> part —
        that's how one head learns "look at the token before me" while another
        learns "look at related words."
      </p>
      <p>
        Take the <MathInline>q</MathInline> of one word and the{' '}
        <MathInline>k</MathInline> of another, dot them together for a relevance
        score, do it for every pair, and softmax each row — and you have exactly
        the attention grid in the next section.
      </p>

      <Detail summary="Going deeper: why a dot product, the √d scaling, and many heads">
        <p>
          <strong className="text-prose-bright">Why a dot product means "relevant".</strong>{' '}
          The score is <MathInline>q · k = |q| |k| cos θ</MathInline>, where θ is
          the angle between the query and the key. It's largest when they point
          the <em>same</em> way. So a query is literally an arrow pointing toward
          the kind of key it wants: aligned keys score high, perpendicular keys
          score ~0 (the orthogonality idea again), opposite keys score negative.
          After the softmax, the aligned keys collect most of the attention.
        </p>
        <p>
          <strong className="text-prose-bright">The √d scaling.</strong> Before the
          softmax, scores are divided by <MathInline>√d_head</MathInline>. A dot
          product is a sum of <MathInline>d_head</MathInline> little products, so
          its size tends to grow like <MathInline>√d_head</MathInline>. Left
          unscaled, big heads produce big scores, and a softmax over big scores
          collapses to almost all-or-nothing — one token gets ~100%, and the
          gradients that train the model vanish. Dividing by{' '}
          <MathInline>√d_head</MathInline> keeps the scores around unit size so
          attention stays soft and trainable.
        </p>
        <p>
          <strong className="text-prose-bright">Many heads at once.</strong> A real
          layer doesn't use one set of <MathInline>W_Q/W_K/W_V</MathInline> — it
          uses several (say 8), each projecting into its own little subspace
          (<MathInline>d_head = d_model / heads</MathInline>). Each head is an
          independent set of read-out directions, so <em>one</em> head can
          specialise in "look at the previous token" (positional) while{' '}
          <em>another</em> does "look at related words" (semantic), in parallel.
          Their outputs are concatenated and mixed by one more matrix. That's
          multi-head attention.
        </p>
        <p>
          <strong className="text-prose-bright">Real sizes vs. this toy.</strong> A
          production model runs <MathInline>d_model ≈ 512–1024</MathInline>,{' '}
          8–16 heads, <MathInline>d_head ≈ 64</MathInline>. This explorer uses{' '}
          <MathInline>d_model = 16</MathInline>, a single head, and{' '}
          <MathInline>d_head = 8</MathInline> — identical machinery, numbers small
          enough that you can actually read every cell.
        </p>
      </Detail>

      <Callout accent="combined">
        Query, key and value are one combined vector read three ways. Those
        read-out directions are the model's main learned knobs — everything
        upstream just made sure meaning and position were still in there to read.
      </Callout>
    </SectionShell>
  )
}
