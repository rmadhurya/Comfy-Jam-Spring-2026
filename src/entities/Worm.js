import * as BABYLON from "@babylonjs/core";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/loaders/glTF"; // required for .glb support
import { WORM } from "../config.js";

const STATE = {
  RISING:    "rising",
  UP:        "up",
  SINKING:   "sinking",
  DOWN:      "down",
  COLLECTED: "collected",
};

export function createWorm(scene, x, z) {
  // ── CONTAINER: wraps the async-loaded GLB so we can position it immediately ─
  // We use a root TransformNode as the "mesh" the rest of the code talks to.
  // The actual GLB is parented to this node once it loads.
  const root = new BABYLON.TransformNode("worm-root", scene);
  root.position.set(x, -WORM.HEIGHT * 2, z); // start underground
  root.isPickable = false;
  root.rotation.y = Math.random() * Math.PI * 2; // set once at birth, never changed again

  // ── PICKABLE HITBOX ────────────────────────────────────────────────────────
  // GLB meshes can have complex geometry that's hard to click reliably.
  // A simple invisible cylinder acts as the click target.
  // IMPORTANT: use visibility=0 not isVisible=false — isVisible=false removes
  // the mesh from the picking pipeline entirely, so clicks never register.
  const hitbox = BABYLON.MeshBuilder.CreateCylinder("worm-hitbox", {
    height:       WORM.HEIGHT,
    diameter:     WORM.RADIUS * 2.5,
    tessellation: 8,
  }, scene);
  hitbox.parent     = root;
  hitbox.position.y = WORM.HEIGHT / 2; // centre vertically within root
  hitbox.isPickable = false;            // starts unpickable, enabled when UP
  hitbox.visibility = 0;               // fully transparent but stays in picking pipeline

  // Tag the hitbox so WormSpawner can find the root from any clicked mesh
  hitbox.metadata = { wormRoot: root };

  // ── LOAD worm.glb ──────────────────────────────────────────────────────────
  SceneLoader.ImportMeshAsync("", "./assets/", "worm.glb", scene).then((result) => {
    const wormMesh = result.meshes[0]; // root mesh of the imported GLB
    wormMesh.parent   = root;
    wormMesh.position = BABYLON.Vector3.Zero();
    // Scale to match WORM config — tweak these numbers once you see it in-game
    wormMesh.scaling.setAll(WORM.RADIUS * 4);
    // Null out quaternion so euler rotation on root works correctly
    result.meshes.forEach(m => {
      if (m.rotationQuaternion) m.rotationQuaternion = null;
      m.isPickable = false; // GLB meshes shouldn't be picked; hitbox handles that
    });
  });

  // ── STATE ──────────────────────────────────────────────────────────────────
  let state = STATE.RISING;
  let timer = 0;

  const randomUpTime   = () => WORM.UP_TIME_MIN  + Math.random() * (WORM.UP_TIME_MAX  - WORM.UP_TIME_MIN);
  const randomDownTime = () => WORM.DOWN_TIME_MIN + Math.random() * (WORM.DOWN_TIME_MAX - WORM.DOWN_TIME_MIN);

  // ── UPDATE ─────────────────────────────────────────────────────────────────
  root.update = (deltaTime) => {
    if (state === STATE.COLLECTED) return;

    switch (state) {

      case STATE.RISING:
        root.position.y += WORM.RISE_SPEED;
        hitbox.isPickable = false;
        if (root.position.y >= WORM.UP_HEIGHT) {
          root.position.y   = WORM.UP_HEIGHT;
          state             = STATE.UP;
          timer             = randomUpTime();
          hitbox.isPickable = true; // now clickable
        }
        break;

      case STATE.UP:
        root.rotation.z = Math.sin(Date.now() * 0.005) * 0.15; // wiggle
        timer -= deltaTime;
        if (timer <= 0) {
          state             = STATE.SINKING;
          hitbox.isPickable = false;
        }
        break;

      case STATE.SINKING:
        root.position.y -= WORM.RISE_SPEED;
        if (root.position.y <= -WORM.HEIGHT * 2) {
          root.position.y = -WORM.HEIGHT * 2;
          state           = STATE.DOWN;
          timer           = randomDownTime();
        }
        break;

      case STATE.DOWN:
        timer -= deltaTime;
        if (timer <= 0) state = STATE.RISING;
        break;
    }
  };

  // ── COLLECT ────────────────────────────────────────────────────────────────
  // Called by WormSpawner on click. Saves position before dispose, spawns hole.
  root.collect = () => {
    if (state !== STATE.UP) return false;
    state             = STATE.COLLECTED;
    hitbox.isPickable = false;

    // Capture position BEFORE dispose (dispose clears it)
    const holeX = root.position.x;
    const holeZ = root.position.z;

    // ── SPAWN hole.glb at this worm's x/z position ──────────────────────────
    SceneLoader.ImportMeshAsync("", "./assets/", "hole.glb", scene).then((result) => {
      const hole = result.meshes[0];
      hole.position.set(holeX, 0, holeZ);
      hole.scaling.setAll(1.5);
      result.meshes.forEach(m => m.isPickable = false);
    });

    root.dispose(); // removes worm + hitbox
    return true;
  };

  root.isUp = () => state === STATE.UP;

  // WormSpawner does distance checks against .position, which works fine on
  // a TransformNode the same as a Mesh.
  return root;
}