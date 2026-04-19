import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

const BG = 0x11111b;

const ACCENT = [
  0xf5e0dc, 0xf2cdcd, 0xf5c2e7, 0xcba6f7,
  0xf38ba8, 0xfab387, 0xf9e2af, 0xa6e3a1,
  0x94e2d5, 0x89dceb, 0x74c7ec, 0x89b4fa, 0xb4befe,
] as const;

const COUNT   = 6000;
const SCALE   = 0.0025;
const SPEED   = 100;
const MAX_AGE = 10;

interface Particle {
  x: number; y: number;
  color: number;
  alpha: number;
  age: number;
}

export class FlowFieldScreen extends Container {
  public static assetBundles: string[] = [];

  private readonly gfx = new Graphics();
  private w = 1920;
  private h = 1080;
  private time = 0;

  private particles: Particle[] = [];

  constructor() {
    super();
    this.addChild(this.gfx);
  }

  public async show(): Promise<void> {
    this.w = window.innerWidth  || 1920;
    this.h = window.innerHeight || 1080;
    this.init();
  }

  public async hide(): Promise<void> { /* nothing to clean up */ }

  public resize(width: number, height: number): void {
    this.w = width;
    this.h = height;
    this.init();
  }

  private init(): void {
    this.particles = [];
    for (let i = 0; i < COUNT; i++) {
      this.particles.push({
        x:     Math.random() * this.w,
        y:     Math.random() * this.h,
        color: ACCENT[Math.floor(Math.random() * ACCENT.length)],
        alpha: Math.random(),
        age:   Math.random() * MAX_AGE,
      });
    }
  }

  public update(ticker: Ticker): void {
    const dt = Math.min(ticker.deltaMS * 0.001, 0.05);
    this.time += dt;

    const g = this.gfx;
    g.clear();
    g.rect(0, 0, this.w, this.h).fill({ color: BG });

    const t = this.time * 0.25;
    for (const p of this.particles) {
      p.age += dt;

      if (p.age >= MAX_AGE || p.x < -10 || p.x > this.w + 10 ||
          p.y < -10 || p.y > this.h + 10) {
        p.x     = Math.random() * this.w;
        p.y     = Math.random() * this.h;
        p.age   = 0;
        p.alpha = 0;
        p.color = ACCENT[Math.floor(Math.random() * ACCENT.length)];
        continue;
      }

      const nx    = p.x * SCALE;
      const ny    = p.y * SCALE;
      const angle = (
        Math.sin(nx * 1.0 + t      ) * Math.cos(ny * 0.9 + t * 0.6) +
        Math.sin(nx * 2.3 - t * 0.7) * Math.cos(ny * 2.1 + t * 0.5) * 0.5 +
        Math.sin(nx * 4.7 + t * 1.2) * Math.cos(ny * 4.3 - t * 1.0) * 0.25
      ) * Math.PI;

      p.x += Math.cos(angle) * SPEED * dt;
      p.y += Math.sin(angle) * SPEED * dt;

      p.alpha    = Math.min(1, p.age * 1.5);
      const lifeT = 1 - p.age / MAX_AGE;
      const a     = p.alpha * lifeT * 0.65;
      if (a > 0.02) {
        g.circle(p.x, p.y, 1).fill({ color: p.color, alpha: a });
      }
    }
  }
}
