// A 3D arrow from one point to another, built on three's ArrowHelper (which
// handles the orientation math for any direction). Colors take our hex strings.

import { useMemo } from 'react'
import { ArrowHelper, Color, Vector3 } from 'three'

type Vec3 = [number, number, number]

export function Arrow3D({
  to,
  from = [0, 0, 0],
  color,
}: {
  to: Vec3
  from?: Vec3
  color: string
}) {
  const helper = useMemo(() => {
    const origin = new Vector3(from[0], from[1], from[2])
    const dir = new Vector3(to[0], to[1], to[2]).sub(origin)
    const len = dir.length() || 1e-6
    return new ArrowHelper(
      dir.clone().normalize(),
      origin,
      len,
      new Color(color).getHex(),
      Math.min(0.4, len * 0.16),
      Math.min(0.22, len * 0.1),
    )
  }, [from, to, color])

  return <primitive object={helper} />
}
