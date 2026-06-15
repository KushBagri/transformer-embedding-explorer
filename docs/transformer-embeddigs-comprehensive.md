# How Transformers Preserve Information When Adding Embeddings

### The Complete Guide — From Vectors to Attention, From First Principles

> A book-length deep dive into the puzzle: if
> `token_embedding + positional_embedding = combined_embedding`,
> how does the model not lose either piece of information?
>
> This document starts from the absolute basics — what a vector is, what a dot
> product means, what "dimensions" really are — and builds, step by step, all
> the way to the attention mechanism. By the end, you'll understand exactly
> why `A + B = C` doesn't lose information in a Transformer, and you'll be able
> to explain it to anyone.

---

## Table of Contents

**Part I — The Puzzle**
1. [The Question That Doesn't Have an Obvious Answer](#1-the-question-that-doesnt-have-an-obvious-answer)
2. [Why This Is Confusing: Your Brain Was Trained on the Wrong Math](#2-why-this-is-confusing-your-brain-was-trained-on-the-wrong-math)

**Part II — Foundations: Vectors, Spaces, and Directions**
3. [What Is a Vector, Really?](#3-what-is-a-vector-really)
4. [What "Dimensions" Actually Means](#4-what-dimensions-actually-means)
5. [The Dot Product: The Most Important Operation in the Whole Story](#5-the-dot-product-the-most-important-operation-in-the-whole-story)
6. [Orthogonality: When Two Vectors Don't Interfere](#6-orthogonality-when-two-vectors-dont-interfere)
7. [Projections: Extracting "How Much of One Thing Is in Another"](#7-projections-extracting-how-much-of-one-thing-is-in-another)
8. [Matrices: Machines That Transform Vectors](#8-matrices-machines-that-transform-vectors)

**Part III — High Dimensions Are a Different World**
9. [Three Astonishing Facts About High-Dimensional Space](#9-three-astonishing-facts-about-high-dimensional-space)
10. [The Concept of a "Subspace"](#10-the-concept-of-a-subspace)
11. [Why You Can Hide Many Things in One Vector](#11-why-you-can-hide-many-things-in-one-vector)

**Part IV — Embeddings: What They Are and Where They Live**
12. [Token Embeddings: Meaning as Direction](#12-token-embeddings-meaning-as-direction)
13. [Positional Embeddings: Position as Direction](#13-positional-embeddings-position-as-direction)
14. [Why the Two Embeddings Don't Mix Themselves Up](#14-why-the-two-embeddings-dont-mix-themselves-up)

**Part V — The Mechanics of Recovery**
15. [How Addition Can Be Information-Preserving](#15-how-addition-can-be-information-preserving)
16. [The Linear Filter Idea](#16-the-linear-filter-idea)
17. [A Worked Numerical Example You Can Verify by Hand](#17-a-worked-numerical-example-you-can-verify-by-hand)
18. [Approximate Orthogonality and Why "Close Enough" Is Good Enough](#18-approximate-orthogonality-and-why-close-enough-is-good-enough)

**Part VI — Sinusoidal Positional Encodings, Demystified**
19. [The Design Goal: What Properties Did We Need?](#19-the-design-goal-what-properties-did-we-need)
20. [Why Sines and Cosines?](#20-why-sines-and-cosines)
21. [Many Frequencies, Many Clocks](#21-many-frequencies-many-clocks)
22. [The Magical Property: Relative Positions Are Linearly Recoverable](#22-the-magical-property-relative-positions-are-linearly-recoverable)

**Part VII — Attention: The Mechanism That Reads Both Signals**
23. [Quick Refresher on the Attention Mechanism](#23-quick-refresher-on-the-attention-mechanism)
24. [The Four Sub-Signals Hidden Inside `Q · Kᵀ`](#24-the-four-sub-signals-hidden-inside-q--kt)
25. [How Different Heads Specialize in Different Sub-Signals](#25-how-different-heads-specialize-in-different-sub-signals)

**Part VIII — Putting It All Together**
26. [Full Walk-through With "The Cat Sat"](#26-full-walk-through-with-the-cat-sat)
27. [What Training Adds: Why It Works in Practice](#27-what-training-adds-why-it-works-in-practice)

**Part IX — Modern Variants and Extensions**
28. [Learned Positional Encodings](#28-learned-positional-encodings)
29. [Rotary Position Embedding (RoPE)](#29-rotary-position-embedding-rope)
30. [ALiBi and Other Relative-Position Approaches](#30-alibi-and-other-relative-position-approaches)

**Part X — Pedagogy and Wrap-up**
31. [Twelve Metaphors to Make This Stick](#31-twelve-metaphors-to-make-this-stick)
32. [The One-Page Summary](#32-the-one-page-summary)
33. [Visualizations to Build for Your Site](#33-visualizations-to-build-for-your-site)
34. [Further Reading and Where to Go Next](#34-further-reading-and-where-to-go-next)

---
---

# Part I — The Puzzle

---

## 1. The Question That Doesn't Have an Obvious Answer

At the very entrance to every Transformer model — every GPT, every Claude, every
LLaMA, every BERT — there is a single line of math that's so simple it almost
looks like a typo:

```
x = TokenEmbedding(token) + PositionalEmbedding(position)
```

In plain words:

> Take a vector that says **what the word is** (we'll call it **A**, the token
> embedding). Take a vector that says **where the word is in the sentence**
> (we'll call it **B**, the positional embedding). **Add them.** That sum
> (**C**) is what the model actually sees.

Stop and notice how strange this is.

If I told you:
> "I added two numbers and got `7`. Can you tell me what the original numbers were?"

You'd say: "Of course not. They could be `3 + 4`, or `2 + 5`, or `6 + 1`, or
`0.5 + 6.5`, or `-100 + 107`. There are infinitely many possibilities. You destroyed
the information when you added them."

You'd be completely right. That's how addition works in everyday math. **Addition
loses information.**

So here's the puzzle:

> If the Transformer adds **A** (which word) and **B** (which position) into one
> vector **C**, how does the model later figure out:
>
> 1. Which word is at this position (we need **A** back)?
> 2. Which position this word is in (we need **B** back)?
>
> Didn't we just throw the information away the moment we added them?

This question is one of those things that, once it bothers you, doesn't go away.
And in fact, it *should* bother you — because the answer is genuinely deep and
beautiful, and the entire success of Transformer architectures sits on top of it.

This document is the long, careful, "explain it like I'm starting from zero"
answer.

We're going to build everything from scratch. No prerequisites except that you
can multiply, add, and read symbols. By the end, you will:

- Understand what vectors really are, beyond "lists of numbers."
- Understand what high-dimensional space is like, and why it's weird.
- Understand the dot product and orthogonality at the level of intuition.
- Understand exactly what a "matrix multiplication" does to a vector.
- Understand why `A + B = C` doesn't lose information *in this special case*.
- Understand the attention mechanism and how it reads both signals from `C`.
- Understand sinusoidal positional encodings and why they're designed that way.
- Be able to explain all of this to someone else.

Let's begin.

---

## 2. Why This Is Confusing: Your Brain Was Trained on the Wrong Math

Before we build the answer, let's diagnose why the puzzle feels so wrong in the
first place.

### 2.1 You learned math in 1D and 2D

When you learned arithmetic, you learned it on a **number line**. Numbers were
points on a line. `3 + 4 = 7` looked like:

```
0 — 1 — 2 — 3 — 4 — 5 — 6 — 7 — 8 — 9 — 10
              A───────►
                      B───────►
              C───────────────►
```

You added by sliding arrows. And in this picture, if you only know where the
final arrow ends (at 7), you cannot recover where the individual arrows came
from. The information is gone.

When you later learned geometry, you used **2D** — flat paper. Vectors became
arrows on a page, with an x-component and a y-component. Adding two arrows
gave you a new arrow. And again, given only the result, you couldn't perfectly
recover the original two arrows. There were too many ways to decompose the
result.

This is the world your intuition lives in: **a world where addition loses
information**.

### 2.2 But Transformers don't live in 1D or 2D

A typical Transformer's embedding space is **512-dimensional**, or **768-dimensional**,
or **4096-dimensional**. These aren't just "bigger" versions of 2D. They are
**qualitatively different**. The rules of geometry change.

> **Critical analogy.** Imagine a fish that has lived its entire life in water.
> The fish has a deep, gut-level intuition about how things move: they sink, or
> they float, or they drift with the current. Now you pull the fish out and ask
> it to predict how a baseball will move in *air*. The fish's intuition will be
> mostly wrong — air is a fundamentally different medium with different rules.
>
> Your brain is the fish, trained on the "water" of 1D and 2D math. The
> Transformer lives in the "air" of high-dimensional space. The rules are
> different there. Once you learn the rules, things that seemed impossible in
> 2D become completely natural.

### 2.3 The specific rule that changes

Here's the one rule that changes most dramatically — and it's the entire key to
the puzzle:

> **In high dimensions, you can arrange things so that addition preserves
> information.**

Not "approximately preserves" — actually, mathematically, fully preserves
(or as close to fully as you want). The trick is that the two things you're
adding have to be arranged in **special directions** in space. We'll spend most
of this document making that precise.

For now, the rough picture is:

- In 2D, there are only 2 "perpendicular directions" available.
- In 512D, there are 512 perfectly-perpendicular directions available — and
  even more directions that are *almost* perpendicular.
- If `A` lives in one direction and `B` lives in a different (perpendicular)
  direction, then `C = A + B` keeps both of them separable.

That's the punchline. The rest of this document earns it.

---
---

# Part II — Foundations: Vectors, Spaces, and Directions

We need to build a solid foundation before we can climb to the top. The next
few sections cover the basic objects: vectors, dimensions, dot products,
orthogonality, projections, and matrices. If you already know this material,
you can skim — but I encourage even people who "know it" to read these
sections, because we'll set up specific intuitions that will pay off later.

---

## 3. What Is a Vector, Really?

The textbook definition of a vector is "a list of numbers." That's true but
unhelpful. What does the list *mean*?

### 3.1 First view: a vector is a list of numbers

A 3-dimensional vector might look like:

```
v = [2, 5, -1]
```

It has three numbers. Each number is called a "component." We say `v` has
"3 components" or that it is "3-dimensional."

That's the syntax. Now the meaning.

### 3.2 Second view: a vector is an arrow

You can draw the vector `[2, 5, -1]` as an arrow in 3D space, starting at the
origin `(0, 0, 0)` and ending at the point `(2, 5, -1)`.

The arrow has two properties:
- A **direction** (which way it points)
- A **length** (how far it goes)

This is the picture most people remember from high school geometry. It's a
good picture, but it has a problem: once we go beyond 3 dimensions, you can't
actually draw the arrow. So we need an even more abstract view.

### 3.3 Third view (the one we'll use): a vector is a "configuration of meanings"

Here's the view that matters for understanding Transformers:

> **A vector is a list of "how much" of various qualities something has.**

Imagine you wanted to describe an apple. You could rate it on several scales:

```
apple = [sweetness, sourness, redness, greenness, hardness, juiciness, ...]
      = [   0.8,      0.3,     0.9,      0.1,        0.6,       0.7,     ...]
```

Each component of this vector measures "how much of this quality" the apple has.
The vector as a whole gives a complete profile.

Now if you described a banana the same way, you'd get a different vector:

```
banana = [0.7, 0.1, 0.0, 0.2, 0.4, 0.5, ...]
```

These two vectors are **points in the same space** — call it "fruit space" —
and you can compare them, add them, measure distances between them, etc. The
math works the same regardless of whether we're talking about 3D physical space
or 1000-dimensional fruit space.

This third view is critical because it's exactly how token embeddings work in
a Transformer. A token embedding is a vector of "how much of various meanings
this word has." We just don't get to name what each dimension means — the model
learns those dimensions during training.

### 3.4 A vector "is" its direction more than its position

For Transformers, the *direction* a vector points matters way more than its
length. Two vectors that point in the same direction encode "the same
information" (or at least, the same kind of information). Two vectors that
point in different directions encode "different things."

So when we say "the token embedding lives in a certain direction," we mean
that the model has assigned a particular *direction* in 512-dimensional space
to that word's meaning. Another word with similar meaning will live in a nearby
direction. A totally unrelated word will live in a very different direction
(ideally, a perpendicular one — we'll see why soon).

> **Quick metaphor.** Imagine each word as an arrow drawn on a giant map.
> "Cat" might point northeast. "Dog" might point in a very similar direction,
> just slightly off. "Mathematics" might point straight up. The arrows
> themselves aren't the *meanings* — but their *directions* encode the model's
> understanding of how words relate to one another.

---

## 4. What "Dimensions" Actually Means

The word "dimension" gets thrown around so much that people stop questioning
it. But it's worth pausing.

### 4.1 A dimension is "an independent direction you can move"

In 2D (a flat piece of paper), there are two independent directions: left-right
and up-down. Any movement on the paper can be decomposed into "how much I went
left-right" and "how much I went up-down." Two numbers fully specify the
movement. Hence, "2 dimensions."

In 3D (the room you're sitting in), there are three independent directions:
left-right, up-down, and forward-backward. Three numbers fully specify any
movement.

In 512D... there are 512 independent directions. We can't visualize them, but
the math is identical. Every "position" in this 512-dimensional space requires
512 numbers to fully specify.

### 4.2 "Independent" is the key word

The key idea is **independent**. The directions must be independent of each
other — moving in one shouldn't be the same as moving in another.

In a flat 2D paper, "north" and "northeast" are *not* independent. You could
get to a northeast position by going partly north and partly east. So "north,
east, and northeast" don't count as three dimensions — there are only really
two.

The way we make sure dimensions are independent is by making them
**perpendicular** to each other. Perpendicular means: moving along one
direction has zero effect along the other. They don't interfere. This is the
same word we used informally earlier; we'll formalize it as "orthogonality"
in section 6.

### 4.3 Each dimension can encode a "meaning"

If a vector has 512 dimensions, that means it has 512 independent "knobs" that
can each be set to a different value. Each knob can encode a different aspect
of meaning.

Imagine you had 512 little dials, and each dial measured a different aspect of
a word:
- Dial 1: "how concrete vs abstract is this word?"
- Dial 2: "how positive vs negative in sentiment?"
- Dial 3: "is this a noun or a verb?"
- ...
- Dial 512: "some other subtle aspect of meaning?"

The token embedding is the full configuration of all 512 dials, for that word.

Now, in practice, we don't get to name what each dial means. The model learns
the dials during training, and they end up encoding mixtures of intuitive
concepts. But the principle holds: **512 dimensions = 512 independent knobs
of meaning**.

### 4.4 The bigger the dimension, the more you can encode

Here's the punchline of this section, and it'll matter later:

> **The more dimensions you have, the more independent pieces of information
> you can encode in a single vector — without them interfering with each other.**

In 1D, you can encode one number. In 2D, two. In 3D, three. In 512D, you can
encode 512 independent things at once.

Now scale this up to the question we care about. A Transformer needs to encode
*at least*:

- What word this is (semantic info)
- Where this word is in the sentence (positional info)

If we had only 2 dimensions, we'd have to cram both into 2 numbers, and they'd
necessarily interfere. With 512 dimensions, we have *plenty of room* for both —
and they don't have to step on each other's toes.

---

## 5. The Dot Product: The Most Important Operation in the Whole Story

The dot product is going to come up everywhere. It's the single most important
operation in this entire document. So let's get it deeply.

### 5.1 The formula

For two vectors of the same length:

```
A = [a₁, a₂, a₃, ..., aₙ]
B = [b₁, b₂, b₃, ..., bₙ]
```

Their dot product is:

```
A · B = a₁·b₁ + a₂·b₂ + a₃·b₃ + ... + aₙ·bₙ
```

You multiply matching components and add up the results. The dot product is a
single number (a *scalar*), not a vector.

### 5.2 An example

```
A = [1, 2, 3]
B = [4, 5, 6]

A · B = 1·4 + 2·5 + 3·6 = 4 + 10 + 18 = 32
```

That's the calculation. Now let's understand what `32` *means*.

### 5.3 What does the dot product measure?

The dot product measures **how much two vectors point in the same direction**.

- If `A` and `B` point in **similar directions**, their dot product is a large
  positive number.
- If `A` and `B` point in **opposite directions**, their dot product is a large
  negative number.
- If `A` and `B` are **perpendicular** to each other, their dot product is
  **exactly zero**.

This is the single most important property of the dot product. Memorize it.

### 5.4 Why this works (geometric explanation)

There's a famous formula that connects the dot product to geometry:

```
A · B = |A| · |B| · cos(θ)
```

where `|A|` is the length of `A`, `|B|` is the length of `B`, and `θ` is the
angle between them.

You don't need to memorize this formula. What you need to remember is:

- `cos(0°) = 1` → vectors pointing the same way have a maximal dot product.
- `cos(90°) = 0` → perpendicular vectors have a dot product of exactly zero.
- `cos(180°) = -1` → vectors pointing in opposite directions have a maximally
  negative dot product.

So the dot product is essentially a "direction similarity score."

> **Metaphor.** Imagine you and a friend each push a heavy box. If you both
> push in the same direction, your efforts combine — that's a high dot
> product. If you push perpendicular to each other, your efforts don't help
> each other at all — that's a zero dot product. If you push in opposite
> directions, you cancel each other out — that's a negative dot product.
>
> The dot product is "how much our efforts agree."

### 5.5 The dot product is everywhere in deep learning

Every "score" in a neural network is, deep down, a dot product. Attention
scores are dot products between queries and keys. Similarity between embeddings
is measured by dot products. Even the basic operation of a linear layer
(multiplying a matrix by a vector) is just a bunch of dot products in
parallel.

So when we talk about how the Transformer extracts information from the sum
`A + B`, we're really going to talk about dot products. Every step of the
extraction is "compute a dot product against some learned direction."

### 5.6 The crucial sub-case: dot product with itself

What's `A · A`?

```
A · A = a₁² + a₂² + a₃² + ... + aₙ²
```

This is the sum of squares of all the components. By the Pythagorean theorem,
this equals the **squared length** of `A`. So `A · A = |A|²`, which means
`|A| = √(A · A)`.

The dot product of a vector with itself measures how big it is. Good to know.

---

## 6. Orthogonality: When Two Vectors Don't Interfere

Now we're ready to define the word that will dominate the rest of this
document.

### 6.1 The definition

Two vectors are **orthogonal** if their dot product is zero:

```
A and B are orthogonal   ⇔   A · B = 0
```

That's it. That's the definition.

### 6.2 What it means geometrically

Orthogonal vectors point in **perpendicular** directions. They don't "share
any direction" with each other. Movement along one has zero overlap with
movement along the other.

In 2D, the classic example is the x-axis vector `(1, 0)` and the y-axis vector
`(0, 1)`. Their dot product is `1·0 + 0·1 = 0`. They're orthogonal.

In 3D, the three coordinate axes — x, y, z — are all mutually orthogonal. Any
two of them have a dot product of zero.

### 6.3 Why orthogonality matters: no interference

Here's the magic property of orthogonality. **If `A` and `B` are orthogonal,
then they encode independent information.**

What does "independent" mean here? It means:

- Knowing something about `A` tells you nothing about `B`.
- Adding `A` and `B` doesn't blend their information together.
- You can later separate `A` and `B` from their sum.

This is exactly the property the Transformer needs. If the token embedding and
the positional embedding are orthogonal, then their sum keeps both signals
"intact" — even though they're combined in one vector, they don't interfere.

> **The shopping cart metaphor (extended version).** Imagine I dump a bag of
> apples into a shopping cart, then a bag of bananas into the same cart. Even
> though they share the same cart, the apples and bananas don't *mix*. I can
> easily reach in and pull out only apples, or only bananas. They are
> "orthogonal" in the sense that they are independent objects.
>
> Compare this to dumping applesauce and banana puree into a blender. Once you
> blend them, you can't unblend them. They've literally merged at the molecular
> level. This is what happens when vectors *aren't* orthogonal — their
> information mixes.
>
> The Transformer's trick is to put token and positional info into the
> "shopping cart" mode, not the "blender" mode. Orthogonality is what
> guarantees this.

### 6.4 In high dimensions, orthogonality is the default

Here's a wild fact we'll explore more in Part III: in high-dimensional space,
**most pairs of randomly-chosen vectors are nearly orthogonal**.

If I pick two random arrows on a flat 2D piece of paper, there's a decent
chance they point in similar directions or opposite directions. Their angle
will be all over the place.

If I pick two random arrows in 512-dimensional space, the angle between them
will *almost certainly* be very close to 90 degrees. Their dot product will be
very close to zero. They will be nearly orthogonal **by accident**.

This is a strange, deep fact about high dimensions. We'll see why later, but
the practical implication is huge:

> In high-dimensional space, vectors *want* to be orthogonal. You almost have
> to *try* to make them not orthogonal. The geometry is on our side.

### 6.5 Orthogonal vectors as "independent axes"

When two vectors are orthogonal, you can think of them as defining their own
"coordinate axes." They become the natural directions to decompose other
vectors along.

For example, given two orthogonal vectors `e₁` and `e₂` in some 2D plane,
any vector `v` in that plane can be written as:

```
v = α·e₁ + β·e₂
```

where `α` measures "how much of `v` is in the `e₁` direction" and `β` measures
"how much of `v` is in the `e₂` direction." And — this is the key — you can
recover `α` and `β` perfectly from `v`, using dot products:

```
α = v · e₁    (assuming e₁ has unit length)
β = v · e₂    (assuming e₂ has unit length)
```

**This is exactly the mechanism by which a Transformer extracts token and
positional info from the sum.** The token embedding lives along one
orthogonal direction; the positional embedding lives along another. The model
recovers each one by taking the dot product against the appropriate direction.

We'll formalize this in section 7.

---

## 7. Projections: Extracting "How Much of One Thing Is in Another"

A **projection** is the act of asking, "how much of vector A is in the direction
of vector B?" Projections are the literal mechanism by which a Transformer
pulls token and positional information out of the sum.

### 7.1 The intuition

Imagine you're walking northeast. How much of your walk is "northward"?

To answer, you project your motion onto the north direction. You drop a
perpendicular line down from your endpoint to the north-south axis. The length
of that perpendicular tells you "how much north you walked."

That's a projection. It's how you ask, "of this combined vector, how much
points in a particular direction?"

> **Shadow metaphor.** Imagine the sun is directly overhead and you're holding
> a stick at an angle. The stick casts a shadow on the ground. The shadow is
> the **projection** of the stick onto the ground.
>
> The longer your stick and the more horizontal it is, the longer the shadow.
> If the stick is vertical, the shadow is just a dot (length zero — the stick
> has no horizontal component).
>
> A projection asks: "what's the shadow of this vector along that direction?"

### 7.2 The math of projection

To project a vector `v` onto a unit-length direction `u` (where "unit-length"
means `|u| = 1`), you compute the dot product:

```
projection of v onto u  =  (v · u) · u
```

The part `v · u` is a scalar (a single number) — that's the "length of the
shadow." The part `· u` just turns that number back into a vector pointing in
the `u` direction. The result is "the part of `v` that's in the `u` direction."

For our purposes, we usually just care about the scalar — the length of the
shadow — because that *is* the information we want to extract.

### 7.3 Why this is the key to recovery

Now here's the punchline that ties everything together.

Suppose `A` and `B` are orthogonal vectors. Say `A` points along direction `u`
and `B` points along a different orthogonal direction `w`. Specifically:

```
A = α · u
B = β · w
```

where `α` and `β` are some numbers and `u · w = 0` (orthogonal directions).

Their sum:

```
C = A + B = α·u + β·w
```

Now I want to recover `α` (which is the "amount of A"). I project `C` onto `u`:

```
C · u = (α·u + β·w) · u
      = α·(u · u) + β·(w · u)
      = α·1 + β·0          (because u has unit length and u is orthogonal to w)
      = α
```

**Bingo.** The dot product of `C` against `u` perfectly recovers `α` — the
amount of `A` — even though `C` is a sum of both `A` and `B`. The contribution
of `B` was wiped out because `B · u = 0` (orthogonal).

This is the **mechanism**. This is the answer to the puzzle. Information isn't
lost in `C = A + B` *if* `A` and `B` are orthogonal, because we can recover
each of them by a simple dot product against the right direction.

### 7.4 Projections are how attention works

Every operation in a Transformer's attention mechanism is, deep down, doing
this projection-style extraction. When the model multiplies the input vector
`X = T + P` by a learned matrix `W_Q`, it's projecting onto a set of learned
directions. Each row of `W_Q` is one of those directions, and the
multiplication computes the dot product against each row, extracting "how
much of each direction" is in the input.

The learned matrices `W_Q`, `W_K`, `W_V` are essentially *bundles of
projection directions*. They were learned, during training, to point at
exactly the right directions to extract the right kinds of information from
the input vectors.

This is the secret sauce. The whole Transformer is a stack of
"learned projections" that extract just the right information at each layer.


---

## 8. Matrices: Machines That Transform Vectors

A matrix is a rectangular grid of numbers. But more importantly: **a matrix is
a machine that transforms vectors**.

### 8.1 What a matrix does

When you multiply a matrix `M` by a vector `v`, you get a new vector. The
matrix is a *transformation*: input a vector, output a different vector.

```
M · v = v'    (some new vector)
```

A matrix can do many kinds of transformations:
- Rotate a vector (spin it to a new angle)
- Stretch or shrink a vector along certain directions
- Squash a vector down to a lower-dimensional space (a "projection")
- Reflect a vector across some axis

For our purposes, the most important kind of matrix transformation is the
projection: a matrix that **extracts certain components** of the input vector.

### 8.2 How matrix-vector multiplication actually works

A matrix multiplication is *just a bunch of dot products in parallel*. Each row
of the matrix is a direction; the corresponding output component is the dot
product of the input vector with that row.

Example. Suppose:

```
M = | 1  0  0 |
    | 0  1  0 |
    | 0  0  0 |

v = [4, 5, 6]
```

Then `M · v`:
- First output component: row 1 of M dotted with v = `1·4 + 0·5 + 0·6 = 4`
- Second output component: row 2 of M dotted with v = `0·4 + 1·5 + 0·6 = 5`
- Third output component: row 3 of M dotted with v = `0·4 + 0·5 + 0·6 = 0`

Result: `M · v = [4, 5, 0]`.

So this matrix took the input `[4, 5, 6]` and zeroed out the third component
while keeping the first two. It's a **projection** onto the first two
dimensions.

### 8.3 Matrices as bundles of "filter directions"

Here's the mental model that matters for the rest of this document:

> Every matrix is a **bundle of directions** (one per row). When you multiply
> the matrix by a vector, you're computing the dot product of that vector
> against each direction — extracting "how much" of each direction is present
> in the input.

So a matrix `M` with 3 rows is asking the input vector 3 questions in parallel:
- "How much of you points in direction 1?" (row 1)
- "How much of you points in direction 2?" (row 2)
- "How much of you points in direction 3?" (row 3)

The output vector collects the 3 answers.

This is *exactly* how the projection matrices `W_Q`, `W_K`, and `W_V` work in
attention. They're bundles of learned directions; each one asks the input
vector a specific question, and the output captures the answers.

### 8.4 The linear algebra of "extracting orthogonal components"

If you have a set of orthogonal directions `u₁, u₂, ..., uₖ` and you want to
extract "how much of each direction" is present in a vector `v`, you build a
matrix whose rows are those directions:

```
U = | u₁ |
    | u₂ |
    | ... |
    | uₖ |
```

Then `U · v` gives you a `k`-dimensional vector whose components are
`v · u₁, v · u₂, ..., v · uₖ` — the projections of `v` onto each direction.

If `v` happens to be a sum of vectors that each lie along one of these
directions, the projections will perfectly separate out each component. This
is, *literally*, the math that lets the Transformer recover token and
positional info from their sum.

### 8.5 Why "linear" matters

A matrix multiplication is a *linear* operation, meaning it has these two
properties:

```
M · (A + B) = M·A + M·B          (distributes over addition)
M · (c·A) = c·(M·A)              (scalar multiplication passes through)
```

The first property is the one we care about. It says: **the matrix applied to
a sum equals the sum of the matrix applied to each piece.**

This is exactly what lets us extract components from a sum. If we apply the
matrix `W` to the combined input `C = A + B`:

```
W · C = W · (A + B) = W·A + W·B
```

If `W` is tuned to keep `A` and kill `B`, then `W·A = A` and `W·B ≈ 0`, and
the output of the matrix is just `A`. The matrix extracted `A` from the sum.

> **Crucial takeaway.** Matrices are not just storage. They're not just
> "tables of numbers." They are **transformation machines** that act on
> vectors. The Transformer is, at its core, a sequence of such machines, each
> tuned (during training) to extract or transform some specific aspect of the
> input. Every "neural network layer" is one of these machines. Every step in
> the model is "apply some learned matrix to extract something."

---
---

# Part III — High Dimensions Are a Different World

We've built the basic toolkit: vectors, dot products, orthogonality,
projections, matrices. Now we need to confront the strangest part of the whole
story: **high-dimensional space is genuinely weird**. Things happen in 512D
that simply don't happen in 2D or 3D. We have to understand these phenomena
to understand why Transformers work.

---

## 9. Three Astonishing Facts About High-Dimensional Space

Here are three facts that will violate your intuition. They're all
mathematically provable. Sit with them.

### 9.1 Fact 1: Random vectors in high dimensions are nearly orthogonal

If you pick two random vectors in 2D, their dot product (after normalizing for
length) can be anywhere from -1 to 1, depending on the angle. Sometimes they're
close to parallel, sometimes perpendicular.

If you pick two random vectors in 512D, however, their normalized dot product
is **almost always very close to zero**. The standard deviation of the dot
product between two random unit vectors in `d` dimensions is roughly `1/√d`.
In 512D, that's about `0.044`. Most random vector pairs are nearly
perpendicular.

> **Intuition.** In 2D, there are only 2 directions to choose from (well,
> infinitely many, but they all live on a circle — a 1-dimensional surface).
> Two random directions on a circle have a decent chance of being aligned.
>
> In 512D, there are *vastly* more directions available — they live on a
> 511-dimensional sphere, which has astronomical "surface area." Two random
> points on this sphere are almost certainly far apart, and the directions
> they define from the center are almost certainly perpendicular.
>
> **Think of it like this:** if you and a friend each randomly throw a dart at
> a globe, you'll often hit nearby spots. But if you throw darts in a
> 512-dimensional space, the surface is so vast that you'll *almost always*
> land in completely different "neighborhoods" — at perpendicular directions
> from the center.

### 9.2 Fact 2: You can pack way more "almost-orthogonal" vectors than dimensions

In `d`-dimensional space, you can fit exactly `d` *perfectly* orthogonal
vectors (one along each axis). Try to add a `(d+1)`th, and it has to overlap
with at least one of the others.

But if you relax "perfectly orthogonal" to "nearly orthogonal" (dot products
within some small tolerance), you can fit **exponentially many** such vectors
in `d`-dimensional space. The exact number grows as `exp(c · d)` for some
constant `c` that depends on how loose your tolerance is.

In 512D, with reasonable tolerance, you can fit *billions* of nearly-orthogonal
vectors. Some sources call this **quasi-orthogonality**; others reference the
**Johnson–Lindenstrauss lemma**, which is the formal mathematical statement.

> **What this means for Transformers.** Each "concept" the model might want
> to track — every distinct meaning, every distinct position, every distinct
> grammatical pattern — can be assigned its own near-orthogonal direction in
> the 512D embedding space. The model has effectively *unlimited* capacity for
> independent concepts, despite having "only" 512 dimensions.
>
> This is the geometric foundation that allows neural networks to do
> "superposition" — representing many features in the same embedding space
> without them stepping on each other.

### 9.3 Fact 3: In high dimensions, everything is on the surface

Here's a fact that has nothing to do with our main story but is so weird I
want to share it anyway, because it gives you a feel for high-dimensional
strangeness.

If you have a sphere in 3D, most of its volume is *inside*. Not many points
are right on the surface.

If you have a sphere in 512D, almost all of its volume is concentrated in a
thin shell near the surface. The interior is, relatively, almost empty.

The world of high dimensions just doesn't behave like 3D. Don't try to
visualize it directly — use the math.

### 9.4 The combined picture

Putting Facts 1 and 2 together, here's the picture for our purposes:

> In a 512-dimensional space, vectors naturally arrange themselves so that
> many independent "concepts" can each have their own direction, with minimal
> interference between them. This is what makes neural network embeddings work
> at all. It's the geometric reality that "the model can store many things in
> one vector."

For the Transformer specifically:

- The token embedding can occupy one set of directions.
- The positional embedding can occupy a different set of directions.
- The two sets are nearly orthogonal — partly by the geometry of high
  dimensions, partly by training pressure.
- The sum `T + P` contains both signals, in non-interfering directions.
- The learned projections in attention can recover each signal.

This is the answer to the puzzle. We're going to spend the rest of the
document making this picture rigorous, concrete, and impossible to forget.

---

## 10. The Concept of a "Subspace"

A **subspace** is a "smaller space" living inside a bigger one. It's a key
concept for understanding where token embeddings vs. positional embeddings
live.

### 10.1 Definition by example

In 3D space, examples of subspaces include:

- **A line through the origin** — this is a 1-dimensional subspace. Any
  vector lying on this line is part of the subspace.
- **A plane through the origin** — this is a 2-dimensional subspace. Any
  vector lying on this plane is part of it.

(They have to pass through the origin to count as subspaces; this is a
technical detail.)

So a subspace is "all the vectors you can build by mixing some particular set
of base directions."

### 10.2 Subspaces in 512D

In a 512-dimensional space, you can have subspaces of various sizes:

- A 1D subspace: all vectors along some particular direction.
- A 5D subspace: all vectors built from 5 particular independent directions.
- A 100D subspace: all vectors built from 100 particular independent
  directions.
- The full 512D space itself (the trivial case).

You can think of a subspace as a "region of the bigger space, defined by
some directions." Anything inside the region is part of the subspace; anything
outside isn't.

### 10.3 Two subspaces can be orthogonal

Just as two vectors can be orthogonal (perpendicular), two subspaces can be
orthogonal. Two subspaces are orthogonal if every vector in one is orthogonal
to every vector in the other.

Concrete example. In 3D space:

- The x-axis (a 1D subspace) and the y-axis (another 1D subspace) are
  orthogonal subspaces. Any vector along x is perpendicular to any vector
  along y.
- The "xy-plane" (a 2D subspace, all vectors with z = 0) and the z-axis
  (a 1D subspace) are orthogonal subspaces. Any vector in the xy-plane is
  perpendicular to any vector along z.

### 10.4 Why subspaces matter for our story

Here's the key claim:

> The **token embeddings live in one subspace** of the 512D embedding space.
> The **positional embeddings live in a different (approximately orthogonal)
> subspace**. The sum lives in the union, but each piece can be recovered by
> projecting back onto its respective subspace.

It's not that each individual token embedding is orthogonal to each individual
positional embedding (although they often are). It's that **the entire range
of possible token embeddings occupies one region of space**, and **the entire
range of possible positional embeddings occupies a different (orthogonal-ish)
region**.

> **Cleaner metaphor.** Imagine a 512-dimensional warehouse. The warehouse
> has a "fruit section" (a subspace where all fruit-related vectors live) and
> a "vehicle section" (a different subspace where all vehicle-related vectors
> live). The two sections are in different corners of the warehouse; they
> don't overlap.
>
> Any "fruit + vehicle" object (apple plus car?) lives in a hybrid location,
> but you can still figure out which fruit and which vehicle it was, because
> the two sections were separate. The fruit info is preserved in the fruit
> direction; the vehicle info is preserved in the vehicle direction.

This is exactly the situation for token + position. Each lives in its own
subspace. The sum is a "hybrid" living in the combined region, but the two
signals can be cleanly separated.

---

## 11. Why You Can Hide Many Things in One Vector

Let's combine everything from Part III to state the central fact that makes
Transformers possible.

### 11.1 The capacity claim

In `d`-dimensional space, you can encode:

- Up to `d` *perfectly independent* pieces of information (one along each
  orthogonal axis).
- Far more — *exponentially* more — *approximately independent* pieces of
  information (using nearly-orthogonal directions).

For a Transformer with `d = 512`, this means: in any single 512-dimensional
vector, you can store hundreds or even thousands of distinct "concepts," each
in its own near-orthogonal direction, without them interfering with each
other.

### 11.2 The "superposition" view

In modern interpretability research (especially Anthropic's work), this is
called **superposition**: many features superposed in a single vector,
recoverable through the right projection. The Transformer takes advantage of
superposition at every layer.

For the input embedding specifically, the superposition is between just two
things:

- The token (semantic info)
- The position

Two things is *very few* compared to what the embedding space can hold. So
the two signals can live in completely separate parts of the space, with
plenty of "room to spare." This makes recovery extremely reliable.

### 11.3 The metaphor library so far

We've now built up several metaphors for this. Let's collect them:

- **Shopping cart vs. blender:** orthogonal additions are like dumping apples
  and bananas into a cart (separable); non-orthogonal additions are like
  blending applesauce and banana puree (inseparable).
- **North + East:** if you walk 3 miles north and 5 miles east, you end up at
  a known point that perfectly decomposes back into the two journeys, because
  north and east are perpendicular.
- **Warehouse with sections:** a 512D embedding space has different "sections"
  for different kinds of information. They don't overlap. Items in different
  sections can coexist in the same warehouse without interfering.
- **Random darts on a globe:** in high dimensions, two random vectors are
  almost certainly perpendicular. The geometry naturally separates things.

### 11.4 Why this resolves the original puzzle

Recall the puzzle:

> If `A + B = C`, how can we recover `A` and `B` from `C` alone?

In 1D or 2D, you can't. But in high dimensions:

1. If `A` lives in subspace `S_A` and `B` lives in subspace `S_B`, and these
   are (approximately) orthogonal, then `A` and `B` don't interfere when
   added.
2. The sum `C = A + B` lives in the combined subspace `S_A ∪ S_B`, but with
   its `S_A` component being exactly `A` and its `S_B` component being
   exactly `B`.
3. A projection onto `S_A` (a learned matrix) extracts `A` from `C`.
   A projection onto `S_B` extracts `B`.
4. Therefore, **information is not lost**. The "addition" was just a way of
   bundling two signals into a single physical vector, with each signal
   living in its own designated direction.

The puzzle dissolves once you grant that high dimensions allow this kind of
non-interfering bundling.

---
---

# Part IV — Embeddings: What They Are and Where They Live

We now turn from abstract math to the actual content of a Transformer. What
*is* a token embedding? What *is* a positional embedding? Where in space do
they live? How are they related to each other?

---

## 12. Token Embeddings: Meaning as Direction

### 12.1 What a token embedding is

When a Transformer processes text, it first breaks the text into tokens
(roughly, words or word-pieces). Each unique token in the vocabulary gets
assigned a fixed vector — its **token embedding**.

The model has a giant lookup table:

```
"the"    → [0.20, -0.10, 0.80, 0.05, ..., 0.13]      (a 512-dim vector)
"cat"    → [-0.30, 0.50, 0.10, -0.20, ..., 0.42]
"sat"    → [0.10, 0.40, -0.20, 0.30, ..., -0.05]
"dog"    → [-0.28, 0.52, 0.08, -0.22, ..., 0.39]
...
"#zebra" → [0.91, -0.33, 0.15, 0.04, ..., -0.18]
```

When the model receives the token "cat," it looks up the row in this table
and gets `T_cat`, a fixed 512-dimensional vector. That vector *is* the
model's representation of the meaning of "cat."

### 12.2 The embeddings are learned

These vectors are not chosen by a human. They are **learned during training**.
At the start of training, they are random. As the model trains on text, it
adjusts each token's embedding to do its job well — that is, to make the
model's predictions accurate.

The result is that, after training, the embeddings have rich structure. Words
with similar meanings end up at nearby locations in the 512D space. Words
with very different meanings end up far apart.

Famous example: in word embeddings, you can do "vector arithmetic" like:

```
king - man + woman ≈ queen
```

This works because the model has learned to encode "royalty" in some
direction and "gender" in another direction, and the arithmetic combines them
correctly.

### 12.3 The token subspace

The full set of token embeddings — one for each word in the vocabulary —
collectively occupies some region of the 512D space. We can call this the
**token subspace**, though technically it's just "the set of vectors the
model has assigned to tokens."

The token subspace is not a perfectly clean shape. It's whatever the model
has learned. But it tends to occupy a certain *region* of the 512D space —
roughly, the region that produces good language predictions.

A key empirical observation: the token subspace, after training, tends to
**not heavily overlap with the positional subspace**. Why? Because if it did,
position info would interfere with token info, and the model would lose
performance. Training pushes them apart.

### 12.4 What an individual token vector means

The 512 numbers in a token embedding don't have individual interpretable
meanings. The model doesn't dedicate "dimension 7" to mean "is this an
animal?" Instead, meaning is distributed across many dimensions, in
combinations.

But there's a deeper sense in which the token vector "means" something: it
is a **point in semantic space** that the model has learned to associate
with this word. Two words with related meanings are placed at nearby points;
unrelated words are placed at distant points. The geometry of the token
subspace encodes the structure of meaning.

> **Metaphor.** Imagine a giant 3D map of all the cities in the world, except
> the map is 512-dimensional and the "cities" are words. Cities that are
> culturally or geographically related (Paris and Lyon, or Tokyo and Osaka)
> are placed near each other on the map. Unrelated cities (Paris and
> Antarctica) are placed far apart.
>
> When the model "looks at" a token, what it's doing is locating that token
> on this huge semantic map. The position on the map — the direction of the
> token's embedding — *is* the model's understanding of the word's meaning.

---

## 13. Positional Embeddings: Position as Direction

### 13.1 What a positional embedding is

A token's meaning is only half of what the model needs. It also needs to
know *where* the token is. "The dog bit the man" is very different from
"The man bit the dog," even though the tokens are identical.

So in addition to the token embedding, each input position gets a
**positional embedding** — another 512-dimensional vector that encodes
*where* this token sits in the sequence.

If the sentence has 10 tokens, then position 0 gets `P_0`, position 1 gets
`P_1`, ..., position 9 gets `P_9`. These are 10 distinct 512D vectors.

### 13.2 Two main approaches

There are two main ways to assign positional embeddings:

1. **Fixed (sinusoidal) positional embeddings.** Use a mathematical formula
   based on sines and cosines. This is what the original Transformer paper
   used. Section 19 onward will dissect this approach.
2. **Learned positional embeddings.** Just have another lookup table, like the
   token embeddings, but indexed by position instead of by word. Each position
   gets a vector that's learned during training. Section 28 will discuss this.

Both approaches work. The original Transformer used the fixed sinusoidal kind
because it generalizes better to longer sequences and has nice mathematical
properties. We'll mostly focus on the sinusoidal kind in this document.

### 13.3 The positional subspace

Just as token embeddings collectively occupy a "token subspace," positional
embeddings occupy a "positional subspace." For sinusoidal embeddings, this
subspace has a very specific, mathematically defined shape — it's the
manifold traced out by the sine and cosine functions at various frequencies.

We'll dive into the exact shape in Part VI. For now, just know that:

- The positional subspace is a relatively small region of the 512D space.
- It's roughly orthogonal to the typical token embedding's direction.
- It has rich internal structure (encoding multiple "frequencies" of
  position).

### 13.4 Why position needs its own embedding at all

You might wonder: why not just encode the position as a single number, like
"position 5"? Why use a whole 512-dimensional vector?

Two reasons:

1. **The model only consumes vectors.** Every operation in the Transformer
   works on 512-dim vectors. There's no "scalar slot" where you could
   insert a position number. To get position info into the model, it has to
   be packaged as a vector.

2. **A single number doesn't combine nicely.** If we just slapped the
   position number `5` into the token vector, it would dominate one dimension
   and warp the geometry. A full positional embedding spreads the position
   info across many dimensions in a controlled, balanced way.

### 13.5 Positions also have meanings as directions

Just as token embeddings encode "meaning as direction," positional embeddings
encode "position as direction." Each position is a unique direction in 512D
space.

And — this is the part that took some figuring out — the geometry of these
positional directions is designed so that *nearby positions get similar
directions*. Position 5's vector is more similar to position 6's vector than
to position 100's vector. This makes positional info smooth, so the model
can generalize "what does it mean to be near position X" across nearby
positions.

We'll see exactly how sinusoidal encodings achieve this in Part VI.

---

## 14. Why the Two Embeddings Don't Mix Themselves Up

This is the crucial section. We've claimed that token and positional
embeddings live in different subspaces. Let's now look at *why* that's true,
and what guarantees it.

### 14.1 Two forces pushing them apart

There are two mechanisms that keep the token subspace and positional
subspace apart:

1. **Geometric force (free of charge):** in high dimensions, random vectors
   are nearly orthogonal anyway. Even before training, the token and
   positional vectors don't overlap much. The geometry of 512D space
   provides this "for free."

2. **Training force (the bigger effect):** during training, gradient descent
   notices if token and positional info are interfering. If a token embedding
   accidentally aligned with a positional direction, the model would confuse
   "the word means X" with "the word is at position Y." This would hurt the
   loss. Gradient descent then nudges the token embedding *away* from that
   alignment.

Together, these two forces ensure that — by the end of training — the two
subspaces are nicely separated.

### 14.2 You can measure this experimentally

This isn't just theory. You can train a Transformer, extract the token and
positional embeddings, and compute the dot products between them. The result:
dot products are very close to zero. Empirically, the two subspaces are
nearly orthogonal in trained models.

This is one of the cleanest examples of "the architecture has the capacity
for this, and training delivers on it."

### 14.3 Why we can't just *enforce* orthogonality directly

One natural question: why don't we just hard-code orthogonality? Why not
require, by construction, that token and positional embeddings be exactly
orthogonal?

The answer is: we *could*, but we usually don't, because:

- The geometry of high dimensions makes it nearly automatic anyway.
- Forcing exact orthogonality reduces flexibility. Sometimes a tiny amount
  of overlap is actually useful for the model to learn certain patterns.
- The cost of approximate (vs. exact) orthogonality is negligible in
  practice.

The model is allowed to have a *little* overlap, and it sometimes uses that
overlap intentionally to encode useful correlations. The system is robust to
this. The orthogonality is "soft" — emergent rather than enforced.

### 14.4 Summary so far

Here's where we are in the story:

- A vector in 512D space can encode many independent things, each along its
  own near-orthogonal direction.
- The Transformer assigns one set of directions to token meanings and a
  different set to position information.
- When we add `T + P`, we're combining two non-interfering signals into one
  vector. The information of both is preserved.
- The model has learned matrices (`W_Q`, `W_K`, `W_V`) that can project
  the combined vector back onto either subspace, recovering the original
  information.

We've now established the *what* and the *why*. Next, in Part V, we'll get
very concrete about the *how* — actual numerical examples, the precise
mechanism by which projections work, and worked-out arithmetic.


---
---

# Part V — The Mechanics of Recovery

We've laid the groundwork. Now let's get our hands dirty. In this part, we
work through the actual mechanism by which the Transformer recovers token
and positional info from their sum. We'll do real arithmetic, examine real
matrices, and verify everything by hand.

---

## 15. How Addition Can Be Information-Preserving

### 15.1 Restating the central claim

The claim, stated as precisely as possible:

> If `A` lives in subspace `S_A`, `B` lives in subspace `S_B`, and `S_A` and
> `S_B` are orthogonal, then `A` and `B` can both be recovered from `C = A + B`
> by projecting `C` onto the appropriate subspace.

This is a theorem of linear algebra. It's not approximate. It's exactly true.

### 15.2 Why orthogonality is the magic ingredient

When `S_A` and `S_B` are orthogonal:

- Every vector in `S_A` has dot product zero with every vector in `S_B`.
- A projection onto `S_A` keeps vectors in `S_A` unchanged and turns vectors
  in `S_B` into zero.
- Therefore, projecting `A + B` onto `S_A` gives `A + 0 = A`.

This is a direct consequence of how projections work (Section 7) and what
orthogonality means (Section 6). There's no trick. It just works.

### 15.3 When orthogonality fails

What if the two subspaces aren't orthogonal? Then projection becomes lossy.

Imagine `S_A` is the x-axis and `S_B` is a line at 45° to the x-axis. They're
not orthogonal. If `A = (3, 0)` and `B` is along the 45° line with magnitude 2,
then `B = (√2, √2)`. The sum is `C = (3 + √2, √2)`.

Projecting `C` onto the x-axis gives `(3 + √2, 0)` — which is **not** `A`. The
projection "picked up" some contribution from `B`, because `B` has a nonzero
component along the x-axis.

This is the failure mode. It's why we need (approximate) orthogonality.

In high dimensions, this failure is mild because the contamination is small.
But it's why we want the geometry to push token and positional embeddings into
nearly-orthogonal subspaces.

### 15.4 A useful way to think about it

> **The "channels" picture.** Imagine the 512D embedding space as a giant
> mixing board with hundreds of independent audio channels. Each channel is a
> direction (or a small bundle of directions) in the space. Token info gets
> piped into certain channels; positional info into others. Adding them is
> just routing them through the same physical mixer.
>
> As long as token and position use different channels, there's no
> cross-contamination. A "filter" that listens to only the token channels
> hears only the token signal, even though the position signal is playing
> simultaneously on other channels.

---

## 16. The Linear Filter Idea

We've described matrices as "bundles of filter directions." Now let's see
exactly how this works as a recovery mechanism.

### 16.1 Defining a "token filter"

Suppose we want a matrix `W_token` that, when multiplied by the combined
embedding `C = T + P`, outputs (a close approximation of) the original token
embedding `T`.

What we need:

- For every token embedding `T`, `W_token · T ≈ T`.
- For every positional embedding `P`, `W_token · P ≈ 0`.

Then: `W_token · (T + P) = W_token · T + W_token · P ≈ T + 0 = T`.

The matrix `W_token` is a **filter** that passes token info and blocks
positional info.

### 16.2 Can such a matrix exist?

Yes. Here's the recipe.

Let's say the token subspace `S_T` is spanned by some orthogonal directions
`t₁, t₂, ..., t_k`. The positional subspace `S_P` is spanned by other
directions `p₁, p₂, ..., p_m`, which are all orthogonal to the `t_i`'s.

The matrix:

```
W_token = t₁ · t₁ᵀ + t₂ · t₂ᵀ + ... + t_k · t_kᵀ
```

(where `tᵀ` means the transpose of the column vector `t`, making it a row
vector — together they form a "rank-1 matrix") is exactly the matrix that
projects onto `S_T` and kills everything in `S_P`.

You don't have to follow the algebra. The point is: **such a matrix exists,
it's expressible in terms of the basis vectors of the token subspace, and it
does the job.**

### 16.3 The Transformer learns these matrices

Now here's the critical point. In a Transformer, we don't hand-design
`W_token` and `W_pos`. Instead, the model has learnable matrices `W_Q`,
`W_K`, `W_V`, and **training automatically tunes them** to do the right
projections.

Different attention heads end up with different matrices, doing different
kinds of extraction. Some heads' `W_Q` and `W_K` matrices act like
"token filters" (extracting semantic info), others act like "position
filters" (extracting positional info), and most act like hybrids that
extract specific combinations relevant to a particular pattern.

### 16.4 Why training works to find these matrices

Here's the gradient descent story:

1. At initialization, `W_Q`, `W_K`, `W_V` are random. They don't extract any
   specific signal cleanly.
2. The model makes predictions. They're bad. The loss is high.
3. Gradient descent computes: "for each parameter, in which direction would
   slightly nudging it make the prediction better?" This includes nudges to
   `W_Q`, `W_K`, `W_V`.
4. Specifically, when extracting token info would help, gradients push
   `W_Q`, `W_K`, `W_V` toward being better "token filters." When extracting
   position info would help, they push toward being better "position
   filters."
5. After millions of training steps, the matrices have settled into
   configurations that extract exactly the right info for the model's tasks.

The remarkable thing is that **this happens automatically**. Nobody tells the
model "make this head into a position-extracting head." It emerges from the
optimization process.

> **Metaphor.** Imagine you're trying to teach a child to sort items into
> "fruits" vs. "vegetables." You don't lecture them on plant biology. You
> just show them many examples and correct their mistakes. Over time, they
> figure out the categories on their own. Their brain has tuned itself to
> notice the right features.
>
> Gradient descent is the "correction" mechanism. The matrices `W_Q`, `W_K`,
> `W_V` are the child's brain — initially clueless, gradually refined until
> they extract exactly the right features. Nobody hand-codes the answer; it
> emerges.

---

## 17. A Worked Numerical Example You Can Verify by Hand

Time for concrete numbers. We'll use a tiny 4-dimensional space so everything
fits on the page.

### 17.1 The setup

Let's say:

- The token subspace is the first 2 dimensions.
- The positional subspace is the last 2 dimensions.
- They're perfectly orthogonal (each token vector has zero in the last 2
  components; each positional vector has zero in the first 2).

A specific example:

```
T (token embedding of "cat"):   [3, 4, 0, 0]
P (positional embedding of pos 1): [0, 0, 5, 6]
```

Are these orthogonal? `T · P = 3·0 + 4·0 + 0·5 + 0·6 = 0`. ✓ Yes.

Their sum (what the model actually sees):

```
C = T + P = [3, 4, 5, 6]
```

### 17.2 Verifying we can recover `T`

Build the "token filter" matrix `W_token` — a matrix that keeps the first
2 components and zeros out the last 2:

```
W_token = | 1 0 0 0 |
          | 0 1 0 0 |
          | 0 0 0 0 |
          | 0 0 0 0 |
```

Compute `W_token · C`:

- Component 1: `1·3 + 0·4 + 0·5 + 0·6 = 3`
- Component 2: `0·3 + 1·4 + 0·5 + 0·6 = 4`
- Component 3: `0·3 + 0·4 + 0·5 + 0·6 = 0`
- Component 4: `0·3 + 0·4 + 0·5 + 0·6 = 0`

Result: `[3, 4, 0, 0] = T`. ✓

We recovered the token embedding perfectly from the sum.

### 17.3 Verifying we can recover `P`

Build the "position filter" matrix `W_pos`:

```
W_pos = | 0 0 0 0 |
        | 0 0 0 0 |
        | 0 0 1 0 |
        | 0 0 0 1 |
```

Compute `W_pos · C`:

- Component 1: `0`
- Component 2: `0`
- Component 3: `0·3 + 0·4 + 1·5 + 0·6 = 5`
- Component 4: `0·3 + 0·4 + 0·5 + 1·6 = 6`

Result: `[0, 0, 5, 6] = P`. ✓

We recovered the positional embedding perfectly from the sum.

### 17.4 What just happened

Two simple matrices, each applied once to the combined vector `C`, recovered
the two original signals exactly. This is the mechanism. **The information
was never lost.** The sum `C` carried both signals, in orthogonal directions,
and the right matrix could pull each one back out.

### 17.5 What changes in a real Transformer

Three things change when we move from this toy example to a real Transformer:

1. **Higher dimension.** 512 instead of 4. But the math is identical — just
   bigger vectors and matrices.

2. **Approximately, not perfectly, orthogonal.** The token subspace and
   positional subspace overlap a little. Recovery is approximate rather than
   exact. But because of the redundancy of high dimensions, the
   approximation is excellent.

3. **The matrices are learned, not hand-coded.** Training discovers what
   the right "filter directions" are. Different attention heads learn
   different filters.

These differences add complexity but not fundamentally new ideas. The core
mechanism — "addition + linear projection = information-preserving routing"
— is exactly the same.

---

## 18. Approximate Orthogonality and Why "Close Enough" Is Good Enough

In practice, token and positional embeddings are *not* exactly orthogonal. So
recovery is *not* perfect. Does this matter?

### 18.1 The error from imperfect orthogonality

Suppose `T · P` isn't exactly zero, but instead some small number `ε` (say,
`ε = 0.02`). When we project `C = T + P` onto the token subspace, we get
`T` plus some "leakage" from `P`. The leakage is proportional to `ε`.

If `ε` is small, the leakage is small, and the recovered `T` is "almost
right" — within a small tolerance of the true value.

### 18.2 Why this is fine in practice

Three reasons the imperfect recovery is acceptable:

1. **Tolerance to small errors.** Neural networks are inherently noisy. They
   tolerate small perturbations to their internal vectors all the time
   (gradients, dropout, batch norm, etc.). A 2% error in the recovered
   token embedding is negligible compared to the noise the model already
   handles.

2. **Multiple chances.** Each layer of the Transformer can re-extract info.
   If one layer's extraction is slightly imprecise, the next layer can
   correct for it. There's significant redundancy through the depth of the
   network.

3. **Multiple heads.** Within a single attention layer, there are typically
   8 or 16 attention heads, each making its own extraction. If one head is
   slightly off, others can compensate. The redundancy across heads is
   another safety net.

### 18.3 The "good enough" principle in machine learning

In machine learning, the bar isn't "perfect math." It's "good enough to
learn well." High-dimensional approximate orthogonality is *far more than
good enough*. Empirically, Transformers reach state-of-the-art performance
on every language task, which would be impossible if the addition `T + P`
were destroying meaningful amounts of information.

The theory says approximate orthogonality is mathematically sufficient.
The practice confirms it. The architecture works.

### 18.4 Visual mental picture

> **Picture this.** Imagine pouring red dye and blue dye into a giant tank
> of water. If the dyes mix evenly, you get purple — irrecoverable. But
> suppose the dyes don't mix; instead, the red dye stays in the left half of
> the tank and the blue dye stays in the right half. Now even though they're
> "in the same tank" (added to the combined volume), you can still see which
> dye is which by looking at different parts of the tank.
>
> Token and positional embeddings are like the red and blue dyes that don't
> mix. They share the same vector (the same tank), but they occupy different
> subspaces (different halves). A projection (the equivalent of "look at the
> left half of the tank") recovers each one.

---
---

# Part VI — Sinusoidal Positional Encodings, Demystified

We now turn to one of the most beautiful pieces of engineering in the
original Transformer paper: the sinusoidal positional encoding. It's
designed with surprising care to satisfy several requirements at once. Let's
unpack each one.

---

## 19. The Design Goal: What Properties Did We Need?

When the authors of "Attention Is All You Need" designed positional encodings,
they wanted them to satisfy several properties:

### 19.1 Property 1: Each position should get a unique vector

If position 5 and position 7 had the same positional encoding, the model
couldn't distinguish between them. So each position must have its own,
unique vector.

### 19.2 Property 2: Nearby positions should get similar vectors

Position 5 and position 6 are nearby; they should have similar encodings.
Position 5 and position 100 are far; their encodings should be very
different. This way, the model can learn "what does it mean to be near
position X" and have it generalize.

### 19.3 Property 3: The encoding should generalize to longer sequences

If the model is trained on sequences of length 1000, ideally it should work
reasonably on sequences of length 5000 at inference time. So the
positional encoding shouldn't be tied to a specific max length — it should
extrapolate.

### 19.4 Property 4: Relative positions should be easy to compute

A lot of language patterns are about *relative* position: "the word two
positions before me," "the word right after me." The encoding should make
these relationships easy for the attention mechanism to capture.

### 19.5 Property 5: Bounded magnitude

The positional encoding shouldn't be much bigger than the token embedding,
or it would drown out the token info when added. So the values should be
bounded (in a known range).

The sinusoidal encoding satisfies *all five* of these properties
simultaneously. It's a delightful piece of design.

---

## 20. Why Sines and Cosines?

The sinusoidal encoding formula is:

```
PE(pos, 2i)   = sin(pos / 10000^(2i/d))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d))
```

Don't be intimidated. Let's break this down piece by piece.

### 20.1 Sines and cosines have the right shape

Sines and cosines:
- Are bounded between -1 and 1. ✓ (Property 5: bounded magnitude)
- Repeat in cycles, so they're naturally periodic. ✓ (Useful for the magic
  later.)
- Are smooth and continuous, so nearby inputs (positions) give nearby
  outputs (encodings). ✓ (Property 2: nearby positions are similar.)

So at the basic level, sines and cosines are well-shaped for the job.

### 20.2 Sines and cosines together encode angle

Here's a key property. Imagine a point moving around a unit circle. Its
position can be described by two numbers: its x-coordinate and its
y-coordinate. The x-coordinate is `cos(θ)`, the y-coordinate is `sin(θ)`,
where `θ` is the angle.

So `(sin(θ), cos(θ))` uniquely encodes the angle `θ` — for any value of `θ`
between 0 and 2π. The two values together carry more information than either
one alone (a single sine value is ambiguous: `sin(30°) = sin(150°)`).

This is why the formula uses *both* `sin` and `cos`, pairing them at
adjacent dimensions. Together, they uniquely encode a "phase" — and the
phase represents the position.

### 20.3 The point of dividing position by a large number

In the formula, we don't just use `sin(pos)` — we use `sin(pos / 10000^(2i/d))`.
The division by `10000^(2i/d)` adjusts the *frequency* of the sine wave.

- For small `i` (early dimensions), the divisor is close to 1, so we're
  computing `sin(pos)` — fast oscillation.
- For large `i` (late dimensions), the divisor is large (up to 10000), so
  we're computing `sin(pos / 10000)` — slow oscillation.

This gives us a *range of frequencies* — fast oscillations encode fine-grained
position, slow oscillations encode coarse-grained position. We'll spend
Section 21 on why this matters.

### 20.4 Why this satisfies the design goals

Let's check the properties:

- **Unique vectors per position?** ✓ With enough dimensions and enough
  frequencies, no two positions will have the same encoding. This is the
  same idea as how a clock with hour, minute, and second hands uniquely
  identifies any time.

- **Nearby positions are similar?** ✓ Sines and cosines are smooth, so
  `sin(pos)` and `sin(pos+1)` are close in value. The full encoding for
  position 5 is very close to the encoding for position 6.

- **Generalizes to longer sequences?** ✓ The formula is defined for any
  integer position — there's no maximum length built in. Plug in
  `pos = 10000` and you get a valid encoding.

- **Relative positions easy to compute?** ✓ This is the magical property
  we'll unpack in Section 22.

- **Bounded magnitude?** ✓ Every component is between -1 and 1.

---

## 21. Many Frequencies, Many Clocks

The use of multiple frequencies is one of the most elegant aspects of the
sinusoidal encoding. Let's understand it deeply.

### 21.1 A single frequency is ambiguous

Imagine you only had one sine wave to encode position: `sin(pos)`.

The problem: `sin(0) = 0`, `sin(π) = 0`, `sin(2π) = 0`, etc. Many different
positions give the same value. Position info is ambiguous.

If you used `sin(pos / 2)`, it would be less ambiguous in the short run but
still cycle eventually. Any single sine wave eventually repeats.

### 21.2 Multiple frequencies eliminate ambiguity

Now imagine you have *several* sine waves, at different frequencies, all
running in parallel. Position 5 produces a particular combination of values
across all of them; position 100 produces a *different* combination across
all of them.

Even if each individual sine wave repeats, the *combination of all of them*
doesn't repeat — at least not for an astronomically long time. This is
exactly how you can uniquely encode any position with bounded values.

> **Metaphor: a clock with many hands.** A regular analog clock has three
> hands — second, minute, and hour. The hour hand moves slowly, the minute
> hand moves medium-speed, the second hand moves fast.
>
> If I told you "the hour hand is pointing straight up," you wouldn't know
> the exact time — it could be 12:00, but also 11:55, or 12:05. The hour
> hand alone is ambiguous.
>
> But if I told you "the hour hand is straight up, the minute hand is at
> 12, and the second hand is at 12" — well, now I've uniquely identified
> 12:00:00. Different "speeds" of hand combine to give a unique time.
>
> Sinusoidal positional encoding is exactly this idea, but with hundreds of
> hands instead of three. Each dimension of the encoding is a different
> "hand" spinning at a different speed. Together, they uniquely identify
> any position.

### 21.3 The geometric range from 1 to 10000

The original paper uses frequencies that span from 1 to 1/10000 — a range of
4 orders of magnitude. Why this specific range?

- The fastest frequency (period ≈ 2π) gives fine-grained position info
  useful for nearby positions.
- The slowest frequency (period ≈ 2π · 10000 ≈ 62832) gives coarse-grained
  position info useful for distinguishing positions across a long document.
- Together, they cover everything from "next-token" precision to
  "document-level" precision.

10000 was an empirical choice, chosen because it gave good performance.
Other models use slightly different numbers (e.g., LLaMA uses 10000 too,
but with rotary embeddings instead).

### 21.4 The "Fourier basis" interpretation

If you've studied signal processing, sines and cosines at different
frequencies form a **Fourier basis**. Any reasonable signal can be
decomposed into a sum of sines and cosines at various frequencies. This
is the foundation of audio processing, image compression, and a lot more.

The sinusoidal positional encoding is essentially representing each
position as a Fourier basis vector. The model has access to all
frequencies simultaneously, and the attention mechanism can learn to
attend to position patterns by picking out the right frequencies.

This is a deep and beautiful connection. Position information ends up being
"like a sound waveform" — encoded in frequencies that the model can
selectively listen to.

---

## 22. The Magical Property: Relative Positions Are Linearly Recoverable

This is the property that really shows the genius of sinusoidal encoding.
It's the property that makes the encoding play nicely with the attention
mechanism.

### 22.1 The claim

For any fixed offset `k`, there exists a fixed matrix `M_k` such that:

```
M_k · PE(pos) = PE(pos + k)
```

In English: "I can compute the positional encoding `k` positions ahead by
applying a fixed matrix to the current positional encoding."

### 22.2 Why this is amazing

Think about what this means. The attention mechanism is built out of matrix
operations. If you want attention to "attend to the token 3 positions
before me," the matrix `M_(-3)` does exactly the right thing to the
positional encoding. The model can learn to use this matrix as part of its
queries/keys.

So the attention mechanism has a **natural way to express relative-position
patterns**. Things like "attend to the previous word" or "attend to the
word 5 positions ago" become simple linear operations on the positional
encoding.

### 22.3 Why this works mathematically

Recall that sines and cosines are connected by the angle-addition formulas:

```
sin(a + b) = sin(a)·cos(b) + cos(a)·sin(b)
cos(a + b) = cos(a)·cos(b) - sin(a)·sin(b)
```

Now, the positional encoding pairs adjacent dimensions as `(sin(pos·ω),
cos(pos·ω))` for various frequencies `ω`. Each pair is a 2D vector that
rotates around the origin as `pos` changes.

The angle-addition formula tells us: rotating by `b` (going from position
`pos` to position `pos+k` for some `k`) is just a rotation matrix applied
to the `(sin, cos)` pair. This is a *linear* operation. It can be expressed
as a matrix multiplication.

For each frequency, you get a 2×2 rotation matrix. Stacking all of them
together gives the full matrix `M_k` that takes you from position `pos` to
position `pos + k`.

### 22.4 The turntable metaphor

> **Turntable metaphor.** Imagine a record spinning on a turntable. The
> position of the needle encodes a moment in time. To find the position
> "5 seconds earlier," you don't need to know the whole record — you just
> rotate the turntable backward by some fixed amount. That fixed rotation
> works regardless of where you started.
>
> Sinusoidal encodings work the same way. To find "the position `k` steps
> later," you don't need to know what position you started at — you just
> apply a fixed rotation matrix `M_k`. The rotation is universal.
>
> This means the attention mechanism can learn *relative-position patterns*
> with simple matrix operations, instead of having to memorize how each
> position relates to each other position individually.

### 22.5 Why this matters for the Transformer

The Transformer's attention mechanism does dot products between queries and
keys. If the query is asking "where is the previous token?" and the keys
encode positional information, then the dot products should light up for
the previous-position key.

Because of the linear-recoverability property, the model can implement this
"asking" behavior with a learned matrix — without having to memorize a
separate rule for each (query position, key position) pair. The same matrix
works everywhere, because the relative-position structure is built into the
encoding.

This is why sinusoidal encodings work so well with attention. They were
designed to.

---
---

# Part VII — Attention: The Mechanism That Reads Both Signals

We've built up everything needed to understand the attention mechanism's
relationship to the sum `T + P`. Now we close the loop. This part shows
how attention extracts both signals simultaneously and uses them in
combination.

---

## 23. Quick Refresher on the Attention Mechanism

Before we dive into the four-term decomposition, let's quickly recap
attention itself, in case you want a self-contained reference.

### 23.1 The setup

The input to an attention layer is a sequence of vectors:

```
X = [X_0, X_1, X_2, ..., X_n]
```

where each `X_i = T_i + P_i` (token + position). We want each output vector
to be a context-aware version of its input — incorporating information from
the other positions in the sequence.

### 23.2 The query, key, value structure

For each input vector `X_i`, we compute three new vectors:

```
Q_i = X_i · W_Q     (query — "what am I looking for?")
K_i = X_i · W_K     (key   — "what do I offer?")
V_i = X_i · W_V     (value — "what info will I share?")
```

`W_Q`, `W_K`, `W_V` are learned matrices, shared across all positions
(the same matrices are applied to every input vector).

### 23.3 The attention score

For each pair `(i, j)`, we compute an attention score:

```
score(i, j) = Q_i · K_j     (dot product of the i-th query and j-th key)
```

This score measures how much position `i` should "pay attention to" position
`j`. High score = strong attention. Low score = weak attention.

### 23.4 Softmax and weighted sum

The scores are normalized via softmax (so they sum to 1) and used as weights
to combine the values:

```
output_i = Σ_j  softmax(score(i, j)) · V_j
```

Position `i`'s output is a weighted combination of all the values, weighted
by how much it attends to each position.

### 23.5 Why this matters for our story

The crucial step is the dot product `Q_i · K_j`. This is where both
token and positional info from `X_i` and `X_j` combine to produce a single
score. If we substitute `X = T + P` and expand, we get the four-term
decomposition that's the heart of the Transformer's information-preserving
magic. That's Section 24.

---

## 24. The Four Sub-Signals Hidden Inside `Q · Kᵀ`

This is the section that, if you understand nothing else, answers your
original question. The four-term decomposition shows that attention
**automatically extracts every kind of relationship** between positions,
from a single combined input.

### 24.1 Substituting `X = T + P`

Recall:

```
Q = X · W_Q = (T + P) · W_Q = T·W_Q + P·W_Q
K = X · W_K = (T + P) · W_K = T·W_K + P·W_K
```

We use the distributive property of matrix multiplication. The sum
`X = T + P` splits into two matrix products.

### 24.2 The product `Q · Kᵀ`

Now compute the attention score (for a single pair of positions, ignoring
position indices for clarity):

```
Q · Kᵀ = (T·W_Q + P·W_Q) · (T·W_K + P·W_K)ᵀ
```

When you expand this multiplication, you get four terms:

```
Q · Kᵀ = (T·W_Q)·(T·W_K)ᵀ      ← TERM 1: content × content
       + (T·W_Q)·(P·W_K)ᵀ      ← TERM 2: content × position
       + (P·W_Q)·(T·W_K)ᵀ      ← TERM 3: position × content
       + (P·W_Q)·(P·W_K)ᵀ      ← TERM 4: position × position
```

**This is the proof that no information was lost.** Each of these four terms
represents a different "kind of question" the model can ask about the
relationship between positions:

### 24.3 What each term means

**TERM 1: Content × Content** — "How semantically related are these two
tokens?"

This is pure semantic attention. The token info from one position is
compared to the token info from another, with no involvement of position.
This is the term that lights up when the model is checking if a noun
matches a verb, or if two words have similar meaning, regardless of
where they are in the sentence.

**TERM 2: Content × Position** — "What position tends to follow this kind
of content?"

This mixed term lets the model ask things like: "I'm a noun. What position
tends to come after nouns?" The query is built from the token
(it knows what kind of word it is); the key is built from position
(it knows where in the sentence the candidate is). The dot product asks
how compatible they are.

**TERM 3: Position × Content** — "What kind of content tends to be at this
position?"

The mirror image of Term 2. "I'm at position 5. What kind of word tends to
be 2 positions before me?" The query is built from position; the key is
built from token content.

**TERM 4: Position × Position** — "What's the relative distance between
these positions?"

This is pure positional attention. The query and key are both built only
from position info. This term lights up for patterns like "attend to the
token immediately before me" or "attend to the start of the sentence."
It's the term that lets the model learn relative-position rules
independently of content.

### 24.4 The model gets all four for free

Here's the crucial observation. The model didn't have to be designed to
extract these four terms. The math of `(T+P) · W_Q · (W_K)ᵀ · (T+P)ᵀ`
**automatically** produces all four. They emerge from the linearity of the
operations.

Different attention heads emphasize different terms by learning different
`W_Q` and `W_K` matrices:

- A head with `W_Q` and `W_K` that pass token info but block position info
  ends up emphasizing Term 1.
- A head with `W_Q` and `W_K` that do the opposite emphasizes Term 4.
- Most heads emphasize some combination of all four.

The key point: **the information for all four terms is present in the
combined input `X = T + P`**. The attention mechanism doesn't have to
"choose" between token info and positional info. It gets both, all the
time, in every head.

### 24.5 This is the actual answer to your question

> "If `A + B = C`, how does the model recover `A` and `B`?"

It doesn't have to recover them separately. The attention mechanism is
designed so that **it works directly on the combined sum**, automatically
splitting it into four kinds of useful signals. The information about `A`
and the information about `B` are both available, simultaneously, in
different sub-terms of the computation.

The model doesn't "extract `A`, then extract `B`, then combine them." It
just runs the attention computation, and the four terms fall out
naturally. Token info contributes through Terms 1, 2, and 3. Positional
info contributes through Terms 2, 3, and 4. The model uses whatever
combination is useful.

> **Final metaphor.** Imagine a chef tasting a finished soup. She doesn't
> have to separately taste each ingredient before assembling them — she
> tastes the whole soup at once, and her trained palate automatically
> identifies "I taste tomatoes, basil, garlic, onions" all in one
> simultaneous experience.
>
> The attention mechanism is the trained palate. The combined input
> `X = T + P` is the soup. The four terms of `Q · Kᵀ` are the four "tastes"
> the palate detects — content-content, content-position, position-content,
> position-position. They all come through, simultaneously, in one
> integrated computation.

---

## 25. How Different Heads Specialize in Different Sub-Signals

A Transformer layer typically has 8 or 16 attention heads, each with its
own `W_Q`, `W_K`, `W_V` matrices. They all see the same input but learn to
extract different patterns.

### 25.1 What the heads end up doing

Interpretability research has identified many specialized head types:

- **Previous-token heads.** These heads' `W_Q` and `W_K` are tuned so that
  Term 4 (position-position) dominates, and specifically picks out
  "1 position before me." Every output position attends primarily to the
  immediately preceding position.

- **Induction heads.** A famous discovery in Anthropic's research. These
  heads use a clever combination of Terms 1 and 4 to recognize
  repeated patterns. They power the model's ability to copy and complete
  patterns like `[A][B]...[A]→[B]`.

- **Subject-verb agreement heads.** These rely on Term 1 (content-content)
  to identify words with related grammatical structure regardless of
  position.

- **Syntactic role heads.** These use Term 2 or Term 3, mixing content
  and position to identify, e.g., "the noun phrase that this verb refers
  to."

### 25.2 How specialization emerges

Specialization isn't programmed. It emerges from training. Different
random initializations push different heads into different niches. As
training progresses, each head finds a "role" that lowers the loss most
efficiently. By the end, you have a diverse population of heads, each
with its specialty.

The mathematical decomposition into four terms creates the *possibility*
of specialization. Training fills in the *realization*. Together, they
give the Transformer enormous representational power.

### 25.3 Why this matters

The four-term decomposition is the proof that token + position info is
recoverable. The specialization of heads is the proof that the recovery
actually happens in practice and gets used productively.

If the addition `T + P` had destroyed information, we wouldn't see heads
specializing in content-only or position-only patterns. The fact that they
do, robustly, across all Transformer models that have been studied, is
empirical confirmation of the theory.

---
---

# Part VIII — Putting It All Together

We've covered all the pieces. Now we run through the full pipeline,
end-to-end, with a concrete example. And we discuss what training adds to
the whole story.

---

## 26. Full Walk-through With "The Cat Sat"

Let's trace what happens when the model processes the sentence "the cat sat,"
focusing on a single attention head and the position of "cat."

### 26.1 Step 1: Tokenize

The sentence becomes a sequence of three tokens:

```
Tokens: ["the", "cat", "sat"]
Positions: [0, 1, 2]
```

### 26.2 Step 2: Look up token embeddings

The model's embedding table gives:

```
T_the = [0.20, -0.10, 0.80, 0.05, ..., 0.13]    (512-dim)
T_cat = [-0.30, 0.50, 0.10, -0.20, ..., 0.42]
T_sat = [0.10, 0.40, -0.20, 0.30, ..., -0.05]
```

These vectors encode the meanings of the words. They live in the "token
subspace" of the 512D embedding space.

### 26.3 Step 3: Compute positional embeddings

Using the sinusoidal formula:

```
P_0 = [sin(0), cos(0), sin(0), cos(0), ..., sin(0), cos(0)]
    = [0, 1, 0, 1, ..., 0, 1]    (since sin(0)=0, cos(0)=1)

P_1 = [sin(1), cos(1), sin(1/100), cos(1/100), ..., sin(1/c), cos(1/c)]

P_2 = [sin(2), cos(2), sin(2/100), cos(2/100), ..., sin(2/c), cos(2/c)]
```

These vectors live in the "positional subspace" — a different, roughly
orthogonal region of the embedding space.

### 26.4 Step 4: Add to get the combined embeddings

```
X_0 = T_the + P_0    (token info "the" + position 0 info, bundled)
X_1 = T_cat + P_1    (token info "cat" + position 1 info, bundled)
X_2 = T_sat + P_2    (token info "sat" + position 2 info, bundled)
```

Each `X_i` is a single 512-dim vector with both signals layered in
orthogonal directions.

### 26.5 Step 5: Compute Q, K, V for each position

Each input vector gets multiplied by `W_Q`, `W_K`, `W_V`:

```
Q_0 = X_0 · W_Q,  K_0 = X_0 · W_K,  V_0 = X_0 · W_V
Q_1 = X_1 · W_Q,  K_1 = X_1 · W_K,  V_1 = X_1 · W_V
Q_2 = X_2 · W_Q,  K_2 = X_2 · W_K,  V_2 = X_2 · W_V
```

Suppose the head we're looking at has `W_Q` and `W_K` matrices that are
tuned to a particular pattern — say, "find the verb associated with the
current noun."

For position 1 ("cat"), the query `Q_1` is computed from `X_1 = T_cat + P_1`.
Because of linearity:

```
Q_1 = T_cat · W_Q + P_1 · W_Q
```

The first part encodes "I'm a noun looking for a verb." The second part
encodes "I'm at position 1, so I'm interested in nearby positions." Both
contribute to the final query.

### 26.6 Step 6: Compute attention scores

For position 1, we compute scores against every position:

```
score(1, 0) = Q_1 · K_0
score(1, 1) = Q_1 · K_1
score(1, 2) = Q_1 · K_2
```

Each of these expands into the four-term decomposition:

```
Q_1 · K_j  =  (T_cat·W_Q + P_1·W_Q) · (T_j·W_K + P_j·W_K)ᵀ

           = (T_cat·W_Q)·(T_j·W_K)ᵀ   ← content-content: does "cat" relate to T_j?
           + (T_cat·W_Q)·(P_j·W_K)ᵀ   ← content-position: do nouns relate to pos j?
           + (P_1·W_Q)·(T_j·W_K)ᵀ     ← position-content: does position 1 relate to T_j?
           + (P_1·W_Q)·(P_j·W_K)ᵀ     ← position-position: is j near 1?
```

For `j = 2` ("sat"):
- Term 1 lights up: "cat" and "sat" are semantically related (noun-verb).
- Term 4 lights up: position 2 is right next to position 1.

For `j = 0` ("the"):
- Term 1 is weaker: "cat" and "the" are less semantically related.
- Term 4 is moderate: positions 1 and 0 are adjacent, but in the wrong
  direction for the "find a verb after me" pattern.

So `score(1, 2)` ends up larger than `score(1, 0)`. After softmax, position
1 attends most strongly to position 2.

### 26.7 Step 7: Combine values

The output for position 1 is a weighted sum of the values:

```
output_1 = w_0 · V_0 + w_1 · V_1 + w_2 · V_2
```

where the weights come from softmax. Most of the weight is on `V_2`, so
the output is mostly the value from "sat" — meaning position 1's output
strongly incorporates information from position 2.

### 26.8 What happened with the information

Trace it through:

- `T_cat` and `P_1` were added at the start. Both signals were preserved
  in `X_1` (orthogonal directions).
- `W_Q` extracted both signals into `Q_1`, in the directions relevant for
  this head's task.
- The dot product `Q_1 · K_j` automatically combined both signals through
  the four-term decomposition.
- The attention scores reflected both content and position considerations.
- The output `output_1` is a function of all the original token and position
  info from the relevant positions.

**Information was never lost.** It was just bundled, projected, combined,
and recombined — all through linear operations that preserve and recombine
orthogonal components.

---

## 27. What Training Adds: Why It Works in Practice

The architecture has the *capacity* to preserve information. Training is what
makes it *actually do so*.

### 27.1 The role of gradient descent

When the model trains, it minimizes a loss function — usually, "predict the
next token correctly." Gradient descent figures out which way to nudge every
parameter (including all the embeddings and `W_Q`, `W_K`, `W_V` matrices) to
make the loss smaller.

If, at some point, the token and positional info are interfering badly,
gradient descent will discover this and adjust:

- Token embeddings get nudged away from positional encoding directions.
- The `W_Q`, `W_K`, `W_V` matrices get tuned to extract cleaner signals.
- Different heads get pushed toward different specializations, since
  redundancy is wasteful.

Over millions of training steps, the system organically arranges itself
into a state where:

- Token and positional subspaces are nicely separated.
- Each head extracts a useful, specific kind of pattern.
- The information from `T + P` is fully available throughout the network.

### 27.2 Why we should trust this

You might worry that all this is just theory and the model might not
actually achieve the clean separation we've been assuming. But:

- **Empirical measurements.** Researchers have measured the orthogonality
  between token and positional embeddings in trained models. It's high.
  Empirically high enough to support clean extraction.

- **Head specialization is observed.** Interpretability research has found
  the specialized heads we predicted — previous-token heads, induction
  heads, syntactic heads, etc. If the architecture couldn't preserve and
  extract this info, these specializations wouldn't be possible.

- **Performance is the ultimate test.** Transformers achieve
  state-of-the-art on basically every language task. If the addition
  `T + P` were destroying significant amounts of information, performance
  would suffer dramatically. It doesn't.

### 27.3 The "path of least resistance" argument

Here's a useful way to think about why training succeeds. Imagine
gradient descent as water flowing downhill. The "hills" are bad
configurations (high loss); the "valleys" are good ones (low loss).

The geometry of high-dimensional space makes "good orthogonal separation"
the natural valley. It's the easiest way to lower the loss. Once gradient
descent starts moving, it tends to flow into this valley by default,
because that's where the math is most favorable.

> **Metaphor.** Even though water molecules don't *understand* gravity,
> water always finds its way to the lowest point. Similarly, even though
> gradient descent doesn't *understand* orthogonality, it always finds its
> way to configurations where orthogonality holds — because those are the
> configurations that minimize the loss.

### 27.4 The complete picture

So here's the full story of how it all works:

1. **Architecture provides capacity.** The high-dimensional embedding
   space, the linear projections, and the four-term decomposition give
   the architecture the *capacity* to encode and extract both signals.

2. **Training delivers on the capacity.** Gradient descent discovers
   configurations of embeddings and matrices that actually achieve the
   clean separation. Heads specialize into useful roles.

3. **The system runs.** Inference applies the trained parameters to new
   inputs, and the four-term decomposition automatically routes token
   and positional info to where it needs to go.

The architecture and the training meet in the middle. Neither alone is
sufficient. Together, they make Transformers work.


---
---

# Part IX — Modern Variants and Extensions

The original Transformer used sinusoidal positional encodings, but the field
has explored many alternatives since. Each variant offers different
tradeoffs, but they all face the same fundamental challenge: how to combine
positional info with token info without destroying either. Let's tour the
main alternatives so you have the full picture.

---

## 28. Learned Positional Encodings

### 28.1 The idea

Instead of using a fixed mathematical formula (sines and cosines), just
have a learnable lookup table for positions. Position 0 gets a 512-dim
vector that's learned; position 1 gets another; and so on.

This is what BERT and GPT-2 do (with slight variations). It's the simplest
approach: treat positions like another vocabulary, and let the model figure
out what vectors work best.

### 28.2 Advantages

- **Flexibility.** The model can choose whatever positional encoding works
  best for the data, instead of being constrained to sinusoids.
- **Simplicity.** No formula. Just another embedding table.
- **Sometimes better performance.** On many tasks, learned positional
  embeddings outperform sinusoidal ones.

### 28.3 Disadvantages

- **Can't extrapolate to longer sequences.** If the model was trained on
  sequences up to length 1000, it has no positional embedding for position
  1001. It hasn't seen that position before. The model just doesn't work
  beyond its trained length.
- **Less interpretable.** You don't get the nice "frequencies" structure
  for free — the model has to learn whatever structure it ends up with.

### 28.4 How they relate to our story

The same `T + P` addition happens, and the same four-term decomposition of
`Q · Kᵀ` follows. The only difference is that `P` comes from a learned table
instead of a formula. Everything else — including the high-dimensional
orthogonality argument — still applies.

In fact, when you train a model with learned positional embeddings and look
at what it ends up with, the embeddings often *look like* sinusoidal
patterns. The structure that the math says is useful for positional encoding
ends up emerging from training, even when you don't impose it.

---

## 29. Rotary Position Embedding (RoPE)

### 29.1 The idea

RoPE (Rotary Position Embedding), introduced in the RoFormer paper and now
used in LLaMA, GPT-NeoX, and many other modern models, takes a different
approach. Instead of *adding* positional info to the token embedding, it
*rotates* the query and key vectors based on position.

### 29.2 The mechanism (high level)

Each pair of adjacent dimensions in the query and key vectors is treated as
a 2D vector. RoPE rotates each pair by an angle that depends on the position
— different positions get different rotations.

So instead of `X = T + P`, the modification happens inside the attention
mechanism:

```
Q_modified = rotate(Q, position)
K_modified = rotate(K, position)
score = Q_modified · K_modified
```

When you compute the dot product of two rotated vectors, the result depends
on the *difference* of their rotation angles — i.e., the *relative* position.
So RoPE gives you native relative-position information, with no extra
bookkeeping.

### 29.3 Why this is elegant

- **Direct relative position.** The score between positions `i` and `j`
  naturally depends only on `i - j`, not on the absolute positions. This
  is exactly what most attention patterns care about.
- **No information loss.** Rotation is a *bijection* — it doesn't destroy
  any information. You can always invert a rotation.
- **Works with extrapolation.** Since rotation is parameterized by position,
  you can extend to longer sequences (with some caveats about
  generalization).

### 29.4 How it relates to our story

RoPE sidesteps the puzzle of "how is `T + P` recoverable?" by simply not
doing the addition. Instead, it incorporates position via rotation inside
attention. But the underlying principle is the same: **positional and
token information live in different geometric structures, and the linear
operations of attention can disentangle them.**

For RoPE, the "different geometric structure" is rotation in 2D subspaces
rather than addition in orthogonal subspaces. Different mathematical
structure, same conceptual point: information isn't lost because the two
signals are encoded in non-interfering ways.

### 29.5 Pros and cons of RoPE vs. sinusoidal

Pros of RoPE:
- Better extrapolation in many settings.
- Naturally encodes relative position.
- Empirically strong performance.

Cons of RoPE:
- More complex to implement.
- The structure is built into attention specifically; it doesn't generalize
  to other architectures as cleanly.

RoPE has become the dominant choice for large language models in recent
years. It's a beautiful example of how the field is still exploring how to
encode position cleanly.

---

## 30. ALiBi and Other Relative-Position Approaches

### 30.1 ALiBi (Attention with Linear Biases)

ALiBi takes yet another approach: don't add positional embeddings to the
input at all. Instead, **bias the attention scores directly** based on the
distance between positions.

```
score(i, j) = Q_i · K_j  -  m · |i - j|
```

The model just subtracts a penalty proportional to the distance between
positions. Tokens that are far away get penalized; nearby tokens don't.
The slope `m` is a fixed hyperparameter per head.

### 30.2 Why this works

ALiBi essentially says: "we don't need to encode position info in the
embeddings at all. We just need the attention mechanism to know about
relative distances. We can hardcode that." And surprisingly, it works
quite well.

The key insight: a lot of what positional encoding accomplishes is just
"attend more to nearby tokens." If you build that into attention directly,
you don't need positional embeddings in the embedding sum.

### 30.3 Other variants

There are many more positional encoding schemes:

- **T5's relative position encoding.** Adds learned bias terms based on
  bucketized relative distance.
- **Transformer-XL's relative position encoding.** Modifies attention to
  use relative distances directly.
- **xPos.** A more flexible version of RoPE.

Each scheme is trying to solve the same problem — how to combine positional
info with token info — with slightly different tradeoffs.

### 30.4 The big picture

The fact that there are *so many* successful positional encoding schemes
tells us something important: **the architectural details aren't the
crucial thing**. What's crucial is the high-level principle:

> Positional information needs to be encoded in a way that doesn't
> interfere with token information, and that allows attention to extract
> the right relative-position patterns. There are many specific ways to
> achieve this.

Sinusoidal encodings, learned encodings, RoPE, ALiBi — they all satisfy this
principle in different ways. They all work. The "right" choice depends on
the task and the model.

The deep answer to your original question — "how does `T + P` not lose
information?" — applies to the sinusoidal case. For RoPE and ALiBi, the
question is slightly different because they don't do the addition. But the
underlying principle is the same: linear operations on (sufficiently
high-dimensional, structured) vectors can preserve and disentangle
multiple signals.

---
---

# Part X — Pedagogy and Wrap-up

We've reached the end of the conceptual content. The remaining sections are
for *teaching* this material to others — collecting metaphors, summarizing,
suggesting visualizations.

---

## 31. Twelve Metaphors to Make This Stick

If you're going to explain this to someone else, you'll need a toolkit of
metaphors. Pick whichever ones work for your audience.

### 31.1 Shopping cart vs. blender

Dumping apples and bananas into a shopping cart: you can separate them
back out later, because they're distinct objects. Dumping applesauce and
banana puree into a blender: they merge and you can't recover them.
Token + positional info is the shopping cart, not the blender.

### 31.2 North and East

Walking 3 miles north and 5 miles east lands you at a specific point. Even
though you "added" two journeys, you can perfectly recover each one because
north and east are perpendicular directions.

### 31.3 Stereo audio

A stereo signal contains multiple instruments mixed together, but they
occupy different frequency bands. Your ear and brain separate them. Token
and positional info are like different instruments in the same audio
stream, separated by their "frequency" in 512D space.

### 31.4 RGB pixels

A pixel color is encoded as three numbers (red, green, blue). They share
one pixel, but each color is independently readable. Token and positional
info are like the R, G, B channels of a 512-dimensional pixel.

### 31.5 Radio stations

Hundreds of radio broadcasts share the same air, but they're on different
frequencies. Your radio tunes to one. Token and positional info broadcast
on different "frequencies" of the embedding space.

### 31.6 Colored ink

If you write content in red ink and line numbers in blue ink on the same
paper, both messages coexist but are independently readable. Filter for
color, and you see only one. Same idea for token vs. positional info.

### 31.7 An orchestra

Multiple instruments produce sound simultaneously, but a trained listener
can pick out the violin from the cello. Attention is the trained listener;
the input vector is the combined sound.

### 31.8 A clock with many hands

Sinusoidal positional encoding is like a clock with hundreds of hands,
spinning at different speeds. Together, all hand positions uniquely
identify a position. Fast hands = fine-grained position; slow hands =
coarse-grained position.

### 31.9 A turntable

The relative-position property of sinusoidal encoding is like rotating a
record: to find "5 seconds earlier," you don't need to know the absolute
time, you just rotate by a fixed amount. Linear operation, universal across
all starting points.

### 31.10 A warehouse with sections

The 512D embedding space has different "sections" for different kinds of
information. Items in different sections coexist in the warehouse without
interfering. Token info lives in one section; positional info in another.

### 31.11 Random darts on a globe

Throw two random darts at a globe — they probably land in nearby spots in
2D. Now throw them on a 512-dimensional sphere — they almost certainly
land far apart, in perpendicular directions. High dimensions naturally
separate things.

### 31.12 Water finding its level

Even though gradient descent doesn't *understand* orthogonal subspaces, it
always converges toward configurations that maintain them, because those
configurations minimize the loss. Like water flowing downhill, the system
finds its natural resting place.

---

## 32. The One-Page Summary

If you had to fit the answer to "how does T + P not lose information?" on
a single page:

> **The puzzle.** When a Transformer adds a token embedding (T) and a
> positional embedding (P) into a single combined vector (C = T + P), it
> seems like information should be lost. After all, if A + B = 7, you can't
> recover A and B from 7 alone.
>
> **The resolution: high-dimensional geometry.** The embedding space has
> hundreds of dimensions (typically 512 or more). In such high-dimensional
> spaces, you can pack vectors into nearly-orthogonal directions in a way
> that's impossible in 2D or 3D. Token embeddings end up living in one
> "subspace" of the 512D embedding space; positional embeddings live in a
> different, approximately orthogonal subspace.
>
> **What "orthogonal" means.** Two vectors are orthogonal when their dot
> product is zero — they point in perpendicular directions and carry no
> overlapping information. When two vectors are orthogonal, adding them
> doesn't blend their information; each one occupies its own "direction"
> in space.
>
> **Recovery via projection.** A matrix multiplication can act as a "filter"
> that extracts the component of a vector along a specific set of directions.
> The Transformer's attention mechanism uses three learned matrices —
> `W_Q`, `W_K`, `W_V` — that act as filters. They can be tuned (during
> training) to extract token info, positional info, or any useful
> combination, from the combined input vector.
>
> **The four-term decomposition.** When the attention mechanism computes
> the score `Q · Kᵀ` from inputs `Q = (T+P)·W_Q` and `K = (T+P)·W_K`,
> linearity means the score automatically decomposes into four terms:
> content-content, content-position, position-content, and position-position.
> The model gets all four kinds of relationships simultaneously, for free.
> Different attention heads emphasize different terms based on what they've
> learned during training.
>
> **Why training makes it work.** Gradient descent automatically discovers
> configurations where token and positional subspaces are cleanly separated.
> This isn't enforced by the architecture — it emerges from the optimization
> process, because clean separation minimizes the loss. Empirically, this
> works extraordinarily well: trained Transformers exhibit specialized heads
> for token info, position info, and various combinations.
>
> **The deep answer.** Information isn't lost in C = T + P because:
> (1) High dimensions allow non-interfering bundling of multiple signals.
> (2) Linear projections (matrix multiplications) can extract each signal.
> (3) The attention mechanism, through the four-term decomposition,
> automatically uses all available signals simultaneously.
> (4) Training delivers configurations where these mechanisms work
> reliably in practice.

---

## 33. Visualizations to Build for Your Site

Ideas for interactive visualizations that would help readers grasp this
material:

### 33.1 The "shopping cart vs. blender" knob

Two side-by-side simulations:
- On the left: token and positional embeddings in perfectly orthogonal
  subspaces. User can see how the sum cleanly decomposes back to its
  parts.
- On the right: same vectors, but the user can drag a slider that
  controls how much they overlap. As the overlap increases, watch the
  reconstruction degrade.

This makes the abstract idea of "orthogonality" viscerally tangible.

### 33.2 The orthogonality heatmap

For a real trained model, compute and display a heatmap of dot products
between all token embeddings and all positional embeddings. Most cells
should be near-zero (cool colors), demonstrating approximate orthogonality.
Color-code by magnitude.

### 33.3 The four-term breakdown

For a specific input sentence, visualize the attention scores broken into
the four terms (content-content, content-position, position-content,
position-position). Let the user select different attention heads and see
how different heads emphasize different terms.

### 33.4 Sinusoidal "frequency view"

A panel showing each dimension of the positional encoding as a separate
sine/cosine wave plotted against position. The user can scroll through
positions and see which "hands of the clock" are pointing where.

### 33.5 Filter demo

Let the user define a token vector A and a positional vector B in a low
dimension (say, 4D). Show C = A + B. Show a "filter matrix" W that, when
applied to C, recovers A approximately. Let the user adjust W and watch
the recovery quality change. Show the "ideal" W for full recovery.

### 33.6 Head zoo

A gallery of attention head patterns from a real model. Click each one to
see which of the four terms dominates and what kind of pattern it
specializes in (previous-token, induction, syntactic, semantic, etc.).

### 33.7 The "warehouse" visualization

A stylized 3D-projected view of the embedding space, with token vectors
clustered in one region and positional vectors in another. Show how the
sum lives in the "union" but each can be projected back.

### 33.8 The training animation

Animate what happens as the model trains: random initial embeddings
gradually find their orthogonal subspaces; attention heads gradually
specialize. Show this as a slow animation over training steps.

### 33.9 The clock-with-many-hands demo

Show a literal clock face with many hands, each spinning at a different
sinusoidal frequency. Drag the "position" slider and watch all hands
rotate at their respective speeds. Click "freeze" at various positions
to see how each position produces a unique combination of hand angles.

### 33.10 The "turntable" demo

Demonstrate the linear recoverability of relative position. Show a
positional encoding as a set of rotating arrows. Then apply a "shift by
k" rotation matrix and watch all arrows rotate together to a new position.
The same rotation works for any starting position.

---

## 34. Further Reading and Where to Go Next

If you want to go deeper, here's a curated reading list, roughly in order
of accessibility:

### 34.1 For intuition

- **Jay Alammar, "The Illustrated Transformer."** The visual introduction
  most people start with. Excellent diagrams.
- **Chris Olah, "Neural Networks, Manifolds, and Topology."** Beautiful
  intuition about high-dimensional geometry in neural networks.
- **3Blue1Brown's "But what is a neural network?" series on YouTube.**
  Visual explanations of the underlying math.

### 34.2 For technical depth

- **Vaswani et al., "Attention Is All You Need" (2017).** The original
  Transformer paper. Concise and dense, but worth reading carefully.
- **"The Annotated Transformer" (Harvard NLP).** A code walk-through of
  the entire architecture, line by line. Excellent for solidifying
  understanding.
- **Su et al., "RoFormer: Enhanced Transformer with Rotary Position
  Embedding" (2021).** The RoPE paper.

### 34.3 For interpretability

- **Anthropic's "A Mathematical Framework for Transformer Circuits"
  (2021).** The clearest exposition of attention as a sum of
  independently-interpretable terms. Directly motivates the
  "linear projection extracts information" framing used in this document.
- **Olsson et al., "In-context Learning and Induction Heads" (2022).** The
  paper that identified induction heads. Beautiful example of head
  specialization.
- **Elhage et al., "Toy Models of Superposition" (2022).** Formal study
  of how networks pack many features into limited dimensions using
  approximate orthogonality. Most directly relevant to your puzzle.

### 34.4 For positional encoding specifically

- **The "RoPE Embedding Explained" blog posts** floating around — there
  are several good ones that build intuition for the rotation idea.
- **Press et al., "Train Short, Test Long: Attention with Linear Biases
  Enables Input Length Extrapolation" (2021).** The ALiBi paper.

### 34.5 The big synthesis

After you've gone through several of the above, try to write your own
version of this document. Forcing yourself to explain it in your own
words is the best test of understanding. You'll quickly notice the gaps
in your intuition, and patching them is how you go from "kind of get it"
to "deeply get it."

---

## Final Thoughts

The puzzle of "how does T + P not lose information?" is one of those
questions that, once you understand the answer, you realize it was sitting
in plain sight all along. The mechanism — high-dimensional orthogonality,
linear projections, the four-term decomposition — is not hidden anywhere.
It's just that until you're shown it explicitly, the elegance is invisible.

If there's one thing to take away, it's this:

> **In high dimensions, addition does not have to destroy information.**
> When two signals live in nearly-orthogonal subspaces of a
> high-dimensional space, their sum carries both signals intact — and the
> linear operations of a neural network are exactly the right tools to
> pull each one back out. The Transformer is a particularly beautiful
> example of this principle, but the principle itself goes far beyond
> Transformers. It's a fact about the geometry of high-dimensional space
> itself.

Once you internalize this, a lot of neural network mysteries become less
mysterious. Why can a single hidden vector represent so much? Why does
gradient descent find sensible representations? Why does superposition
work? The same underlying geometric fact is at work everywhere.

The Transformer's design is, ultimately, an exploitation of the
high-dimensional geometry that makes this all possible. The addition
`T + P` looks like a paradox at first; in fact, it's the elegant heart of
the architecture.

You now have the tools to see this clearly. Go and build a website that
shows it to others.