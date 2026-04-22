import type { Ticker } from "pixi.js";
import {
  Container,
  Graphics,
  ParticleContainer,
  Sprite,
  Texture,
  FederatedPointerEvent,
} from "pixi.js";
import { engine as getEngine } from "../getEngine";

// ── Catppuccin Mocha ──────────────────────────────────────────────────────────
const C_CRUST = 0x11111b;
const C_SURFACE0 = 0x313244;
const C_BLUE = 0x89b4fa; // Cold
const C_TEAL = 0x94e2d5;
const C_GREEN = 0xa6e3a1;
const C_YELLOW = 0xf9e2af;
const C_PEACH = 0xfab387;
const C_RED = 0xf38ba8; // Hot
const C_MAUVE = 0xcba6f7;
const C_SKY = 0x89dceb;

const TEMPERATURE_GRADIENT = [
  C_BLUE,
  C_TEAL,
  C_GREEN,
  C_YELLOW,
  C_PEACH,
  C_RED,
];

interface Particle extends Sprite {
  vx: number;
  vy: number;
  mass: number;
  radius: number;
}

export class KineticGasScreen extends Container {
  public static assetBundles: string[] = [];

  private w = 1920;
  private h = 1080;
  private readonly particleCount = 2000;
  private readonly particleRadius = 4.5;

  private readonly glowGfx = new Graphics();
  private particleContainer!: ParticleContainer;
  private particles: Particle[] = [];
  private readonly pistonGfx = new Graphics();

  private pistonX = 1800;
  private targetPistonX = 1800;
  private prevPistonX = 1800;
  private avgTemp = 0;

  // Spatial partitioning grid
  private readonly gridSize = 50;
  private grid: Particle[][] = [];

  constructor() {
    super();
    this.eventMode = "static";

    this.addChild(this.glowGfx);
    this.initParticles();
    this.addChild(this.pistonGfx);

    this.on("pointermove", (e: FederatedPointerEvent) => {
      this.targetPistonX = Math.max(150, Math.min(this.w, e.global.x));
    });
  }

  private initParticles(): void {
    const softTexture = this.createSoftCircleTexture();
    this.particleContainer = new ParticleContainer(this.particleCount, {
      tint: true,
      position: true,
      scale: true,
    });
    this.addChild(this.particleContainer);

    for (let i = 0; i < this.particleCount; i++) {
      const p = new Sprite(softTexture) as Particle;
      p.anchor.set(0.5);
      p.radius = this.particleRadius * 0.7;
      p.mass = 1;

      p.x = Math.random() * (this.pistonX - p.radius * 2) + p.radius;
      p.y = Math.random() * (this.h - p.radius * 2) + p.radius;

      const speed = 100 + Math.random() * 150;
      const angle = Math.random() * Math.PI * 2;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;

      this.particles.push(p);
      this.particleContainer.addParticle(p);
    }
  }

  private createSoftCircleTexture(): Texture {
    const g = new Graphics();
    // Inner bright core
    g.circle(0, 0, this.particleRadius).fill({ color: 0xffffff, alpha: 1 });
    // Outer soft glow
    g.circle(0, 0, this.particleRadius * 2.2).fill({
      color: 0xffffff,
      alpha: 0.25,
    });

    return getEngine().renderer.generateTexture(g);
  }

  public update(ticker: Ticker): void {
    const dt = ticker.deltaMS * 0.001;

    this.prevPistonX = this.pistonX;
    this.pistonX += (this.targetPistonX - this.pistonX) * 0.12;
    const pistonVel = (this.pistonX - this.prevPistonX) / dt;

    this.updateParticles(dt, pistonVel);
    this.drawChamber(dt);
  }

  private updateParticles(dt: number, pistonVel: number): void {
    let totalSpeedSq = 0;

    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < p.radius) {
        p.x = p.radius;
        p.vx = Math.abs(p.vx) * 0.98;
      } else if (p.x > this.pistonX - p.radius) {
        p.x = this.pistonX - p.radius;
        p.vx = -Math.abs(p.vx) + Math.min(0, pistonVel * 1.8);
      }

      if (p.y < p.radius) {
        p.y = p.radius;
        p.vy = Math.abs(p.vy) * 0.98;
      } else if (p.y > this.h - p.radius) {
        p.y = this.h - p.radius;
        p.vy = -Math.abs(p.vy) * 0.98;
      }

      const speedSq = p.vx * p.vx + p.vy * p.vy;
      totalSpeedSq += speedSq;

