import * as THREE from 'three';
import {
    vec2, texture, time, mix, mul, oneMinus, smoothstep, Fn, uv, vec3, vec4
} from 'three/tsl';

const textureLoader = new THREE.TextureLoader();

class CustomCurve extends THREE.Curve {
    constructor() {
        super();
    }

    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const tx = 0;
        const ty = 1 - Math.pow(1-t, 2)
        const tz = 2*t;

        return optionalTarget.set(tx, ty, tz);
    }
}

// Declare here and reuse
const path = new CustomCurve();
const geometry = new THREE.TubeGeometry(path, 20, 0.15, 20, false);

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

        flowMaterial.colorNode = Fn(() => {
            // alpha
            const alphaNoiseUv = uv().mul(vec2(0.5, 0.3)).add(vec2(time.mul(0.5), 0));
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