# Design Brief

## Direction

HELLOGRAM — Futuristic holographic student management system with neon-cyberpunk aesthetic and advanced data visualization overlay.

## Tone

Maximalist cyberpunk meets premium tech — confident, energetic, unforgettable. Dark navy-black grounds the interface while electric neon accents (cyan, yellow, magenta) create visual intensity and draw attention to interactive elements.

## Differentiation

Glowing neon shadows on glassmorphic cards, rotating circular HUD elements with animated data points, and floating particle background create a distinctive holographic depth that feels premium and advanced.

## Color Palette

| Token       | OKLCH          | Role                                       |
| ----------- | -------------- | ------------------------------------------ |
| background  | 0.12 0.01 245  | Deep navy-black base, grid texture ready   |
| foreground  | 0.95 0.01 245  | Crisp white text, high contrast            |
| card        | 0.16 0.012 245 | Slightly elevated surface, glassmorphism   |
| primary     | 0.7 0.22 190   | Neon cyan, core UI, active states, glow    |
| secondary   | 0.75 0.2 95    | Neon yellow-lime, secondary highlights     |
| accent      | 0.65 0.24 305  | Neon magenta, destructive/alert states    |
| muted       | 0.22 0.008 245 | Subtle dividers, secondary text            |
| border      | 0.25 0.012 245 | Neon glow-ready borders, sharp outlines    |

## Typography

- Display: Space Grotesk — Futuristic geometric sans, hero title and section headings
- Body: DM Sans — Clean, modern, optimized for UI labels and body text
- Scale: Hero text `text-6xl md:text-7xl font-bold`, sections `text-3xl font-bold`, labels `text-xs uppercase font-semibold tracking-widest`

## Elevation & Depth

Layered glassmorphic cards with multi-stage neon glow shadows; primary shadow (cyan) + secondary ambient shadow creates depth. Circular HUD elements float via animation, adding 3D perspective.

## Structural Zones

| Zone    | Background              | Border                              | Notes                                    |
| ------- | ----------------------- | ----------------------------------- | ---------------------------------------- |
| Header  | glass-effect card       | cyan glow, bottom-only border       | Branded title, navigation               |
| Hero    | Animated particles, bg  | —                                   | Central CTA, rotating HUD on right      |
| Content | Alternating cards/bg    | Glowing cyan/yellow borders         | Student dashboards, animated sections   |
| Footer  | muted/20 with border-t  | Subtle cyan border-top              | Links, secondary info                   |

## Spacing & Rhythm

Balanced density with 24px section gaps, 16px card padding, 8px micro-spacing within components. Alternating card/background sections create visual rhythm and reduce cognitive load.

## Component Patterns

- Buttons: Sharp corners or full-round (pill), neon cyan primary, yellow secondary, magenta destructive; glow-pulse on hover
- Cards: Glassmorphic with 1px cyan/yellow border, multi-stage glow shadow, 8px border-radius
- Badges: Pill-shaped with neon accents, uppercase label, micro-spacing
- HUD Meters: Circular, animated rotation, multi-ring design with data readouts

## Motion

- Entrance: Fade-in + subtle slide-up, 400ms easing
- Hover: Glow-pulse shadow expansion + slight scale (1.02), 300ms smooth
- Decorative: Rotating HUD elements (8s continuous), floating cards (3s ease-in-out), particle drift background (looped)

## Constraints

- Never use flat colors without glow context; all primary/secondary must include shadow-glow utility
- Maintain neon intensity but avoid garish effects; use opacity-based subtlety on secondary/muted states
- All interactive elements must have visible hover/focus state with glow enhancement
- Glassmorphism applies to cards and overlays; ensure 0.7+ opacity + blur for readability

## Signature Detail

Layered multi-color neon glow shadows (cyan + yellow combinations on cards) create premium holographic depth without relying on gradients or heavy effects.
