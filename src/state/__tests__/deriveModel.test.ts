import { describe, it, expect } from 'vitest'
import { deriveModel, type ModelInputs } from '../modelContext'
import { PEKind } from '../../math/types'

const base: ModelInputs = {
  tokens: ['the', 'cat', 'sat'],
  dModel: 16,
  dHead: 8,
  seed: 1,
  peKind: PEKind.Sinusoidal,
  temperature: 1,
}

const sumRow = (m: { data: Float32Array; cols: number }, i: number) => {
  let s = 0
  for (let j = 0; j < m.cols; j++) s += m.data[i * m.cols + j]
  return s
}

describe('deriveModel', () => {
  it('produces correctly shaped matrices for a normal sentence', () => {
    const d = deriveModel(base)
    expect(d.tokenEmb.rows).toBe(3)
    expect(d.tokenEmb.cols).toBe(16)
    expect(d.q.cols).toBe(8)
    expect(d.attnWeights.rows).toBe(3)
    expect(d.attnWeights.cols).toBe(3)
    for (let i = 0; i < 3; i++) expect(sumRow(d.attnWeights, i)).toBeCloseTo(1)
  })

  it('adds positional encoding for the sinusoidal kind', () => {
    const d = deriveModel(base)
    // combined = tokenEmb + posEnc, so the difference is exactly posEnc.
    for (let i = 0; i < d.combined.data.length; i++) {
      expect(d.combined.data[i] - d.tokenEmb.data[i]).toBeCloseTo(d.posEnc.data[i], 5)
    }
  })

  it('leaves the embedding untouched when PE is off', () => {
    const d = deriveModel({ ...base, peKind: PEKind.None })
    expect(Array.from(d.combined.data)).toEqual(Array.from(d.tokenEmb.data))
  })

  it('does not throw for RoPE or ALiBi', () => {
    expect(() => deriveModel({ ...base, peKind: PEKind.RoPE })).not.toThrow()
    expect(() => deriveModel({ ...base, peKind: PEKind.ALiBi })).not.toThrow()
  })

  it('handles an empty sentence without throwing', () => {
    const d = deriveModel({ ...base, tokens: [] })
    expect(d.tokenEmb.rows).toBe(0)
    expect(d.attnWeights.rows).toBe(0)
    expect(d.output.rows).toBe(0)
  })
})
