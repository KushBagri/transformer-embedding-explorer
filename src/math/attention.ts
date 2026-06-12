// Scaled dot-product attention and the Q/K/V projections — the heart of the
// educational claim. Q and K are the learned *linear readouts* that pull the
// relevant (positional or semantic) component back out of the summed
// embedding; their dot products decide who attends to whom.

import { matmul, transpose } from './matrix'
import { softmaxRows } from './softmax'
import { zeros, type Mat } from './types'

/** Project a sequence x (seq × dModel) through weight matrix W (dModel × dOut). */
export function project(x: Mat, w: Mat): Mat {
  return matmul(x, w)
}

export interface AttentionOptions {
  /** Additive bias on raw scores, e.g. ALiBi (seqQ × seqK). */
  bias?: Mat
  /** Softmax temperature; >1 softens, <1 sharpens. Default 1. */
  temperature?: number
}

export interface AttentionResult {
  /** Raw scaled scores before softmax (seqQ × seqK). */
  scores: Mat
  /** Attention weights after softmax; each row sums to 1 (seqQ × seqK). */
  weights: Mat
  /** Weighted sum of value rows (seqQ × dValue). */
  output: Mat
}

/**
 * Scaled dot-product attention:
 *   scores  = (Q · Kᵀ) / sqrt(dK)   (+ optional bias, / temperature)
 *   weights = softmax(scores) row-wise
 *   output  = weights · V
 */
export function scaledDotProductAttention(
  q: Mat,
  k: Mat,
  v: Mat,
  opts: AttentionOptions = {},
): AttentionResult {
  if (q.cols !== k.cols) {
    throw new Error(`Q/K dim mismatch: ${q.cols} vs ${k.cols}`)
  }
  if (k.rows !== v.rows) {
    throw new Error(`K/V sequence mismatch: ${k.rows} vs ${v.rows}`)
  }
  const dK = q.cols
  const invScale = 1 / Math.sqrt(dK)
  const temperature = opts.temperature ?? 1

  const raw = matmul(q, transpose(k)) // (seqQ × seqK)
  const scores = zeros(raw.rows, raw.cols)
  for (let i = 0; i < raw.data.length; i++) {
    scores.data[i] = (raw.data[i] * invScale) / temperature
  }
  if (opts.bias) {
    if (opts.bias.rows !== scores.rows || opts.bias.cols !== scores.cols) {
      throw new Error('attention bias shape mismatch')
    }
    for (let i = 0; i < scores.data.length; i++) scores.data[i] += opts.bias.data[i]
  }

  const weights = softmaxRows(scores)
  const output = matmul(weights, v)
  return { scores, weights, output }
}
