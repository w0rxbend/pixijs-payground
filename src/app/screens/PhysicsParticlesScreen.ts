import type { Ticker } from "pixi.js";
import {
  Container,
  Graphics,
  Particle,
  ParticleContainer,
  Texture,
} from "pixi.js";

// ── Palette ──────────────────────────────────────────────────────────────────
const BG_COLOR = 0x11111b;
const LAVENDER_SHADES: readonly number[] = [
  0xb4befe, 0xcba6f7, 0xd0aaff, 0xa89cdc, 0x9e8fdb, 0xbdaaff, 0xc4b0ff,
  0x89b4fa,
];

// ── Particle physics ─────────────────────────────────────────────────────────
const PARTICLE_COUNT = 1500;
const MAX_DT = 0.05;

const GRAVITY_G = 22000;
const GRAVITY_EPS_SQ = 600;
const REPEL_R = 95;
const REPEL_R_SQ = REPEL_R * REPEL_R;
const REPEL_STRENGTH = 28000;
const NOISE_FORCE = 160;
const DAMPING = 0.978;
const MAX_SPEED = 680;
const BOUNCE_RESTITUTION = 0.82;

// ── Pulsation ─────────────────────────────────────────────────────────────────
const PULSE_F1 = 0.55;
const PULSE_F2 = 1.37;
const PULSE_F3 = 0.23;
const PULSE_BIAS = 0.12;
const PULSE_JITTER_DECAY = 0.91;
const PULSE_JITTER_KICK = 0.18;

// ── Ripple waves (invisible — effect lives on the particles) ─────────────────
const RIPPLE_POOL = 3;
const RIPPLE_SPEED_MIN = 90;
const RIPPLE_SPEED_MAX = 240;
const RIPPLE_LIFETIME = 2.2;
const RIPPLE_RANDOM_RATE = 0.04; // ~1 spontaneous wave per 25 s
const RIPPLE_PULSE_COUNT = 0; // no burst on pulsation sign-flip
const WAVE_BAND = 45; // px: width of the ring front that affects particles
const WAVE_VEL_KICK = 70; // radial velocity impulse on hit (px/s)
const PARTICLE_PULSE_DECAY = 0.88; // per normalised frame (dt * 60)
const PARTICLE_PULSE_SCALE = 0.75; // max extra scale on full hit
const PARTICLE_PULSE_ALPHA = 0.35; // max extra alpha on full hit

interface PhysParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseScale: number;
  baseAlpha: number;
  pulse: number; // 0 → 1, decays each frame
  particle: Particle;
}

interface RippleWave {
  x: number;
  y: number;
  r: number;
  speed: number;
  life: number; // 1 → 0
  active: boolean;
}

export class PhysicsParticlesScreen extends Container {
  public static assetBundles: string[] = [];

  private readonly bgGfx = new Graphics();
  private readonly pContainer: ParticleContainer;

  private particles: PhysParticle[] = [];
  private waves: RippleWave[] = [];
  private gradTex!: Texture;

  private w = 1920;
  private h = 1080;
  private time = 0;
  private mouseX = 960;
  private mouseY = 540;

  private pulseJitter = 0;
  private prevPulse = 0;
  private rippleAcc = 0;

  constructor() {
    super();
    this.pContainer = new ParticleContainer({
      dynamicProperties: { position: true, vertex: true, color: true },
    });

    for (let i = 0; i < RIPPLE_POOL; i++) {
      this.waves.push({ x: 0, y: 0, r: 0, speed: 0, life: 0, active: false });
    }

    this.addChild(this.bgGfx);
    this.addChild(this.pContainer);
  }

  public async show(): Promise<void> {
    this.w = window.innerWidth || 1920;
    this.h = window.innerHeight || 1080;
    this.mouseX = this.w / 2;
    this.mouseY = this.h / 2;
    this.gradTex = this._makeGradTex();
    this._spawnParticles();
    window.addEventListener("mousemove", this._onMouse);
  }

  public async hide(): Promise<void> {
    window.removeEventListener("mousemove", this._onMouse);
  }

