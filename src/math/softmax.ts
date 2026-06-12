// Numerically stable softmax (subtract the max before exponentiating).

import { zeros, type Mat, type Vec } from './types'

/** Softmax over a 1D vector. Result is non-negative and sums to 1. */
export function softmax(v: Vec): Vec {
  const out = new Float32Array(v.length)
  if (v.length === 0) return out
  let max = -Infinity
  for (let i = 0; i < v.length; i++) if (v[i] > max) max = v[i]
  let sum = 0
  for (let i = 0; i < v.length; i++) {
    const e = Math.exp(v[i] - max)
    out[i] = e
    sum += e
  }
  for (let i = 0; i < v.length; i++) out[i] /= sum
  return out
}

/** Row-wise softmax: each row of the result sums to 1. */
export function softmaxRows(m: Mat): Mat {
  const out = zeros(m.rows, m.cols)
  for (let i = 0; i < m.rows; i++) {
    const start = i * m.cols
    let max = -Infinity
    for (let j = 0; j < m.cols; j++) {
      const val = m.data[start + j]
      if (val > max) max = val
    }
    let sum = 0
    for (let j = 0; j < m.cols; j++) {
      const e = Math.exp(m.data[start + j] - max)
      out.data[start + j] = e
      sum += e
    }
    for (let j = 0; j < m.cols; j++) out.data[start + j] /= sum
  }
  return out
}
