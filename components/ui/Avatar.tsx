import { avatarColor, cn, initials } from "@/lib/cn";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  title?: string;
}

export function Avatar({ name, size = "md", className, title }: AvatarProps) {
  const sizeClass = size === "sm" ? "avatar-sm" : size === "lg" ? "avatar-lg" : "avatar-md";
  return (
    <span
      className={cn("avatar", sizeClass, className)}
      style={{ background: avatarColor(name) }}
      title={title ?? name}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({
  names,
  max = 4,
  size = "sm",
}: {
  names: string[];
  max?: number;
  size?: "sm" | "md" | "lg";
}) {
  const shown = names.slice(0, max);
  const overflow = names.length - shown.length;
  return (
    <div className="avatar-stack">
      {shown.map((n) => (
        <Avatar key={n} name={n} size={size} />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            "avatar",
            size === "sm" ? "avatar-sm" : size === "lg" ? "avatar-lg" : "avatar-md",
          )}
          style={{ background: "#374151" }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
