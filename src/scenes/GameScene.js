import * as BABYLON from "@babylonjs/core";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/loaders/glTF";
import { SkyMaterial } from "@babylonjs/materials/sky";
import { FLOOR, CAMERA } from "../config.js";
import { createPlayer } from "../entities/Player.js";
import { createWormSpawner } from "../systems/WormSpawner.js";

export function GameScene(engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.53, 0.81, 0.92, 1); // fallback only

  // ── CAMERA ─────────────────────────────────────────────────────────────────
  const camera = new BABYLON.FreeCamera(
    "cam",
    new BABYLON.Vector3(0, CAMERA.HEIGHT, CAMERA.OFFSET_Z),
    scene
  );
  camera.setTarget(BABYLON.Vector3.Zero());

  // ── LIGHTS ─────────────────────────────────────────────────────────────────
  const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
  hemi.intensity = 0.8;
  hemi.diffuse   = new BABYLON.Color3(1, 0.95, 0.8);

  const dir = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(-1, -2, -1), scene);
  dir.position  = new BABYLON.Vector3(20, 40, 20);
  dir.intensity = 0.6;

  // ── SKYBOX ─────────────────────────────────────────────────────────────────
  const skyMat = new SkyMaterial("sky", scene);
  skyMat.backFaceCulling = false;

  // Sunny beach day atmosphere
  skyMat.turbidity       = 4;     // atmospheric haze
  skyMat.luminance       = 1.0;   // overall brightness
  skyMat.inclination     = 0.35;  // sun height (0.5=horizon, 0=overhead)
  skyMat.azimuth         = 0.25;  // sun horizontal angle
  skyMat.rayleigh        = 2.0;   // blue sky scattering intensity
  skyMat.mieDirectionalG = 0.95;  // sun glow tightness
  skyMat.mieCoefficient  = 0.005; // sun halo size

  // Pin the directional light to match the sky's sun so lighting feels consistent
  skyMat.useSunPosition = true;
  skyMat.sunPosition    = new BABYLON.Vector3(50, 100, 50);
  dir.position          = skyMat.sunPosition.clone();
  dir.direction         = BABYLON.Vector3.Zero().subtract(dir.position).normalize();

  const skybox = BABYLON.MeshBuilder.CreateBox("skybox", { size: 1000 }, scene);
  skybox.material   = skyMat;
  skybox.isPickable = false;

  // ── BEACH GLB ──────────────────────────────────────────────────────────────
  SceneLoader.ImportMeshAsync("", "./assets/", "beach_floor.glb", scene).then((result) => {
    result.meshes.forEach(m => {
      m.rotationQuaternion = null;
      m.isPickable = false;
    });

    const root = result.meshes[0];
    root.position = BABYLON.Vector3.Zero();
    root.rotation.y = -Math.PI / 2;
  });

  // ── DEGRADATION STATE ──────────────────────────────────────────────────────
  const degradationMeshes = [];

  const spawnDeadThing = (name, x, z, color) => {
    const mesh = BABYLON.MeshBuilder.CreateBox(name, { size: 0.6 }, scene);
    mesh.position.set(x, 0.3, z);
    mesh.isPickable = false;
    const mat = new BABYLON.StandardMaterial(name + "Mat", scene);
    mat.diffuseColor = color;
    mesh.material    = mat;
    degradationMeshes.push(mesh);
    return mesh;
  };

  // ── SKY / AMBIENT REFERENCES ───────────────────────────────────────────────
  const SKY_DEAD = new BABYLON.Color4(0.45, 0.47, 0.50, 1);

  // ── DEGRADATION STEPS ──────────────────────────────────────────────────────
  const degradationSteps = {
    3: () => {
      hemi.diffuse = new BABYLON.Color3(0.85, 0.80, 0.70);
    },
    6: () => {
      spawnDeadThing("deadCrab", 8, -3, new BABYLON.Color3(0.8, 0.3, 0.1));
    },
    9: () => {
      // Sky gets hazier — push turbidity up and lower sun
      skyMat.turbidity   = 10;
      skyMat.inclination = 0.45;
      hemi.diffuse       = new BABYLON.Color3(0.75, 0.72, 0.65);
    },
    12: () => {
      spawnDeadThing("deadFish", -5, -7, new BABYLON.Color3(0.7, 0.7, 0.7));
    },
    15: () => {
      hemi.diffuse  = new BABYLON.Color3(0.65, 0.63, 0.60);
      dir.intensity = 0.3;
      // Sky going overcast — crank turbidity, push sun toward horizon
      skyMat.turbidity   = 20;
      skyMat.luminance   = 0.7;
      skyMat.inclination = 0.48;
    },
    18: () => {
      spawnDeadThing("deadBird", -10, 3, new BABYLON.Color3(0.5, 0.5, 0.5));
      // Full overcast — skybox fades out, fallback clear color shows
      skyMat.luminance = 0.4;
      scene.clearColor = SKY_DEAD;
    },
    21: () => {
      hemi.intensity = 0.4;
      hemi.diffuse   = new BABYLON.Color3(0.55, 0.55, 0.55);
      dir.intensity  = 0.1;
    },
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  const ui = document.getElementById("ui");
  const updateUI = (total) => {
    ui.textContent = `🪱 Worms collected: ${total}`;
  };
  updateUI(0);

  // ── PLAYER ─────────────────────────────────────────────────────────────────
  const player = createPlayer(scene, camera);

  // ── WORM SPAWNER ───────────────────────────────────────────────────────────
  const spawner = createWormSpawner(scene, player, (total) => {
    updateUI(total);
    if (degradationSteps[total]) {
      degradationSteps[total]();
    }
  });

  // ── GAME LOOP ──────────────────────────────────────────────────────────────
  scene.registerBeforeRender(() => {
    const delta = engine.getDeltaTime();
    player.update();
    spawner.update(delta);
  });

  return scene;
}