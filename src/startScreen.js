import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ships, init, loadShip, registerSW } from "./main.js";
import {ShipDensityMap} from "./shipDensityMap.js";

registerSW?.();

let picked = 0;
let current = null;
let showRequestId = 0;
let selectorInit;
let bgMap, loader, renderer, scene, camera;

const startScreen = document.getElementById("startScreen");
const enterBtn = document.getElementById("enterButton");
const prevBtn = document.getElementById("prevShip");
const nextBtn = document.getElementById("nextShip");
const toggleViewBtn = document.getElementById("toggleStartView");
const canvas = document.getElementById("previewCanvas");
const previewPane = document.querySelector(".preview-wrap");
const mapPane = document.getElementById("bgMapContainer");
const nameBox = document.getElementById("shipName");
const descBox = document.getElementById("shipDesc");
const backBtn = document.getElementById("backButton");
const acknowledgementButton = document.getElementById("acknowledgementButton");
const titleboxWrapper = document.getElementById("titleboxWrapper");
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

const CAN_W = 500, CAN_H = 500;

const statKeys = Array.from(new Set(ships.flatMap(s => Object.keys(s.stats ?? {}))));
const statMax = {};

const toNumber = (v) => {
  if (v === undefined || v === null) return null;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const match = v.match(/-?\d+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
  }
  return null;
};

//compute max numeric value per stat across ships
for (const key of statKeys) {
  let max = null;
  for (const ship of ships) {
    const entry = ship.stats?.[key];
    const val = (entry && typeof entry === "object" && "value" in entry) ? entry.value : entry;
    const num = toNumber(val);
    if (num !== null) {
      max = (max === null) ? num : Math.max(max, num);
    }
  }
  statMax[key] = max;
}

const toLabel = (key) =>
  key.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/(^|\s)([a-z])/g, (_, s, c) => s + c.toUpperCase());

//initial UI
backBtn.style.display = "none";
acknowledgementButton.style.display = "none";
titleboxWrapper.style.display = "none";
init();

