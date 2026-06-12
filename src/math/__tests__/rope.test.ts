import { describe, it, expect } from 'vitest'
import { mat, vec, type Vec } from '../types'
import { row } from '../matrix'
import { norm, dot } from '../vector'
import { applyRoPE } from '../rope'

// Rotate a single vector as if it sat at the given position.
function rotateAt(v: Vec, pos: number): Vec {
  const m = mat(pos + 1, v.length)
  for (let p = 0; p <= pos; p++) m.data.set(v, p * v.length)
  return row(applyRoPE(m), pos)
}

describe('RoPE', () => {
  it('position 0 is the identity rotation', () => {
    const v = vec([1, 2, 3, 4])
    expect(Array.from(rotateAt(v, 0))).toEqual([1, 2, 3, 4])
  })

  it('preserves the norm of every row', () => {
    const m = mat(4, 4, [1, 2, 3, 4, -1, 0, 2, 5, 0.3, 0.7, -2, 1, 4, 4, 4, 4])
    const out = applyRoPE(m)
    for (let p = 0; p < m.rows; p++) {
      expect(norm(row(out, p))).toBeCloseTo(norm(row(m, p)))
    }
  })

  it('dot product depends only on the relative offset', () => {
    const q = vec([1, 2, 3, 4])
    const k = vec([0.5, -1, 2, 0.3])
    const offset2a = dot(rotateAt(q, 3), rotateAt(k, 1))
    const offset2b = dot(rotateAt(q, 5), rotateAt(k, 3))
    expect(offset2a).toBeCloseTo(offset2b, 4)
  })

  it('rejects an odd dModel', () => {
    expect(() => applyRoPE(mat(2, 3))).toThrow()
  })
})
