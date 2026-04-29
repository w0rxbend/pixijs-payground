import type { Ticker } from "pixi.js";
import {
  Container,
  Filter,
  GlProgram,
  Sprite,
  Texture,
  UniformGroup,
} from "pixi.js";

const MAX_BLOBS = 16;
const INITIAL_COUNT = 8;
const MIN_BLOBS = 3;
const BASE_RADIUS = 50;
const MAX_RADIUS = 150;
const SPLIT_RADIUS = 125;
const GRAVITY_STRENGTH = 1550;
const REPULSION_STRENGTH = 150;
const VELOCITY_DAMPING = 0.884;
const NOISE_FORCE = 9;
const BOUNDARY_ELASTIC = 0.92;

// Catppuccin Mocha: [r, g, b, a] in [0,1]
const PALETTE: [number, number, number, number][] = [
  [0.7961, 0.651, 0.9686, 0.72], // Mauve   #cba6f7
  [0.5373, 0.7059, 0.9804, 0.72], // Blue    #89b4fa
  [0.5804, 0.8863, 0.8353, 0.72], // Teal    #94e2d5
  [0.9804, 0.702, 0.5294, 0.72], // Peach   #fab387
  [0.651, 0.8902, 0.6314, 0.72], // Green   #a6e3a1
  [0.9608, 0.7608, 0.9059, 0.72], // Pink    #f5c2e7
  [0.9608, 0.8784, 0.8627, 0.72], // Rosewater #f5e0dc
  [0.5373, 0.8627, 0.9216, 0.72], // Sky     #89dceb
];

// Standard PixiJS v8 filter vertex shader.
// GlProgram auto-prepends #version 300 es when fragment uses it.
const FILTER_VERT = `in vec2 aPosition;
out vec2 vTextureCoord;
uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
vec4 filterVertexPosition(void) {
  vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
  position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
  position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
  return vec4(position, 0.0, 1.0);
}
vec2 filterTextureCoord(void) {
  return aPosition * (uOutputFrame.zw * uInputSize.zw);
}
void main(void) {
  gl_Position = filterVertexPosition();
  vTextureCoord = filterTextureCoord();
}`;

// Metaball fragment: for each pixel, sums r²/d² field from all active blobs.
// Angular noise on the effective radius deforms each blob outline so it is
// never a perfect circle.  Weighted color blend gives smooth hue transitions
// where blobs meet.
const METABALL_FRAG = `#version 300 es
precision highp float;

in vec2 vTextureCoord;
out vec4 fragColor;

uniform sampler2D uTexture;
uniform vec4 uInputSize;
uniform vec4 uOutputFrame;

uniform vec4 uBlobData[16];    // xy = screen pos (px), z = base radius (px), w = unused
uniform vec4 uBlobColors[16];  // rgba in [0,1], Catppuccin Mocha
uniform float uTime;

void main() {
  // Reconstruct screen-space pixel position from filter UV.
  vec2 sp = vTextureCoord * uInputSize.xy + uOutputFrame.xy;

  float field = 0.0;
  vec4 blendColor = vec4(0.0);

  for (int i = 0; i < 16; i++) {
    float baseR = uBlobData[i].z;
    if (baseR < 1.0) continue;          // inactive slot

    vec2 bpos  = uBlobData[i].xy;
    vec2 delta = sp - bpos;
    float d2   = max(dot(delta, delta), 1.0);

    // Angle-dependent radius noise makes outline amorphous.
    float angle = atan(delta.y, delta.x);
    float fi    = float(i);
    float rNoise = baseR * (
        1.0
      + 0.14 * sin(angle * 3.0 + uTime * 1.3  + fi * 1.1)
      + 0.08 * cos(angle * 5.0 - uTime * 0.9  + fi * 0.7)
      + 0.04 * sin(angle * 7.0 + uTime * 2.05 + fi * 1.7)
    );

    float contrib = rNoise * rNoise / d2;
    field      += contrib;
    blendColor += uBlobColors[i] * contrib;
  }

  const float THR = 1.0;
  if (field > THR * 0.82) {
    blendColor /= max(field, 0.001);
    float alpha = smoothstep(THR * 0.82, THR * 1.38, field);
    fragColor = vec4(blendColor.rgb, blendColor.a * alpha);
  } else {
    fragColor = vec4(0.0);
  }
}`;

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  colorIndex: number;
  noisePhase: number;
}

