// Section 6 — what the position vectors actually are, explained from scratch.
// The anchor analogy is a binary counter: each column (bit) flips at its own
// rate, and the combination names a position uniquely. Sinusoidal PE is that
// idea made smooth — hard 0/1 bits become continuous sine waves at geometric
// frequencies, so nearby positions get similar (not identical) tags.

import { useMemo, useState } from 'react'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Slider } from '../ui/Slider'
import { Formula } from '../ui/Formula'
import { Detail } from '../ui/Detail'
import { Heatmap } from '../viz/primitives/Heatmap'
import { LinePlot, type Series } from '../viz/primitives/LinePlot'
import { sinusoidalPE, frequencyOfDim } from '../math/positional'
import { mat, at, type Mat } from '../math/types'

const WAVE_COLORS = ['#22d3ee', '#38bdf8', '#67e8f9', '#0ea5e9']

/** rows = numbers 0..n-1, columns = bits (LSB first so the left column flips fastest). */
function binaryCounter(rows: number, bits: number): Mat {
  const m = mat(rows, bits)
  for (let p = 0; p < rows; p++) {
    for (let b = 0; b < bits; b++) m.data[p * bits + b] = (p >> b) & 1
  }
  return m
}

export function SinusoidalSection() {
  const [seqLen, setSeqLen] = useState(16)
  const [dModel, setDModel] = useState(16)
  const [cursor, setCursor] = useState(4)

  const pe = useMemo(() => sinusoidalPE(seqLen, dModel), [seqLen, dModel])
  const binary = useMemo(() => binaryCounter(16, 4), [])
  const cursorPos = Math.min(cursor, seqLen - 1)

  const waves = useMemo<Series[]>(() => {
    const dims = [0, 2, 4, 6].filter((d) => d < dModel)
    return dims.map((d, i) => {
      const freq = frequencyOfDim(d, dModel)
      const points = []
      for (let p = 0; p <= seqLen - 1; p += 0.2) points.push({ x: p, y: Math.sin(p * freq) })
      return { points, color: WAVE_COLORS[i % WAVE_COLORS.length], width: 2 }
    })
  }, [seqLen, dModel])

  const cursorVec = Array.from({ length: dModel }, (_, d) => at(pe, cursorPos, d))

  return (
    <SectionShell
      id="sinusoidal"
      eyebrow="The position code"
      title="Position is written in waves"
      visual={() => (
        <Card>
          <p className="mb-2 text-sm text-prose-dim">
            the position code (row = position, column = dimension)
          </p>
          <Heatmap data={pe} mode="diverging" cell={Math.max(12, Math.min(22, 360 / dModel))} xTitle="dimension" yTitle="position" />
          <p className="mt-4 mb-2 text-sm text-prose-dim">each column is just a sine wave at its own speed</p>
          <LinePlot series={waves} xDomain={[0, seqLen - 1]} yDomain={[-1.1, 1.1]} xLabel="position" cursorX={cursorPos} height={180} />
        </Card>
      )}
    >
      <p>
        Here's the job: hand every position — 1st word, 2nd word, 3rd word — its
        own little ID vector. Two requirements. Every position must get a{' '}
        <strong>different</strong> ID (so they don't get confused), and{' '}
        <strong>nearby positions should get similar IDs</strong> (so the model
        can feel that word 5 and word 6 are close).
      </p>
      <p>
        The lazy idea — just use the number 0, 1, 2, 3, … — fails: it grows
        without limit and would tower over the small numbers in the word
        embeddings, drowning out meaning. We want something bounded that still
        counts.
      </p>

      <p>
        Borrow a trick from <strong>binary counting</strong>. Watch how the digits
        flip as you count up: the rightmost bit flips every step, the next every
        two steps, the next every four:
      </p>
      <div className="rounded-xl border border-edge bg-surface-2 p-3">
        <Heatmap data={binary} mode="sequential" cell={22} xTitle="bit (left = flips fastest)" yTitle="number" />
        <p className="mt-1 text-center text-xs text-prose-dim">
          0…15 in binary — no single column is unique, but the <em>combination</em> names each number
        </p>
      </div>
      <p>
        No single column identifies a number, yet the full <em>pattern</em> of a
        row does — uniquely. That's the key move: combine a few "wheels" spinning
        at different rates and you can count very high without any single wheel
        needing many states.
      </p>

      <p>
        Sinusoidal positional encoding is exactly this, made <strong>smooth</strong>.
        Swap the hard 0/1 bits for gentle sine waves, one per dimension, each at
        its own frequency:
      </p>
      <Formula label="pos = position · i = dimension pair · d = model size">
        PE<sub>(pos, 2i)</sub> = sin(pos / 10000<sup>2i/d</sup>)
        <br />
        PE<sub>(pos, 2i+1)</sub> = cos(pos / 10000<sup>2i/d</sup>)
      </Formula>
      <p>
        The first dimensions are fast waves (they tell neighbors apart); later
        dimensions are slow waves (they tell far-apart regions apart). Compare the
        two heatmaps on the right and left — the smooth one is just the binary
        counter with the staircase sanded off. Because the waves are smooth,
        neighbors get <em>similar</em> codes instead of an abrupt flip.
      </p>

      <Slider label="sequence length" min={4} max={32} step={1} value={seqLen} onChange={setSeqLen} />
      <Slider label="model dimension" min={4} max={48} step={2} value={dModel} onChange={setDModel} accent="position" />
      <Slider label="read position" min={0} max={seqLen - 1} step={1} value={cursorPos} onChange={setCursor} accent="position" />

      <p>
        The dashed cursor picks a position; reading every wave where it crosses
        gives that position's encoding vector:
      </p>
      <p className="font-mono text-xs leading-relaxed text-position-soft">
        PE[{cursorPos}] = [{cursorVec.slice(0, 8).map((v) => v.toFixed(2)).join(', ')}
        {dModel > 8 ? ', …' : ''}]
      </p>

      <Detail summary="Why both sine AND cosine — and why it loves relative position">
        <p>
          Pairing a sine with a cosine at each frequency turns "shift by k
          positions" into a fixed <em>rotation</em> of that pair. So{' '}
          <span className="font-mono">PE(pos + k)</span> is the same rotation of{' '}
          <span className="font-mono">PE(pos)</span> no matter where you are in
          the sentence.
        </p>
        <p>
          That's the real payoff: attention compares positions with dot products,
          and this makes "3 tokens apart" look identical everywhere. The model can
          learn <em>relative</em> distance, and it keeps working on sentences
          longer than any it saw in training.
        </p>
      </Detail>

      <Callout accent="position">
        A stack of waves — fast ones for fine position, slow ones for coarse — is
        a smooth, bounded code that gives every slot a unique, comparable ID a
        linear layer can read straight back out of the sum.
      </Callout>
    </SectionShell>
  )
}
