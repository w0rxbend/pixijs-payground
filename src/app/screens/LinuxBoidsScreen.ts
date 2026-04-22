import type { Ticker } from "pixi.js";
import {
  Assets,
  Container,
  Graphics,
  Rectangle,
  Sprite,
  Texture,
} from "pixi.js";

// ── Catppuccin Crust / Mocha palette ─────────────────────────────────────────
const GROUP_COLORS = [
  0x89b4fa, // Blue
  0xa6e3a1, // Green
  0xf38ba8, // Red
  0xfab387, // Peach
  0xcba6f7, // Mauve
  0x89dceb, // Sky
] as const;

// ── Sprite sheet: sprite-linux.png — 2816 × 1536, 188 px per cell ────────────
const CELL = 201;
const SHEET_COLS = Math.floor(2816 / CELL); // 14
const SHEET_ROWS = Math.floor(1539 / CELL - 8); // 8

const N_GROUPS = GROUP_COLORS.length; // 6
const N_PER_GROUP = 10;
const ICONS_PER_GROUP = 10;
const SPRITE_DISPLAY = 34; // rendered px

// ── Boid physics ──────────────────────────────────────────────────────────────
const MAX_SPEED = 190;
const MIN_SPEED = 40;
const MAX_FORCE = 80;
const SEP_R = 30;
const SEP_W = 6.0;
const ALI_R = 68;
const ALI_W = 0.9;
const COH_R = 88;
const COH_W = 0.65;
const GRP_R = 280;
const GRP_W = 0.8; // looser — lets groups split and reform

// ── Movement Noise & Zig-Zag ──────────────────────────────────────────────────
const WANDER_W = 12.0; // Random jitter strength
const ZIGZAG_W = 15.0; // Lateral oscillation strength
const ZIGZAG_FREQ = 3.5; // Cycles per second

// ── Rocket smoke ──────────────────────────────────────────────────────────────
const SMOKE_RATE = 0.045; // s between puffs
const SMOKE_LIFE = 0.35; // s total lifetime
const SMOKE_R0 = 2; // initial radius
const SMOKE_R1 = 12; // final radius
const SMOKE_DRIFT = 14; // backward drift speed px/s

interface SmokePuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: number;
}

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  groupId: number;
  color: number;
  sprite: Sprite;
  smoke: SmokePuff[];
  smokeTimer: number;
  wanderAngle: number; // independent noise direction
  zigzagPhase: number;
}

export class LinuxBoidsScreen extends Container {
  public static assetBundles: string[] = ["main"];

  private readonly smokeGfx = new Graphics();
  private readonly spriteCont = new Container();

  private w = 1920;
  private h = 1080;
  private boids: Boid[] = [];
  private readonly grid = new Map<number, number[]>();
  private readonly cs = ALI_R; // spatial-grid cell size

  constructor() {
    super();
    this.addChild(this.smokeGfx);
    this.addChild(this.spriteCont);
  }

  public async show(): Promise<void> {
    this.w = window.innerWidth || 1920;
    this.h = window.innerHeight || 1080;
    this.initBoids();
  }

  public async hide(): Promise<void> {
    this.spriteCont.removeChildren();
    this.boids = [];
  }

  public resize(w: number, h: number): void {
    this.w = w;
    this.h = h;
  }

  // ── Initialise boids from sprite sheet ────────────────────────────────────

