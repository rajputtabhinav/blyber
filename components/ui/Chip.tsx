import { cn } from "@/lib/cn";

type Tone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "teal"
  | "accent"
  | "outline";

interface ChipProps {
  tone?: Tone;
  mono?: boolean;
  dot?: boolean;
  dotColor?: string;
  className?: string;
  children: React.ReactNode;
}

export function Chip({
  tone = "neutral",
  mono,
  dot,
  dotColor,
  className,
  children,
}: ChipProps) {
  return (
    <span className={cn("chip", `chip-${tone}`, mono && "chip-mono", className)}>
      {dot && (
        <span
          className="chip-dot"
          style={{ background: dotColor ?? "currentColor" }}
        />
      )}
      {children}
    </span>
  );
}

interface SevDotProps {
  severity: "critical" | "high" | "medium" | "low";
  className?: string;
}
export function SevDot({ severity, className }: SevDotProps) {
  return <span className={cn("sev-dot", `sev-${severity}`, className)} />;
}
