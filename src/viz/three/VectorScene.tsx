// A reusable react-three-fiber stage for the 3D sections: one self-contained
// Canvas with lighting and orbit controls. frameloop="demand" means it only
// redraws when something changes (a slider moves, the user drags) — so several
// of these can sit on one page without spinning the fans.

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { ReactNode } from 'react'

export function VectorScene({
  children,
  height = 440,
}: {
  children: ReactNode
  height?: number
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-surface-2" style={{ height }}>
      <Canvas frameloop="demand" dpr={[1, 2]} camera={{ position: [4.5, 3.5, 5], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 10, 6]} intensity={1.1} />
        {children}
        <OrbitControls enablePan={false} makeDefault minDistance={3} maxDistance={14} />
      </Canvas>
    </div>
  )
}
