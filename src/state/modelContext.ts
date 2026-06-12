// The single source of truth for the whole app. Inputs are small and
// read-mostly; everything downstream (token embeddings, positional encoding,
// the combined vector, Q/K/V, attention) is *derived* from them by one pure
// function so every section and the sandbox see identical, computed-once data.

import { createContext, useContext } from 'react'
import {
  PEKind,
  type Mat,
  addMat,
  sinusoidalPE,
  zeros,
  applyRoPE,
  alibiBias,
  slopeForHead,
  project,
  scaledDotProductAttention,
  defaultProjections,
  type Projections,
} from '../math'
import { embedTokens } from './embeddings'

export interface ModelInputs {
  tokens: string[]
  dModel: number
  dHead: number
  seed: number
  peKind: PEKind
  temperature: number
}

export interface DerivedModel {
  tokenEmb: Mat
  /** Positional-encoding table (zeros when PE is off or applied inside attention). */
  posEnc: Mat
  /** What actually enters the projections: tokenEmb (+ PE when additive). */
  combined: Mat
  projections: Projections
  q: Mat
  k: Mat
  v: Mat
  scores: Mat
  attnWeights: Mat
  output: Mat
}

export interface ModelValue extends ModelInputs, DerivedModel {
  setInputs: (patch: Partial<ModelInputs>) => void
  setSentence: (sentence: string) => void
  reset: () => void
}

/** Pure derivation: ModelInputs -> all matrices. No React, easy to test. */
export function deriveModel(input: ModelInputs): DerivedModel {
  const { tokens, dModel, dHead, seed, peKind, temperature } = input
  // Use the true length: an empty sentence yields empty (0-row) matrices that
  // flow through every op without throwing, rather than a 1-row PE table that
  // would mismatch the 0-row token embeddings.
  const seqLen = tokens.length

  const tokenEmb = embedTokens(tokens, dModel, seed)

  const additive = peKind === PEKind.Sinusoidal
  const posEnc = additive ? sinusoidalPE(seqLen, dModel) : zeros(seqLen, dModel)
  const combined = additive ? addMat(tokenEmb, posEnc) : tokenEmb

  const projections = defaultProjections(dModel, dHead, seed)
  const qBase = project(combined, projections.wq)
  const kBase = project(combined, projections.wk)
  const v = project(combined, projections.wv)

  // RoPE injects position by rotating Q and K instead of adding to the input.
  const q = peKind === PEKind.RoPE ? applyRoPE(qBase) : qBase
  const k = peKind === PEKind.RoPE ? applyRoPE(kBase) : kBase

  // ALiBi injects position as an additive distance penalty on the scores.
  const bias =
    peKind === PEKind.ALiBi ? alibiBias(seqLen, slopeForHead(0, 8)) : undefined

  const { scores, weights, output } = scaledDotProductAttention(q, k, v, {
    temperature,
    bias,
  })

  return {
    tokenEmb,
    posEnc,
    combined,
    projections,
    q,
    k,
    v,
    scores,
    attnWeights: weights,
    output,
  }
}

export const ModelContext = createContext<ModelValue | null>(null)

/** Access the shared model. Must be used within <ModelProvider>. */
export function useModel(): ModelValue {
  const ctx = useContext(ModelContext)
  if (!ctx) throw new Error('useModel must be used within a ModelProvider')
  return ctx
}
