// Section — the cleanest proof that adding lost nothing. When attention compares
// two words it takes ONE dot product of a query and a key. But both are built
// from combined = meaning + position, so that single dot product silently splits
// into FOUR (the schoolbook (a+b)(c+d) = ac+ad+bc+bd): meaning↔meaning,
// meaning↔position, position↔meaning, position↔position. We compute all four
// LIVE from the real model — they sum, cell for cell, back to the full score. If
// information had been destroyed in the sum, three of these channels could not
// exist. Flip position off and three of them vanish to zero before your eyes.

import { useMemo, useState } from 'react'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Toggle } from '../ui/Toggle'
import { Detail } from '../ui/Detail'
import { Analogy } from '../ui/Analogy'
import { SubHeading } from '../ui/SubHeading'
import { MathInline } from '../ui/MathInline'
import { Heatmap } from '../viz/primitives/Heatmap'
import { absMax, ROLE_COLOR, QKV_COLOR } from '../viz/primitives/ColorScale'
import { useModel } from '../state/modelContext'
import { PEKind, project, matmul, transpose, addMat, type Mat } from '../math'

const { token: AMBER, position: CYAN, combined: VIOLET } = ROLE_COLOR

interface Panel {
  key: string
  data: Mat
  from: string
  to: string
  fromColor: string
  toColor: string
  gloss: string
}

function PairLabel({ panel }: { panel: Panel }) {
  return (
    <div className="mb-1 flex flex-wrap items-baseline gap-x-1.5 text-[11px]">
      <span style={{ color: panel.fromColor }}>{panel.from}</span>
      <span className="text-prose-dim">→</span>
      <span style={{ color: panel.toColor }}>{panel.to}</span>
      <span className="text-prose-dim">· {panel.gloss}</span>
    </div>
  )
}

/** A row of token chips; the selected one is highlighted in `color`. */
function ChipRow({
  tokens,
  value,
  onPick,
  color,
}: {
  tokens: string[]
  value: number
  onPick: (i: number) => void
  color: string
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {tokens.map((t, idx) => (
        <button
          key={`${t}-${idx}`}
          type="button"
          onClick={() => onPick(idx)}
          className="rounded px-1.5 py-0.5 font-mono text-xs transition-colors"
          style={
            idx === value
              ? { color, background: `${color}22`, boxShadow: `inset 0 0 0 1px ${color}77` }
              : { color: '#9794ab', background: 'rgba(255,255,255,0.04)' }
          }
        >
          {t}
        </button>
      ))}
    </div>
  )
}

