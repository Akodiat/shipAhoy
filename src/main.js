import * as THREE from "three";
import { color, pass, objectPosition, screenUV } from "three/tsl";
import { gaussianBlur } from "three/addons/tsl/display/GaussianBlurNode.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { WaterMesh } from "three/addons/objects/WaterMesh.js";
import { SkyMesh } from "three/addons/objects/SkyMesh.js";
import Stats from "three/addons/libs/stats.module.js";
import { MapView } from "./map.js";
import { PlotView } from "./plot.js";
import { annotations } from "./annotations.js";
import CameraControls from "../lib/camera-controls.module.min.js";
import { ParticleSystem } from "./particles.js";
import { OutputFlow } from "./outputFlow.js";
import { MapViewTiff } from "./map_tiff.js";

CameraControls.install({ THREE: THREE });

let camera, scene, labelScene, renderer;
const modelGroup = new THREE.Group();
let currentShip;
let detailModel;
let controls;
let stats;
let water, sun, smoke;
let mapView, plotView;
let postProcessing;
let outputFlow;
let annotationSprites = new THREE.Group();
let tiffMapView = null;
let highlightedAnnotation, selectedAnnotation;

const mixers = [];

const threeContainer = document.getElementById("threeContainer");
const annotationLabel = document.getElementById("annotationLabel");
const annotationSizeDefault = 0.03;
const annotationSizeHighlight = 0.035;
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const backBtn = document.getElementById("backButton");
const GEO_TIFFS = {
  BALW_2018: "./resources/STEAM_BalW_2018.tif",
  SCRUB_CLOSED_2018: "./resources/STEAM_SCRUB_W_CLOSED_2018.tif",
};

const ships = [
  {
    name: "container",
    path: "resources/cargoship.glb",
    smokeStackPos: new THREE.Vector3(0.5, 45, -57),
    defaultLookat: [75, 50, 150, -20, 5, 20],
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam mattis pulvinar ligula, sit amet scelerisque sem. Aenean et consequat risus, non ullamcorper urna. Morbi tincidunt diam urna, vel lobortis leo accumsan et. Nulla quis tincidunt purus. Praesent et arcu a elit accumsan dictum. Suspendisse diam odio, suscipit at dui vitae, gravida consectetur velit. Nullam mauris leo, dictum sed volutpat sed, tincidunt vel turpis. Vivamus aliquam porttitor magna, id tempus lacus aliquet at. Curabitur auctor purus et gravida rhoncus. Mauris vitae velit nulla. Aliquam porta, quam vel efficitur sodales, nunc odio lacinia massa, placerat mollis massa orci id enim. Morbi elit ligula, eleifend eu lacus non, imperdiet eleifend ex. Sed lacinia a arcu id convallis. Curabitur convallis, ante gravida dapibus suscipit, neque neque maximus leo, vel pellentesque magna orci quis velit. Phasellus ornare efficitur quam, sit amet consectetur felis imperdiet sed. Nunc iaculis lacus urna, id commodo elit lacinia ac.",
    stats: {
      speed: 68,
      capacity: 95,
      noise: 35,
      emissions: 40
    }
  },
  {
    name: "sail",
    path: "resources/sailingship.glb",
    defaultLookat: [26, 24, 21, 0, 7, 0],
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam mattis pulvinar ligula, sit amet scelerisque sem. Aenean et consequat risus, non ullamcorper urna. Morbi tincidunt diam urna, vel lobortis leo accumsan et. Nulla quis tincidunt purus. Praesent et arcu a elit accumsan dictum. Suspendisse diam odio, suscipit at dui vitae, gravida consectetur velit. Nullam mauris leo, dictum sed volutpat sed, tincidunt vel turpis. Vivamus aliquam porttitor magna, id tempus lacus aliquet at. Curabitur auctor purus et gravida rhoncus. Mauris vitae velit nulla. Aliquam porta, quam vel efficitur sodales, nunc odio lacinia.",
    stats: {
      speed: 38,
      capacity: 12,
      noise: 70,
      emissions: 96
    }
  }
];

function advanceShip(step) {
    const name = currentShip ? currentShip.name : ships[0].name;
    const i = ships.findIndex(s => s.name === name);
    const iNew = mod(i + step, ships.length);
    loadShip(ships[iNew].name);
}

