import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

const W = 1920;
const H = 1080;
const TAU = Math.PI * 2;

// Catppuccin Mocha
const CRUST    = 0x11111b;
const SURFACE0 = 0x313244;
const SURFACE1 = 0x45475a;
const LAVENDER = 0xb4befe;
const BLUE     = 0x89b4fa;
const SAPPHIRE = 0x74c7ec;
const TEAL     = 0x94e2d5;
const GREEN    = 0xa6e3a1;
const MAUVE    = 0xcba6f7;
const PINK     = 0xf38ba8;
const YELLOW   = 0xf9e2af;

// Grid dimensions and world scale
const NX = 62;
const NY = 38;
const CELL = 27;

// Camera
const PITCH = 0.84;          // radians — tilt down
const YAW   = Math.PI / 10;  // radians — slight left rotation
const SCALE = 1.0;
const SCX   = W / 2;
const SCY   = 595;           // vertical centre of terrain (slightly below canvas centre)

// Terrain
const HEIGHT_SCALE = 148;    // world units for max elevation
const TERRAIN_SPEED = 0.00042; // time param advance per ms

// Scan
const SCAN_PERIOD  = 7200;   // ms per full ping-pong
const SCAN_GLOW_W  = 0.11;   // normalised height band for outer glow
const SCAN_CORE_W  = 0.038;  // normalised height band for bright core

const cosPitch = Math.cos(PITCH);
const sinPitch = Math.sin(PITCH);
const cosYaw   = Math.cos(YAW);
const sinYaw   = Math.sin(YAW);

function rnd(lo: number, hi: number): number {
  return lo + Math.random() * (hi - lo);
}

// Sum-of-sines animated terrain — returns [0, 1]
function tHeight(ix: number, iy: number, t: number): number {
  const nx = (ix / (NX - 1)) * TAU;
  const ny = (iy / (NY - 1)) * TAU;
  let h = 0;
  h += 0.48 * Math.sin(nx * 1.4 + t * 0.22) * Math.cos(ny * 1.1 + t * 0.17);
  h += 0.26 * Math.sin(nx * 3.2 + t * 0.38 + 1.3) * Math.cos(ny * 2.9 + t * 0.29);
  h += 0.16 * Math.sin(nx * 6.1 + t * 0.57 + 0.8) * Math.cos(ny * 5.7 + t * 0.46);
  h += 0.10 * Math.sin(nx * 11.8 + t * 0.85 + 2.0) * Math.cos(ny * 10.4 + t * 0.70);
  return (h + 1) * 0.5;
}

// Orthographic projection with yaw + pitch
function project(wx: number, wy: number, wz: number): [number, number] {
  const rx = (wx * cosYaw + wz * sinYaw) * SCALE;
  const ry = wy;
  const rz = (-wx * sinYaw + wz * cosYaw) * SCALE;
  const ty = ry * cosPitch - rz * sinPitch;
  return [SCX + rx, SCY - ty];
}

type E4 = [number, number, number, number]; // x1 y1 x2 y2

export class TopoLandscapeScreen extends Container {
  public static assetBundles: string[] = [];

  private readonly bgG     = new Graphics();
  private readonly baseG   = new Graphics();  // normal blend — terrain lines
  private readonly scanG   = new Graphics();  // additive blend — scan glow
  private readonly horizG  = new Graphics();  // additive blend — horizon + scan band

  // Pre-allocated per-vertex arrays
  private readonly vx: Float32Array;
  private readonly vz: Float32Array;
  private readonly ht: Float32Array;  // current heights [0,1]
  private readonly sx: Float32Array;  // projected screen x
  private readonly sy: Float32Array;  // projected screen y

  private elapsed = 0;
  private tParam  = 0;
  private ready   = false;

