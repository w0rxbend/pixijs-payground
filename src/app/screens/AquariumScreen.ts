import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

// ── Palette ───────────────────────────────────────────────────────────────────
const DEEP = 0x0a0e2a;
const MID = 0x0d2040;
const SURFACE = 0x1a4a6b;
const CAUSTIC = 0x4ab8c8;
const FOAM = 0xc9eaf5;
const TEAL = 0x94e2d5;
const SKY = 0x89dceb;
const BLUE = 0x89b4fa;
const MAUVE = 0xcba6f7;
const GREEN = 0xa6e3a1;
const YELLOW = 0xf9e2af;
const PEACH = 0xfab387;
const RED = 0xf38ba8;
const WHITE = 0xffffff;
const SAND = 0xe8d5a3;
const CORAL1 = 0xff6b6b;
const CORAL2 = 0xff9f43;
const DARK = 0x11111b;

// ── Fish types ────────────────────────────────────────────────────────────────
const enum FishType {
  SARDINE,
  TROPICAL,
  ANGEL,
  PUFFER,
  SHARK,
  MANTA,
  SUBMARINE,
  PIRANHA,
  HAMMERHEAD,
  JELLYFISH,
  SEA_SNAKE,
  CROCODILE,
  SHRIMP,
}

interface FishColors {
  body: number;
  accent: number;
  fin: number;
  belly: number;
  eye: number;
  stripe?: number;
}

// ── Fish palettes ─────────────────────────────────────────────────────────────
const SARDINE_PALETTES: FishColors[] = [
  {
    body: 0x7db9e8,
    accent: 0x5ba0d0,
    fin: 0x89b4fa,
    belly: 0xd6eaf8,
    eye: DARK,
  },
  { body: 0x94e2d5, accent: 0x4db6a0, fin: TEAL, belly: 0xd5f5f0, eye: DARK },
  {
    body: 0xbac2de,
    accent: 0x9399b2,
    fin: 0xa6adc8,
    belly: 0xe8eaf2,
    eye: DARK,
  },
];
const TROPICAL_PALETTES: FishColors[] = [
  {
    body: 0xf97316,
    accent: 0xea580c,
    fin: 0xfb923c,
    belly: WHITE,
    eye: DARK,
    stripe: WHITE,
  },
  {
    body: 0x3b82f6,
    accent: 0x2563eb,
    fin: 0x60a5fa,
    belly: 0xdbeafe,
    eye: DARK,
    stripe: YELLOW,
  },
  {
    body: RED,
    accent: 0xe0445c,
    fin: PEACH,
    belly: WHITE,
    eye: DARK,
    stripe: 0xffd700,
  },
  {
    body: YELLOW,
    accent: PEACH,
    fin: 0xfcd34d,
    belly: WHITE,
    eye: DARK,
    stripe: 0x1e40af,
  },
];
const ANGEL_PALETTES: FishColors[] = [
  {
    body: 0xc0c8d8,
    accent: 0x8899aa,
    fin: 0xa0b8d0,
    belly: WHITE,
    eye: DARK,
    stripe: DARK,
  },
  {
    body: YELLOW,
    accent: PEACH,
    fin: 0xfcd34d,
    belly: WHITE,
    eye: DARK,
    stripe: DARK,
  },
  {
    body: MAUVE,
    accent: 0x9b59b6,
    fin: 0xd7bde2,
    belly: WHITE,
    eye: DARK,
    stripe: DARK,
  },
];
const PUFFER_PALETTES: FishColors[] = [
  { body: 0xd4e157, accent: 0xafb42b, fin: 0xcddc39, belly: WHITE, eye: DARK },
  { body: 0xffb347, accent: CORAL2, fin: PEACH, belly: WHITE, eye: DARK },
  { body: TEAL, accent: 0x26a69a, fin: GREEN, belly: WHITE, eye: DARK },
];
const SHARK_PALETTES: FishColors[] = [
  {
    body: 0x607d8b,
    accent: 0x455a64,
    fin: 0x546e7a,
    belly: 0xeceff1,
    eye: DARK,
  },
  { body: 0x78909c, accent: 0x546e7a, fin: 0x607d8b, belly: WHITE, eye: DARK },
  {
    body: 0x37474f,
    accent: 0x263238,
    fin: 0x455a64,
    belly: 0xcfd8dc,
    eye: DARK,
  },
];
const MANTA_PALETTES: FishColors[] = [
  {
    body: 0x1a237e,
    accent: 0x0d47a1,
    fin: 0x3949ab,
    belly: 0xe8eaf6,
    eye: DARK,
  },
  {
    body: 0x1b5e20,
    accent: 0x2e7d32,
    fin: 0x388e3c,
    belly: 0xe8f5e9,
    eye: DARK,
  },
  { body: DARK, accent: 0x212121, fin: 0x37474f, belly: 0xf5f5f5, eye: DARK },
];
const SUB_PALETTES: FishColors[] = [
  { body: TEAL, accent: 0x26a69a, fin: GREEN, belly: 0x00796b, eye: YELLOW },
  { body: MAUVE, accent: 0x7e57c2, fin: BLUE, belly: 0x512da8, eye: YELLOW },
  { body: BLUE, accent: 0x1565c0, fin: SKY, belly: 0x0d47a1, eye: YELLOW },
];
const PIRANHA_PALETTES: FishColors[] = [
  {
    body: 0x8faa78,
    accent: 0x5a7040,
    fin: 0x6b9660,
    belly: 0xff3c3c,
    eye: DARK,
    stripe: 0x4a6030,
  },
  {
    body: 0xa09868,
    accent: 0x685838,
    fin: 0x78885a,
    belly: 0xff5533,
    eye: DARK,
  },
  {
    body: 0x708870,
    accent: 0x486048,
    fin: 0x587058,
    belly: 0xff2222,
    eye: DARK,
  },
];
const CRAB_PALETTES: FishColors[] = [
  {
    body: 0xd44400,
    accent: 0xb03000,
    fin: 0xf07840,
    belly: 0xffd0a0,
    eye: DARK,
  },
  {
    body: 0x1e6888,
    accent: 0x104858,
    fin: 0x3090b0,
    belly: 0x90d0e0,
    eye: DARK,
  },
  {
    body: 0x7a5a30,
    accent: 0x5a3a18,
    fin: 0xa07848,
    belly: 0xe8c880,
    eye: DARK,
  },
  {
    body: 0x7030a0,
    accent: 0x501878,
    fin: 0x9050c0,
    belly: 0xd0a8e8,
    eye: DARK,
  },
  {
    body: 0x406030,
    accent: 0x284018,
    fin: 0x608040,
    belly: 0xb0d880,
    eye: DARK,
  },
];
const HAMMERHEAD_PALETTES: FishColors[] = [
  {
    body: 0x546e7a,
    accent: 0x37474f,
    fin: 0x607d8b,
    belly: 0xe0e0e0,
    eye: DARK,
  },
  { body: 0x78909c, accent: 0x546e7a, fin: 0x607d8b, belly: WHITE, eye: DARK },
];
const JELLYFISH_PALETTES: FishColors[] = [
  {
    body: 0x4ab8d8,
    accent: 0x2a98b8,
    fin: 0x7ad8f0,
    belly: 0xd0f0ff,
    eye: 0x1a7898,
  },
  {
    body: 0xd080c8,
    accent: 0xb060a8,
    fin: 0xe8a8e0,
    belly: 0xffe0ff,
    eye: DARK,
  },
  {
    body: 0xe0eef8,
    accent: 0xb8cce0,
    fin: 0xf0f8ff,
    belly: WHITE,
    eye: 0x809098,
  },
  {
    body: 0x80d0a0,
    accent: 0x50a878,
    fin: 0xb0e8c8,
    belly: 0xd8f8e8,
    eye: DARK,
  },
];
const SEA_SNAKE_PALETTES: FishColors[] = [
  {
    body: 0x202020,
    accent: 0x141414,
    fin: 0x303030,
    belly: 0xd8c820,
    eye: 0x60c030,
    stripe: YELLOW,
  },
  {
    body: 0x1c3c14,
    accent: 0x102010,
    fin: 0x2a5420,
    belly: 0x70b050,
    eye: DARK,
    stripe: DARK,
  },
  {
    body: 0x1c2850,
    accent: 0x101830,
    fin: 0x2c4080,
    belly: 0x7090c8,
    eye: DARK,
    stripe: DARK,
  },
  {
    body: 0x503010,
    accent: 0x301808,
    fin: 0x704828,
    belly: 0xd09050,
    eye: DARK,
    stripe: 0xc07030,
  },
];
const CROCODILE_PALETTES: FishColors[] = [
  {
    body: 0x2d5016,
    accent: 0x1e380e,
    fin: 0x3d6820,
    belly: 0x90a840,
    eye: 0xd4a017,
  },
  {
    body: 0x4a5828,
    accent: 0x303818,
    fin: 0x5a6838,
    belly: 0x8a9050,
    eye: 0xc8a820,
  },
  {
    body: 0x485850,
    accent: 0x303838,
    fin: 0x586870,
    belly: 0x788878,
    eye: 0xd0c010,
  },
];
const SHRIMP_PALETTES: FishColors[] = [
  { body: 0xf8a0a0, accent: 0xd05050, fin: 0xf8c0c0, belly: WHITE, eye: DARK },
  { body: 0xf8a060, accent: 0xd07030, fin: 0xf8c880, belly: YELLOW, eye: DARK },
  { body: 0xd0e8f0, accent: 0x88b0c8, fin: 0xe0f0f8, belly: WHITE, eye: DARK },
  { body: 0xe8c8a0, accent: 0xb89060, fin: 0xf0dcc0, belly: WHITE, eye: DARK },
];

// ── Plant types ───────────────────────────────────────────────────────────────
const enum PlantType {
  KELP,
  SEA_FAN,
  ANEMONE,
  BUBBLE_ALGAE,
  SEA_GRASS,
  FERN,
}

interface PlantDef {
  type: PlantType;
  nx: number; // normalised x (0-1)
  phase: number;
  speed: number;
  height: number;
  color: number;
  color2: number;
  scale: number;
}

// ── Bottom decoration types ───────────────────────────────────────────────────
const enum DecoType {
  ROCK,
  STARFISH,
  SEA_URCHIN,
  SHELL,
  ANCHOR,
  TREASURE_CHEST,
}

