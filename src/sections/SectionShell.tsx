// The distill.pub idiom: a scrolling prose column beside a sticky visual
// column. The shell owns the section's scroll progress and hands it to the
// visual. Prose and visual reveal as they enter the viewport.

import type { ReactNode } from 'react'
import { motion, useReducedMotion, type MotionValue } from 'framer-motion'
import { useSectionProgress } from '../scroll/useSectionProgress'
import { EASE_OUT } from '../ui/motion'

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
  const reduce = useReducedMotion()

  return (
    <section
      ref={ref}
      id={id}
      className="mx-auto grid max-w-7xl scroll-mt-20 gap-10 px-6 py-28 lg:grid-cols-2 lg:gap-20"
    >
      <motion.div
        className="order-2 flex flex-col justify-center lg:order-1"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
      >
        {eyebrow && (
          <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-prose-dim">
            <span className="h-px w-8 bg-gradient-to-r from-combined to-transparent" />
            {eyebrow}
          </p>
        )}
        <h2 className="mb-6 font-display text-[2.4rem] leading-[1.1] text-prose-bright sm:text-5xl">
          {title}
        </h2>
        <div className="flex max-w-prose flex-col gap-5 text-lg leading-relaxed text-prose">
          {children}
        </div>
      </motion.div>

      <div className="order-1 lg:order-2">
        <motion.div
          className="lg:sticky lg:top-24"
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          {visual(progress)}
        </motion.div>
      </div>
    </section>
  )
}
