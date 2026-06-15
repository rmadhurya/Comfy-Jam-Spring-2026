import * as BABYLON from "@babylonjs/core";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/loaders/glTF";
import { PLAYER, CAMERA, FLOOR } from "../config.js";

export function createPlayer(scene, camera) {
  // ── INVISIBLE ANCHOR ───────────────────────────────────────────────────────
  // The cube is the "brain" — it handles all movement, collision, and camera.
  // The GLB model is parented to it and just follows along visually.
  const player = BABYLON.MeshBuilder.CreateBox("player", { size: 1 }, scene);
  player.position.y = 0.5;
  player.isVisible  = false; // hide the cube
  player.isPickable = false;

  // ── LOAD player.glb ────────────────────────────────────────────────────────
  SceneLoader.ImportMeshAsync("", "./assets/", "player.glb", scene).then((result) => {
    const model = result.meshes[0];
    
    // Null quaternion first so rotation.y works
    result.meshes.forEach(m => {
      m.isPickable = false;
      m.rotationQuaternion = null;
    });

    model.parent = player;

    // These three values fix the offset — tweak until model sits correctly
    model.position.x = 0;   // left/right offset
    model.position.y = -0.5; // down so feet hit the ground (adjust this most)
    model.position.z = 0;   // forward/back offset

    model.scaling.setAll(0.7);
  });

  // ── INPUT ──────────────────────────────────────────────────────────────────
  const keys = {};
  window.addEventListener("keydown", e => keys[e.code] = true);
  window.addEventListener("keyup",   e => keys[e.code] = false);

  const halfW = FLOOR.WIDTH  / 2 - 0.5;
  const halfD = FLOOR.DEPTH  / 2 - 0.5;

  // ── UPDATE (called every frame from GameScene) ─────────────────────────────
  player.update = () => {
    let dx = 0, dz = 0;

    if (keys["KeyW"] || keys["ArrowUp"])    dz =  PLAYER.SPEED;
    if (keys["KeyS"] || keys["ArrowDown"])  dz = -PLAYER.SPEED;
    if (keys["KeyA"] || keys["ArrowLeft"])  dx = -PLAYER.SPEED;
    if (keys["KeyD"] || keys["ArrowRight"]) dx =  PLAYER.SPEED;

    player.position.x = Math.max(-halfW, Math.min(halfW, player.position.x + dx));
    player.position.z = Math.max(-halfD, Math.min(halfD, player.position.z + dz));

    // Rotate anchor to face movement direction — model inherits this
    if (dx !== 0 || dz !== 0) {
      player.rotation.y = Math.atan2(dx, dz);
    }

    // Camera follows player, never rotates
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + CAMERA.OFFSET_Z;
    camera.position.y = CAMERA.HEIGHT;
    camera.setTarget(player.position);
  };

  return player;
}