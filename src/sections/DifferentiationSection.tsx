// Section — the crux question: HOW does the transformer tell meaning and
// position apart? Answer: it never un-mixes the sum. It reads along a learned
// "tuner" direction (a dot product); a tuner aimed at one perpendicular subspace
// is deaf to the other. And nobody assigns the directions — training finds them.
// The visual lets you steer a tuner and watch it pick up pure meaning, pure
// position, or a chosen blend.

import { useState } from 'react'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Slider } from '../ui/Slider'
import { Analogy } from '../ui/Analogy'
import { SubHeading } from '../ui/SubHeading'
import { MathInline } from '../ui/MathInline'
import { Axes2D } from '../viz/primitives/Axes2D'
import { ROLE_COLOR } from '../viz/primitives/ColorScale'

const M = 3 // meaning amount of the combined vector (fixed)
const P = 2 // position amount
const TUNER = '#e2e8f0'
const { token: AMBER, position: CYAN, combined: VIOLET } = ROLE_COLOR

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100)
  return (
    <div>
      <div className="mb-0.5 flex justify-between text-xs">
        <span className="text-prose-dim">{label}</span>
        <span className="font-mono" style={{ color }}>
          {value.toFixed(2)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export function DifferentiationSection() {
  const [theta, setTheta] = useState(0) // degrees from the meaning axis
  const rad = (theta * Math.PI) / 180
  const ux = Math.cos(rad)
  const uy = Math.sin(rad)
  const meaningRead = M * ux
  const positionRead = P * uy
  const readout = meaningRead + positionRead

  const size = 340
  const dom: [number, number] = [-5, 5]

  return (
    <SectionShell
      id="differentiate"
      eyebrow="The real question"
      title="So how does it tell them apart?"
      visual={() => (
        <Card>
          <Axes2D width={size} height={size} xDomain={dom} yDomain={dom} xLabel="meaning" yLabel="position">
            {(s) => (
              <>
                {/* the tuner: a read-out direction through the origin */}
                <line
                  x1={s.x(-6 * ux)}
                  y1={s.y(-6 * uy)}
                  x2={s.x(6 * ux)}
                  y2={s.y(6 * uy)}
                  stroke={TUNER}
                  strokeWidth={2}
                  strokeOpacity={0.85}
                />
                {/* drop the combined vector onto the tuner — that's the read-out */}
                <line
                  x1={s.x(M)}
                  y1={s.y(P)}
                  x2={s.x(readout * ux)}
                  y2={s.y(readout * uy)}
                  stroke={TUNER}
                  strokeDasharray="4 3"
                  strokeOpacity={0.5}
                />
                {/* the combined vector */}
                <line x1={s.x(0)} y1={s.y(0)} x2={s.x(M)} y2={s.y(P)} stroke={VIOLET} strokeWidth={3} />
                <circle cx={s.x(M)} cy={s.y(P)} r={5} fill={VIOLET} />
                <text x={s.x(M) + 8} y={s.y(P) - 6} fill={VIOLET} className="text-[11px]">
                  combined
                </text>
                {/* the read-out point on the tuner */}
                <circle cx={s.x(readout * ux)} cy={s.y(readout * uy)} r={5} fill={TUNER} />
                <text x={s.x(6 * ux) - 30} y={s.y(6 * uy) + 14} fill={TUNER} className="text-[10px]">
                  tuner
                </text>
              </>
            )}
          </Axes2D>

          <div className="mt-4 flex flex-col gap-2">
            <Bar label="meaning picked up  (3 · cos θ)" value={meaningRead} max={3} color={AMBER} />
            <Bar label="position picked up  (2 · sin θ)" value={positionRead} max={3} color={CYAN} />
            <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-2 text-sm">
              <span className="text-prose-dim">read-out value</span>
              <span className="font-mono text-prose-bright">{readout.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheta(0)}
              className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-prose transition-colors hover:bg-white/10"
            >
              tune to meaning
            </button>
            <button
              type="button"
              onClick={() => setTheta(90)}
              className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-prose transition-colors hover:bg-white/10"
            >
              tune to position
            </button>
          </div>
          <div className="mt-3">
            <Slider
              label="tuner angle"
              min={0}
              max={90}
              step={1}
              value={theta}
              format={(v) => `${v}° from meaning`}
              onChange={setTheta}
            />
          </div>
        </Card>
      )}
    >
      <p>
        Fair — and this is the real question, the one everything so far has been
        circling. We've shown that <span className="text-token-soft">meaning</span>{' '}
        and <span className="text-position-soft">position</span> sit on
        perpendicular directions and that a projection can lift one out cleanly.
        But that just moves the puzzle: how does the transformer know which
        direction is which — and how does it pull one out without first un-mixing
        the sum?
      </p>

      <SubHeading>It never un-mixes them</SubHeading>
      <Analogy label="Picture this — a radio">
        <p>
          Dozens of stations broadcast at once. They all arrive at your antenna as
          a <strong>single combined wave</strong> — already summed, exactly like
          our combined vector. Your radio does not tear that wave back into
          separate stations.
        </p>
        <p>
          It <strong>tunes</strong> to one frequency, and the tuner is naturally
          deaf to all the others. One wire, many signals, one knob to pick the one
          you want.
        </p>
      </Analogy>
      <p>
        That's the whole trick. The transformer never builds a "meaning pile" and
        a "position pile". The combined vector stays whole. The model just{' '}
        <strong>tunes</strong> to whatever it wants to read.
      </p>

      <SubHeading>It reads with a tuner</SubHeading>
      <p>
        A "tuner" here is simply a <strong>direction</strong>. To read the
        combined vector along a direction, you take their dot product —{' '}
        <MathInline>combined · tuner</MathInline> — which is exactly the
        shadow/projection from a moment ago. Here's where perpendicularity earns
        its keep: a tuner aimed along the <span className="text-token-soft">meaning</span>{' '}
        axis multiplies the <span className="text-position-soft">position</span>{' '}
        part by zero, so it picks up <em>pure meaning</em> and is blind to
        position. Aim it the other way and the reverse happens.
      </p>
      <p>
        Drag the tuner in the panel. At <MathInline>0°</MathInline> (aimed at
        meaning) the read-out is pure meaning and position contributes nothing;
        swing it to <MathInline>90°</MathInline> and it reads pure position. Park
        it in between and it reads a deliberate <em>blend</em> — and that's
        allowed too. A tuner doesn't have to sit on an axis; it reads exactly the
        mix its direction specifies.
      </p>

      <SubHeading>Nobody hands it the directions — it learns them</SubHeading>
      <p>
        So what sets the tuner directions? <strong>Training.</strong> Nobody
        writes down "meaning points this way, position points that way." The model
        starts with <em>random</em> read-out matrices and random token embeddings,
        and the loss does the steering: if a tuner that needs a word's meaning
        happens to point where position lives, it grabs the wrong thing,
        predictions get worse, and the gradient nudges that direction back. Over
        millions of steps the read-out directions settle onto whichever subspaces
        carry the information each computation actually needs.
      </p>
      <p>
        The same pressure shapes the <em>inputs</em>. The token-embedding table is
        learned too — and if a word's meaning landed on the same directions as the
        positional code, the two would interfere and the loss would punish it. So
        meaning gets pushed onto directions the position code leaves free. (The
        sinusoidal position code in the next section occupies a fixed, structured
        subspace, which gives meaning a clear, stable place to avoid.)
      </p>

      <SubHeading>And it has many tuners</SubHeading>
      <p>
        A real layer isn't one tuner but hundreds — the rows of the learned{' '}
        <span className="text-combined-soft">Q</span>,{' '}
        <span className="text-combined-soft">K</span> and{' '}
        <span className="text-combined-soft">V</span> matrices, across many heads.
        One head's query can tune toward position (so it can act on "the token just
        before me"); another tunes toward meaning (so it can find related words);
        most read some learned blend. The Q/K/V section opens up those exact
        tuners.
      </p>

      <Callout accent="combined">
        The transformer never separates meaning from position. It learns read-out
        directions — tuners — and a tuner aimed at one subspace is deaf to the
        perpendicular one. "Telling them apart" is nothing more than which way the
        learned weights point.
      </Callout>
    </SectionShell>
  )
}