interface DecoDef {
  type: DecoType;
  x: number; // absolute world x (set in resize)
  nx: number; // normalised
  ny: number; // normalised (y on/near sand)
  color: number;
  scale: number;
  phase: number;
  openSpeed: number; // chest: lid oscillation speed
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function rnd(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ═════════════════════════════════════════════════════════════════════════════
// FISH DRAWING FUNCTIONS
// All drawn at local origin (0,0), facing +X (right). Scale via Container.
// ═════════════════════════════════════════════════════════════════════════════

function drawSardine(g: Graphics, tp: number, c: FishColors): void {
  const ts = Math.sin(tp);
  const spread = 11 + ts * 3;

  // Tail fork
  g.moveTo(-24, 0)
    .lineTo(-36, -spread)
    .lineTo(-28, -1)
    .fill({ color: c.fin, alpha: 0.88 });
  g.moveTo(-24, 0)
    .lineTo(-36, spread)
    .lineTo(-28, 1)
    .fill({ color: c.fin, alpha: 0.88 });
  g.moveTo(-22, -5)
    .lineTo(-28, 0)
    .lineTo(-22, 5)
    .fill({ color: c.body, alpha: 0.4 });

  // Body
  g.ellipse(0, 0, 28, 8).fill({ color: c.body });
  g.ellipse(4, 3, 18, 3.5).fill({ color: c.belly, alpha: 0.35 });
  g.moveTo(-20, 0)
    .bezierCurveTo(-10, -1, 5, -1, 22, 0)
    .stroke({ color: c.accent, alpha: 0.4, width: 1.2 });

  // Dorsal fin
  g.moveTo(-4, -8)
    .bezierCurveTo(2, -17, 10, -16, 16, -8)
    .fill({ color: c.fin, alpha: 0.72 });
  // Pectoral fin
  g.moveTo(10, 2)
    .lineTo(4, 10)
    .lineTo(16, 6)
    .fill({ color: c.fin, alpha: 0.55 });
  // Gill
  g.moveTo(14, -6)
    .bezierCurveTo(10, 0, 10, 2, 14, 7)
    .stroke({ color: c.accent, alpha: 0.55, width: 1 });

  // Eye
  g.circle(18, -1, 2.8).fill({ color: WHITE });
  g.circle(18.4, -1.4, 1.7).fill({ color: c.eye });
  g.circle(18.0, -1.9, 0.6).fill({ color: WHITE, alpha: 0.8 });
  g.moveTo(27, 0)
    .lineTo(24, 2)
    .stroke({ color: c.accent, alpha: 0.6, width: 1 });
}

function drawTropical(g: Graphics, tp: number, c: FishColors): void {
  const ts = Math.sin(tp);
  const tf = 14 + ts * 5;

  // Tail fan
  g.moveTo(-20, 0)
    .bezierCurveTo(-26, -4, -32, -tf, -28, -tf - 4)
    .bezierCurveTo(-24, -tf - 6, -22, -tf / 2, -20, 0)
    .fill({ color: c.fin, alpha: 0.85 });
  g.moveTo(-20, 0)
    .bezierCurveTo(-26, 4, -32, tf, -28, tf + 4)
    .bezierCurveTo(-24, tf + 6, -22, tf / 2, -20, 0)
    .fill({ color: c.fin, alpha: 0.85 });

  // Body
  g.ellipse(0, 0, 22, 16).fill({ color: c.body });

  // Stripes
  if (c.stripe !== undefined) {
    g.ellipse(-4, 0, 3.5, 15).fill({ color: c.stripe, alpha: 0.55 });
    g.ellipse(6, 0, 3.0, 14).fill({ color: c.stripe, alpha: 0.45 });
  }
  g.ellipse(4, 5, 14, 7).fill({ color: c.belly, alpha: 0.3 });

  // Fins
  g.moveTo(-8, -16)
    .bezierCurveTo(-2, -28, 8, -26, 16, -16)
    .fill({ color: c.fin, alpha: 0.82 });
  g.moveTo(-10, 16)
    .bezierCurveTo(-8, 22, 2, 22, 4, 16)
    .fill({ color: c.fin, alpha: 0.65 });
  g.moveTo(8, 4)
    .bezierCurveTo(4, 14, 14, 18, 18, 10)
    .lineTo(14, 4)
    .fill({ color: c.fin, alpha: 0.6 });

  // Gill
  g.moveTo(12, -14)
    .bezierCurveTo(8, -2, 8, 4, 12, 14)
    .stroke({ color: c.accent, alpha: 0.55, width: 1.2 });

  // Eye
  g.circle(16, -3, 3.5).fill({ color: WHITE });
  g.circle(16.5, -3.5, 2.2).fill({ color: c.eye });
  g.circle(16.0, -4.2, 0.7).fill({ color: WHITE, alpha: 0.85 });
  g.moveTo(22, 2)
    .bezierCurveTo(20, 5, 18, 5, 16, 3)
    .stroke({ color: c.accent, alpha: 0.5, width: 1 });
}

function drawAngel(g: Graphics, tp: number, c: FishColors): void {
  const ts = Math.sin(tp);

  // Long streaming fins
  g.moveTo(-16, 0)
    .bezierCurveTo(-20, -14, -12, -34, -4, -42)
    .bezierCurveTo(2, -46, 10, -44, 16, -36)
    .bezierCurveTo(20, -30, 18, -16, 16, 0)
    .fill({ color: c.fin, alpha: 0.55 });
  g.moveTo(-16, 0)
    .bezierCurveTo(-20, 14, -12, 34, -4, 42)
    .bezierCurveTo(2, 46, 10, 44, 16, 36)
    .bezierCurveTo(20, 30, 18, 16, 16, 0)
    .fill({ color: c.fin, alpha: 0.55 });

  // Tail
  const tsw = ts * 4;
  g.moveTo(-16, 0)
    .bezierCurveTo(-22, -6, -28, -8 + tsw, -24, -14 + tsw)
    .bezierCurveTo(-20, -18 + tsw, -16, -8, -16, 0)
    .fill({ color: c.fin, alpha: 0.8 });
  g.moveTo(-16, 0)
    .bezierCurveTo(-22, 6, -28, 8 - tsw, -24, 14 - tsw)
    .bezierCurveTo(-20, 18 - tsw, -16, 8, -16, 0)
    .fill({ color: c.fin, alpha: 0.8 });

  // Body
  g.moveTo(16, 0)
    .bezierCurveTo(14, -12, 6, -28, 0, -30)
    .bezierCurveTo(-6, -28, -14, -12, -16, 0)
    .bezierCurveTo(-14, 12, -6, 28, 0, 30)
    .bezierCurveTo(6, 28, 14, 12, 16, 0)
    .fill({ color: c.body });

  if (c.stripe !== undefined) {
    g.moveTo(-4, -28)
      .bezierCurveTo(-6, 0, -6, 0, -4, 28)
      .bezierCurveTo(-1, 28, -1, 28, 0, 28)
      .bezierCurveTo(-1, 0, -1, 0, 0, -28)
      .fill({ color: c.stripe, alpha: 0.28 });
    g.moveTo(6, -22)
      .bezierCurveTo(4, 0, 4, 0, 6, 22)
      .bezierCurveTo(9, 20, 9, 18, 8, -18)
      .bezierCurveTo(8, -20, 8, -22, 6, -22)
      .fill({ color: c.stripe, alpha: 0.2 });
  }
  g.ellipse(6, 6, 8, 18).fill({ color: c.belly, alpha: 0.22 });
  g.moveTo(10, 0)
    .bezierCurveTo(8, 10, 16, 18, 20, 10)
    .lineTo(14, 0)
    .fill({ color: c.fin, alpha: 0.55 });

  // Eye
  g.circle(12, -6, 3.5).fill({ color: WHITE });
  g.circle(12.5, -6.5, 2.2).fill({ color: c.eye });
  g.circle(12.0, -7.3, 0.7).fill({ color: WHITE, alpha: 0.85 });
}

function drawPuffer(g: Graphics, tp: number, c: FishColors): void {
  const ts = Math.sin(tp);
  const tf = 8 + ts * 3;

  g.moveTo(-20, 0)
    .lineTo(-30, -tf)
    .lineTo(-26, 0)
    .lineTo(-30, tf)
    .lineTo(-20, 0)
    .fill({ color: c.fin, alpha: 0.78 });

  // Body
  g.circle(0, 0, 22).fill({ color: c.body });
  g.ellipse(4, 6, 14, 10).fill({ color: c.belly, alpha: 0.32 });

  // Spines
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const x1 = Math.cos(a) * 22;
    const y1 = Math.sin(a) * 22;
    const x2 = Math.cos(a) * (28 + Math.sin(tp * 0.3 + i) * 2);
    const y2 = Math.sin(a) * (28 + Math.sin(tp * 0.3 + i) * 2);
    g.moveTo(x1, y1)
      .lineTo(x2, y2)
      .stroke({ color: c.accent, alpha: 0.8, width: 1.5, cap: "round" });
  }
  // Spots
  const spots: [number, number, number][] = [
    [-5, -8, 3.5],
    [6, -12, 2.5],
    [12, -4, 2.0],
    [-10, 4, 2.8],
    [2, 10, 3.0],
    [14, 6, 2.2],
    [-2, -15, 2.0],
  ];
  for (const [sx, sy, sr] of spots)
    g.circle(sx, sy, sr).fill({ color: c.accent, alpha: 0.38 });

  g.moveTo(-4, -22)
    .bezierCurveTo(0, -30, 6, -28, 8, -22)
    .fill({ color: c.fin, alpha: 0.65 });

  // Eye (large, puffer-characteristic)
  g.circle(13, -5, 6).fill({ color: WHITE });
  g.circle(13.5, -5.5, 4).fill({ color: c.eye });
  g.circle(12.5, -6.5, 1.5).fill({ color: WHITE, alpha: 0.9 });
  g.moveTo(21, 3)
    .bezierCurveTo(19, 7, 16, 7, 14, 4)
    .stroke({ color: c.accent, alpha: 0.7, width: 1.5 });
}

function drawShark(g: Graphics, tp: number, c: FishColors): void {
  const ts = Math.sin(tp);
  const tw = ts * 7;

  // Crescent tail
  g.moveTo(-48, -4)
    .bezierCurveTo(-55, -10, -66, -22 + tw, -62, -30 + tw)
    .bezierCurveTo(-58, -34 + tw, -52, -24, -48, -10)
    .fill({ color: c.body });
  g.moveTo(-48, 4)
    .bezierCurveTo(-55, 10, -66, 22 - tw, -62, 30 - tw)
    .bezierCurveTo(-58, 34 - tw, -52, 24, -48, 10)
    .fill({ color: c.body });

  // Body
  g.moveTo(52, 0)
    .bezierCurveTo(42, -7, 18, -15, 0, -14)
    .bezierCurveTo(-18, -13, -40, -9, -48, -4)
    .bezierCurveTo(-48, 0, -48, 0, -48, 4)
    .bezierCurveTo(-40, 9, -18, 9, 0, 8)
    .bezierCurveTo(18, 7, 42, 3, 52, 0)
    .fill({ color: c.body });
  g.moveTo(40, 1)
    .bezierCurveTo(20, 5, 0, 8, -30, 6)
    .bezierCurveTo(-40, 7, -46, 4, -48, 4)
    .bezierCurveTo(-40, 9, -18, 9, 0, 8)
    .bezierCurveTo(18, 7, 35, 4, 40, 1)
    .fill({ color: c.belly, alpha: 0.55 });

  // Dorsal fins
  g.moveTo(-8, -14)
    .bezierCurveTo(-6, -28, 2, -36, 8, -34)
    .bezierCurveTo(14, -32, 16, -20, 18, -14)
    .fill({ color: c.fin });
  g.moveTo(-30, -10)
    .bezierCurveTo(-28, -18, -22, -16, -20, -10)
    .fill({ color: c.fin, alpha: 0.75 });
  g.moveTo(10, -4)
    .bezierCurveTo(8, 4, -4, 20, -16, 22)
    .bezierCurveTo(-22, 22, -22, 14, -14, 8)
    .bezierCurveTo(-4, 2, 4, -2, 10, -4)
    .fill({ color: c.fin, alpha: 0.7 });
  g.moveTo(-28, 8)
    .bezierCurveTo(-26, 16, -18, 18, -14, 10)
    .lineTo(-20, 8)
    .fill({ color: c.fin, alpha: 0.65 });

  // Gill slits
  for (let i = 0; i < 5; i++) {
    const gx = 20 - i * 3;
    g.moveTo(gx, -11 + i * 0.5)
      .lineTo(gx - 1, 7 - i * 0.5)
      .stroke({ color: c.accent, alpha: 0.4, width: 0.8 });
  }
  g.ellipse(44, -1, 8, 4).fill({ color: WHITE, alpha: 0.12 });

  // Eye
  g.circle(36, -4, 4).fill({ color: WHITE });
  g.circle(36.5, -4.5, 2.6).fill({ color: c.eye });
  g.circle(35.5, -5.5, 0.9).fill({ color: WHITE, alpha: 0.7 });
  g.circle(46, -3, 1).fill({ color: c.accent, alpha: 0.7 });
  g.circle(46, 1, 1).fill({ color: c.accent, alpha: 0.7 });
}

function drawManta(g: Graphics, tp: number, c: FishColors): void {
  const ts = Math.sin(tp);

  // Tail whip
  g.moveTo(-42, 0)
    .bezierCurveTo(-55, ts * 0.3, -75, ts * 0.7, -90, ts)
    .stroke({ color: c.body, alpha: 0.35, width: 5 });
  g.moveTo(-42, 0)
    .bezierCurveTo(-55, ts * 0.3, -75, ts * 0.7, -90, ts)
    .stroke({ color: c.accent, alpha: 0.75, width: 2.5, cap: "round" });

  // Belly
  g.moveTo(38, 0)
    .bezierCurveTo(20, 10, -10, 20, -42, 8)
    .bezierCurveTo(-42, 0, -42, 0, -42, -8)
    .bezierCurveTo(-10, -20, 20, -10, 38, 0)
    .fill({ color: c.belly, alpha: 0.45 });

  // Wings
  g.moveTo(38, 0)
    .bezierCurveTo(24, -12, 0, -38, -22, -42)
    .bezierCurveTo(-34, -44, -44, -36, -42, -22)
    .bezierCurveTo(-40, -10, -42, 0, -42, 0)
    .bezierCurveTo(-42, 0, -40, 10, -42, 22)
    .bezierCurveTo(-44, 36, -34, 44, -22, 42)
    .bezierCurveTo(0, 38, 24, 12, 38, 0)
    .fill({ color: c.body });

  // Wing veins
  g.moveTo(10, 0)
    .bezierCurveTo(-4, -18, -18, -32, -26, -38)
    .stroke({ color: c.accent, alpha: 0.25, width: 1 });
  g.moveTo(10, 0)
    .bezierCurveTo(-4, 18, -18, 32, -26, 38)
    .stroke({ color: c.accent, alpha: 0.25, width: 1 });

  // Head rostrum
  g.moveTo(38, 0)
    .bezierCurveTo(44, -4, 46, -10, 42, -14)
    .bezierCurveTo(38, -16, 34, -10, 34, 0)
    .fill({ color: c.body });
  g.moveTo(38, 0)
    .bezierCurveTo(44, 4, 46, 10, 42, 14)
    .bezierCurveTo(38, 16, 34, 10, 34, 0)
    .fill({ color: c.body });

  // Cephalic fin tips
  g.moveTo(34, -10)
    .bezierCurveTo(36, -16, 38, -20, 36, -24)
    .stroke({ color: c.fin, alpha: 0.7, width: 2.5, cap: "round" });
  g.moveTo(34, 10)
    .bezierCurveTo(36, 16, 38, 20, 36, 24)
    .stroke({ color: c.fin, alpha: 0.7, width: 2.5, cap: "round" });

  // Eye + gills
  g.circle(28, -8, 4).fill({ color: WHITE, alpha: 0.9 });
  g.circle(28.5, -8.5, 2.5).fill({ color: c.eye });
  g.circle(27.5, -9.5, 0.8).fill({ color: WHITE, alpha: 0.8 });
  for (let i = 0; i < 5; i++) {
    const gx = 18 - i * 4;
    g.moveTo(gx, 8)
      .lineTo(gx + 2, 16)
      .stroke({ color: c.accent, alpha: 0.35, width: 1 });
  }
}

function drawSubmarine(g: Graphics, prop: number, c: FishColors): void {
  // Hull
  g.moveTo(48, 0)
    .bezierCurveTo(48, -14, 38, -18, 24, -18)
    .lineTo(-36, -18)
    .bezierCurveTo(-48, -18, -54, -10, -54, 0)
    .bezierCurveTo(-54, 10, -48, 18, -36, 18)
    .lineTo(24, 18)
    .bezierCurveTo(38, 18, 48, 14, 48, 0)
    .fill({ color: c.body });
  g.moveTo(40, -4)
    .bezierCurveTo(30, -16, -10, -18, -36, -14)
    .bezierCurveTo(-30, -18, -10, -20, 24, -18)
    .bezierCurveTo(38, -18, 46, -12, 40, -4)
    .fill({ color: WHITE, alpha: 0.12 });

  // Ballast + tower
  g.ellipse(-16, 18, 14, 6).fill({ color: c.accent });
  g.ellipse(14, 18, 14, 6).fill({ color: c.accent });
  g.moveTo(-6, -18)
    .lineTo(-6, -36)
    .bezierCurveTo(-6, -42, 14, -42, 14, -36)
    .lineTo(14, -18)
    .fill({ color: c.accent });
  g.circle(4, -33, 4).fill({ color: c.eye, alpha: 0.8 });
  g.circle(4, -33, 4).stroke({ color: c.belly, alpha: 0.4, width: 1 });
  g.moveTo(2, -42)
    .lineTo(2, -52)
    .lineTo(12, -52)
    .stroke({ color: c.fin, alpha: 0.85, width: 2.5, cap: "round" });
  g.circle(12, -52, 2.5).fill({ color: c.eye, alpha: 0.9 });

  // Propeller
  for (let b = 0; b < 3; b++) {
    const ba = prop + (b / 3) * Math.PI * 2;
    const bx1 = -54 + Math.cos(ba) * 3;
    const by1 = Math.sin(ba) * 3;
    const bx2 = -54 + Math.cos(ba) * 8;
    const by2 = Math.sin(ba) * 14;
    g.moveTo(bx1, by1)
      .bezierCurveTo(
        bx1 - 4,
        by1 + Math.sign(by2) * 4,
        bx2 - 4,
        by2 - 4,
        bx2,
        by2,
      )
      .fill({ color: c.fin, alpha: 0.8 });
  }
  g.circle(-54, 0, 4).fill({ color: c.accent });

  // Portholes
  for (let i = 0; i < 3; i++) {
    const px = -22 + i * 20;
    g.circle(px, 0, 5).fill({ color: c.eye, alpha: 0.55 });
    g.circle(px, 0, 5).stroke({ color: c.belly, alpha: 0.5, width: 1 });
    g.circle(px - 1, -1, 1.5).fill({ color: WHITE, alpha: 0.4 });
  }
  // Bow light + rivets
  g.circle(48, 0, 6).fill({ color: c.eye, alpha: 0.3 });
  g.circle(48, 0, 4).fill({ color: c.eye, alpha: 0.5 });
  g.circle(48, 0, 2).fill({ color: WHITE, alpha: 0.9 });
  for (let i = 0; i < 6; i++) {
    const rx = -40 + i * 14;
    g.circle(rx, -17, 1.2).fill({ color: c.belly, alpha: 0.5 });
    g.circle(rx, 17, 1.2).fill({ color: c.belly, alpha: 0.5 });
  }
  g.moveTo(-36, -18)
    .lineTo(-48, -8)
    .lineTo(-54, 0)
    .lineTo(-48, 8)
    .lineTo(-36, 18)
    .stroke({ color: c.accent, alpha: 0.45, width: 1.5 });
}

// ── PIRANHA — deep-bodied, underbite, visible teeth, red belly ────────────────
function drawPiranha(g: Graphics, tp: number, c: FishColors): void {
  const ts = Math.sin(tp);
  const tf = 10 + ts * 4;

  // Compact forked tail
  g.moveTo(-20, -1)
    .lineTo(-32, -tf - 1)
    .lineTo(-24, -1)
    .fill({ color: c.fin, alpha: 0.9 });
  g.moveTo(-20, 1)
    .lineTo(-32, tf + 1)
    .lineTo(-24, 1)
    .fill({ color: c.fin, alpha: 0.9 });

  // Very deep body (disc-like, characteristic of piranha)
  g.ellipse(0, -1, 22, 20).fill({ color: c.body });

  // Scale shimmer
  g.ellipse(-2, -6, 13, 9).fill({ color: WHITE, alpha: 0.07 });

  // Lateral scale stripe pattern
  if (c.stripe !== undefined) {
    g.ellipse(-6, 0, 2.5, 18).fill({ color: c.stripe, alpha: 0.35 });
    g.ellipse(2, 0, 2.0, 16).fill({ color: c.stripe, alpha: 0.25 });
  }

  // Red belly (very distinctive)
  g.ellipse(2, 10, 17, 9).fill({ color: c.belly, alpha: 0.85 });
  g.ellipse(4, 14, 10, 5).fill({ color: c.belly, alpha: 0.6 });

  // Short aggressive dorsal fin
  g.moveTo(-2, -21)
    .bezierCurveTo(2, -32, 10, -30, 14, -21)
    .fill({ color: c.fin, alpha: 0.82 });
  // Anal fin
  g.moveTo(-5, 20)
    .bezierCurveTo(-1, 30, 6, 28, 9, 20)
    .fill({ color: c.fin, alpha: 0.7 });
  // Pectoral fin
  g.moveTo(10, 4)
    .bezierCurveTo(6, 14, 14, 20, 18, 13)
    .lineTo(14, 4)
    .fill({ color: c.fin, alpha: 0.55 });

  // UPPER SNOUT — blunt, rounded
  g.moveTo(18, -10)
    .bezierCurveTo(24, -10, 27, -6, 25, -1)
    .bezierCurveTo(23, 2, 18, 2, 16, -1)
    .fill({ color: c.body });

  // LOWER JAW — characteristic underbite (extends further forward than snout)
  g.moveTo(16, 2)
    .bezierCurveTo(21, 5, 27, 8, 28, 13)
    .bezierCurveTo(26, 17, 18, 15, 15, 9)
    .bezierCurveTo(13, 7, 13, 5, 16, 2)
    .fill({ color: c.accent });
  g.ellipse(21, 11, 7, 3).fill({ color: c.belly, alpha: 0.5 });

  // LOWER TEETH — triangular spikes on upper edge of lower jaw
  for (let t = 0; t < 5; t++) {
    const tx = 16.5 + t * 2.3;
    g.moveTo(tx, 3)
      .lineTo(tx + 1.1, -4)
      .lineTo(tx + 2.3, 3)
      .fill({ color: WHITE, alpha: 0.95 });
  }
  // UPPER TEETH — pointing down
  for (let t = 0; t < 3; t++) {
    const tx = 18 + t * 2.6;
    g.moveTo(tx, -1)
      .lineTo(tx + 1.3, 5)
      .lineTo(tx + 2.6, -1)
      .fill({ color: WHITE, alpha: 0.88 });
  }

  // Gill arc
  g.moveTo(12, -19)
    .bezierCurveTo(8, -4, 8, 4, 12, 16)
    .stroke({ color: c.accent, alpha: 0.52, width: 1.2 });

  // Eye — with angry diagonal brow
  g.circle(14, -7, 4.2).fill({ color: WHITE });
  g.circle(14.5, -7.5, 2.6).fill({ color: c.eye });
  g.circle(13.5, -8.5, 0.9).fill({ color: WHITE, alpha: 0.85 });
  // Angry brow slash above eye
  g.moveTo(10, -13)
    .lineTo(18, -10)
    .stroke({ color: DARK, alpha: 0.65, width: 2.2 });
}

// ── HAMMERHEAD — T-shaped cephalofoil head, eyes at wing tips ─────────────────
function drawHammerhead(g: Graphics, tp: number, c: FishColors): void {
  const ts = Math.sin(tp);
  const tw = ts * 6;

  // Crescent tail
  g.moveTo(-46, -4)
    .bezierCurveTo(-54, -9, -64, -20 + tw, -60, -28 + tw)
    .bezierCurveTo(-56, -32 + tw, -50, -22, -46, -10)
    .fill({ color: c.body });
  g.moveTo(-46, 4)
    .bezierCurveTo(-54, 9, -64, 20 - tw, -60, 28 - tw)
    .bezierCurveTo(-56, 32 - tw, -50, 22, -46, 10)
    .fill({ color: c.body });

  // Body (connects at x=+10 where hammer begins)
  g.moveTo(10, 0)
    .bezierCurveTo(0, -12, -15, -14, -30, -12)
    .bezierCurveTo(-40, -10, -46, -6, -46, -4)
    .bezierCurveTo(-46, 0, -46, 0, -46, 4)
    .bezierCurveTo(-46, 6, -40, 10, -30, 12)
    .bezierCurveTo(-15, 14, 0, 12, 10, 0)
    .fill({ color: c.body });
  g.ellipse(-18, 5, 22, 6).fill({ color: c.belly, alpha: 0.4 });

  // THE HAMMER — top wing
  g.moveTo(32, 0)
    .bezierCurveTo(28, -7, 20, -14, 10, -22)
    .bezierCurveTo(4, -26, -4, -24, -8, -18)
    .bezierCurveTo(-10, -13, -8, -7, -4, -3)
    .bezierCurveTo(0, -1, 6, 0, 10, 0)
    .fill({ color: c.body });
  // THE HAMMER — bottom wing (mirror)
  g.moveTo(32, 0)
    .bezierCurveTo(28, 7, 20, 14, 10, 22)
    .bezierCurveTo(4, 26, -4, 24, -8, 18)
    .bezierCurveTo(-10, 13, -8, 7, -4, 3)
    .bezierCurveTo(0, 1, 6, 0, 10, 0)
    .fill({ color: c.body });

  // Hammer belly underside
  g.moveTo(28, 2)
    .bezierCurveTo(18, 12, 4, 18, -4, 15)
    .bezierCurveTo(-8, 12, -7, 7, -3, 3)
    .bezierCurveTo(2, 1, 14, 1, 28, 2)
    .fill({ color: c.belly, alpha: 0.35 });

  // Dorsal fins
  g.moveTo(-8, -12)
    .bezierCurveTo(-6, -26, 0, -34, 6, -30)
    .bezierCurveTo(12, -26, 12, -16, 14, -12)
    .fill({ color: c.fin });
  g.moveTo(-28, -10)
    .bezierCurveTo(-26, -19, -20, -17, -18, -10)
    .fill({ color: c.fin, alpha: 0.75 });

  // Pectoral fin
  g.moveTo(2, -5)
    .bezierCurveTo(0, 4, -12, 18, -24, 20)
    .bezierCurveTo(-30, 20, -30, 12, -22, 6)
    .bezierCurveTo(-12, 0, -4, -3, 2, -5)
    .fill({ color: c.fin, alpha: 0.68 });

  // EYES at the very tips of hammer wings
  g.circle(6, -23, 4.5).fill({ color: WHITE });
  g.circle(6.6, -23.6, 2.8).fill({ color: c.eye });
  g.circle(5.5, -24.8, 0.9).fill({ color: WHITE, alpha: 0.78 });
  g.circle(6, 23, 4.5).fill({ color: WHITE });
  g.circle(6.6, 23.6, 2.8).fill({ color: c.eye });
  g.circle(5.5, 24.8, 0.9).fill({ color: WHITE, alpha: 0.78 });

  // Nostril sensory pores on hammer front
  g.circle(28, -5, 1.8).fill({ color: c.accent, alpha: 0.65 });
  g.circle(28, 5, 1.8).fill({ color: c.accent, alpha: 0.65 });
  for (let i = 0; i < 6; i++) {
    const px = 14 + (i % 3) * 5;
    const py = i < 3 ? -8 - i * 3 : 8 + (i - 3) * 3;
    g.circle(px, py, 0.8).fill({ color: c.accent, alpha: 0.4 });
  }

  // Gill slits
  for (let i = 0; i < 5; i++) {
    const gx = -4 - i * 3;
    g.moveTo(gx, -11 + i * 0.4)
      .lineTo(gx - 1, 8 - i * 0.4)
      .stroke({ color: c.accent, alpha: 0.38, width: 0.8 });
  }
}

// ── JELLYFISH — pulsing bell with trailing oral arms and tentacles ─────────────
function drawJellyfish(g: Graphics, tp: number, c: FishColors): void {
  const pulse = 0.82 + 0.18 * Math.sin(tp * 2.2);

  // Outer glow halo
  g.ellipse(0, -8, 36 * pulse, 28).fill({ color: c.body, alpha: 0.12 });

  // Bell
  g.moveTo(-30 * pulse, 8)
    .bezierCurveTo(-30 * pulse, -18, -16 * pulse, -32, 0, -34)
    .bezierCurveTo(16 * pulse, -32, 30 * pulse, -18, 30 * pulse, 8)
    .bezierCurveTo(20 * pulse, 18, 0, 22, -20 * pulse, 16)
    .fill({ color: c.body, alpha: 0.62 });

  // Inner dome highlight
  g.moveTo(-16 * pulse, 4)
    .bezierCurveTo(-16 * pulse, -14, -8 * pulse, -26, 0, -28)
    .bezierCurveTo(8 * pulse, -26, 16 * pulse, -14, 16 * pulse, 4)
    .fill({ color: c.belly, alpha: 0.22 });

  // Radial rib lines on bell
  for (let r = 0; r < 6; r++) {
    const rx = (r / 5 - 0.5) * 52 * pulse;
    const ry1 = -28 + Math.abs(r - 2.5) * 4;
    g.moveTo(rx * 0.5, ry1)
      .lineTo(rx * 0.85, 8)
      .stroke({ color: c.accent, alpha: 0.2, width: 0.8 });
  }

  // Oral arms (thick, wavy, 4)
  for (let i = 0; i < 4; i++) {
    const ox = (i - 1.5) * 11 * pulse;
    const sw1 = Math.sin(tp + i * 0.9) * 9;
    const sw2 = Math.sin(tp * 0.75 + i * 1.3) * 13;
    g.moveTo(ox, 16)
      .bezierCurveTo(ox + sw1, 32, ox + sw2, 50, ox + sw1 * 0.6, 65)
      .stroke({ color: c.fin, alpha: 0.52, width: 2.8, cap: "round" });
  }

  // Tentacles (thin, 8)
  for (let i = 0; i < 8; i++) {
    const tx = (i - 3.5) * 7.5 * pulse;
    const sw = Math.sin(tp * 0.85 + i * 0.7) * 15;
    g.moveTo(tx, 18)
      .bezierCurveTo(tx + sw * 0.4, 40, tx + sw * 0.8, 60, tx + sw, 82)
      .stroke({ color: c.accent, alpha: 0.3, width: 1, cap: "round" });
  }

  // Bioluminescent dots inside bell
  for (let d = 0; d < 5; d++) {
    const da = (d / 5) * Math.PI;
    const dx = Math.cos(da) * 14 * pulse;
    const dy = -18 + Math.sin(da) * 8;
    const da2 = 0.4 + 0.6 * Math.sin(tp * 2 + d * 1.1);
    g.circle(dx, dy, 1.8).fill({ color: c.eye, alpha: da2 * 0.7 });
  }
}

// ── SEA SNAKE — long sinusoidal body with paddle tail and forked tongue ────────
function drawSeaSnake(g: Graphics, tp: number, c: FishColors): void {
  const SEGS = 12;
  const SEG_LEN = 9;

  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= SEGS; i++) {
    const sx = (SEGS / 2 - i) * SEG_LEN;
    const sy = Math.sin(tp - i * 0.48) * (4 + i * 0.9);
    pts.push({ x: sx, y: sy });
  }

