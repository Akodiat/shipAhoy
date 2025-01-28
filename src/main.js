import * as THREE from 'three';
import {
    color,
    vec2,
    pass,
    linearDepth,
    normalWorld,
    triplanarTexture,
    texture,
    objectPosition,
    screenUV,
    viewportLinearDepth,
    viewportDepthTexture,
    viewportSharedTexture,
    mx_worley_noise_float,
    positionWorld,
    time,
    mix, mul, oneMinus, positionLocal, smoothstep, rotateUV, Fn, uv, vec3, vec4
} from 'three/tsl';
import {gaussianBlur} from 'three/addons/tsl/display/GaussianBlurNode.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';

//import {Resizable} from '../lib/resizable.js';

let camera, scene, renderer;
let mixer, clock;
let model, params;
let postProcessing;
let controls;
let stats;

const textureLoader = new THREE.TextureLoader();


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("main").style.width = window.innerWidth + "px";
    document.getElementById("main").style.height = window.innerHeight + "px";

    Resizable.initialise("main", {"threeContainer": 0.75});

});

class CustomSinCurve extends THREE.Curve {
    constructor(scale) {
        super();
    }

    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const tx = 0;
        const ty = 1 - Math.pow(1-t, 2)//Math.sin(2 * Math.PI * t);
        const tz = 2*t;

        return optionalTarget.set(tx, ty, tz);
    }
}

class OutputFlow extends THREE.Mesh {
    constructor() {
        const path = new CustomSinCurve();
        const geometry = new THREE.TubeGeometry(path, 20, 0.15, 20, false);

        const noiseTexture = textureLoader.load('resources/perlin_noise_128x128.png');
        noiseTexture.wrapS = THREE.RepeatWrapping;
        noiseTexture.wrapT = THREE.RepeatWrapping;

        const flowMaterial = new THREE.MeshBasicNodeMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: true
        });

        flowMaterial.colorNode = Fn(() => {
            // alpha
            const alphaNoiseUv = uv().mul(vec2(0.5, 0.3)).add(vec2(time.mul(0.5), 0));
            const alpha = mul(

                // pattern
                texture(noiseTexture, alphaNoiseUv).r.smoothstep(0.1, 1),

                // edges fade
                smoothstep(0, 0.1, uv().x),
                smoothstep(0, 0.1, oneMinus(uv().x)),
                //smoothstep(0, 0.1, uv().y),
                //smoothstep(0, 0.1, oneMinus(uv().y))

            );

            // color
            const finalColor = mix(vec3(0.3, 0.15, 0.1), vec3(1, 1, 1), alpha.pow(3));

            return vec4(finalColor, alpha);
        })();
        super(geometry, flowMaterial);
    }
}

init();