export function FourTermSection() {
  const model = useModel()
  const count = model.tokens.length
  const peOn = model.peKind === PEKind.Sinusoidal
  const [qi, setQi] = useState(0)
  const [kj, setKj] = useState(0)
  const qSel = count ? Math.min(qi, count - 1) : 0
  const kSel = count ? Math.min(kj, count - 1) : 0

  const { cc, cp, pc, pp, total, sharedMax } = useMemo(() => {
    const wq = model.projections.wq
    const wk = model.projections.wk
    // Split the query/key into the part that came from meaning and the part that
    // came from position, then form every pairing. project() is linear, so
    // cc+cp+pc+pp is exactly the real Q·Kᵀ score (when PE is additive).
    const qMean = project(model.tokenEmb, wq)
    const qPos = project(model.posEnc, wq)
    const kMean = project(model.tokenEmb, wk)
    const kPos = project(model.posEnc, wk)
    const cc = matmul(qMean, transpose(kMean))
    const cp = matmul(qMean, transpose(kPos))
    const pc = matmul(qPos, transpose(kMean))
    const pp = matmul(qPos, transpose(kPos))
    const total = addMat(addMat(cc, cp), addMat(pc, pp))
    const sharedMax =
      Math.max(absMax(total.data), absMax(cc.data), absMax(cp.data), absMax(pc.data), absMax(pp.data)) || 1
    return { cc, cp, pc, pp, total, sharedMax }
  }, [model.tokenEmb, model.posEnc, model.projections])

  const panels: Panel[] = [
    { key: 'cc', data: cc, from: 'meaning', to: 'meaning', fromColor: AMBER, toColor: AMBER, gloss: 'are they related?' },
    { key: 'cp', data: cp, from: 'meaning', to: 'position', fromColor: AMBER, toColor: CYAN, gloss: 'content seeks a spot' },
    { key: 'pc', data: pc, from: 'position', to: 'meaning', fromColor: CYAN, toColor: AMBER, gloss: 'spot seeks content' },
    { key: 'pp', data: pp, from: 'position', to: 'position', fromColor: CYAN, toColor: CYAN, gloss: 'how far apart?' },
  ]

  const cellAt = (m: Mat) => (count ? m.data[qSel * m.cols + kSel] : 0)
  const smallCell = Math.max(15, Math.min(26, 150 / Math.max(count, 1)))
  const bigCell = Math.max(18, Math.min(34, 220 / Math.max(count, 1)))

  const terms = [
    { label: 'meaning ↔ meaning', v: cellAt(cc), color: AMBER },
    { label: 'meaning ↔ position', v: cellAt(cp), color: VIOLET },
    { label: 'position ↔ meaning', v: cellAt(pc), color: VIOLET },
    { label: 'position ↔ position', v: cellAt(pp), color: CYAN },
  ]
  const sum = cellAt(total)

  return (
    <SectionShell
      id="four-term"
      eyebrow="The cleanest proof"
      title="One comparison, four questions at once"
      visual={() => (
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm text-prose-dim">the full score, split four ways</p>
            <div className="w-36">
              <Toggle
                label="position"
                checked={peOn}
                onChange={(on) => model.setInputs({ peKind: on ? PEKind.Sinusoidal : PEKind.None })}
              />
            </div>
          </div>

          <div className="rounded-xl border border-edge bg-surface-2 p-3">
            <p className="mb-1 text-center font-mono text-xs text-combined-soft">
              full comparison score &nbsp;Q · Kᵀ
            </p>
            <div className="flex justify-center">
              <Heatmap
                data={total}
                mode="diverging"
                max={sharedMax}
                cell={bigCell}
                rowLabels={model.tokens}
                colLabels={model.tokens}
                highlightRow={qSel}
                highlightCol={kSel}
                xTitle="key (looked at)"
                yTitle="query"
              />
            </div>
          </div>

          <p className="my-2 text-center font-mono text-xs text-prose-dim">= add up the four channels ↓</p>

          <div className="grid grid-cols-2 gap-3">
            {panels.map((p) => (
              <div key={p.key} className="rounded-lg border border-edge bg-surface-2 p-2">
                <PairLabel panel={p} />
                <div className="flex justify-center">
                  <Heatmap
                    data={p.data}
                    mode="diverging"
                    max={sharedMax}
                    cell={smallCell}
                    highlightRow={qSel}
                    highlightCol={kSel}
                  />
                </div>
              </div>
            ))}
          </div>

          {count > 0 && (
            <div className="mt-4 border-t border-white/10 pt-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-12 shrink-0 text-xs text-prose-dim">query</span>
                  <ChipRow tokens={model.tokens} value={qSel} onPick={setQi} color={VIOLET} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 shrink-0 text-xs text-prose-dim">key</span>
                  <ChipRow tokens={model.tokens} value={kSel} onPick={setKj} color={VIOLET} />
                </div>
              </div>

              <p className="mt-3 text-xs text-prose-dim">
                score for{' '}
                <span className="font-mono text-combined-soft">{model.tokens[qSel]}</span> looking at{' '}
                <span className="font-mono text-combined-soft">{model.tokens[kSel]}</span> =
              </p>
              <div className="mt-1 flex flex-col gap-1 font-mono text-xs">
                {terms.map((t) => (
                  <div key={t.label} className="flex items-center justify-between">
                    <span style={{ color: t.color }}>{t.label}</span>
                    <span style={{ color: t.color }}>{t.v >= 0 ? `+${t.v.toFixed(2)}` : t.v.toFixed(2)}</span>
                  </div>
                ))}
                <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-1 text-prose-bright">
                  <span>= full score</span>
                  <span>{sum.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    >
      <p>
        We've shown the sum still <em>holds</em> meaning and position, and that a
        learned tuner can read either one back out. Here is the cleanest proof of
        all that nothing was lost — and it falls out of arithmetic you already did
        in school.
      </p>
      <p>
        Recall how attention compares two words: it takes the{' '}
        <span style={{ color: QKV_COLOR.query }}>query</span> of one and the{' '}
        <span style={{ color: QKV_COLOR.key }}>key</span> of another and multiplies
        them together — a single <strong>dot product</strong> that scores "how
        much should this word look at that one?" But the query and the key are both
        built from the <span className="text-combined-soft">combined</span> vector,
        which is <span className="text-token-soft">meaning</span> +{' '}
        <span className="text-position-soft">position</span>. So watch what that one
        multiplication actually contains.
      </p>

      <SubHeading>One dot product, secretly four</SubHeading>
      <p>
        In school you learned to expand{' '}
        <MathInline>(a + b)(c + d) = ac + ad + bc + bd</MathInline> — four pieces.
        The attention score is exactly that, where{' '}
        <span className="text-token-soft">a</span> is the query's meaning part,{' '}
        <span className="text-position-soft">b</span> is the query's position part,{' '}
        <span className="text-token-soft">c</span> is the key's meaning part, and{' '}
        <span className="text-position-soft">d</span> is the key's position part:
      </p>
      <div className="rounded-xl border border-edge bg-surface-2 p-3 font-mono text-xs leading-relaxed text-prose">
        score = (q_meaning + q_position) · (k_meaning + k_position)
        <br />
        &nbsp;&nbsp;= q_meaning · k_meaning &nbsp;&nbsp;&nbsp;← are the two words related?
        <br />
        &nbsp;&nbsp;+ q_meaning · k_position &nbsp;← does this content want a certain spot?
        <br />
        &nbsp;&nbsp;+ q_position · k_meaning &nbsp;← does this spot want certain content?
        <br />
        &nbsp;&nbsp;+ q_position · k_position &nbsp;← how far apart are the two words?
      </div>
      <p>
        The single comparison quietly answers <strong>four</strong> different
        questions at once. And it gets all four <em>for free</em>, because the sum
        carried both ingredients in and the multiplication fans them out again.
      </p>

      <Analogy label="Picture this — two badges each">
        <p>
          Every word wears two badges: a{' '}
          <span className="text-token-soft">meaning</span> badge and a{' '}
          <span className="text-position-soft">position</span> badge. When one word
          sizes up another, there are exactly four badge-to-badge comparisons it
          could make — my meaning vs. your meaning, my meaning vs. your position,
          and so on.
        </p>
        <p>
          A dot product doesn't pick one. It quietly runs <strong>all four</strong>{' '}
          and adds them into a single number. Different attention heads then lean on
          whichever of the four they find useful.
        </p>
      </Analogy>

      <SubHeading>The proof: the four add back to the whole</SubHeading>
      <p>
        The panel computes all four channels live, from the real model. The big
        grid on top is the full score; the four small grids below are the four
        questions. Here's the claim you can check yourself:{' '}
        <strong className="text-combined-soft">
          the four small grids add up, square for square, to the big one
        </strong>
        . Nothing spills, nothing is left over.
      </p>
      <p>
        Pick a <span className="text-prose-bright">query</span> word and a{' '}
        <span className="text-prose-bright">key</span> word under the grids. The
        four channel values for that square appear, and their sum equals the full
        score for that pair — exactly. If the addition had blurred meaning and
        position together, three of these four channels couldn't even exist as
        separate, readable numbers. They do. So the information was never lost; it
        was only <em>folded</em>, and multiplying unfolds it.
      </p>

      <SubHeading>Flip position off and three channels go blank</SubHeading>
      <p>
        Here's the cleanest demonstration. Toggle{' '}
        <strong className="text-position-soft">position</strong> off. The position
        part of every vector becomes zero, so the three channels that touch
        position —{' '}
        <span className="text-position-soft">meaning↔position</span>,{' '}
        <span className="text-position-soft">position↔meaning</span>, and{' '}
        <span className="text-position-soft">position↔position</span> — flatten to a
        single <strong>blank, signal-less colour</strong>: every cell in them drops
        to exactly zero. Watch the four numbers under the grids — three of them snap
        to <span className="font-mono">+0.00</span>. Only{' '}
        <span className="text-token-soft">meaning↔meaning</span> keeps any structure,
        and the full score collapses onto it.
      </p>
      <p>
        That is direct, on-screen proof of where order information lives: it rides
        entirely in the position part we added, and the moment that part is gone,
        every position-aware comparison the model could make vanishes with it.
        Turn it back on and the three channels light up again.
      </p>

      <Detail summary="Dig deeper: the same expansion in matrix form">
        <p>
          Stack every word's query into a matrix <MathInline>Q</MathInline> and
          every key into <MathInline>K</MathInline>. Because each input is{' '}
          <MathInline>combined = M + P</MathInline> (meaning plus position) and
          projecting is linear, <MathInline>Q = M·Wq + P·Wq</MathInline> and{' '}
          <MathInline>K = M·Wk + P·Wk</MathInline>. The full score matrix is then
        </p>
        <p className="font-mono text-xs leading-relaxed text-prose">
          Q·Kᵀ = (M·Wq)(M·Wk)ᵀ + (M·Wq)(P·Wk)ᵀ + (P·Wq)(M·Wk)ᵀ + (P·Wq)(P·Wk)ᵀ
        </p>
        <p>
          — the four grids in the panel, in order. Their elementwise sum is{' '}
          <MathInline>Q·Kᵀ</MathInline> identically, which is why the numbers under
          the grids always balance. (In this explorer the score shown is the raw{' '}
          <MathInline>Q·Kᵀ</MathInline>; attention then divides by{' '}
          <MathInline>√d</MathInline> and softmaxes each row to get the weight grid
          in the next section.)
        </p>
      </Detail>

      <Callout accent="combined">
        A single dot product unpacks the sum into four relationships — meaning with
        meaning, position with position, and both crossings — and they add back to
        the whole exactly. Adding didn't destroy the parts; it folded them, and
        attention does the unfolding on every comparison.
      </Callout>
    </SectionShell>
  )
}