function loadShip(name) {
    const ship = ships.find(s => s.name === name);

    // Remove previous model (if any)
    if (currentShip && currentShip.model) {
        modelGroup.remove(currentShip.model);
    }

    currentShip = ship;
    const loaderElement = document.getElementById("loader");

    // This is called either when a model has been loaded,
    // or one already found in "ship.model"
    const setModel = (model, animations) => {
        currentShip.model = model;
        currentShip.animations = animations;
        modelGroup.add(currentShip.model);
        modelGroup.name = name;
        currentShip.model.name = name;

        currentShip.model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        if (animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(animations[0]);
            action.play();
            mixers.push(mixer);
        }

        // Setup annotations
        const spriteTexture = loadShip._labelTexture ??= (() => { const t = textureLoader.load("resources/label.png"); t.colorSpace = THREE.SRGBColorSpace; return t; })();

        // Position smoke
        if (ship.smokeStackPos !== undefined) {
            smoke.visible = true;
            smoke.position.copy(ship.smokeStackPos);
        } else {
            smoke.visible = false;
        }

        // Clear old annotations
        labelScene.remove(annotationSprites);
        annotationSprites = new THREE.Group();

        for (const annotation of annotations) {
            if (annotation.spec.shipTypes === undefined ||
                annotation.spec.shipTypes[name] === undefined ||
                annotation.spec.shipTypes[name].labelPos === undefined
            ) {
                continue;
            }
            annotation.sprite = new THREE.Sprite(
                new THREE.SpriteMaterial({
                    map: spriteTexture,
                    color: 0xFFFFFF,
                    transparent: true,
                    sizeAttenuation: false,
                    alphaTest: 0.5
                }
                ));
            annotation.sprite.annotation = annotation;
            annotation.sprite.position.copy(annotation.spec.shipTypes[name].labelPos);
            annotation.sprite.scale.setScalar(annotationSizeDefault);
            annotationSprites.add(annotation.sprite);
        }
        labelScene.add(annotationSprites);

        loaderElement.style.display = "none";

        // If we have a selected annotation, keep it open for the
        // new ship model if the annotation is present there too.
        // Otherwise, clear selection.
        if (selectedAnnotation === undefined) {
            controls.setLookAt(...currentShip.defaultLookat, true);
        } else {
            const a = selectedAnnotation.annotation;
            if (a.spec.shipTypes[name] !== undefined) {
                controls.setLookAt(
                    ...a.spec.shipTypes[name].cameraPos.toArray(),
                    ...a.spec.shipTypes[name].labelPos.toArray(),
                    true
                );
            } else {
                clearAnnotationSelection();
            }
        }
    };

    if (ship.model !== undefined) {
        // Use model already loaded
        setModel(ship.model, ship.animations)
    } else {
        // Make loader element visible
        loaderElement.style.display = "";
        // Load model (only needs to run once)
        gltfLoader.load(
            ship.path,
            gltf => setModel(gltf.scene, gltf.animations),
            xhr => {
                // Update progress bar
                document.getElementById("loaderProgress").value = (xhr.loaded / xhr.total * 100);
            }
        );
    }
}


// Registers a service worker (to cache content offline)
async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register("./src/sw.js");
            console.log("Service worker registered")
        } catch (error) {
            console.warn("Error while registering service worker: " + error.message);
        }
    } else {
        console.warn("Service workers API not available");
    }
};

// registerSW();

// init();

