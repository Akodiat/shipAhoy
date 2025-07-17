import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ships, init, loadShip, registerSW } from "./main.js";

registerSW?.();

const startScreen = document.getElementById("startScreen");
const enterBtn = document.getElementById("enterButton");
const prevBtn = document.getElementById("prevShip");
const nextBtn = document.getElementById("nextShip");
const canvas = document.getElementById("previewCanvas");
const descBox = document.getElementById("shipDesc");
const backBtn = document.getElementById("backButton");
const acknowledgementButton  = document.getElementById("acknowledgementButton");

let picked = 0;
let appStarted = false;

const loader = new GLTFLoader();
const renderer = new THREE.WebGPURenderer({ canvas, alpha: true, antialias: true });
const CAN_W = 500, CAN_H = 500;

enterBtn.disabled = false;
await renderer.init();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(CAN_W, CAN_H, false);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, CAN_W / CAN_H, 0.1, 100);
scene.add(
  new THREE.AmbientLight(0xffffff, 0.6),
  (() => {
    const d = new THREE.DirectionalLight(0xffffff, 0.8);
    d.position.set(0.3, 0.4, 1);
    return d;
  })()
);

let current = null;

function frame(obj, fit = .9) {
  const sphere = new THREE.Sphere();
  new THREE.Box3().setFromObject(obj).getBoundingSphere(sphere);

  const dist = sphere.radius /
    (Math.sin(THREE.MathUtils.degToRad(camera.fov * .5)) * fit);
  camera.position.set(0, 0, dist);
  camera.lookAt(sphere.center);
  camera.near = dist * .01;
  camera.far = dist * 10;
  camera.updateProjectionMatrix();
}

function show(idx) {
  if (current) scene.remove(current);

  loader.load(
    ships[idx].path,
    gltf => {
      current = gltf.scene;
      scene.add(current);
      frame(current);
    }
  );

  descBox.textContent = ships[idx].description ?? "No description available";

  prevBtn.disabled = idx === 0;
  nextBtn.disabled = idx === ships.length - 1;
}

show(picked);

renderer.setAnimationLoop(() => {
  if (current) current.rotation.y += 0.004;
  renderer.render(scene, camera);
});

prevBtn.onclick = () => { if (picked) show(--picked); };
nextBtn.onclick = () => { if (picked < ships.length - 1) show(++picked); };

window.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") prevBtn.onclick();
  if (e.key === "ArrowRight") nextBtn.onclick();
});

enterBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  backBtn.style.display = "";
  acknowledgementButton.style.display = "";
  if (!appStarted) {
    init();
    appStarted = true;
  }
  loadShip(ships[picked].name);
});