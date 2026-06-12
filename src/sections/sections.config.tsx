// Ordered registry of narrative sections. 3D sections (embeddings, recovery,
// subspaces, Q/K/V, mini-transformer) and the sandbox slot in here in M4+.

import type { ComponentType } from 'react'
import { ColdOpenSection } from './ColdOpenSection'
import { AdditionSection } from './AdditionSection'
import { HighDimSection } from './HighDimSection'
import { SinusoidalSection } from './SinusoidalSection'
import { AttentionSection } from './AttentionSection'

export interface SectionEntry {
  id: string
  Component: ComponentType
}

export const SECTIONS: SectionEntry[] = [
  { id: 'cold-open', Component: ColdOpenSection },
  { id: 'addition', Component: AdditionSection },
  { id: 'high-dim', Component: HighDimSection },
  { id: 'sinusoidal', Component: SinusoidalSection },
  { id: 'attention', Component: AttentionSection },
]