function init() {
    const waterLevel = 8;

    // Setup map
    mapView = new MapView("map");

    // Setup plot
    plotView = new PlotView("plot");

    // renderer

    renderer = new THREE.WebGPURenderer();
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(
        threeContainer.offsetWidth,
        threeContainer.offsetHeight
    );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setAnimationLoop(animate);
    threeContainer.appendChild(renderer.domElement);

    // Setup scene
    camera = new THREE.PerspectiveCamera(50, threeContainer.offsetWidth / threeContainer.offsetHeight, 0.25, 5000);

    scene = new THREE.Scene();
    labelScene = new THREE.Scene();

    scene.add(modelGroup);

    sun = new THREE.Vector3();

    smoke = new ParticleSystem(10, 25, undefined, new THREE.Vector3(0, 1, -0.5), textureLoader);
    scene.add(smoke);

    const waterGeometry = new THREE.CircleGeometry(5000, 3);
    const waterNormals = textureLoader.load("resources/waternormals.jpg");
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

    water = new THREE.Group();
    const waterMesh = new WaterMesh(
        waterGeometry,
        {
            waterNormals: waterNormals,
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3,
            size: 1,
        }
    );
    waterMesh.rotation.x = - Math.PI / 2;
    waterMesh.position.y = waterLevel;
    water.add(waterMesh);

    const waterUnderside = new THREE.Mesh(
        waterGeometry,
        new THREE.MeshPhysicalMaterial({
            color: 0xFFFFFF,
            normalMap: waterNormals,
            transmission: 1,
            opacity: 1,
            thickness: 1,
            metalness: 0,
            roughness: 0,
            ior: 1.3,
            transparent: true
        })
    );
    waterUnderside.rotation.x = Math.PI / 2;
    waterUnderside.position.y = waterLevel - 0.001;
    water.add(waterUnderside);

    scene.add(water);

    const sky = new SkyMesh();
    sky.scale.setScalar(10000);
    scene.add(sky);

    sky.turbidity.value = 10;
    sky.rayleigh.value = 2;
    sky.mieCoefficient.value = 0.005;
    sky.mieDirectionalG.value = 0.8;

    const parameters = {
        elevation: 2,
        azimuth: 180
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const sceneEnv = new THREE.Scene();

    let renderTarget;

    function updateSun() {
        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.sunPosition.value.copy(sun);
        waterMesh.sunDirection.value.copy(sun).normalize();

        if (renderTarget !== undefined) renderTarget.dispose();

        sceneEnv.add(sky);
        renderTarget = pmremGenerator.fromScene(sceneEnv);
        scene.add(sky);

        scene.environment = renderTarget.texture;
    }
    renderer.init().then(updateSun);


    // post processing

    const labelPass = pass(labelScene, camera);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode();
    const scenePassDepth = scenePass.getLinearDepthNode().remapClamp(.3, .5);

    const waterMask = objectPosition(camera).y.greaterThan(screenUV.y.mul(camera.near).add(waterLevel));

    const scenePassColorBlurred = gaussianBlur(scenePassColor);
    scenePassColorBlurred.directionNode = waterMask.select(scenePassDepth, scenePass.getLinearDepthNode().mul(5));

    const vignette = screenUV.distance(.5).mul(1.35).oneMinus();

    postProcessing = new THREE.PostProcessing(renderer);
    postProcessing.outputNode = waterMask.select(scenePassColorBlurred, scenePassColorBlurred.mul(color(0x7E95A5)).mul(vignette)).add(labelPass);

    // Camera controls
    controls = new CameraControls(camera, renderer.domElement);

    // Don't move the camera further than 500 m away
    controls.maxDistance = 500;

    // Load ship
    // loadShip("container");

    // Set initial camera view
    // controls.setLookAt(...currentShip.defaultLookat);

    window.controls = controls;

    // Setup overview button
    document.getElementById("overviewReturnButton").addEventListener("click", clearAnnotationSelection);

    // Hide infobox until an annotation is clicked
    document.getElementById("infobox").style.display = "none";


    // Handle resizing

    window.addEventListener("resize", onWindowResize);

    document.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("click", event => {
        if (highlightedAnnotation) {
            const a = highlightedAnnotation.annotation;
            if (!mapView.fullyLoaded) {
                // Don't do anyting until map data is loaded
                return;
            }


            selectedAnnotation = highlightedAnnotation;
            selectAnnotation(a);

            // Neccesary in case we have a touch device
            // where pointer is never moved.
            highlightedAnnotation.material.color.set('#ffffff');
            highlightedAnnotation.scale.setScalar(annotationSizeDefault);
            renderer.domElement.style.cursor = "";
            annotationLabel.style.display = "none";
            highlightedAnnotation = undefined;
        } else {
            // Neccesary in case we have a touch device
            // where pointer is never moved.
            onPointerMove(event);
        }
    });

    // Sometimes, the user might click the label itself, rather
    // than the sprite, so this makes sure the label is clickable
    // too. (useful on mobile in particular)
    annotationLabel.addEventListener("click", () => {
        selectAnnotation(highlightedAnnotation.annotation);
        annotationLabel.style.display = "none";
    })

    document.addEventListener("keydown", event => {
        switch (event.key) {
            case "q":
                // FPS stats shown in upper-left corner
                // Only relevant for debugging
                if (stats) {
                    document.body.removeChild(stats.dom);
                    stats = undefined;
                } else {
                    stats = new Stats();
                    document.body.appendChild(stats.dom);
                }
                break;
            case "Backspace": clearAnnotationSelection(); break;
            case "ArrowLeft": advanceAnnotation(-1); break;
            case "ArrowRight": advanceAnnotation(1); break;
            case "ArrowUp": advanceShip(-1); break;
            case "ArrowDown": advanceShip(1); break;
        }
    });
}

/**
 * Mathematically correct modulus function
 * @param {number} n
 * @param {number} m
 * @returns {number} n % m
 */
function mod(n, m) {
    return ((n % m) + m) % m;
}

/**
 * Step (either forward or backward) through the annotations
 * @param {number} step
 */
function advanceAnnotation(step) {
    if (!mapView.fullyLoaded) {
        // Don't do anyting until map data is loaded
        return;
    }
    const as = annotationSprites.children;
    if (selectedAnnotation === undefined) {
        selectedAnnotation = as[0];
    } else {
        const currentIdx = as.findIndex(v => v === selectedAnnotation);
        selectedAnnotation = as[mod(currentIdx + step, as.length)];
    }
    selectAnnotation(selectedAnnotation.annotation);
}

window.selectAnnotationByName = (annotationName) => {
    const sprite = annotationSprites.children.find(
        a => a.annotation.spec.name === annotationName
    );
    selectAnnotation(sprite.annotation);
}

function selectAnnotation(a) {
    controls.setLookAt(
        ...a.spec.shipTypes[currentShip.name].cameraPos.toArray(),
        ...a.spec.shipTypes[currentShip.name].labelPos.toArray(),
        true
    );

    document.getElementById("textbox").innerHTML =
        `<h2>${a.spec.name}</h2>` + `<div id="body-text">${a.content}</div>`;
    document.getElementById("infobox").style.display = "flex";

    a.onSelect();

    plotView.plot(a);

    const legend = document.getElementById("plotCaption");
    if (a.spec.plotCaption) {
        legend.style.display = "block";
        legend.innerHTML = a.spec.plotCaption;
    } else {
        legend.style.display = "none";
    }

    modelGroup.remove(detailModel);
    if (a.spec.model !== undefined) {
        gltfLoader.load(a.spec.model, function (gltf) {
            detailModel = gltf.scene;
            detailModel.scale.multiplyScalar(1);
            modelGroup.add(detailModel);

            if (gltf.animations.length > 0) {
                const mixer = new THREE.AnimationMixer(gltf.scene);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
                mixers.push(mixer);
            }
        });
    }

    water.visible = !a.spec.hideWater;

    modelGroup.remove(outputFlow);
    if (a.spec.shipTypes[currentShip.name].outletPos) {
        outputFlow = new OutputFlow();
        outputFlow.position.copy(a.spec.shipTypes[currentShip.name].outletPos);
        modelGroup.add(outputFlow);
    }

    const wantsTiff = !!a.spec.mapTiff;
    const heatmapEl = document.getElementById("map");
    const tiffEl = document.getElementById("mapTiff");

    if (wantsTiff) {
        tiffEl.style.display = "block";
        heatmapEl.style.display = "none";

        if (!tiffMapView) tiffMapView = new MapViewTiff("mapTiff");
        const tiffKeyOrUrl = a.spec.mapTiff;
        const tiffUrl = GEO_TIFFS[tiffKeyOrUrl] ?? tiffKeyOrUrl;
        if (tiffUrl) {
            tiffMapView.show(tiffUrl);
        } else {
            console.warn("No geotiff found for", a.spec.name, tiffKeyOrUrl);
        }
        setTimeout(() => tiffMapView.map.invalidateSize(), 0);
    } else {
        tiffEl.style.display = "none";

        if (heatmapEl.style.display !== "none") {
            setTimeout(() => mapView?.map?.invalidateSize(), 0);
        }
    }

    const style = document.getElementById("threeContainer").style;
    const smallScreen = window.matchMedia("(max-width: 768px)").matches;

    if (smallScreen) {
        style.height = "60vh";
        style.position = "static";
        onWindowResize();
        controls.setFocalOffset(0, 0, 0);
    } else {
        style.height = "100%";
        style.position = "absolute";
        const p = a.spec.shipTypes[currentShip.name];
        const dist = p.cameraPos.distanceTo(p.labelPos);
        controls.setFocalOffset(0.25 * dist, 0, 0);
    }

    if (tiffMapView?.map) {
        setTimeout(() => tiffMapView.map.invalidateSize(), 0);
    }
    if (mapView?.map) {
        setTimeout(() => mapView.map.invalidateSize(), 0);
    }
}

function clearAnnotationSelection() {
    controls.setLookAt(...currentShip.defaultLookat, true);
    document.getElementById("infobox").style.display = "none";
    selectedAnnotation = undefined;

    modelGroup.remove(detailModel);
    modelGroup.remove(outputFlow);
    water.visible = true;

    controls.setFocalOffset(0, 0, 0);
    const style = document.getElementById("threeContainer").style;
    style.height = "100%";
    style.position = "absolute";
    onWindowResize();
}

function onPointerMove(event) {
    if (highlightedAnnotation) {
        highlightedAnnotation.material.color.set("#ffffff");
        highlightedAnnotation.scale.setScalar(annotationSizeDefault);
        renderer.domElement.style.cursor = "";
        annotationLabel.style.display = "none";
        highlightedAnnotation = undefined;
    }

    pointer.x = (event.clientX / threeContainer.offsetWidth) * 2 - 1;
    pointer.y = - (event.clientY / threeContainer.offsetHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObject(annotationSprites, true);

    if (intersects.length > 0) {
        const res = intersects.filter(res => res && res.object)[0];

        if (res && res.object) {
            renderer.domElement.style.cursor = "pointer"
            highlightedAnnotation = res.object;
            highlightedAnnotation.scale.setScalar(annotationSizeHighlight);
            highlightedAnnotation.material.color.set('#f00');

            annotationLabel.innerHTML = highlightedAnnotation.annotation.spec.name;
            annotationLabel.style.display = "block";

            const p = highlightedAnnotation.position.clone().project(camera);

            const w = renderer.domElement.width / window.devicePixelRatio;
            const h = renderer.domElement.height / window.devicePixelRatio;
            p.x = Math.round((0.5 + p.x / 2) * w);
            p.y = Math.round((0.5 - p.y / 2) * h);

            // Do not draw the label outside the canvas
            if (p.x + annotationLabel.offsetWidth > w) {
                p.x -= annotationLabel.offsetWidth
            }
            if (p.y + annotationLabel.offsetHeight > h) {
                p.y -= annotationLabel.offsetHeight
            }

            annotationLabel.style.top = `${p.y}px`;
            annotationLabel.style.left = `${p.x}px`;
        }
    }
}

function onWindowResize() {
    camera.aspect = threeContainer.offsetWidth / threeContainer.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight);
    mapView.map.invalidateSize();
}

function animate() {
    if (stats) {
        stats.update();
    }

    const delta = clock.getDelta();
    controls.update(delta);

    smoke.update(delta);

    if (modelGroup) {
        const t = clock.getElapsedTime();
        modelGroup.position.y = Math.sin(t) * 0.01;
        const e = new THREE.Euler(
            Math.sin(t) * .001,
            0,
            Math.cos(t) * .001
        );
        modelGroup.quaternion.setFromEuler(e);

        for (const mixer of mixers) {
            mixer.update(delta);
        }

        //Render scene
        postProcessing.render();
        //renderer.render(scene, camera);
    }
}

backBtn.addEventListener("click", () => {
    backBtn.style.display = "none";
    document.getElementById("acknowledgementButton").style.display = "none";

    document.getElementById("startScreen").style.display = "flex";
});

//reset page afte 5 minutes of inactivity
(() => {
  const IDLE_MS = 5 * 60 * 1000; //5 minutes
  let timer;

  const refresh = () => location.reload();

  const reset = () => {
    clearTimeout(timer);
    timer = setTimeout(refresh, IDLE_MS);
  };

  ["pointermove","pointerdown","click","keydown","wheel","touchstart"].forEach(ev =>
    addEventListener(ev, reset, { passive: true })
  );

  addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") reset();
    else clearTimeout(timer);
  });

  reset();
})();

export { ships, init, loadShip, registerSW };
