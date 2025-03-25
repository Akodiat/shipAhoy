import {Lut} from "./Lut.js";
/*global FileReaderSync */

addEventListener("message", e => {
    const data = e.data.data;
    const max = e.data.max;
    const propertyNames = e.data.propertyNames;
    const luts = new Map();
    const scale = e.data.scaleFactor;

    const canvas = e.data.canvas;

    // Setup lookup tables (LUT)
    for(const prop of propertyNames.values()) {
        const lut = new Lut("OrRd", 32);
        lut.minV = 0;
        lut.maxV = Math.log(max[prop]);
        luts.set(prop, lut);
    }
    const ctx = canvas.getContext("2d");

    const dataURLs = {};
    // Draw heatmaps for each property
    for (const prop of propertyNames.values()) {
        // Clear canvas between properties
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const val of data) {
            if (val[prop] !== null) {
                // Get colour from lookuptable
                const color = luts.get(prop).getColor(Math.log(val[prop]));
                ctx.fillStyle = `rgba(${color.r*255}, ${color.g*255}, ${color.b*255}, 0.8)`;

                // Draw rectangle on canvas
                ctx.fillRect(
                    val.localXY.x * scale,
                    val.localXY.y * scale,
                    val.distXY.x * scale,
                    val.distXY.y * scale
                );
            }
        }
        canvas.convertToBlob().then(blob=>{
            dataURLs[prop] = new FileReaderSync().readAsDataURL(blob);

            // Check if all properties are finished
            let finished = true;
            for (const prop of propertyNames.values()) {
                if (dataURLs[prop] === undefined) {
                    finished = false;
                }
            }
            if (finished) {
                postMessage(dataURLs);
            }
        });
    }
});