  // Body segments, tail → head so head draws on top
  for (let i = SEGS - 1; i >= 0; i--) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const taper = 1 - (i / SEGS) * 0.55;
    const w = 9 * taper + 1.5;
    g.moveTo(p0.x, p0.y)
      .lineTo(p1.x, p1.y)
      .stroke({ color: c.body, alpha: 0.95, width: w, cap: "round" });
    if (i % 2 === 0 && c.stripe !== undefined) {
      g.moveTo(p0.x, p0.y)
        .lineTo(p1.x, p1.y)
        .stroke({
          color: c.stripe,
          alpha: 0.65,
          width: w * 0.52,
          cap: "round",
        });
    }
  }

  // Paddle tail
  const tp0 = pts[SEGS];
  const tp1 = pts[SEGS - 1];
  const ta = Math.atan2(tp0.y - tp1.y, tp0.x - tp1.x);
  const tf = Math.sin(tp) * 3;
  g.moveTo(tp0.x, tp0.y)
    .lineTo(
      tp0.x + Math.cos(ta + 0.7) * 14,
      tp0.y + Math.sin(ta + 0.7) * 14 + tf,
    )
    .lineTo(tp0.x + Math.cos(ta) * 8, tp0.y + Math.sin(ta) * 8)
    .lineTo(
      tp0.x + Math.cos(ta - 0.7) * 14,
      tp0.y + Math.sin(ta - 0.7) * 14 - tf,
    )
    .fill({ color: c.fin, alpha: 0.82 });

  // Head
  const hp = pts[0];
  g.ellipse(hp.x + 2, hp.y, 11, 8).fill({ color: c.body });
  g.ellipse(hp.x, hp.y - 2, 7, 4).fill({ color: c.accent, alpha: 0.38 });

  // Eye
  g.circle(hp.x + 7, hp.y - 2, 3.2).fill({ color: WHITE });
  g.circle(hp.x + 7.5, hp.y - 2.5, 2).fill({ color: c.eye });
  g.circle(hp.x + 7, hp.y - 3.2, 0.7).fill({ color: WHITE, alpha: 0.75 });

  // Forked tongue (flick)
  const flick = Math.max(0, Math.sin(tp * 1.8));
  if (flick > 0.35) {
    const tx = hp.x + 18;
    g.moveTo(hp.x + 11, hp.y + 1)
      .lineTo(tx, hp.y)
      .stroke({ color: 0xff4444, alpha: 0.92, width: 1.3 });
    g.moveTo(tx, hp.y)
      .lineTo(tx + 5, hp.y - 3)
      .stroke({ color: 0xff4444, alpha: 0.85, width: 1 });
    g.moveTo(tx, hp.y)
      .lineTo(tx + 5, hp.y + 3)
      .stroke({ color: 0xff4444, alpha: 0.85, width: 1 });
  }
}

// ── CROCODILE — armored flat body, wide snout, vertical slit pupils ────────────
function drawCrocodile(g: Graphics, tp: number, c: FishColors): void {
  const ts = Math.sin(tp);
  const tw = ts * 8;

  // Tail (swings)
  g.moveTo(-38, -6)
    .bezierCurveTo(-52, tw * 0.3 - 4, -68, tw * 0.65 - 1, -76, tw - 2)
    .bezierCurveTo(-76, tw + 3, -68, tw * 0.65 + 4, -52, tw * 0.3 + 6)
    .bezierCurveTo(-42, 7, -38, 6, -38, -6)
    .fill({ color: c.body });

  // Body
  g.moveTo(44, -5)
    .bezierCurveTo(22, -13, -8, -15, -38, -10)
    .bezierCurveTo(-44, -8, -44, 0, -38, 8)
    .bezierCurveTo(-8, 14, 22, 12, 40, 7)
    .bezierCurveTo(46, 5, 46, -1, 44, -5)
    .fill({ color: c.body });

  // Belly
  g.moveTo(36, -1)
    .bezierCurveTo(18, 8, -8, 11, -30, 7)
    .bezierCurveTo(-28, 12, 10, 15, 36, 5)
    .fill({ color: c.belly, alpha: 0.55 });

  // Dorsal scutes
  for (let i = 0; i < 9; i++) {
    const sx = 26 - i * 7;
    g.moveTo(sx - 3, -12)
      .lineTo(sx, -20)
      .lineTo(sx + 3, -12)
      .fill({ color: c.accent, alpha: 0.88 });
  }

  // Legs (4 stubby)
  const legPairs: [number, number][] = [
    [22, 1],
    [4, 1],
    [-14, 1],
    [-28, 1],
  ];
  for (const [lx] of legPairs) {
    g.moveTo(lx, 10)
      .bezierCurveTo(lx + 4, 20, lx + 2, 28, lx - 4, 30)
      .lineTo(lx - 8, 28)
      .bezierCurveTo(lx - 4, 22, lx - 2, 14, lx, 10)
      .fill({ color: c.body, alpha: 0.82 });
    // Claws
    for (let cl = 0; cl < 3; cl++) {
      g.moveTo(lx - 4 + cl * 3, 30)
        .lineTo(lx - 5 + cl * 3, 36)
        .stroke({ color: c.accent, alpha: 0.7, width: 1.2, cap: "round" });
    }
  }

  // Head / snout
  g.moveTo(44, -5)
    .bezierCurveTo(54, -5, 74, -7, 86, -2)
    .bezierCurveTo(92, 1, 86, 7, 72, 7)
    .bezierCurveTo(52, 8, 46, 5, 44, 5)
    .fill({ color: c.body });
  g.ellipse(72, -1, 18, 6).fill({ color: c.body }); // upper jaw bulge
  g.ellipse(72, -2, 11, 3.5).fill({ color: c.accent, alpha: 0.28 });

  // Nostrils
  g.circle(84, -4, 2.8).fill({ color: c.accent, alpha: 0.85 });
  g.circle(88, -3, 2.8).fill({ color: c.accent, alpha: 0.85 });

  // Teeth
  for (let t = 0; t < 7; t++) {
    const tx = 50 + t * 5.5;
    g.moveTo(tx, -4)
      .lineTo(tx + 1.2, -12)
      .lineTo(tx + 2.8, -4)
      .fill({ color: WHITE, alpha: 0.93 });
    g.moveTo(tx + 1, 5)
      .lineTo(tx + 2.2, 12)
      .lineTo(tx + 4, 5)
      .fill({ color: WHITE, alpha: 0.85 });
  }

  // Eye with vertical slit pupil
  g.circle(52, -9, 6.5).fill({ color: c.fin });
  g.circle(52, -9, 5).fill({ color: c.eye });
  g.ellipse(52, -9, 1.8, 4.5).fill({ color: DARK, alpha: 0.92 });
  g.circle(50.5, -10.5, 1.4).fill({ color: WHITE, alpha: 0.65 });

  // Scale texture
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      g.ellipse(-22 + col * 10, -9 + row * 7, 4, 3).stroke({
        color: c.accent,
        alpha: 0.2,
        width: 0.7,
      });
    }
  }
}

// ── SHRIMP — segmented carapace, fan tail, long antennae, pleopods ─────────────
function drawShrimp(g: Graphics, tp: number, c: FishColors): void {
  const ts = Math.sin(tp);

  // Abdomen segments (6)
  for (let s = 0; s < 6; s++) {
    const sx = -4 - s * 7;
    const sy = Math.sin(tp * 0.6 + s * 0.3) * 1.5;
    const w = 9 - s * 0.7;
    g.ellipse(sx, sy, w, 5.5 - s * 0.2).fill({ color: c.body, alpha: 0.78 });
    if (s > 0)
      g.moveTo(sx - 3.5, sy - 4)
        .lineTo(sx - 3.5, sy + 4)
        .stroke({ color: c.accent, alpha: 0.28, width: 0.7 });
  }

  // Carapace (cephalothorax)
  g.moveTo(10, 0)
    .bezierCurveTo(12, -10, 6, -13, -2, -11)
    .bezierCurveTo(-8, -9, -4, 0, 0, 0)
    .fill({ color: c.body, alpha: 0.85 });
  g.moveTo(0, 0)
    .bezierCurveTo(-4, 9, 4, 11, 10, 7)
    .bezierCurveTo(14, 4, 12, 0, 10, 0)
    .fill({ color: c.body, alpha: 0.85 });
  g.moveTo(4, -11)
    .bezierCurveTo(7, -7, 5, -2, 2, 0)
    .stroke({ color: WHITE, alpha: 0.22, width: 1.5 });

  // Rostrum
  g.moveTo(10, -1)
    .lineTo(22, -5)
    .lineTo(11, -0.5)
    .fill({ color: c.accent, alpha: 0.92 });

  // Antennae (long pair)
  const as = ts * 5;
  g.moveTo(14, -3)
    .bezierCurveTo(22, -9 + as, 30, -13 + as, 40, -11 + as * 0.6)
    .stroke({ color: c.accent, alpha: 0.68, width: 0.8 });
  g.moveTo(14, -2)
    .bezierCurveTo(22, -5 + as * 0.8, 32, -7 + as * 0.8, 42, -6 + as * 0.5)
    .stroke({ color: c.accent, alpha: 0.5, width: 0.6 });
  // Antennules (short)
  g.moveTo(14, -1)
    .lineTo(20, -6)
    .stroke({ color: c.accent, alpha: 0.48, width: 0.6 });
  g.moveTo(14, 1)
    .lineTo(20, 5)
    .stroke({ color: c.accent, alpha: 0.48, width: 0.6 });

  // Pleopods / walking legs (5 pairs)
  for (let l = 0; l < 5; l++) {
    const lx = 2 - l * 4;
    const lsw = Math.sin(tp + l * 0.5) * 4;
    g.moveTo(lx, 5)
      .lineTo(lx - 1 + lsw * 0.4, 11 + lsw)
      .stroke({ color: c.fin, alpha: 0.68, width: 0.9 });
    g.moveTo(lx - 1 + lsw * 0.4, 11 + lsw)
      .lineTo(lx - 2 + lsw * 0.6, 17 + lsw * 0.6)
      .stroke({ color: c.fin, alpha: 0.48, width: 0.7 });
  }

  // Fan tail (uropods + telson)
  const tailX = -46;
  const tailY = Math.sin(tp * 0.6 + 1.5) * 1.5;
  for (let f = 0; f < 5; f++) {
    const fa = ((f - 2) / 4) * 0.85;
    const fx = tailX + Math.cos(Math.PI + fa) * 13;
    const fy = tailY + Math.sin(Math.PI + fa) * 8 + ts * 2;
    g.moveTo(tailX, tailY)
      .lineTo(fx, fy)
      .stroke({ color: c.fin, alpha: 0.72, width: 2.2, cap: "round" });
    g.circle(fx, fy, 2.2).fill({ color: c.body, alpha: 0.62 });
  }

  // Eye (stalked)
  g.moveTo(12, -3)
    .lineTo(15, -8)
    .stroke({ color: c.accent, alpha: 0.6, width: 1 });
  g.circle(15, -9, 3.2).fill({ color: WHITE, alpha: 0.88 });
  g.circle(15.4, -9.5, 2).fill({ color: c.eye });
  g.circle(14.8, -10.3, 0.7).fill({ color: WHITE, alpha: 0.72 });
}

