import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

const BG = 0x11111b;

const ACCENT = [
  0xf5e0dc, 0xf2cdcd, 0xf5c2e7, 0xcba6f7, 0xf38ba8, 0xfab387, 0xf9e2af,
  0xa6e3a1, 0x94e2d5, 0x89dceb, 0x74c7ec, 0x89b4fa, 0xb4befe,
] as const;

const COUNT = 220;
const BASE_SPEED = 55;
const CONNECT_DIST = 160;
const REPULSE_R = 150;
const REPULSE_FORCE = 280;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: number;
}

export class PlexusConstellationScreen extends Container {
  public static assetBundles: string[] = [];

  private readonly gfx = new Graphics();
  private w = 1920;
  private h = 1080;

  private mouseX = 960;
  private mouseY = 540;

  private particles: Particle[] = [];

  constructor() {
    super();
    this.addChild(this.gfx);
  }

  public async show(): Promise<void> {
    this.w = window.innerWidth || 1920;
    this.h = window.innerHeight || 1080;
    this.mouseX = this.w / 2;
    this.mouseY = this.h / 2;
    this.init();
    window.addEventListener("mousemove", this.onMouseMove);
  }

  public async hide(): Promise<void> {
    window.removeEventListener("mousemove", this.onMouseMove);
  }

  public resize(width: number, height: number): void {
    this.w = width;
    this.h = height;
    this.init();
  }

  private readonly onMouseMove = (e: MouseEvent): void => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  };

  private init(): void {
    this.particles = [];
    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = BASE_SPEED * (0.5 + Math.random() * 1.0);
      this.particles.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: ACCENT[i % ACCENT.length],
      });
    }
  }

  public update(ticker: Ticker): void {
    const dt = Math.min(ticker.deltaMS * 0.001, 0.05);
    const g = this.gfx;
    g.clear();
    g.rect(0, 0, this.w, this.h).fill({ color: BG });

    for (const p of this.particles) {
      // Mouse repulsion
      const mdx = p.x - this.mouseX;
      const mdy = p.y - this.mouseY;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy) + 0.01;
      if (mdist < REPULSE_R) {
        const f = (1 - mdist / REPULSE_R) * REPULSE_FORCE;
        p.vx += (mdx / mdist) * f * dt;
        p.vy += (mdy / mdist) * f * dt;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < 0) p.x += this.w;
      else if (p.x > this.w) p.x -= this.w;
      if (p.y < 0) p.y += this.h;
      else if (p.y > this.h) p.y -= this.h;

      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const max = BASE_SPEED * 2.2;
      if (spd > max) {
        p.vx = (p.vx / spd) * max;
        p.vy = (p.vy / spd) * max;
      }
    }

    // Connection lines
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > CONNECT_DIST) continue;
        const t = 1 - d / CONNECT_DIST;
        const alpha = t * t;
        g.moveTo(a.x, a.y)
          .lineTo(b.x, b.y)
          .stroke({ width: 5, color: a.color, alpha: alpha * 0.05 });
        g.moveTo(a.x, a.y)
          .lineTo(b.x, b.y)
          .stroke({ width: 0.8, color: a.color, alpha: alpha * 0.55 });
      }
    }

    // Particle dots
    for (const p of this.particles) {
      g.circle(p.x, p.y, 7).fill({ color: p.color, alpha: 0.07 });
      g.circle(p.x, p.y, 2.5).fill({ color: p.color, alpha: 0.95 });
    }
  }
}
