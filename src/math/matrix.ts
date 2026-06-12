// Matrix operations. Naive triple-loop matmul is fine at our scale and keeps
// the numbers inspectable for teaching.

import { mat, zeros, type Mat, type Vec } from './types'

/** Matrix product a (m×k) · b (k×n) -> (m×n). */
export function matmul(a: Mat, b: Mat): Mat {
  if (a.cols !== b.rows) {
    throw new Error(
      `matmul shape mismatch: (${a.rows}×${a.cols}) · (${b.rows}×${b.cols})`,
    )
  }
  const m = a.rows
  const k = a.cols
  const n = b.cols
  const out = zeros(m, n)
  for (let i = 0; i < m; i++) {
    for (let p = 0; p < k; p++) {
      const aip = a.data[i * k + p]
      if (aip === 0) continue
      for (let j = 0; j < n; j++) {
        out.data[i * n + j] += aip * b.data[p * n + j]
      }
    }
  }
  return out
}

/** Transpose. */
export function transpose(a: Mat): Mat {
  const out = zeros(a.cols, a.rows)
  for (let i = 0; i < a.rows; i++) {
    for (let j = 0; j < a.cols; j++) {
      out.data[j * a.rows + i] = a.data[i * a.cols + j]
    }
  }
  return out
}

/** Matrix-vector product a (m×n) · v (n) -> (m). */
export function matVec(a: Mat, v: Vec): Vec {
  if (a.cols !== v.length) {
    throw new Error(`matVec shape mismatch: (${a.rows}×${a.cols}) · (${v.length})`)
  }
  const out = new Float32Array(a.rows)
  for (let i = 0; i < a.rows; i++) {
    let sum = 0
    for (let j = 0; j < a.cols; j++) sum += a.data[i * a.cols + j] * v[j]
    out[i] = sum
  }
  return out
}

/** Copy of row i as a Vec. */
export function row(a: Mat, i: number): Vec {
  const start = i * a.cols
  return a.data.slice(start, start + a.cols)
}

/** Copy of column j as a Vec. */
export function col(a: Mat, j: number): Vec {
  const out = new Float32Array(a.rows)
  for (let i = 0; i < a.rows; i++) out[i] = a.data[i * a.cols + j]
  return out
}

/** Stack row vectors (all same length) into a matrix. */
export function fromRows(rows: Vec[]): Mat {
  const r = rows.length
  const c = r > 0 ? rows[0].length : 0
  const out = mat(r, c)
  for (let i = 0; i < r; i++) {
    if (rows[i].length !== c) throw new Error('fromRows: ragged rows')
    out.data.set(rows[i], i * c)
  }
  return out
}

/** Elementwise sum of two equally-shaped matrices. */
export function addMat(a: Mat, b: Mat): Mat {
  if (a.rows !== b.rows || a.cols !== b.cols) {
    throw new Error('addMat shape mismatch')
  }
  const out = zeros(a.rows, a.cols)
  for (let i = 0; i < a.data.length; i++) out.data[i] = a.data[i] + b.data[i]
  return out
}
