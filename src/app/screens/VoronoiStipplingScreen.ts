import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

// ── Catppuccin Mocha ──────────────────────────────────────────────────────────
const C_CRUST = 0x11111b;
const C_SURFACE0 = 0x313244;
const C_SKY = 0x89dceb;
const C_TEAL = 0x94e2d5;
const C_WHITE = 0xffffff;

const ACCENTS = [
  0x74c7ec, // Sapphire
  0x89b4fa, // Blue
  0xb4befe, // Lavender
  0xcba6f7, // Mauve
  0xf5c2e7, // Pink
  0xf38ba8, // Red
  0xfab387, // Peach
  0xf9e2af, // Yellow
  0xa6e3a1, // Green
  0x94e2d5, // Teal
];

interface Seed {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  area: number;
  color: number;
  // Lifecycle
  age: number;
  maxAge: number;
  isExploding: boolean;
  explosionTimer: number;
}

interface Attractor {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export class VoronoiStipplingScreen extends Container {
  public static assetBundles: string[] = [];

  private readonly gfx = new Graphics();
  private w = 1920;
  private h = 1080;
  private seeds: Seed[] = [];
  private attractors: Attractor[] = [];
  private time = 0;
  private eventTimer = 10;

  // Grid for Lloyd's algorithm approximation
  private readonly gridCols = 80;
  private readonly gridRows = 50;

  constructor() {
    super();
    this.addChild(this.gfx);
    this.initSeeds();
    this.initAttractors();
  }

  private initSeeds(): void {
    const seedCount = 110;
    for (let i = 0; i < seedCount; i++) {
      this.seeds.push(this.createSeed(true));
    }
  }

  private createSeed(randomAge = false): Seed {
    const maxAge = 35 + Math.random() * 45; // 35 to 80 seconds
    return {
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      vx: 0,
      vy: 0,
      targetX: 0,
      targetY: 0,
      area: 0,
      color: C_SURFACE0,
      age: randomAge ? Math.random() * maxAge : 0,
      maxAge,
      isExploding: false,
      explosionTimer: 0,
    };
  }

