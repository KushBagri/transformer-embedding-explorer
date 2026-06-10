import { useState } from "react";
import VectorPlot from "./components/VectorPlot";

function addVectors(a: number[], b: number[]) {
  return a.map((value, index) => value + b[index]);
}

export default function App() {
  const [tokenEmbedding, setTokenEmbedding] = useState([1, 2, 3]);

  const [positionEmbedding, setPositionEmbedding] = useState([
    0.5,
    0.2,
    0.1,
  ]);

  const combinedEmbedding = addVectors(
    tokenEmbedding,
    positionEmbedding
  );

  const updateToken = (index: number, value: number) => {
    const updated = [...tokenEmbedding];
    updated[index] = value;
    setTokenEmbedding(updated);
  };

  const updatePosition = (
    index: number,
    value: number
  ) => {
    const updated = [...positionEmbedding];
    updated[index] = value;
    setPositionEmbedding(updated);
  };

  return (
  <div
    style={{
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "2rem",
      fontFamily: "Arial",
    }}
  >
    <h1>Transformer Embedding Explorer</h1>

    <p>
      Transformers receive the sum of token embeddings and
      positional embeddings. This tool helps visualize that
      process.
    </p>

    <hr />

    <h2>Embeddings</h2>

    <h3>Token Embedding</h3>
    <pre>
      {JSON.stringify(tokenEmbedding, null, 2)}
    </pre>

    <h3>Positional Embedding</h3>
    <pre>
      {JSON.stringify(positionEmbedding, null, 2)}
    </pre>

    <h3>Combined Embedding</h3>
    <pre>
      {JSON.stringify(combinedEmbedding, null, 2)}
    </pre>

    <hr />

    <VectorPlot
      token={tokenEmbedding}
      position={positionEmbedding}
      combined={combinedEmbedding}
    />

    <hr />

    <h2>Token Controls</h2>

    {tokenEmbedding.map((value, index) => (
      <div key={index}>
        <label>
          Dimension {index + 1}:{" "}
          {value.toFixed(1)}
        </label>

        <input
          type="range"
          min={-5}
          max={5}
          step={0.1}
          value={value}
          onChange={(e) =>
            updateToken(
              index,
              Number(e.target.value)
            )
          }
          style={{ width: "100%" }}
        />
      </div>
    ))}

    <h2>Position Controls</h2>

    {positionEmbedding.map((value, index) => (
      <div key={index}>
        <label>
          Dimension {index + 1}:{" "}
          {value.toFixed(1)}
        </label>

        <input
          type="range"
          min={-5}
          max={5}
          step={0.1}
          value={value}
          onChange={(e) =>
            updatePosition(
              index,
              Number(e.target.value)
            )
          }
          style={{ width: "100%" }}
        />
      </div>
    ))}
  </div>
);
}