      const speed = Math.sqrt(speedSq);
      const t = Math.min(1, speed / 650);
      p.tint = this.getColor(t);
      p.scale.set(0.8 + t * 0.4);
    }

    this.avgTemp = Math.sqrt(totalSpeedSq / this.particles.length);
    this.resolveCollisions();
  }

  private resolveCollisions(): void {
    const cols = Math.ceil(this.w / this.gridSize);
    const rows = Math.ceil(this.h / this.gridSize);
    this.grid = Array.from({ length: cols * rows }, () => []);

    for (const p of this.particles) {
      const gx = Math.floor(p.x / this.gridSize);
      const gy = Math.floor(p.y / this.gridSize);
      if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
        this.grid[gy * cols + gx].push(p);
      }
    }

    const collisionDistSq =
      this.particleRadius * 1.4 * (this.particleRadius * 1.4);

    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const cellParticles = this.grid[gy * cols + gx];
        const neighbors = [
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
          [-1, 1],
        ];

        for (const p1 of cellParticles) {
          for (const [dx, dy] of neighbors) {
            const nx = gx + dx;
            const ny = gy + dy;
            if (nx < 0 || nx >= cols || ny >= rows) continue;

            const targetCell = this.grid[ny * cols + nx];
            for (const p2 of targetCell) {
              if (p1 === p2) continue;
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const distSq = dx * dx + dy * dy;

              if (distSq < collisionDistSq) {
                this.handleElasticCollision(p1, p2, dx, dy, distSq);
              }
            }
          }
        }
      }
    }
  }

  private handleElasticCollision(
    p1: Particle,
    p2: Particle,
    dx: number,
    dy: number,
    distSq: number,
  ): void {
    const dist = Math.sqrt(distSq) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    const rvx = p1.vx - p2.vx;
    const rvy = p1.vy - p2.vy;
    const velAlongNormal = rvx * nx + rvy * ny;
    if (velAlongNormal > 0) return;

    const impulse = (2 * velAlongNormal) / (p1.mass + p2.mass);
    p1.vx -= impulse * p2.mass * nx;
    p1.vy -= impulse * p2.mass * ny;
    p2.vx += impulse * p1.mass * nx;
    p2.vy += impulse * p1.mass * ny;

    const overlap = this.particleRadius * 1.4 - dist;
    p1.x -= nx * overlap * 0.5;
    p1.y -= ny * overlap * 0.5;
    p2.x += nx * overlap * 0.5;
    p2.y += ny * overlap * 0.5;
  }

  private drawChamber(dt: number): void {
    const gGlow = this.glowGfx;
    gGlow.clear();
    const tempFactor = Math.min(1, this.avgTemp / 450);
    const chamberColor = this.getColor(tempFactor);

    gGlow
      .rect(0, 0, this.pistonX, this.h)
      .fill({ color: chamberColor, alpha: 0.12 });
    gGlow
      .rect(this.pistonX - 40, 0, 40, this.h)
      .fill({ color: chamberColor, alpha: 0.25 });

    const gPiston = this.pistonGfx;
    gPiston.clear();

    gPiston
      .rect(this.pistonX, 0, this.w - this.pistonX, this.h)
      .fill({ color: C_CRUST, alpha: 0.8 });
    gPiston
      .rect(this.pistonX, 0, this.w - this.pistonX, this.h)
      .stroke({ color: C_SURFACE0, width: 2 });

    const pistonColor = this.lerpColor(C_SKY, C_RED, tempFactor);
    gPiston
      .moveTo(this.pistonX, 0)
      .lineTo(this.pistonX, this.h)
      .stroke({ color: pistonColor, width: 6, alpha: 0.9 });
    gPiston
      .moveTo(this.pistonX, 0)
      .lineTo(this.pistonX, this.h)
      .stroke({ color: pistonColor, width: 20, alpha: 0.2 });
  }

  private getColor(t: number): number {
    const segments = TEMPERATURE_GRADIENT.length - 1;
    const scaledT = Math.pow(t, 0.8);
    const idx = Math.min(segments - 1, Math.floor(scaledT * segments));
    const factor = (scaledT * segments) % 1;
    return this.lerpColor(
      TEMPERATURE_GRADIENT[idx],
      TEMPERATURE_GRADIENT[idx + 1],
      factor,
    );
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
    this.targetPistonX = this.w * 0.95;
    this.pistonX = this.targetPistonX;
  }
}
