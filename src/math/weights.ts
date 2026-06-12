// Deterministic projection matrices. "Pre-baked" = generated from a fixed seed
// so the visuals are stable across reloads. These stand in for the learned
// W_Q / W_K / W_V of a real model; what matters pedagogically is that a linear
// projection can isolate a chosen subspace of the summed embedding.

import { mat, type Mat } from './types'
import { mulberry32, gaussian } from './rng'
import { col } from './matrix'

/** Random matrix (rows × cols) with i.i.d. standard-normal entries. */
export function randomMatrix(rows: number, cols: number, rng: () => number): Mat {
  const m = mat(rows, cols)
  for (let i = 0; i < m.data.length; i++) m.data[i] = gaussian(rng)
  return m
}

/**
 * Orthonormalize the columns of m via modified Gram-Schmidt. The result has
 * orthonormal columns spanning the same space — used to construct clean,
 * interpretable subspace bases for the projection/recovery demos.
 */
export function orthonormalizeColumns(m: Mat): Mat {
  const out = mat(m.rows, m.cols)
  const basis: Float32Array[] = []
  for (let j = 0; j < m.cols; j++) {
    const v = col(m, j)
    for (const b of basis) {
      let proj = 0
      for (let i = 0; i < v.length; i++) proj += v[i] * b[i]
      for (let i = 0; i < v.length; i++) v[i] -= proj * b[i]
    }
    let n = 0
    for (let i = 0; i < v.length; i++) n += v[i] * v[i]
    n = Math.sqrt(n)
    if (n > 1e-8) for (let i = 0; i < v.length; i++) v[i] /= n
    basis.push(v)
    for (let i = 0; i < m.rows; i++) out.data[i * m.cols + j] = v[i]
  }
  return out
}

export interface Projections {
  wq: Mat
  wk: Mat
  wv: Mat
}

/**
 * Deterministic Q/K/V projection matrices (dModel × dHead) from a seed.
 * Default seed gives the canonical demo weights used across sections.
 */
export function defaultProjections(dModel: number, dHead: number, seed = 1): Projections {
  const rng = mulberry32(seed)
  return {
    wq: randomMatrix(dModel, dHead, rng),
    wk: randomMatrix(dModel, dHead, rng),
    wv: randomMatrix(dModel, dHead, rng),
  }
}
