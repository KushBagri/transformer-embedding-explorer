// M0 tooling spike — THROWAWAY. Proves React 19 + Vite 8 + R3F v9 + drei v10 +
// Framer Motion + Tailwind v4 all compile and render together. Replaced in M2.
import { useRef } from 'react'
import type { Mesh } from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { motion } from 'framer-motion'

function SpinningCube() {
  const meshRef = useRef<Mesh>(null)

  useFrame((_state, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += delta * 0.4
    meshRef.current.rotation.y += delta * 0.6
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#aa3bff" />
    </mesh>
  )
}

export default function App() {
  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100">
      <div className="h-[60vh] w-full">
        <Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <SpinningCube />
          <OrbitControls enablePan={false} />
        </Canvas>
      </div>

      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <motion.h1
          className="text-4xl font-semibold tracking-tight text-violet-400"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          Stack spike OK
        </motion.h1>
        <p className="max-w-md text-neutral-400">
          R3F v9 + drei v10 + Framer Motion + Tailwind v4 render under React 19 /
          Vite 8. Scroll triggered this fade; the cube above is a live WebGL scene.
        </p>
      </div>
    </div>
  )
}