export class MetaBlobsScreen extends Container {
  public static assetBundles: string[] = [];

  private quad!: Sprite;
  private metaFilter!: Filter;
  private blobDataArr = new Float32Array(MAX_BLOBS * 4);
  private blobColorsArr = new Float32Array(MAX_BLOBS * 4);
  private blobDataUG!: UniformGroup;

  private blobs: Blob[] = [];
  private w = 1920;
  private h = 1080;
  private time = 0;

  public async show(): Promise<void> {
    this.w = window.innerWidth || this.w;
    this.h = window.innerHeight || this.h;
    this._initBlobs();
    this._initFilter();
  }

  public resize(width: number, height: number): void {
    this.w = width;
    this.h = height;
    if (this.quad) {
      this.quad.width = width;
      this.quad.height = height;
    }
  }

  private _initBlobs(): void {
    this.blobs = [];
    for (let i = 0; i < INITIAL_COUNT; i++) {
      const angle = (i / INITIAL_COUNT) * Math.PI * 2;
      const spread = Math.min(this.w, this.h) * 0.28;
      this.blobs.push({
        x:
          this.w * 0.5 +
          Math.cos(angle) * spread * (0.55 + Math.random() * 0.45),
        y:
          this.h * 0.5 +
          Math.sin(angle) * spread * (0.55 + Math.random() * 0.45),
        vx: (Math.random() - 0.5) * 90,
        vy: (Math.random() - 0.5) * 90,
        radius: BASE_RADIUS * (0.85 + Math.random() * 0.3),
        mass: 1,
        colorIndex: i,
        noisePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  private _initFilter(): void {
    this.blobDataUG = new UniformGroup({
      uBlobData: {
        value: this.blobDataArr,
        type: "vec4<f32>",
        size: MAX_BLOBS,
      },
      uBlobColors: {
        value: this.blobColorsArr,
        type: "vec4<f32>",
        size: MAX_BLOBS,
      },
      uTime: { value: 0, type: "f32" },
    });

    this.metaFilter = new Filter({
      glProgram: new GlProgram({
        vertex: FILTER_VERT,
        fragment: METABALL_FRAG,
      }),
      resources: { blobDataUG: this.blobDataUG },
    });

    this.quad = new Sprite(Texture.WHITE);
    this.quad.width = this.w;
    this.quad.height = this.h;
    this.quad.filters = [this.metaFilter];
    this.addChild(this.quad);
  }

  private _syncUniforms(): void {
    for (let i = 0; i < MAX_BLOBS; i++) {
      if (i < this.blobs.length) {
        const b = this.blobs[i];
        const base = i * 4;
        this.blobDataArr[base] = b.x;
        this.blobDataArr[base + 1] = b.y;
        this.blobDataArr[base + 2] = b.radius;
        this.blobDataArr[base + 3] = 0;
        const c = PALETTE[b.colorIndex % PALETTE.length];
        this.blobColorsArr[base] = c[0];
        this.blobColorsArr[base + 1] = c[1];
        this.blobColorsArr[base + 2] = c[2];
        this.blobColorsArr[base + 3] = c[3];
      } else {
        const base = i * 4;
        this.blobDataArr[base] = -99999;
        this.blobDataArr[base + 1] = -99999;
        this.blobDataArr[base + 2] = 0;
        this.blobDataArr[base + 3] = 0;
      }
    }
    this.blobDataUG.uniforms.uTime = this.time;
  }

  public update(ticker: Ticker): void {
    const dt = Math.min(ticker.deltaMS * 0.001, 0.05);
    this.time += dt;
    this._physics(dt);
    this._merge();
    this._split();
    this._syncUniforms();
  }

  private _physics(dt: number): void {
    const blobs = this.blobs;
    const t = this.time;

    // Perlin-like noise: layered sines at independent phases per blob
    for (const b of blobs) {
      const p = b.noisePhase;
      const nx =
        Math.sin(t * 1.1 + p) * Math.cos(t * 0.7 + p * 1.5) +
        Math.sin(t * 0.5 + p * 0.9) * 0.4;
      const ny =
        Math.cos(t * 0.9 + p * 1.2) * Math.sin(t * 1.3 + p * 0.6) +
        Math.cos(t * 0.6 + p * 1.8) * 0.4;
      b.vx += nx * NOISE_FORCE * dt;
      b.vy += ny * NOISE_FORCE * dt;
    }

    // Pairwise attraction / elastic repulsion
    for (let i = 0; i < blobs.length; i++) {
      for (let j = i + 1; j < blobs.length; j++) {
        const a = blobs[i];
        const bj = blobs[j];
        const dx = bj.x - a.x;
        const dy = bj.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
        const nx = dx / dist;
        const ny = dy / dist;
        const contact = a.radius + bj.radius;

        if (dist < contact) {
          const overlap = contact - dist;
          const f = REPULSION_STRENGTH * overlap;
          a.vx -= (nx * f * dt) / a.mass;
          a.vy -= (ny * f * dt) / a.mass;
          bj.vx += (nx * f * dt) / bj.mass;
          bj.vy += (ny * f * dt) / bj.mass;
        } else {
          const f = (GRAVITY_STRENGTH * a.mass * bj.mass) / (dist * dist + 250);
          a.vx += (nx * f * dt) / a.mass;
          a.vy += (ny * f * dt) / a.mass;
          bj.vx -= (nx * f * dt) / bj.mass;
          bj.vy -= (ny * f * dt) / bj.mass;
        }
      }
    }

    // Integrate, damp, soft-bounce at edges
    const damp = Math.pow(VELOCITY_DAMPING, dt * 60);
    for (const b of blobs) {
      b.vx *= damp;
      b.vy *= damp;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      const pad = b.radius * 0.55;
      if (b.x < pad) {
        b.x = pad;
        b.vx = Math.abs(b.vx) * BOUNDARY_ELASTIC;
      }
      if (b.x > this.w - pad) {
        b.x = this.w - pad;
        b.vx = -Math.abs(b.vx) * BOUNDARY_ELASTIC;
      }
      if (b.y < pad) {
        b.y = pad;
        b.vy = Math.abs(b.vy) * BOUNDARY_ELASTIC;
      }
      if (b.y > this.h - pad) {
        b.y = this.h - pad;
        b.vy = -Math.abs(b.vy) * BOUNDARY_ELASTIC;
      }
    }
  }

  private _merge(): void {
    const blobs = this.blobs;
    let i = blobs.length - 1;
    while (i >= 1) {
      let didMerge = false;
      for (let j = i - 1; j >= 0; j--) {
        if (blobs.length <= MIN_BLOBS) break;
        const a = blobs[j];
        const bi = blobs[i];
        const dx = bi.x - a.x;
        const dy = bi.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < (a.radius + bi.radius) * 0.32) {
          const tm = a.mass + bi.mass;
          a.x = (a.x * a.mass + bi.x * bi.mass) / tm;
          a.y = (a.y * a.mass + bi.y * bi.mass) / tm;
          a.vx = (a.vx * a.mass + bi.vx * bi.mass) / tm;
          a.vy = (a.vy * a.mass + bi.vy * bi.mass) / tm;
          a.radius = Math.min(
            Math.sqrt(a.radius ** 2 + bi.radius ** 2),
            MAX_RADIUS,
          );
          a.mass = tm;
          blobs.splice(i, 1);
          didMerge = true;
          break;
        }
      }
      if (!didMerge) i--;
    }
  }

  private _split(): void {
    const blobs = this.blobs;
    for (let i = blobs.length - 1; i >= 0; i--) {
      const b = blobs[i];
      if (b.radius < SPLIT_RADIUS || blobs.length >= MAX_BLOBS - 1) continue;

      const nr = b.radius / Math.SQRT2;
      const sa = Math.atan2(b.vy || 1, b.vx || 0) + Math.PI * 0.5;
      const off = nr * 0.55;

      const c1: Blob = {
        x: b.x + Math.cos(sa) * off,
        y: b.y + Math.sin(sa) * off,
        vx: b.vx + Math.cos(sa) * 55,
        vy: b.vy + Math.sin(sa) * 55,
        radius: nr,
        mass: b.mass * 0.5,
        colorIndex: b.colorIndex,
        noisePhase: b.noisePhase,
      };
      const c2: Blob = {
        x: b.x - Math.cos(sa) * off,
        y: b.y - Math.sin(sa) * off,
        vx: b.vx - Math.cos(sa) * 55,
        vy: b.vy - Math.sin(sa) * 55,
        radius: nr,
        mass: b.mass * 0.5,
        colorIndex: (b.colorIndex + 1) % PALETTE.length,
        noisePhase: b.noisePhase + Math.PI,
      };
      blobs.splice(i, 1, c1, c2);
    }
  }
}