// ═════════════════════════════════════════════════════════════════════════════
// PLANT DRAWING FUNCTIONS  (world coordinates, called from plantsGfx)
// ═════════════════════════════════════════════════════════════════════════════

// ── Kelp — golden-brown segmented stalk with air bladders and wide fronds ────
function drawKelp(
  g: Graphics,
  x: number,
  baseY: number,
  phase: number,
  height: number,
): void {
  const STALK = 0x8b7355;
  const BLADE = 0x4a7c3f;
  const BLADDER = 0xa08040;
  const segments = Math.floor(height / 32);
  let px = x,
    py = baseY;

  for (let s = 0; s < segments; s++) {
    const sway = Math.sin(phase + s * 0.55) * (6 + s * 1.8);
    const nx = px + sway;
    const ny = py - 32;

    g.moveTo(px, py)
      .lineTo(nx, ny)
      .stroke({ color: STALK, alpha: 0.9, width: 3.5 });

    // Air bladder (pneumatocyst) every 2 segments
    if (s % 2 === 0) {
      g.ellipse(nx, ny + 10, 6, 9).fill({ color: BLADDER, alpha: 0.85 });
      g.ellipse(nx - 1, ny + 8, 2.5, 3.5).fill({ color: WHITE, alpha: 0.25 });

      // Wide blade off bladder
      const bd = s % 4 === 0 ? 1 : -1;
      const bladePhase = Math.sin(phase * 0.8 + s) * 0.12;
      g.moveTo(nx, ny + 6)
        .bezierCurveTo(
          nx + bd * 14,
          ny - 2 + bladePhase * 20,
          nx + bd * 26,
          ny + 2,
          nx + bd * 22,
          ny + 14,
        )
        .bezierCurveTo(nx + bd * 18, ny + 22, nx + bd * 8, ny + 18, nx, ny + 8)
        .fill({ color: BLADE, alpha: 0.72 });
    }
    px = nx;
    py = ny;
  }
  // Top crown blade
  g.moveTo(px, py)
    .bezierCurveTo(px + 22, py - 18, px + 30, py - 28, px + 16, py - 38)
    .bezierCurveTo(px, py - 44, px - 10, py - 28, px, py)
    .fill({ color: BLADE, alpha: 0.78 });
}

// ── Sea Fan — recursive branching gorgonian coral ────────────────────────────
function drawSeaFanBranch(
  g: Graphics,
  bx: number,
  by: number,
  angle: number,
  len: number,
  depth: number,
  phase: number,
  color: number,
  sign: number,
): void {
  if (depth === 0 || len < 3.5) return;
  const sway =
    Math.sin(phase * 0.55 + depth * 1.4 + sign * 0.9) * (0.06 + depth * 0.016);
  const nx = bx + Math.cos(angle + sway) * len;
  const ny = by + Math.sin(angle + sway) * len;
  const alpha = Math.min(1, 0.52 + (5 - depth) * 0.1);
  const width = Math.max(0.5, depth * 0.65);
  g.moveTo(bx, by).lineTo(nx, ny).stroke({ color, alpha, width, cap: "round" });
  if (depth < 4)
    g.circle(nx, ny, Math.max(0.8, depth * 0.5)).fill({
      color,
      alpha: alpha * 0.75,
    });
  const spread = 0.3 + (5 - depth) * 0.04;
  drawSeaFanBranch(
    g,
    nx,
    ny,
    angle - spread,
    len * 0.64,
    depth - 1,
    phase,
    color,
    -sign,
  );
  drawSeaFanBranch(
    g,
    nx,
    ny,
    angle + spread,
    len * 0.64,
    depth - 1,
    phase,
    color,
    sign,
  );
}

function drawSeaFan(
  g: Graphics,
  x: number,
  baseY: number,
  phase: number,
  height: number,
  color: number,
): void {
  // 3 main branches spreading upward
  const trunk = height * 0.28;
  g.moveTo(x, baseY)
    .lineTo(x, baseY - trunk * 0.5)
    .stroke({ color, alpha: 0.85, width: 3.5, cap: "round" });
  drawSeaFanBranch(
    g,
    x,
    baseY - trunk * 0.5,
    -Math.PI / 2 - 0.22,
    trunk,
    4,
    phase,
    color,
    1,
  );
  drawSeaFanBranch(
    g,
    x,
    baseY - trunk * 0.5,
    -Math.PI / 2,
    trunk,
    4,
    phase,
    color,
    -1,
  );
  drawSeaFanBranch(
    g,
    x,
    baseY - trunk * 0.5,
    -Math.PI / 2 + 0.22,
    trunk,
    4,
    phase,
    color,
    1,
  );
}

// ── Anemone — tentacled base creature ────────────────────────────────────────
function drawAnemone(
  g: Graphics,
  x: number,
  baseY: number,
  phase: number,
  tentCount: number,
  height: number,
  color: number,
  tipColor: number,
): void {
  // Base disc
  g.ellipse(x, baseY, 20, 7).fill({ color, alpha: 0.92 });
  g.ellipse(x, baseY - 1, 12, 4).fill({ color: WHITE, alpha: 0.18 });

  for (let t = 0; t < tentCount; t++) {
    const spread = (t / tentCount - 0.5) * Math.PI * 0.85;
    const tPhase = phase + t * 0.42;
    const baseX = x + Math.sin(spread) * 16;
    const sw1 = Math.sin(tPhase) * 9;
    const sw2 = Math.sin(tPhase * 1.3 + 0.5) * 7;
    const cx1 = baseX + sw1;
    const cy1 = baseY - height * 0.38;
    const cx2 = baseX + sw2;
    const cy2 = baseY - height * 0.72;
    const ex = baseX + Math.sin(tPhase * 0.7) * 11;
    const ey = baseY - height;

    // Glow pass
    g.moveTo(baseX, baseY - 5)
      .bezierCurveTo(cx1, cy1, cx2, cy2, ex, ey)
      .stroke({ color, alpha: 0.14, width: 6 });
    // Tentacle
    g.moveTo(baseX, baseY - 5)
      .bezierCurveTo(cx1, cy1, cx2, cy2, ex, ey)
      .stroke({ color, alpha: 0.82, width: 2, cap: "round" });
    // Tip bulb
    g.circle(ex, ey, 3.2).fill({ color: tipColor, alpha: 0.92 });
    g.circle(ex - 0.8, ey - 0.8, 1).fill({ color: WHITE, alpha: 0.55 });
  }
}

// ── Bubble Algae — spherical green bubbles on branching stem ─────────────────
function drawBubbleAlgae(
  g: Graphics,
  x: number,
  baseY: number,
  phase: number,
  height: number,
): void {
  const STEM = 0x2d6a4f;
  const BUBBLE = 0x52b788;
  const segments = Math.floor(height / 26);
  let px = x,
    py = baseY;

  for (let s = 0; s < segments; s++) {
    const sway = Math.sin(phase + s * 0.85) * 5;
    const nx = px + sway;
    const ny = py - 26;
    g.moveTo(px, py)
      .lineTo(nx, ny)
      .stroke({ color: STEM, alpha: 0.82, width: 2 });

    // Branch bubble clusters
    const bd = s % 2 === 0 ? 1 : -1;
    const bSize = 7 + (s % 3) * 3.5;
    const bx = nx + bd * (bSize + 3);
    g.circle(bx, ny, bSize).fill({ color: BUBBLE, alpha: 0.55 });
    g.circle(bx, ny, bSize).stroke({
      color: 0x74c69d,
      alpha: 0.45,
      width: 1.2,
    });
    g.circle(bx - bSize * 0.3, ny - bSize * 0.3, bSize * 0.28).fill({
      color: WHITE,
      alpha: 0.42,
    });

    // Extra small bubble
    if (s % 3 === 0) {
      g.circle(nx + bd * 4, ny + 8, 4).fill({ color: BUBBLE, alpha: 0.45 });
    }
    px = nx;
    py = ny;
  }
}

// ── Sea Grass — short dense ribbon blades ────────────────────────────────────
function drawSeaGrass(
  g: Graphics,
  x: number,
  baseY: number,
  phase: number,
  count: number,
  height: number,
): void {
  for (let b = 0; b < count; b++) {
    const bx = x + (b - count / 2) * 7;
    const bPhase = phase + b * 0.32;
    const tipX = bx + Math.sin(bPhase) * height * 0.18;
    const midX = bx + Math.sin(bPhase * 0.7) * 4;
    const col = b % 3 === 0 ? 0x52b788 : b % 3 === 1 ? 0x40916c : 0x74c69d;
    const h = height * (0.8 + ((b * 0.13) % 0.4));
    g.moveTo(bx, baseY)
      .bezierCurveTo(
        midX,
        baseY - h * 0.5,
        tipX - 2,
        baseY - h * 0.82,
        tipX,
        baseY - h,
      )
      .stroke({ color: col, alpha: 0.88, width: 2.8, cap: "round" });
    // Blade midrib
    g.moveTo(bx, baseY)
      .bezierCurveTo(
        midX * 0.5,
        baseY - h * 0.5,
        tipX * 0.5 - 1,
        baseY - h * 0.82,
        tipX * 0.5,
        baseY - h,
      )
      .stroke({ color: 0x2d6a4f, alpha: 0.25, width: 0.8 });
  }
}

// ── Fern — branching plant with alternating pinnate fronds ───────────────────
function drawFern(
  g: Graphics,
  x: number,
  baseY: number,
  phase: number,
  height: number,
  color: number,
): void {
  const segments = Math.floor(height / 28);
  let px = x,
    py = baseY;

  for (let s = 0; s < segments; s++) {
    const sway = Math.sin(phase + s * 0.6) * (5 + s * 1.5);
    const nx = px + sway;
    const ny = py - 28;
    g.moveTo(px, py).lineTo(nx, ny).stroke({ color, alpha: 0.85, width: 2.2 });

    const fLen = 18 + s * 1.8;
    const fOff = Math.sin(phase * 0.9 + s * 1.1) * 0.12;

    // Left frond
    const lfx = nx - fLen * Math.cos(fOff);
    const lfy = ny - fLen * 0.35;
    g.moveTo(nx, ny)
      .bezierCurveTo(nx - fLen * 0.4, ny - 3, lfx + 4, lfy + 2, lfx, lfy)
      .stroke({ color, alpha: 0.68, width: 1.6, cap: "round" });
    // Pinnules on left frond (small sub-fronds)
    for (let p = 1; p <= 3; p++) {
      const t = p / 4;
      const pfx = nx + (lfx - nx) * t;
      const pfy = ny + (lfy - ny) * t;
      const pLen = fLen * 0.22 * (1 - t * 0.4);
      g.moveTo(pfx, pfy)
        .lineTo(pfx - pLen, pfy - pLen * 0.5)
        .stroke({ color, alpha: 0.45, width: 1, cap: "round" });
    }
    // Right frond (mirror)
    const rfx = nx + fLen * Math.cos(fOff);
    const rfy = ny - fLen * 0.35;
    g.moveTo(nx, ny)
      .bezierCurveTo(nx + fLen * 0.4, ny - 3, rfx - 4, rfy + 2, rfx, rfy)
      .stroke({ color, alpha: 0.68, width: 1.6, cap: "round" });
    for (let p = 1; p <= 3; p++) {
      const t = p / 4;
      const pfx = nx + (rfx - nx) * t;
      const pfy = ny + (rfy - ny) * t;
      const pLen = fLen * 0.22 * (1 - t * 0.4);
      g.moveTo(pfx, pfy)
        .lineTo(pfx + pLen, pfy - pLen * 0.5)
        .stroke({ color, alpha: 0.45, width: 1, cap: "round" });
    }
    px = nx;
    py = ny;
  }
  // Crown tips
  for (let i = 0; i < 3; i++) {
    const ta = -Math.PI / 2 + (i - 1) * 0.38 + Math.sin(phase) * 0.08;
    g.moveTo(px, py)
      .bezierCurveTo(
        px + Math.cos(ta) * 10,
        py + Math.sin(ta) * 10,
        px + Math.cos(ta) * 18,
        py + Math.sin(ta) * 18,
        px + Math.cos(ta) * 22,
        py + Math.sin(ta) * 22,
      )
      .stroke({ color, alpha: 0.72, width: 2, cap: "round" });
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// DECORATION DRAWING FUNCTIONS (world coordinates, drawn into decoGfx)
// ═════════════════════════════════════════════════════════════════════════════

// ── Rocks ─────────────────────────────────────────────────────────────────────
function drawRock(
  g: Graphics,
  x: number,
  y: number,
  d: DecoDef,
  time: number,
): void {
  const { color, scale: s } = d;

  switch (Math.round(d.phase) % 4) {
    case 0: // Smooth rounded boulder
      g.ellipse(x, y, 30 * s, 22 * s).fill({ color, alpha: 1 });
      g.ellipse(x - 6 * s, y - 7 * s, 18 * s, 12 * s).fill({
        color: WHITE,
        alpha: 0.12,
      });
      g.ellipse(x + 4 * s, y + 6 * s, 8 * s, 4 * s).fill({
        color: DARK,
        alpha: 0.12,
      });
      break;
    case 1: // Jagged rock
      g.poly([
        x - 26 * s,
        y,
        x - 18 * s,
        y - 24 * s,
        x - 6 * s,
        y - 32 * s,
        x + 8 * s,
        y - 26 * s,
        x + 20 * s,
        y - 14 * s,
        x + 24 * s,
        y,
      ]).fill({ color, alpha: 1 });
      g.poly([
        x - 18 * s,
        y - 24 * s,
        x - 6 * s,
        y - 32 * s,
        x + 2 * s,
        y - 20 * s,
      ]).fill({ color: WHITE, alpha: 0.1 });
      break;
    case 2: // Flat slab
      g.ellipse(x, y, 40 * s, 12 * s).fill({ color, alpha: 1 });
      g.ellipse(x - 10 * s, y - 4 * s, 24 * s, 5 * s).fill({
        color: WHITE,
        alpha: 0.1,
      });
      break;
    case 3: // Pebble cluster
      g.circle(x, y, 16 * s).fill({ color, alpha: 1 });
      g.circle(x + 20 * s, y + 4 * s, 11 * s).fill({
        color: color - 0x101010,
        alpha: 1,
      });
      g.circle(x - 16 * s, y + 5 * s, 9 * s).fill({ color, alpha: 1 });
      g.circle(x + 6 * s, y + 10 * s, 7 * s).fill({
        color: color - 0x080808,
        alpha: 1,
      });
      break;
  }
  // Algae patch on top of every rock
  const topY = y - (d.phase % 4 === 2 ? 12 : 24) * s;
  const algaeWave = Math.sin(time * 0.4 + d.nx * 10) * 2;
  g.ellipse(x - 4 * s, topY + algaeWave, 8 * s, 3.5 * s).fill({
    color: 0x27ae60,
    alpha: 0.6,
  });
  g.ellipse(x + 5 * s, topY + 1 + algaeWave, 5 * s, 2.5 * s).fill({
    color: 0x2ecc71,
    alpha: 0.5,
  });
  // Short algae tufts
  for (let i = 0; i < 3; i++) {
    const ax = x + (i - 1) * 6 * s;
    const sw = Math.sin(time * 0.9 + i * 1.3) * 3;
    g.moveTo(ax, topY)
      .bezierCurveTo(
        ax + sw,
        topY - 10,
        ax + sw + 2,
        topY - 16,
        ax + sw,
        topY - 20,
      )
      .stroke({ color: 0x27ae60, alpha: 0.82, width: 1.8, cap: "round" });
  }
}

// ── Starfish ──────────────────────────────────────────────────────────────────
function drawStarfish(
  g: Graphics,
  x: number,
  y: number,
  phase: number,
  color: number,
): void {
  const ARMS = 5;
  const innerR = 8;
  const outerR = 26;

  for (let a = 0; a < ARMS; a++) {
    const outerAngle = (a / ARMS) * Math.PI * 2 - Math.PI / 2 + phase * 0.08;
    const innerAngle1 = outerAngle - Math.PI / ARMS;
    const innerAngle2 = outerAngle + Math.PI / ARMS;
    const ax = x + Math.cos(outerAngle) * outerR;
    const ay = y + Math.sin(outerAngle) * outerR;
    const ix1 = x + Math.cos(innerAngle1) * innerR;
    const iy1 = y + Math.sin(innerAngle1) * innerR;
    const ix2 = x + Math.cos(innerAngle2) * innerR;
    const iy2 = y + Math.sin(innerAngle2) * innerR;

    // Arm with tapered bezier shape
    g.moveTo(ix1, iy1)
      .bezierCurveTo(
        ix1 + (ax - ix1) * 0.3,
        iy1 + (ay - iy1) * 0.3,
        ax - 2,
        ay - 2,
        ax,
        ay,
      )
      .bezierCurveTo(
        ax + 2,
        ay + 2,
        ix2 + (ax - ix2) * 0.3,
        iy2 + (ay - iy2) * 0.3,
        ix2,
        iy2,
      )
      .fill({ color, alpha: 0.92 });

    // Arm ridge line
    g.moveTo(
      x + Math.cos(outerAngle) * innerR * 1.2,
      y + Math.sin(outerAngle) * innerR * 1.2,
    )
      .lineTo(ax, ay)
      .stroke({ color: WHITE, alpha: 0.18, width: 1.5 });

    // Texture dots on arm
    for (let d = 1; d <= 3; d++) {
      const t = d / 4;
      const dr = innerR + (outerR - innerR) * t;
      g.circle(
        x + Math.cos(outerAngle) * dr,
        y + Math.sin(outerAngle) * dr,
        1.8,
      ).fill({ color: WHITE, alpha: 0.28 });
    }
  }
  // Center disc
  g.circle(x, y, innerR * 1.25).fill({ color, alpha: 1 });
  g.circle(x, y, innerR * 0.55).fill({ color: WHITE, alpha: 0.2 });
  for (let i = 0; i < 5; i++) {
    const ca = (i / 5) * Math.PI * 2 + phase * 0.12;
    g.circle(x + Math.cos(ca) * 4, y + Math.sin(ca) * 4, 1.4).fill({
      color: WHITE,
      alpha: 0.32,
    });
  }
}

// ── Sea Urchin ────────────────────────────────────────────────────────────────
function drawSeaUrchin(
  g: Graphics,
  x: number,
  y: number,
  phase: number,
  color: number,
): void {
  const r = 13;
  const SPINE_COUNT = 22;

  for (let i = 0; i < SPINE_COUNT; i++) {
    const angle = (i / SPINE_COUNT) * Math.PI * 2;
    const wobble = Math.sin(phase * 0.5 + i * 0.9) * 1.8;
    const sx = x + Math.cos(angle) * r;
    const sy = y + Math.sin(angle) * r;
    const sx2 = x + Math.cos(angle + wobble * 0.025) * (r + 12 + wobble);
    const sy2 = y + Math.sin(angle + wobble * 0.025) * (r + 12 + wobble);
    g.moveTo(sx, sy)
      .lineTo(sx2, sy2)
      .stroke({ color, alpha: 0.82, width: 0.9 });
    // White spine tip
    g.circle(sx2, sy2, 1).fill({ color: WHITE, alpha: 0.45 });
  }
  g.circle(x, y, r).fill({ color, alpha: 1 });
  // Plate texture
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const da = (col / 5 + row * 0.1) * Math.PI * 2;
      const dr = r * (0.38 + row * 0.18);
      g.circle(x + Math.cos(da) * dr, y + Math.sin(da) * dr, 1.5).fill({
        color: WHITE,
        alpha: 0.2,
      });
    }
  }
  g.circle(x, y, 4).fill({ color: WHITE, alpha: 0.15 });
}

