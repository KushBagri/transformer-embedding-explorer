import type { ReactNode } from 'react'

/** A framed box for the everyday metaphor that anchors a concept — the
 *  metaphor is the main event, so it gets a glassy accented panel. */
export function Analogy({ children, label = 'Picture this' }: { children: ReactNode; label?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-combined/25 bg-combined/[0.06] px-5 py-4 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-combined/60 to-transparent" />
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-combined-soft">
        <span aria-hidden>✦</span>
        {label}
      </p>
      <div className="flex flex-col gap-2 leading-relaxed text-prose">{children}</div>
    </div>
  )
}
