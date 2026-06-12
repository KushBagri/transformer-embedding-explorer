import type { ReactNode } from 'react'

/** A collapsible "dig deeper" disclosure — keeps the main prose breezy while
 *  letting curious readers expand the rigorous version. */
export function Detail({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="group rounded-xl border border-edge bg-surface-2/60 px-4 py-3">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-prose-bright [&::-webkit-details-marker]:hidden">
        <span className="text-prose-dim transition-transform group-open:rotate-90">▶</span>
        {summary}
      </summary>
      <div className="mt-3 flex flex-col gap-3 text-base leading-relaxed text-prose">
        {children}
      </div>
    </details>
  )
}
