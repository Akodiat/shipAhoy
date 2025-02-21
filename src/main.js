import * as THREE from "three";
import {
    color, pass, normalWorld, objectPosition, screenUV
} from "three/tsl";
import {gaussianBlur} from "three/addons/tsl/display/GaussianBlurNode.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import {CSS2DRenderer, CSS2DObject} from "three/addons/renderers/CSS2DRenderer.js";
import {OutputFlow} from "./outputFlow.js";
import {WaterMesh} from "./water.js";

import {Resizable} from "../lib/resizable.js";
import {SmokeMesh} from "./smoke.js";
import {MapView} from "./map.js";

let camera, scene, renderer, labelRenderer;
let model;
let postProcessing;
let controls;
let stats;

const threeContainer = document.getElementById("threeContainer");

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("main").style.width = window.innerWidth + "px";
    document.getElementById("main").style.height = window.innerHeight + "px";
    Resizable.initialise("main", {"threeContainer": 0.75});
    init();
});


function init() {

    // Setup map
    new MapView("map");

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.25, 30);
    camera.position.set(3, 2, 4);

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x88A7BD, 7, 25);
    scene.backgroundNode = normalWorld.y.mix(color(0x83ACC9), color(0xD4DFEE));
    camera.lookAt(0, 1, 0);

    const sunLight = new THREE.DirectionalLight(0xFFE499, 5);
    sunLight.castShadow = true;
    sunLight.shadow.camera.near = .1;
    sunLight.shadow.camera.far = 5;
    sunLight.shadow.camera.right = 2;
    sunLight.shadow.camera.left = -2;
    sunLight.shadow.camera.top = 1;
    sunLight.shadow.camera.bottom = -2;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.001;
    sunLight.position.set(.5, 3, .5);

    const waterAmbientLight = new THREE.HemisphereLight(0x515172, 0x8BB9CE, 5);
    const skyAmbientLight = new THREE.HemisphereLight(0x94C7DF, 0, 1);

    scene.add(sunLight);
    scene.add(skyAmbientLight);
    scene.add(waterAmbientLight);

    // model

    const loader = new GLTFLoader();
    loader.load("resources/cargoship.glb", function(gltf) {

        model = gltf.scene;
        model.traverse(child => {
            if(child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        model.scale.multiplyScalar(0.5);

        scene.add(model);

        var bbox = new THREE.Box3().setFromObject(model);

        // Output flows

        const flows = ["Ballast water", "Sewage", "Grey water", "Tank cleaning", "Cooling water", "Scrubber water", "Bilge water"];
        const step = (Math.abs(bbox.max.z - bbox.min.z) / flows.length);
        for (let i=0; i<flows.length; i++) {
            const e = new OutputFlow();
            e.position.x = 4 + bbox.min.x;
            e.position.z = step/2 + bbox.min.z + i * step;
            e.lookAt(new THREE.Vector3(-1, 0, 0).add(e.position));
            scene.add(e);

            const flowDiv = document.createElement("div");
            flowDiv.className = "label";
            flowDiv.textContent = flows[i];
            flowDiv.style.backgroundColor = "transparent";
            flowDiv.style.textAlign = "center";

            const flowLabel = new CSS2DObject(flowDiv);
            e.add(flowLabel);
        }

    });

    // water
    const water = new WaterMesh(new THREE.BoxGeometry(50, .001, 50));
    water.position.set(0, 0, 0);
    scene.add(water);

    // smoke
    const smoke = new SmokeMesh();
    smoke.position.y = 1.83;
    smoke.position.z = 1;
    scene.add(smoke);

    // renderer

    renderer = new THREE.WebGPURenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(
        threeContainer.offsetWidth,
        threeContainer.offsetHeight
    );
    renderer.setAnimationLoop(animate);

    threeContainer.appendChild(renderer.domElement);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(
        threeContainer.offsetWidth,
        threeContainer.offsetHeight
    );
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    document.body.appendChild(labelRenderer.domElement);

    stats = new Stats();
    document.body.appendChild(stats.dom);

    controls = new OrbitControls(camera, labelRenderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI * 0.9;
    //controls.autoRotate = true;
    //controls.autoRotateSpeed = 1;
    controls.target.set(0, .2, 0);
    controls.update();

    // post processing

    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode();
    const scenePassDepth = scenePass.getLinearDepthNode().remapClamp(.3, .5);

    const waterMask = objectPosition(camera).y.greaterThan(screenUV.y.sub(.5).mul(camera.near));

    const scenePassColorBlurred = gaussianBlur(scenePassColor);
    scenePassColorBlurred.directionNode = waterMask.select(scenePassDepth, scenePass.getLinearDepthNode().mul(5));

    const vignette = screenUV.distance(.5).mul(1.35).clamp().oneMinus();

    postProcessing = new THREE.PostProcessing(renderer);
    postProcessing.outputNode = waterMask.select(scenePassColorBlurred, scenePassColorBlurred.mul(color(0x8FB3C4)).mul(vignette));

    //

    window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
    Resizable.activeContentWindows[0].changeSize(
        window.innerWidth,
        window.innerHeight
    );
    Resizable.activeContentWindows[0].childrenResize();

    camera.aspect = threeContainer.offsetWidth / threeContainer.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight);
    labelRenderer.setSize(threeContainer.offsetWidth, threeContainer.offsetHeight);
}

Resizable.resizingEnded = function() {
    // Just sending a resize event works makes sure things work for Leaflet as well.
    window.dispatchEvent(new Event("resize"));
};

function animate() {
    stats.update();
    controls.update();

    if (model) {
        const t = performance.now() / 1000;
        model.position.y = Math.sin(t) * 0.05;
        const e = new THREE.Euler(
            Math.sin(t)* .015,
            0,
            Math.cos(t)* .01
        );
        model.quaternion.setFromEuler(e);
    }
    postProcessing.render();
    labelRenderer.render(scene, camera);
}