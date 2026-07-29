interface BlyberWordmarkProps {
  height?: number;
  /** Background color used to "carve" the B stripes. Defaults to the sidebar bg. */
  bg?: string;
  className?: string;
}

/**
 * Blyber wordmark: navy → teal gradient, with three horizontal stripes
 * carved into the top-left of the B. Drawn as text + cut rects so the
 * shape stays crisp at any size and inherits font-rendering hints from
 * the OS / IBM Plex Sans.
 */
export function BlyberWordmark({
  height = 22,
  bg = "#0B0E14",
  className,
}: BlyberWordmarkProps) {
  // Source viewBox is 220x44 (≈ 5:1). Scale width to match height.
  const VB_W = 220;
  const VB_H = 44;
  const width = (height * VB_W) / VB_H;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      fill="none"
      role="img"
      aria-label="Blyber"
      className={className}
    >
      <defs>
        <linearGradient id="blyberGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#14314A" />
          <stop offset="55%" stopColor="#2E6678" />
          <stop offset="100%" stopColor="#4FA1AD" />
        </linearGradient>
      </defs>

      <text
        x="-1"
        y="36"
        fontFamily="var(--font-sans), 'IBM Plex Sans', system-ui, sans-serif"
        fontWeight={700}
        fontSize={42}
        letterSpacing="-0.025em"
        fill="url(#blyberGrad)"
      >
        Blyber
      </text>

      {/* Carve three stripes into the top-left of the B */}
      <rect x="4.5" y="11.5" width="16.5" height="2.4" fill={bg} />
      <rect x="4.5" y="16.6" width="16.5" height="2.4" fill={bg} />
      <rect x="4.5" y="21.7" width="16.5" height="2.4" fill={bg} />
    </svg>
  );
}
