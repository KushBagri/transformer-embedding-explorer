import { describe, it, expect } from 'vitest'
import { mat, zeros } from '../types'
import { project, scaledDotProductAttention } from '../attention'
import { alibiBias } from '../alibi'

const sumRow = (m: { data: Float32Array; cols: number }, i: number) => {
  let s = 0
  for (let j = 0; j < m.cols; j++) s += m.data[i * m.cols + j]
  return s
}

describe('attention', () => {
  it('project applies the weight matrix', () => {
    const x = mat(2, 3, [1, 0, 0, 0, 1, 0]) // 2×3
    const w = mat(3, 2, [1, 2, 3, 4, 5, 6]) // 3×2
    const out = project(x, w)
    expect(out.rows).toBe(2)
    expect(out.cols).toBe(2)
    expect(Array.from(out.data)).toEqual([1, 2, 3, 4])
  })

  it('every attention row is a distribution summing to 1', () => {
    const q = mat(3, 4, [1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1])
    const k = mat(3, 4, [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0])
    const v = mat(3, 2, [1, 0, 0, 1, 1, 1])
    const { weights, output } = scaledDotProductAttention(q, k, v)
    for (let i = 0; i < 3; i++) expect(sumRow(weights, i)).toBeCloseTo(1)
    expect(output.rows).toBe(3)
    expect(output.cols).toBe(2)
  })

  it('zero queries give uniform attention', () => {
    const q = zeros(2, 4)
    const k = mat(2, 4, [1, 2, 3, 4, 5, 6, 7, 8])
    const v = mat(2, 2, [1, 0, 0, 1])
    const { weights } = scaledDotProductAttention(q, k, v)
    weights.data.forEach((w: number) => expect(w).toBeCloseTo(0.5))
  })

  it('higher temperature flattens the distribution', () => {
    const q = mat(1, 2, [3, 0])
    const k = mat(2, 2, [3, 0, 0, 3])
    const v = mat(2, 2, [1, 0, 0, 1])
    const sharp = scaledDotProductAttention(q, k, v, { temperature: 0.5 }).weights
    const soft = scaledDotProductAttention(q, k, v, { temperature: 5 }).weights
    const gap = (w: { data: Float32Array }) => Math.abs(w.data[0] - w.data[1])
    expect(gap(sharp)).toBeGreaterThan(gap(soft))
  })

  it('ALiBi bias pulls attention toward nearby positions', () => {
    const q = zeros(3, 4) // uniform scores before bias
    const k = zeros(3, 4)
    const v = mat(3, 2, [1, 0, 0, 1, 1, 1])
    const bias = alibiBias(3, 1)
    const { weights } = scaledDotProductAttention(q, k, v, { bias })
    // query at position 1: self (j=1) should dominate its further neighbors
    expect(weights.data[1 * 3 + 1]).toBeGreaterThan(weights.data[1 * 3 + 0])
    expect(weights.data[1 * 3 + 1]).toBeGreaterThan(weights.data[1 * 3 + 2])
  })

  it('throws on Q/K dim mismatch', () => {
    expect(() =>
      scaledDotProductAttention(mat(2, 3), mat(2, 4), mat(2, 2)),
    ).toThrow()
  })
})
