// The centerpiece claim, as an executable proof: random vectors become nearly
// orthogonal as dimensionality grows. This is *why* adding token + positional
// embeddings doesn't destroy either one — Section 3's "money chart".

import { describe, it, expect } from 'vitest'
import { mulberry32, gaussian } from '../rng'
import { cosine } from '../vector'

function randomUnit(dim: number, rng: () => number): Float32Array {
  const v = new Float32Array(dim)
  let n = 0
  for (let i = 0; i < dim; i++) {
    v[i] = gaussian(rng)
    n += v[i] * v[i]
  }
  n = Math.sqrt(n)
  for (let i = 0; i < dim; i++) v[i] /= n
  return v
}

function meanAbsCosine(dim: number, pairs: number, seed: number): number {
  const rng = mulberry32(seed)
  let total = 0
  for (let p = 0; p < pairs; p++) {
    total += Math.abs(cosine(randomUnit(dim, rng), randomUnit(dim, rng)))
  }
  return total / pairs
}

describe('high-dimensional orthogonality', () => {
  it('mean |cosine| shrinks as dimensionality grows', () => {
    const low = meanAbsCosine(2, 400, 42)
    const mid = meanAbsCosine(32, 400, 42)
    const high = meanAbsCosine(512, 400, 42)
    expect(mid).toBeLessThan(low)
    expect(high).toBeLessThan(mid)
  })

  it('at 512 dims random vectors are nearly orthogonal (|cos| ~ small)', () => {
    expect(meanAbsCosine(512, 600, 7)).toBeLessThan(0.05)
  })

  it('std of cosine scales ~ 1/sqrt(dim)', () => {
    // mean |cos| for a uniform direction is ~ sqrt(2/(pi*dim))
    const dim = 256
    const predicted = Math.sqrt(2 / (Math.PI * dim))
    const observed = meanAbsCosine(dim, 800, 123)
    expect(observed).toBeCloseTo(predicted, 1)
  })
})
