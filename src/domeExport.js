import * as THREE from "three";
import {FisheyeCamera, saveImageSequence} from "./domare.js";

function exportDomeVideo(
    resolution, duration, framerate, eyeSep, tilt,
    renderer, scene, annotations, ships, mixers, preview, animate
) {
    const canvas = renderer.domElement;
    const camera = new FisheyeCamera(
        resolution,
        tilt
    );

    const cameraAnimation = createCameraAnimation(annotations, ships);
    const mixer = new THREE.AnimationMixer(camera);
    const action = mixer.clipAction(cameraAnimation);
    action.play();
    mixers.push(mixer);

    canvas.width = resolution;
    canvas.height = resolution;

    renderer.setSize(resolution, resolution);

    camera.setResolution(resolution);
    if (controls) {
        controls.object = camera;
    }

    camera.update(renderer, scene);
    saveImageSequence(
        renderer, camera, scene, animate,
        duration, framerate, eyeSep, preview
    );
}

const keyFrames = [
    {duration:  2, shipType: "container"},
    {duration: 10, shipType: "container", annotation: "Propulsion momentum"},
    {duration: 10, shipType: "container", annotation: "Anchorage"},
    {duration: 10, shipType: "container", annotation: "Ballast water"},
    {duration: 0.1, shipType: "container", transitionDuration: 5},
    {duration: 10, shipType: "container", annotation: "Propeller shaft lubricants", transitionDuration: 10},
    {duration: 5, shipType: "container", annotation: "Underwater radiated noise", transitionDuration: 2},
];

function createCameraAnimation(annotations, ships, zoom=3, defaultTransitionDuration = 2) {
    const timeValues = [];
    const positionValues = [];
    const orientationValues = [];

    const up = new THREE.Vector3(0,1,0);

    const upALittle = new THREE.Vector3(0, 0.1, 0);

    let timeStamp = 0;
    for (const k of keyFrames) {
        let position, target;
        if (k.annotation !== undefined) {
            // Use annotation if available
            const data = annotations.find(
                a => a.spec.name === k.annotation
            ).spec.shipTypes[k.shipType];
            position = data.cameraPos.clone();
            target = data.labelPos.clone();
        } else {
            // Otherwise use overview position
            const l = ships.find(s=>s.name === k.shipType).defaultLookat;
            position = new THREE.Vector3(l[0], l[1], l[2]);
            target   = new THREE.Vector3(l[3], l[4], l[5]);
        }

        position.y = target.y;

        const direction = position.clone().sub(target).normalize();
        const distance = position.distanceTo(target);
        //position.copy(target).add(direction).clone().multiplyScalar(0.01)
        //const newDistance = position.distanceTo(target);
        //console.assert(distance - newDistance * zoom < 0.1, `${distance} !== ${newDistance}`);

        // Calculate target quaterion (look at target)
        const quaternion = new THREE.Quaternion().setFromRotationMatrix(
            new THREE.Matrix4().lookAt(position, target, up)
        );

        // For some reason the animation cannot have two subsequent
        // identical values...
        const position2 = position.clone().add(
            direction.clone().multiplyScalar(2).add(upALittle)
        )
        const quaternion2 = new THREE.Quaternion().setFromRotationMatrix(
            new THREE.Matrix4().lookAt(position2, target, up)
        );

        // Add two key frames, one at the start of duration
        // (after transition duration), one at the end
        timeStamp += (k.transitionDuration !== undefined ?
            k.transitionDuration : defaultTransitionDuration
        );
        timeValues.push(timeStamp);
        position.toArray(positionValues, positionValues.length);
        quaternion.toArray(orientationValues, orientationValues.length);

        timeStamp += k.duration;
        timeValues.push(timeStamp);
        position2.toArray(positionValues, positionValues.length);
        quaternion2.toArray(orientationValues, orientationValues.length);
    }

    const positionTrack = new THREE.VectorKeyframeTrack(
        '.position',
        timeValues,
        positionValues
    );
    const orientationTrack = new THREE.QuaternionKeyframeTrack(
        '.quaternion',
        timeValues,
        orientationValues
    );

    console.log(`Total camera animation time is ${timeStamp}s`)

    return new THREE.AnimationClip(
        'cameraAnimation', -1,
        [
            positionTrack,
            orientationTrack
        ]
    );
}


export {exportDomeVideo, createCameraAnimation};