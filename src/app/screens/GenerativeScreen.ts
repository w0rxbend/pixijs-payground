import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

// ── Catppuccin Mocha ──────────────────────────────────────────────────────────
const MAUVE = 0xcba6f7;
const SAPPH = 0x74c7ec;
const TEAL = 0x94e2d5;
const PEACH = 0xfab387;
const PINK = 0xf5c2e7;
const GREEN = 0xa6e3a1;
const SKY = 0x89dceb;
const LAVEN = 0xb4befe;
const YELLOW = 0xf9e2af;
const CATT_RED = 0xf38ba8;
const TOXIC_GREEN = 0x39ff14;

const DRAW_COLORS = [
  MAUVE,
  SAPPH,
  TEAL,
  PEACH,
  PINK,
  GREEN,
  SKY,
  LAVEN,
  YELLOW,
  CATT_RED,
  TOXIC_GREEN,
] as const;

function randColor(): number {
  return DRAW_COLORS[Math.floor(Math.random() * DRAW_COLORS.length)];
}

// ── Config ────────────────────────────────────────────────────────────────────
const DOT_N = 200;
const TRAIL_LEN = 60;
const BASE_SPEED = 2.5;
const EDGE_MARGIN = 180; // px band along each edge where most dots spawn
const EDGE_BIAS = 0.78; // fraction of dots that start near an edge

// ── Types ─────────────────────────────────────────────────────────────────────
interface Dot {
  history: Array<{ x: number; y: number }>;
  angle: number;
  speed: number;
  phaseA: number;
  phaseB: number;
  color: number;
  radius: number;
}

// ── Screen ────────────────────────────────────────────────────────────────────
export class GenerativeScreen extends Container {
  public static assetBundles: string[] = [];

  private readonly gfx = new Graphics();
  private dots: Dot[] = [];
  private time = 0;
  private w = 1920;
  private h = 1080;

  constructor() {
    super();
    this.addChild(this.gfx);
  }

  public async show(): Promise<void> {
    this._initDots();
  }

  public resize(width: number, height: number): void {
    this.w = width;
    this.h = height;
    this._initDots();
  }

  private _initDots(): void {
    this.dots = [];
    for (let i = 0; i < DOT_N; i++) {
      const { x, y } = this._spawnPos();
      this.dots.push({
        history: [{ x, y }],
        angle: Math.random() * Math.PI * 2,
        speed: BASE_SPEED + Math.random() * 2,
        phaseA: Math.random() * Math.PI * 2,
        phaseB: Math.random() * Math.PI * 2,
        color: randColor(),
        radius: 2 + Math.random() * 4,
      });
    }
  }

  private _spawnPos(): { x: number; y: number } {
    if (Math.random() < EDGE_BIAS) {
      const m = EDGE_MARGIN;
      switch (Math.floor(Math.random() * 4)) {
        case 0:
          return { x: Math.random() * this.w, y: Math.random() * m };
        case 1:
          return { x: Math.random() * this.w, y: this.h - Math.random() * m };
        case 2:
          return { x: Math.random() * m, y: Math.random() * this.h };
        default:
          return { x: this.w - Math.random() * m, y: Math.random() * this.h };
      }
    }
    return { x: Math.random() * this.w, y: Math.random() * this.h };
  }

  public update(ticker: Ticker): void {
    const dt = ticker.deltaTime;
    this.time += dt * 0.016;

    const g = this.gfx;
    g.clear();

    for (const d of this.dots) {
      const noiseA = Math.sin(this.time * 0.85 + d.phaseA) * 0.42;
      const noiseB = Math.sin(this.time * 0.31 + d.phaseB) * 0.22;
      d.angle += (noiseA + noiseB) * 0.038 * dt;

      const head = d.history[d.history.length - 1];
      const nx = head.x + Math.cos(d.angle) * d.speed * dt;
      const ny = head.y + Math.sin(d.angle) * d.speed * dt;

      if (nx < 0 || nx > this.w || ny < 0 || ny > this.h) {
        const p = this._spawnPos();
        d.history = [p];
        d.angle = Math.random() * Math.PI * 2;
        d.color = randColor();
        continue;
      }

      d.history.push({ x: nx, y: ny });
      if (d.history.length > TRAIL_LEN) d.history.shift();

      // Trail — same color, fades from transparent at tail to opaque at head
      const pts = d.history;
      const n = pts.length;
      for (let i = 1; i < n; i++) {
        const t = i / n;
        g.moveTo(pts[i - 1].x, pts[i - 1].y);
        g.lineTo(pts[i].x, pts[i].y);
        g.stroke({
          color: d.color,
          width: d.radius * (0.3 + t * 0.7),
          alpha: t * t,
        });
      }

      // Head dot
      g.circle(nx, ny, d.radius);
      g.fill({ color: d.color, alpha: 1 });
    }
  }
}
