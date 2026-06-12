import type { ReactNode } from 'react'

type Accent = 'token' | 'position' | 'combined' | 'neutral'

const BAR: Record<Accent, string> = {
  token: 'from-token to-token-soft',
  position: 'from-position to-position-soft',
  combined: 'from-combined to-position',
  neutral: 'from-white/40 to-white/10',
}
const TEXT: Record<Accent, string> = {
  token: 'text-token-soft',
  position: 'text-position-soft',
  combined: 'text-combined-soft',
  neutral: 'text-prose-bright',
}

/** The one-line takeaway of a section — an emphasized, serif aside. */
export function Callout({
  children,
  accent = 'combined',
}: {
  children: ReactNode
  accent?: Accent
}) {
  return (
    <div className="flex gap-4">
      <span className={`w-[3px] shrink-0 rounded-full bg-gradient-to-b ${BAR[accent]}`} />
      <p className={`font-display text-2xl italic leading-snug ${TEXT[accent]}`}>{children}</p>
    </div>
  )
}
