/** Modernist Dungeon Ledger: minimal Babylon room tableau using only procedural geometry. */

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";

export type GameHandle = { scene: Scene; dispose: () => void };

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.035, 0.04, 0.05, 1);
  const camera = new ArcRotateCamera("ledger-camera", -Math.PI / 2, 1.12, 16, new Vector3(0, 0, 0), scene);
  camera.lowerRadiusLimit = 16;
  camera.upperRadiusLimit = 16;
  camera.attachControl(canvas, false);

  new HemisphericLight("ledger-light", new Vector3(0, 1, 0.3), scene).intensity = 1.1;
  const floorMaterial = new StandardMaterial("floor-material", scene);
  floorMaterial.diffuseColor = Color3.FromHexString("#20242b");
  floorMaterial.specularColor = Color3.Black();
  const floor = MeshBuilder.CreateGround("crypt-floor", { width: 10, height: 8, subdivisions: 2 }, scene);
  floor.material = floorMaterial;

  const wallMaterial = new StandardMaterial("wall-material", scene);
  wallMaterial.diffuseColor = Color3.FromHexString("#12161c");
  wallMaterial.specularColor = Color3.Black();
  [
    [0, 0.5, -4, 10, 1, 0.18],
    [0, 0.5, 4, 10, 1, 0.18],
    [-5, 0.5, 0, 0.18, 1, 8],
    [5, 0.5, 0, 0.18, 1, 8],
  ].forEach(([x, y, z, width, height, depth], index) => {
    const wall = MeshBuilder.CreateBox(`wall-${index}`, { width, height, depth }, scene);
    wall.position = new Vector3(x, y, z);
    wall.material = wallMaterial;
  });

  const playerMaterial = new StandardMaterial("player-material", scene);
  playerMaterial.diffuseColor = Color3.FromHexString("#f0ede7");
  playerMaterial.emissiveColor = Color3.FromHexString("#242a33");
  const enemyMaterial = new StandardMaterial("enemy-material", scene);
  enemyMaterial.diffuseColor = Color3.FromHexString("#d95b38");
  enemyMaterial.emissiveColor = Color3.FromHexString("#24110b");
  const sparkMaterial = new StandardMaterial("spark-material", scene);
  sparkMaterial.diffuseColor = Color3.FromHexString("#78c5c8");
  sparkMaterial.emissiveColor = Color3.FromHexString("#2d777a");
  const player = MeshBuilder.CreateCylinder("warden-marker", { height: 1.25, diameter: 0.9, tessellation: 6 }, scene);
  player.position = new Vector3(-2.25, 0.62, 0);
  player.material = playerMaterial;
  const enemy = MeshBuilder.CreateBox("enemy-marker", { width: 1.1, height: 1.35, depth: 1.1 }, scene);
  enemy.position = new Vector3(2.25, 0.68, 0);
  enemy.material = enemyMaterial;
  const spark = MeshBuilder.CreateSphere("combo-spark", { diameter: 0.22, segments: 8 }, scene);
  spark.material = sparkMaterial;

  let time = 0;
  scene.onBeforeRenderObservable.add(() => {
    time += engine.getDeltaTime() / 1000;
    player.position.z = Math.sin(time * 1.7) * 0.12;
    enemy.position.z = Math.sin(time * 1.7 + Math.PI) * 0.12;
    spark.position = new Vector3(Math.sin(time * 1.25) * 1.7, 0.9 + Math.abs(Math.cos(time * 2)) * 0.26, 0);
    spark.scaling.setAll(0.8 + Math.abs(Math.sin(time * 3)) * 0.5);
  });
  return { scene, dispose: () => scene.dispose() };
}
