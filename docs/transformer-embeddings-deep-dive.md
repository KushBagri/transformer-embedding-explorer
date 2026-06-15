# How Transformers Preserve Information When Adding Embeddings

> A deep dive into the puzzle: if `token_embedding + positional_embedding = combined_embedding`,
> how does the model not lose either piece of information?

---

## Table of Contents

1. [The Puzzle That Seems Impossible](#1-the-puzzle-that-seems-impossible)
2. [Why Your Intuition Comes from a Low-Dimensional World](#2-why-your-intuition-comes-from-a-low-dimensional-world)
3. [The Strange Geometry of High Dimensions](#3-the-strange-geometry-of-high-dimensions)
4. [Orthogonality: The Real Secret](#4-orthogonality-the-real-secret)
5. [The Linear Algebra of "Selective Extraction"](#5-the-linear-algebra-of-selective-extraction)
6. [How Positional Encodings Are Designed to Cooperate](#6-how-positional-encodings-are-designed-to-cooperate)
7. [What Attention Actually Does With the Sum](#7-what-attention-actually-does-with-the-sum)
8. [A Walk-through With a Real Sentence](#8-a-walk-through-with-a-real-sentence)
9. [Why Training Makes This Work Even Better](#9-why-training-makes-this-work-even-better)
10. [Mental Models and Metaphors to Remember](#10-mental-models-and-metaphors-to-remember)
11. [The Three-Sentence Summary](#11-the-three-sentence-summary)
12. [Suggested Visualizations for Your Site](#12-suggested-visualizations-for-your-site)

---

## 1. The Puzzle That Seems Impossible

Here is the equation at the heart of every Transformer:

```
x = TokenEmbedding(token) + PositionalEmbedding(position)
```

In plain English: take a vector that represents *what the word means* (token embedding,
call it **A**), take another vector that represents *where the word is in the
sentence* (positional embedding, call it **B**), and **add them together** to get the
input vector **C** that goes into the model.

This is where almost everyone gets stuck. Because if I tell you:

> "I added two numbers and got 7. What were they?"

You can't answer. It could be 3+4, or 2+5, or 1+6, or 0.5+6.5, or a million other
pairs. Information was destroyed by the addition.

So when the Transformer does `A + B = C`, the natural question is:

> **"How does the model later figure out what A was and what B was, given only C?
> Didn't we just lose that information?"**

The answer is one of the most beautiful ideas in deep learning. It turns out that
**in high-dimensional space, addition does *not* destroy information the way it does
with single numbers** — as long as the things you're adding are arranged in a
particular geometric way.

The rest of this document is the long, careful explanation of *why*.

---

## 2. Why Your Intuition Comes from a Low-Dimensional World

Our brains were trained — by everyday life — on **1D and 2D math**. When you hear
"A + B = C," you imagine numbers on a number line, or maybe arrows on a flat piece
of paper. In those worlds, addition really *does* lose information.

### 2.1 The 1D case (single numbers)

```
A + B = 7
```

There are infinitely many `(A, B)` pairs that work. Unrecoverable. ✗

### 2.2 The 2D case (arrows on paper)

If `A = (1, 2)` and `B = (3, 1)`, then `C = (4, 3)`. Given only `C = (4, 3)`, can
you figure out `A` and `B`? No — there are still infinitely many ways to split
`(4, 3)` into two vectors that sum to it. Unrecoverable. ✗

### 2.3 So why does it work in Transformers?

Because Transformers don't live in 2D. They live in **512 dimensions, or 768, or
4096**. And in those dimensions, geometry behaves in ways that completely violate
our intuitions.

> Think of it like this: your intuition about A + B = C is like a fish's intuition
> about how things move in water. When you take that fish out and ask it about how
> things move in *air*, suddenly everything is different. High-dimensional space is
> the "air" — a totally different medium, with totally different rules.

The most important rule that changes: **in high dimensions, you can pack things into
"non-overlapping" directions in a way that's impossible in 2D or 3D**. And if `A`
points in one direction and `B` points in a non-overlapping direction, then `A + B`
secretly contains both, because each one occupies its own "channel."

We'll build up to exactly what "non-overlapping" means, step by step.

---

## 3. The Strange Geometry of High Dimensions

To understand how Transformers store two things in one vector, you need a few
strange facts about high dimensions. Each of these will feel wrong at first. Sit
with them.

### 3.1 Fact 1: In high dimensions, "most" directions are perpendicular

Pick two random arrows in 2D. There's a decent chance they point in roughly the
same direction, or roughly opposite directions. The angle between them is
unpredictable.

Pick two random arrows in 1000 dimensions. **Almost certainly, they will be nearly
perpendicular to each other.** The angle between them will be very close to 90°.

This is counterintuitive but mathematically provable. The intuition: in high
dimensions, there are *so many possible directions* that any two random vectors
are overwhelmingly unlikely to choose similar ones.

> **Metaphor:** Imagine you and a friend each independently throw a dart at a
> globe. In 2D (a flat map), there's a real chance you hit nearby spots. But
> imagine a globe with a million dimensions — there's so much "surface" that two
> random throws will land almost certainly far apart.

### 3.2 Fact 2: You can fit huge numbers of "almost perpendicular" vectors

In 3D space, you can fit exactly 3 perpendicular vectors (the x, y, z axes).
You can't squeeze in a 4th that's perpendicular to all of them.

In 512D space, you can fit exactly 512 perfectly perpendicular vectors. But if
you relax "perfectly perpendicular" to "almost perpendicular" (dot product close
to zero but not exactly zero), you can fit **exponentially many** — like, billions
of them.

This is sometimes called the **Johnson–Lindenstrauss phenomenon** or
**quasi-orthogonality**, and it's the geometric foundation that makes the whole
Transformer trick work.

> **Metaphor:** Think of a giant warehouse. In a tiny closet, you can only fit
> three shelves at right angles to each other before they start bumping into each
> other. But in an enormous warehouse, you can fit thousands of shelves arranged
> at *roughly* right angles, with a tiny bit of overlap that no one cares about.
> High dimensions = enormous warehouse. There's just *more room*.

### 3.3 Fact 3: A vector's identity is its direction, not its position

In 2D, you mostly think of vectors as "arrows pointing from the origin to a
location." In high dimensions, it's much more useful to think of a vector as
**a direction**.

Two vectors that point in the same direction are "similar" — regardless of length.
Two vectors that point in perpendicular directions are "independent" — they carry
no information about each other.

This matters because token embeddings and positional embeddings end up pointing
in **different directions**. Their lengths don't really matter. What matters is
that they don't interfere with each other when added.

> **Metaphor:** Imagine North and East. If I walk 3 miles North and then 5 miles
> East, I end up at a position you can perfectly decompose: the "North component"
> is 3, the "East component" is 5. Why? Because North and East are perpendicular
> directions. They don't bleed into each other. Even though my final position is
> a single point, the two journeys that produced it are perfectly recoverable.
>
> Now imagine that instead of just North and East, there were 512 perpendicular
> directions. You could walk along all of them, sum the result, and someone with
> the right tool could perfectly decompose your final position back into its
> 512 components. That's what high-dimensional space gives you.

---

## 4. Orthogonality: The Real Secret

OK — now we can state precisely what makes `A + B = C` recoverable in a Transformer.

### 4.1 The key word: "orthogonal"

Two vectors are **orthogonal** if they are perpendicular — their dot product is zero.

```
A · B = 0   means   A and B are orthogonal
```

When two vectors are orthogonal, they don't share any information. They live in
"different directions" of space. Knowing one tells you nothing about the other.

### 4.2 If A and B are orthogonal, addition becomes information-preserving

Here's the magic. Suppose `A` and `B` are orthogonal. Then from `C = A + B`, you
can recover `A` and `B` perfectly — if you know which directions they live in.

Why? Because of a simple property of perpendicular things: **the component of `C`
in the direction of `A` is exactly `A`**, and the component of `C` in the
direction of `B` is exactly `B`. There's no interference.

> **Metaphor: the shopping cart.** Imagine `A` is a basket of apples and `B` is a
> basket of bananas. You dump them both into a shopping cart — that's `C`.
>
> Now I ask: "Can you recover how many apples were in `A` from `C`?" Yes! You
> just pick out the apples. The bananas don't get in the way because they're
> *different objects*. Apples and bananas are "orthogonal" — they don't mix.
>
> Now imagine instead you dumped apple sauce and banana puree into a blender and
> mixed them. Now you *can't* recover the original amounts of each. They've
> become inseparable.
>
> The math of orthogonality is what guarantees we're in the "shopping cart"
> situation, not the "blender" situation. The information doesn't mix because
> the components live in different directions.

### 4.3 Token and positional vectors don't have to be perfectly orthogonal

In a real Transformer, the token embedding `A` and positional embedding `B` are
**not perfectly** orthogonal. But they end up being **approximately** orthogonal,
which is good enough — because the model has billions of parameters and many
attention heads, it can tolerate a little bit of overlap and still recover both
signals very well.

This is one of those situations where "approximate" in high dimensions is just
as good as "exact" in low dimensions, because of all the redundancy you get from
having so many directions to work with.

### 4.4 But wait — do they actually end up orthogonal?

Great question. Two things contribute to this:

1. **High dimensions make orthogonality the default.** Recall from Section 3.1
   that two random high-dimensional vectors are *already* nearly perpendicular,
   just by chance. So even before training, token and positional vectors are
   roughly orthogonal.

2. **Training pushes them further apart.** During training, gradient descent
   notices when the two signals interfere (because that hurts the loss). It
   then nudges the learned vectors apart, into directions where they don't
   bleed into each other. Over millions of training steps, this produces a clean
   separation.

So the orthogonality you need is partly **given for free by geometry** and partly
**enforced by learning**. Both forces push in the same direction.

---

## 5. The Linear Algebra of "Selective Extraction"

OK, so token and positional vectors are (approximately) orthogonal. But how does
the model *actually* extract one or the other from their sum? This is where the
attention mechanism comes in.

### 5.1 The tool: a matrix multiplication

Recall that in attention, each input vector `X` (which equals `T + P`, token plus
position) gets multiplied by three learned matrices to produce three new vectors:

```
Q = X · W_Q     (query)
K = X · W_K     (key)
V = X · W_V     (value)
```

These matrices `W_Q`, `W_K`, `W_V` are the **tools that extract information from
the sum**. They are the answer to "how does the model unbundle `A` and `B`."

### 5.2 A matrix can be a "filter"

Here's the key insight. A matrix multiplication is a **linear projection**, which
you can think of as a *filter*: it lets some directions through and blocks others.

Suppose we have a magic matrix `W_token` with this property:

```
W_token · A ≈ A      (it lets the token component through)
W_token · B ≈ 0      (it blocks the positional component)
```

What does `W_token` do when we feed it the sum?

```
W_token · C = W_token · (A + B)
            = W_token · A + W_token · B
            = A + 0
            = A
```

**It recovered `A` from the sum!** The matrix acted like a filter tuned to the
"token direction" and ignored the "position direction."

Similarly, a different matrix `W_pos` could be tuned to do the opposite — block
the token direction and let the positional direction through, recovering `B`.

### 5.3 The Transformer learns these filters automatically

You don't program `W_token` or `W_pos` by hand. The matrices `W_Q`, `W_K`, `W_V`
are **learned during training**. Gradient descent figures out, automatically,
what filter to apply at each layer, in each attention head.

Different heads learn different filters:
- Some heads emphasize semantic content (acting like `W_token`).
- Some heads emphasize positional structure (acting like `W_pos`).
- Most heads learn *combinations* that are useful for some specific kind of
  reasoning the model needs to do.

> **Metaphor: a sound mixing board.** Imagine you're at a concert and the sound
> engineer has a mixing board in front of her. The vocals, guitar, bass, and
> drums are all coming into a single combined audio signal — `C = vocals + guitar
> + bass + drums`. With her mixing board, she can isolate just the vocals,
> or just the bass, by turning knobs that selectively let through certain
> frequencies and block others.
>
> The matrices `W_Q`, `W_K`, `W_V` are the mixing board. They were "tuned"
> (learned) during training to isolate exactly the signals that matter for the
> next step of the computation. The token embedding and positional embedding are
> like two instruments playing simultaneously — both fully present in the
> combined signal, but selectively extractable by the right filter.

### 5.4 A concrete tiny example you can verify by hand

Let's make this very concrete. Let `d = 4` (a tiny 4-dimensional space).

Suppose:
```
A = [1, 2, 0, 0]      (token embedding — lives in dimensions 0 and 1)
B = [0, 0, 3, 4]      (positional embedding — lives in dimensions 2 and 3)
```

Are these orthogonal? Let's check: `A · B = (1)(0) + (2)(0) + (0)(3) + (0)(4) = 0`. ✓
Yes, perfectly orthogonal.

Their sum:
```
C = A + B = [1, 2, 3, 4]
```

Now, here's a matrix that extracts only the token component (the first two
dimensions):

```
W_token = | 1 0 0 0 |
          | 0 1 0 0 |
          | 0 0 0 0 |
          | 0 0 0 0 |
```

If we multiply `W_token · C`, we get `[1, 2, 0, 0] = A`. ✓

A different matrix recovers the positional component:

```
W_pos = | 0 0 0 0 |
        | 0 0 0 0 |
        | 0 0 1 0 |
        | 0 0 0 1 |
```

`W_pos · C = [0, 0, 3, 4] = B`. ✓

**Both signals were perfectly recoverable from the sum, using simple matrix
multiplication.**

In a real Transformer with 512 dimensions and learned (not hand-coded) matrices,
the math is much messier, the subspaces aren't perfectly aligned with coordinate
axes, and recovery is approximate rather than exact. But the underlying principle
is identical: **a linear projection can selectively extract one orthogonal
component from a sum.**

---

## 6. How Positional Encodings Are Designed to Cooperate

The original Transformer paper ("Attention Is All You Need," Vaswani et al., 2017)
used **sinusoidal positional encodings**. These are not random — they were
carefully designed to play nicely with the token embeddings and the attention
mechanism.

### 6.1 The formula

For position `pos` and dimension `i` (out of `d` total dimensions):

```
PE(pos, 2i)   = sin(pos / 10000^(2i/d))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d))
```

Don't get scared by the formula. The important thing is the *pattern* it creates,
which we'll now unpack.

### 6.2 Property 1: Different dimensions oscillate at different speeds

Look at the formula carefully. The "frequency" of oscillation depends on `i` (the
dimension index):

- **Low `i`** (early dimensions): the value `10000^(2i/d)` is small, so we divide
  `pos` by a small number, so we change quickly with position. **High frequency.**
- **High `i`** (late dimensions): the value `10000^(2i/d)` is large, so we divide
  `pos` by a large number, so we change very slowly with position. **Low frequency.**

This means the positional encoding **fills up the embedding space in a structured
way**: different dimensions encode the position at different scales.

> **Metaphor: a clock.** Look at an analog clock. The second hand moves quickly,
> the minute hand moves medium-speed, the hour hand moves slowly. Together, they
> encode the time at multiple scales: the second hand tells you fine-grained
> position within a minute, the hour hand tells you coarse-grained position
> within a day.
>
> Sinusoidal positional encodings are like a clock with hundreds of hands, each
> spinning at a different speed. Together, every "configuration" of all the
> hands uniquely identifies a position in the sequence. Some hands change fast
> (good for telling you "I'm at position 5 vs. position 6") and some change slow
> (good for telling you "I'm in the first half vs. second half of a long
> document").

### 6.3 Property 2: Token embeddings tend to avoid the positional pattern

Token embeddings are learned freely from data. They don't have any reason to
oscillate at specific frequencies — they're free to occupy whatever directions
make semantic sense.

This means token embeddings *naturally drift toward directions that don't look
like positional encodings*. Why? Because if a token embedding accidentally
aligned with a positional pattern, it would interfere with the model's ability
to read out position, hurting the loss. Gradient descent would then push it away
from that direction.

Over training, the two end up occupying *complementary* regions of the
embedding space. They don't fight each other.

### 6.4 Property 3: Relative positions are linearly recoverable

There's a beautiful mathematical property of sinusoidal encodings: for any fixed
offset `k`, there exists a fixed matrix `M_k` such that:

```
M_k · PE(pos) = PE(pos + k)
```

In English: "I can compute the positional encoding `k` steps ahead by applying a
simple matrix to the current positional encoding."

Why is this important? Because attention is built out of matrix operations! This
property means the model can learn to attend to "the token 3 positions before
me" or "the token 5 positions ahead" with a simple, learnable matrix — exactly
the kind of thing attention does well.

> **Metaphor: a turntable.** A sinusoidal encoding is like a record spinning on a
> turntable. The position of the needle on the record encodes the current time.
> If I want to know "where was the needle 10 seconds ago?" — I just rotate the
> record backward by some fixed amount. That rotation is the matrix `M_k`. The
> structure of sines and cosines makes "shifting time" the same as "rotating a
> vector," which is exactly the kind of operation matrix multiplication can do.

### 6.5 Property 4: Bounded magnitude

Each component of the sinusoidal encoding is in the range `[-1, 1]`. This means
the positional encoding has a controlled size — it doesn't overwhelm the token
embeddings (which are typically initialized with similarly small values).

This is important because if `B` were a thousand times larger than `A`, then the
sum `A + B` would be dominated by `B`, and the token signal would be drowned out.
Keeping them at comparable scale ensures both signals contribute meaningfully.

---

## 7. What Attention Actually Does With the Sum

Now we put it all together. Let's see exactly what happens inside an attention
head when it processes `X = T + P` (token plus position).

### 7.1 The attention formula

```
Attention(Q, K, V) = softmax(Q · Kᵀ / √d) · V

where:
  Q = X · W_Q
  K = X · W_K
  V = X · W_V
```

The key quantity is `Q · Kᵀ` — this is the "attention score" between every pair
of positions. It determines who attends to whom.

### 7.2 Expanding `Q · Kᵀ` reveals four sub-signals

Substitute `X = T + P`:

```
Q = (T + P) · W_Q = T·W_Q + P·W_Q
K = (T + P) · W_K = T·W_K + P·W_K
```

Now multiply them out:

```
Q · Kᵀ = (T·W_Q + P·W_Q) · (T·W_K + P·W_K)ᵀ
       = (T·W_Q)·(T·W_K)ᵀ    ← term 1: content-to-content
       + (T·W_Q)·(P·W_K)ᵀ    ← term 2: content asks about position
       + (P·W_Q)·(T·W_K)ᵀ    ← term 3: position asks about content
       + (P·W_Q)·(P·W_K)ᵀ    ← term 4: position-to-position
```

**This is the single cleanest proof that no information was lost in `A + B = C`.**

Look at what just happened. From the sum, the attention mechanism automatically
extracts *four different types of relationships* simultaneously:

1. **Content-to-content** (term 1): "How semantically related are these two
   tokens?" — e.g., does "cat" relate to "sat"?
2. **Content-to-position** (term 2): "What position tends to follow this kind of
   content?" — e.g., verbs tend to come after subjects.
3. **Position-to-content** (term 3): "What kind of content tends to appear at
   this position?" — e.g., articles tend to be at the start of phrases.
4. **Position-to-position** (term 4): "What is the relative distance between
   these two positions?" — e.g., attend to my immediate neighbor.

The model doesn't have to choose between semantic attention or positional
attention. **It gets all four kinds simultaneously, for free, because the
matrix multiplication unbundled the sum into all four components.**

### 7.3 Each head can emphasize what it needs

Different attention heads learn different `W_Q` and `W_K` matrices. So one head
might emphasize term 1 (purely semantic matching), while another emphasizes term
4 (purely positional patterns, like "always look at the previous token"). Most
heads use a mix.

Modern interpretability research has actually *identified* heads that do each
of these things. For example:
- **"Previous token" heads** rely heavily on term 4.
- **"Induction" heads** use a clever combination of terms 1 and 4 to recognize
  repeated patterns.
- **Semantic heads** rely on terms 1 and 2.

> **Metaphor: a chef's tasting.** Imagine a chef tastes a complex sauce. Even
> though all the ingredients are mixed together, an experienced chef can identify:
> "I taste tomatoes," "I taste basil," "I taste garlic." Each taste bud is tuned
> to a different chemical signature.
>
> The attention heads are like taste buds. Even though the input vector mixes
> token info and positional info together, each attention head is "tuned" (via
> its learned `W_Q`, `W_K` matrices) to pick up specific relationships — some
> taste tokens, some taste positions, some taste combinations.

---

## 8. A Walk-through With a Real Sentence

Let's trace what happens for: **"the cat sat"**.

### Step 1: Token embeddings (learned during training)

The model has a lookup table mapping each token to a vector. Say:

```
T_the = [ 0.20, -0.10,  0.80,  0.05, ...]   (some 512-dim vector)
T_cat = [-0.30,  0.50,  0.10, -0.20, ...]
T_sat = [ 0.10,  0.40, -0.20,  0.30, ...]
```

These are the *meanings* of the words, expressed as directions in 512-dim space.

### Step 2: Positional embeddings (sinusoidal)

For positions 0, 1, 2:

```
P_0 = [sin(0/1),    cos(0/1),    sin(0/100),    cos(0/100),    ...]
P_1 = [sin(1/1),    cos(1/1),    sin(1/100),    cos(1/100),    ...]
P_2 = [sin(2/1),    cos(2/1),    sin(2/100),    cos(2/100),    ...]
```

These are the *positions*, expressed as different directions in the same 512-dim
space.

### Step 3: Add them — the "collision" that doesn't lose information

```
X_0 = T_the + P_0     (means "the" AND "at position 0", bundled into one vector)
X_1 = T_cat + P_1     (means "cat" AND "at position 1")
X_2 = T_sat + P_2     (means "sat" AND "at position 2")
```

Each `X_i` is a single 512-dim vector. From the *outside*, it looks like just one
vector. But inside, it has two independent signals layered on top of each other,
in (approximately) orthogonal directions.

> **Metaphor: a written note.** Imagine someone writes a message on paper with
> two pens: a red one for the *content* and a blue one for *line numbers*. They
> hand you the paper. You see both colors at once, on the same page. But if you
> put on red-blocking glasses, you'd see only the blue numbers; with blue-blocking
> glasses, only the red content. The information was never lost — it's all on
> the page. You just need the right filter to read each layer.
>
> The vector `X_1` is the paper. `T_cat` is the red content. `P_1` is the blue
> line number. They share the same physical space (the same 512 dimensions) but
> in different "colors" (different directions). The learned matrices `W_Q`,
> `W_K`, `W_V` are the colored glasses.

### Step 4: Attention extracts what's needed

When `X_1 = T_cat + P_1` flows into an attention head:

- The matrix `W_Q` might be tuned so that `W_Q · T_cat` produces a query saying
  "I'm a noun looking for a verb," and `W_Q · P_1` produces a small additional
  query saying "I'm at position 1, so I'm interested in position 2."
- Both queries are computed *from the same input vector* `X_1`, in parallel, by
  the same matrix `W_Q`. Linearity of matrix multiplication is what lets the
  matrix do both jobs at once.

When this query is compared to the keys from `X_2 = T_sat + P_2`, the dot product
lights up because:
- "I'm looking for a verb" matches "I'm a verb" (term 1: content-to-content).
- "I'm interested in the next position" matches "I'm at the next position"
  (term 4: position-to-position).

The attention head therefore attends strongly to `X_2`. The information that the
model needed — *what* word is at *what* position — was preserved through the
entire pipeline. It was never lost in the original sum.

---

## 9. Why Training Makes This Work Even Better

Up to now, we've described how the architecture *could* preserve information.
But the real magic is that training *actively encourages* this.

### 9.1 The loss function rewards information preservation

When the model trains, it gets a loss signal: how wrong was the prediction? If
the prediction was wrong because token and positional information got tangled
together, that loss flows backward through gradient descent and adjusts the
embeddings and the projection matrices.

Specifically, gradient descent will:
- **Push token embeddings away from positional-encoding directions**, so they
  don't interfere.
- **Tune `W_Q`, `W_K`, `W_V`** to cleanly separate the signals when separation
  is needed for the task.
- **Specialize different attention heads** to different combinations of the four
  terms in the `Q·Kᵀ` expansion.

Over millions of training steps, the system organically arranges itself so that
information is maximally separable. It's not just that the architecture *allows*
this — training *demands* it.

### 9.2 Why we should trust this

A common worry: "How do we know the model actually achieves this separation,
rather than just hoping it does?"

Empirical answer: **interpretability research has directly measured this**.
Researchers have:
- Found heads that specialize in positional patterns (e.g., "attend to previous
  token") with extremely consistent behavior.
- Found heads that specialize in semantic content (e.g., "attend to syntactically
  related tokens regardless of distance").
- Measured the actual orthogonality between token and positional subspaces in
  trained models — and found it to be high, even though it wasn't perfectly
  enforced by the architecture.

The system works in practice because high-dimensional geometry makes it the path
of least resistance for the optimizer.

> **Metaphor: water finding its level.** Even though water molecules don't
> *understand* gravity, water always finds its lowest point because that's what
> the laws of physics make easy. Similarly, even though gradient descent doesn't
> *understand* the math of orthogonal subspaces, it always converges toward
> configurations that keep token and positional info separable — because that's
> what the loss function makes easy.

---

## 10. Mental Models and Metaphors to Remember

Pick whichever one of these clicks for you. Each illuminates a different angle.

### 10.1 The stereo audio metaphor

When you listen to a stereo song, your headphones receive *one* audio signal in
each ear that contains *multiple* instruments mixed together. Yet you can pick
out the vocals from the guitar, even though they share the same physical waves.
How? Because each instrument occupies a different *frequency band*. Your ear (and
brain) act like a filter that separates them.

Token + positional information is the same: they occupy different "frequency
bands" in 512-dimensional space, and the learned `W_Q`, `W_K`, `W_V` matrices
are the filters that separate them.

### 10.2 The RGB pixel metaphor

A single pixel on your screen has *one* color, encoded as three numbers: red,
green, and blue. The single triple `(120, 200, 50)` is one piece of information,
yet it encodes three independent channels. No one looks at this and says "we
can't tell how much red was used" — you just take the first component.

Token + positional information are like the R, G, B channels of a 512-dim
"pixel." Adding them produces a single combined vector, but the components live
in different "channels" (orthogonal directions), so any one of them can be
extracted on demand.

### 10.3 The radio station metaphor

The air around you carries hundreds of radio broadcasts simultaneously. They all
share the same physical medium — air pressure waves. Yet your radio can tune
into 92.3 FM and hear only that station, ignoring all the others. The
broadcasts occupy different frequencies, and your radio is a frequency-selective
filter.

Token and positional information broadcast on different "frequencies" of the
embedding space, and the attention projection matrices are the radios that tune
into the one each head needs.

### 10.4 The shopping cart metaphor

If you dump a bag of apples and a bag of bananas into a shopping cart, you get
one full cart — but you can still separate them back out, because apples and
bananas are different kinds of things. They don't blend together.

If, instead, you dumped applesauce and banana puree into a blender, they'd
become inseparable.

Token and positional embeddings are like apples and bananas (separable). The
high-dimensional geometry of orthogonal subspaces is what guarantees we're not
in the blender situation.

### 10.5 The colored writing metaphor

If you write a message in red ink and someone else writes another message in
blue ink on the same paper, you can read both messages independently — by
filtering for color. The paper is "shared," but the inks live in different
"channels."

Token info (red ink) and positional info (blue ink) share the same 512-dim
vector (the paper), but in different directions (different colors).

### 10.6 The orchestra metaphor

When you listen to an orchestra, you hear one combined sound wave. But a trained
listener can pick out the violin, the cello, the flute — each instrument occupies
its own "timbre space," and the brain learns to separate them.

The Transformer is the trained listener. Token and positional info are two
"instruments" playing together. The attention mechanism learns to listen to each
selectively.

---

## 11. The Three-Sentence Summary

If you remember nothing else:

1. **In 512-dimensional space, you can pack token vectors and positional vectors
   into directions that don't overlap** — so adding them doesn't blur them
   together, the way adding two scalars would.
2. **The `W_Q`, `W_K`, `W_V` matrices in attention are learned linear filters**
   that can selectively extract the token component, the positional component,
   or any useful combination, from the summed vector.
3. **No information is lost in the sum — it's bundled together in orthogonal
   directions**, and the network has the algebraic tools to unbundle it on demand,
   at every layer, in every head.

---

## 12. Suggested Visualizations for Your Site

Ideas you could build into the explorer to communicate these concepts:

- **The "orthogonality" demo.** Show a 2D plot with one axis labeled "token
  direction" and one labeled "position direction." Let the user pick a token
  embedding (an arrow along the token axis) and a positional embedding (an
  arrow along the position axis). Animate the addition. Then show how a
  "projection" recovers each component. Then increase the dimension and show
  the same idea generalizes.

- **The "filter" demo.** Let the user define a token vector `A` and a
  positional vector `B`, watch `C = A + B` form, and then show a learnable
  matrix `W` that recovers `A`. Let the user adjust `W` and see how recovery
  quality changes. This makes "linear projection = filter" concrete.

- **The dot-product heatmap.** For a real model, show a heatmap of dot products
  between all token vectors and all positional vectors. The heatmap should be
  mostly near zero — visual proof of approximate orthogonality.

- **The four-term `QKᵀ` breakdown.** For a real sentence, visualize the four
  terms of the attention score separately. Show how the "content-content" term
  lights up for semantic matches, the "position-position" term lights up for
  relative-distance patterns, and the cross terms add nuance.

- **The "frequency view" of sinusoidal PE.** An interactive plot showing how
  different dimensions of `PE(pos)` oscillate at different frequencies — like
  the hands of a clock, or the rows of a Fourier basis.

- **The "shopping cart vs. blender" interactive.** A side-by-side toy demo:
  on one side, simulate adding token + positional in orthogonal directions
  (recoverable). On the other, simulate adding them in non-orthogonal
  directions (interference). Let the user slide a knob from "fully orthogonal"
  to "fully aligned" and watch recovery quality degrade.

- **An attention head zoo.** Show real attention patterns from a trained model,
  organized by what they specialize in: "previous token heads," "syntactic
  heads," "semantic heads." Demonstrate empirically that the four-term
  decomposition predicts.

---

## Further Reading

- Vaswani et al., **"Attention Is All You Need"** (2017) — the original
  Transformer paper. Read this for the architecture in full.
- Anthropic's **"A Mathematical Framework for Transformer Circuits"** — the
  cleanest exposition of attention as a sum of independently-interpretable
  components. Specifically motivates the "linear projection extracts
  information" perspective.
- **"The Annotated Transformer"** (Harvard NLP) — clean Python code walk-through.
- Jay Alammar, **"The Illustrated Transformer"** — gentle visual introduction.
- **"Neural Networks, Manifolds, and Topology"** by Chris Olah — for deeper
  intuition about high-dimensional geometry in neural nets.
- Anthropic's **"Toy Models of Superposition"** — formal study of how networks
  pack many features into limited dimensions using approximate orthogonality.
  Directly relevant to the question of how multiple signals coexist in one
  vector.
