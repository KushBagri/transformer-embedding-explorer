// Top-level narrative spine: a hero, the ordered sections, and a footer.

import { Suspense } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { SECTIONS } from '../sections/sections.config'
import { EASE_OUT } from '../ui/motion'

function Hero() {
  const reduce = useReducedMotion()
  const show = (delay: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: EASE_OUT },
        }

  return (
    <header className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
      <motion.div
        {...show(0)}
        className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-prose-dim"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-combined shadow-[0_0_10px_2px_rgba(167,139,250,0.8)]" />
        Transformer Embedding Explorer
      </motion.div>

      <motion.h1
        {...show(0.08)}
        className="font-display text-5xl leading-[1.05] tracking-tight text-prose-bright sm:text-7xl"
      >
        We add the words and their
        <br className="hidden sm:block" /> positions together.
        <br />
        <span className="text-aurora italic">So why don't we lose the order?</span>
      </motion.h1>

      <motion.p
        {...show(0.2)}
        className="mt-8 max-w-xl text-lg leading-relaxed text-prose"
      >
        Most people guess the information is lost. It isn't. Scroll to see why —
        every visual is computed from the real transformer math, live.
      </motion.p>

      <motion.div
        {...show(0.32)}
        className="mt-14 flex flex-col items-center gap-2 text-prose-dim"
        aria-hidden
      >
        <span className="text-[11px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.span
          animate={reduce ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="text-lg"
        >
          ↓
        </motion.span>
      </motion.div>
    </header>
  )
}

export function Scrollytelling() {
  return (
    <main className="relative">
      <Hero />
      <Suspense
        fallback={
          <div className="py-24 text-center text-sm text-prose-dim">loading…</div>
        }
      >
        {SECTIONS.map(({ id, Component }) => (
          <Component key={id} />
        ))}
      </Suspense>
      <footer className="mx-auto max-w-4xl px-6 py-28 text-center">
        <p className="font-display text-2xl italic text-prose-bright">
          More of the machine, coming soon.
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-prose-dim">
          Next: how the subspaces are learned, the Q/K/V projections in 3D, and a
          free-play transformer sandbox.
        </p>
      </footer>
    </main>
  )
}
