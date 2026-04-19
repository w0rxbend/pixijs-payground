import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

// ── Catppuccin Mocha ──────────────────────────────────────────────────────────
const C_CRUST = 0x11111b;
const C_BASE  = 0x1e1e2e;

const ACCENTS = [
  0xcba6f7, // Mauve
  0x89b4fa, // Blue
  0x74c7ec, // Sapphire
  0x89dceb, // Sky
  0x94e2d5, // Teal
  0xa6e3a1, // Green
  0xf9e2af, // Yellow
  0xfab387, // Peach
  0xeba0ac, // Maroon
  0xf38ba8, // Red
  0xf5c2e7, // Pink
  0xf2cdcd, // Flamingo
  0xb4befe, // Lavender
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Particle {
  theta:      number; // longitude [0, 2π]
  phi:        number; // colatitude [0, π]
  color:      number;
  size:       number;
  elev:       number; // current terrain elevation (fraction of radius)
  elevTarget: number; // target elevation
  elevSpeed:  number; // lerp speed toward target
  dTheta:     number; // drift on theta per tick
  dPhi:       number; // drift on phi per tick
}

interface Projected {
  p:   Particle;
  px:  number;
  py:  number;
  pz:  number;
}

// ── Tuning ────────────────────────────────────────────────────────────────────
const PARTICLE_COUNT = 900;
const RADIUS_FRAC    = 0.36;
const SPIN_SPEED     = 0.0025;
const SCAN_SPEED_PX  = 40; // px per second

export class PlanetHologramScreen extends Container {
  public static assetBundles: string[] = [];

  private readonly bg  = new Graphics();
  private readonly gfx = new Graphics();
  private W = 1920;
  private H = 1080;
  private particles: Particle[] = [];
  private rotY  = 0;
  private rotX  = 0.25;
  private time  = 0;
  private scanY = 0;

  constructor() {
    super();
    this.addChild(this.bg);
    this.addChild(this.gfx);
    this.buildParticles();
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  public resize(width: number, height: number): void {
    this.W = width;
    this.H = height;
  }

  public update(ticker: Ticker): void {
    const dt = ticker.deltaTime;
    this.time += dt * 0.016;
    this.rotY += SPIN_SPEED * dt;
    this.rotX = 0.25 + Math.sin(this.time * 0.25) * 0.06;

    const R  = Math.min(this.W, this.H) * RADIUS_FRAC;
    const cx = this.W / 2;
    const cy = this.H / 2;

    // Scan line sweeps top to bottom of sphere
    this.scanY += SCAN_SPEED_PX * (ticker.deltaMS / 1000);
    if (this.scanY > R * 2) this.scanY = 0;

    // Update terrain elevation and surface drift
    for (const p of this.particles) {
      p.elev += (p.elevTarget - p.elev) * p.elevSpeed * dt;
      if (Math.abs(p.elevTarget - p.elev) < 0.004) {
        p.elevTarget = (Math.random() - 0.5) * 0.18;
      }
      p.theta += p.dTheta * dt;
      p.phi   += p.dPhi   * dt;
      // Bounce phi off the poles
      if (p.phi < 0.08)           p.dPhi =  Math.abs(p.dPhi);
      if (p.phi > Math.PI - 0.08) p.dPhi = -Math.abs(p.dPhi);
    }

    this.draw(R, cx, cy);
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  // Fibonacci sphere distribution for even particle coverage
  private buildParticles(): void {
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phi   = Math.acos(1 - 2 * (i + 0.5) / PARTICLE_COUNT);
      const theta = golden * i;
      this.particles.push({
        theta,
        phi,
        color:      ACCENTS[Math.floor(Math.random() * ACCENTS.length)],
        size:       1.4 + Math.random() * 2.2,
        elev:       (Math.random() - 0.5) * 0.1,
        elevTarget: (Math.random() - 0.5) * 0.18,
        elevSpeed:  0.003 + Math.random() * 0.007,
        dTheta:     (Math.random() - 0.5) * 0.0008,
        dPhi:       (Math.random() - 0.5) * 0.0004,
      });
    }
  }

  private projectParticle(p: Particle, baseR: number, cx: number, cy: number): Projected {
    const r = baseR * (1 + p.elev);
    const t = p.theta + this.rotY;

    // Spherical → Cartesian
    const sinP = Math.sin(p.phi);
    const x0   =  r * sinP * Math.cos(t);
    const y0   =  r * Math.cos(p.phi);
    const z0   =  r * sinP * Math.sin(t);

    // X-axis tilt rotation
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);

    return {
      p,
      px: cx + x0,
      py: cy + (y0 * cosX - z0 * sinX),
      pz:       y0 * sinX + z0 * cosX,
    };
  }

  private draw(R: number, cx: number, cy: number): void {
    const g    = this.gfx;
    const bg   = this.bg;
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);

    g.clear();
    bg.clear();

    // ── Planet disc + inner haze ──────────────────────────────────────────────
    bg.circle(cx, cy, R);
    bg.fill({ color: C_CRUST, alpha: 1 });
    bg.circle(cx, cy, R * 0.92);
    bg.fill({ color: C_BASE, alpha: 0.25 });

    // ── Atmosphere glow rings ─────────────────────────────────────────────────
    for (let i = 4; i >= 1; i--) {
      bg.circle(cx, cy, R + i * 14);
      bg.stroke({ color: 0x89b4fa, width: 10, alpha: 0.025 * i });
    }
    bg.circle(cx, cy, R + 5);
    bg.stroke({ color: 0x89dceb, width: 2.5, alpha: 0.38 });
    bg.circle(cx, cy, R + 2);
    bg.stroke({ color: 0xb4befe, width: 1, alpha: 0.22 });

    // ── Latitude grid lines ───────────────────────────────────────────────────
    for (let lat = -60; lat <= 60; lat += 30) {
      const phi  = (90 - lat) * (Math.PI / 180);
      const rLat = R * Math.sin(phi);
      const yOff = R * Math.cos(phi) * cosX;
      const ry   = rLat * Math.abs(sinX) + 0.5;
      bg.ellipse(cx, cy + yOff, rLat, ry);
      bg.stroke({ color: 0x313244, width: 1, alpha: 0.28 });
    }
    // Equator — slightly brighter
    bg.ellipse(cx, cy, R, R * Math.abs(sinX) + 0.5);
    bg.stroke({ color: 0x74c7ec, width: 1, alpha: 0.22 });

    // ── Sort particles back-to-front (painter's algorithm) ────────────────────
    const projected = this.particles
      .map(p => this.projectParticle(p, R, cx, cy))
      .sort((a, b) => a.pz - b.pz);

    for (const { p, px, py, pz } of projected) {
      const zNorm = (pz + R) / (2 * R); // 0 = far back, 1 = front centre
      if (zNorm < 0.04) continue;

      const alpha = 0.12 + zNorm * 0.88;
      const size  = p.size * (0.35 + zNorm * 0.75);

      // Soft glow halo for bright front-facing particles
      if (zNorm > 0.62) {
        const glowA = ((zNorm - 0.62) / 0.38) * 0.2;
        g.circle(px, py, size * 3.8);
        g.fill({ color: p.color, alpha: glowA });
      }

      g.circle(px, py, size);
      g.fill({ color: p.color, alpha });
    }

    // ── Hologram scan line ────────────────────────────────────────────────────
    const sy = cy - R + this.scanY;
    const hw = Math.sqrt(Math.max(0, R * R - (sy - cy) ** 2));
    if (hw > 1) {
      g.rect(cx - hw, sy, hw * 2, 1.5);
      g.fill({ color: 0x89dceb, alpha: 0.24 });
      g.rect(cx - hw, sy + 2.5, hw * 2, 0.8);
      g.fill({ color: 0x89dceb, alpha: 0.09 });
    }

    // ── Sphere outline ────────────────────────────────────────────────────────
    g.circle(cx, cy, R);
    g.stroke({ color: 0x74c7ec, width: 1.5, alpha: 0.5 });
  }
}
