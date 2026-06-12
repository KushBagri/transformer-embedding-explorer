// Section 6 — what the position vectors actually are. Sinusoids at
// geometrically-spaced frequencies: fast wheels for fine position, slow wheels
// for coarse. The heatmap shows the whole table; the curves show that each
// dimension is just a sine wave the position cursor reads off.

import { useMemo, useState } from 'react'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Slider } from '../ui/Slider'
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
        The original transformer doesn't learn the position vectors — it builds
        them from sines and cosines. Each dimension oscillates at its own
        frequency, so every position gets a unique fingerprint.
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

      <Callout accent="position">
        Low dimensions barely move between neighbors; high dimensions spin fast.
        Together they encode position in a way a linear layer can read straight
        out of the sum.
      </Callout>
    </SectionShell>
  )
}
