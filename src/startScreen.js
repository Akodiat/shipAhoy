import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ships, init, loadShip, registerSW } from "./main.js";

registerSW?.();

let picked = 0;
let appStarted = false;
let current = null;

const startScreen = document.getElementById("startScreen");
const enterBtn = document.getElementById("enterButton");
const prevBtn = document.getElementById("prevShip");
const nextBtn = document.getElementById("nextShip");
const canvas = document.getElementById("previewCanvas");
const nameBox = document.getElementById("shipName");
const descBox = document.getElementById("shipDesc");
const backBtn = document.getElementById("backButton");
const acknowledgementButton = document.getElementById("acknowledgementButton");
const hudBars = document.getElementById("hudBars");
const infoClickHandler = ({ valueInfo, labelInfo }) => {
  descBox.innerHTML = "";

  if (valueInfo !== undefined && valueInfo !== null) {
    const primary = document.createElement("div");
    primary.className = "stat-info-primary";
    primary.textContent = valueInfo;
    descBox.appendChild(primary);
  }

  if (labelInfo) {
    const citation = document.createElement("div");
    citation.className = "stat-citation";
    citation.textContent = labelInfo;
    descBox.appendChild(citation);
  }
};

const loader = new GLTFLoader();
const renderer = new THREE.WebGPURenderer({ canvas, alpha: true, antialias: true });
const CAN_W = 500, CAN_H = 500;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, CAN_W / CAN_H, 0.1, 100);
scene.add(
  new THREE.AmbientLight(0xffffff, 0.6),
  (() => { const d = new THREE.DirectionalLight(0xffffff, 0.8); d.position.set(0.3, 0.4, 1); return d; })()
);

const statKeys = Array.from(new Set(ships.flatMap(s => Object.keys(s.stats ?? {}))));

const toLabel = (key) =>
  key.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/(^|\s)([a-z])/g, (_, s, c) => s + c.toUpperCase());

//initial UI
backBtn.style.display = "none";
acknowledgementButton.style.display = "none";
enterBtn.disabled = false;
await renderer.init();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(CAN_W, CAN_H, false);

//functions
function buildBars() {
  hudBars.innerHTML = "";
  for (const key of statKeys) {
    const row = document.createElement("div");
    row.className = "stat-row";
    row.dataset.key = key;
    row.innerHTML = `
      <span class="stat-label">${toLabel(key)}</span>
      <span class="stat-value">—</span>
      <button class="stat-info-button stat-info" aria-label="More info on ${toLabel(key)}" data-key="${key}">i</button>
    `;
    hudBars.appendChild(row);
  }
}

function updateBars(ship) {
  if (!hudBars || !ship?.stats) return;
  for (const key of statKeys) {
    const row = hudBars.querySelector(`.stat-row[data-key="${key}"]`);
    if (!row) continue;
    const statEntry = ship.stats[key];
    const value = (statEntry && typeof statEntry === "object" && "value" in statEntry)
      ? statEntry.value
      : statEntry;

    const labelInfo =
      (statEntry && typeof statEntry === "object" && statEntry.labelInfo) ??
      ship.statInfoLabel?.[key];

    const valueInfo =
      (statEntry && typeof statEntry === "object" && statEntry.valueInfo) ??
      ship.statInfoValue?.[key] ??
      ship.statInfo?.[key];

    row.querySelector(".stat-value").textContent = value ?? "—";

    const infoBtn = row.querySelector(".stat-info-button");
    const hasInfo = !!(labelInfo || valueInfo);

    if (infoBtn) {
      if (hasInfo) {
        infoBtn.style.display = "inline-flex";
        infoBtn.onclick = () => infoClickHandler({ valueInfo, labelInfo });
      } else {
        infoBtn.style.display = "none";
        infoBtn.onclick = null;
      }
    }
  }
}

function frame(obj, fit = .9) {
  const sphere = new THREE.Sphere();
  new THREE.Box3().setFromObject(obj).getBoundingSphere(sphere);
  const dist = sphere.radius / (Math.sin(THREE.MathUtils.degToRad(camera.fov * .5)) * fit);
  camera.position.set(0, 0, dist);
  camera.lookAt(sphere.center);
  camera.near = dist * .01;
  camera.far = dist * 10;
  camera.updateProjectionMatrix();
}

function show(idx) {
  if (current) scene.remove(current);

  loader.load(ships[idx].path, gltf => {
    current = gltf.scene;
    scene.add(current);
    frame(current);
  });

  nameBox.textContent = ships[idx].name ?? "—";
  descBox.textContent = ships[idx].description ?? "No description available";
  updateBars(ships[idx]);

  prevBtn.disabled = idx === 0;
  nextBtn.disabled = idx === ships.length - 1;
}

//render loop
renderer.setAnimationLoop(() => {
  if (current) current.rotation.y += 0.004;
  renderer.render(scene, camera);
});

//event handlers
prevBtn.onclick = () => { if (picked) show(--picked); };
nextBtn.onclick = () => { if (picked < ships.length - 1) show(++picked); };

window.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") prevBtn.onclick();
  if (e.key === "ArrowRight") nextBtn.onclick();
  else if (e.key === "Enter" || e.code === "NumpadEnter" || e.key === " ") {
    e.preventDefault();
    enterBtn.click();
  }
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

buildBars();
show(picked);
