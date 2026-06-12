// Section 6 — what the position vectors actually are. Sinusoids at
// geometrically-spaced frequencies: fast wheels for fine position, slow wheels
// for coarse. The heatmap shows the whole table; the curves show that each
// dimension is just a sine wave the position cursor reads off.

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
import { at } from '../math/types'

const WAVE_COLORS = ['#22d3ee', '#38bdf8', '#67e8f9', '#0ea5e9']

export function SinusoidalSection() {
  const [seqLen, setSeqLen] = useState(16)
  const [dModel, setDModel] = useState(16)
  const [cursor, setCursor] = useState(4)

  const pe = useMemo(() => sinusoidalPE(seqLen, dModel), [seqLen, dModel])
  const cursorPos = Math.min(cursor, seqLen - 1)

  // Continuous sine curves for the first few (even) dimensions.
  const waves = useMemo<Series[]>(() => {
    const dims = [0, 2, 4, 6].filter((d) => d < dModel)
    return dims.map((d, i) => {
      const freq = frequencyOfDim(d, dModel)
      const points = []
      for (let p = 0; p <= seqLen - 1; p += 0.2) {
        points.push({ x: p, y: Math.sin(p * freq) })
      }
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
          <p className="mb-2 text-sm text-prose-dim">positional encoding table (position × dimension)</p>
          <Heatmap data={pe} mode="diverging" cell={Math.max(12, Math.min(22, 360 / dModel))} xTitle="dimension" yTitle="position" />
          <p className="mt-4 mb-2 text-sm text-prose-dim">the first few dimensions are just sine waves</p>
          <LinePlot series={waves} xDomain={[0, seqLen - 1]} yDomain={[-1.1, 1.1]} xLabel="position" cursorX={cursorPos} height={180} />
        </Card>
      )}
    >
      <p>
        The original transformer doesn't <em>learn</em> the position vectors — it
        builds them from sines and cosines, one frequency per dimension pair:
      </p>

      <Formula label="pos = position in the sentence · i = dimension pair · d = model size">
        PE<sub>(pos, 2i)</sub> = sin(pos / 10000<sup>2i/d</sup>)
        <br />
        PE<sub>(pos, 2i+1)</sub> = cos(pos / 10000<sup>2i/d</sup>)
      </Formula>

      <p>
        Think of an <strong>odometer</strong>, or a row of clock hands. The first
        dimensions spin fast (they tick over every couple of positions); later
        dimensions spin slower and slower. Read all the hands together and the
        exact combination is unique to one position — just like 0–9 digits on
        different wheels combine to name one number on an odometer.
      </p>

      <Slider label="sequence length" min={4} max={32} step={1} value={seqLen} onChange={setSeqLen} />
      <Slider label="model dimension" min={4} max={48} step={2} value={dModel} onChange={setDModel} accent="position" />
      <Slider label="read position" min={0} max={seqLen - 1} step={1} value={cursorPos} onChange={setCursor} accent="position" />

      <p>
        The dashed cursor picks a position; reading every wave at that line gives
        that position's encoding vector:
      </p>
      <p className="font-mono text-xs leading-relaxed text-position-soft">
        PE[{cursorPos}] = [{cursorVec.slice(0, 8).map((v) => v.toFixed(2)).join(', ')}
        {dModel > 8 ? ', …' : ''}]
      </p>

      <Detail summary="Why both sine and cosine — and why it loves relative position">
        <p>
          Pairing sine with cosine at each frequency turns "shift by k positions"
          into a fixed <em>rotation</em> of the encoding. So{' '}
          <span className="font-mono">PE(pos + k)</span> is a linear function of{' '}
          <span className="font-mono">PE(pos)</span> — the same rotation for every
          pos.
        </p>
        <p>
          That's the payoff: attention compares positions with dot products, and
          this construction makes "3 tokens apart" look the same everywhere in the
          sentence. The model can learn <em>relative</em> offsets, and it
          generalizes to sentence lengths it never saw in training.
        </p>
      </Detail>

      <Callout accent="position">
        Slow wheels for coarse position, fast wheels for fine — a smooth, bounded
        code that a single linear layer can read straight back out of the sum.
      </Callout>
    </SectionShell>
  )
}
