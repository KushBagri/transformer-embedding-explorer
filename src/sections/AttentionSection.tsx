// Section 8 — the payoff. Q·K → softmax → attention weights, computed live from
// the shared model. Edit the sentence, change the temperature, and flip
// positional encoding off to watch position-driven structure appear and vanish.

import { useState } from 'react'
import { SectionShell } from './SectionShell'
import { Card } from '../ui/Card'
import { Callout } from '../ui/Callout'
import { Slider } from '../ui/Slider'
import { Toggle } from '../ui/Toggle'
import { Detail } from '../ui/Detail'
import { Analogy } from '../ui/Analogy'
import { SubHeading } from '../ui/SubHeading'
import { Heatmap } from '../viz/primitives/Heatmap'
import { useModel } from '../state/modelContext'
import { PEKind } from '../math/types'

export function AttentionSection() {
  const model = useModel()
  const [text, setText] = useState(model.tokens.join(' '))
  const [hover, setHover] = useState<number | null>(null)

  const peOn = model.peKind !== PEKind.None

  return (
    <SectionShell
      id="attention"
      eyebrow="The payoff"
      title="Attention reads the position back out"
      visual={() => (
        <Card>
          <p className="mb-2 text-sm text-prose-dim">
            attention weights — row {hover ?? '·'} {hover != null ? `(${model.tokens[hover]})` : ''}
          </p>
          <Heatmap
            data={model.attnWeights}
            mode="sequential"
            cell={Math.max(20, Math.min(40, 360 / Math.max(model.tokens.length, 1)))}
            rowLabels={model.tokens}
            colLabels={model.tokens}
            highlightRow={hover}
            onHoverRow={setHover}
            xTitle="key (attended to)"
            yTitle="query"
          />
          <p className="mt-2 text-center text-xs text-prose-dim">
            each row sums to 1 · brighter = more attention
          </p>
        </Card>
      )}
    >
      <p>
        Words only mean something in context. Take{' '}
        <span className="italic text-prose-bright">
          "the animal didn't cross the road because <strong>it</strong> was tired"
        </span>
        . What does <em>"it"</em> refer to — the animal or the road? To figure
        that out, the word <em>"it"</em> has to <strong>look at</strong> the other
        words and decide which one matters. Attention is the machinery that lets
        every word do exactly that.
      </p>

      <Analogy label="Picture this — a room of experts">
        <p>
          Imagine the words as people in a room. Each person raises their hand
          with a <strong>question</strong> — "I'm the word <em>it</em>, which
          thing do I stand for?" That question is called a{' '}
          <span className="text-prose-bright">query</span>.
        </p>
        <p>
          Everyone also wears a <strong>name-tag</strong> describing themselves —
          "I'm <em>animal</em>, a noun, a living thing." That tag is called a{' '}
          <span className="text-prose-bright">key</span>.
        </p>
        <p>
          The asker glances around, sees whose tags best answer the question, and{' '}
          <strong>listens mostly to those people</strong> — ignoring the rest.
        </p>
      </Analogy>

      <p>That's the whole mechanism, in three steps:</p>
      <ol className="flex list-decimal flex-col gap-2 pl-5 marker:text-prose-dim">
        <li>
          <strong className="text-prose-bright">Question vs. name-tags.</strong>{' '}
          Compare one word's <strong>query</strong> to every word's{' '}
          <strong>key</strong>. A good match scores high ("you're what I'm looking
          for"); a poor match scores low. (The comparison is a dot product — the
          overlap score from earlier.)
        </li>
        <li>
          <strong className="text-prose-bright">Split your attention.</strong> Each
          word has 100% attention to spend. A softmax turns its row of scores into
          percentages that add to 100% — most spent on the best matches.
        </li>
        <li>
          <strong className="text-prose-bright">Pull in the answer.</strong> The
          word collects a blend of the others' actual content — their{' '}
          <strong>value</strong> vectors — weighted by those percentages. That
          blend becomes its new, context-aware self.
        </li>
      </ol>

      <SubHeading>A zoo of specialised heads</SubHeading>
      <p>
        A model doesn't run this just once. It runs it through dozens of separate{' '}
        <strong>heads</strong> at the same time — each its own little expert with its
        own way of asking the question and reading the name-tags. Crucially, each head
        cares about a <strong>different relationship</strong> between words.
      </p>
      <Analogy label="Picture this — a chef's tasting">
        <p>
          A chef tastes a finished sauce. Everything is already stirred together into
          one mouthful — yet she says, without hesitation: <em>"I taste tomato. And
          basil. And garlic."</em> Each taste bud is tuned to a different chemical
          signature, so it picks out its one ingredient from the blend.
        </p>
        <p>
          Attention heads are taste buds. The vector flowing in already has{' '}
          <span className="text-token-soft">meaning</span> and{' '}
          <span className="text-position-soft">position</span> stirred together. But
          each head is tuned — by what it learned during training — to taste one
          particular relationship and ignore the rest.
        </p>
      </Analogy>
      <p>
        These flavours are not made up. When researchers open a trained model and
        watch its heads, the same recognisable types keep showing up:
      </p>
      <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-prose-dim">
        <li>
          <strong className="text-position-soft">Previous-token heads.</strong> They
          do one stubborn thing: look at the word immediately before. Pure{' '}
          <span className="text-position-soft">position</span>, no regard for meaning —
          so they paint a single bright stripe just off the diagonal of the grid.
        </li>
        <li>
          <strong className="text-combined-soft">Induction heads.</strong> They blend{' '}
          <span className="text-token-soft">meaning</span> and{' '}
          <span className="text-position-soft">position</span> to continue a pattern
          they've already seen. Having met <em>"Harry Potter"</em> once, when{' '}
          <em>"Harry"</em> reappears the head reaches back to that earlier{' '}
          <em>"Harry"</em> and copies what came next — <em>"Potter"</em>.
        </li>
        <li>
          <strong className="text-token-soft">Semantic and syntactic heads.</strong>{' '}
          They chase <span className="text-token-soft">meaning</span>, wherever it
          sits — a verb finding its subject, a pronoun finding the noun it stands for —
          however many words apart the two are.
        </li>
      </ul>
      <p>
        Each type leans on a different slice of that four-way split of the matching
        score: a previous-token head lives almost entirely on the{' '}
        <span className="text-position-soft">position-with-position</span> term, a
        semantic head on the <span className="text-token-soft">meaning-with-meaning</span>{' '}
        term, and an induction head needs both at once. One input vector, read many
        different ways — exactly because the two signals were added without erasing
        each other.
      </p>
      <p>
        Why trust any of this rather than treat it as a nice story? Because we can
        check it, and people have. <span className="text-prose-bright">Interpretability
        researchers</span> — scientists who probe a trained network's internals — have
        pointed at individual heads in real models, measured them, and found them doing
        exactly these jobs with eerie consistency: a previous-token head that attends
        one step back over and over, an induction head that reliably completes repeats.
        They've even measured how cleanly the <span className="text-token-soft">meaning</span>{' '}
        and <span className="text-position-soft">position</span> directions stay
        separated inside the trained weights, and found the separation high. The
        picture isn't a hopeful diagram; it's something that has been observed.
      </p>

      <p>
        The grid on the right shows step 2 for the whole sentence.{' '}
        <strong>Each row is one word doing the looking</strong>; the columns are
        the words it could look at; a brighter square means more attention spent
        there. Every row adds up to 100%. Hover a row to follow one word's gaze.
      </p>

      <Detail summary="Where does position come into this?">
        <p>
          Because position survived the addition, a token's query and key can
          depend on <em>where</em> it is, not just <em>what</em> it is. That's
          how a head can learn a rule like "attend to the token just before me" —
          a purely positional pattern, visible as a stripe just off the diagonal.
        </p>
        <p>
          Strip position out and queries/keys depend on content alone. Attention
          becomes permutation-invariant: shuffle the words and the pattern follows
          them, because the model has no idea where anything sits.
        </p>
      </Detail>

      <label className="block">
        <span className="mb-1 block text-sm text-prose">sentence</span>
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            model.setSentence(e.target.value)
          }}
          className="w-full rounded-lg border border-edge bg-surface-2 px-3 py-2 font-mono text-sm text-prose-bright outline-none focus:border-combined"
        />
      </label>

      <Slider
        label="softmax temperature"
        min={0.2}
        max={4}
        step={0.1}
        value={model.temperature}
        format={(v) => v.toFixed(1)}
        onChange={(t) => model.setInputs({ temperature: t })}
      />

      <Toggle
        label="positional encoding"
        checked={peOn}
        onChange={(on) => model.setInputs({ peKind: on ? PEKind.Sinusoidal : PEKind.None })}
      />

      <p>
        Turn positional encoding <strong>off</strong> and the map flattens toward
        a position-blind blur — the order information that survived the addition
        is exactly what attention was using.
      </p>

      <Callout accent="combined">
        Because adding never destroyed the position, the network can recover it
        with a single linear projection — and attend by where, not just what.
      </Callout>
    </SectionShell>
  )
}
