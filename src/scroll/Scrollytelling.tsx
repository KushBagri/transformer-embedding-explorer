// Top-level narrative spine: a hero, the ordered sections, and a footer.

import { Suspense } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { SECTIONS } from '../sections/sections.config'

function Hero() {
  const reduce = useReducedMotion()
  return (
    <header className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
      <motion.p
        className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-prose-dim"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Transformer Embedding Explorer
      </motion.p>
      <motion.h1
        className="text-balance text-4xl font-semibold leading-tight tracking-tight text-prose-bright sm:text-6xl"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        We add the words and their positions together.
        <br />
        <span className="text-combined">So why don't we lose the order?</span>
      </motion.h1>
      <motion.p
        className="mt-6 max-w-xl text-lg text-prose"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.25 }}
      >
        Most people guess the information is lost. It isn't. Scroll to see why —
        every visual is computed from the real math, live.
      </motion.p>
      <motion.div
        className="mt-12 text-prose-dim"
        animate={reduce ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        aria-hidden
      >
        ↓
      </motion.div>
    </header>
  )
}

export function Scrollytelling() {
  return (
    <main>
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
      <footer className="mx-auto max-w-4xl px-6 py-24 text-center text-sm text-prose-dim">
        Coming next — a 3D vector space, recovering the parts by projection,
        how the subspaces are learned, Q/K/V, and a free-play sandbox.
      </footer>
    </main>
  )
}
