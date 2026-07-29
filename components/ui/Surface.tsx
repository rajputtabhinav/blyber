import { cn } from "@/lib/cn";

interface SurfaceProps {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  flush?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

export function Surface({
  title,
  actions,
  flush,
  className,
  bodyClassName,
  children,
}: SurfaceProps) {
  return (
    <div className={cn("surface", className)}>
      {(title || actions) && (
        <div className="surface-head">
          {title}
          {actions && <div className="surface-actions">{actions}</div>}
        </div>
      )}
      <div className={cn("surface-body", flush && "flush", bodyClassName)}>
        {children}
      </div>
    </div>
  );
}
