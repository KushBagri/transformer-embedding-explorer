// Color helpers shared by the 2D primitives. We keep the app's color contract
// (token=amber, position=cyan, combined=violet) for vectors, and use perceptual
// D3 scales for matrix/heatmap values.

import { interpolateRdBu, interpolateViridis } from 'd3-scale-chromatic'
import { scaleLinear } from 'd3-scale'

export const ROLE_COLOR = {
  token: '#f59e0b',
  position: '#22d3ee',
  combined: '#a78bfa',
} as const

export type Role = keyof typeof ROLE_COLOR

/**
 * Diverging color for signed values (e.g. embedding / PE entries) mapped onto
 * a symmetric domain [-absMax, absMax]. Blue = negative, red = positive.
 */
export function divergingColor(value: number, absMax: number): string {
  if (absMax <= 0) return interpolateRdBu(0.5)
  // RdBu runs red->blue, so invert so positive=red.
  const t = 1 - (value / absMax + 1) / 2
  return interpolateRdBu(Math.min(1, Math.max(0, t)))
}

/** Sequential color for non-negative values (e.g. attention weights) in [0, max]. */
export function sequentialColor(value: number, max: number): string {
  if (max <= 0) return interpolateViridis(0)
  return interpolateViridis(Math.min(1, Math.max(0, value / max)))
}

/** Largest absolute value across an array — the symmetric heatmap domain. */
export function absMax(data: ArrayLike<number>): number {
  let m = 0
  for (let i = 0; i < data.length; i++) {
    const a = Math.abs(data[i])
    if (a > m) m = a
  }
  return m
}

/** Convenience re-export for primitives that need a linear scale. */
export { scaleLinear }
