import * as THREE from "three";
import {color, pass, objectPosition, screenUV} from "three/tsl";
import {gaussianBlur} from "three/addons/tsl/display/GaussianBlurNode.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {WaterMesh} from "three/addons/objects/WaterMesh.js";
import {SkyMesh} from "three/addons/objects/SkyMesh.js";
import Stats from "three/addons/libs/stats.module.js";
import {MapView} from "./map.js";
import {PlotView} from "./plot.js";
import {annotations} from "./annotations.js";
import CameraControls from "../lib/camera-controls.module.min.js";
import {ParticleSystem} from "./particles.js";
import {OutputFlow} from "./outputFlow.js";
import {createCameraAnimation, exportDomeVideo} from "./domeExport.js";

window.exportDomeVideo = (
    resolution=800, duration=5, framerate=60, preview=false, eyeSep=0.064, tilt=27, transitionTime=1
) => {
    scene.remove(water);

    exportDomeVideo(
        resolution, duration, framerate, eyeSep, tilt, renderer, scene,
        annotations, ships, mixers, preview,
        (timestamp, delta) => {
            const t = timestamp / 1000;

            smoke.update(delta);

            if (modelGroup) {
                modelGroup.position.y = Math.sin(t) * 0.01;
                const e = new THREE.Euler(
                    Math.sin(t)* .001,
                    0,
                    Math.cos(t)* .001
                );
                modelGroup.quaternion.setFromEuler(e);

                for (const mixer of mixers) {
                    mixer.update(delta);
                }
            }
        }
    )
};

CameraControls.install({THREE: THREE});

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

const mixers = [];

const threeContainer = document.getElementById("threeContainer");

const annotationLabel = document.getElementById("annotationLabel");
let highlightedAnnotation, selectedAnnotation;
const annotationSizeDefault = 0.03;
const annotationSizeHighlight = 0.035;
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

const ships = [
    {
        name: "container",
        path: "resources/cargoship.glb",
        smokeStackPos: new THREE.Vector3(0.5, 45, -57),
        defaultLookat: [
            80, 50, 160, // Position
            -20, 5, 20   // Target
        ]
    },
    {
        name: "tanker",
        path: "resources/chemtanker.glb",
        smokeStackPos: new THREE.Vector3(0.5, 45, -105),
        defaultLookat: [
            80, 50, 160, // Position
            -20, 5, 20   // Target
        ]
    },{
        name: "cruise",
        path: "resources/cruiseship.glb",
        smokeStackPos: new THREE.Vector3(0.5, 65, -85),
        defaultLookat: [
            75, 70, 230, // Position
            -20, 5, 20   // Target
        ]
    }
];

function advanceShip(step) {
    const name = currentShip ? currentShip.name : ships[0].name;
    const i = ships.findIndex(s=>s.name === name);
    const iNew = mod(i+step, ships.length);
    loadShip(ships[iNew].name);
}

