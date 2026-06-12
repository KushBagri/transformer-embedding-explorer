import { describe, it, expect } from 'vitest'
import { mat, vec } from '../types'
import { softmax, softmaxRows } from '../softmax'

const sum = (a: Float32Array) => a.reduce((s, x) => s + x, 0)

describe('softmax', () => {
  it('produces a distribution that sums to 1', () => {
    const p = softmax(vec([1, 2, 3]))
    expect(sum(p)).toBeCloseTo(1)
    p.forEach((x) => expect(x).toBeGreaterThanOrEqual(0))
  })

  it('is monotonic: larger logit -> larger probability', () => {
    const p = softmax(vec([1, 2, 3]))
    expect(p[2]).toBeGreaterThan(p[1])
    expect(p[1]).toBeGreaterThan(p[0])
  })

  it('is numerically stable with large logits', () => {
    const p = softmax(vec([1000, 1001, 1002]))
    expect(sum(p)).toBeCloseTo(1)
    p.forEach((x) => expect(Number.isFinite(x)).toBe(true))
  })

  it('equal logits give a uniform distribution', () => {
    const p = softmax(vec([5, 5, 5, 5]))
    p.forEach((x) => expect(x).toBeCloseTo(0.25))
  })

  it('softmaxRows: every row sums to 1', () => {
    const m = mat(2, 3, [1, 2, 3, 0, 0, 0])
    const out = softmaxRows(m)
    expect(out.data[0] + out.data[1] + out.data[2]).toBeCloseTo(1)
    expect(out.data[3] + out.data[4] + out.data[5]).toBeCloseTo(1)
    // uniform row
    expect(out.data[3]).toBeCloseTo(1 / 3)
  })
})
