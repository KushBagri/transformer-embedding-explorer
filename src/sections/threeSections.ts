import { lazy } from 'react'

// Lazy wrappers for the 3D sections. Kept out of sections.config so that file
// stays a pure data module (react-refresh: "only export components"), and they
// code-split three.js / r3f into an on-demand chunk.
export const EmbeddingSection = lazy(() =>
  import('./EmbeddingSection').then((m) => ({ default: m.EmbeddingSection })),
)
export const RecoverySection = lazy(() =>
  import('./RecoverySection').then((m) => ({ default: m.RecoverySection })),
)
