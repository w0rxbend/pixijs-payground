import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { MotionPathHelper } from "gsap/MotionPathHelper";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { PixiPlugin } from "gsap/PixiPlugin";

gsap.registerPlugin(
  DrawSVGPlugin,
  InertiaPlugin,
  MotionPathHelper,
  MotionPathPlugin,
  MorphSVGPlugin,
  Physics2DPlugin,
  PixiPlugin,
);

const RUNE_PATHS = [
  "M10,10 L15,12 L10,25 L30,25 L10,40 L35,42", // Complex Dagaz
  "M5,5 L10,40 M10,10 C15,10 25,15 30,10 M10,25 L25,25", // Curvy Ansuz
  "M10,10 L30,40 M30,10 L10,40 M20,5 L20,45", // Gebo with cross
  "M10,40 L10,10 L30,10 L30,40 M5,25 L35,25", // Weathered Hagalaz
  "M20,5 L20,45 M10,15 L20,5 L30,15 M20,25 L10,35 M20,25 L30,35", // Branching Tiwaz
  "M10,10 L10,40 L30,40 M5,15 L15,5", // L-rune with accent
  "M10,10 L30,10 L10,25 L30,25 L10,40 L30,40 M15,5 L25,45", // Extended S-rune
  "M20,5 L20,45 M20,25 L35,10 M20,25 L35,40 M20,25 L5,10 M20,25 L5,40", // Six-way Algiz
];

interface RuneConfig {
  minOpacity: number;
  maxOpacity: number;
  minScale: number;
  maxScale: number;
  stroke: string;
  strokeWidth: number;
  speedMult: number;
}

