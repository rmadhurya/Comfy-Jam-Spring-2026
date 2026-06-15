import * as BABYLON from "@babylonjs/core";
import { GameScene } from "./scenes/GameScene.js";

const curtain   = document.getElementById("curtain");
const splash    = document.getElementById("splash");
const splashTxt = document.getElementById("splash-text");

// Only run reveal if we're on game.html
if (!curtain || !splash || !splashTxt) {
  console.warn("Reveal elements not found — skipping sequence");
} else {
  runReveal();
}

const canvas    = document.getElementById("renderCanvas");

// ── START ENGINE ─────────────────────────────────────────────────────────────
const engine = new BABYLON.Engine(canvas, true);
const scene  = GameScene(engine, canvas);
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());

// ── REVEAL SEQUENCE ───────────────────────────────────────────────────────────
// Curtain starts covering everything (see CSS: translateY(0))
// Sequence: show splash text → pause → fade out → curtain wipes up → game visible

async function runReveal() {
  // 1. Fade splash text in
  await wait(200); // brief pause so first frame renders behind curtain
  splashTxt.classList.add("visible");

  // 2. Hold
  await wait(2400);

  // 3. Fade splash text out
  splashTxt.classList.remove("visible");
  await wait(600);

  // 4. Hide splash layer entirely, wipe curtain up
  splash.classList.add("hidden");
  curtain.classList.add("wipe-out");

  // 5. After curtain finishes, remove it from layout
  await wait(800);
  curtain.style.display = "none";
}

//runReveal();

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}