# Transformer Embedding Explorer

An interactive, scrollytelling explainer for how transformers combine token and
positional embeddings — and why adding them doesn't destroy either signal.
React 19 + TypeScript + Vite 8, Tailwind v4, Framer Motion, D3 (2D),
react-three-fiber (3D, upcoming). All transformer math is computed live in the
browser from a hand-rolled core in `src/math`.

## The one rule that matters most: explain for a first-time reader

This is a teaching tool. The explanations are the product, not the code. Every
concept must be understandable by someone who has **never** seen it before.

- **Assume zero prior knowledge.** No unexplained jargon. The first time a term
  appears (query, key, dot product, orthogonal…), gloss it in plain words.
- **Lead with a concrete example or analogy**, then generalize. (e.g. position
  via a binary counter; attention via a pronoun finding its noun.)
- **Build one idea at a time.** Short sentences. Each paragraph = one step.
- **Always answer "why does this matter?"** Tie every mechanism back to the
  page's central question (why adding meaning + position doesn't lose either).
- **Claims need backing.** If you assert something ("random vectors become
  perpendicular"), give the intuition AND a check the reader can verify — a
  formula, a number on screen, an interaction. Don't hand-wave.
- **Be quantitatively consistent.** Numbers in prose must match the numbers the
  live visuals show. If a value is sampled/approximate, say so, or cite the
  exact theoretical value and make the visual converge to it.
- Use the optional `<Detail>` ("dig deeper") for the rigorous/heavier version so
  the main thread stays readable, but the main thread must still be complete.

If a section can't be understood by a curious beginner on first read, it's a
bug — treat it like one.

## Conventions

- **Color contract (never break):** token/meaning = amber, position = cyan,
  combined = violet. Defined as Tailwind theme tokens in `src/index.css`.
- **Math layer** (`src/math`) is pure TS over flat `Float32Array` matrices, with
  vitest tests. Keep it dependency-free and tested.
- **State**: one `ModelProvider` (`src/state`) derives every matrix via
  `deriveModel`; sections read it with `useModel`.
- **Viz primitives** (`src/viz`) are dumb/reusable; **sections** (`src/sections`)
  compose them. `SectionShell` = sticky visual + scrolling prose.
- Respect the strict tsconfig: `import type` for types, no `enum`
  (use const-object unions), prefix intentionally-unused params with `_`.

## Working rhythm

- Work in milestones on feature branches (`feat/...`), merged to `main` once
  verified. Commit at natural sub-steps.
- Before every commit: `npm run build` (tsc + vite), `npm run lint`, `npm test`
  must all pass.
- Do **not** add a `Co-Authored-By` trailer to commits.
- Pause at milestone ends for review; clarity of the in-app journey is the
  primary success metric, not just "it compiles".
