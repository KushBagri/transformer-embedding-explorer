// Scroll-progress for a single section. Returns a ref to attach to the
// section element and a 0->1 MotionValue that tracks the element travelling
// from entering the viewport (0) to leaving it (1). Visuals read this to
// drive scroll-linked animation without triggering React re-renders.

import { useRef } from 'react'
import { useScroll, type MotionValue } from 'framer-motion'

export interface SectionProgress {
  ref: React.RefObject<HTMLDivElement | null>
  progress: MotionValue<number>
}

export function useSectionProgress(): SectionProgress {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  return { ref, progress: scrollYProgress }
}
