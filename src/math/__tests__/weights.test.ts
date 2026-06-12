import { describe, it, expect } from 'vitest'
import { mulberry32 } from '../rng'
import { col } from '../matrix'
import { dot } from '../vector'
import { randomMatrix, orthonormalizeColumns, defaultProjections } from '../weights'

describe('weights', () => {
  it('randomMatrix has the requested shape', () => {
    const m = randomMatrix(16, 4, mulberry32(1))
    expect(m.rows).toBe(16)
    expect(m.cols).toBe(4)
  })

  it('orthonormalizeColumns yields orthonormal columns', () => {
    const m = randomMatrix(8, 4, mulberry32(99))
    const q = orthonormalizeColumns(m)
    for (let i = 0; i < q.cols; i++) {
      expect(dot(col(q, i), col(q, i))).toBeCloseTo(1, 4) // unit length
      for (let j = i + 1; j < q.cols; j++) {
        expect(dot(col(q, i), col(q, j))).toBeCloseTo(0, 4) // orthogonal
      }
    }
  })

  it('defaultProjections is deterministic and correctly shaped', () => {
    const a = defaultProjections(16, 4)
    const b = defaultProjections(16, 4)
    expect(Array.from(a.wq.data)).toEqual(Array.from(b.wq.data))
    expect(a.wq.rows).toBe(16)
    expect(a.wq.cols).toBe(4)
    // distinct matrices drawn from the same stream
    expect(Array.from(a.wq.data)).not.toEqual(Array.from(a.wk.data))
  })

  it('different seeds give different weights', () => {
    const a = defaultProjections(8, 4, 1)
    const b = defaultProjections(8, 4, 2)
    expect(Array.from(a.wq.data)).not.toEqual(Array.from(b.wq.data))
  })
})
