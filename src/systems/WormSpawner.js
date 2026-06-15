import * as BABYLON from "@babylonjs/core";
import { createWorm } from "../entities/Worm.js";
import { SPAWNER, PLAYER } from "../config.js";

export function createWormSpawner(scene, player, onCollect) {
  const worms = [];
  let spawnTimer     = 0;
  let totalCollected = 0;
  let frozen         = false; // set true at 21 worms — stops all spawning

  // ── SPAWN ──────────────────────────────────────────────────────────────────
  const spawnWorm = () => {
    if (frozen)                            return;
    if (worms.length >= SPAWNER.MAX_WORMS) return;

    const x = SPAWNER.SPAWN_X_MIN + Math.random() * (SPAWNER.SPAWN_X_MAX - SPAWNER.SPAWN_X_MIN);
    const z = SPAWNER.SPAWN_Z_MIN + Math.random() * (SPAWNER.SPAWN_Z_MAX - SPAWNER.SPAWN_Z_MIN);

    const tooClose = worms.some(w =>
      Math.abs(w.position.x - x) < 1.5 && Math.abs(w.position.z - z) < 1.5
    );
    if (tooClose) return;

    const worm = createWorm(scene, x, z);
    worms.push(worm);
  };

  // ── CLICK TO COLLECT ───────────────────────────────────────────────────────
  scene.onPointerDown = (evt, pickResult) => {
    if (evt.button !== 0) return;
    if (!pickResult.hit || !pickResult.pickedMesh) return;

    const clicked = pickResult.pickedMesh;

    // Use the metadata tag we set on the hitbox — much more reliable than
    // walking the parent chain, which can break with GLB sub-meshes.
    const wormRoot = clicked.metadata?.wormRoot ?? clicked.parent;
    if (!wormRoot) return;

    const idx = worms.indexOf(wormRoot);
    if (idx === -1) return; // didn't click a worm hitbox

    // Proximity check
    const dist = Math.sqrt(
      Math.pow(player.position.x - wormRoot.position.x, 2) +
      Math.pow(player.position.z - wormRoot.position.z, 2)
    );
    if (dist > PLAYER.PICKUP_RANGE) return;

    const collected = wormRoot.collect();
    if (collected) {
      worms.splice(idx, 1);
      totalCollected++;

      // ── THRESHOLD: slow down / stop spawning ──────────────────────────────
      if (totalCollected === 15) {
        SPAWNER.SPAWN_INTERVAL *= 2;
      }
      if (totalCollected >= 21) {
        frozen = true;
      }

      onCollect(totalCollected); // GameScene handles degradation visuals
    }
  };

  // ── UPDATE ─────────────────────────────────────────────────────────────────
  const update = (deltaTime) => {
    for (const worm of worms) worm.update(deltaTime);

    if (!frozen) {
      spawnTimer += deltaTime;
      if (spawnTimer >= SPAWNER.SPAWN_INTERVAL) {
        spawnTimer = 0;
        spawnWorm();
      }
    }
  };

  // Seed a few worms immediately
  for (let i = 0; i < 4; i++) spawnWorm();

  return {
    update,
    getTotal: () => totalCollected,
    isFrozen: () => frozen,
  };
}