import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
  color?: "cyan" | "yellow" | "magenta";
}

const sizeMap = {
  sm: { outer: 32, border: "border-2", text: "text-xs" },
  md: { outer: 56, border: "border-2", text: "text-sm" },
  lg: { outer: 80, border: "border-4", text: "text-base" },
};

const colorMap = {
  cyan: {
    ring: "border-primary/20 border-t-primary",
    inner: "border-primary/10 border-t-primary/50",
    glow: "shadow-glow-cyan",
    text: "text-primary",
  },
  yellow: {
    ring: "border-secondary/20 border-t-secondary",
    inner: "border-secondary/10 border-t-secondary/50",
    glow: "shadow-glow-yellow",
    text: "text-secondary",
  },
  magenta: {
    ring: "border-accent/20 border-t-accent",
    inner: "border-accent/10 border-t-accent/50",
    glow: "shadow-glow-accent",
    text: "text-accent",
  },
};

export function LoadingSpinner({
  size = "md",
  label,
  className,
  color = "cyan",
}: LoadingSpinnerProps) {
  const { outer, border, text } = sizeMap[size];
  const { ring, inner, glow, text: textColor } = colorMap[color];
  const innerSize = outer * 0.65;

  return (
    <output
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
      aria-label={label ?? "Loading"}
    >
      <div className="relative" style={{ width: outer, height: outer }}>
        {/* Outer ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full animate-spin",
            border,
            ring,
            glow,
          )}
        />
        {/* Inner ring (slower, opposite) */}
        <div
          className={cn(
            "absolute rounded-full animate-[spin-slow_3s_linear_infinite_reverse]",
            "border",
            inner,
          )}
          style={{
            width: innerSize,
            height: innerSize,
            top: (outer - innerSize) / 2,
            left: (outer - innerSize) / 2,
          }}
        />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "rounded-full animate-pulse-glow",
              colorMap[color].ring.split(" ")[1]?.replace("border-t-", "bg-"),
            )}
            style={{ width: outer * 0.15, height: outer * 0.15 }}
          />
        </div>
      </div>
      {label && (
        <p
          className={cn(
            "font-mono tracking-widest uppercase animate-pulse-glow",
            text,
            textColor,
          )}
        >
          {label}
        </p>
      )}
    </output>
  );
}
