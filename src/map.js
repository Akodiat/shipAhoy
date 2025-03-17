import * as leaflet from "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet-src.esm.js";
import shp from "https://unpkg.com/shpjs@6.1.0/dist/shp.esm.js";
import avsc from "https://cdn.jsdelivr.net/npm/avsc@5.7.7/+esm";

class MapView {
    constructor(element) {
        // Use https://github.com/uber/h3-js to make grid and heatmap?
        this.map = leaflet.map(element, {
            renderer: leaflet.canvas()
        });
        this.map.setView([57.5, 11.16], 10);

        const baseMap = leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
        }).addTo(this.map);

        const seaMap = leaflet.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
            attribution: "&copy; <a href=\"http://www.openseamap.org\">OpenSeaMap</a> contributors"
        }).addTo(this.map);

        this.data = [];
        this.max = {};
        this.layerGroups = {};
        this.propertyNames = [];

        this.layerControl = leaflet.control.layers(
            {"OpenStreetMap": baseMap},
            {"Sea map": seaMap}
        ).addTo(this.map);

        // From https://sdi.eea.europa.eu/catalogue/srv/eng/catalog.search#/metadata/5a8c5848-e131-4196-a14d-85197f284033
        // then converted with py/toLatLong.py and zipped
        shp("./resources/HELCOM_marine_area.latlng.zip").then(geojson => {
            const helcomLayer = leaflet.geoJSON(geojson).addTo(this.map);
            this.layerControl.addOverlay(helcomLayer, "HELCOM marine areas");
        });

        window.fetch(new Request("./resources/data.avro")).then(response => {
            return response.blob();
        }).then(response => {
            avsc.createBlobDecoder(response).on("metadata", type => {
                /* `type` is the writer's type. */
                console.log(type);
            }).on("data", val => {
                this.data.push(val);

                // Loop through data properties
                for (var prop in val) {
                    // Ignore irrellevant properties
                    if (!Object.prototype.hasOwnProperty.call(val, prop) ||
                        ["longitude", "latitude"].includes(prop)) {
                        continue;
                    }
                    // Calculate max values
                    if (val[prop] !== undefined) {
                        this.max[prop] = Math.max(val[prop], this.max[prop] || 0);
                    }
                    // Initialise layers (since we avoid a hard-coded list of property names)
                    if (this.layerGroups[prop] === undefined) {
                        this.layerGroups[prop] = leaflet.layerGroup([], {
                            attribution: "Data: &copy; Jalkanen, J.-P. (2020) ”Modeling of discharges from Baltic Sea shipping”, Ocean Science, 27, s. 699–728. doi: <a href=\"https://zenodo.org/records/4063643\">10.5281/zenodo.4063643</a>."
                        });
                        this.layerControl.addOverlay(this.layerGroups[prop], prop);
                        this.propertyNames.push(prop);
                    }
                }
            }).on("end", ()=>{
                console.log("Finished loading");

                // Draw circles for each value
                for (const val of this.data) {
                    for (const prop of this.propertyNames) {
                        if (val[prop] !== undefined) {
                            const max = this.max[prop];
                            // Use https://stackoverflow.com/questions/79241104/gradient-overlay-based-on-interpolated-values-from-nearest-points-heatmap instead?
                            const circle = leaflet.circle([val.latitude, val.longitude], {
                                color: "red",
                                stroke: false,
                                fillOpacity: Math.sqrt(val[prop]/max),
                                radius: 1100
                            });
                            this.layerGroups[prop].addLayer(circle);
                        }
                    }
                }
                // Show first property by default (remove to select nothing)
                this.layerGroups[this.propertyNames[0]].addTo(this.map);
            });
        });
    }
}

export {MapView};