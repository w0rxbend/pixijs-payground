import type { Ticker } from "pixi.js";
import { Container, Sprite, Texture } from "pixi.js";

// Offscreen raster resolution (bilinear-scaled to canvas by PixiJS GPU)
const GW = 280;
const GH = 158;
const N_BLOBS = 8;

// Physics
const ATTRACT = 2800;
const REPEL = 7500;
const CENTER_PULL = 0.055;
const DAMPING = 0.987;
const MAX_VEL = 160;
const NOISE_FORCE = 16;
const MIN_R = 65;
const SPLIT_R = 155;
const MERGE_FACTOR = 0.36;

// Oil-slick iridescent hues (HSL), spread across the visible spectrum
const HUES = [188, 212, 268, 308, 348, 26, 82, 144];

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
  alive: boolean;
}

interface BlobCache {
  x: number;
  y: number;
  r2: number;
  cr: number;
  cg: number;
  cb: number;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const c = (t: number) => {
    t = ((t % 1) + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [c(h + 1 / 3) * 255, c(h) * 255, c(h - 1 / 3) * 255];
}

function smoothstep(x: number, lo: number, hi: number): number {
  const t = Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}

export class IridescentBlobsScreen extends Container {
  public static assetBundles: string[] = [];

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private imgData!: ImageData;
  private sprite!: Sprite;
  private texture!: Texture;

  private blobs: Blob[] = [];
  private time = 0;
  private w = 1920;
  private h = 1080;

  public async show(): Promise<void> {
    this.canvas = document.createElement("canvas");
    this.canvas.width = GW;
    this.canvas.height = GH;
    this.ctx = this.canvas.getContext("2d")!;
    this.imgData = this.ctx.createImageData(GW, GH);

    this.texture = Texture.from(this.canvas);
    this.sprite = new Sprite(this.texture);
    this.sprite.anchor.set(0, 0);
    this.addChild(this.sprite);

    this.resize(window.innerWidth || this.w, window.innerHeight || this.h);
    this._init();
    this._applySize();
  }

  public resize(w: number, h: number): void {
    if (this.blobs.length > 0) {
      const sx = w / this.w;
      const sy = h / this.h;
      for (const b of this.blobs) {
        b.x *= sx;
        b.y *= sy;
        b.vx *= sx;
        b.vy *= sy;
        b.r *= (sx + sy) / 2;
      }
    }
    this.w = w;
    this.h = h;
    this._applySize();
  }

  private _applySize(): void {
    if (!this.sprite) return;
    this.sprite.width = this.w;
    this.sprite.height = this.h;
  }

  private _init(): void {
    this.blobs = [];
    for (let i = 0; i < N_BLOBS; i++) {
      const a = (i / N_BLOBS) * Math.PI * 2;
      const d = 0.27;
      this.blobs.push({
        x: this.w * (0.5 + Math.cos(a) * d),
        y: this.h * (0.5 + Math.sin(a) * d),
        vx: (Math.random() - 0.5) * 55,
        vy: (Math.random() - 0.5) * 55,
        r: MIN_R + Math.random() * 35,
        hue: HUES[i],
        alive: true,
      });
    }
  }

  public update(ticker: Ticker): void {
    const dt = Math.min(ticker.deltaMS / 1000, 0.033);
    this.time += dt;
    this._physics(dt);
    this._mergeSplit();
    this._render();
  }

  private _physics(dt: number): void {
    const alive = this.blobs.filter((b) => b.alive);

    for (let i = 0; i < alive.length; i++) {
      const b = alive[i];

      // Subtle gravity well at center
      b.vx += (this.w * 0.5 - b.x) * CENTER_PULL * dt;
      b.vy += (this.h * 0.5 - b.y) * CENTER_PULL * dt;

      // Organic Perlin-like perturbation via layered sinusoids
      const s0 = Math.sin(this.time * 0.71 + i * 2.11);
      const c0 = Math.cos(this.time * 0.43 + i * 1.33);
      const s1 = Math.sin(this.time * 0.59 + i * 1.77);
      const c1 = Math.cos(this.time * 0.89 + i * 2.51);
      b.vx += s0 * c0 * NOISE_FORCE * dt;
      b.vy += s1 * c1 * NOISE_FORCE * dt;

      // Inter-blob forces
      for (let j = i + 1; j < alive.length; j++) {
        const o = alive[j];
        const dx = o.x - b.x;
        const dy = o.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = dx / dist;
        const ny = dy / dist;
        const contact = (b.r + o.r) * 0.88;

        let fx: number;
        let fy: number;

        if (dist > contact) {
          // Medium gravitational attraction
          const f = ATTRACT / (dist * dist + 900);
          fx = nx * f;
          fy = ny * f;
          b.vx += fx * dt;
          b.vy += fy * dt;
          o.vx -= fx * dt;
          o.vy -= fy * dt;
        } else {
          // Soft elastic repulsion
          const overlap = contact - dist;
          const f = REPEL * (overlap / contact);
          fx = nx * f;
          fy = ny * f;
          b.vx -= fx * dt;
          b.vy -= fy * dt;
          o.vx += fx * dt;
          o.vy += fy * dt;
        }
      }

      // Soft boundary push
      const m = b.r * 1.5;
      if (b.x < m) b.vx += (m - b.x) * 4.5 * dt;
      if (b.x > this.w - m) b.vx -= (b.x - this.w + m) * 4.5 * dt;
      if (b.y < m) b.vy += (m - b.y) * 4.5 * dt;
      if (b.y > this.h - m) b.vy -= (b.y - this.h + m) * 4.5 * dt;

      // Velocity damping and cap
      const damp = Math.pow(DAMPING, dt * 60);
      b.vx *= damp;
      b.vy *= damp;
      const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      if (sp > MAX_VEL) {
        b.vx = (b.vx / sp) * MAX_VEL;
        b.vy = (b.vy / sp) * MAX_VEL;
      }

      b.x += b.vx * dt;
      b.y += b.vy * dt;
    }
  }

  private _mergeSplit(): void {
    const alive = this.blobs.filter((b) => b.alive);

    for (let i = 0; i < alive.length; i++) {
      for (let j = i + 1; j < alive.length; j++) {
        const a = alive[i];
        const ob = alive[j];
        if (!a.alive || !ob.alive) continue;
        const dx = ob.x - a.x;
        const dy = ob.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < (a.r + ob.r) * MERGE_FACTOR) {
          const ma = a.r * a.r;
          const mb = ob.r * ob.r;
          const mt = ma + mb;
          a.x = (a.x * ma + ob.x * mb) / mt;
          a.y = (a.y * ma + ob.y * mb) / mt;
          a.vx = (a.vx * ma + ob.vx * mb) / mt;
          a.vy = (a.vy * ma + ob.vy * mb) / mt;
          a.r = Math.min(SPLIT_R * 1.08, Math.sqrt(mt));
          ob.alive = false;
        }
      }
    }

    const aliveNow = this.blobs.filter((b) => b.alive);
    for (const b of aliveNow) {
      if (b.r > SPLIT_R && aliveNow.length < 14) {
        const cr = b.r * 0.64;
        const ang = Math.random() * Math.PI * 2;
        const sep = cr * 0.65;
        const kick = 38;
        const child: Blob = {
          x: b.x + Math.cos(ang) * sep,
          y: b.y + Math.sin(ang) * sep,
          vx: b.vx + Math.cos(ang) * kick,
          vy: b.vy + Math.sin(ang) * kick,
          r: cr,
          hue: (b.hue + 35 + Math.random() * 45) % 360,
          alive: true,
        };
        b.x -= Math.cos(ang) * sep * 0.5;
        b.y -= Math.sin(ang) * sep * 0.5;
        b.vx -= Math.cos(ang) * kick;
        b.vy -= Math.sin(ang) * kick;
        b.r = cr;
        this.blobs.push(child);
      }
    }

    if (!this.blobs.some((b) => b.alive)) this._init();
  }

  private _render(): void {
    const alive = this.blobs.filter((b) => b.alive);
    const t = this.time;

    // Precompute per-blob color and field params outside pixel loop
    const cache: BlobCache[] = alive.map((b) => {
      const shimmer = Math.sin(t * 0.47 + b.hue * 0.019) * 26;
      const hue = (b.hue + shimmer + 360) % 360;
      const lit = 63 + Math.sin(t * 0.36 + b.hue * 0.021) * 8;
      const [cr, cg, cb] = hslToRgb(hue, 88, lit);
      return { x: b.x, y: b.y, r2: b.r * b.r, cr, cg, cb };
    });

    const px = this.imgData.data;
    const scaleX = this.w / GW;
    const scaleY = this.h / GH;
    const n = cache.length;

    for (let gy = 0; gy < GH; gy++) {
      const wy = gy * scaleY;
      for (let gx = 0; gx < GW; gx++) {
        const wx = gx * scaleX;

        let F = 0;
        let wr = 0;
        let wg = 0;
        let wb = 0;

        for (let k = 0; k < n; k++) {
          const c = cache[k];
          const dx = wx - c.x;
          const dy = wy - c.y;
          // Metaball field: f = r² / dist²  (singularity-safe via ε = r²·0.008)
          const f = c.r2 / (dx * dx + dy * dy + c.r2 * 0.008);
          F += f;
          wr += c.cr * f;
          wg += c.cg * f;
          wb += c.cb * f;
        }

        const p4 = (gy * GW + gx) * 4;
        // Smoothstep anti-aliases the iso-surface edge around F ≈ 1.0
        const alpha = smoothstep(F, 0.5, 1.1);

        if (alpha <= 0) {
          px[p4] = px[p4 + 1] = px[p4 + 2] = px[p4 + 3] = 0;
          continue;
        }

        const inv = 1 / F;
        // Additive-style brightening in deep overlap regions
        const boost = 1 + Math.max(0, F - 1.0) * 0.22;
        px[p4] = Math.min(255, wr * inv * boost) | 0;
        px[p4 + 1] = Math.min(255, wg * inv * boost) | 0;
        px[p4 + 2] = Math.min(255, wb * inv * boost) | 0;
        px[p4 + 3] = (alpha * 205) | 0;
      }
    }

    this.ctx.putImageData(this.imgData, 0, 0);
    this.texture.source.update();
  }
}
