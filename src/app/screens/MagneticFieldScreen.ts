import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

const BG = 0x050508;

const GRID_SPACING = 24;
const LINE_HALF    = 10;

// Magnet strength constant — tuned so fillings near a magnet are nearly vertical
// and far ones near-horizontal relative to the field line
const K = 45_000;

interface Magnet {
  x: number;
  y: number;
  charge: number; // +1 north, -1 south
}

export class MagneticFieldScreen extends Container {
  public static assetBundles: string[] = [];

  private readonly gfx = new Graphics();
  private w = 1920;
  private h = 1080;
  private time = 0;

  private magnets: Magnet[] = [];
  private gridPts: { x: number; y: number }[] = [];

  constructor() {
    super();
    this.addChild(this.gfx);
  }

  public async show(): Promise<void> {
    this.w = window.innerWidth  || 1920;
    this.h = window.innerHeight || 1080;
    this.buildGrid();
  }

  public async hide(): Promise<void> { /* nothing to clean up */ }

  public resize(width: number, height: number): void {
    this.w = width;
    this.h = height;
    this.buildGrid();
  }

  private buildGrid(): void {
    this.gridPts = [];
    // Centre the grid so fillings are symmetric on any resolution
    const offX = ((this.w % GRID_SPACING) / 2) | 0;
    const offY = ((this.h % GRID_SPACING) / 2) | 0;
    const cols  = Math.ceil(this.w / GRID_SPACING) + 1;
    const rows  = Math.ceil(this.h / GRID_SPACING) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.gridPts.push({
          x: offX + c * GRID_SPACING,
          y: offY + r * GRID_SPACING,
        });
      }
    }
  }

  public update(ticker: Ticker): void {
    const dt = Math.min(ticker.deltaMS * 0.001, 0.05);
    this.time += dt;
    const t = this.time;

    // Three magnets on independent Lissajous paths — irrational frequency ratios
    // ensure they never exactly repeat, keeping the field perpetually evolving
    const cx = this.w * 0.5;
    const cy = this.h  * 0.5;
    this.magnets = [
      {
        x:      cx + Math.cos(t * 0.211)                    * this.w * 0.32
                   + Math.cos(t * 0.073 + 1.1)              * this.w * 0.08,
        y:      cy + Math.sin(t * 0.167)                    * this.h  * 0.34
                   + Math.sin(t * 0.091 + 0.7)              * this.h  * 0.07,
        charge:  1,
      },
      {
        x:      cx + Math.cos(t * 0.163 + 2.09)             * this.w * 0.28
                   + Math.cos(t * 0.059 + 3.4)              * this.w * 0.10,
        y:      cy + Math.sin(t * 0.229 + 1.26)             * this.h  * 0.30
                   + Math.sin(t * 0.081 + 2.1)              * this.h  * 0.09,
        charge: -1,
      },
      {
        x:      cx + Math.cos(t * 0.131 + 4.19)             * this.w * 0.22
                   + Math.cos(t * 0.047 + 5.8)              * this.w * 0.12,
        y:      cy + Math.sin(t * 0.109 + 2.83)             * this.h  * 0.24
                   + Math.sin(t * 0.063 + 4.5)              * this.h  * 0.11,
        charge:  1,
      },
    ];

    const g = this.gfx;
    g.clear();
    g.rect(0, 0, this.w, this.h).fill({ color: BG });

    // ── Iron Filings ─────────────────────────────────────────────────────────
    for (const pt of this.gridPts) {
      let bx = 0;
      let by = 0;

      for (const mag of this.magnets) {
        const dx = pt.x - mag.x;
        const dy = pt.y - mag.y;
        const r2 = dx * dx + dy * dy + 1; // +1 prevents div-by-zero
        const r  = Math.sqrt(r2);
        const f  = mag.charge * K / r2;
        bx += (dx / r) * f;
        by += (dy / r) * f;
      }

      const bMag  = Math.sqrt(bx * bx + by * by);
      const angle = Math.atan2(by, bx);

      // Map field magnitude to a 0-1 intensity on a log scale
      const intensity = Math.min(1, Math.log1p(bMag * 0.004) / Math.log1p(150));
      const i2 = intensity * intensity;

      // Amber palette: near-black → deep gold → bright straw
      const rr = Math.round(lerp(0x08, 0xff, i2));
      const rg = Math.round(lerp(0x06, 0xcc, intensity));
      const rb = Math.round(lerp(0x04, 0x44, intensity * 0.5));
      const col = (rr << 16) | (rg << 8) | rb;

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Glow pass — wider, transparent
      const glowA = intensity * 0.18;
      if (glowA > 0.02) {
        g.moveTo(pt.x - cos * LINE_HALF, pt.y - sin * LINE_HALF)
          .lineTo(pt.x + cos * LINE_HALF, pt.y + sin * LINE_HALF)
          .stroke({ width: 4, color: col, alpha: glowA });
      }

      // Core pass
      const coreA = 0.12 + intensity * 0.78;
      g.moveTo(pt.x - cos * LINE_HALF, pt.y - sin * LINE_HALF)
        .lineTo(pt.x + cos * LINE_HALF, pt.y + sin * LINE_HALF)
        .stroke({ width: 1.1, color: col, alpha: coreA });
    }

    // ── Magnet Indicators (subtle glow dots) ──────────────────────────────────
    for (const mag of this.magnets) {
      const c = mag.charge > 0 ? 0xf38ba8 : 0x89b4fa; // rose=N, blue=S
      g.circle(mag.x, mag.y, 40).fill({ color: c, alpha: 0.04 });
      g.circle(mag.x, mag.y, 14).fill({ color: c, alpha: 0.12 });
      g.circle(mag.x, mag.y,  4).fill({ color: c, alpha: 0.70 });
    }
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
