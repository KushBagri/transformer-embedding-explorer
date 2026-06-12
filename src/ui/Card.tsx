import type { ReactNode } from 'react'

/** A glass panel with a luminous gradient edge — frames every visualization.
 *  The outer gradient + 1px padding makes the top edge catch the light. */
export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-white/[0.14] via-white/[0.05] to-white/[0.02] p-px shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)]">
      <div
        className={`rounded-[15px] border border-white/5 bg-surface/75 p-5 backdrop-blur-xl ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
