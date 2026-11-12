import { cn } from "@/lib/utils";
import { motion } from "motion/react";

type GlowColor = "cyan" | "yellow" | "magenta" | "none";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: GlowColor;
  variant?: "default" | "darker" | "bordered";
  hover?: boolean;
  onClick?: () => void;
  "data-ocid"?: string;
}

const glowBorder: Record<GlowColor, string> = {
  cyan: "hover:border-primary/60 hover:shadow-glow-cyan",
  yellow: "hover:border-secondary/60 hover:shadow-glow-yellow",
  magenta: "hover:border-accent/60 hover:shadow-glow-accent",
  none: "",
};

const variantClass: Record<NonNullable<GlassCardProps["variant"]>, string> = {
  default: "glass-effect",
  darker: "glass-effect-darker",
  bordered: "glass-effect border-primary/20",
};

export function GlassCard({
  children,
  className,
  glowColor = "cyan",
  variant = "default",
  hover = true,
  onClick,
  "data-ocid": dataOcid,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "rounded-xl border border-border/30 transition-all duration-300",
        variantClass[variant],
        glowBorder[glowColor],
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
      data-ocid={dataOcid}
    >
      {children}
    </motion.div>
  );
}