function buildBars() {
  hudBars.innerHTML = "";
  for (const key of statKeys) {
    const row = document.createElement("div");
    row.className = "stat-row";
    row.dataset.key = key;
    row.innerHTML = `
      <div class="stat-bar"><div class="stat-bar-fill"></div></div>
      <span class="stat-label">${toLabel(key)}</span>
      <span class="stat-value">—</span>
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

    const barColor =
      (statEntry && typeof statEntry === "object" && statEntry.color) ??
      ship.statColors?.[key];

    row.querySelector(".stat-value").textContent = value ?? "—";
    const fill = row.querySelector(".stat-bar-fill");
    const maxVal = statMax[key];
    const numeric = toNumber(value);
    if (fill) {
      if (numeric !== null && maxVal && maxVal !== 0) {
        const pct = Math.min(100, Math.max(0, (numeric / maxVal) * 100));
        fill.style.width = `${pct}%`;
        fill.style.opacity = 1;
      } else {
        fill.style.width = "0%";
        fill.style.opacity = 0.15;
      }

      if (barColor) {
        fill.style.background = barColor;
      } else {
        fill.style.background = "";
      }
    }

    const hasInfo = !!(labelInfo || valueInfo);

    row.classList.toggle("has-info", hasInfo);
    row.tabIndex = hasInfo ? 0 : -1;
    row.setAttribute("aria-label", hasInfo ? `More info on ${toLabel(key)}` : toLabel(key));
    row.onclick = hasInfo ? () => infoClickHandler({ valueInfo, labelInfo }) : null;
    row.onkeydown = hasInfo
      ? (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            infoClickHandler({ valueInfo, labelInfo });
          }
        }
      : null;
  }
}

function frame(obj, fit = 1.25) {
  const sphere = new THREE.Sphere();
  const box = new THREE.Box3().setFromObject(obj)
  box.getBoundingSphere(sphere);
  obj.position.sub((box.max.clone().add(box.min)).divideScalar(2));
  const dist = sphere.radius / (Math.sin(THREE.MathUtils.degToRad(camera.fov * .5)) * fit);
  camera.position.set(0, 0, dist);
  //camera.lookAt(sphere.center);
  camera.near = dist * .01;
  camera.far = dist * 10;
  camera.updateProjectionMatrix();
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function show(idx) {
  const requestId = ++showRequestId;
  const ship = ships[idx];
  enterBtn.disabled = true;

  if (current) scene.remove(current);

  const setPreview = model => {
    if (requestId !== showRequestId) return;

    current = model;
    scene.add(current);
    frame(current);
    enterBtn.disabled = false;
  };

  if (ship.previewModel) {
    setPreview(ship.previewModel);
  } else {
    loader.load(
      ship.path,
      gltf => {
        ship.previewModel = gltf.scene;
        setPreview(ship.previewModel);
      },
      undefined,
      () => {
        if (requestId === showRequestId) {
          descBox.textContent = "Unable to load the selected ship.";
          enterBtn.disabled = false;
        }
      }
    );
  }

  nameBox.textContent = ship.displayName ?? "—";
  descBox.textContent = ship.description ?? "No description available";
  updateBars(ship);

  bgMap.updateShipType(ship.shipDensityDataName);
}

prevBtn.onclick = () => {
  picked = mod(picked - 1, ships.length);
  show(picked);
};

nextBtn.onclick = () => {
  picked = mod(picked + 1, ships.length);
  show(picked);
};

toggleViewBtn.onclick = () => {
  const showingMap = mapPane.classList.toggle("is-active");
  previewPane.classList.toggle("is-active", !showingMap);
  toggleViewBtn.textContent = showingMap ? "Show ship" : "Show map";
  toggleViewBtn.setAttribute("aria-pressed", String(showingMap));
  window.dispatchEvent(new Event("resize"));
};

window.addEventListener("keydown", e => {
  if (startScreen.style.display === "none") return;
  if (e.target.closest?.("button, a, input, select, textarea")) return;

  if (e.key === "ArrowLeft") prevBtn.onclick();
  if (e.key === "ArrowRight") nextBtn.onclick();
  else if (e.key === "Enter" || e.code === "NumpadEnter" || e.key === " ") {
    e.preventDefault();
    enterBtn.click();
  }
});

function initSelector() {
  if (selectorInit) return selectorInit;

  selectorInit = (async () => {
    if (!bgMap) {
      bgMap = new ShipDensityMap(
        mapPane,
        "resources/osm_water.json",
        ships.map(s => s.shipDensityDataName)
      );
      bgMap.setData("resources/shipDensityCounts.csv");
    }

    loader = new GLTFLoader();
    renderer = new THREE.WebGPURenderer({ canvas, alpha: true, antialias: true });
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, CAN_W / CAN_H, 0.1, 100);
    scene.add(
      new THREE.AmbientLight(0xffffff, 0.6),
      (() => { const d = new THREE.DirectionalLight(0xffffff, 0.8); d.position.set(0.3, 0.4, 1); return d; })()
    );

    await renderer.init();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(CAN_W, CAN_H, false);

    buildBars();
    show(picked);
  })().catch(error => {
    selectorInit = undefined;
    renderer = undefined;
    descBox.textContent = "Unable to initialize the ship selector.";
    console.error(error);
    throw error;
  });

  return selectorInit;
}

function renderSelector() {
  if (current) current.rotation.y += 0.001;
  renderer.render(scene, camera);
}

function openSelector() {
  initSelector()
    .then(() => renderer.setAnimationLoop(renderSelector))
    .catch(() => {});
}

function openShip() {
  startScreen.style.display = "none";
  renderer?.setAnimationLoop(null);
  loadShip(ships[picked].name, () => {
    backBtn.style.display = "";
    acknowledgementButton.style.display = "";
    titleboxWrapper.style.display = "";
  }, () => {
    startScreen.style.display = "flex";
    openSelector();
    initSelector().then(() => {
      descBox.textContent = "Unable to load the selected ship.";
    }).catch(() => {});
  });
}

enterBtn.addEventListener("click", openShip);
window.addEventListener("shipselectoropen", openSelector);

openShip();
