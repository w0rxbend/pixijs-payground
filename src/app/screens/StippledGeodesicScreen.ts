import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

// Catppuccin Mocha Palette
const SURFACE0 = 0x313244;
const SKY = 0x89dceb;
const MAUVE = 0xcba6f7;
const BLUE = 0x89b4fa;
const SAPPHIRE = 0x74c7ec;

const PALETTE = [SURFACE0, SAPPHIRE, BLUE, MAUVE, SKY];

type Vec3 = { x: number; y: number; z: number; id: number };

function normalize(v: { x: number; y: number; z: number }): {
  x: number;
  y: number;
  z: number;
} {
  const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}

export class StippledGeodesicScreen extends Container {
  public static assetBundles: string[] = [];

  private readonly gfx = new Graphics();
  private w = 1920;
  private h = 1080;
  private time = 0;

  private vertices: Vec3[] = [];
  private noiseOffsets: number[] = [];

  constructor() {
    super();
    this.addChild(this.gfx);
    this.initIcosphere(3); // Higher subdivision for denser dots
  }

  private initIcosphere(subdivisions: number): void {
    const phi = (1 + Math.sqrt(5)) / 2;

    const verts = [
      { x: -1, y: phi, z: 0 },
      { x: 1, y: phi, z: 0 },
      { x: -1, y: -phi, z: 0 },
      { x: 1, y: -phi, z: 0 },
      { x: 0, y: -1, z: phi },
      { x: 0, y: 1, z: phi },
      { x: 0, y: -1, z: -phi },
      { x: 0, y: 1, z: -phi },
      { x: phi, y: 0, z: -1 },
      { x: phi, y: 0, z: 1 },
      { x: -phi, y: 0, z: -1 },
      { x: -phi, y: 0, z: 1 },
    ].map(normalize);

    let faces: [number, number, number][] = [
      [0, 11, 5],
      [0, 5, 1],
      [0, 1, 7],
      [0, 7, 10],
      [0, 10, 11],
      [1, 5, 9],
      [5, 11, 4],
      [11, 10, 2],
      [10, 7, 6],
      [7, 1, 8],
      [3, 9, 4],
      [3, 4, 2],
      [3, 2, 6],
      [3, 6, 8],
      [3, 8, 9],
      [4, 9, 5],
      [2, 4, 11],
      [6, 2, 10],
      [8, 6, 7],
      [9, 8, 1],
    ];

    for (let i = 0; i < subdivisions; i++) {
      const nextFaces: [number, number, number][] = [];
      const midpointCache = new Map<string, number>();

      const getMidpoint = (a: number, b: number): number => {
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (midpointCache.has(key)) return midpointCache.get(key)!;
        const index = verts.length;
        const v1 = verts[a];
        const v2 = verts[b];
        verts.push(
          normalize({ x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z }),
        );
        midpointCache.set(key, index);
        return index;
      };

      for (const [v1, v2, v3] of faces) {
        const a = getMidpoint(v1, v2);
        const b = getMidpoint(v2, v3);
        const c = getMidpoint(v3, v1);
        nextFaces.push([v1, a, c], [v2, b, a], [v3, c, b], [a, b, c]);
      }
      faces = nextFaces;
    }

    this.vertices = verts.map((v, i) => ({ ...v, id: i }));
    this.noiseOffsets = this.vertices.map(() => Math.random() * Math.PI * 2);
  }

  public async show(): Promise<void> {
    this.w = window.innerWidth;
    this.h = window.innerHeight;
  }

  public async hide(): Promise<void> {}

  public resize(width: number, height: number): void {
    this.w = width;
    this.h = height;
  }

  public update(ticker: Ticker): void {
    this.time += ticker.deltaMS / 1000;
    const g = this.gfx;
    g.clear();

    const centerX = this.w / 2;
    const centerY = this.h / 2;
    const baseRadius = Math.min(this.w, this.h) * 0.35;

    const rotX = this.time * 0.15;
    const rotY = this.time * 0.25;

    // Project and displace
    const dots = this.vertices.map((v, i) => {
      // Rotation
      let x = v.x;
      let y = v.y;
      let z = v.z;

      const tx = x * Math.cos(rotY) + z * Math.sin(rotY);
      const tz = -x * Math.sin(rotY) + z * Math.cos(rotY);
      x = tx;
      z = tz;

      const ty = y * Math.cos(rotX) - z * Math.sin(rotX);
      const rz = y * Math.sin(rotX) + z * Math.cos(rotX);
      y = ty;
      z = rz;

      // Noise displacement (Fuzzy effect)
      const shimmer = Math.sin(this.time * 2 + this.noiseOffsets[i]) * 0.03;
      const noise = Math.sin(i * 0.5) * 0.05 + shimmer;
      const r = 1 + noise;

      return {
        px: x * r,
        py: y * r,
        pz: z * r,
        id: v.id,
      };
    });

    // Depth sort (Back-to-Front)
    dots.sort((a, b) => b.pz - a.pz);

    dots.forEach((dot) => {
      const focalLength = 1000;
      const scale = focalLength / (focalLength + dot.pz * baseRadius);

      const x = centerX + dot.px * baseRadius * scale;
      const y = centerY - dot.py * baseRadius * scale;

      // Depth-based styling
      const normZ = (dot.pz + 1) / 2; // 0 (front) to 1 (back)
      const alpha = 0.1 + (1 - normZ) * 0.9;
      const size = 1.5 + (1 - normZ) * 4;

      // Color mapping: Sky (front) to Surface0 (back)
      const colorIdx = Math.floor(
        Math.max(0, Math.min(0.99, 1 - normZ)) * PALETTE.length,
      );
      const color = PALETTE[colorIdx];

      g.circle(x, y, size).fill({ color, alpha });

      // Optional: subtle glow for foreground dots
      if (normZ < 0.3) {
        g.circle(x, y, size * 2).fill({ color, alpha: alpha * 0.2 });
      }
    });
  }
}
