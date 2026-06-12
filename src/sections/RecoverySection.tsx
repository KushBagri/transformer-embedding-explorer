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
import { VectorScene } from '../viz/three/VectorScene'
import { Arrow3D } from '../viz/three/Arrow3D'

const AMBER = '#f59e0b'
const CYAN = '#22d3ee'
const VIOLET = '#a78bfa'

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

      <Callout accent="combined">
        Adding stacked the two signals into one point. A projection — a shadow —
        pulls either one back out untouched. That projection is exactly what the
        Q/K/V layers, coming up next, are built from.
      </Callout>
    </SectionShell>
  )
}
