import { cn } from "@/lib/utils";

type HUDColor = "cyan" | "yellow" | "magenta";

interface HUDCircleProps {
  size?: number;
  color?: HUDColor;
  speed?: "slow" | "normal" | "fast";
  children?: React.ReactNode;
  className?: string;
  innerRing?: boolean;
}

const colorStyles: Record<
  HUDColor,
  { ring: string; glow: string; innerRing: string }
> = {
  cyan: {
    ring: "border-primary/70",
    glow: "shadow-glow-cyan",
    innerRing: "border-primary/30",
  },
  yellow: {
    ring: "border-secondary/70",
    glow: "shadow-glow-yellow",
    innerRing: "border-secondary/30",
  },
  magenta: {
    ring: "border-accent/70",
    glow: "shadow-glow-accent",
    innerRing: "border-accent/30",
  },
};

const speedStyles = {
  slow: "animate-[spin-slow_12s_linear_infinite]",
  normal: "animate-[spin-slow_6s_linear_infinite]",
  fast: "animate-[spin-slow_3s_linear_infinite]",
};

const reverseSpeedStyles = {
  slow: "animate-[spin-slow_16s_linear_infinite_reverse]",
  normal: "animate-[spin-slow_8s_linear_infinite_reverse]",
  fast: "animate-[spin-slow_4s_linear_infinite_reverse]",
};

export function HUDCircle({
  size = 120,
  color = "cyan",
  speed = "slow",
  children,
  className,
  innerRing = false,
}: HUDCircleProps) {
  const { ring, glow, innerRing: innerRingClass } = colorStyles[color];
  const outerPad = 8;
  const innerSize = size - outerPad * 2;

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Outer rotating ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full border-2 border-dashed",
          ring,
          glow,
          speedStyles[speed],
        )}
        style={{ borderStyle: "dashed" }}
      />

      {/* Optional counter-rotating inner ring */}
      {innerRing && (
        <div
          className={cn(
            "absolute rounded-full border border-dashed",
            innerRingClass,
            reverseSpeedStyles[speed],
          )}
          style={{
            width: innerSize,
            height: innerSize,
            top: outerPad,
            left: outerPad,
          }}
        />
      )}

      {/* Center content */}
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
