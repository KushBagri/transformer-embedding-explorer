import type { ReactNode } from 'react'

/** A centered display formula. We hand-set math with sub/sup rather than pull
 *  in a math typesetting dependency for the handful of equations we show. */
export function Formula({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center">
      <div className="font-mono text-sm leading-relaxed text-prose-bright sm:text-base">
        {children}
      </div>
      {label && <div className="mt-2 text-xs text-prose-dim">{label}</div>}
    </div>
  )
}
