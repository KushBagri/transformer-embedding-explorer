// Core numeric types for the in-browser transformer math.
//
// Matrices are row-major over a flat Float32Array — the same buffer layout
// Three.js attributes and D3 expect, so visualizations can read these without
// reshaping. Dimensions are tiny (d_model ~8-64, seq_len <= 16), so naive
// implementations are plenty fast and stay easy to reason about for teaching.

export type Vec = Float32Array

export interface Mat {
  rows: number
  cols: number
  /** length === rows * cols, element (r, c) at data[r * cols + c] */
  data: Float32Array
}

// const-object union instead of a TS enum (tsconfig: erasableSyntaxOnly).
export const PEKind = {
  None: 'none',
  Sinusoidal: 'sinusoidal',
  RoPE: 'rope',
  ALiBi: 'alibi',
} as const
export type PEKind = (typeof PEKind)[keyof typeof PEKind]

/** Construct a matrix; optional initial data is copied (length must match). */
export function mat(rows: number, cols: number, data?: ArrayLike<number>): Mat {
  const buf = new Float32Array(rows * cols)
  if (data) {
    if (data.length !== rows * cols) {
      throw new Error(
        `mat(${rows}, ${cols}) expects ${rows * cols} values, got ${data.length}`,
      )
    }
    buf.set(data)
  }
  return { rows, cols, data: buf }
}

/** Zero matrix. */
export function zeros(rows: number, cols: number): Mat {
  return { rows, cols, data: new Float32Array(rows * cols) }
}

/** Identity matrix of size n. */
export function identity(n: number): Mat {
  const m = zeros(n, n)
  for (let i = 0; i < n; i++) m.data[i * n + i] = 1
  return m
}

/** Build a Vec from any array-like of numbers. */
export function vec(values: ArrayLike<number>): Vec {
  return Float32Array.from(values)
}

/** Read element (r, c). */
export function at(m: Mat, r: number, c: number): number {
  return m.data[r * m.cols + c]
}

/** Write element (r, c). */
export function set(m: Mat, r: number, c: number, value: number): void {
  m.data[r * m.cols + c] = value
}
