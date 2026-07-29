interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
}

export function Sparkline({
  values,
  width = 80,
  height = 22,
  stroke = "var(--accent-2)",
  fill = "transparent",
}: SparklineProps) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  let d = "";
  values.forEach((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    d += (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2);
  });

  let area = "";
  if (fill !== "transparent") {
    area = d + ` L${width},${height} L0,${height} Z`;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block" }}
      aria-hidden
    >
      {area && <path d={area} fill={fill} opacity={0.18} />}
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.25} />
    </svg>
  );
}
