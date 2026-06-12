import type { ReactNode } from 'react'

/** Inline monospace math/code fragment, e.g. token + position = combined. */
export function MathInline({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em] text-prose-bright">
      {children}
    </code>
  )
}
