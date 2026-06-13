// Section (3D) — "reading the parts back out", made literal. The combined
// vector is a point floating in a room. Meaning lives in the floor (a 2D
// subspace); position is height above it (a perpendicular 1D direction). The
// point's shadow on the floor recovers meaning; its height recovers position.
// Move one and the other doesn't budge — perpendicular = non-interfering.

import { useState, type ReactNode } from 'react'
import { DoubleSide } from 'three'
import { Line, Html } from '@react-three/drei'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Slider } from '../ui/Slider'
import { Analogy } from '../ui/Analogy'
import { SubHeading } from '../ui/SubHeading'
import { MathInline } from '../ui/MathInline'
import { Formula } from '../ui/Formula'
import { VectorScene } from '../viz/three/VectorScene'
import { Arrow3D } from '../viz/three/Arrow3D'
import { ROLE_COLOR } from '../viz/primitives/ColorScale'

const { token: AMBER, position: CYAN, combined: VIOLET } = ROLE_COLOR

type Vec3 = [number, number, number]

function Label({ pos, color, children }: { pos: Vec3; color: string; children: ReactNode }) {
  return (
    <Html position={pos} center>
      <span
        className="pointer-events-none whitespace-nowrap rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium"
        style={{ color }}
      >
        {children}
      </span>
    </Html>
  )
}

