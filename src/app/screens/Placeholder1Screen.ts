import type { Ticker } from "pixi.js";
import { Container, Graphics, Rectangle, Sprite, Text, TextStyle, Texture } from "pixi.js";

// ── Palette ───────────────────────────────────────────────────────────────────
const TOXIC_GREEN  = 0x39ff14;
const TOXIC_VIOLET = 0x181825; // catppuccin mantle

// ── Beat timing (~70 BPM) ─────────────────────────────────────────────────────
const BEAT_INTERVAL   = 0.857;
const DUB_PHASE_RATIO = 0.28;

// ── Text styles ───────────────────────────────────────────────────────────────
const BANNER_STYLE = new TextStyle({
  fontFamily: "'Rock Salt', 'Permanent Marker', monospace",
  fontSize:   148,
  fill:       TOXIC_GREEN,
  stroke:     { color: 0x000000, width: 14 },
  padding:    20,
  align:      "center",
});

const SUB_STYLE = new TextStyle({
  fontFamily: "'Rock Salt', 'Permanent Marker', monospace",
  fontSize:   36,
  fill:       0xffffff,
  stroke:     { color: 0x000000, width: 6 },
  align:      "center",
});

const PL_STYLE = new TextStyle({
  fontFamily: "'Rock Salt', 'Permanent Marker', monospace",
  fontSize:   20,
  fill:       0x000000,
  padding:    4,
});

// ── Powerline configs ─────────────────────────────────────────────────────────
interface PLConfig {
  angleDeg: number;
  yFrac:    number;
  bandCol:  number;
  bordCol:  number;
  bandH:    number;
  bordH:    number;
  speed:    number; // px/ms
}

const PL_CONFIGS: PLConfig[] = [
  { angleDeg:  -9, yFrac: 0.11, bandCol: 0x009933, bordCol: TOXIC_VIOLET, bandH: 52, bordH: 5, speed: 0.14 },
  { angleDeg:   7, yFrac: 0.36, bandCol: 0x006622, bordCol: TOXIC_VIOLET, bandH: 60, bordH: 6, speed: 0.11 },
  { angleDeg: -15, yFrac: 0.66, bandCol: 0x00bb44, bordCol: TOXIC_GREEN,  bandH: 50, bordH: 4, speed: 0.17 },
  { angleDeg:  11, yFrac: 0.87, bandCol: 0x005511, bordCol: TOXIC_VIOLET, bandH: 46, bordH: 5, speed: 0.09 },
];

// ── Ticker messages ───────────────────────────────────────────────────────────
const MSGS = [
  "STARTING SOON",
  "GET READY",
  "STREAM INCOMING",
  "WORXBEND WARMS UP",
  "STAND BY",
  "LOADING EPICNESS",
  "ALMOST THERE",
  "BRACE YOURSELVES",
  "W INCOMING",
  "CHAT IS WARMING UP",
  "THE STREAM AWAKENS",
  "LOCK IN",
];

const ITEM_GAP = 80;
const ICON_H   = 40; // fits inside the smallest band (46 px)

// ── Splash palette ────────────────────────────────────────────────────────────
const SPLASH_COLS = [
  TOXIC_GREEN, TOXIC_VIOLET,
  0x00ff88, 0xaaff00, 0x33ff99, 0xff00cc, 0x00ffcc,
];

// ── Interfaces ────────────────────────────────────────────────────────────────
interface TickerEntry {
  obj:   Container;
  width: number;
}

interface PLState {
  cont:       Container;
  scrollCont: Container;
  items:      TickerEntry[];
  textIdx:    number;
  nextIsIcon: boolean;
  cfg:        PLConfig;
}

interface SplatDrop {
  angle: number;
  dist:  number;
  r:     number;
}

interface Splat {
  xFrac:   number;
  yFrac:   number;
  r:       number;
  color:   number;
  alpha:   number;
  drops:   SplatDrop[];
  dripOff: number; // horizontal offset fraction
  dripLen: number; // length as multiple of r
}

// ── Screen ────────────────────────────────────────────────────────────────────

export class Placeholder1Screen extends Container {
  public static assetBundles = ["main"];

  // Layers (bottom → top)
  private readonly splatGfx   = new Graphics();
  private readonly auraGfx    = new Graphics();
  private readonly bannerCont = new Container();

  private bannerText: Text | null = null;
  private subText:    Text | null = null;

  private readonly pls:   PLState[] = [];
  private          splats: Splat[]  = [];

  // Beat / time state
  private time      = 0;
  private beatDecay = 0;

  // Screen dimensions
  private sw    = 0;
  private sh    = 0;
  private ready = false;

