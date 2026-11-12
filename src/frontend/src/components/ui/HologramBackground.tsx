import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export function HologramBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Reduce particle count slightly for faster paint
    const COUNT = 45;
    particlesRef.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.8 + 0.8,
      opacity: Math.random() * 0.55 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const GRID = 60;

    // Pre-build static bg gradient
    let bgGrad: CanvasGradient | null = null;
    const buildBg = (W: number, H: number) => {
      bgGrad = ctx.createRadialGradient(
        W / 2,
        H / 2,
        0,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.85,
      );
      bgGrad.addColorStop(0, "oklch(0.16 0.015 245)");
      bgGrad.addColorStop(0.5, "oklch(0.13 0.012 245)");
      bgGrad.addColorStop(1, "oklch(0.08 0.01 245)");
    };
    buildBg(canvas.width, canvas.height);
    window.addEventListener("resize", () =>
      buildBg(canvas.width, canvas.height),
    );

    const draw = () => {
      timeRef.current += 0.008;
      const t = timeRef.current;
      const W = canvas.width;
      const H = canvas.height;

      // Background
      if (bgGrad) {
        ctx.fillStyle = bgGrad;
      } else {
        ctx.fillStyle = "oklch(0.08 0.01 245)";
      }
      ctx.fillRect(0, 0, W, H);

      // Grid lines (simplified for performance)
      ctx.lineWidth = 0.5;
      const offsetX = (t * 8) % GRID;
      const offsetY = (t * 5) % GRID;

      for (let x = -GRID + offsetX; x < W + GRID; x += GRID) {
        const distFromCenter = Math.abs(x - W / 2) / (W / 2);
        const alpha = (0.11 - distFromCenter * 0.07).toFixed(3);
        ctx.strokeStyle = `oklch(0.7 0.22 190 / ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      for (let y = -GRID + offsetY; y < H + GRID; y += GRID) {
        const distFromCenter = Math.abs(y - H / 2) / (H / 2);
        const alpha = (0.11 - distFromCenter * 0.07).toFixed(3);
        ctx.strokeStyle = `oklch(0.7 0.22 190 / ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Horizon glow line
      const horizY = H * 0.65 + Math.sin(t * 0.3) * 18;
      const horizGrad = ctx.createLinearGradient(0, horizY, W, horizY);
      horizGrad.addColorStop(0, "transparent");
      horizGrad.addColorStop(0.3, "oklch(0.7 0.22 190 / 0.15)");
      horizGrad.addColorStop(0.5, "oklch(0.7 0.22 190 / 0.45)");
      horizGrad.addColorStop(0.7, "oklch(0.7 0.22 190 / 0.15)");
      horizGrad.addColorStop(1, "transparent");
      ctx.strokeStyle = horizGrad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, horizY);
      ctx.lineTo(W, horizY);
      ctx.stroke();

      // Particles
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        const pulse =
          Math.sin(t * p.pulseSpeed * 80 + p.pulsePhase) * 0.3 + 0.7;
        const alpha = p.opacity * pulse;
        const isCyan = p.pulsePhase < 5;

        // Core dot only (no heavy radial gradient per particle for perf)
        ctx.fillStyle = isCyan
          ? `oklch(0.9 0.15 190 / ${alpha.toFixed(2)})`
          : `oklch(0.9 0.15 95 / ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Glow for larger particles only
        if (p.radius > 1.5) {
          const glow = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.radius * 5,
          );
          const glowColor = isCyan ? "0.7 0.22 190" : "0.75 0.2 95";
          glow.addColorStop(
            0,
            `oklch(${glowColor} / ${(alpha * 0.5).toFixed(2)})`,
          );
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Corner accent lines
      const accentAlpha = (Math.sin(t * 0.5) * 0.12 + 0.22).toFixed(2);
      ctx.strokeStyle = `oklch(0.7 0.22 190 / ${accentAlpha})`;
      ctx.lineWidth = 1;
      const corner = 80;
      ctx.beginPath();
      ctx.moveTo(0, corner);
      ctx.lineTo(0, 0);
      ctx.lineTo(corner, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W - corner, 0);
      ctx.lineTo(W, 0);
      ctx.lineTo(W, corner);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, H - corner);
      ctx.lineTo(0, H);
      ctx.lineTo(corner, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W - corner, H);
      ctx.lineTo(W, H);
      ctx.lineTo(W, H - corner);
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