function RecoveryScene({ mx, mz, p }: { mx: number; mz: number; p: number }) {
  const P: Vec3 = [mx, p, mz]
  const S: Vec3 = [mx, 0, mz]
  return (
    <>
      {/* meaning subspace = the floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color={AMBER} transparent opacity={0.1} side={DoubleSide} />
      </mesh>
      <Line points={[[-3, 0, 0], [3, 0, 0]]} color={AMBER} lineWidth={1} />
      <Line points={[[0, 0, -3], [0, 0, 3]]} color={AMBER} lineWidth={1} />

      {/* position direction = the vertical axis */}
      <Line points={[[0, 0, 0], [0, 3, 0]]} color={CYAN} lineWidth={1} />

      {/* recovered position: height of the point above the floor */}
      <Line points={[[0, 0, 0], [0, p, 0]]} color={CYAN} lineWidth={4} />
      <mesh position={[0, p, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={CYAN} />
      </mesh>

      {/* recovered meaning: the shadow on the floor */}
      <Arrow3D to={S} color={AMBER} />
      <mesh position={S}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={AMBER} />
      </mesh>

      {/* the combined vector and its drop-line (the projection) */}
      <Arrow3D to={P} color={VIOLET} />
      <mesh position={P}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={VIOLET} />
      </mesh>
      <Line points={[P, S]} color={CYAN} lineWidth={1.5} dashed dashSize={0.15} gapSize={0.1} />

      <Label pos={[mx, p + 0.35, mz]} color={VIOLET}>
        combined
      </Label>
      <Label pos={[mx, 0.12, mz + 0.05]} color={AMBER}>
        meaning = shadow
      </Label>
      <Label pos={[0.05, p / 2, 0]} color={CYAN}>
        position = height
      </Label>
    </>
  )
}

export function RecoverySection() {
  const [mx, setMx] = useState(1.4)
  const [mz, setMz] = useState(-1)
  const [p, setP] = useState(1.8)

  return (
    <SectionShell
      id="recovery"
      eyebrow="Reading it back out"
      title="Meaning is the shadow; position is the height"
      visual={() => (
        <Card>
          <VectorScene>
            <RecoveryScene mx={mx} mz={mz} p={p} />
          </VectorScene>
          <p className="mt-2 text-center text-xs text-prose-dim">
            drag to orbit · the violet point is the combined vector
          </p>
        </Card>
      )}
    >
      <p>
        We proved the parts are separable when they sit on perpendicular
        directions. Here's what "reading one back out" actually looks like — and
        you can spin it around.
      </p>

      <Analogy label="Picture this — a shadow on the floor">
        <p>
          Think of the room you're in. The <strong className="text-token-soft">floor</strong>{' '}
          is where <span className="text-token-soft">meaning</span> lives — a flat
          2D world. <strong className="text-position-soft">Height</strong> above
          the floor is <span className="text-position-soft">position</span> — a
          single direction, straight up, perpendicular to the entire floor.
        </p>
        <p>
          The <span className="text-combined-soft">combined</span> vector is a
          point floating in the room. To recover meaning, look at its{' '}
          <strong>shadow on the floor</strong>. To recover position, look at its{' '}
          <strong>height</strong>. From one floating point you get both — cleanly.
        </p>
      </Analogy>

      <p>
        Now the crucial part. Drag <strong className="text-position-soft">position</strong>{' '}
        up and down: the point rises and falls, but its{' '}
        <strong>shadow doesn't move at all</strong>. Drag{' '}
        <strong className="text-token-soft">meaning</strong> around: the shadow
        slides across the floor, but the <strong>height never changes</strong>.
      </p>
      <div className="flex flex-col gap-2">
        <Slider label="meaning — left/right" min={-2} max={2} step={0.1} value={mx} format={(v) => v.toFixed(1)} accent="token" onChange={setMx} />
        <Slider label="meaning — front/back" min={-2} max={2} step={0.1} value={mz} format={(v) => v.toFixed(1)} accent="token" onChange={setMz} />
        <Slider label="position — height" min={0} max={2.6} step={0.1} value={p} format={(v) => v.toFixed(1)} accent="position" onChange={setP} />
      </div>
      <p>
        That total independence is what "perpendicular" buys you: changing one
        leaves the other untouched. The shadow and the height never talk to each
        other.
      </p>

      <p>
        And dropping the point straight down to its shadow <em>is</em> the
        projection from the last section — the dot product that keeps the meaning
        part and throws away the position part. The only difference in a real
        model: the "floor" isn't the literal ground but a tilted, high-dimensional
        subspace, and "straight down" means perpendicular to it.
      </p>

      <SubHeading>A filter is just a matrix</SubHeading>
      <p>
        "Dropping to the shadow" sounds geometric and fuzzy. It is not. The shadow is
        computed by an ordinary <strong className="text-prose-bright">matrix multiplication</strong> — a
        grid of numbers you multiply your vector by. A matrix used this way is a{' '}
        <strong className="text-prose-bright">filter</strong>: it lets some directions of
        the vector pass through and zeros out the rest. Let's build one by hand, small
        enough that you can check every number yourself.
      </p>
      <p>
        Shrink the world down to just four dimensions. Put{' '}
        <span className="text-token-soft">meaning</span> in the first two slots and{' '}
        <span className="text-position-soft">position</span> in the last two — that is
        our toy version of "perpendicular directions":
      </p>
      <div className="rounded-xl border border-edge bg-surface-2 p-3 font-mono text-xs leading-relaxed text-prose">
        <span className="text-token-soft">A</span> = [ 1, 2, 0, 0 ]&nbsp;&nbsp;&nbsp;<span className="text-prose-dim">// meaning — lives in dims 0,1</span><br />
        <span className="text-position-soft">B</span> = [ 0, 0, 3, 4 ]&nbsp;&nbsp;&nbsp;<span className="text-prose-dim">// position — lives in dims 2,3</span><br />
        <br />
        <span className="text-prose-dim">// are they perpendicular? dot product = sum of slot-by-slot products</span><br />
        <span className="text-token-soft">A</span>·<span className="text-position-soft">B</span> = (1)(0) + (2)(0) + (0)(3) + (0)(4) = <span className="text-prose-bright">0</span>&nbsp;&nbsp;✓<br />
        <br />
        <span className="text-prose-dim">// add them — this is the single combined vector the model stores</span><br />
        <span className="text-combined-soft">C</span> = <span className="text-token-soft">A</span> + <span className="text-position-soft">B</span> = [ 1, 2, 3, 4 ]
      </div>
      <p>
        A <MathInline>dot product</MathInline> of zero is the number-on-screen proof that
        <span className="text-token-soft"> A</span> and{' '}
        <span className="text-position-soft">B</span> point in non-overlapping
        directions. Now build the filter. To keep only meaning, write a matrix that
        copies the first two slots and erases the last two — an identity on the meaning
        rows, zeros everywhere else:
      </p>
      <div className="rounded-xl border border-edge bg-surface-2 p-3 font-mono text-xs leading-relaxed text-prose">
        <span className="text-token-soft">W_token</span> = | 1 0 0 0 |&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-position-soft">W_pos</span> = | 0 0 0 0 |<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| 0 1 0 0 |&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| 0 0 0 0 |<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| 0 0 0 0 |&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| 0 0 1 0 |<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| 0 0 0 0 |&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| 0 0 0 1 |<br />
        <br />
        <span className="text-prose-dim">// each output slot = that row, multiplied slot-by-slot into C, summed</span><br />
        <span className="text-token-soft">W_token</span>·<span className="text-combined-soft">C</span> = [ 1·1, 1·2, 0, 0 ] = [ 1, 2, 0, 0 ] = <span className="text-token-soft">A</span>&nbsp;&nbsp;✓<br />
        <span className="text-position-soft">W_pos</span>&nbsp;&nbsp;·<span className="text-combined-soft">C</span> = [ 0, 0, 1·3, 1·4 ] = [ 0, 0, 3, 4 ] = <span className="text-position-soft">B</span>&nbsp;&nbsp;✓
      </div>
      <p>
        Read those two lines slowly — they are the whole payoff. From the one combined
        vector <span className="text-combined-soft">C</span> = [1, 2, 3, 4], one matrix
        pulled back <span className="text-token-soft">A</span> = [1, 2, 0, 0]{' '}
        <em>exactly</em>, and a second pulled back{' '}
        <span className="text-position-soft">B</span> = [0, 0, 3, 4]{' '}
        <em>exactly</em>. Nothing was lost in the addition. The information was just
        waiting for the right filter.
      </p>
      <p>
        Why is it guaranteed to work, and not just luck with these numbers? One line of
        algebra. Matrix multiplication is <strong className="text-prose-bright">linear</strong>,
        which means multiplying a sum is the same as multiplying each piece and adding:
      </p>
      <Formula label="linearity is the engine — the filter never sees C as a tangle, only as A plus B">
        <span className="text-token-soft">W_token</span>·<span className="text-combined-soft">C</span> = <span className="text-token-soft">W_token</span>·(<span className="text-token-soft">A</span> + <span className="text-position-soft">B</span>) = <span className="text-token-soft">W_token</span>·<span className="text-token-soft">A</span> + <span className="text-token-soft">W_token</span>·<span className="text-position-soft">B</span> = <span className="text-token-soft">A</span> + <span className="text-prose-dim">0</span> = <span className="text-token-soft">A</span>
      </Formula>
      <p>
        The filter is designed to keep meaning (<MathInline>W_token·A = A</MathInline>)
        and to kill position (<MathInline>W_token·B = 0</MathInline>). Because of
        linearity, those two effects happen independently inside the sum: the position
        term collapses to zero and quietly drops out, leaving meaning standing alone.
        Swap the roles and you have <span className="text-position-soft">W_pos</span>,
        which kills meaning and keeps position. That is the shadow and the height, written
        as arithmetic.
      </p>
      <Analogy label="Picture this — a sound mixing board">
        <p>
          You are at a concert. Vocals, guitar, bass, and drums all reach the
          soundboard as a single combined signal —{' '}
          <span className="text-combined-soft">C</span> = vocals + guitar + bass +
          drums — one wire carrying everything at once. It looks hopelessly blended,
          the way [1, 2, 3, 4] looks like one lump of numbers.
        </p>
        <p>
          Yet the sound engineer slides one fader and out comes <strong>just the
          vocals</strong>; another fader, <strong>just the bass</strong>. Each channel
          on the board is tuned to let one instrument through and block the rest —
          exactly what <span className="text-token-soft">W_token</span> and{' '}
          <span className="text-position-soft">W_pos</span> just did. The instruments
          were never destroyed by being summed onto one wire. They were separable all
          along, because the board knows which channel each one lives on.
        </p>
      </Analogy>
      <p>
        Here is the bridge to everything that follows. We hand-wrote{' '}
        <span className="text-token-soft">W_token</span> and{' '}
        <span className="text-position-soft">W_pos</span> as tidy grids of ones and
        zeros. A real Transformer does not. It <strong className="text-prose-bright">learns</strong>
        its filters — the matrices called <MathInline>W_Q</MathInline>,{' '}
        <MathInline>W_K</MathInline>, and <MathInline>W_V</MathInline> that the next
        section is built around — by adjusting their numbers during training until they
        isolate whatever the task needs. Same idea, three differences: the numbers are
        messy fractions instead of clean 1s and 0s; the meaning and position subspaces
        are tilted at odd angles rather than lined up with the slots; and the recovery
        is <em>approximately</em> exact instead of perfectly exact, because real
        embeddings are only <em>nearly</em> perpendicular. The mixing board is the same
        mixing board — its faders were simply tuned by gradient descent rather than by
        us.
      </p>

      <Callout accent="combined">
        Adding stacked the two signals into one point. A projection — a shadow —
        pulls either one back out untouched. That projection is exactly what the
        Q/K/V layers, coming up next, are built from.
      </Callout>
    </SectionShell>
  )
}
