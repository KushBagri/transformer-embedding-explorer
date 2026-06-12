// Sinusoidal positional encoding from "Attention Is All You Need".
//
//   PE[pos, 2i]   = sin(pos / base^(2i / dModel))
//   PE[pos, 2i+1] = cos(pos / base^(2i / dModel))
//
// Each dimension pair oscillates at its own geometrically-spaced frequency —
// fast wheels for fine position, slow wheels for coarse — which is exactly
// what makes relative position recoverable by a linear map.

import { mat, type Mat } from './types'

const DEFAULT_BASE = 10000

/** Angular frequency (radians per position step) for embedding dim `dim`. */
export function frequencyOfDim(dim: number, dModel: number, base = DEFAULT_BASE): number {
  // dims 2i and 2i+1 share a frequency; pair index is floor(dim / 2).
  const pair = Math.floor(dim / 2)
  return 1 / Math.pow(base, (2 * pair) / dModel)
}

/** Full positional-encoding table of shape (seqLen × dModel). */
export function sinusoidalPE(seqLen: number, dModel: number, base = DEFAULT_BASE): Mat {
  const pe = mat(seqLen, dModel)
  for (let pos = 0; pos < seqLen; pos++) {
    for (let dim = 0; dim < dModel; dim++) {
      const freq = frequencyOfDim(dim, dModel, base)
      const angle = pos * freq
      pe.data[pos * dModel + dim] = dim % 2 === 0 ? Math.sin(angle) : Math.cos(angle)
    }
  }
  return pe
}