// ── Clam Shell ────────────────────────────────────────────────────────────────
function drawShell(g: Graphics, x: number, y: number, color: number): void {
  const LT = WHITE;
  // Top half shell
  g.moveTo(x - 20, y)
    .bezierCurveTo(x - 18, y - 16, x, y - 20, x + 20, y - 5)
    .bezierCurveTo(x + 18, y + 4, x, y + 2, x - 20, y)
    .fill({ color, alpha: 0.92 });
  // Inner lighter face
  g.moveTo(x - 14, y - 2)
    .bezierCurveTo(x - 12, y - 12, x, y - 15, x + 14, y - 4)
    .bezierCurveTo(x + 12, y + 1, x, y + 1, x - 14, y - 2)
    .fill({ color: LT, alpha: 0.2 });
  // Ribs (radial lines)
  for (let r = 0; r < 6; r++) {
    const t = r / 5;
    const rx = x - 18 + t * 38;
    const ry = y - 1;
    const ry2 = y - 16 + Math.abs(t - 0.5) * 16;
    g.moveTo(rx, ry)
      .lineTo(rx - 1, ry2)
      .stroke({ color: color - 0x181818, alpha: 0.3, width: 1 });
  }
  // Hinge (umbo)
  g.circle(x, y - 1, 4.5).fill({ color: color - 0x101010, alpha: 0.8 });
  g.circle(x - 1, y - 2, 1.8).fill({ color: WHITE, alpha: 0.4 });
  // Pearl (sometimes)
  g.circle(x + 4, y - 7, 3.5).fill({ color: WHITE, alpha: 0.8 });
  g.circle(x + 3, y - 8, 1.2).fill({ color: 0xdde8f0, alpha: 0.7 });
}

// ── Anchor ────────────────────────────────────────────────────────────────────
function drawAnchor(g: Graphics, x: number, y: number, time: number): void {
  const IRON = 0x546e7a;
  const RUST = 0x8b4513;

  // Chain links (above anchor)
  for (let c = 0; c < 6; c++) {
    const cy = y - 60 + c * 9;
    const cx = x + Math.sin(time * 0.3 + c * 0.5) * 2;
    g.ellipse(cx, cy, 4, 2.5).stroke({ color: IRON, alpha: 0.65, width: 1.8 });
  }
  // Top ring
  g.circle(x, y - 54, 9).stroke({ color: IRON, alpha: 0.9, width: 3.5 });
  // Shaft
  g.moveTo(x, y - 45)
    .lineTo(x, y + 22)
    .stroke({ color: IRON, alpha: 0.92, width: 6 });
  // Crossbar (stock)
  g.moveTo(x - 22, y - 32)
    .lineTo(x + 22, y - 32)
    .stroke({ color: IRON, alpha: 0.92, width: 4.5 });
  g.circle(x - 22, y - 32, 4.5).fill({ color: IRON });
  g.circle(x + 22, y - 32, 4.5).fill({ color: IRON });
  // Upper flukes
  g.moveTo(x, y + 22)
    .bezierCurveTo(x - 4, y + 30, x - 18, y + 32, x - 20, y + 24)
    .bezierCurveTo(x - 22, y + 16, x - 14, y + 14, x - 6, y + 18)
    .fill({ color: IRON, alpha: 0.9 });
  g.moveTo(x, y + 22)
    .bezierCurveTo(x + 4, y + 30, x + 18, y + 32, x + 20, y + 24)
    .bezierCurveTo(x + 22, y + 16, x + 14, y + 14, x + 6, y + 18)
    .fill({ color: IRON, alpha: 0.9 });
  // Rust patches + algae
  g.circle(x + 2, y - 12, 3.5).fill({ color: RUST, alpha: 0.45 });
  g.circle(x - 1, y + 6, 2.5).fill({ color: 0x2ecc71, alpha: 0.55 });
  g.circle(x + 3, y - 38, 2).fill({ color: RUST, alpha: 0.35 });
}