function init() {
  const embersGroup = document.getElementById("embers-group");
  const runesGroup = document.getElementById("runes-group");
  const starSegs = document.querySelectorAll(".star-seg");
  const knotCircle = document.getElementById("knot-circle");
  const mainText = document.getElementById("main-text");

  if (!embersGroup || !knotCircle || !mainText || !runesGroup) return;

  // Initial states
  gsap.set([knotCircle, ...Array.from(starSegs)], { drawSVG: "0%" });
  gsap.set(mainText, { drawSVG: "0%", opacity: 0 });
  gsap.set("#sigil-container", { scale: 0.8, opacity: 0 });

  // --- DRAWING AND ERASING LOOP ---
  const loopTl = gsap.timeline({ repeat: -1, repeatDelay: 3 });

  loopTl
    // Reveal
    .to("#sigil-container", {
      duration: 3,
      opacity: 1,
      scale: 1,
      ease: "power2.inOut",
    })
    .to(knotCircle, { duration: 4, drawSVG: "100%", ease: "sine.inOut" }, 0)
    .to(
      starSegs,
      { duration: 2.5, drawSVG: "100%", stagger: 0.5, ease: "sine.inOut" },
      1.5,
    )
    .to(mainText, { duration: 1, opacity: 1 }, "-=1.5")
    .to(mainText, { duration: 4.5, drawSVG: "100%", ease: "power2.inOut" }, "<")
    .to(
      mainText,
      { duration: 2, fill: "rgba(100, 0, 0, 0.4)", ease: "sine.inOut" },
      "-=2",
    )

    .to({}, { duration: 5 }) // Hold peak

    // Erase
    .to(mainText, { duration: 1.5, fill: "rgba(0,0,0,0)", ease: "sine.in" })
    .to(
      mainText,
      { duration: 3.5, drawSVG: "0%", ease: "power2.inOut" },
      "-=0.5",
    )
    .to(
      starSegs,
      { duration: 2, drawSVG: "0%", stagger: -0.3, ease: "sine.inOut" },
      "-=1.5",
    )
    .to(knotCircle, { duration: 3, drawSVG: "0%", ease: "sine.inOut" }, "-=1")
    .to(
      "#sigil-container",
      { duration: 2, opacity: 0, scale: 0.8, ease: "power2.in" },
      "-=1",
    );

  // --- PERSISTENT BACKGROUND ---

  // Layer 1: Sharp background ritual runes
  createBackgroundRunes(runesGroup, 40, {
    minOpacity: 0.1,
    maxOpacity: 0.25,
    minScale: 0.8,
    maxScale: 1.5,
    stroke: "url(#blood-ink)",
    strokeWidth: 2,
    speedMult: 1.2,
  });

  // Layer 2: Massive faded background sigils
  createBackgroundRunes(runesGroup, 25, {
    minOpacity: 0.03,
    maxOpacity: 0.1,
    minScale: 4.0,
    maxScale: 10.0,
    stroke: "#440000",
    strokeWidth: 1,
    speedMult: 0.5,
  });

  createEmbers(embersGroup);

  // Breathing motion
  gsap.to("#obs-scene", {
    scale: 1.04,
    rotationZ: 0.2,
    duration: 18,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  // Initial set to apply filters without animating them
  gsap.set("#sigil-container", { filter: "url(#ancient-glow)" });
  gsap.set("#text-container", { filter: "url(#weathered-edge)" });

  // Smooth ethereal pulse on INNER elements (Range 0.8 - 1.0)
  // This avoids conflict with the container's 0-1 loop
  gsap.to("#sigil-paths, #main-text", {
    opacity: 0.8,
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  // Haunting drift
  gsap.to("#sigil-container, #text-container", {
    y: "-=30",
    x: "+=15",
    duration: 12,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}
function createBackgroundRunes(
  parent: HTMLElement,
  count: number,
  config: RuneConfig,
) {
  for (let i = 0; i < count; i++) {
    const rune = document.createElementNS("http://www.w3.org/2000/svg", "path");
    rune.setAttribute("class", "bg-rune");
    rune.setAttribute(
      "d",
      RUNE_PATHS[Math.floor(Math.random() * RUNE_PATHS.length)],
    );
    rune.setAttribute("stroke", config.stroke);
    rune.setAttribute("stroke-width", config.strokeWidth.toString());
    rune.setAttribute("stroke-linecap", "round");
    rune.setAttribute("stroke-linejoin", "round");
    parent.appendChild(rune);
    animateRune(rune, config);
  }
}

function animateRune(rune: SVGPathElement, config: RuneConfig) {
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  const scale =
    config.minScale + Math.random() * (config.maxScale - config.minScale);
  const rotation = Math.random() * 360;

  gsap.set(rune, { x, y, scale, rotation, opacity: 0 });

  const duration = (15 + Math.random() * 25) / config.speedMult;

  gsap.to(rune, {
    opacity:
      config.minOpacity +
      0.1 +
      Math.random() * (config.maxOpacity - config.minOpacity),
    duration: 4,
    yoyo: true,
    repeat: 1,
    repeatDelay: duration - 8,
    onComplete: () => animateRune(rune, config),
  });

  gsap.to(rune, {
    x: `+=${(Math.random() - 0.5) * 400}`,
    y: `+=${(Math.random() - 0.5) * 400}`,
    rotation: `+=${(Math.random() - 0.5) * 180}`,
    duration: duration,
    ease: "sine.inOut",
  });
}

function createEmbers(parent: HTMLElement | null) {
  if (!parent) return;

  for (let i = 0; i < 80; i++) {
    const ember = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    ember.setAttribute("class", "ember");
    ember.setAttribute("r", (Math.random() * 2.5 + 0.5).toString());
    parent.appendChild(ember);

    animateEmber(ember);
  }
}

function animateEmber(ember: SVGCircleElement) {
  const xStart = window.innerWidth / 2 + (Math.random() - 0.5) * 500;
  const yStart = window.innerHeight / 2 + (Math.random() - 0.5) * 500;

  gsap.set(ember, { x: xStart, y: yStart, opacity: 0, scale: 1 });

  const duration = 8 + Math.random() * 12;

  gsap.to(ember, {
    duration: duration,
    physics2D: {
      velocity: 20 + Math.random() * 50,
      angle: -90 + (Math.random() - 0.5) * 160,
      gravity: -2,
    },
    opacity: Math.random() * 0.6,
    scale: 0.1,
    ease: "power1.out",
    onComplete: () => animateEmber(ember),
  });

  gsap.to(ember, {
    x: `+=${(Math.random() - 0.5) * 600}`,
    duration: duration,
    ease: "sine.inOut",
  });
}

document.addEventListener("DOMContentLoaded", init);
