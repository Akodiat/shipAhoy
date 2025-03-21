import {Vector3, Raycaster} from "three";

class Annotation {
    /**
     *
     * @param {Vector3} labelPosition
     * @param {number | string} id
     * @param {string} heading
     * @param {string} content
     * @param {string} dataKey
     */
    constructor(labelPosition, cameraPosition, id, heading, content, dataKey) {
        this.heading = heading;
        this.content = content;
        this.labelPosition = labelPosition;
        this.cameraPosition = cameraPosition;
        this.dataKey = dataKey;
        this.DOM = document.createElement("div");
        this.DOM.classList.add("annotation");
        this.DOM.innerHTML = `<p><strong>${heading}</strong></p>`;
        document.getElementById("main").appendChild(this.DOM);

        this.DOM.style.setProperty("--content", `"${id}"`);

        this.onSelect = ()=>{};
    }
    update(canvas, camera, shipModel) {
        const p = this.labelPosition.clone().project(camera);

        p.x = Math.round((0.5 + p.x / 2) * (canvas.width / window.devicePixelRatio));
        p.y = Math.round((0.5 - p.y / 2) * (canvas.height / window.devicePixelRatio));

        this.DOM.style.top = `${p.y}px`;
        this.DOM.style.left = `${p.x}px`;

        //this.annotationNumber.style.top = `${p.y}px`;
        //this.annotationNumber.style.left = `${p.x}px`;

        const raycaster = new Raycaster(
            camera.position,
            this.labelPosition.clone().sub(camera.position).normalize()
        );

        const closestIntersect = raycaster.intersectObject(shipModel);

        if (closestIntersect.length > 0) {
            const boxDist = closestIntersect[0].point.distanceTo(camera.position);
            const labelDist =  this.labelPosition.distanceTo(camera.position);
            const spriteBehindObject = labelDist - boxDist > 1;

            this.DOM.style.opacity = spriteBehindObject ? 0.125 : 1;
        } else {
            this.DOM.style.bacground = "red";
        }
    }

    flyTo(camera, controls, steps = 50) {
        this.DOM.style.display = "none";
        const targetPos = this.labelPosition.clone();
        const endPos = this.cameraPosition.clone();

        camera.position.lerp(endPos, 1 / steps);
        controls.target.lerp(targetPos, 1 / steps);
        camera.lookAt(targetPos);

        if (steps > 1) {
            requestAnimationFrame(() => {
                this.flyTo(camera, controls, steps - 1);
            });
        } else {
            this.DOM.style.display = "block";
        }
    }
}

const annotations = [
    new Annotation(
        new Vector3(0, -0.2, -5),
        new Vector3(1, -0.5, -6),
        1,
        "Stern tube oil",
        "The propeller shaft connects the main engine and the propeller through the stern tube which goes through the ship hull. The stern tube contains bearings, sealing and a lubrication system. Although there are water-lubricated propeller shafts on the market, the most commonly used (∼ 90 % of the market, Sengottuvel et al., 2017) lubrication is still oil-based and usually contains a large number of additives (Habereder et al., 2009) and seal-improving agents like teflon and bentonite.",
        "STERN_TUBE"
    ),
    new Annotation(
        new Vector3(0.6, 3, -3.5),
        new Vector3(4, 3, -3.5),
        2,
        "Exhausts",
        "Lorem ipsum",
        undefined
    ),
    new Annotation(
        new Vector3(0.6, 0.1, 3),
        new Vector3(4, 1, 3),
        2,
        "Antifouling paint",
        "Submerged structures offer substrate for various organisms that attach and grow on the surfaces, thereby increasing the roughness of the hull surface. Such increased roughness in turn increases drag and significantly affects the fuel consumption and may also affect the manoeuvring capability of a ship. To reduce this fuel penalty, secure manoeuvring capability and prevent spreading of NISs, the hull is coated with antifouling coatings that contain and release toxic compounds (biocides)",
        "AFP_CuO"
    )
];

export {annotations, Annotation};