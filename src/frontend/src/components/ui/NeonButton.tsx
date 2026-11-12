import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";

type NeonVariant = "primary" | "secondary" | "danger" | "ghost";

interface NeonButtonProps {
  children: React.ReactNode;
  variant?: NeonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  "data-ocid"?: string;
}

const variantStyles: Record<NeonVariant, string> = {
  primary: [
    "border-primary/50 text-primary bg-primary/10",
    "hover:bg-primary/20 hover:border-primary/80 hover:shadow-glow-cyan",
  ].join(" "),
  secondary: [
    "border-secondary/50 text-secondary bg-secondary/10",
    "hover:bg-secondary/20 hover:border-secondary/80 hover:shadow-glow-yellow",
  ].join(" "),
  danger: [
    "border-accent/50 text-accent bg-accent/10",
    "hover:bg-accent/20 hover:border-accent/80 hover:shadow-glow-accent",
  ].join(" "),
  ghost: [
    "border-border/40 text-muted-foreground bg-transparent",
    "hover:border-primary/40 hover:text-primary hover:bg-primary/5",
  ].join(" "),
};

export function NeonButton({
  children,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className,
  "data-ocid": dataOcid,
}: NeonButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.03 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      data-ocid={dataOcid}
      className={cn(
        "relative inline-flex items-center justify-center gap-2",
        "rounded-lg border px-5 py-2.5 text-sm font-display font-medium",
        "transition-all duration-300 cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
        variantStyles[variant],
        fullWidth && "w-full",
        className,
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
