import type { Ticker } from "pixi.js";
import { Container, Filter, GlProgram, Graphics, UniformGroup } from "pixi.js";

// ── Catppuccin Mocha accents as normalized RGB [0-1] ─────────────────────────
const PALETTE: Array<[number, number, number]> = [
  [0.796, 0.651, 0.969], // Mauve     #cba6f7
  [0.537, 0.706, 0.980], // Blue      #89b4fa
  [0.455, 0.780, 0.925], // Sapphire  #74c7ec
  [0.537, 0.863, 0.922], // Sky       #89dceb
  [0.580, 0.886, 0.835], // Teal      #94e2d5
  [0.651, 0.890, 0.631], // Green     #a6e3a1
  [0.976, 0.886, 0.686], // Yellow    #f9e2af
  [0.980, 0.702, 0.529], // Peach     #fab387
  [0.918, 0.627, 0.675], // Maroon    #eba0ac
  [0.953, 0.545, 0.659], // Red       #f38ba8
  [0.961, 0.761, 0.906], // Pink      #f5c2e7
  [0.949, 0.804, 0.804], // Flamingo  #f2cdcd
  [0.706, 0.745, 0.996], // Lavender  #b4befe
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface Cell {
  x:  number;
  y:  number;
  vx: number;
  vy: number;
}

// ── Tuning ────────────────────────────────────────────────────────────────────
const MAX_SEEDS  = 30; // must match GLSL array size
const SEED_COUNT = 25;

// ── Vertex shader (standard PixiJS v8 filter quad) ───────────────────────────
const VERT = `
  in vec2 aPosition;
  out vec2 vTextureCoord;

  uniform vec4 uInputSize;
  uniform vec4 uOutputFrame;
  uniform vec4 uOutputTexture;

  void main(void) {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 / uOutputTexture.y) - 1.0;
    gl_Position = vec4(position, 0.0, 1.0);
    vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
  }
`;

// ── Fragment shader — Voronoi ─────────────────────────────────────────────────
const FRAG = `
  in vec2 vTextureCoord;
  out vec4 finalColor;

  uniform vec4 uInputSize;
  uniform vec2 uSeeds[30];
  uniform vec3 uColors[30];
  uniform int  uSeedCount;
  uniform float uTime;

  void main(void) {
    vec2 px = vTextureCoord * uInputSize.xy;

    float minDist = 1.0e9;
    float secDist = 1.0e9;
    int   nearIdx = 0;

    for (int i = 0; i < 30; i++) {
      if (i >= uSeedCount) break;
      float d = distance(px, uSeeds[i]);
      if (d < minDist) {
        secDist = minDist;
        minDist = d;
        nearIdx = i;
      } else if (d < secDist) {
        secDist = d;
      }
    }

    vec3  cellCol  = uColors[nearIdx];
    float edgeDist = secDist - minDist;

    // Pulsing edge width driven by time
    float pulse    = 0.5 + 0.5 * sin(uTime * 1.2);
    float edgeLine = 1.0 - smoothstep(0.0, 4.0 + pulse * 4.0, edgeDist);
    float fillMask = smoothstep(0.0, 22.0, edgeDist);

    // Dark Crust base
    vec3 crust = vec3(0.0667, 0.0667, 0.1059); // #11111b

    // Cell interior: almost-dark tinted fill that fades from seed outward
    float fade    = clamp(minDist / 220.0, 0.0, 1.0);
    vec3 interior = mix(crust, cellCol * 0.22, fillMask * (0.35 + fade * 0.3));

    // Overlay bright edge
    vec3 col = mix(interior, cellCol * 0.9, edgeLine * 0.95);

    // Tight seed-centre glow
    float seedGlow = 1.0 - smoothstep(0.0, 14.0, minDist);
    col += cellCol * seedGlow * 0.45;

    finalColor = vec4(col, 1.0);
  }
`;

export class VoronoiScreen extends Container {
  public static assetBundles: string[] = [];

  private readonly bg = new Graphics();
  private readonly ug: UniformGroup;
  private readonly seedPos   = new Float32Array(MAX_SEEDS * 2);
  private readonly seedColor = new Float32Array(MAX_SEEDS * 3);
  private cells: Cell[] = [];
  private W = 1920;
  private H = 1080;
  private time = 0;

  constructor() {
    super();

    // Pre-fill static color array — color per cell index, cycling palette
    for (let i = 0; i < MAX_SEEDS; i++) {
      const [r, g, b] = PALETTE[i % PALETTE.length];
      this.seedColor[i * 3]     = r;
      this.seedColor[i * 3 + 1] = g;
      this.seedColor[i * 3 + 2] = b;
    }

    // UniformGroup with isStatic:false (default) — re-uploads every frame
    this.ug = new UniformGroup({
      uSeeds:     { value: this.seedPos,   type: "array<vec2<f32>, 30>" },
      uColors:    { value: this.seedColor, type: "array<vec3<f32>, 30>" },
      uSeedCount: { value: SEED_COUNT,     type: "i32" },
      uTime:      { value: 0,              type: "f32" },
    });

    const voronoiFilter = new Filter({
      glProgram: new GlProgram({ vertex: VERT, fragment: FRAG }),
      resources: { voronoiUniforms: this.ug },
    });

    this.bg.filters = [voronoiFilter];
    this.addChild(this.bg);
    this.spawnCells();
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  public async show(): Promise<void> {
    this.redrawBg();
  }

  public resize(width: number, height: number): void {
    this.W = width;
    this.H = height;
    this.redrawBg();
  }

  public update(ticker: Ticker): void {
    const dt = ticker.deltaMS / 1000;
    this.time += dt;
    this.ug.uniforms.uTime = this.time;

    for (let i = 0; i < this.cells.length; i++) {
      const c = this.cells[i];
      c.x += c.vx * dt;
      c.y += c.vy * dt;

      // Bounce off screen edges
      if (c.x < 0)      { c.x = 0;      c.vx =  Math.abs(c.vx); }
      if (c.x > this.W) { c.x = this.W; c.vx = -Math.abs(c.vx); }
      if (c.y < 0)      { c.y = 0;      c.vy =  Math.abs(c.vy); }
      if (c.y > this.H) { c.y = this.H; c.vy = -Math.abs(c.vy); }

      this.seedPos[i * 2]     = c.x;
      this.seedPos[i * 2 + 1] = c.y;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private redrawBg(): void {
    this.bg.clear();
    this.bg.rect(0, 0, this.W, this.H);
    this.bg.fill({ color: 0x11111b });
  }

  private spawnCells(): void {
    for (let i = 0; i < SEED_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 45 + Math.random() * 85; // px/s
      this.cells.push({
        x:  Math.random() * this.W,
        y:  Math.random() * this.H,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
      // Seed initial positions into buffer too
      this.seedPos[i * 2]     = this.cells[i].x;
      this.seedPos[i * 2 + 1] = this.cells[i].y;
    }
  }
}
