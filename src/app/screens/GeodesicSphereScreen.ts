import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

// Catppuccin Mocha Palette
const MAUVE = 0xcba6f7;
const BLUE = 0x89b4fa;
const SAPPHIRE = 0x74c7ec;
const SKY = 0x89dceb;
const TEAL = 0x94e2d5;
const GREEN = 0xa6e3a1;
const YELLOW = 0xf9e2af;
const PEACH = 0xfab387;
const RED = 0xf38ba8;

const PALETTE = [MAUVE, BLUE, SAPPHIRE, SKY, TEAL, GREEN, YELLOW, PEACH, RED];

type Vec3 = { x: number; y: number; z: number };

function normalize(v: Vec3): Vec3 {
  const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}

function add(v1: Vec3, v2: Vec3): Vec3 {
  return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z };
}

function midpoint(v1: Vec3, v2: Vec3): Vec3 {
  return normalize(add(v1, v2));
}

export class GeodesicSphereScreen extends Container {
  public static assetBundles: string[] = [];

  private readonly gfx = new Graphics();
  private w = 1920;
  private h = 1080;
  private time = 0;

  private vertices: Vec3[] = [];
  private faces: [number, number, number][] = [];
  private faceColors: number[] = [];

  constructor() {
    super();
    this.addChild(this.gfx);
    this.initIcosphere(2);
  }

  private initIcosphere(subdivisions: number): void {
    const phi = (1 + Math.sqrt(5)) / 2;

    // Initial icosahedron vertices
    this.vertices = [
      normalize({ x: -1, y: phi, z: 0 }),
      normalize({ x: 1, y: phi, z: 0 }),
      normalize({ x: -1, y: -phi, z: 0 }),
      normalize({ x: 1, y: -phi, z: 0 }),
      normalize({ x: 0, y: -1, z: phi }),
      normalize({ x: 0, y: 1, z: phi }),
      normalize({ x: 0, y: -1, z: -phi }),
      normalize({ x: 0, y: 1, z: -phi }),
      normalize({ x: phi, y: 0, z: -1 }),
      normalize({ x: phi, y: 0, z: 1 }),
      normalize({ x: -phi, y: 0, z: -1 }),
      normalize({ x: -phi, y: 0, z: 1 }),
    ];

    // Initial icosahedron faces
    this.faces = [
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

        const index = this.vertices.length;
        this.vertices.push(midpoint(this.vertices[a], this.vertices[b]));
        midpointCache.set(key, index);
        return index;
      };

      for (const [v1, v2, v3] of this.faces) {
        const a = getMidpoint(v1, v2);
        const b = getMidpoint(v2, v3);
        const c = getMidpoint(v3, v1);

        nextFaces.push([v1, a, c], [v2, b, a], [v3, c, b], [a, b, c]);
      }
      this.faces = nextFaces;
    }

    // Assign random colors to faces from palette
    this.faceColors = this.faces.map(
      () => PALETTE[Math.floor(Math.random() * PALETTE.length)],
    );
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
    const radius = Math.min(this.w, this.h) * 0.3;

    const rotationX = this.time * 0.2;
    const rotationY = this.time * 0.3;

    // Displacement parameters
    const k = 4; // Frequency
    const magnitude = 0.15 + Math.sin(this.time * 0.5) * 0.05;
    const explosion = (Math.sin(this.time * 0.8) * 0.5 + 0.5) * 40;

    // Calculate projected vertices and their depths
    const projectedVertices = this.vertices.map((v) => {
      // Apply rotation
      let x = v.x;
      let y = v.y;
      let z = v.z;

      // Rotate around Y
      const tx = x * Math.cos(rotationY) + z * Math.sin(rotationY);
      let tz = -x * Math.sin(rotationY) + z * Math.cos(rotationY);
      x = tx;
      z = tz;

      // Rotate around X
      const ty = y * Math.cos(rotationX) - z * Math.sin(rotationX);
      tz = y * Math.sin(rotationX) + z * Math.cos(rotationX);
      y = ty;
      z = tz;

      // Spherical coordinates for displacement (using original vertex for stability)
      const latitude = Math.asin(v.y);
      const longitude = Math.atan2(v.z, v.x);

      // Standing wave displacement
      const d =
        Math.sin(k * latitude + this.time) *
        Math.cos(k * longitude + this.time);
      const r = 1 + d * magnitude;

      return {
        x: x * r,
        y: y * r,
        z: z * r,
      };
    });

    // Prepare faces for depth sorting
    const sortedFaces = this.faces.map((face, i) => {
      const v1 = projectedVertices[face[0]];
      const v2 = projectedVertices[face[1]];
      const v3 = projectedVertices[face[2]];

      // Average depth (Z) for sorting (back-to-front)
      const depth = (v1.z + v2.z + v3.z) / 3;

      // Face normal for explosion
      const nx = (v1.x + v2.x + v3.x) / 3;
      const ny = (v1.y + v2.y + v3.y) / 3;

      return { face, depth, nx, ny, color: this.faceColors[i] };
    });

    // Sort by depth descending (most positive Z is furthest away, draw first)
    sortedFaces.sort((a, b) => b.depth - a.depth);

    // Draw faces
    sortedFaces.forEach(({ face, depth, nx, ny, color }) => {
      const v1 = projectedVertices[face[0]];
      const v2 = projectedVertices[face[1]];
      const v3 = projectedVertices[face[2]];

      // Projection parameters
      const focalLength = 1200;

      // Depth-based alpha: closer is more opaque, further is more transparent
      // depth is roughly -1 to 1. Normalized depth: (depth + 1) / 2 [0 to 1]
      // Invert it: 1 - normalized depth.
      const normDepth = (depth + 1) / 2;
      const alpha = 0.05 + (1 - normDepth) * 0.4;

      // Offset by normal for "explosion" effect
      const ox = nx * explosion;
      const oy = ny * explosion;

      const project = (v: { x: number; y: number; z: number }) => {
        const scale = focalLength / (focalLength + v.z * radius);
        return {
          // Standard coordinate system: Y up is screen Y down
          x: centerX + (v.x * radius + ox) * scale,
          y: centerY - (v.y * radius + oy) * scale,
        };
      };

      const p1 = project(v1);
      const p2 = project(v2);
      const p3 = project(v3);

      g.poly([p1.x, p1.y, p2.x, p2.y, p3.x, p3.y]).stroke({
        color,
        width: 1.5,
        alpha: Math.max(0.1, alpha * 2),
      });
    });
  }
}
