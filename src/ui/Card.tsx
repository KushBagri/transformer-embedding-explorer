import type { ReactNode } from 'react'

/** A raised surface panel used to frame visualizations and controls. */
export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-edge bg-surface p-5 shadow-lg shadow-black/30 ${className}`}
    >
      {children}
    </div>
  )
}
