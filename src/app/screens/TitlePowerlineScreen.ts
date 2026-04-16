import type { Ticker } from "pixi.js";
import { Container, Graphics, Rectangle, Sprite, Text, TextStyle, Texture } from "pixi.js";

// ── Palette ──────────────────────────────────────────────────────────────────
const TICKER_BG    = 0x00cc44;  // green band
const TICKER_TEXT  = 0x000000;  // black text
const TOXIC_VIOLET = 0x181825; // top & bottom border

// ── Dimensions ───────────────────────────────────────────────────────────────
const BORDER_H  = 6;
const BAND_H    = 80;
const TOTAL_H   = BAND_H + BORDER_H * 2;
const FONT_SIZE = 24;
const ICON_H    = 52;
const ITEM_GAP  = 90;

// ── Scroll speed ─────────────────────────────────────────────────────────────
const SCROLL_PX_PER_MS = 0.2;  // ~200 px/s

// ── News items ────────────────────────────────────────────────────────────────
const NEWS = [
  "WORXBEND GOES LIVE",
  "BREAKING: LOCAL MAN REFUSES TO STOP GAMING",
  "SOURCES CONFIRM: THIS SESSION IS ABSOLUTELY FIRE",
  "EXCLUSIVE: STREAMER CARRIES ENTIRE TEAM ON BACK",
  "ALERT: CRITICAL LEVELS OF FUN DETECTED IN AREA",
  "UPDATE: CHAT DEVOLVES INTO ABSOLUTE CHAOS",
  "DEVELOPING: OPPONENT TEAM CURRENTLY IN SHAMBLES",
  "WEATHER: CLEAR SKIES — HIGH CHANCE OF W TODAY",
  "EXPERT PANEL: YES, THAT WAS INDEED A SKILL",
  "CONFIRMED: DIFFICULTY SET TO EASY... BY STREAMER",
  "FLASH: WORXBEND ACHIEVES IMPOSSIBLE FEAT AGAIN",
  "LATE BREAKING: NOBODY KNEW THIS WAS POSSIBLE",
  "REPORT: LOCAL VIEWER FORGETS TO EAT WHILE WATCHING",
  "SCIENTISTS BAFFLED BY STREAMER'S INHUMAN REFLEXES",
];

const TICKER_STYLE = new TextStyle({
  fontFamily: "'Rock Salt', 'Permanent Marker', monospace",
  fontSize: FONT_SIZE,
  fill: TICKER_TEXT,
  padding: 6,
});

interface TickerEntry {
  obj: Container;
  width: number;
}

export class TitlePowerlineScreen extends Container {
  public static assetBundles = ["main"];

  private readonly band       = new Graphics();
  private readonly scrollMask = new Graphics();
  private readonly scrollCont = new Container();

  private items:      TickerEntry[] = [];
  private textIdx     = 0;
  private nextIsIcon  = false;
  private screenW = 0;
  private ready   = false;

  constructor() {
    super();
    this.addChild(this.band);
    this.addChild(this.scrollMask);
    this.addChild(this.scrollCont);
    this.scrollCont.mask = this.scrollMask;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  public async show(): Promise<void> {
    this.ready = true;
    this.populateItems();
  }

  public update(time: Ticker): void {
    if (!this.ready || this.screenW === 0) return;

    this.scrollCont.x -= SCROLL_PX_PER_MS * time.deltaMS;

    // cull items that scrolled off the left edge
    const leftBound = -this.scrollCont.x;
    while (this.items.length > 0) {
      const first = this.items[0];
      if (first.obj.x + first.width < leftBound) {
        this.scrollCont.removeChild(first.obj);
        first.obj.destroy();
        this.items.shift();
      } else break;
    }

    // fill right side with new items as needed
    const fillTo = leftBound + this.screenW + 400;
    let right = this.rightEdge();
    while (right < fillTo) {
      const entry = this.spawnNext();
      entry.obj.x = right + ITEM_GAP;
      this.scrollCont.addChild(entry.obj);
      this.items.push(entry);
      right = entry.obj.x + entry.width;
    }
  }

  public resize(width: number, height: number): void {
    this.screenW = width;
    this.y = height - TOTAL_H;

    this.band.clear();
    this.band.rect(0, 0, width, BORDER_H).fill(TOXIC_VIOLET);
    this.band.rect(0, BORDER_H, width, BAND_H).fill(TICKER_BG);
    this.band.rect(0, BORDER_H + BAND_H, width, BORDER_H).fill(TOXIC_VIOLET);

    this.scrollMask.clear();
    this.scrollMask.rect(0, BORDER_H, width, BAND_H).fill(0xffffff);

    if (this.ready) this.populateItems();
  }

  // ── Item management ───────────────────────────────────────────────────────

  private populateItems(): void {
    for (const e of this.items) {
      this.scrollCont.removeChild(e.obj);
      e.obj.destroy();
    }
    this.items = [];
    this.textIdx = 0;
    this.nextIsIcon = false;
    this.scrollCont.x = 0;

    let right = 0;
    while (right < this.screenW + 400) {
      const entry = this.spawnNext();
      entry.obj.x = right + ITEM_GAP;
      this.scrollCont.addChild(entry.obj);
      this.items.push(entry);
      right = entry.obj.x + entry.width;
    }
  }

  private rightEdge(): number {
    if (this.items.length === 0) return 0;
    const last = this.items[this.items.length - 1];
    return last.obj.x + last.width;
  }

  private spawnNext(): TickerEntry {
    if (this.nextIsIcon) {
      this.nextIsIcon = false;
      return this.spawnIcon();
    }
    this.nextIsIcon = true;
    return this.spawnText();
  }

  private spawnText(): TickerEntry {
    const label = NEWS[this.textIdx % NEWS.length];
    this.textIdx++;
    const t = new Text({ text: label, style: TICKER_STYLE });
    t.y = BORDER_H + (BAND_H - t.height) * 0.5;
    return { obj: t, width: t.width };
  }

  private spawnIcon(): TickerEntry {
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
    spr.y = BORDER_H + (BAND_H - spr.height) * 0.5;
    return { obj: spr, width: spr.width };
  }
}