  constructor() {
    super();

    this.addChild(this.splatGfx);

    // Build powerline containers — geometry only, items added after resize
    for (const cfg of PL_CONFIGS) {
      const cont       = new Container();
      const bandGfx    = new Graphics();
      const scrollCont = new Container();

      const totalH = cfg.bordH * 2 + cfg.bandH;

      // Band drawn centered vertically at local origin, spanning full screen diagonal
      bandGfx.rect(-4000, -totalH / 2,                         8000, cfg.bordH).fill(cfg.bordCol);
      bandGfx.rect(-4000, -totalH / 2 + cfg.bordH,             8000, cfg.bandH).fill(cfg.bandCol);
      bandGfx.rect(-4000, -totalH / 2 + cfg.bordH + cfg.bandH, 8000, cfg.bordH).fill(cfg.bordCol);

      // scrollCont starts at the top of the green band area
      scrollCont.y = -totalH / 2 + cfg.bordH;

      cont.rotation = (cfg.angleDeg * Math.PI) / 180;
      cont.addChild(bandGfx);
      cont.addChild(scrollCont);
      this.addChild(cont);

      this.pls.push({ cont, scrollCont, items: [], textIdx: 0, nextIsIcon: false, cfg });
    }

    this.addChild(this.auraGfx);
    this.addChild(this.bannerCont);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  public async show(): Promise<void> {
    this.bannerText = new Text({ text: "STARTING SOON", style: BANNER_STYLE });
    this.bannerText.anchor.set(0.5);
    this.bannerCont.addChild(this.bannerText);

    this.subText = new Text({ text: "WORXBEND IS WARMING UP", style: SUB_STYLE });
    this.subText.anchor.set(0.5, 0);
    this.bannerCont.addChild(this.subText);

    this.generateSplats();
    this.ready = true;
  }

  public update(ticker: Ticker): void {
    if (!this.ready) return;

    const dt = ticker.deltaMS / 1000;
    this.time += dt;

    // ── Beat detection ────────────────────────────────────────────────────────
    const prevPhase = ((this.time - dt) % BEAT_INTERVAL + BEAT_INTERVAL) % BEAT_INTERVAL;
    const currPhase = (this.time         % BEAT_INTERVAL + BEAT_INTERVAL) % BEAT_INTERVAL;
    const dubPhase  = BEAT_INTERVAL * DUB_PHASE_RATIO;

    if (currPhase < prevPhase) {
      this.beatDecay = 1.0;                                      // main beat
    } else if (prevPhase < dubPhase && currPhase >= dubPhase) {
      this.beatDecay = Math.max(this.beatDecay, 0.55);           // secondary "dub"
    }
    this.beatDecay = Math.max(0, this.beatDecay - 5.5 * dt);

    this.animateBanner();
    for (const pl of this.pls) this.tickPL(pl, ticker.deltaMS);
  }

  public resize(width: number, height: number): void {
    this.sw = width;
    this.sh = height;

    // Banner stays centered; subText sits just below the main text
    this.bannerCont.x = width  * 0.5;
    this.bannerCont.y = height * 0.5;
    if (this.subText && this.bannerText) {
      this.subText.y = this.bannerText.height * 0.5 + 14;
    }

    // Powerlines: local origin = left screen edge, y = fraction of screen height
    for (const pl of this.pls) {
      pl.cont.x = 0;
      pl.cont.y = height * pl.cfg.yFrac;
    }

    if (this.ready) {
      this.redrawSplats(width, height);
      for (const pl of this.pls) this.populatePL(pl);
    }
  }

  // ── Banner animation ──────────────────────────────────────────────────────

  private animateBanner(): void {
    const beat  = 1 + 0.14 * this.beatDecay;
    const float = Math.sin(this.time * 0.4) * 8;

    // Multi-frequency micro-tremor
    const qx = Math.sin(this.time * 19.3) * 2.8 + Math.sin(this.time * 37.1) * 1.4;
    const qy = Math.cos(this.time * 23.1) * 2.2 + Math.cos(this.time * 41.7) * 1.1;

    this.bannerCont.scale.set(beat);
    this.bannerCont.x = this.sw * 0.5 + qx;
    this.bannerCont.y = this.sh * 0.5 + float + qy;

    // Aura glow — expands on beat
    const cx    = this.bannerCont.x;
    const cy    = this.bannerCont.y;
    const auraR = 240 + 28 * Math.sin(this.time * 0.5) + 45 * this.beatDecay;

    this.auraGfx.clear();
    this.auraGfx
      .circle(cx, cy, auraR * 2.4)
      .fill({ color: TOXIC_GREEN, alpha: 0.025 + 0.035 * this.beatDecay });
    this.auraGfx
      .circle(cx, cy, auraR * 1.3)
      .fill({ color: TOXIC_GREEN, alpha: 0.055 + 0.055 * this.beatDecay });
    this.auraGfx
      .circle(cx, cy, auraR * 0.6)
      .fill({ color: TOXIC_VIOLET, alpha: 0.040 + 0.040 * this.beatDecay });
  }

  // ── Paint splashes ────────────────────────────────────────────────────────

  private generateSplats(): void {
    this.splats = [];
    for (let i = 0; i < 14; i++) {
      const r     = 22 + Math.random() * 52;
      const color = SPLASH_COLS[Math.floor(Math.random() * SPLASH_COLS.length)];
      const drops: SplatDrop[] = [];
      for (let d = 0; d < 4 + Math.floor(Math.random() * 5); d++) {
        drops.push({
          angle: Math.random() * Math.PI * 2,
          dist:  r * (0.7 + Math.random() * 0.9),
          r:     r * (0.15 + Math.random() * 0.38),
        });
      }
      this.splats.push({
        xFrac:   Math.random(),
        yFrac:   Math.random(),
        r,
        color,
        alpha:   0.55 + Math.random() * 0.3,
        drops,
        dripOff: (Math.random() - 0.5) * r * 0.4,
        dripLen: r * (0.9 + Math.random() * 0.8),
      });
    }
  }

  private redrawSplats(w: number, h: number): void {
    const g = this.splatGfx;
    g.clear();
    for (const s of this.splats) {
      const x = s.xFrac * w;
      const y = s.yFrac * h;

      // Main blob
      g.circle(x, y, s.r).fill({ color: s.color, alpha: s.alpha });

      // Satellite drops
      for (const d of s.drops) {
        g.circle(
          x + Math.cos(d.angle) * d.dist,
          y + Math.sin(d.angle) * d.dist,
          d.r,
        ).fill({ color: s.color, alpha: s.alpha * 0.72 });
      }

      // Drip (narrow ellipse hanging down)
      g.ellipse(
        x + s.dripOff, y + s.r * 0.55,
        s.r * 0.18, s.dripLen,
      ).fill({ color: s.color, alpha: s.alpha * 0.65 });
    }
  }

  // ── Powerline scrolling ───────────────────────────────────────────────────

  private populatePL(pl: PLState): void {
    for (const e of pl.items) {
      pl.scrollCont.removeChild(e.obj);
      e.obj.destroy();
    }
    pl.items      = [];
    pl.textIdx    = 0;
    pl.nextIsIcon = false;
    pl.scrollCont.x = 0;

    let right = 0;
    while (right < this.sw + 800) {
      const e = this.spawnPLNext(pl);
      e.obj.x = right + ITEM_GAP;
      pl.scrollCont.addChild(e.obj);
      pl.items.push(e);
      right = e.obj.x + e.width;
    }
  }

  private tickPL(pl: PLState, deltaMS: number): void {
    pl.scrollCont.x -= pl.cfg.speed * deltaMS;

    // Cull items that scrolled off the left
    const leftBound = -pl.scrollCont.x;
    while (pl.items.length > 0) {
      const first = pl.items[0];
      if (first.obj.x + first.width < leftBound) {
        pl.scrollCont.removeChild(first.obj);
        first.obj.destroy();
        pl.items.shift();
      } else break;
    }

    // Spawn new items to fill the right side
    const fillTo = leftBound + this.sw + 800;
    let right    = this.rightEdge(pl);
    while (right < fillTo) {
      const e = this.spawnPLNext(pl);
      e.obj.x = right + ITEM_GAP;
      pl.scrollCont.addChild(e.obj);
      pl.items.push(e);
      right = e.obj.x + e.width;
    }
  }

  private rightEdge(pl: PLState): number {
    if (pl.items.length === 0) return 0;
    const last = pl.items[pl.items.length - 1];
    return last.obj.x + last.width;
  }

  private spawnPLNext(pl: PLState): TickerEntry {
    if (pl.nextIsIcon) {
      pl.nextIsIcon = false;
      return this.spawnPLIcon(pl);
    }
    pl.nextIsIcon = true;
    return this.spawnPLText(pl);
  }

  private spawnPLText(pl: PLState): TickerEntry {
    const msg = MSGS[pl.textIdx % MSGS.length];
    pl.textIdx++;
    const t = new Text({ text: msg, style: PL_STYLE });
    t.y = (pl.cfg.bandH - t.height) / 2;
    return { obj: t, width: t.width };
  }

  private spawnPLIcon(pl: PLState): TickerEntry {
    const base  = Texture.from("sprite.png");
    const cols  = Math.floor(base.width / 250);
    const rows  = Math.floor(base.height / 250);
    const total = Math.max(1, cols * rows);
    const idx   = Math.floor(Math.random() * total);
    const frame = new Rectangle(
      (idx % cols) * 250,
      Math.floor(idx / cols) * 250,
      250,
      250,
    );
    const tex = new Texture({ source: base.source, frame });
    const spr = new Sprite(tex);
    spr.scale.set(ICON_H / 250);
    spr.y = (pl.cfg.bandH - spr.height) / 2;
    return { obj: spr, width: spr.width };
  }
}
