// Shared motion language so every reveal feels like one considered piece.
import type { Variants } from 'framer-motion'

/** Expensive-feeling ease (expo-out-ish). Use for entrances. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** A container that staggers its children in. */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

/** A single element rising + fading in. */
export const riseItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
}

/** Props for a scroll-triggered reveal of a block. */
export const revealOnScroll = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-80px' },
  variants: staggerParent,
} as const
