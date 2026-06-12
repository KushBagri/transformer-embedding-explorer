import { lazy } from 'react'

// Lazy wrapper (keeps three.js / r3f in the on-demand 3D chunk; keeps
// sections.config a pure data file for react-refresh).
export const EmbeddingSection = lazy(() =>
  import('./EmbeddingSection').then((m) => ({ default: m.EmbeddingSection })),
)
