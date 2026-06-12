import { describe, it, expect } from 'vitest'
import { at } from '../types'
import { sinusoidalPE, frequencyOfDim } from '../positional'

describe('sinusoidal positional encoding', () => {
  it('has shape seqLen × dModel', () => {
    const pe = sinusoidalPE(10, 16)
    expect(pe.rows).toBe(10)
    expect(pe.cols).toBe(16)
  })

  it('all values lie in [-1, 1]', () => {
    const pe = sinusoidalPE(32, 16)
    pe.data.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(-1)
      expect(v).toBeLessThanOrEqual(1)
    })
  })

  it('position 0 is sin=0 / cos=1 alternating', () => {
    const pe = sinusoidalPE(4, 8)
    for (let dim = 0; dim < 8; dim++) {
      expect(at(pe, 0, dim)).toBeCloseTo(dim % 2 === 0 ? 0 : 1)
    }
  })

  it('dimension 0 follows sin(pos) (frequency 1)', () => {
    const pe = sinusoidalPE(5, 8)
    expect(frequencyOfDim(0, 8)).toBeCloseTo(1)
    for (let pos = 0; pos < 5; pos++) {
      expect(at(pe, pos, 0)).toBeCloseTo(Math.sin(pos))
    }
  })

  it('frequencies decrease with dimension index', () => {
    const d = 16
    let prev = Infinity
    for (let dim = 0; dim < d; dim += 2) {
      const f = frequencyOfDim(dim, d)
      expect(f).toBeLessThanOrEqual(prev)
      prev = f
    }
  })

  it('a dim pair shares one frequency', () => {
    expect(frequencyOfDim(2, 16)).toBeCloseTo(frequencyOfDim(3, 16))
  })
})
