import * as THREE from "three";
import {color, pass, objectPosition, screenUV} from "three/tsl";
import {gaussianBlur} from "three/addons/tsl/display/GaussianBlurNode.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {WaterMesh} from "three/addons/objects/WaterMesh.js";
import {SkyMesh} from "three/addons/objects/SkyMesh.js";
import Stats from "three/addons/libs/stats.module.js";
import {MapView} from "./map.js";
import {PlotView} from "./plot.js";
import {annotations} from "./annotation.js";
import CameraControls from "../lib/camera-controls.module.min.js";
CameraControls.install({THREE: THREE});

let camera, scene, renderer, mixer;
let model;
let controls;
let stats;
let water, sun;
let mapView, plotView;
let postProcessing;

const threeContainer = document.getElementById("threeContainer");

const clock = new THREE.Clock();

init();

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
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.25, 5000);

    scene = new THREE.Scene();

    sun = new THREE.Vector3();

    const waterGeometry =  new THREE.CircleGeometry( 5000, 3 );
    const textureLoader = new THREE.TextureLoader();
    const waterNormals = textureLoader.load("resources/waternormals.jpg");
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

    water = new WaterMesh(
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
    water.rotation.x = - Math.PI / 2;
    water.position.y = waterLevel;
    scene.add(water);

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
    scene.add(waterUnderside);

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
        water.sunDirection.value.copy(sun).normalize();

        if (renderTarget !== undefined) renderTarget.dispose();

        sceneEnv.add(sky);
        renderTarget = pmremGenerator.fromScene(sceneEnv);
        scene.add(sky);

        scene.environment = renderTarget.texture;
    }
    renderer.init().then(updateSun);


    // model

    const gltfLoader = new GLTFLoader();
    gltfLoader.load("resources/cargoship.glb", function(gltf) {

        model = gltf.scene;
        model.name = "container";

        model.traverse(child => {
            if(child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(gltf.scene);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
        }

        scene.add(model);
    });

    // post processing

    const scenePass = pass( scene, camera );
    const scenePassColor = scenePass.getTextureNode();
    const scenePassDepth = scenePass.getLinearDepthNode().remapClamp(.3, .5);

    const waterMask = objectPosition(camera).y.greaterThan(screenUV.y.mul(camera.near).add(waterLevel));

    const scenePassColorBlurred = gaussianBlur( scenePassColor );
    scenePassColorBlurred.directionNode = waterMask.select( scenePassDepth, scenePass.getLinearDepthNode().mul(5));

    const vignette = screenUV.distance( .5 ).mul( 1.35 ).oneMinus();

    postProcessing = new THREE.PostProcessing(renderer);
    postProcessing.outputNode = waterMask.select( scenePassColorBlurred, scenePassColorBlurred.mul(color(0x7E95A5)).mul(vignette));

    // FPS stats shown in upper-left corner
    // Only relevant for debugging, can remove later
    stats = new Stats();
    document.body.appendChild(stats.dom);

    // Camera controls
    controls = new CameraControls(camera, renderer.domElement);

    const defaultLookat = [
        75, 50, 150, // Position
        -20, 5, 20   // Target
    ];

    // Set initial camera view
    controls.setLookAt(...defaultLookat);

    window.controls = controls;

    // Setup overview button
    document.getElementById("overviewReturnButton").addEventListener("click", ()=>{
        controls.setLookAt(...defaultLookat, true);
        document.getElementById("infobox").style.display = "none";
    });

    // Hide infobox until an annotation is clicked
    document.getElementById("infobox").style.display = "none";

    // Setup annotations
    for (const annotation of annotations) {
        annotation.DOM.addEventListener("click", () => {
            onWindowResize();
            if (!mapView.fullyLoaded) {
                // Don't do anyting until map data is loaded
                return;
            }
            controls.setLookAt(
                ...annotation.spec.shipTypes[model.name].cameraPos.toArray(),
                ...annotation.spec.shipTypes[model.name].labelPos.toArray(),
                true
            );
            document.getElementById("textbox").innerHTML = `<h2>${annotation.spec.name}</h2>` + `<div id="body-text">${annotation.content}</div>`;
            document.getElementById("infobox").style.display = "flex";
            annotation.onSelect();

            plotView.plot(annotation);
        });
    }


    // Handle resizing

    window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
    camera.aspect = threeContainer.offsetWidth / threeContainer.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight);
}

function animate() {
    stats.update();

    const delta = clock.getDelta();
    const controlsUpdated = controls.update(delta);

    if (controlsUpdated) {
        const style = document.getElementById("threeContainer").style;
        const smallScreen = window.matchMedia("(max-width: 768px)").matches;
        const infoboxVisible = document.getElementById("infobox").style.display !== "none";
        onWindowResize();
        style.height = "100%";
        style.position = "absolute";
        controls.setFocalOffset(0, 0, 0);
        if (infoboxVisible) {
            if (smallScreen) {
                style.height = "60vh";
                style.position = "static";
            } else {
                // Keep camera pivot slightly to the left
                // of the screen center.
                controls.setFocalOffset(
                    0.25 * controls.distance, 0, 0
                );
            }
        }
    }

    if (model) {
        const t = clock.getElapsedTime();
        model.position.y = Math.sin(t) * 0.05;
        const e = new THREE.Euler(
            Math.sin(t)* .015,
            0,
            Math.cos(t)* .01
        );
        model.quaternion.setFromEuler(e);

        for (const annotation of annotations) {
            annotation.update(renderer.domElement, camera, model);
        }

        if (mixer) {
            mixer.update(clock.getDelta());
        }

        postProcessing.render();
    }

}