// Deterministic token embeddings. A real model learns these; for the explorer
// we just need a stable, distinct vector per token so the visuals don't jump
// between renders. We hash the token string to a seed and draw a Gaussian
// vector from it — same word always lands in the same place.

import { mat, type Mat } from '../math/types'
import { mulberry32, gaussian } from '../math/rng'

/** djb2 string hash -> 32-bit unsigned seed. */
function hashToken(token: string): number {
  let h = 5381
  for (let i = 0; i < token.length; i++) {
    h = (Math.imul(h, 33) ^ token.charCodeAt(i)) >>> 0
  }
  return h >>> 0
}

/** A single token's embedding vector of length dModel. */
export function embedToken(token: string, dModel: number, seed = 0): Float32Array {
  const rng = mulberry32((hashToken(token.toLowerCase()) ^ Math.imul(seed, 0x9e3779b1)) >>> 0)
  const v = new Float32Array(dModel)
  for (let i = 0; i < dModel; i++) v[i] = gaussian(rng)
  return v
}

/** Stack token embeddings into a (seqLen × dModel) matrix. */
export function embedTokens(tokens: string[], dModel: number, seed = 0): Mat {
  const m = mat(tokens.length, dModel)
  for (let t = 0; t < tokens.length; t++) {
    m.data.set(embedToken(tokens[t], dModel, seed), t * dModel)
  }
  return m
}

/** Split a sentence into lowercase word tokens (punctuation stripped). */
export function tokenize(sentence: string): string[] {
  return sentence
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
}
