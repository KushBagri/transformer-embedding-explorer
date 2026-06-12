// Temporary section used in M2 to prove the pipeline end-to-end: prose +
// sticky visual layout, scroll-linked Framer Motion animation, and live reads
// from the shared ModelProvider. Real sections replace these in M3+.

import { motion, useTransform, type MotionValue } from 'framer-motion'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { MathInline } from '../ui/MathInline'
import { useModel } from '../state/modelContext'

export interface PlaceholderSectionProps {
  id: string
  eyebrow: string
  title: string
  body: string[]
  takeaway: string
}

function PlaceholderVisual({ progress }: { progress: MotionValue<number> }) {
  const model = useModel()
  const width = useTransform(progress, [0, 1], ['0%', '100%'])
  const first = Array.from(model.combined.data.slice(0, model.dModel))

  return (
    <Card>
      <p className="mb-3 text-sm text-prose-dim">
        Live from the shared model · seq {model.tokens.length} · d_model {model.dModel}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {model.tokens.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="rounded-md bg-combined/15 px-2 py-1 font-mono text-sm text-combined-soft"
          >
            {t}
          </span>
        ))}
      </div>

      <p className="mb-1 text-xs uppercase tracking-widest text-prose-dim">
        scroll progress
      </p>
      <div className="mb-4 h-3 overflow-hidden rounded-full bg-surface-2">
        <motion.div className="h-full rounded-full bg-combined" style={{ width }} />
      </div>

      <p className="mb-1 text-xs uppercase tracking-widest text-prose-dim">
        combined[0] row
      </p>
      <p className="font-mono text-xs leading-relaxed text-prose">
        [{first.map((x) => x.toFixed(2)).join(', ')}]
      </p>
    </Card>
  )
}

export function PlaceholderSection({
  id,
  eyebrow,
  title,
  body,
  takeaway,
}: PlaceholderSectionProps) {
  return (
    <SectionShell
      id={id}
      eyebrow={eyebrow}
      title={title}
      visual={(progress) => <PlaceholderVisual progress={progress} />}
    >
      {body.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
      <Callout>{takeaway}</Callout>
      <p className="text-sm text-prose-dim">
        Scaffolding only — this visual is replaced by a real one. The math is
        already live: <MathInline>token + position = combined</MathInline>.
      </p>
    </SectionShell>
  )
}
