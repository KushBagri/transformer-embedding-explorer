import type { ReactNode } from 'react'

/** Inline monospace math/code fragment, e.g. token + position = combined. */
export function MathInline({ children }: { children: ReactNode }) {
  return (
    <code className="rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-prose-bright">
      {children}
    </code>
  )
}
