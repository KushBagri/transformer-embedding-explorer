// Ordered registry of narrative sections. 3D sections (embeddings, recovery,
// subspaces, Q/K/V, mini-transformer) and the sandbox slot in here in M4+.

import type { ComponentType } from 'react'
import { MotivationSection } from './MotivationSection'
import { ColdOpenSection } from './ColdOpenSection'
import { AdditionSection } from './AdditionSection'
import { HighDimSection } from './HighDimSection'
import { SinusoidalSection } from './SinusoidalSection'
import { AttentionSection } from './AttentionSection'
// 3D sections are lazy (code-split three.js / r3f) — see *Lazy modules.
import { EmbeddingSection } from './EmbeddingLazy'
import { RecoverySection } from './RecoveryLazy'

export interface SectionEntry {
  id: string
  Component: ComponentType
}

export const SECTIONS: SectionEntry[] = [
  { id: 'why-add', Component: MotivationSection },
  { id: 'cold-open', Component: ColdOpenSection },
  { id: 'embeddings', Component: EmbeddingSection },
  { id: 'addition', Component: AdditionSection },
  { id: 'high-dim', Component: HighDimSection },
  { id: 'recovery', Component: RecoverySection },
  { id: 'sinusoidal', Component: SinusoidalSection },
  { id: 'attention', Component: AttentionSection },
]
