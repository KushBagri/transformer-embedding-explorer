import type { ReactNode } from 'react'

type Accent = 'token' | 'position' | 'combined' | 'neutral'

const ACCENT: Record<Accent, string> = {
  token: 'border-token/60 text-token-soft',
  position: 'border-position/60 text-position-soft',
  combined: 'border-combined/60 text-combined-soft',
  neutral: 'border-edge text-prose-bright',
}

/** The one-line takeaway of a section — an emphasized, accented aside. */
export function Callout({
  children,
  accent = 'combined',
}: {
  children: ReactNode
  accent?: Accent
}) {
  return (
    <p
      className={`border-l-2 pl-4 text-lg font-medium italic leading-relaxed ${ACCENT[accent]}`}
    >
      {children}
    </p>
  )
}
