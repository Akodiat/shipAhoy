import * as THREE from "three";
import {
    color, pass, normalWorld, objectPosition, screenUV
} from "three/tsl";
import {gaussianBlur} from "three/addons/tsl/display/GaussianBlurNode.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import Stats from "three/addons/libs/stats.module.js";
import {WaterMesh} from "./water.js";
import {MapView} from "./map.js";
import {annotations} from "./annotation.js";
import CameraControls from "../lib/camera-controls.module.min.js";
CameraControls.install({THREE: THREE});

let camera, scene, renderer;
let model;
let postProcessing;
let controls;
let stats;

const threeContainer = document.getElementById("threeContainer");

const clock = new THREE.Clock();

init();

function init() {

    // Setup map
    new MapView("map");


    // Setup scene
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
    sunLight.shadow.camera.right = 4;
    sunLight.shadow.camera.left = -4;
    sunLight.shadow.camera.top = 4;
    sunLight.shadow.camera.bottom = -4;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.001;
    sunLight.shadow.radius = 4;
    sunLight.position.set(.5, 3, .5);

    // Uncomment to debug shadows
    //const cameraHelper = new THREE.CameraHelper(sunLight.shadow.camera);
    //scene.add(cameraHelper);

    const waterAmbientLight = new THREE.HemisphereLight(0x515172, 0x8BB9CE, 5);
    const skyAmbientLight = new THREE.HemisphereLight(0x94C7DF, 0, 1);

    scene.add(sunLight);
    scene.add(skyAmbientLight);
    scene.add(waterAmbientLight);

    // model

    const loader = new GLTFLoader();
    loader.load("resources/cargoship.glb", function(gltf) {

        model = gltf.scene;
        /*
        model.traverse(child => {
            if(child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                }
                });
        */
        model.scale.multiplyScalar(4);

        scene.add(model);
    });


    // water
    const water = new WaterMesh(new THREE.BoxGeometry(50, .001, 50));
    water.position.set(0, 0, 0);
    scene.add(water);


    // smoke
    //const smoke = new SmokeMesh();
    //smoke.position.y = 1.83;
    //smoke.position.z = 1;
    //scene.add(smoke);

    // renderer

    renderer = new THREE.WebGPURenderer();
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(
        threeContainer.offsetWidth,
        threeContainer.offsetHeight
    );
    renderer.setAnimationLoop(animate);
    threeContainer.appendChild(renderer.domElement);

    // FPS stats shown in upper-left corner
    // Only relevant for debugging, can remove later
    stats = new Stats();
    document.body.appendChild(stats.dom);

    // Camera controls
    controls = new CameraControls(camera, renderer.domElement);

    // Set initial camera view
    controls.setLookAt(-5,3.5,-10, 1, 0, -3);

    for (const annotation of annotations) {
        annotation.DOM.addEventListener("click", () => {
            //annotation.flyTo(camera, controls);
            controls.setLookAt(
                ...annotation.cameraPosition.toArray(),
                ...annotation.labelPosition.toArray(),
                true);
        });
    }

    // Post processing (underwater effect)

    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode();
    const scenePassDepth = scenePass.getLinearDepthNode().remapClamp(.3, .5);

    const waterMask = objectPosition(camera).y.greaterThan(screenUV.y.sub(.5).mul(camera.near));

    const scenePassColorBlurred = gaussianBlur(scenePassColor);
    scenePassColorBlurred.directionNode = waterMask.select(scenePassDepth, scenePass.getLinearDepthNode().mul(5));

    const vignette = screenUV.distance(.5).mul(1.35).clamp().oneMinus();

    postProcessing = new THREE.PostProcessing(renderer);
    postProcessing.outputNode = waterMask.select(scenePassColorBlurred, scenePassColorBlurred.mul(color(0x8FB3C4)).mul(vignette));

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
        // Keep camera pivot slightly to the left
        // of the screen center.
        controls.setFocalOffset(
            0.25 * controls.distance, 0, 0
        );
    }

    if (model) {
        const t = clock.getElapsedTime();
        model.position.y = - 0.3 + Math.sin(t) * 0.05;
        const e = new THREE.Euler(
            Math.sin(t)* .015,
            0,
            Math.cos(t)* .01
        );
        model.quaternion.setFromEuler(e);

        for (const annotation of annotations) {
            annotation.update(renderer.domElement, camera, model);
        }

        postProcessing.render();
    }

}