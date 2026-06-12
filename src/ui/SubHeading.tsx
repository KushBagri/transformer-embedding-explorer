import type { ReactNode } from 'react'

/** A within-section heading that breaks a long explanation into labeled parts. */
export function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-4 flex items-baseline gap-2 font-display text-2xl leading-tight text-prose-bright">
      <span className="text-base text-combined/70" aria-hidden>
        §
      </span>
      {children}
    </h3>
  )
}