function loadShip(name) {
    const ship = ships.find(s=>s.name === name);

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


        if (animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(animations[0]);
            action.play();
            mixers.push(mixer);
        }

        // Setup annotations
        const spriteTexture = textureLoader.load(
            "resources/label.png",
            texture => texture.colorSpace = THREE.SRGBColorSpace
        );

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
            if (a.spec.shipTypes[name] !== undefined &&
                a.spec.shipTypes[name].cameraPos !== undefined &&
                a.spec.shipTypes[name].labelPos !== undefined
            ) {
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
                document.getElementById("loaderProgress").value = ( xhr.loaded / xhr.total * 100 );
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

registerSW();

init();

function init() {
    const waterLevel = 8;

    // Setup map
    mapView = new MapView("map");

    // Setup plot
    plotView = new PlotView("plot");

    // renderer

    renderer = new THREE.WebGPURenderer();
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

    smoke = new ParticleSystem(10, 25, undefined, new THREE.Vector3(0,1,-0.5), textureLoader);
    scene.add(smoke);

    const waterGeometry =  new THREE.CircleGeometry( 5000, 3 );
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

    const scenePassColorBlurred = gaussianBlur( scenePassColor );
    scenePassColorBlurred.directionNode = waterMask.select( scenePassDepth, scenePass.getLinearDepthNode().mul(5));

    const vignette = screenUV.distance( .5 ).mul( 1.35 ).oneMinus();

    postProcessing = new THREE.PostProcessing(renderer);
    postProcessing.outputNode = waterMask.select(scenePassColorBlurred, scenePassColorBlurred.mul(color(0x7E95A5)).mul(vignette)).add(labelPass);

    // Camera controls
    controls = new CameraControls(camera, renderer.domElement);

    // Don't move the camera further than 500 m away
    controls.maxDistance = 500;

    // Load ship
    loadShip("container");

    // Set initial camera view
    controls.setLookAt(...currentShip.defaultLookat);

    window.controls = controls;

    // Setup overview button
    document.getElementById("overviewReturnButton").addEventListener("click", clearAnnotationSelection);

    // Hide infobox until an annotation is clicked
    document.getElementById("infobox").style.display = "none";

    // Handle resizing

    window.addEventListener("resize", onWindowResize);

    document.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("click", event=>{
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
    annotationLabel.addEventListener("click", ()=>{
        selectAnnotation(highlightedAnnotation.annotation);
        annotationLabel.style.display = "none";
    })

    document.addEventListener("keydown", event => {
        switch (event.key) {
            case "c": animateCamera(); break;
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
            case "PageUp": advanceShip(-1); break;
            case "PageDown": advanceShip(1); break;
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

function animateCamera() {
    const cameraAnimation = createCameraAnimation(annotations, ships, 1);
    const mixer = new THREE.AnimationMixer(camera);
    const action = mixer.clipAction(cameraAnimation);
    action.play();
    mixers.push(mixer);
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
        const currentIdx = as.findIndex(v=>v===selectedAnnotation);
        selectedAnnotation = as[mod(currentIdx+step, as.length)];
    }
    selectAnnotation(selectedAnnotation.annotation);
}

window.selectAnnotationByName = (annotationName) => {
    const sprite = annotationSprites.children.find(
        a=>a.annotation.spec.name === annotationName
    );
    selectAnnotation(sprite.annotation);
}

function selectAnnotation(a) {
    controls.setLookAt(
        ...a.spec.shipTypes[currentShip.name].cameraPos.toArray(),
        ...a.spec.shipTypes[currentShip.name].labelPos.toArray(),
        true
    );
    document.getElementById("textbox").innerHTML = `<h2>${a.spec.name}</h2>` + `<div id="body-text">${a.content}</div>`;
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
        gltfLoader.load(a.spec.model, function(gltf) {
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
        // Keep camera pivot slightly to the left
        // of the screen center.
        const p = a.spec.shipTypes[currentShip.name];
        const dist = p.cameraPos.distanceTo(
            p.labelPos
        );
        controls.setFocalOffset(
            //0.25 * controls.distance, 0, 0
            0.25 * dist, 0, 0
        );
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

/**
 * Animation loop
 * @param {number} timestamp Timestamp in milliseconds (not used here)
 * @param {number} delta Time delta in seconds since last frame
 */
function animate(timestamp, delta=clock.getDelta()) {
    if (stats) {
        stats.update();
    }

    controls.update(delta);

    smoke.update(delta);

    if (modelGroup) {
        const t = timestamp / 1000;
        modelGroup.position.y = Math.sin(t) * 0.01;
        const e = new THREE.Euler(
            Math.sin(t)* .001,
            0,
            Math.cos(t)* .001
        );
        modelGroup.quaternion.setFromEuler(e);

        for (const mixer of mixers) {
            mixer.update(delta);
        }

        //Render scene
        if (water.visible) {
            postProcessing.render();
        } else {
            renderer.render(scene, camera);
        }
    }
}