import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

// ── Colors ────────────────────────────────────────────────────────────────────
const RED_CAPUCIN = 0xff4500;
const ELECTRIC_BLUE = 0x0077ff;
const NAVY_BLUE = 0x001a33;

// ── Configuration ─────────────────────────────────────────────────────────────
const TEXT_PARTICLE_STEP = 7; // Significantly reduced density for performance
const BG_PARTICLE_N = 1300; // Increased for richer fluid environment
const RETURN_FORCE = 0.2; // Stronger tether to keep sparse particles in line
const DAMPING = 0.85;
const MUTUAL_REPULSION_STRENGTH = 0.6;

const SWELL_SPEED = 0.3;
const SWELL_FREQ = 0.01;
const SWELL_AMP = 6; // Tighter movement for sparse particles

const SHIMMER_SPEED = 0.8;
const SHIMMER_AMP = 1.0;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
  radius: number;
  alpha: number;
  color: number;
  isRed: boolean;
  uniqueId: number;
}

// ── Spatial Hash for Performance ─────────────────────────────────────────────
class SpatialHash {
  private cells: Map<string, Particle[]> = new Map();
  private cellSize: number;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  public clear() {
    this.cells.clear();
  }

  public insert(p: Particle) {
    const key = this._getKey(p.x, p.y);
    if (!this.cells.has(key)) {
      this.cells.set(key, []);
    }
    this.cells.get(key)!.push(p);
  }

  public getNeighbors(p: Particle): Particle[] {
    const neighbors: Particle[] = [];
    const cx = Math.floor(p.x / this.cellSize);
    const cy = Math.floor(p.y / this.cellSize);

    for (let x = cx - 1; x <= cx + 1; x++) {
      for (let y = cy - 1; y <= cy + 1; y++) {
        const key = `${x},${y}`;
        const cell = this.cells.get(key);
        if (cell) {
          neighbors.push(...cell);
        }
      }
    }
    return neighbors;
  }

  private _getKey(x: number, y: number): string {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
  }
}

export class StartingSoonFluidScreen extends Container {
  public static assetBundles: string[] = [];

  private readonly mainGfx = new Graphics();
  private particles: Particle[] = [];
  private spatialHash = new SpatialHash(35); // Optimized cell size

  private w = 1920;
  private h = 1080;
  private time = 0;

  constructor() {
    super();
    this.addChild(this.mainGfx);
  }

  public async show(): Promise<void> {
    this._initParticles();
  }

  public async hide(): Promise<void> {}

  public resize(width: number, height: number): void {
    this.w = width;
    this.h = height;
    this._initParticles();
  }

  private _initParticles(): void {
    const text = ["STARTING", "SOON"];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = this.w;
    canvas.height = this.h;

    const fontSize = 320;
    ctx.font = `bold ${fontSize}px Silkscreen, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";

    ctx.fillText(text[0], this.w / 2, this.h / 2 - fontSize * 0.45);
    ctx.fillText(text[1], this.w / 2, this.h / 2 + fontSize * 0.45);

    const imageData = ctx.getImageData(0, 0, this.w, this.h).data;
    this.particles = [];

    // 1. Text Particles (Red)
    for (let y = 0; y < this.h; y += TEXT_PARTICLE_STEP) {
      for (let x = 0; x < this.w; x += TEXT_PARTICLE_STEP) {
        const i = (y * this.w + x) * 4;
        if (imageData[i] > 128) {
          this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            homeX: x,
            homeY: y,
            radius: 3.5 + Math.random() * 2.5, // Larger to compensate for lower density
            alpha: 0.95 + Math.random() * 0.05,
            color: RED_CAPUCIN,
            isRed: true,
            uniqueId: Math.random() * 1000,
          });
        }
      }
    }

    // 2. Background Particles (Blue)
    for (let i = 0; i < BG_PARTICLE_N; i++) {
      const x = Math.random() * this.w;
      const y = Math.random() * this.h;
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        homeX: x,
        homeY: y,
        radius: 1.2 + Math.random() * 1.8,
        alpha: 0.25 + Math.random() * 0.25,
        color: Math.random() > 0.3 ? ELECTRIC_BLUE : NAVY_BLUE,
        isRed: false,
        uniqueId: Math.random() * 1000,
      });
    }
  }

  public update(ticker: Ticker): void {
    const dt = ticker.deltaTime;
    this.time += dt * 0.016;

    this.mainGfx.clear();

    this.spatialHash.clear();
    for (const p of this.particles) {
      this.spatialHash.insert(p);
    }

    for (const p of this.particles) {
      if (p.isRed) {
        // Red Logic
        const swellX =
          Math.sin(
            p.homeX * SWELL_FREQ +
              p.homeY * SWELL_FREQ +
              this.time * SWELL_SPEED,
          ) * SWELL_AMP;
        const swellY =
          Math.cos(
            p.homeX * SWELL_FREQ -
              p.homeY * SWELL_FREQ +
              this.time * SWELL_SPEED * 0.8,
          ) * SWELL_AMP;
        const shimX =
          Math.sin(p.uniqueId + this.time * SHIMMER_SPEED) * SHIMMER_AMP;
        const shimY =
          Math.cos(p.uniqueId * 0.7 + this.time * SHIMMER_SPEED * 1.1) *
          SHIMMER_AMP;

        p.vx += (p.homeX + swellX + shimX - p.x) * RETURN_FORCE;
        p.vy += (p.homeY + swellY + shimY - p.y) * RETURN_FORCE;
      } else {
        // Blue Logic
        p.vx += Math.sin(this.time * 0.12 + p.y * 0.002) * 0.3;
        p.vy += Math.cos(this.time * 0.12 + p.x * 0.002) * 0.3;

        if (p.x < 0) p.x = this.w;
        if (p.x > this.w) p.x = 0;
        if (p.y < 0) p.y = this.h;
        if (p.y > this.h) p.y = 0;
      }

      // Mutual Repulsion (Performance critical loop)
      const neighbors = this.spatialHash.getNeighbors(p);
      for (const other of neighbors) {
        if (p === other || (p.isRed && other.isRed)) continue;

        const dx = p.x - other.x;
        const dy = p.y - other.y;
        const distSq = dx * dx + dy * dy;

        const extraBuffer = p.isRed || other.isRed ? 24 : 0;
        const minDist = p.radius + other.radius + extraBuffer;

        if (distSq < minDist * minDist) {
          const dist = Math.sqrt(distSq) || 0.001;
          const force =
            ((minDist - dist) / minDist) * MUTUAL_REPULSION_STRENGTH;
          p.vx += (dx / dist) * force * dt;
          p.vy += (dy / dist) * force * dt;
        }
      }

      p.vx *= DAMPING;
      p.vy *= DAMPING;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      this.mainGfx.circle(p.x, p.y, p.radius);
      this.mainGfx.fill({ color: p.color, alpha: p.alpha });
    }
  }
}
