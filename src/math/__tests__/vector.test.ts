import { describe, it, expect } from 'vitest'
import { vec } from '../types'
import { add, sub, scale, dot, norm, cosine, angle, normalize, projectionLength } from '../vector'

describe('vector ops', () => {
  it('adds and subtracts elementwise', () => {
    const closeTo = (got: Float32Array, want: number[]) =>
      want.forEach((w, i) => expect(got[i]).toBeCloseTo(w))
    closeTo(add(vec([1, 2, 3]), vec([0.5, 0.2, 0.1])), [1.5, 2.2, 3.1])
    closeTo(sub(vec([1, 2, 3]), vec([0.5, 0.2, 0.1])), [0.5, 1.8, 2.9])
  })

  it('scales', () => {
    expect(Array.from(scale(vec([1, -2, 3]), 2))).toEqual([2, -4, 6])
  })

  it('computes dot and norm', () => {
    expect(dot(vec([1, 2, 3]), vec([4, 5, 6]))).toBe(32)
    expect(norm(vec([3, 4]))).toBe(5)
  })

  it('cosine is 1 for parallel, 0 for orthogonal, -1 for opposite', () => {
    expect(cosine(vec([1, 0]), vec([2, 0]))).toBeCloseTo(1)
    expect(cosine(vec([1, 0]), vec([0, 5]))).toBeCloseTo(0)
    expect(cosine(vec([1, 0]), vec([-3, 0]))).toBeCloseTo(-1)
  })

  it('angle of orthogonal vectors is ~90 degrees', () => {
    expect(angle(vec([1, 0]), vec([0, 1]))).toBeCloseTo(Math.PI / 2)
  })

  it('cosine of a zero vector is 0 (no direction)', () => {
    expect(cosine(vec([0, 0]), vec([1, 1]))).toBe(0)
  })

  it('normalize yields unit length', () => {
    expect(norm(normalize(vec([3, 4])))).toBeCloseTo(1)
  })

  it('projectionLength recovers the component along a direction', () => {
    expect(projectionLength(vec([3, 4]), vec([1, 0]))).toBeCloseTo(3)
    expect(projectionLength(vec([3, 4]), vec([0, 2]))).toBeCloseTo(4)
  })

  it('throws on length mismatch', () => {
    expect(() => add(vec([1, 2]), vec([1, 2, 3]))).toThrow()
  })
})
