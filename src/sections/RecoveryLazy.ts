import { lazy } from 'react'

// Lazy wrapper kept in its own module so sections.config stays a pure data file
// (satisfies react-refresh's "only export components" rule). Pulls three.js /
// r3f into a separate, on-demand chunk.
export const RecoverySection = lazy(() =>
  import('./RecoverySection').then((m) => ({ default: m.RecoverySection })),
)
