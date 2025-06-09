import * as THREE from "three";


class ParticleSystem extends THREE.Group {
    constructor(count, size, origin=new THREE.Vector3(), direction=new THREE.Vector3(0,1,0), textureLoader = new THREE.TextureLoader()) {
        super();

        this.count = count;
        this.origin = origin;
        this.direction = direction;
        this.height = 100;
        this.minSize = size;
        this.maxSize = size*4;

        const sprite = textureLoader.load(
            "resources/smoke.png",
            texture => texture.colorSpace = THREE.SRGBColorSpace
        );

        const material = new THREE.SpriteMaterial({
            map: sprite,
            color: 0xFFFFFF,
            //blending: THREE.AdditiveBlending,
            transparent: true,
            alphaTest: 0.01
        });


        for (let i = 0; i < count; i++) {
            const particle = new THREE.Sprite(material);
            particle.progress = i / count;
            particle.position.copy(origin).add(direction.clone().multiplyScalar(this.height * particle.progress));
            particle.scale.setScalar(this.minSize + (this.maxSize-this.minSize)*Math.sqrt(particle.progress));
            this.add(particle);
        }
    }

    update(dt) {
        for (let i=0; i < this.count; i++) {
            const particle = this.children[i];
            particle.progress = (particle.progress + dt * 0.02) % 1;
            particle.position.copy(this.origin).add(this.direction.clone().multiplyScalar(this.height * particle.progress));
            particle.scale.setScalar(this.minSize + (this.maxSize-this.minSize)*Math.sqrt(particle.progress));
        }
    }
}

export {ParticleSystem}