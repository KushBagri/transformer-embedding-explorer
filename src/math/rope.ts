// Rotary Position Embedding (RoPE). Instead of adding position to the
// embedding, RoPE *rotates* each (2i, 2i+1) dimension pair by an angle
// proportional to the token's position. Because it is a pure rotation it
// preserves vector norm, and the dot product between two rotated vectors
// depends only on their relative offset — the geometric punchline of the
// "modern answer" section.

import { mat, type Mat } from './types'
import { frequencyOfDim } from './positional'

/**
 * Apply RoPE to each row of x (shape seqLen × dModel), where row p is the
 * vector at position p. dModel must be even. Returns a new matrix.
 */
export function applyRoPE(x: Mat, base = 10000): Mat {
  if (x.cols % 2 !== 0) {
    throw new Error(`RoPE needs an even dModel, got ${x.cols}`)
  }
  const out = mat(x.rows, x.cols)
  for (let pos = 0; pos < x.rows; pos++) {
    const base0 = pos * x.cols
    for (let i = 0; i < x.cols; i += 2) {
      const theta = frequencyOfDim(i, x.cols, base)
      const a = pos * theta
      const cos = Math.cos(a)
      const sin = Math.sin(a)
      const even = x.data[base0 + i]
      const odd = x.data[base0 + i + 1]
      out.data[base0 + i] = even * cos - odd * sin
      out.data[base0 + i + 1] = even * sin + odd * cos
    }
  }
  return out
}
