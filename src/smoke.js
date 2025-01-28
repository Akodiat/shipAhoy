import * as THREE from "three";
import {
    vec2, vec3, vec4, time, texture, mix, mul, oneMinus, positionLocal,
    smoothstep, rotateUV, Fn, uv
} from "three/tsl";

const textureLoader = new THREE.TextureLoader();

class SmokeMesh extends THREE.Mesh {
    constructor() {
        const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
        smokeGeometry.translate(0, 0.5, 0);
        smokeGeometry.scale(1.5, 6, 1.5);

        const noiseTexture = textureLoader.load("resources/perlin_noise_128x128.png");
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
                texture(noiseTexture, vec2(0.25, time.mul(0.01)).mod(1)).r,
                texture(noiseTexture, vec2(0.75, time.mul(0.01)).mod(1)).r,
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

        super(smokeGeometry, smokeMaterial);
    }
}

export {SmokeMesh};