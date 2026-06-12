// Section 0 — the hook. As you scroll, a token's meaning vector (amber) and
// its position vector (cyan) slide together and fuse into a single combined
// vector (violet). Mechanically: this is the addition the whole story is about.

import { motion, useTransform, type MotionValue } from 'framer-motion'
import { SectionShell } from './SectionShell'
import { Callout } from '../ui/Callout'
import { useModel } from '../state/modelContext'

function Bar({ label, sublabel, className }: { label: string; sublabel: string; className: string }) {
  return (
    <div className={`flex h-28 w-28 flex-col items-center justify-center rounded-2xl ${className}`}>
      <span className="font-mono text-lg font-semibold">{label}</span>
      <span className="mt-1 text-xs opacity-80">{sublabel}</span>
    </div>
  )
}

function ColdOpenVisual({ progress }: { progress: MotionValue<number> }) {
  const model = useModel()
  const word = model.tokens[0] ?? 'the'

  const tokenX = useTransform(progress, [0, 0.55], [-90, 0])
  const posX = useTransform(progress, [0, 0.55], [90, 0])
  const splitOpacity = useTransform(progress, [0.5, 0.7], [1, 0])
  const combinedOpacity = useTransform(progress, [0.55, 0.8], [0, 1])
  const combinedScale = useTransform(progress, [0.55, 0.85], [0.7, 1])
  const opSymbol = useTransform(progress, [0.5, 0.7], [1, 0])

  return (
    <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-edge bg-surface-2">
      <motion.div className="absolute" style={{ x: tokenX, opacity: splitOpacity }}>
        <Bar label={word} sublabel="meaning" className="bg-token/20 text-token-soft" />
      </motion.div>

      <motion.div className="absolute text-3xl text-prose-dim" style={{ opacity: opSymbol }}>
        +
      </motion.div>

      <motion.div className="absolute" style={{ x: posX, opacity: splitOpacity }}>
        <Bar label="pos 0" sublabel="position" className="bg-position/20 text-position-soft" />
      </motion.div>

      <motion.div className="absolute" style={{ opacity: combinedOpacity, scale: combinedScale }}>
        <Bar label={`${word}₀`} sublabel="combined" className="bg-combined/25 text-combined-soft" />
      </motion.div>
    </div>
  )
}

export function ColdOpenSection() {
  return (
    <SectionShell
      id="cold-open"
      eyebrow="The paradox"
      title="Two vectors walk in. One walks out."
      visual={(progress) => <ColdOpenVisual progress={progress} />}
    >
      <p>
        Before a transformer does anything clever, it turns each word into a
        vector of numbers (its <span className="text-token-soft">meaning</span>)
        and adds a second vector that encodes{' '}
        <span className="text-position-soft">where the word sits</span> in the
        sentence.
      </p>
      <p>
        Add them and you get one <span className="text-combined-soft">combined</span>{' '}
        vector. Scroll and watch it happen — two things become one.
      </p>
      <Callout accent="neutral">
        If you blend two colors of paint you can't get them back. So how does the
        network still know the word's position after this?
      </Callout>
    </SectionShell>
  )
}
