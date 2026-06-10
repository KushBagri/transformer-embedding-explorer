interface Props {
  token: number[];
  position: number[];
  combined: number[];
}

export default function VectorPlot({
  token,
  position,
  combined,
}: Props) {
  const scale = 40;
  const width = 700;
  const height = 700;

  const centerX = width / 2;
  const centerY = height / 2;

  const toSvgCoords = (vector: number[]) => ({
    x: centerX + vector[0] * scale,
    y: centerY - vector[1] * scale,
  });

  const tokenPoint = toSvgCoords(token);
  const positionPoint = toSvgCoords(position);
  const combinedPoint = toSvgCoords(combined);

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Vector Space Visualization</h2>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <span>🔵 Token Embedding</span>
        <span>🟢 Positional Embedding</span>
        <span>🔴 Combined Embedding</span>
      </div>

      <svg
        width={width}
        height={height}
        style={{
          border: "1px solid #ddd",
          backgroundColor: "#fafafa",
        }}
      >
        {/* Grid */}

        {Array.from({ length: 15 }).map((_, i) => {
          const pos = i * 50;

          return (
            <g key={i}>
              <line
                x1={pos}
                y1={0}
                x2={pos}
                y2={height}
                stroke="#eee"
              />

              <line
                x1={0}
                y1={pos}
                x2={width}
                y2={pos}
                stroke="#eee"
              />
            </g>
          );
        })}

        {/* Axes */}

        <line
          x1={0}
          y1={centerY}
          x2={width}
          y2={centerY}
          stroke="gray"
          strokeWidth="2"
        />

        <line
          x1={centerX}
          y1={0}
          x2={centerX}
          y2={height}
          stroke="gray"
          strokeWidth="2"
        />

        {/* Axis Labels */}

        <text x={width - 120} y={centerY - 10}>
          Dimension 1
        </text>

        <text x={centerX + 10} y={20}>
          Dimension 2
        </text>

        {/* Parallelogram */}

        <line
          x1={tokenPoint.x}
          y1={tokenPoint.y}
          x2={combinedPoint.x}
          y2={combinedPoint.y}
          stroke="#888"
          strokeDasharray="5,5"
        />

        <line
          x1={positionPoint.x}
          y1={positionPoint.y}
          x2={combinedPoint.x}
          y2={combinedPoint.y}
          stroke="#888"
          strokeDasharray="5,5"
        />

        {/* Token Vector */}

        <line
          x1={centerX}
          y1={centerY}
          x2={tokenPoint.x}
          y2={tokenPoint.y}
          stroke="blue"
          strokeWidth="4"
        />

        <circle
          cx={tokenPoint.x}
          cy={tokenPoint.y}
          r="6"
          fill="blue"
        />

        {/* Position Vector */}

        <line
          x1={centerX}
          y1={centerY}
          x2={positionPoint.x}
          y2={positionPoint.y}
          stroke="green"
          strokeWidth="4"
        />

        <circle
          cx={positionPoint.x}
          cy={positionPoint.y}
          r="6"
          fill="green"
        />

        {/* Combined Vector */}

        <line
          x1={centerX}
          y1={centerY}
          x2={combinedPoint.x}
          y2={combinedPoint.y}
          stroke="red"
          strokeWidth="5"
        />

        <circle
          cx={combinedPoint.x}
          cy={combinedPoint.y}
          r="7"
          fill="red"
        />

        {/* Labels */}

        <text
          x={tokenPoint.x + 10}
          y={tokenPoint.y}
        >
          Token
        </text>

        <text
          x={positionPoint.x + 10}
          y={positionPoint.y}
        >
          Position
        </text>

        <text
          x={combinedPoint.x + 10}
          y={combinedPoint.y}
        >
          Combined
        </text>
      </svg>

      <p
        style={{
          marginTop: "1rem",
          maxWidth: "700px",
          lineHeight: "1.5",
        }}
      >
        The red vector is created by adding the blue
        (token) vector and the green (positional)
        vector. The dashed lines form a parallelogram,
        illustrating geometric vector addition.
      </p>
    </div>
  );
}