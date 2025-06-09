import avsc from "../lib/avsc.5.7.7.esm.js";

addEventListener("message", e => {
    const path = e.data;
    const data = [];
    const min = {};
    const max = {};
    const propertyNames = new Set();

    // Load and return data
    fetch(new Request(path)).then(response => {
        return response.blob();
    }).then(response => {
        avsc.createBlobDecoder(response).on("data", val => {
            data.push(val);

            // Loop through data properties
            for (var prop in val) {
                // Ignore irrellevant properties
                if (!Object.prototype.hasOwnProperty.call(val, prop) ||
                ["longitude", "latitude"].includes(prop)) {
                    continue;
                }
                // Calculate max values
                if (val[prop] !== undefined) {
                    max[prop] = Math.max(val[prop], max[prop] || 0);
                }

                // Avoid a hard-coded list of property names)
                propertyNames.add(prop);
            }
        }).on("end", ()=>{

            // Sorted list of all lats and longs (to find neigbours)
            const latSet = new Set();
            const lngSet = new Set();
            for (const val of data) {
                latSet.add(val.latitude);
                lngSet.add(val.longitude);
            }
            const latitudes = [...latSet.values()].sort();
            const longitudes = [...lngSet.values()].sort();

            // Calculate the size of the rectangle to draw in the heatmap
            // Always setting it to 1 creates odd artifacts of overlapping
            // rectangles, so we save how far it is to the next rectangle.
            for (const val of data) {
                val.nextLat = latitudes[latitudes.findIndex(v=>v==val.latitude) + 1];
                val.nextLng = longitudes[longitudes.findIndex(v=>v==val.longitude) + 1];
            }

            postMessage({
                data,
                min,
                max,
                propertyNames
            });
        });
    });
});