  constructor() {
    super();
    const N = NX * NY;
    this.vx = new Float32Array(N);
    this.vz = new Float32Array(N);
    this.ht = new Float32Array(N);
    this.sx = new Float32Array(N);
    this.sy = new Float32Array(N);

    this.addChild(this.bgG);
    this.addChild(this.baseG);
    this.addChild(this.horizG);
    this.addChild(this.scanG);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.scanG  as any).blendMode = "add";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.horizG as any).blendMode = "add";
  }

  public async show(): Promise<void> {
    // Pre-compute static world XZ positions (Y is dynamic per-frame)
    for (let iy = 0; iy < NY; iy++) {
      for (let ix = 0; ix < NX; ix++) {
        const idx = iy * NX + ix;
        this.vx[idx] = (ix - (NX - 1) * 0.5) * CELL;
        // iy=0 → far (top of screen), iy=NY-1 → near (bottom of screen)
        this.vz[idx] = (iy - (NY - 1) * 0.5) * CELL;
      }
    }
    this.buildBg();
    this.ready = true;
  }

  public update(time: Ticker): void {
    if (!this.ready) return;
    const dt = time.deltaMS;
    this.elapsed += dt;
    this.tParam  += dt * TERRAIN_SPEED;

    // Recompute heights and screen positions every frame
    for (let iy = 0; iy < NY; iy++) {
      for (let ix = 0; ix < NX; ix++) {
        const idx = iy * NX + ix;
        const h = tHeight(ix, iy, this.tParam);
        this.ht[idx] = h;
        const [sx, sy] = project(this.vx[idx], h * HEIGHT_SCALE, this.vz[idx]);
        this.sx[idx] = sx;
        this.sy[idx] = sy;
      }
    }

    this.drawTerrain();
  }

  public resize(width: number, height: number): void {
    this.x = Math.round((width - W) / 2);
    this.y = Math.round((height - H) / 2);
  }

  // ── Background (static, drawn once) ─────────────────────────────────────────

  private buildBg(): void {
    const g = this.bgG;
    g.rect(0, 0, W, H).fill({ color: CRUST });

    // Very subtle top-of-sky lightening
    for (let i = 1; i <= 4; i++) {
      g.rect(0, 0, W, H * (i / 5)).fill({ color: SURFACE0, alpha: 0.012 * i });
    }

    // Dim background stars
    for (let i = 0; i < 1500; i++) {
      const hue = Math.random();
      const col = hue < 0.65 ? SURFACE1 : hue < 0.85 ? LAVENDER : BLUE;
      g.circle(rnd(0, W), rnd(0, H), rnd(0.3, 1.0)).fill({
        color: col, alpha: rnd(0.04, 0.25),
      });
    }

    // Bright diffraction-spike stars — confined to upper "sky" region
    for (let i = 0; i < 20; i++) {
      const x = rnd(30, W - 30);
      const y = rnd(15, 430);
      const cols = [LAVENDER, BLUE, YELLOW, PINK, TEAL] as const;
      const col  = cols[i % cols.length];
      const al   = rnd(0.5, 0.9);
      g.circle(x, y, rnd(0.7, 1.4)).fill({ color: col, alpha: al });
      const len = rnd(6, 22);
      for (let k = 0; k < 4; k++) {
        const ang = (k / 4) * Math.PI;
        for (const d of [-1, 1] as const) {
          g.moveTo(x, y)
            .lineTo(x + Math.cos(ang) * d * len, y + Math.sin(ang) * d * len)
            .stroke({ color: col, width: 0.4, alpha: al * 0.42 });
        }
      }
    }
  }

  // ── Per-frame terrain draw ───────────────────────────────────────────────────

  private drawTerrain(): void {
    this.baseG.clear();
    this.scanG.clear();
    this.horizG.clear();

    // Smooth ping-pong scan position 0..1
    const scanPos = (Math.sin((TAU * this.elapsed) / SCAN_PERIOD) + 1) * 0.5;

    // Six edge buckets: 0=far-dim | 1=elev-low | 2=elev-mid | 3=elev-high
    //                   4=scan-glow | 5=scan-contour
    const B0: E4[] = [], B1: E4[] = [], B2: E4[] = [],
          B3: E4[] = [], B4: E4[] = [], B5: E4[] = [];

    const classify = (i1: number, i2: number, farness: number) => {
      const h1 = this.ht[i1], h2 = this.ht[i2];
      const hA = (h1 + h2) * 0.5;
      const dist = Math.abs(hA - scanPos);
      const crosses = (h1 < scanPos) !== (h2 < scanPos);
      const e: E4 = [this.sx[i1], this.sy[i1], this.sx[i2], this.sy[i2]];

      if (crosses || dist < SCAN_CORE_W) {
        B5.push(e);
      } else if (dist < SCAN_GLOW_W) {
        B4.push(e);
      } else if (farness > 0.82) {
        B0.push(e);
      } else if (hA > 0.66) {
        B3.push(e);
      } else if (hA > 0.33) {
        B2.push(e);
      } else {
        B1.push(e);
      }
    };

    // Horizontal edges (along X axis)
    for (let iy = 0; iy < NY; iy++) {
      // farness: iy=0 → far (1.0), iy=NY-1 → near (0.0)
      const farness = 1 - iy / (NY - 1);
      for (let ix = 0; ix < NX - 1; ix++) {
        classify(iy * NX + ix, iy * NX + ix + 1, farness);
      }
    }

    // Vertical edges (along Z axis)
    for (let iy = 0; iy < NY - 1; iy++) {
      const farness = 1 - (iy + 0.5) / (NY - 1);
      for (let ix = 0; ix < NX; ix++) {
        classify(iy * NX + ix, (iy + 1) * NX + ix, farness);
      }
    }

    // Draw base buckets (normal blend)
    const baseCfg = [
      { col: SURFACE1, w: 0.35, a: 0.10 }, // 0 far-dim
      { col: SAPPHIRE, w: 0.55, a: 0.20 }, // 1 elev-low
      { col: TEAL,     w: 0.65, a: 0.27 }, // 2 elev-mid
      { col: LAVENDER, w: 0.75, a: 0.34 }, // 3 elev-high
    ] as const;
    const baseBuckets = [B0, B1, B2, B3];

    for (let b = 0; b < 4; b++) {
      const edges = baseBuckets[b];
      if (edges.length === 0) continue;
      for (const [x1, y1, x2, y2] of edges) {
        this.baseG.moveTo(x1, y1).lineTo(x2, y2);
      }
      this.baseG.stroke({ color: baseCfg[b].col, width: baseCfg[b].w, alpha: baseCfg[b].a });
    }

    // Scan glow (additive) — outer band
    if (B4.length > 0) {
      for (const [x1, y1, x2, y2] of B4) {
        this.scanG.moveTo(x1, y1).lineTo(x2, y2);
      }
      this.scanG.stroke({ color: GREEN, width: 2.8, alpha: 0.22 });

      for (const [x1, y1, x2, y2] of B4) {
        this.scanG.moveTo(x1, y1).lineTo(x2, y2);
      }
      this.scanG.stroke({ color: TEAL, width: 1.2, alpha: 0.38 });
    }

    // Scan contour (additive) — core bright line
    if (B5.length > 0) {
      for (const [x1, y1, x2, y2] of B5) {
        this.scanG.moveTo(x1, y1).lineTo(x2, y2);
      }
      this.scanG.stroke({ color: MAUVE, width: 3.5, alpha: 0.45 });

      for (const [x1, y1, x2, y2] of B5) {
        this.scanG.moveTo(x1, y1).lineTo(x2, y2);
      }
      this.scanG.stroke({ color: LAVENDER, width: 1.8, alpha: 0.72 });

      for (const [x1, y1, x2, y2] of B5) {
        this.scanG.moveTo(x1, y1).lineTo(x2, y2);
      }
      this.scanG.stroke({ color: 0xffffff, width: 0.8, alpha: 0.50 });
    }

    // Horizon atmospheric glow + scan band overlay
    const scanWorldY  = scanPos * HEIGHT_SCALE;
    const [, scanSY]  = project(0, scanWorldY, 0);
    const pulse       = 0.55 + 0.45 * Math.sin((TAU * this.elapsed) / SCAN_PERIOD);

    // Scan plane screen band
    const bandH = 6;
    this.horizG.rect(0, scanSY - bandH, W, bandH * 2).fill({
      color: TEAL, alpha: 0.04 * pulse,
    });

    // Horizon atmospheric strip (static position, varies with far edge of terrain)
    const [, horizSY] = project(0, 0, -(NY - 1) * 0.5 * CELL);
    for (let i = 5; i >= 1; i--) {
      this.horizG.rect(0, horizSY - i * 14, W, i * 28).fill({
        color: SAPPHIRE, alpha: 0.007 * i,
      });
    }
  }
}
