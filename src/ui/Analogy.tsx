import type { ReactNode } from 'react'

/** A visually distinct box for the everyday metaphor that anchors a concept.
 *  The metaphor is the main event, so it gets its own framed callout. */
export function Analogy({ children, label = 'Picture this' }: { children: ReactNode; label?: string }) {
  return (
    <div className="rounded-xl border border-combined/40 bg-combined/10 px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-combined-soft">
        {label}
      </p>
      <div className="flex flex-col gap-2 leading-relaxed text-prose">{children}</div>
    </div>
  )
}
