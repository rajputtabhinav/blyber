import { cn } from "@/lib/cn";

interface KPIProps {
  label: string;
  value: React.ReactNode;
  foot?: React.ReactNode;
  delta?: { dir: "up" | "down" | "flat"; value: string; sub?: string };
  className?: string;
}

export function KPI({ label, value, foot, delta, className }: KPIProps) {
  return (
    <div className={cn("kpi", className)}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">
        {delta && (
          <span className={cn("kpi-delta", delta.dir === "up" ? "up" : delta.dir === "down" ? "down" : "")}>
            {delta.dir === "up" ? "↑" : delta.dir === "down" ? "↓" : "→"} {delta.value}
          </span>
        )}
        {foot && <span>{foot}</span>}
      </div>
    </div>
  );
}