  private initAttractors(): void {
    for (let i = 0; i < 3; i++) {
      this.attractors.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        vx: (Math.random() - 0.5) * 50,
        vy: (Math.random() - 0.5) * 50,
      });
    }
  }

  public update(ticker: Ticker): void {
    const dt = ticker.deltaMS * 0.001;
    this.time += dt;
    this.eventTimer -= dt;

    if (this.eventTimer <= 0) {
      this.triggerMigrationEvent();
    }

    this.updateLifecycle(dt);
    this.updateAttractors(dt);
    this.applyLloydsAlgorithm();
    this.updatePhysics(dt);
    this.draw();
  }

  private updateLifecycle(dt: number): void {
    for (let i = 0; i < this.seeds.length; i++) {
      const s = this.seeds[i];
      if (s.isExploding) {
        s.explosionTimer += dt;
        if (s.explosionTimer >= 0.6) {
          // Recycle seed
          this.seeds[i] = this.createSeed();
        }
        continue;
      }

      s.age += dt;
      if (s.age >= s.maxAge) {
        this.triggerExplosion(s);
      }
    }
  }

  private triggerExplosion(source: Seed): void {
    source.isExploding = true;
    source.explosionTimer = 0;

    // Apply impulse to neighbors
    const explosionRadius = 450;
    const force = 600;

    for (const s of this.seeds) {
      if (s === source || s.isExploding) continue;
      const dx = s.x - source.x;
      const dy = s.y - source.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < explosionRadius * explosionRadius) {
        const dist = Math.sqrt(distSq) || 1;
        const power = 1 - dist / explosionRadius;
        s.vx += (dx / dist) * force * power;
        s.vy += (dy / dist) * force * power;
      }
    }
  }

  private triggerMigrationEvent(): void {
    this.eventTimer = 8 + Math.random() * 6;
    for (const a of this.attractors) {
      a.vx = (Math.random() - 0.5) * 350;
      a.vy = (Math.random() - 0.5) * 350;
    }
  }

  private updateAttractors(dt: number): void {
    for (const a of this.attractors) {
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      if (a.x < 0 || a.x > this.w) a.vx *= -1;
      if (a.y < 0 || a.y > this.h) a.vy *= -1;
      a.vx *= 0.992;
      a.vy *= 0.992;
      if (Math.abs(a.vx) < 15) a.vx += (Math.random() - 0.5) * 25;
      if (Math.abs(a.vy) < 15) a.vy += (Math.random() - 0.5) * 25;
    }
  }

  private applyLloydsAlgorithm(): void {
    const sumsX = new Float32Array(this.seeds.length);
    const sumsY = new Float32Array(this.seeds.length);
    const counts = new Int32Array(this.seeds.length);
    const cw = this.w / this.gridCols;
    const ch = this.h / this.gridRows;

    for (let gy = 0; gy < this.gridRows; gy++) {
      for (let gx = 0; gx < this.gridCols; gx++) {
        const cx = (gx + 0.5) * cw;
        const cy = (gy + 0.5) * ch;
        let minDist = Infinity;
        let nearestIdx = -1;

        for (let i = 0; i < this.seeds.length; i++) {
          const s = this.seeds[i];
          if (s.isExploding) continue;
          const dx = cx - s.x;
          const dy = cy - s.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < minDist) {
            minDist = distSq;
            nearestIdx = i;
          }
        }
        if (nearestIdx !== -1) {
          sumsX[nearestIdx] += cx;
          sumsY[nearestIdx] += cy;
          counts[nearestIdx]++;
        }
      }
    }

    const cycleSpeed = 0.15;
    const tCycle = (this.time * cycleSpeed) % ACCENTS.length;
    const idx1 = Math.floor(tCycle);
    const idx2 = (idx1 + 1) % ACCENTS.length;
    const currentAccent = this.lerpColor(ACCENTS[idx1], ACCENTS[idx2], tCycle % 1);
    const maxArea = ((this.w * this.h) / this.seeds.length) * 2.8;

    for (let i = 0; i < this.seeds.length; i++) {
      const s = this.seeds[i];
      if (counts[i] > 0) {
        s.targetX = sumsX[i] / counts[i];
        s.targetY = sumsY[i] / counts[i];
        s.area = counts[i] * cw * ch;

        const ageFactor = 1 - s.age / s.maxAge;
        const tArea = Math.min(1, s.area / maxArea);
        const baseColor = this.lerpColor(currentAccent, C_SURFACE0, tArea);
        s.color = this.lerpColor(C_SURFACE0, baseColor, Math.max(0.3, ageFactor));
      }
    }
  }

  private updatePhysics(dt: number): void {
    for (const s of this.seeds) {
      if (s.isExploding) {
        s.vx *= 0.85;
        s.vy *= 0.85;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        continue;
      }

      const dx = s.targetX - s.x;
      const dy = s.targetY - s.y;
      s.vx += dx * 4.2 * dt;
      s.vy += dy * 4.2 * dt;

      for (const a of this.attractors) {
        const adx = a.x - s.x;
        const ady = a.y - s.y;
        const adist = Math.sqrt(adx * adx + ady * ady) || 1;
        const pull = Math.max(0, 1 - adist / 550);
        s.vx += (adx / adist) * pull * 45 * dt;
        s.vy += (ady / adist) * pull * 45 * dt;
      }

      const jitter = 35 * (1 + s.age / s.maxAge);
      s.vx += (Math.random() - 0.5) * jitter * dt;
      s.vy += (Math.random() - 0.5) * jitter * dt;

      s.vx *= 0.9;
      s.vy *= 0.9;
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      if (s.x < 0) s.x = 0;
      if (s.x > this.w) s.x = this.w;
      if (s.y < 0) s.y = 0;
      if (s.y > this.h) s.y = this.h;
    }
  }

  private draw(): void {
    const g = this.gfx;
    g.clear();
    g.rect(0, 0, this.w, this.h).fill({ color: C_CRUST });

    for (const s of this.seeds) {
      if (s.isExploding) {
        const progress = s.explosionTimer / 0.6;
        const r = Math.sqrt(s.area / Math.PI) * (1 + progress * 2);
        const alpha = 1 - progress;
        g.circle(s.x, s.y, r).fill({ color: C_WHITE, alpha: alpha * 0.5 });
        g.circle(s.x, s.y, r * 0.5).stroke({ color: s.color, width: 2, alpha });
        continue;
      }

      const growFactor = Math.min(1, s.age / 2);
      const r = Math.sqrt(s.area / Math.PI) * 0.95 * growFactor;
      const pulse = 1 + 0.06 * Math.sin(this.time * 4 + s.x * 0.015);

      g.circle(s.x, s.y, r * pulse).fill({ color: s.color, alpha: 0.85 });
      g.circle(s.x, s.y, r * 0.22).fill({ color: C_SKY, alpha: 0.45 * growFactor });
    }

    this.drawOrganismDetail(g);
  }

  private drawOrganismDetail(g: Graphics): void {
    const threshold = 180 * 180;
    for (let i = 0; i < this.seeds.length; i++) {
      const s1 = this.seeds[i];
      if (s1.isExploding) continue;
      for (let j = i + 1; j < this.seeds.length; j++) {
        const s2 = this.seeds[j];
        if (s2.isExploding) continue;
        const dx = s1.x - s2.x;
        const dy = s1.y - s2.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < threshold) {
          const alpha = (1 - d2 / threshold) * 0.15;
          g.moveTo(s1.x, s1.y).lineTo(s2.x, s2.y).stroke({ color: C_TEAL, width: 1, alpha });
        }
      }
    }
  }

  private lerpColor(c1: number, c2: number, t: number): number {
    const r1 = (c1 >> 16) & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = c1 & 0xff;
    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = c2 & 0xff;
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return (r << 16) | (g << 8) | b;
  }

  public resize(width: number, height: number): void {
    this.w = width;
    this.h = height;
    if (this.seeds.length === 0) this.initSeeds();
  }
}
