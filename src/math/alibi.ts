// ALiBi (Attention with Linear Biases). Rather than encoding position into the
// embedding at all, ALiBi adds a distance penalty directly to the attention
// scores: closer tokens get a smaller penalty. Each head uses a different
// geometric slope, letting some heads look near and others far.

import { mat, type Mat } from './types'

/**
 * Standard ALiBi slope for a given head, following the geometric sequence
 * m_h = 2^(-8 h / numHeads) for h = 1..numHeads.
 */
export function slopeForHead(head: number, numHeads: number): number {
  return Math.pow(2, (-8 * (head + 1)) / numHeads)
}

/**
 * Additive bias matrix (seqLen × seqLen) where bias[i][j] = -slope · |i - j|.
 * Added to raw attention scores before softmax. We use symmetric distance for
 * the (non-causal) teaching demo.
 */
export function alibiBias(seqLen: number, slope: number): Mat {
  const out = mat(seqLen, seqLen)
  for (let i = 0; i < seqLen; i++) {
    for (let j = 0; j < seqLen; j++) {
      out.data[i * seqLen + j] = -slope * Math.abs(i - j)
    }
  }
  return out
}
