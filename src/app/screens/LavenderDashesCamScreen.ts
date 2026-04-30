import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

const SIZE = 600;
const CX = SIZE / 2;
const CY = SIZE / 2;
const CIRCLE_RADIUS = 242;

// Catppuccin Mocha
const LAVENDER = 0xb4befe;
const MAUVE = 0xcba6f7;
const BLUE = 0x89b4fa;
const BASE = 0x1e1e2e;

interface DashRing {
  radius: number;
  count: number;
  dashArc: number;
  speed: number;
  color: number;
  alpha: number;
  width: number;
}

const RINGS: DashRing[] = [
  // Outer — lavender, 7 wide dashes, slow CW
  {
    radius: 270,
    count: 7,
    dashArc: (28 * Math.PI) / 180,
    speed: 0.28,
    color: LAVENDER,
    alpha: 0.88,
    width: 4.5,
  },
  // Mid — mauve, 13 narrow dashes, faster CCW
  {
    radius: 256,
    count: 13,
    dashArc: (15 * Math.PI) / 180,
    speed: -0.5,
    color: MAUVE,
    alpha: 0.8,
    width: 3,
  },
  // Inner — blue, 6 wide dashes, slowest CW
  {
    radius: 228,
    count: 6,
    dashArc: (40 * Math.PI) / 180,
    speed: 0.18,
    color: BLUE,
    alpha: 0.72,
    width: 6,
  },
];

export class LavenderDashesCamScreen extends Container {
  public static assetBundles: string[] = [];

  private readonly world = new Container();
  private readonly gfx = new Graphics();
  private time = 0;

  constructor() {
    super();
    this.world.x = CX;
    this.world.y = CY;
    this.addChild(this.world);
    this.world.addChild(this.gfx);
  }

  public async show(): Promise<void> {}

  public update(ticker: Ticker): void {
    this.time += Math.min(ticker.deltaMS, 50) / 1000;
    this.draw();
  }

  public resize(width: number, height: number): void {
    const distortX = window.innerWidth / width;
    const distortY = window.innerHeight / height;
    const padding = 256;
    const availCSS =
      Math.min(window.innerWidth, window.innerHeight) - padding * 2;
    const cssScale = availCSS / SIZE;

    this.scale.x = cssScale / distortX;
    this.scale.y = cssScale / distortY;
    this.x = Math.round((width - SIZE * this.scale.x) / 2);
    this.y = Math.round((height - SIZE * this.scale.y) / 2);
  }

  private draw(): void {
    const g = this.gfx;
    g.clear();

    // Breathing outer glow halo
    const pulse = 0.05 + 0.03 * Math.sin(this.time * 0.7);
    g.circle(0, 0, CIRCLE_RADIUS + 48).stroke({
      color: LAVENDER,
      alpha: pulse,
      width: 38,
    });

    // Thin outer accent ring
    g.circle(0, 0, CIRCLE_RADIUS + 33).stroke({
      color: LAVENDER,
      alpha: 0.35,
      width: 1.5,
    });

    // Outer and mid dash rings — outside the base frame
    this.drawDashRing(g, RINGS[0]!);
    this.drawDashRing(g, RINGS[1]!);

    // Solid dark base ring — the physical webcam frame
    g.circle(0, 0, CIRCLE_RADIUS).stroke({
      color: BASE,
      alpha: 1,
      width: 14,
    });

    // Inner dash ring drawn on top of the frame interior
    this.drawDashRing(g, RINGS[2]!);

    // Inner crisp accent line
    g.circle(0, 0, CIRCLE_RADIUS - 14).stroke({
      color: LAVENDER,
      alpha: 0.28,
      width: 1,
    });
  }

  private drawDashRing(g: Graphics, ring: DashRing): void {
    const step = (Math.PI * 2) / ring.count;
    const offset = this.time * ring.speed;

    for (let i = 0; i < ring.count; i++) {
      const start = i * step + offset;
      const end = start + ring.dashArc;
      g.moveTo(Math.cos(start) * ring.radius, Math.sin(start) * ring.radius)
        .arc(0, 0, ring.radius, start, end)
        .stroke({
          color: ring.color,
          alpha: ring.alpha,
          width: ring.width,
          cap: "round",
        });
    }
  }
}
