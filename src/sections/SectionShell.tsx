// The distill.pub idiom: a scrolling prose column beside a sticky visual
// column. The shell owns the section's scroll progress and hands it to the
// visual so each section can animate as the reader moves through it. On narrow
// screens the columns stack (visual on top, no longer sticky).

import type { ReactNode } from 'react'
import type { MotionValue } from 'framer-motion'
import { useSectionProgress } from '../scroll/useSectionProgress'

export interface SectionShellProps {
  id: string
  eyebrow?: string
  title: string
  /** Prose / controls column. */
  children: ReactNode
  /** Sticky visual; receives the section's 0->1 scroll progress. */
  visual: (progress: MotionValue<number>) => ReactNode
}

export function SectionShell({ id, eyebrow, title, children, visual }: SectionShellProps) {
  const { ref, progress } = useSectionProgress()

  return (
    <section
      ref={ref}
      id={id}
      className="mx-auto grid max-w-7xl gap-8 px-6 py-24 lg:grid-cols-2 lg:gap-16"
    >
      <div className="order-2 flex flex-col justify-center lg:order-1">
        {eyebrow && (
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-prose-dim">
            {eyebrow}
          </p>
        )}
        <h2 className="mb-5 text-3xl font-semibold tracking-tight text-prose-bright sm:text-4xl">
          {title}
        </h2>
        <div className="flex flex-col gap-5 text-lg leading-relaxed text-prose">
          {children}
        </div>
      </div>

      <div className="order-1 lg:order-2">
        <div className="lg:sticky lg:top-24">{visual(progress)}</div>
      </div>
    </section>
  )
}
