// Ordered registry of narrative sections. In M2 this holds two placeholders to
// exercise the scroll pipeline; real sections (00..10) slot in here in M3+.

import type { PlaceholderSectionProps } from './PlaceholderSection'

export const SECTIONS: PlaceholderSectionProps[] = [
  {
    id: 'addition',
    eyebrow: 'Section 1 (placeholder)',
    title: 'The addition',
    body: [
      'A transformer turns each token into a vector and adds a positional vector to it before doing anything else.',
      'It feels like mixing paint — surely the order information dissolves into the meaning. The rest of this story is about why it does not.',
    ],
    takeaway: 'Adding is superposition, not compression — nothing is averaged away.',
  },
  {
    id: 'highdim',
    eyebrow: 'Section 2 (placeholder)',
    title: 'Why high dimensions save us',
    body: [
      'In two dimensions, two random arrows often point in similar directions. In hundreds of dimensions, they are almost always at right angles.',
      'That near-orthogonality is the room the network needs: token and position can coexist in one summed vector and still be pulled apart later.',
    ],
    takeaway: 'High-dimensional space has enough room that random directions rarely collide.',
  },
]
