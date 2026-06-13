// Section (3D) — what a "meaning vector" actually is. Each word is a point in
// space; similar words cluster; and crucially, directions carry meaning. The
// step from man -> king ("add royalty") is the same step as woman -> queen, so
// king - man + woman lands on queen. Coordinates are hand-placed to show the
// structure cleanly (real embeddings do this in hundreds of dimensions).

import { useState } from 'react'
import { AdditiveBlending } from 'three'
import { Html } from '@react-three/drei'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Toggle } from '../ui/Toggle'
import { Analogy } from '../ui/Analogy'
import { VectorScene } from '../viz/three/VectorScene'
import { Arrow3D } from '../viz/three/Arrow3D'
import { ROLE_COLOR } from '../viz/primitives/ColorScale'

const { token: AMBER, combined: VIOLET } = ROLE_COLOR

type Vec3 = [number, number, number]

interface Word {
  w: string
  p: Vec3
  analogy: boolean // part of the king/queen analogy group
}

const WORDS: Word[] = [
  { w: 'man', p: [-1, 0, 0], analogy: true },
  { w: 'king', p: [-1, 1.6, 0], analogy: true },
  { w: 'woman', p: [1, 0, 0], analogy: true },
  { w: 'queen', p: [1, 1.6, 0], analogy: true },
  { w: 'cat', p: [-1.5, -1.3, 1.9], analogy: false },
  { w: 'dog', p: [-0.5, -1.5, 2.1], analogy: false },
  { w: 'kitten', p: [-1.6, -0.7, 1.8], analogy: false },
  { w: 'puppy', p: [-0.6, -0.8, 2.0], analogy: false },
]

function WordPoint({
  word,
  hovered,
  dim,
  onOver,
  onOut,
}: {
  word: Word
  hovered: boolean
  dim: boolean
  onOver: () => void
  onOut: () => void
}) {
  return (
    <group position={word.p}>
      {/* soft additive glow halo on hover */}
      {hovered && (
        <mesh>
          <sphereGeometry args={[0.44, 24, 24]} />
          <meshBasicMaterial
            color={AMBER}
            transparent
            opacity={0.16}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
      {/* the word point — emissive so the whole constellation glows */}
      <mesh onPointerOver={onOver} onPointerOut={onOut} scale={hovered ? 1.55 : 1}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial
          color={AMBER}
          emissive={AMBER}
          emissiveIntensity={hovered ? 1.5 : 0.4}
          roughness={0.35}
          transparent
          opacity={dim ? 0.25 : 1}
          toneMapped={false}
        />
      </mesh>
      <Html position={[0, 0.34, 0]} center>
        <span
          className="pointer-events-none whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-xs transition-all duration-200"
          style={{
            color: hovered ? '#ffffff' : AMBER,
            backgroundColor: hovered ? 'rgba(245,158,11,0.22)' : 'rgba(0,0,0,0.5)',
            borderColor: hovered ? AMBER : 'transparent',
            boxShadow: hovered ? '0 0 16px 2px rgba(245,158,11,0.55)' : 'none',
            opacity: dim ? 0.4 : 1,
            transform: hovered ? 'scale(1.18)' : 'scale(1)',
            fontWeight: hovered ? 700 : 500,
          }}
        >
          {word.w}
        </span>
      </Html>
    </group>
  )
}

function EmbeddingScene({ analogyOn }: { analogyOn: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <>
      {WORDS.map((word) => (
        <WordPoint
          key={word.w}
          word={word}
          hovered={hovered === word.w}
          dim={analogyOn && !word.analogy}
          onOver={() => setHovered(word.w)}
          onOut={() => setHovered((h) => (h === word.w ? null : h))}
        />
      ))}

      {analogyOn && (
        <>
          {/* the same "royalty" direction, applied to man and to woman */}
          <Arrow3D from={[-1, 0, 0]} to={[-1, 1.6, 0]} color={VIOLET} />
          <Arrow3D from={[1, 0, 0]} to={[1, 1.6, 0]} color={VIOLET} />
          <Html position={[0, 1.9, 0]} center>
            <span
              className="pointer-events-none whitespace-nowrap rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium"
              style={{ color: VIOLET }}
            >
              + "royalty"
            </span>
          </Html>
        </>
      )}
    </>
  )
}

export function EmbeddingSection() {
  const [analogyOn, setAnalogyOn] = useState(false)

  return (
    <SectionShell
      id="embeddings"
      eyebrow="What's a meaning vector?"
      title="A word is a point in space"
      visual={() => (
        <Card>
          <VectorScene>
            <EmbeddingScene analogyOn={analogyOn} />
          </VectorScene>
          <p className="mt-2 text-center text-xs text-prose-dim">
            drag to orbit · hover a word
          </p>
        </Card>
      )}
    >
      <p>
        We keep saying a word's <span className="text-token-soft">meaning</span>{' '}
        is a "vector." Concretely: turn the word into a list of numbers, and read
        that list as coordinates. Every word becomes a{' '}
        <strong>point in space</strong>.
      </p>
      <p>
        That sounds arbitrary until you see what gets learned. Words used in
        similar ways end up <strong>near each other</strong> — spin the scene and
        you'll find the animals huddled together in one corner, far from the
        royalty. Closeness in space means closeness in meaning.
      </p>

      <Analogy label="Picture this — directions carry meaning">
        <p>
          Look at the step from <span className="font-mono">man</span> to{' '}
          <span className="font-mono">king</span>. That little arrow means "make
          it royal." Here's the striking part: the <em>exact same arrow</em>,
          starting from <span className="font-mono">woman</span>, lands you on{' '}
          <span className="font-mono">queen</span>.
        </p>
        <p>
          So "royalty" isn't stored in a word — it's stored in a{' '}
          <strong>direction</strong> that works anywhere in the space. Follow it
          from man and you get king; follow it from woman and you get queen.
        </p>
      </Analogy>

      <Toggle label="show the royalty direction" checked={analogyOn} onChange={setAnalogyOn} />

      <p>
        In vector terms that's the famous{' '}
        <span className="font-mono text-combined-soft">king − man + woman ≈ queen</span>
        : take king, subtract the man-direction, add the woman-direction, and you
        arrive at queen. Meaning is literally <em>which way</em> a point sits
        relative to the others.
      </p>

      <Callout accent="token">
        This is the amber meaning vector from the rest of the page — a point whose{' '}
        <em>direction</em> encodes what the word is about. Next we'll see how the
        model tells that apart from the position we added to it.
      </Callout>
    </SectionShell>
  )
}
