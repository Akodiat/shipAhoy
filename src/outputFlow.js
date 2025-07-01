import * as THREE from 'three';
import {
    vec2, texture, time, mix, mul, oneMinus, smoothstep, Fn, uv, vec3, vec4, positionLocal
} from 'three/tsl';

const textureLoader = new THREE.TextureLoader();

class CustomCurve extends THREE.Curve {
    constructor() {
        super();
    }

    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const tx = 0.2 + 2.5*t;
        const ty = -10 * t*t;
        const tz = 0;

        return optionalTarget.set(tx, ty, tz);
    }
}

// Declare here and reuse
const path = new CustomCurve();
const geometry = new THREE.TubeGeometry(path, 32, 0.15, 8, false);

class OutputFlow extends THREE.Mesh {
    constructor() {
        const noiseTexture = textureLoader.load('resources/perlin_noise_128x128.png');
        noiseTexture.wrapS = THREE.RepeatWrapping;
        noiseTexture.wrapT = THREE.RepeatWrapping;

        const flowMaterial = new THREE.MeshBasicNodeMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: true
        });

        flowMaterial.positionNode = Fn(() => {
            const alphaNoiseUv = uv().mul(1).add(vec2(time.mul(-0.5), 0));
            const alpha = texture(noiseTexture, alphaNoiseUv).r.smoothstep(0.1, 1);
            positionLocal.addAssign(alpha.mul(0.1));

            return positionLocal;
        })();

        flowMaterial.colorNode = Fn(() => {
            // alpha
            const alphaNoiseUv = uv().mul(vec2(0.5, 0.3)).add(vec2(time.mul(-0.5), 0));
            const alpha = mul(
                // pattern
                texture(noiseTexture, alphaNoiseUv).r.smoothstep(0.1, 1),

                // edges fade
                smoothstep(0, 0.1, uv().x),
                smoothstep(0, 0.1, oneMinus(uv().x)),
            );

            // color
            const finalColor = mix(vec3(0.3, 0.15, 0.1), vec3(1, 1, 1), alpha.pow(3));

            return vec4(finalColor, alpha);
        })();
        super(geometry, flowMaterial);
    }
}

export {OutputFlow}