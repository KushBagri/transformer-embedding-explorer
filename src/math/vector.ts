// Vector operations over flat Float32Arrays. These replace the ad-hoc
// addVectors/subtraction helpers in the original prototype and back the
// "addition = superposition, recoverable by projection" story.

import type { Vec } from './types'

function assertSameLength(a: Vec, b: Vec): void {
  if (a.length !== b.length) {
    throw new Error(`length mismatch: ${a.length} vs ${b.length}`)
  }
}

/** Elementwise a + b. */
export function add(a: Vec, b: Vec): Vec {
  assertSameLength(a, b)
  const out = new Float32Array(a.length)
  for (let i = 0; i < a.length; i++) out[i] = a[i] + b[i]
  return out
}

/** Elementwise a - b. */
export function sub(a: Vec, b: Vec): Vec {
  assertSameLength(a, b)
  const out = new Float32Array(a.length)
  for (let i = 0; i < a.length; i++) out[i] = a[i] - b[i]
  return out
}

/** Scale by a scalar. */
export function scale(a: Vec, s: number): Vec {
  const out = new Float32Array(a.length)
  for (let i = 0; i < a.length; i++) out[i] = a[i] * s
  return out
}

/** Dot product. */
export function dot(a: Vec, b: Vec): number {
  assertSameLength(a, b)
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i]
  return sum
}

/** Euclidean (L2) norm. */
export function norm(a: Vec): number {
  return Math.sqrt(dot(a, a))
}

/**
 * Cosine similarity in [-1, 1]. Returns 0 for a zero vector (no direction).
 * This is the readout the high-dimensionality demo plots: random vectors in
 * high dimensions have cosine ~0 (angle ~90 degrees).
 */
export function cosine(a: Vec, b: Vec): number {
  const denom = norm(a) * norm(b)
  if (denom === 0) return 0
  return dot(a, b) / denom
}

/** Angle between two vectors in radians, clamped against float drift. */
export function angle(a: Vec, b: Vec): number {
  return Math.acos(Math.min(1, Math.max(-1, cosine(a, b))))
}

/** Unit vector in the same direction. Returns a zero copy for a zero vector. */
export function normalize(a: Vec): Vec {
  const n = norm(a)
  if (n === 0) return new Float32Array(a.length)
  return scale(a, 1 / n)
}

/** Scalar projection length of a onto b (a·b / |b|). */
export function projectionLength(a: Vec, b: Vec): number {
  const n = norm(b)
  if (n === 0) return 0
  return dot(a, b) / n
}
