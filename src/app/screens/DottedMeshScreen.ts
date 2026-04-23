import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

// ── Catppuccin Mocha palette ──────────────────────────────────────────────────
const C_LAVENDER = 0xb4befe;

// ── Config ────────────────────────────────────────────────────────────────────
const DOT_SPACING = 30;
const DOT_BASE_R = 1.2;
const DOT_PEAK_R = 4.5;
const WAVE_STRENGTH = 60; // How much the dots move horizontally/vertically
const WAVE_SPEED = 0.002;
const FREQUENCY = 0.005;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Dot {
  baseX: number;
  baseY: number;
}

// ── Screen ────────────────────────────────────────────────────────────────────
export class DottedMeshScreen extends Container {
  public static assetBundles: string[] = [];

  private readonly gfx = new Graphics();
  private w = 1920;
  private h = 1080;
  private time = 0;

  private dots: Dot[] = [];

  constructor() {
    super();
    this.addChild(this.gfx);
  }

  public async show(): Promise<void> {
    this.buildDotGrid();
  }

  public resize(width: number, height: number): void {
    this.w = width;
    this.h = height;
    this.buildDotGrid();
  }

  private buildDotGrid(): void {
    this.dots = [];
    const cols = Math.ceil(this.w / DOT_SPACING) + 2;
    const rows = Math.ceil(this.h / DOT_SPACING) + 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.dots.push({
          baseX: c * DOT_SPACING,
          baseY: r * DOT_SPACING,
        });
      }
    }
  }

  public update(ticker: Ticker): void {
    this.time += ticker.deltaMS * WAVE_SPEED;
    this.draw();
  }

  private draw(): void {
    const g = this.gfx;
    g.clear();

    // Background is handled by the engine's background property,
    // but we can add a subtle vignette or base layer here if needed.
    // However, per instructions, we keep it clean.

    for (const dot of this.dots) {
      // Calculate elevation using multiple sine waves for fluid motion
      const z =
        Math.sin(dot.baseX * FREQUENCY + this.time) *
          Math.cos(dot.baseY * FREQUENCY * 0.8 + this.time * 0.7) +
        Math.sin((dot.baseX + dot.baseY) * FREQUENCY * 0.5 + this.time * 1.2);

      // Normalized z (-1 to 1 approx, but let's clamp/normalize for visuals)
      const nz = (z + 2) / 4; // 0..1 range roughly

      // Perspective-like offset
      const offsetX = z * WAVE_STRENGTH * 0.5;
      const offsetY = z * WAVE_STRENGTH * 0.8;

      const drawX = dot.baseX + offsetX;
      const drawY = dot.baseY + offsetY;

      // Radius based on elevation
      const r = DOT_BASE_R + (DOT_PEAK_R - DOT_BASE_R) * nz;

      // Draw dot
      g.circle(drawX, drawY, r).fill({
        color: C_LAVENDER,
        alpha: 0.4 + nz * 0.6,
      });

      // Add a tiny highlight on the peak dots
      if (nz > 0.8) {
        g.circle(drawX, drawY, r * 0.4).fill({
          color: 0xffffff,
          alpha: (nz - 0.8) * 2,
        });
      }
    }
  }
}