function init() {

    var map = L.map('map').setView([57.5, 11.16], 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
    }).addTo(map);

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

    const waterAmbientLight = new THREE.HemisphereLight(0x515172, 0x74ccf4, 5);
    const skyAmbientLight = new THREE.HemisphereLight(0x94C7DF, 0, 1);

    scene.add(sunLight);
    scene.add(skyAmbientLight);
    scene.add(waterAmbientLight);

    clock = new THREE.Clock();

    // gui

    const gui = new GUI();

    params = {
        stormLevel: 1
    }

    //gui.add(params, 'stormLevel', 0, 10, .001).name('Storm level');

    // animated model

    const loader = new GLTFLoader();
    loader.load('resources/cargoship.glb', function(gltf) {

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

        const nFlows = 10
        const step = (Math.abs(bbox.max.z - bbox.min.z) / nFlows);
        for (let i=0; i<nFlows; i++) {
            const e = new OutputFlow();
            e.position.x = 4 + bbox.min.x; //Math.cos(2*Math.PI*i/nFlows) * 8;
            e.position.z = step/2 + bbox.min.z + i * step; // Math.sin(2*Math.PI*i/nFlows) * 3;
            //bbox.clampPoint(e.position, e.position);
            e.lookAt(new THREE.Vector3(-1, 0, 0).add(e.position));
            scene.add(e);
        }
    });

    const iceDiffuse = textureLoader.load('resources/water.jpg');
    iceDiffuse.wrapS = THREE.RepeatWrapping;
    iceDiffuse.wrapT = THREE.RepeatWrapping;
    iceDiffuse.colorSpace = THREE.NoColorSpace;

    const iceColorNode = triplanarTexture(texture(iceDiffuse)).add(color(0x9FBEEC)).mul(.8);

    const material = new THREE.MeshStandardNodeMaterial({
        colorNode: iceColorNode
    });

    // water

    const timer = time.mul(.8);
    const floorUV = positionWorld.xzy;

    const waterLayer0 = mx_worley_noise_float(floorUV.mul(4).add(timer));
    const waterLayer1 = mx_worley_noise_float(floorUV.mul(2).add(timer));

    const waterIntensity = waterLayer0.mul(waterLayer1);
    const waterColor = waterIntensity.mul(1.4).mix(color(0x5b7e96), color(0xB0DEF3));

    // linearDepth() returns the linear depth of the mesh
    const depth = linearDepth();
    const depthWater = viewportLinearDepth.sub(depth);
    const depthEffect = depthWater.remapClamp(-.002, .04);

    const refractionUV = screenUV.add(vec2(0, waterIntensity.mul(.1)));

    // linearDepth( viewportDepthTexture( uv ) ) return the linear depth of the scene
    const depthTestForRefraction = linearDepth(viewportDepthTexture(refractionUV)).sub(depth);

    const depthRefraction = depthTestForRefraction.remapClamp(0, .1);

    const finalUV = depthTestForRefraction.lessThan(0).select(screenUV, refractionUV);

    const viewportTexture = viewportSharedTexture(finalUV);

    const waterMaterial = new THREE.MeshBasicNodeMaterial();
    waterMaterial.colorNode = waterColor;
    waterMaterial.backdropNode = depthEffect.mix(viewportSharedTexture(), viewportTexture.mul(depthRefraction.mix(1, waterColor)));
    waterMaterial.backdropAlphaNode = depthRefraction.oneMinus();
    waterMaterial.transparent = true;

    const water = new THREE.Mesh(new THREE.BoxGeometry(50, .001, 50), waterMaterial);
    water.position.set(0, 0, 0);
    scene.add(water);

    // caustics

    const waterPosY = positionWorld.y.sub(water.position.y);

    let transition = waterPosY.add(.1).saturate().oneMinus();
    transition = waterPosY.lessThan(0).select(transition, normalWorld.y.mix(transition, 0)).toVar();

    const colorNode = transition.mix(material.colorNode, material.colorNode.add(waterLayer0));

    // Smoke

    const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
    smokeGeometry.translate(0, 0.5, 0);
    smokeGeometry.scale(1.5, 6, 1.5);

    const noiseTexture = textureLoader.load('resources/perlin_noise_128x128.png');
    noiseTexture.wrapS = THREE.RepeatWrapping;
    noiseTexture.wrapT = THREE.RepeatWrapping;

    const smokeMaterial = new THREE.MeshBasicNodeMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    smokeMaterial.positionNode = Fn(() => {
        // twist
        const twistNoiseUv = vec2(0.5, uv().y.mul(0.2).sub(time.mul(0.005)).mod(1));
        const twist = texture(noiseTexture, twistNoiseUv).r.mul(10);
        positionLocal.xz.assign(rotateUV(positionLocal.xz, twist, vec2(0)));

        // wind
        const windOffset = vec2(
            texture(noiseTexture, vec2(0.25, time.mul(0.01)).mod(1)).r,//.sub(0.5),
            texture(noiseTexture, vec2(0.75, time.mul(0.01)).mod(1)).r//.sub(0.5),
        ).mul(uv().y.pow(2).mul(10));
        positionLocal.addAssign(windOffset);

        return positionLocal;

    })();

    smokeMaterial.colorNode = Fn(() => {
        // alpha
        const alphaNoiseUv = uv().mul(vec2(0.5, 0.3)).add(vec2(0, time.mul(0.1).negate()));
        const alpha = mul(

            // pattern
            texture(noiseTexture, alphaNoiseUv).r.smoothstep(0.4, 1),

            // edges fade
            smoothstep(0, 0.1, uv().x),
            smoothstep(0, 0.1, oneMinus(uv().x)),
            smoothstep(0, 0.1, uv().y),
            smoothstep(0, 0.1, oneMinus(uv().y))

        );

        // color
        const finalColor = mix(vec3(0.1, 0.1, 0.1), vec3(1, 1, 1), alpha.pow(3));

        return vec4(finalColor, alpha);
    })();

    const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
    smoke.position.y = 1.83;
    smoke.position.z = 1;
    scene.add(smoke);


    // renderer

    renderer = new THREE.WebGPURenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);


    const threeContainer = document.getElementById("threeContainer");
    threeContainer.appendChild(renderer.domElement);

    stats = new Stats();
    document.body.appendChild(stats.dom);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI * 0.9;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1;
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
    postProcessing.outputNode = waterMask.select(scenePassColorBlurred, scenePassColorBlurred.mul(color(0x74ccf4)).mul(vignette));

    //

    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {
    Resizable.activeContentWindows[0].changeSize(window.innerWidth, window.innerHeight);
    Resizable.activeContentWindows[0].childrenResize();

    const e = document.getElementById("threeContainer");

    camera.aspect = e.offsetWidth / e.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(e.offsetWidth, e.offsetHeight);
}

Resizable.resizingEnded = function() {
    const e = document.getElementById("threeContainer");
    camera.aspect = e.offsetWidth / e.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(e.offsetWidth, e.offsetHeight);
}

function animate() {

    stats.update();

    controls.update();

    const delta = clock.getDelta();


    if (model) {
        model.position.y = Math.sin(clock.elapsedTime) * .1 * params.stormLevel;

        const e = new THREE.Euler(
            Math.sin(clock.elapsedTime)* .015 * params.stormLevel,
            0,
            Math.cos(clock.elapsedTime)* .01 * params.stormLevel
        );
        model.quaternion.setFromEuler(e);
    }

    postProcessing.render();

}