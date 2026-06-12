// Named starting configurations. The default drives the guided narrative; the
// others are quick jumping-off points for the sandbox.

import { PEKind } from '../math'
import type { ModelInputs } from './modelContext'
import { tokenize } from './embeddings'

export interface Preset {
  name: string
  description: string
  inputs: ModelInputs
}

function preset(
  name: string,
  description: string,
  sentence: string,
  overrides: Partial<ModelInputs> = {},
): Preset {
  return {
    name,
    description,
    inputs: {
      tokens: tokenize(sentence),
      dModel: 16,
      dHead: 8,
      seed: 1,
      peKind: PEKind.Sinusoidal,
      temperature: 1,
      ...overrides,
    },
  }
}

export const PRESETS: Preset[] = [
  preset('The cat', 'The canonical example sentence.', 'the cat sat on the mat'),
  preset('Repeats', 'Same word twice — position is the only difference.', 'time after time'),
  preset('Order matters', 'Reversing this changes the meaning.', 'dog bites man'),
]

export const DEFAULT_INPUTS: ModelInputs = PRESETS[0].inputs