  public resize(w: number, h: number): void {
    this.w = w;
    this.h = h;
  }

  private readonly _onMouse = (e: MouseEvent): void => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  };

  // ── Gradient texture ───────────────────────────────────────────────────────

  private _makeGradTex(): Texture {
    const sz = 64;
    const canvas = document.createElement("canvas");
    canvas.width = sz;
    canvas.height = sz;
    const ctx = canvas.getContext("2d")!;
    const half = sz / 2;
    const g = ctx.createRadialGradient(half, half, 0, half, half, half);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.7)");
    g.addColorStop(0.8, "rgba(255,255,255,0.2)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, sz, sz);
    return Texture.from(canvas);
  }

  // ── Particle init ──────────────────────────────────────────────────────────

  private _spawnParticles(): void {
    const existing = this.pContainer.particleChildren.length;
    if (existing > 0) this.pContainer.removeParticles(0, existing);
    this.particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const tint = LAVENDER_SHADES[i % LAVENDER_SHADES.length];
      const scale = 0.35 + Math.random() * 0.35;
      const alpha = 0.55 + Math.random() * 0.35;
      const p = new Particle({
        texture: this.gradTex,
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        anchorX: 0.5,
        anchorY: 0.5,
        scaleX: scale,
        scaleY: scale,
        tint,
        alpha,
      });
      this.pContainer.addParticle(p);
      this.particles.push({
        x: p.x,
        y: p.y,
        vx: (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 60,
        baseScale: scale,
        baseAlpha: alpha,
        pulse: 0,
        particle: p,
      });
    }

    this.pContainer.update();
  }

  // ── Wave emit ──────────────────────────────────────────────────────────────

  private _emit(x: number, y: number): void {
    for (const w of this.waves) {
      if (w.active) continue;
      w.x = x;
      w.y = y;
      w.r = 1;
      w.speed =
        RIPPLE_SPEED_MIN +
        Math.random() * (RIPPLE_SPEED_MAX - RIPPLE_SPEED_MIN);
      w.life = 1;
      w.active = true;
      return;
    }
  }

  // ── Pulsation ─────────────────────────────────────────────────────────────

  private _computePulse(): number {
    const t = this.time;
    return (
      Math.sin(t * PULSE_F1 * Math.PI * 2) * 0.55 +
      Math.sin(t * PULSE_F2 * Math.PI * 2) * 0.28 +
      Math.sin(t * PULSE_F3 * Math.PI * 2) * 0.17 +
      this.pulseJitter * 0.22 +
      PULSE_BIAS
    );
  }

  // ── Main update ────────────────────────────────────────────────────────────

  public update(ticker: Ticker): void {
    const dt = Math.min(ticker.deltaMS * 0.001, MAX_DT);
    this.time += dt;

    this.bgGfx.clear();
    this.bgGfx.rect(0, 0, this.w, this.h).fill({ color: BG_COLOR });

    this.pulseJitter += (Math.random() - 0.5) * PULSE_JITTER_KICK;
    this.pulseJitter *= Math.pow(PULSE_JITTER_DECAY, dt * 60);

    const pulse = this._computePulse();

    // Burst waves at pulsation sign-flip
    if (this.prevPulse * pulse < 0) {
      for (let i = 0; i < RIPPLE_PULSE_COUNT; i++) {
        this._emit(
          this.mouseX + (Math.random() - 0.5) * 140,
          this.mouseY + (Math.random() - 0.5) * 140,
        );
      }
      if (this.particles.length > 0) {
        const rp = this.particles[(Math.random() * this.particles.length) | 0];
        this._emit(rp.x, rp.y);
      }
    }
    this.prevPulse = pulse;

    // Spontaneous waves from random particle positions
    this.rippleAcc += RIPPLE_RANDOM_RATE * dt;
    while (this.rippleAcc >= 1) {
      const rp = this.particles[(Math.random() * this.particles.length) | 0];
      this._emit(rp.x, rp.y);
      this.rippleAcc -= 1;
    }

    // Advance wave radii
    const lifeDec = 1 / RIPPLE_LIFETIME;
    for (const w of this.waves) {
      if (!w.active) continue;
      w.r += w.speed * dt;
      w.life -= lifeDec * dt;
      if (w.life <= 0) w.active = false;
    }

    this._updateParticles(dt, pulse);
    this.pContainer.update();
  }

  // ── Particle physics + wave interaction ────────────────────────────────────

  private _updateParticles(dt: number, pulse: number): void {
    const mx = this.mouseX;
    const my = this.mouseY;
    const damp = Math.pow(DAMPING, dt * 60);
    const pulseDamp = Math.pow(PARTICLE_PULSE_DECAY, dt * 60);

    for (const p of this.particles) {
      // Brownian drift
      p.vx += (Math.random() - 0.5) * NOISE_FORCE * dt;
      p.vy += (Math.random() - 0.5) * NOISE_FORCE * dt;

      // Pulsating gravity
      const gdx = mx - p.x;
      const gdy = my - p.y;
      const gDistSq = gdx * gdx + gdy * gdy + GRAVITY_EPS_SQ;
      const gDist = Math.sqrt(gDistSq);
      const gForce = (GRAVITY_G * pulse) / gDistSq;
      p.vx += (gdx / gDist) * gForce * dt;
      p.vy += (gdy / gDist) * gForce * dt;

      // Hard repulsion bubble
      const rdx = p.x - mx;
      const rdy = p.y - my;
      const rDistSq = rdx * rdx + rdy * rdy;
      if (rDistSq < REPEL_R_SQ) {
        const rDist = Math.sqrt(rDistSq) + 0.01;
        const rForce = REPEL_STRENGTH / (rDistSq + 1);
        p.vx += (rdx / rDist) * rForce * dt;
        p.vy += (rdy / rDist) * rForce * dt;
      }

      // Wave ring interaction — only compute sqrt when inside band bounds
      for (const w of this.waves) {
        if (!w.active) continue;
        const wdx = p.x - w.x;
        const wdy = p.y - w.y;
        const wdSq = wdx * wdx + wdy * wdy;
        const lo = w.r - WAVE_BAND;
        const hi = w.r + WAVE_BAND;
        if (wdSq < lo * lo || wdSq > hi * hi) continue;

        const wDist = Math.sqrt(wdSq) + 0.01;
        const intensity = (1 - Math.abs(wDist - w.r) / WAVE_BAND) * w.life;

        // Scale up pulse value (take max so overlapping waves don't cancel)
        p.pulse = Math.max(p.pulse, intensity);

        // Radial velocity kick
        p.vx += (wdx / wDist) * WAVE_VEL_KICK * intensity * dt;
        p.vy += (wdy / wDist) * WAVE_VEL_KICK * intensity * dt;
      }

      // Decay pulse
      p.pulse *= pulseDamp;

      p.vx *= damp;
      p.vy *= damp;

      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > MAX_SPEED) {
        const inv = MAX_SPEED / spd;
        p.vx *= inv;
        p.vy *= inv;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < 0) {
        p.x = 0;
        p.vx = Math.abs(p.vx) * BOUNCE_RESTITUTION;
      } else if (p.x > this.w) {
        p.x = this.w;
        p.vx = -Math.abs(p.vx) * BOUNCE_RESTITUTION;
      }
      if (p.y < 0) {
        p.y = 0;
        p.vy = Math.abs(p.vy) * BOUNCE_RESTITUTION;
      } else if (p.y > this.h) {
        p.y = this.h;
        p.vy = -Math.abs(p.vy) * BOUNCE_RESTITUTION;
      }

      // Sync: pulse modulates scale and brightness
      const s = p.baseScale * (1 + p.pulse * PARTICLE_PULSE_SCALE);
      p.particle.x = p.x;
      p.particle.y = p.y;
      p.particle.scaleX = s;
      p.particle.scaleY = s;
      p.particle.alpha = Math.min(
        1,
        p.baseAlpha + p.pulse * PARTICLE_PULSE_ALPHA,
      );
    }
  }
}
