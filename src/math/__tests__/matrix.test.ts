import { describe, it, expect } from 'vitest'
import { mat, identity, vec } from '../types'
import { matmul, transpose, matVec, row, col, fromRows, addMat } from '../matrix'

describe('matrix ops', () => {
  it('multiplies known matrices', () => {
    // [[1,2],[3,4]] · [[5,6],[7,8]] = [[19,22],[43,50]]
    const a = mat(2, 2, [1, 2, 3, 4])
    const b = mat(2, 2, [5, 6, 7, 8])
    expect(Array.from(matmul(a, b).data)).toEqual([19, 22, 43, 50])
  })

  it('multiplies non-square shapes', () => {
    const a = mat(2, 3, [1, 2, 3, 4, 5, 6]) // 2×3
    const b = mat(3, 2, [7, 8, 9, 10, 11, 12]) // 3×2
    const c = matmul(a, b) // 2×2
    expect(c.rows).toBe(2)
    expect(c.cols).toBe(2)
    expect(Array.from(c.data)).toEqual([58, 64, 139, 154])
  })

  it('multiplying by identity is a no-op', () => {
    const a = mat(2, 2, [1, 2, 3, 4])
    expect(Array.from(matmul(a, identity(2)).data)).toEqual([1, 2, 3, 4])
  })

  it('transposes', () => {
    const a = mat(2, 3, [1, 2, 3, 4, 5, 6])
    const t = transpose(a)
    expect(t.rows).toBe(3)
    expect(t.cols).toBe(2)
    expect(Array.from(t.data)).toEqual([1, 4, 2, 5, 3, 6])
  })

  it('matVec matches matmul with a column', () => {
    const a = mat(2, 3, [1, 2, 3, 4, 5, 6])
    expect(Array.from(matVec(a, vec([1, 0, 1])))).toEqual([4, 10])
  })

  it('extracts rows and columns', () => {
    const a = mat(2, 3, [1, 2, 3, 4, 5, 6])
    expect(Array.from(row(a, 1))).toEqual([4, 5, 6])
    expect(Array.from(col(a, 2))).toEqual([3, 6])
  })

  it('builds from rows and adds', () => {
    const m = fromRows([vec([1, 2]), vec([3, 4])])
    expect(Array.from(m.data)).toEqual([1, 2, 3, 4])
    expect(Array.from(addMat(m, m).data)).toEqual([2, 4, 6, 8])
  })

  it('throws on shape mismatch', () => {
    expect(() => matmul(mat(2, 3), mat(2, 2))).toThrow()
  })
})