  private initBoids(): void {
    this.spriteCont.removeChildren();
    this.boids = [];

    const tex = Assets.get<Texture>("sprite-linux.png");

    for (let g = 0; g < N_GROUPS; g++) {
      const color = GROUP_COLORS[g];

      for (let i = 0; i < N_PER_GROUP; i++) {
        const cellIdx =
          (g * ICONS_PER_GROUP + (i % ICONS_PER_GROUP)) %
          (SHEET_COLS * SHEET_ROWS);
        const col = cellIdx % SHEET_COLS;
        const row = Math.floor(cellIdx / SHEET_COLS);
        const frame = new Rectangle(col * CELL, row * CELL, CELL, CELL);
        const iconTex = new Texture({ source: tex.source, frame });

        const sprite = new Sprite(iconTex);
        sprite.anchor.set(0.5);
        sprite.scale.set(SPRITE_DISPLAY / CELL);
        sprite.tint = color;
        sprite.alpha = 0.9;
        this.spriteCont.addChild(sprite);

        // Scatter each group into one of 6 screen zones
        const zW = this.w / 3;
        const zH = this.h / 2;
        const bx = (g % 3) * zW + zW * 0.15 + Math.random() * zW * 0.7;
        const by =
          Math.floor(g / 3) * zH + zH * 0.15 + Math.random() * zH * 0.7;

        const a = Math.random() * Math.PI * 2;
        const v = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);

        this.boids.push({
          x: bx,
          y: by,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          groupId: g,
          color,
          sprite,
          smoke: [],
          smokeTimer: Math.random() * SMOKE_RATE,
          wanderAngle: Math.random() * Math.PI * 2,
          zigzagPhase: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  // ── Spatial grid helpers ──────────────────────────────────────────────────

  private cellKey(x: number, y: number): number {
    return Math.floor(x / this.cs) * 10000 + Math.floor(y / this.cs);
  }

  private buildGrid(): void {
    this.grid.clear();
    for (let i = 0; i < this.boids.length; i++) {
      const k = this.cellKey(this.boids[i].x, this.boids[i].y);
      if (!this.grid.has(k)) this.grid.set(k, []);
      this.grid.get(k)!.push(i);
    }
  }

  private neighbors(b: Boid, radius: number): Boid[] {
    const cs = this.cs;
    const bx = Math.floor(b.x / cs);
    const by = Math.floor(b.y / cs);
    const range = Math.ceil(radius / cs);
    const res: Boid[] = [];
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        const cell = this.grid.get((bx + dx) * 10000 + (by + dy));
        if (!cell) continue;
        for (const idx of cell) {
          const n = this.boids[idx];
          if (n === b) continue;
          const ex = n.x - b.x,
            ey = n.y - b.y;
          if (ex * ex + ey * ey < radius * radius) res.push(n);
        }
      }
    }
    return res;
  }

  // ── Per-frame update ──────────────────────────────────────────────────────

  public update(ticker: Ticker): void {
    const dt = Math.min(ticker.deltaMS * 0.001, 0.033);
    this.buildGrid();

    for (const b of this.boids) {
      // ── Separation (linear push, strongest at contact) ────────────────────
      let sx = 0,
        sy = 0;
      for (const n of this.neighbors(b, SEP_R)) {
        const dx = b.x - n.x,
          dy = b.y - n.y;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.0001;
        if (d < SEP_R) {
          const push = (SEP_R - d) / d; // linear falloff from edge
          sx += dx * push;
          sy += dy * push;
        }
      }

      // ── Alignment ────────────────────────────────────────────────────────
      let ax = 0,
        ay = 0;
      const aliN = this.neighbors(b, ALI_R);
      for (const n of aliN) {
        ax += n.vx;
        ay += n.vy;
      }
      if (aliN.length > 0) {
        ax /= aliN.length;
        ay /= aliN.length;
      }

      // ── Cohesion ──────────────────────────────────────────────────────────
      let cohX = 0,
        cohY = 0,
        nCoh = 0;
      for (const n of this.neighbors(b, COH_R)) {
        cohX += n.x;
        cohY += n.y;
        nCoh++;
      }
      if (nCoh > 0) {
        cohX = cohX / nCoh - b.x;
        cohY = cohY / nCoh - b.y;
      }

      // ── Group cohesion: pull toward same-group centroid ───────────────────
      let gcX = 0,
        gcY = 0,
        gcN = 0;
      for (const n of this.boids) {
        if (n === b || n.groupId !== b.groupId) continue;
        const ex = n.x - b.x,
          ey = n.y - b.y;
        if (ex * ex + ey * ey < GRP_R * GRP_R) {
          gcX += n.x;
          gcY += n.y;
          gcN++;
        }
      }
      if (gcN > 0) {
        gcX = gcX / gcN - b.x;
        gcY = gcY / gcN - b.y;
      }

      // ── Zig-Zag & Random Wander ───────────────────────────────────────────
      b.zigzagPhase += dt * ZIGZAG_FREQ * Math.PI * 2;
      const zig = Math.sin(b.zigzagPhase);
      const bSpd = Math.sqrt(b.vx * b.vx + b.vy * b.vy) + 0.0001;
      // Perpendicular vector for lateral push
      const lx = -b.vy / bSpd;
      const ly = b.vx / bSpd;

      // Update wander angle
      b.wanderAngle += (Math.random() - 0.5) * 1.5;
      const wx = Math.cos(b.wanderAngle);
      const wy = Math.sin(b.wanderAngle);

      // ── Steer + clamp ─────────────────────────────────────────────────────
      const stX =
        sx * SEP_W +
        ax * ALI_W +
        cohX * COH_W +
        gcX * GRP_W +
        lx * zig * ZIGZAG_W +
        wx * WANDER_W;
      const stY =
        sy * SEP_W +
        ay * ALI_W +
        cohY * COH_W +
        gcY * GRP_W +
        ly * zig * ZIGZAG_W +
        wy * WANDER_W;
      const sLen = Math.sqrt(stX * stX + stY * stY) + 0.0001;
      const fCap = Math.min(sLen, MAX_FORCE) / sLen;

      b.vx += stX * fCap * dt;
      b.vy += stY * fCap * dt;

      const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy) + 0.0001;
      if (spd > MAX_SPEED) {
        b.vx = (b.vx / spd) * MAX_SPEED;
        b.vy = (b.vy / spd) * MAX_SPEED;
      }
      if (spd < MIN_SPEED) {
        b.vx = (b.vx / spd) * MIN_SPEED;
        b.vy = (b.vy / spd) * MIN_SPEED;
      }

      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Screen wrap
      if (b.x < -20) b.x += this.w + 40;
      else if (b.x > this.w + 20) b.x -= this.w + 40;
      if (b.y < -20) b.y += this.h + 40;
      else if (b.y > this.h + 20) b.y -= this.h + 40;

      // ── Rocket smoke emission ─────────────────────────────────────────────
      b.smokeTimer += dt;
      if (b.smokeTimer >= SMOKE_RATE) {
        b.smokeTimer -= SMOKE_RATE;
        const s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (s > MIN_SPEED * 0.5) {
          // unit vector pointing backward from velocity
          const bx = -b.vx / s,
            by = -b.vy / s;
          // perpendicular spread
          const spread = (Math.random() - 0.5) * 7;
          b.smoke.push({
            x: b.x + bx * 12 + -by * spread,
            y: b.y + by * 12 + bx * spread,
            vx: bx * SMOKE_DRIFT + -by * spread * 0.4,
            vy: by * SMOKE_DRIFT + bx * spread * 0.4,
            life: SMOKE_LIFE,
            color: b.color,
          });
        }
      }

      // Age and drift smoke particles
      for (let i = b.smoke.length - 1; i >= 0; i--) {
        const p = b.smoke[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= dt;
        if (p.life <= 0) b.smoke.splice(i, 1);
      }

      // ── Update sprite pose ────────────────────────────────────────────────
      b.sprite.x = b.x;
      b.sprite.y = b.y;
      b.sprite.rotation = Math.atan2(b.vy, b.vx) + Math.PI / 2;
    }

    // ── Hard separation: push overlapping pairs apart, no steering needed ────

    // ── Smoke / rocket exhaust ────────────────────────────────────────────────
    this.smokeGfx.clear();
    for (const b of this.boids) {
      for (const p of b.smoke) {
        const t = 1 - p.life / SMOKE_LIFE; // 0 = just spawned, 1 = expiring
        const r = SMOKE_R0 + (SMOKE_R1 - SMOKE_R0) * t;
        const alpha = Math.pow(1 - t, 1.6) * 0.45;
        // Coloured core
        this.smokeGfx.circle(p.x, p.y, r).fill({ color: p.color, alpha });
        // White-grey outer halo (desaturates as it ages)
        this.smokeGfx
          .circle(p.x, p.y, r * 1.9)
          .fill({ color: 0xaaaaaa, alpha: alpha * 0.18 });
      }
    }
  }
}
