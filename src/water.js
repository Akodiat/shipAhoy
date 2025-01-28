import * as THREE from 'three';
import {
    color,
    vec2,
    linearDepth,
    screenUV,
    viewportLinearDepth,
    viewportDepthTexture,
    viewportSharedTexture,
    mx_worley_noise_float,
    positionWorld,
    time
} from 'three/tsl';

class WaterMesh extends THREE.Mesh {

    constructor(geometry) {
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

        super(geometry, waterMaterial);
    }

}

export {WaterMesh}