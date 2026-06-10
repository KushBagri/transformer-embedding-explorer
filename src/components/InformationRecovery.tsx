interface Props {
  token: number[];
  position: number[];
  combined: number[];
}

export default function InformationRecovery({
  token,
  position,
  combined,
}: Props) {
  const recoveredToken = combined.map(
    (value, i) => value - position[i]
  );

  const recoveredPosition = combined.map(
    (value, i) => value - token[i]
  );

  const format = (vector: number[]) =>
    `[${vector.map((v) => v.toFixed(1)).join(", ")}]`;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Information Recovery</h2>

      <p>
        A common misconception is that adding two
        vectors destroys information.
      </p>

      <h3>Recover Token Embedding</h3>

      <pre>
{format(combined)}
-
{format(position)}
=
{format(recoveredToken)}
      </pre>

      <h3>Recover Positional Embedding</h3>

      <pre>
{format(combined)}
-
{format(token)}
=
{format(recoveredPosition)}
      </pre>

      <p>
        Since vector addition is reversible, the
        information is not necessarily lost.
      </p>
    </div>
  );
}