import { describe, it, expect } from 'vitest'
import { at } from '../types'
import { alibiBias, slopeForHead } from '../alibi'

describe('ALiBi', () => {
  it('bias is zero on the diagonal and negative off it', () => {
    const b = alibiBias(4, 0.5)
    for (let i = 0; i < 4; i++) {
      expect(at(b, i, i)).toBeCloseTo(0) // -0 is fine mathematically
      for (let j = 0; j < 4; j++) {
        if (i !== j) expect(at(b, i, j)).toBeLessThan(0)
      }
    }
  })

  it('penalty grows with distance', () => {
    const b = alibiBias(5, 1)
    expect(at(b, 0, 1)).toBeGreaterThan(at(b, 0, 3)) // -1 > -3
    expect(at(b, 0, 1)).toBe(-1)
    expect(at(b, 0, 4)).toBe(-4)
  })

  it('slopes are positive and decrease across heads', () => {
    const slopes = [0, 1, 2, 3].map((h) => slopeForHead(h, 4))
    slopes.forEach((s) => expect(s).toBeGreaterThan(0))
    for (let i = 1; i < slopes.length; i++) {
      expect(slopes[i]).toBeLessThan(slopes[i - 1])
    }
  })
})