// ── Treasure Chest ────────────────────────────────────────────────────────────
function drawTreasureChest(
  g: Graphics,
  x: number,
  y: number,
  openAmt: number,
): void {
  const WOOD = 0x8b5e3c;
  const DKWOOD = 0x5a3d22;
  const GOLD = 0xf9e2af;
  const BRIGHT = 0xffd700;

  // Box body
  g.rect(x - 26, y - 16, 52, 30).fill({ color: WOOD });
  for (let l = 0; l < 4; l++) {
    g.moveTo(x - 26, y - 9 + l * 7)
      .lineTo(x + 26, y - 9 + l * 7)
      .stroke({ color: DKWOOD, alpha: 0.3, width: 0.8 });
  }
  // Metal bands
  g.rect(x - 26, y - 16, 52, 5).fill({ color: GOLD, alpha: 0.82 });
  g.rect(x - 26, y + 5, 52, 4).fill({ color: GOLD, alpha: 0.78 });
  // Lock plate
  g.rect(x - 7, y - 12, 14, 12).fill({ color: GOLD, alpha: 0.78 });
  g.circle(x, y - 7, 4.5).fill({ color: DKWOOD });
  g.circle(x, y - 7, 2.5).fill({ color: GOLD, alpha: 0.6 });
  // Corner rivets
  g.circle(x - 22, y - 13, 2.5).fill({ color: GOLD });
  g.circle(x + 22, y - 13, 2.5).fill({ color: GOLD });
  g.circle(x - 22, y + 9, 2.5).fill({ color: GOLD });
  g.circle(x + 22, y + 9, 2.5).fill({ color: GOLD });

  // LID (hinged, opens upward)
  const lidLift = openAmt * 28;
  const lidCurve = openAmt * 8;
  g.moveTo(x - 26, y - 16)
    .lineTo(x - 26, y - 16 - lidLift * 0.25 - 12)
    .bezierCurveTo(
      x - 14,
      y - 28 - lidLift - lidCurve,
      x + 14,
      y - 28 - lidLift - lidCurve,
      x + 26,
      y - 16 - lidLift * 0.25 - 12,
    )
    .lineTo(x + 26, y - 16)
    .fill({ color: WOOD });
  g.moveTo(x - 26, y - 16 - lidLift * 0.25 - 10)
    .lineTo(x + 26, y - 16 - lidLift * 0.25 - 10)
    .stroke({ color: GOLD, alpha: 0.72, width: 3 });

  // Spilling coins + gems when open
  if (openAmt > 0.2) {
    const a = openAmt;
    const fallCoins: [number, number, number, number][] = [
      [x - 10, y - 16 - openAmt * 5, 4.5, BRIGHT],
      [x + 6, y - 16 - openAmt * 3, 3.8, BRIGHT],
      [x - 2, y - 16 - openAmt * 7, 5.0, BRIGHT],
      [x + 16, y - 14 - openAmt * 2, 3.2, BRIGHT],
      [x - 18, y - 13 - openAmt * 4, 3.5, BRIGHT],
    ];
    for (const [cx, cy, cr, cc] of fallCoins) {
      g.circle(cx, cy, cr).fill({ color: cc, alpha: a * 0.92 });
      g.circle(cx - 1, cy - 1, cr * 0.38).fill({
        color: WHITE,
        alpha: a * 0.55,
      });
    }
    // Gems
    g.circle(x + 12, y - 16 - openAmt * 4, 4).fill({
      color: 0xff4757,
      alpha: a * 0.95,
    });
    g.circle(x - 12, y - 15 - openAmt * 3, 3.5).fill({
      color: 0x3498db,
      alpha: a * 0.95,
    });
    g.circle(x + 4, y - 17 - openAmt * 6, 3).fill({
      color: MAUVE,
      alpha: a * 0.95,
    });
    // Gem shine
    g.circle(x + 11, y - 17 - openAmt * 4, 1.2).fill({
      color: WHITE,
      alpha: a * 0.7,
    });
    g.circle(x - 13, y - 16 - openAmt * 3, 1.0).fill({
      color: WHITE,
      alpha: a * 0.7,
    });
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// FISH AGENT
// ═════════════════════════════════════════════════════════════════════════════

class FishAgent extends Container {
  private readonly gfx = new Graphics();

  vx = 0;
  vy = 0;
  maxSpeed = 0;
  wobblePhase = 0;
  wobbleSpeed = 0;
  wobbleAmp = 0;
  tailPhase = 0;
  tailSpeed = 0;
  propPhase = 0;
  leanPhase = 0;
  facingRight = true;

  readonly fishType: FishType;
  readonly colors: FishColors;
  readonly baseScale: number;

  constructor(type: FishType, colors: FishColors, scale: number) {
    super();
    this.fishType = type;
    this.colors = colors;
    this.baseScale = scale;
    this.addChild(this.gfx);
  }

  redraw(): void {
    this.gfx.clear();
    const c = this.colors;
    const tp = this.tailPhase;
    switch (this.fishType) {
      case FishType.SARDINE:
        drawSardine(this.gfx, tp, c);
        break;
      case FishType.TROPICAL:
        drawTropical(this.gfx, tp, c);
        break;
      case FishType.ANGEL:
        drawAngel(this.gfx, tp, c);
        break;
      case FishType.PUFFER:
        drawPuffer(this.gfx, tp, c);
        break;
      case FishType.SHARK:
        drawShark(this.gfx, tp, c);
        break;
      case FishType.MANTA:
        drawManta(this.gfx, tp, c);
        break;
      case FishType.SUBMARINE:
        drawSubmarine(this.gfx, this.propPhase, c);
        break;
      case FishType.PIRANHA:
        drawPiranha(this.gfx, tp, c);
        break;
      case FishType.HAMMERHEAD:
        drawHammerhead(this.gfx, tp, c);
        break;
      case FishType.JELLYFISH:
        drawJellyfish(this.gfx, tp, c);
        break;
      case FishType.SEA_SNAKE:
        drawSeaSnake(this.gfx, tp, c);
        break;
      case FishType.CROCODILE:
        drawCrocodile(this.gfx, tp, c);
        break;
      case FishType.SHRIMP:
        drawShrimp(this.gfx, tp, c);
        break;
    }
    this.scale.set(
      this.baseScale * (this.facingRight ? 1 : -1),
      this.baseScale,
    );
    const leanAmt =
      this.fishType === FishType.SUBMARINE || this.fishType === FishType.MANTA
        ? 0.04
        : 0.1;
    this.rotation = Math.sin(this.leanPhase) * leanAmt;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT TYPES
// ═════════════════════════════════════════════════════════════════════════════

interface Bubble {
  x: number;
  y: number;
  vy: number;
  r: number;
  alpha: number;
  alphaPhase: number;
  wobblePhase: number;
  wobbleAmp: number;
}

// ── Crab drawing (top-down view, front = +X, legs along Y axis) ───────────────
function drawCrab(
  g: Graphics,
  cx: number,
  cy: number,
  phase: number,
  facingRight: boolean,
  sc: number,
  c: FishColors,
): void {
  const fx = facingRight ? sc : -sc;
  const px = (lx: number) => cx + lx * fx;
  const py = (ly: number) => cy + ly * sc;

  const clawSnap = 0.28 + 0.22 * Math.sin(phase * 0.55);

  // Walking legs — drawn before body so carapace covers roots
  const legXs = [-13, -5, 4, 12] as const;
  for (let i = 0; i < 4; i++) {
    const lx = legXs[i];
    const sw = Math.sin(phase + i * 0.85) * 9;
    for (const side of [-1, 1] as const) {
      const sy = side * 15;
      const ky1 = side * (24 - sw * 0.4 * side);
      const ky2 = side * (33 - sw * 0.7 * side);
      g.moveTo(px(lx), py(sy))
        .lineTo(px(lx + sw * 0.15), py(ky1))
        .stroke({ color: c.body, alpha: 0.9, width: 2.6 * sc, cap: "round" });
      g.moveTo(px(lx + sw * 0.15), py(ky1))
        .lineTo(px(lx + sw * 0.3), py(ky2))
        .stroke({
          color: c.accent,
          alpha: 0.78,
          width: 1.7 * sc,
          cap: "round",
        });
      g.circle(px(lx + sw * 0.3), py(ky2), 1.4 * sc).fill({
        color: c.accent,
        alpha: 0.7,
      });
    }
  }

  // Carapace
  g.ellipse(px(0), py(0), 22 * sc, 17 * sc).fill({ color: c.body });
  for (let r = 1; r <= 3; r++) {
    g.ellipse(
      px(0),
      py(0),
      22 * sc * (1 - r * 0.22),
      17 * sc * (1 - r * 0.22),
    ).stroke({ color: c.accent, alpha: 0.2, width: 0.7 });
  }
  g.moveTo(px(8), py(0))
    .lineTo(px(-7), py(0))
    .stroke({ color: c.accent, alpha: 0.16, width: 0.8 });
  g.ellipse(px(-4), py(-4), 11 * sc, 7 * sc).fill({ color: WHITE, alpha: 0.1 });

  // Chelipeds (claws) — one per side
  for (const side of [-1, 1] as const) {
    const s12 = side * 12;
    const s14 = side * 14;
    const s19 = side * 19;
    const s24 = side * 24;
    const s27 = side * 27;
    g.moveTo(px(14), py(s12))
      .bezierCurveTo(px(24), py(s14), px(32), py(s19), px(33), py(s24))
      .bezierCurveTo(px(33), py(s27), px(30), py(s27), px(28), py(s24))
      .bezierCurveTo(px(23), py(s19), px(18), py(s14), px(14), py(s12))
      .fill({ color: c.body, alpha: 0.95 });
    g.moveTo(px(33), py(s24))
      .lineTo(px(38 + clawSnap * 5), py(side * 20))
      .stroke({ color: c.fin, alpha: 0.85, width: 2 * sc, cap: "round" });
    g.moveTo(px(33), py(s24))
      .lineTo(px(35), py(side * (30 + clawSnap * 4)))
      .stroke({ color: c.fin, alpha: 0.85, width: 2 * sc, cap: "round" });
  }

  // Eye stalks
  for (const side of [-1, 1] as const) {
    const ey = side * 14;
    g.moveTo(px(14), py(side * 7))
      .lineTo(px(20), py(ey))
      .stroke({ color: c.accent, alpha: 0.72, width: 1.1 * sc, cap: "round" });
    g.circle(px(20), py(ey), 3.6 * sc).fill({ color: WHITE });
    g.circle(px(20.5), py(side * 14.5), 2.3 * sc).fill({ color: c.eye });
    g.circle(px(20), py(side * 15.3), 0.7 * sc).fill({
      color: WHITE,
      alpha: 0.65,
    });
  }
}

// ── Constants ──────────────────────────────────────────────────────────────────
const BUBBLE_COUNT = 80;
const PARTICLE_COUNT = 55;
const PLANKTON_PER_SWARM = 38;
const PLANKTON_SWARM_COUNT = 6;

interface Crab {
  nx: number;
  dir: 1 | -1;
  speed: number;
  phase: number;
  phaseSpeed: number;
  pauseTimer: number;
  scale: number;
  colors: FishColors;
}

interface PlanktonMember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  phaseSpeed: number;
  r: number;
  shape: 0 | 1 | 2; // 0=copepod  1=radiolarian  2=dinoflagellate
}

interface PlanktonSwarm {
  cx: number;
  cy: number;
  vcx: number;
  vcy: number;
  color: number;
  glowColor: number;
  members: PlanktonMember[];
}

// ═════════════════════════════════════════════════════════════════════════════
// AQUARIUM SCREEN
// ═════════════════════════════════════════════════════════════════════════════

export class AquariumScreen extends Container {
  public static assetBundles = ["main"];

  // Layers back → front
  private readonly bgGfx = new Graphics();
  private readonly lightRayGfx = new Graphics();
  private readonly causticGfx = new Graphics();
  private readonly sandGfx = new Graphics();
  private readonly decoGfx = new Graphics(); // rocks, starfish, shells, anchor, chest
  private readonly plantsGfx = new Graphics(); // all plants
  private readonly crabGfx = new Graphics();
  private readonly particleGfx = new Graphics();
  private readonly planktonGfx = new Graphics();
  private readonly fishCont = new Container();
  private readonly bubbleGfx = new Graphics();
  private readonly surfaceGfx = new Graphics();

  private readonly agents: FishAgent[] = [];
  private readonly bubbles: Bubble[] = [];
  private readonly particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    color: number;
    r: number;
    life: number;
  }> = [];

  // Pre-defined plants and decos
  private readonly plants: PlantDef[] = [];
  private readonly decos: DecoDef[] = [];

  // Caustic pools
  private readonly caustics: Array<{
    x: number;
    y: number;
    phase: number;
    speed: number;
    size: number;
    alpha: number;
  }> = [];

  // Light rays
  private readonly lightRays: Array<{
    nx: number;
    phase: number;
    speed: number;
    width: number;
    alpha: number;
  }> = [];

  // Plankton swarms
  private readonly planktonSwarms: PlanktonSwarm[] = [];

  // Crabs
  private readonly crabs: Crab[] = [];

  // Terrain
  private readonly terrainPts: Array<{ nx: number; ny: number }> = [];
  private readonly terrainRocks: Array<{ nx: number; width: number }> = [];
  private readonly terrainCaves: Array<{ nx: number; width: number }> = [];

  private time = 0;
  private w = 0;
  private h = 0;

  constructor() {
    super();
    this.addChild(this.bgGfx);
    this.addChild(this.lightRayGfx);
    this.addChild(this.causticGfx);
    this.addChild(this.sandGfx);
    this.addChild(this.decoGfx);
    this.addChild(this.plantsGfx);
    this.addChild(this.crabGfx);
    this.addChild(this.particleGfx);
    this.addChild(this.planktonGfx);
    this.addChild(this.fishCont);
    this.addChild(this.bubbleGfx);
    this.addChild(this.surfaceGfx);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  public async show(): Promise<void> {
    this.spawnTerrain();
    this.spawnCaustics();
    this.spawnLightRays();
    this.spawnPlants();
    this.spawnDecos();
    this.spawnCrabs();
    this.spawnAgents();
    this.spawnPlankton();
    this.spawnBubbles();
    this.spawnParticles();
  }

  public update(ticker: Ticker): void {
    const dt = ticker.deltaMS * 0.001;
    this.time += dt;

    this.drawBackground();
    this.drawLightRays(dt);
    this.drawCaustics(dt);
    this.drawSand();
    this.drawDecos();
    this.drawPlants(dt);
    this.updateCrabs(dt);
    this.drawParticles(dt);
    this.drawPlankton(dt);
    this.updateAgents(dt);
    this.drawBubbles(dt);
    this.drawSurface();
  }

  public resize(width: number, height: number): void {
    this.w = width;
    this.h = height;
    this.x = 0;
    this.y = 0;
  }

  // ── Background + caustics ──────────────────────────────────────────────────

  private drawBackground(): void {
    this.bgGfx.clear();
    const steps = 8;
    const colors = [
      DEEP,
      0x0c1430,
      0x0d1e40,
      0x0f2850,
      MID,
      0x123260,
      SURFACE,
      0x1e5580,
    ];
    for (let i = 0; i < steps; i++) {
      this.bgGfx
        .rect(0, (i / steps) * this.h, this.w, this.h / steps)
        .fill({ color: colors[i], alpha: 1 });
    }

    // ── Distant whale silhouette ──────────────────────────────────────────────
    // Drifts slowly left-to-right across the deep background, looping
    const whalePeriod = 180; // seconds per full crossing
    const wt = (this.time % whalePeriod) / whalePeriod;
    const wx = -0.18 * this.w + wt * 1.36 * this.w;
    const wy = this.h * 0.42;
    const wsc = this.h * 0.00042; // scale relative to screen height
    const wAlpha = 0.1 + 0.04 * Math.sin(this.time * 0.12); // barely visible
    const tw = Math.sin(this.time * 0.22) * 14 * wsc; // tail fluke sway

    // Body
    this.bgGfx
      .moveTo(wx + 320 * wsc, wy)
      .bezierCurveTo(
        wx + 280 * wsc,
        wy - 70 * wsc,
        wx + 100 * wsc,
        wy - 90 * wsc,
        wx,
        wy - 55 * wsc,
      )
      .bezierCurveTo(
        wx - 60 * wsc,
        wy - 20 * wsc,
        wx - 80 * wsc,
        wy + 30 * wsc,
        wx - 40 * wsc,
        wy + 60 * wsc,
      )
      .bezierCurveTo(
        wx + 60 * wsc,
        wy + 95 * wsc,
        wx + 220 * wsc,
        wy + 80 * wsc,
        wx + 320 * wsc,
        wy,
      )
      .fill({ color: 0x0a1828, alpha: wAlpha });

    // Tail flukes
    this.bgGfx
      .moveTo(wx + 320 * wsc, wy)
      .bezierCurveTo(
        wx + 360 * wsc,
        wy - 10 * wsc,
        wx + 400 * wsc,
        wy - 60 * wsc + tw,
        wx + 390 * wsc,
        wy - 100 * wsc + tw,
      )
      .bezierCurveTo(
        wx + 380 * wsc,
        wy - 120 * wsc + tw,
        wx + 360 * wsc,
        wy - 90 * wsc + tw,
        wx + 320 * wsc,
        wy,
      )
      .fill({ color: 0x0a1828, alpha: wAlpha });
    this.bgGfx
      .moveTo(wx + 320 * wsc, wy)
      .bezierCurveTo(
        wx + 360 * wsc,
        wy + 10 * wsc,
        wx + 400 * wsc,
        wy + 60 * wsc - tw,
        wx + 390 * wsc,
        wy + 100 * wsc - tw,
      )
      .bezierCurveTo(
        wx + 380 * wsc,
        wy + 120 * wsc - tw,
        wx + 360 * wsc,
        wy + 90 * wsc - tw,
        wx + 320 * wsc,
        wy,
      )
      .fill({ color: 0x0a1828, alpha: wAlpha });

    // Pectoral fin
    this.bgGfx
      .moveTo(wx + 140 * wsc, wy + 20 * wsc)
      .bezierCurveTo(
        wx + 120 * wsc,
        wy + 80 * wsc,
        wx + 80 * wsc,
        wy + 110 * wsc,
        wx + 60 * wsc,
        wy + 90 * wsc,
      )
      .bezierCurveTo(
        wx + 80 * wsc,
        wy + 60 * wsc,
        wx + 110 * wsc,
        wy + 40 * wsc,
        wx + 140 * wsc,
        wy + 20 * wsc,
      )
      .fill({ color: 0x0a1828, alpha: wAlpha * 0.8 });

    // Light sheen on back
    this.bgGfx
      .moveTo(wx + 60 * wsc, wy - 50 * wsc)
      .bezierCurveTo(
        wx + 150 * wsc,
        wy - 85 * wsc,
        wx + 240 * wsc,
        wy - 75 * wsc,
        wx + 300 * wsc,
        wy - 30 * wsc,
      )
      .stroke({ color: 0x1a3a5a, alpha: wAlpha * 0.6, width: 8 * wsc });

    const cx = this.w * 0.5;
    for (let r = 0; r < 5; r++) {
      const angle = (r - 2) * 0.22;
      const alpha = 0.03 + 0.018 * Math.sin(this.time * 0.3 + r);
      this.bgGfx
        .moveTo(cx, 0)
        .lineTo(cx + Math.sin(angle) * this.h * 1.2, this.h)
        .stroke({ color: CAUSTIC, alpha, width: 55 + r * 28 });
    }
  }

  private spawnLightRays(): void {
    for (let i = 0; i < 14; i++) {
      this.lightRays.push({
        nx: rnd(0.05, 0.95),
        phase: rnd(0, Math.PI * 2),
        speed: rnd(0.08, 0.22),
        width: rnd(18, 75),
        alpha: rnd(0.025, 0.085),
      });
    }
  }

  private drawLightRays(dt: number): void {
    this.lightRayGfx.clear();
    if (this.w === 0) return;
    for (const r of this.lightRays) {
      r.phase += r.speed * dt;
      const drift = Math.sin(r.phase) * this.w * 0.035;
      const cx = r.nx * this.w + drift;
      const alpha = r.alpha * (0.55 + 0.45 * Math.sin(r.phase * 1.6));
      const rayH = this.h * 0.82;
      const STRIPS = 6;
      for (let s = 0; s < STRIPS; s++) {
        const t0 = s / STRIPS;
        const t1 = (s + 1) / STRIPS;
        const fade = Math.pow(1 - t0, 1.6);
        const wx0 = r.width * 0.4 + this.w * 0.09 * t0;
        const wx1 = r.width * 0.4 + this.w * 0.09 * t1;
        this.lightRayGfx
          .poly([
            cx - wx0,
            rayH * t0,
            cx + wx0,
            rayH * t0,
            cx + wx1,
            rayH * t1,
            cx - wx1,
            rayH * t1,
          ])
          .fill({ color: 0x7ad8ee, alpha: alpha * fade });
      }
    }
  }

  private spawnCaustics(): void {
    for (let i = 0; i < 28; i++) {
      this.caustics.push({
        x: rnd(0, 1920),
        y: rnd(0, 380),
        phase: rnd(0, Math.PI * 2),
        speed: rnd(0.4, 1.2),
        size: rnd(22, 80),
        alpha: rnd(0.04, 0.11),
      });
    }
  }

  private drawCaustics(dt: number): void {
    this.causticGfx.clear();
    if (this.w === 0) return;
    for (const c of this.caustics) {
      c.phase += c.speed * dt;
      const xp = (c.x / 1920) * this.w;
      const yp = (c.y / 380) * this.h * 0.32;
      const sc = 0.8 + 0.4 * Math.sin(c.phase);
      this.causticGfx.ellipse(xp, yp, c.size * sc, c.size * 0.38 * sc).stroke({
        color: CAUSTIC,
        alpha: c.alpha * (0.5 + 0.5 * Math.sin(c.phase * 1.3)),
        width: 1.4,
      });
    }
  }

  // ── Terrain ────────────────────────────────────────────────────────────────

  private spawnTerrain(): void {
    // Control points: nx=normalised x, ny=normalised y of terrain surface
    // Lower ny = higher ground (closer to top of screen)
    const pts: Array<{ nx: number; ny: number }> = [
      { nx: 0.0, ny: 0.84 },
      { nx: 0.06, ny: 0.79 }, // gentle left dune
      { nx: 0.13, ny: 0.84 },
      { nx: 0.22, ny: 0.81 },
      { nx: 0.28, ny: 0.71 }, // left rock formation peak
      { nx: 0.33, ny: 0.83 },
      { nx: 0.4, ny: 0.85 },
      { nx: 0.43, ny: 0.89 }, // cave depression
      { nx: 0.47, ny: 0.85 },
      { nx: 0.54, ny: 0.82 },
      { nx: 0.58, ny: 0.76 }, // centre dune crest
      { nx: 0.64, ny: 0.83 },
      { nx: 0.7, ny: 0.85 },
      { nx: 0.73, ny: 0.7 }, // right rock formation peak
      { nx: 0.78, ny: 0.82 },
      { nx: 0.82, ny: 0.88 }, // right cave depression
      { nx: 0.86, ny: 0.83 },
      { nx: 0.91, ny: 0.78 }, // far-right dune
      { nx: 0.96, ny: 0.83 },
      { nx: 1.0, ny: 0.84 },
    ];
    this.terrainPts.length = 0;
    this.terrainPts.push(...pts);

    this.terrainRocks.length = 0;
    this.terrainRocks.push({ nx: 0.28, width: 0.1 });
    this.terrainRocks.push({ nx: 0.73, width: 0.11 });

    this.terrainCaves.length = 0;
    this.terrainCaves.push({ nx: 0.43, width: 0.09 });
    this.terrainCaves.push({ nx: 0.82, width: 0.08 });
  }

  private getTerrainY(nx: number): number {
    const pts = this.terrainPts;
    if (pts.length === 0) return this.h * 0.84;
    if (nx <= pts[0].nx) return pts[0].ny * this.h;
    if (nx >= pts[pts.length - 1].nx) return pts[pts.length - 1].ny * this.h;
    for (let i = 1; i < pts.length; i++) {
      if (nx <= pts[i].nx) {
        const t = (nx - pts[i - 1].nx) / (pts[i].nx - pts[i - 1].nx);
        const st = t * t * (3 - 2 * t); // smooth-step
        return (pts[i - 1].ny * (1 - st) + pts[i].ny * st) * this.h;
      }
    }
    return pts[pts.length - 1].ny * this.h;
  }

  // ── Sand floor ─────────────────────────────────────────────────────────────

  private drawSand(): void {
    const g = this.sandGfx;
    g.clear();
    if (this.w === 0 || this.terrainPts.length === 0) return;
    const W = this.w,
      H = this.h;
    const pts = this.terrainPts;

    // Helper: trace the terrain curve into Graphics path
    const traceSurface = (offsetY = 0) => {
      g.moveTo(0, pts[0].ny * H + offsetY);
      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1],
          p1 = pts[i];
        const mx = (p0.nx + p1.nx) * 0.5 * W;
        g.bezierCurveTo(
          mx,
          p0.ny * H + offsetY,
          mx,
          p1.ny * H + offsetY,
          p1.nx * W,
          p1.ny * H + offsetY,
        );
      }
    };

    // Layer 1: deep substrate (dark rock base)
    traceSurface(H * 0.015);
    g.lineTo(W, H).lineTo(0, H).closePath().fill({ color: 0x3a2f22, alpha: 1 });

    // Layer 2: mid sand body
    traceSurface(H * 0.007);
    g.lineTo(W, H)
      .lineTo(0, H)
      .closePath()
      .fill({ color: 0xc8a96e, alpha: 0.9 });

    // Layer 3: top sand surface (lightest)
    traceSurface(0);
    g.lineTo(W, H).lineTo(0, H).closePath().fill({ color: SAND, alpha: 0.7 });

    // ── Rock formations ──────────────────────────────────────────────
    for (const rock of this.terrainRocks) {
      const rx = rock.nx * W;
      const ry = this.getTerrainY(rock.nx);
      const rw = rock.width * W;

      // Dark rocky mass rising from terrain
      g.moveTo(rx - rw * 0.55, ry + 6)
        .bezierCurveTo(
          rx - rw * 0.45,
          ry - 30,
          rx - rw * 0.15,
          ry - 50,
          rx,
          ry - 58,
        )
        .bezierCurveTo(
          rx + rw * 0.15,
          ry - 50,
          rx + rw * 0.45,
          ry - 28,
          rx + rw * 0.55,
          ry + 6,
        )
        .closePath()
        .fill({ color: 0x455a64, alpha: 0.95 });

      // Craggy secondary peak
      g.moveTo(rx - rw * 0.25, ry + 4)
        .bezierCurveTo(
          rx - rw * 0.2,
          ry - 22,
          rx + rw * 0.05,
          ry - 36,
          rx + rw * 0.18,
          ry - 30,
        )
        .bezierCurveTo(
          rx + rw * 0.3,
          ry - 20,
          rx + rw * 0.25,
          ry,
          rx + rw * 0.25,
          ry + 4,
        )
        .closePath()
        .fill({ color: 0x546e7a, alpha: 0.9 });

      // Highlight ridge
      g.moveTo(rx - rw * 0.28, ry - 20)
        .bezierCurveTo(
          rx - rw * 0.1,
          ry - 48,
          rx + rw * 0.08,
          ry - 56,
          rx + rw * 0.18,
          ry - 44,
        )
        .stroke({ color: 0x90a4ae, alpha: 0.4, width: 2.5 });

      // Algae fringe on top
      for (let a = 0; a < 5; a++) {
        const ax = rx - rw * 0.3 + a * rw * 0.15;
        const ay = ry - 55 + Math.sin(a * 1.7) * 8;
        const sw = Math.sin(this.time * 0.8 + a * 1.2) * 4;
        g.moveTo(ax, ay)
          .bezierCurveTo(
            ax + sw,
            ay - 12,
            ax + sw + 1,
            ay - 20,
            ax + sw,
            ay - 26,
          )
          .stroke({ color: 0x27ae60, alpha: 0.75, width: 1.8, cap: "round" });
      }
    }

    // ── Cave openings ─────────────────────────────────────────────────
    for (const cave of this.terrainCaves) {
      const cx = cave.nx * W;
      const cy = this.getTerrainY(cave.nx);
      const cw = cave.width * W;

      // Deep void
      g.ellipse(cx, cy + 10, cw * 0.52, 42).fill({
        color: 0x05080f,
        alpha: 0.98,
      });
      g.ellipse(cx, cy + 14, cw * 0.38, 30).fill({
        color: 0x020408,
        alpha: 1.0,
      });

      // Cave rim — lighter arch highlight
      g.moveTo(cx - cw * 0.52, cy + 10)
        .bezierCurveTo(
          cx - cw * 0.4,
          cy - 18,
          cx + cw * 0.4,
          cy - 18,
          cx + cw * 0.52,
          cy + 10,
        )
        .stroke({ color: 0x6fa8c4, alpha: 0.3, width: 2.8 });

      // Rock overhang above cave
      g.moveTo(cx - cw * 0.6, cy)
        .bezierCurveTo(
          cx - cw * 0.5,
          cy - 12,
          cx - cw * 0.3,
          cy - 20,
          cx,
          cy - 18,
        )
        .bezierCurveTo(
          cx + cw * 0.3,
          cy - 20,
          cx + cw * 0.5,
          cy - 12,
          cx + cw * 0.6,
          cy,
        )
        .fill({ color: 0x546e7a, alpha: 0.8 });

      // Stalactites hanging from overhang
      for (let s = 0; s < 5; s++) {
        const sx = cx - cw * 0.38 + (s / 4) * cw * 0.76;
        const sh = 10 + Math.sin(s * 2.1 + cave.nx * 10) * 6;
        const tw = Math.sin(this.time * 0.6 + s * 0.9) * 1.5;
        g.moveTo(sx - 3.5, cy - 10)
          .lineTo(sx + tw, cy - 10 + sh)
          .lineTo(sx + 3.5, cy - 10)
          .closePath()
          .fill({ color: 0x78909c, alpha: 0.75 });
      }

      // Subtle glow from inside cave
      g.ellipse(cx, cy + 16, cw * 0.28, 20).fill({
        color: 0x1a3a5c,
        alpha: 0.35,
      });
    }

    // ── Sand ripples along surface ────────────────────────────────────
    for (let r = 0; r < 5; r++) {
      const yOff = 9 + r * 11;
      const wave = Math.sin(this.time * 0.38 + r * 1.3) * 3;
      traceSurface(yOff + wave);
      g.stroke({ color: 0xc8b88a, alpha: 0.22 - r * 0.03, width: 1.6 });
    }

    // ── Scattered pebbles ──────────────────────────────────────────────
    for (let i = 0; i < 40; i++) {
      const pnx = ((i * 137.508) % 100) / 100;
      const ty = this.getTerrainY(pnx);
      const px = pnx * W;
      const py = ty + 4 + ((i * 11.3) % 1) * 28;
      const pr = 1.5 + ((i * 7.71) % 1) * 4.5;
      g.ellipse(px, py, pr, pr * 0.58).fill({ color: 0xb8a88a, alpha: 0.5 });
    }
  }

  // ── Plants ─────────────────────────────────────────────────────────────────

  private spawnPlants(): void {
    const add = (
      type: PlantType,
      nx: number,
      height: number,
      color: number,
      color2: number,
      scale = 1,
    ) => {
      this.plants.push({
        type,
        nx,
        phase: rnd(0, Math.PI * 2),
        speed: rnd(0.55, 1.4),
        height,
        color,
        color2,
        scale,
      });
    };
    // Kelp — tall, back-of-tank feel
    add(PlantType.KELP, 0.06, 280, 0x8b7355, 0x4a7c3f);
    add(PlantType.KELP, 0.13, 190, 0x7a6840, 0x3d6b34);
    add(PlantType.KELP, 0.18, 220, 0x7a6840, 0x3d6b34);
    add(PlantType.KELP, 0.32, 260, 0x9c7f50, 0x527a3a);
    add(PlantType.KELP, 0.5, 210, 0x8b7355, 0x4a7c3f);
    add(PlantType.KELP, 0.72, 300, 0x9c7f50, 0x527a3a);
    add(PlantType.KELP, 0.82, 180, 0x7a6840, 0x3d6b34);
    add(PlantType.KELP, 0.88, 240, 0x8b7355, 0x4a7c3f);
    add(PlantType.KELP, 0.95, 200, 0x9c7f50, 0x4a7c3f);

    // Sea fans — branching gorgonians
    add(PlantType.SEA_FAN, 0.1, 130, 0xff6b9d, 0xff6b9d);
    add(PlantType.SEA_FAN, 0.22, 150, TEAL, TEAL);
    add(PlantType.SEA_FAN, 0.28, 160, CORAL1, CORAL1);
    add(PlantType.SEA_FAN, 0.4, 120, 0xff9f43, 0xff9f43);
    add(PlantType.SEA_FAN, 0.55, 140, 0xff9f43, 0xff9f43);
    add(PlantType.SEA_FAN, 0.63, 155, BLUE, BLUE);
    add(PlantType.SEA_FAN, 0.8, 170, MAUVE, MAUVE);
    add(PlantType.SEA_FAN, 0.9, 135, CORAL1, CORAL1);

    // Anemones
    add(PlantType.ANEMONE, 0.04, 75, TEAL, 0xd0fff8);
    add(PlantType.ANEMONE, 0.12, 90, 0xff6b6b, WHITE);
    add(PlantType.ANEMONE, 0.26, 85, 0x4db6ac, WHITE);
    add(PlantType.ANEMONE, 0.38, 80, YELLOW, WHITE);
    add(PlantType.ANEMONE, 0.42, 80, MAUVE, 0xffffff);
    add(PlantType.ANEMONE, 0.58, 88, 0xff6b6b, YELLOW);
    add(PlantType.ANEMONE, 0.65, 95, 0xff9f43, YELLOW);
    add(PlantType.ANEMONE, 0.75, 78, BLUE, WHITE);
    add(PlantType.ANEMONE, 0.87, 92, MAUVE, 0xffd0f0);
    add(PlantType.ANEMONE, 0.97, 70, TEAL, WHITE);

    // Bubble algae
    add(PlantType.BUBBLE_ALGAE, 0.16, 95, 0x52b788, 0x74c69d);
    add(PlantType.BUBBLE_ALGAE, 0.35, 110, 0x52b788, 0x74c69d);
    add(PlantType.BUBBLE_ALGAE, 0.47, 80, 0x40916c, 0x52b788);
    add(PlantType.BUBBLE_ALGAE, 0.6, 90, 0x40916c, 0x52b788);
    add(PlantType.BUBBLE_ALGAE, 0.78, 105, 0x52b788, 0x95d5b2);
    add(PlantType.BUBBLE_ALGAE, 0.92, 100, 0x52b788, 0x74c69d);

    // Sea grass — dense patches
    add(PlantType.SEA_GRASS, 0.03, 50, 0x52b788, 0x2d6a4f);
    add(PlantType.SEA_GRASS, 0.22, 55, 0x52b788, 0x2d6a4f);
    add(PlantType.SEA_GRASS, 0.3, 45, 0x74c69d, 0x40916c);
    add(PlantType.SEA_GRASS, 0.48, 48, 0x40916c, 0x2d6a4f);
    add(PlantType.SEA_GRASS, 0.57, 52, 0x52b788, 0x2d6a4f);
    add(PlantType.SEA_GRASS, 0.68, 60, 0x74c69d, 0x40916c);
    add(PlantType.SEA_GRASS, 0.77, 46, 0x40916c, 0x2d6a4f);
    add(PlantType.SEA_GRASS, 0.84, 50, 0x52b788, 0x2d6a4f);
    add(PlantType.SEA_GRASS, 0.96, 45, 0x40916c, 0x2d6a4f);

    // Ferns
    add(PlantType.FERN, 0.08, 150, 0x74c69d, 0x52b788);
    add(PlantType.FERN, 0.24, 120, 0x52b788, 0x2d6a4f);
    add(PlantType.FERN, 0.37, 140, 0x95d5b2, 0x74c69d);
    add(PlantType.FERN, 0.44, 130, 0x52b788, 0x2d6a4f);
    add(PlantType.FERN, 0.62, 155, 0x74c69d, 0x52b788);
    add(PlantType.FERN, 0.76, 160, 0x95d5b2, 0x74c69d);
    add(PlantType.FERN, 0.93, 135, 0x52b788, 0x2d6a4f);
  }

  private drawPlants(dt: number): void {
    this.plantsGfx.clear();
    if (this.w === 0) return;

    for (const p of this.plants) {
      p.phase += p.speed * dt;
      const wx = p.nx * this.w;
      const wy = this.getTerrainY(p.nx);

      switch (p.type) {
        case PlantType.KELP:
          drawKelp(this.plantsGfx, wx, wy, p.phase, p.height * (this.h / 1080));
          break;
        case PlantType.SEA_FAN:
          drawSeaFan(
            this.plantsGfx,
            wx,
            wy,
            p.phase,
            p.height * (this.h / 1080),
            p.color,
          );
          break;
        case PlantType.ANEMONE:
          drawAnemone(
            this.plantsGfx,
            wx,
            wy,
            p.phase,
            14,
            p.height * (this.h / 1080),
            p.color,
            p.color2,
          );
          break;
        case PlantType.BUBBLE_ALGAE:
          drawBubbleAlgae(
            this.plantsGfx,
            wx,
            wy,
            p.phase,
            p.height * (this.h / 1080),
          );
          break;
        case PlantType.SEA_GRASS:
          drawSeaGrass(
            this.plantsGfx,
            wx,
            wy,
            p.phase,
            9,
            p.height * (this.h / 1080),
          );
          break;
        case PlantType.FERN:
          drawFern(
            this.plantsGfx,
            wx,
            wy,
            p.phase,
            p.height * (this.h / 1080),
            p.color,
          );
          break;
      }
    }
  }

  // ── Bottom decorations ─────────────────────────────────────────────────────

  private spawnDecos(): void {
    const add = (
      type: DecoType,
      nx: number,
      ny: number,
      color: number,
      scale: number,
      phase = 0,
    ) => {
      this.decos.push({
        type,
        nx,
        ny,
        x: 0,
        color,
        scale,
        phase,
        openSpeed: rnd(0.3, 0.7),
      });
    };
    // Rocks — various shapes
    add(DecoType.ROCK, 0.05, 0.865, 0x546e7a, 1.1, 0);
    add(DecoType.ROCK, 0.15, 0.875, 0x607d8b, 0.8, 1);
    add(DecoType.ROCK, 0.38, 0.87, 0x455a64, 1.3, 2);
    add(DecoType.ROCK, 0.52, 0.88, 0x546e7a, 0.9, 3);
    add(DecoType.ROCK, 0.7, 0.865, 0x78909c, 1.2, 0);
    add(DecoType.ROCK, 0.85, 0.875, 0x607d8b, 1.0, 1);

    // Starfish
    add(DecoType.STARFISH, 0.1, 0.87, 0xe74c3c, 1.0);
    add(DecoType.STARFISH, 0.3, 0.875, 0xe67e22, 1.1);
    add(DecoType.STARFISH, 0.62, 0.872, 0x9b59b6, 0.9);
    add(DecoType.STARFISH, 0.9, 0.868, 0xf39c12, 1.2);

    // Sea urchins
    add(DecoType.SEA_URCHIN, 0.2, 0.874, 0x2c3e50, 1.0);
    add(DecoType.SEA_URCHIN, 0.46, 0.872, 0x6c3483, 1.1);
    add(DecoType.SEA_URCHIN, 0.78, 0.87, 0x1a252f, 0.9);

    // Shells
    add(DecoType.SHELL, 0.08, 0.872, 0xd5d8dc, 1.0);
    add(DecoType.SHELL, 0.25, 0.876, 0xfdebd0, 0.9);
    add(DecoType.SHELL, 0.56, 0.874, 0xaed6f1, 1.1);
    add(DecoType.SHELL, 0.94, 0.873, 0xd5d8dc, 1.0);

    // Anchor (half-buried)
    add(DecoType.ANCHOR, 0.32, 0.87, 0x546e7a, 1.0);

    // Treasure chest (slowly opening)
    add(DecoType.TREASURE_CHEST, 0.66, 0.87, WOOD_PLACEHOLDER, 1.1);
  }

  private drawDecos(): void {
    this.decoGfx.clear();
    if (this.w === 0) return;
    const t = this.time;

    for (const d of this.decos) {
      const wx = d.nx * this.w;
      const wy = this.getTerrainY(d.nx);
      d.x = wx;

      switch (d.type) {
        case DecoType.ROCK:
          drawRock(this.decoGfx, wx, wy, d, t);
          break;
        case DecoType.STARFISH:
          drawStarfish(this.decoGfx, wx, wy, t * d.openSpeed, d.color);
          break;
        case DecoType.SEA_URCHIN:
          drawSeaUrchin(this.decoGfx, wx, wy, t, d.color);
          break;
        case DecoType.SHELL:
          drawShell(this.decoGfx, wx, wy, d.color);
          break;
        case DecoType.ANCHOR:
          drawAnchor(this.decoGfx, wx, wy, t);
          break;
        case DecoType.TREASURE_CHEST: {
          const openAmt = 0.55 + 0.45 * Math.sin(t * d.openSpeed);
          drawTreasureChest(this.decoGfx, wx, wy, openAmt);
          break;
        }
      }
    }
  }

  // ── Plankton ───────────────────────────────────────────────────────────────

  // ── Crabs ──────────────────────────────────────────────────────────────────

  private spawnCrabs(): void {
    for (let i = 0; i < 8; i++) {
      this.crabs.push({
        nx: rnd(0.05, 0.95),
        dir: Math.random() > 0.5 ? 1 : -1,
        speed: rnd(18, 45),
        phase: rnd(0, Math.PI * 2),
        phaseSpeed: rnd(2.5, 4.5),
        pauseTimer: rnd(0, 2),
        scale: rnd(0.55, 0.85),
        colors: pick(CRAB_PALETTES),
      });
    }
  }

  private updateCrabs(dt: number): void {
    this.crabGfx.clear();
    if (this.w === 0) return;

    for (const crab of this.crabs) {
      if (crab.pauseTimer > 0) {
        crab.pauseTimer -= dt;
        crab.phase += crab.phaseSpeed * 0.25 * dt; // idle claw animation
      } else {
        crab.phase += crab.phaseSpeed * dt;
        crab.nx += (crab.dir * crab.speed * dt) / this.w;

        if (crab.nx < 0.02) {
          crab.nx = 0.02;
          crab.dir = 1;
        }
        if (crab.nx > 0.98) {
          crab.nx = 0.98;
          crab.dir = -1;
        }

        if (Math.random() < 0.004) {
          crab.pauseTimer = rnd(0.4, 2.2);
          if (Math.random() < 0.3) crab.dir = (crab.dir * -1) as 1 | -1;
        }
      }

      const wx = crab.nx * this.w;
      const wy = this.getTerrainY(crab.nx);
      drawCrab(
        this.crabGfx,
        wx,
        wy,
        crab.phase,
        crab.dir === 1,
        crab.scale,
        crab.colors,
      );
    }
  }

  private spawnPlankton(): void {
    const palette: Array<{ color: number; glow: number }> = [
      { color: 0x4ad8e8, glow: 0x00ffff },
      { color: 0x80e840, glow: 0x88ff00 },
      { color: 0xf0e070, glow: 0xffff88 },
      { color: 0xf078d8, glow: 0xff88ff },
      { color: 0x60a8f8, glow: 0x44aaff },
      { color: 0xf8a060, glow: 0xffcc44 },
    ];
    const baseW = this.w > 0 ? this.w : 1920;
    const baseH = this.h > 0 ? this.h : 1080;

    for (let s = 0; s < PLANKTON_SWARM_COUNT; s++) {
      const pal = palette[s % palette.length];
      const cx = rnd(0.1, 0.9) * baseW;
      const cy = rnd(0.1, 0.78) * baseH;
      const members: PlanktonMember[] = [];
      for (let i = 0; i < PLANKTON_PER_SWARM; i++) {
        members.push({
          x: cx + rnd(-200, 200),
          y: cy + rnd(-120, 120),
          vx: rnd(-4, 4),
          vy: rnd(-3, 3),
          phase: rnd(0, Math.PI * 2),
          phaseSpeed: rnd(1.2, 3.0),
          r: rnd(1.2, 3.2),
          shape: (i % 3) as 0 | 1 | 2,
        });
      }
      this.planktonSwarms.push({
        cx,
        cy,
        vcx: rnd(-10, 10),
        vcy: rnd(-5, 5),
        color: pal.color,
        glowColor: pal.glow,
        members,
      });
    }
  }

  private drawPlankton(dt: number): void {
    this.planktonGfx.clear();
    if (this.w === 0) return;
    const floorY = this.h * 0.84;

    for (const sw of this.planktonSwarms) {
      // Drift swarm center with gentle random steering
      sw.vcx += rnd(-0.8, 0.8) * dt;
      sw.vcy += rnd(-0.5, 0.5) * dt;
      sw.vcx = Math.max(-14, Math.min(14, sw.vcx));
      sw.vcy = Math.max(-7, Math.min(7, sw.vcy));
      sw.cx += sw.vcx * dt;
      sw.cy += sw.vcy * dt;
      if (sw.cx < -60) sw.cx = this.w + 60;
      if (sw.cx > this.w + 60) sw.cx = -60;
      if (sw.cy < this.h * 0.05) {
        sw.cy = this.h * 0.05;
        sw.vcy = Math.abs(sw.vcy);
      }
      if (sw.cy > this.h * 0.78) {
        sw.cy = this.h * 0.78;
        sw.vcy = -Math.abs(sw.vcy);
      }

      for (const m of sw.members) {
        m.phase += m.phaseSpeed * dt;

        // Weak cohesion + gentle random walk — keep members spread out
        m.vx += (sw.cx - m.x) * 0.12 * dt + rnd(-4, 4) * dt;
        m.vy += (sw.cy - m.y) * 0.12 * dt + rnd(-3, 3) * dt;
        const spd = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
        if (spd > 10) {
          m.vx = (m.vx / spd) * 10;
          m.vy = (m.vy / spd) * 10;
        }

        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.y > floorY) {
          m.y = floorY;
          m.vy = -Math.abs(m.vy);
        }

        const blink = 0.45 + 0.55 * Math.sin(m.phase);
        const ga = blink * 0.18;
        const ba = blink * 0.72;

        // Outer glow
        this.planktonGfx
          .circle(m.x, m.y, m.r * 4)
          .fill({ color: sw.glowColor, alpha: ga });

        if (m.shape === 0) {
          // Copepod — oval body + two antennae
          this.planktonGfx
            .ellipse(m.x, m.y, m.r * 1.6, m.r)
            .fill({ color: sw.color, alpha: ba });
          const aLen = m.r * 3.5;
          const as = Math.sin(m.phase * 1.4) * 0.4;
          this.planktonGfx
            .moveTo(m.x - m.r, m.y)
            .lineTo(m.x - m.r - aLen * Math.cos(as), m.y - aLen * Math.sin(as))
            .stroke({ color: sw.color, alpha: ba * 0.6, width: 0.6 });
          this.planktonGfx
            .moveTo(m.x - m.r, m.y)
            .lineTo(
              m.x - m.r - aLen * Math.cos(-as),
              m.y - aLen * Math.sin(-as),
            )
            .stroke({ color: sw.color, alpha: ba * 0.6, width: 0.6 });
        } else if (m.shape === 1) {
          // Radiolarian — circle + radiating spines
          this.planktonGfx
            .circle(m.x, m.y, m.r)
            .fill({ color: sw.color, alpha: ba });
          const SPINES = 8;
          for (let sp = 0; sp < SPINES; sp++) {
            const sa = (sp / SPINES) * Math.PI * 2 + m.phase * 0.15;
            const sLen = m.r * (2.8 + 0.7 * Math.sin(m.phase + sp));
            this.planktonGfx
              .moveTo(m.x + Math.cos(sa) * m.r, m.y + Math.sin(sa) * m.r)
              .lineTo(m.x + Math.cos(sa) * sLen, m.y + Math.sin(sa) * sLen)
              .stroke({ color: sw.color, alpha: ba * 0.55, width: 0.5 });
          }
        } else {
          // Dinoflagellate — teardrop body + curling flagellum
          const angle = Math.atan2(m.vy, m.vx);
          this.planktonGfx
            .moveTo(
              m.x + Math.cos(angle) * m.r * 2,
              m.y + Math.sin(angle) * m.r * 2,
            )
            .bezierCurveTo(
              m.x + Math.cos(angle + 1.1) * m.r * 1.8,
              m.y + Math.sin(angle + 1.1) * m.r * 1.8,
              m.x + Math.cos(angle + 2.2) * m.r * 1.5,
              m.y + Math.sin(angle + 2.2) * m.r * 1.5,
              m.x,
              m.y,
            )
            .fill({ color: sw.color, alpha: ba });
          // Flagellum whip
          const fw = Math.sin(m.phase * 2) * m.r * 2;
          this.planktonGfx
            .moveTo(m.x, m.y)
            .bezierCurveTo(
              m.x - Math.cos(angle) * m.r * 2 + fw,
              m.y - Math.sin(angle) * m.r * 2,
              m.x - Math.cos(angle) * m.r * 4,
              m.y - Math.sin(angle) * m.r * 4 + fw,
              m.x - Math.cos(angle) * m.r * 5.5,
              m.y - Math.sin(angle) * m.r * 5.5,
            )
            .stroke({ color: sw.color, alpha: ba * 0.5, width: 0.6 });
        }
      }
    }
  }

  // ── Particles ──────────────────────────────────────────────────────────────

  private spawnParticles(): void {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this.particles.push({
        x: rnd(0, 1920),
        y: rnd(0, 1080),
        vx: rnd(-8, 8),
        vy: rnd(-4, -1),
        alpha: rnd(0.08, 0.32),
        color: pick([WHITE, TEAL, SKY, FOAM, CAUSTIC]),
        r: rnd(0.5, 2.5),
        life: rnd(0, 1),
      });
    }
  }

  private drawParticles(dt: number): void {
    this.particleGfx.clear();
    if (this.w === 0) return;
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dt * 0.08;
      if (p.y < -10 || p.life > 1) {
        p.x = rnd(0, this.w);
        p.y = this.h + 10;
        p.life = 0;
      }
      if (p.x < -10) p.x = this.w + 10;
      if (p.x > this.w + 10) p.x = -10;
      this.particleGfx
        .circle(p.x, p.y, p.r)
        .fill({ color: p.color, alpha: p.alpha });
      this.particleGfx
        .circle(p.x, p.y, p.r * 3.2)
        .fill({ color: p.color, alpha: p.alpha * 0.14 });
    }
  }

  // ── Fish agents ─────────────────────────────────────────────────────────────

  private spawnAgent(
    type: FishType,
    palette: FishColors[],
    scale: number,
    speed: number,
    wobbleAmp: number,
    tailSpeed: number,
    yMin: number,
    yMax: number,
    schoolX?: number,
    schoolY?: number,
  ): void {
    const colors = pick(palette);
    const agent = new FishAgent(type, colors, scale);
    const goRight = Math.random() > 0.5;
    const baseW = this.w > 0 ? this.w : 1920;
    const baseH = this.h > 0 ? this.h : 1080;

    agent.x = schoolX !== undefined ? schoolX + rnd(-70, 70) : rnd(0, baseW);
    agent.y =
      schoolY !== undefined ? schoolY + rnd(-35, 35) : rnd(yMin, yMax) * baseH;
    agent.vx = speed * (goRight ? 1 : -1);
    agent.vy = rnd(-6, 6);
    agent.maxSpeed = speed;
    agent.facingRight = goRight;
    agent.wobbleSpeed = rnd(0.6, 1.4);
    agent.wobbleAmp = wobbleAmp;
    agent.tailSpeed = tailSpeed * rnd(0.85, 1.2);
    agent.leanPhase = rnd(0, Math.PI * 2);

    this.fishCont.addChild(agent);
    this.agents.push(agent);
  }

  private spawnAgents(): void {
    // Sardines — school
    for (let i = 0; i < 16; i++)
      this.spawnAgent(
        FishType.SARDINE,
        SARDINE_PALETTES,
        rnd(0.55, 0.85),
        rnd(55, 100),
        12,
        4.5,
        0.08,
        0.78,
      );
    // Tropical
    for (let i = 0; i < 8; i++)
      this.spawnAgent(
        FishType.TROPICAL,
        TROPICAL_PALETTES,
        rnd(0.8, 1.2),
        rnd(30, 65),
        18,
        3.8,
        0.1,
        0.8,
      );
    // Angel
    for (let i = 0; i < 5; i++)
      this.spawnAgent(
        FishType.ANGEL,
        ANGEL_PALETTES,
        rnd(0.7, 1.1),
        rnd(18, 40),
        10,
        2.5,
        0.12,
        0.76,
      );
    // Puffer
    for (let i = 0; i < 4; i++)
      this.spawnAgent(
        FishType.PUFFER,
        PUFFER_PALETTES,
        rnd(0.65, 0.95),
        rnd(12, 28),
        16,
        2.0,
        0.3,
        0.8,
      );
    // Sharks
    for (let i = 0; i < 3; i++)
      this.spawnAgent(
        FishType.SHARK,
        SHARK_PALETTES,
        rnd(1.1, 1.8),
        rnd(60, 110),
        8,
        3.2,
        0.15,
        0.7,
      );
    // Manta
    for (let i = 0; i < 2; i++)
      this.spawnAgent(
        FishType.MANTA,
        MANTA_PALETTES,
        rnd(0.9, 1.4),
        rnd(20, 40),
        6,
        1.5,
        0.2,
        0.72,
      );
    // Submarines
    for (let i = 0; i < 2; i++)
      this.spawnAgent(
        FishType.SUBMARINE,
        SUB_PALETTES,
        rnd(1.0, 1.4),
        rnd(25, 45),
        4,
        0.0,
        0.35,
        0.75,
      );

    // PIRANHAS — spawn in two schools for menacing effect
    const s1x = rnd(0.1, 0.4) * (this.w > 0 ? this.w : 1920);
    const s1y = rnd(0.3, 0.6) * (this.h > 0 ? this.h : 1080);
    for (let i = 0; i < 7; i++)
      this.spawnAgent(
        FishType.PIRANHA,
        PIRANHA_PALETTES,
        rnd(0.75, 1.05),
        rnd(38, 70),
        14,
        4.0,
        0.2,
        0.75,
        s1x,
        s1y,
      );

    const s2x = rnd(0.55, 0.9) * (this.w > 0 ? this.w : 1920);
    const s2y = rnd(0.35, 0.65) * (this.h > 0 ? this.h : 1080);
    for (let i = 0; i < 5; i++)
      this.spawnAgent(
        FishType.PIRANHA,
        PIRANHA_PALETTES,
        rnd(0.7, 1.0),
        rnd(35, 68),
        14,
        4.0,
        0.2,
        0.75,
        s2x,
        s2y,
      );

    // HAMMERHEADS — large, deep patrol
    for (let i = 0; i < 2; i++)
      this.spawnAgent(
        FishType.HAMMERHEAD,
        HAMMERHEAD_PALETTES,
        rnd(1.2, 1.7),
        rnd(45, 80),
        8,
        2.8,
        0.18,
        0.68,
      );

    // JELLYFISH — slow drifters spread through full water column
    for (let i = 0; i < 18; i++)
      this.spawnAgent(
        FishType.JELLYFISH,
        JELLYFISH_PALETTES,
        rnd(0.6, 1.2),
        rnd(6, 24),
        6,
        2.0,
        0.05,
        0.82,
      );

    // SEA SNAKES — sinuous mid-water hunters
    for (let i = 0; i < 4; i++)
      this.spawnAgent(
        FishType.SEA_SNAKE,
        SEA_SNAKE_PALETTES,
        rnd(0.7, 1.0),
        rnd(28, 55),
        10,
        3.5,
        0.3,
        0.8,
      );

    // CROCODILES — slow armoured bottom-dwellers
    for (let i = 0; i < 3; i++)
      this.spawnAgent(
        FishType.CROCODILE,
        CROCODILE_PALETTES,
        rnd(0.65, 0.95),
        rnd(12, 22),
        3,
        1.8,
        0.65,
        0.8,
      );

    // SHRIMPS — small, skittery, near floor
    for (let i = 0; i < 12; i++)
      this.spawnAgent(
        FishType.SHRIMP,
        SHRIMP_PALETTES,
        rnd(0.45, 0.7),
        rnd(18, 40),
        3,
        4.5,
        0.68,
        0.82,
      );
  }

  private updateAgents(dt: number): void {
    if (this.w === 0) return;
    const floor = this.h * 0.82;

    for (const a of this.agents) {
      a.wobblePhase += a.wobbleSpeed * dt;
      a.tailPhase += a.tailSpeed * dt;
      a.leanPhase += 0.8 * dt;
      a.propPhase += 4.0 * dt;

      a.x += a.vx * dt;
      a.y += a.vy * dt + Math.sin(a.wobblePhase) * a.wobbleAmp * dt;

      const margin = 130;
      if (a.x > this.w + margin) a.x = -margin;
      if (a.x < -margin) a.x = this.w + margin;

      const yMin =
        this.h *
        (a.fishType === FishType.SHARK || a.fishType === FishType.HAMMERHEAD
          ? 0.12
          : 0.06);
      if (a.y > floor) {
        a.y = floor;
        a.vy = -Math.abs(a.vy) - rnd(5, 18);
      }
      if (a.y < yMin) {
        a.vy = Math.abs(a.vy) + rnd(2, 8);
      }

      // clamp to per-fish speed cap so velocity doesn't grow unboundedly
      const vyMax = a.maxSpeed * 0.6;
      if (a.vy > vyMax) a.vy = vyMax;
      if (a.vy < -vyMax) a.vy = -vyMax;
      const vxMax = a.maxSpeed * 1.3;
      if (a.vx > vxMax) a.vx = vxMax;
      if (a.vx < -vxMax) a.vx = -vxMax;

      if (a.vx > 0.5) a.facingRight = true;
      if (a.vx < -0.5) a.facingRight = false;

      a.position.set(a.x, a.y);
      a.redraw();
    }
  }

  // ── Bubbles ────────────────────────────────────────────────────────────────

  private spawnBubbles(): void {
    for (let i = 0; i < BUBBLE_COUNT; i++)
      this.bubbles.push(this.makeBubble(true));
  }

  private makeBubble(scatter = false): Bubble {
    return {
      x: rnd(0, this.w > 0 ? this.w : 1920),
      y: scatter ? rnd(0, this.h > 0 ? this.h : 1080) : this.h + rnd(0, 60),
      vy: rnd(18, 55),
      r: rnd(2, 12),
      alpha: rnd(0.12, 0.42),
      alphaPhase: rnd(0, Math.PI * 2),
      wobblePhase: rnd(0, Math.PI * 2),
      wobbleAmp: rnd(4, 14),
    };
  }

  private drawBubbles(dt: number): void {
    this.bubbleGfx.clear();
    if (this.w === 0) return;
    for (let i = 0; i < this.bubbles.length; i++) {
      const b = this.bubbles[i];
      b.y -= b.vy * dt;
      b.wobblePhase += 2.0 * dt;
      b.alphaPhase += 1.1 * dt;
      if (b.y < -20) {
        this.bubbles[i] = this.makeBubble();
        continue;
      }
      const bx = b.x + Math.sin(b.wobblePhase) * b.wobbleAmp;
      const a = b.alpha * (0.6 + 0.4 * Math.sin(b.alphaPhase));
      this.bubbleGfx
        .circle(bx, b.y, b.r * 0.55)
        .fill({ color: WHITE, alpha: a * 0.45 });
      this.bubbleGfx
        .circle(bx, b.y, b.r)
        .stroke({ color: FOAM, alpha: a, width: 1.0 });
      this.bubbleGfx
        .circle(bx, b.y, b.r * 1.8)
        .fill({ color: CAUSTIC, alpha: a * 0.06 });
    }
  }

  // ── Surface shimmer ────────────────────────────────────────────────────────

  private drawSurface(): void {
    this.surfaceGfx.clear();
    if (this.w === 0) return;
    const t = this.time;
    this.surfaceGfx.moveTo(0, 6);
    for (let i = 1; i <= 40; i++) {
      const sx = (i / 40) * this.w;
      const sy =
        6 + Math.sin(t * 1.2 + i * 0.6) * 4 + Math.sin(t * 0.7 + i * 1.1) * 2.5;
      this.surfaceGfx.lineTo(sx, sy);
    }
    this.surfaceGfx.stroke({ color: FOAM, alpha: 0.35, width: 2 });
    this.surfaceGfx
      .rect(0, 0, this.w, 28)
      .fill({ color: CAUSTIC, alpha: 0.055 + 0.03 * Math.sin(t * 0.9) });
  }
}

// placeholder kept to avoid undefined reference in DecoDef colour literal
const WOOD_PLACEHOLDER = 0x8b5e3c;
