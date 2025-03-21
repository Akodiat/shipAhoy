import * as leaflet from "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet-src.esm.js";
import shp from "https://unpkg.com/shpjs@6.1.0/dist/shp.esm.js";
import avsc from "https://cdn.jsdelivr.net/npm/avsc@5.7.7/+esm";

import {annotations} from "./annotation.js";
import {Lut} from "../lib/Lut.js";

class MapView {
    constructor(element) {
        // Use https://github.com/uber/h3-js to make grid and heatmap?
        this.map = leaflet.map(element, {
            renderer: leaflet.canvas(),
            minZoom: 5
        });
        this.map.setView([59.0, 17.0], 5);

        const baseMap = leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
        }).addTo(this.map);

        const seaMap = leaflet.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
            attribution: "&copy; <a href=\"http://www.openseamap.org\">OpenSeaMap</a> contributors"
        }).addTo(this.map);

        this.data = [];
        this.min = {};
        this.max = {};
        this.heatmaps = {};
        this.propertyNames = new Set();

        this.layerControl = leaflet.control.layers(
            {"OpenStreetMap": baseMap},
            {"Sea map": seaMap}
        ).addTo(this.map);

        // From https://sdi.eea.europa.eu/catalogue/srv/eng/catalog.search#/metadata/5a8c5848-e131-4196-a14d-85197f284033
        // then converted with py/toLatLong.py and zipped
        shp("./resources/HELCOM_marine_area.latlng.zip").then(geojson => {
            const helcomLayer = leaflet.geoJSON(geojson, {
                attribution: "&copy; <a href=\"https://sdi.eea.europa.eu/catalogue/srv/eng/catalog.search#/metadata/5a8c5848-e131-4196-a14d-85197f284033\">EEA</a>"
            });
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

                    // Avoid a hard-coded list of property names)
                    this.propertyNames.add(prop);
                }
            }).on("end", ()=>{
                console.log("Finished loading");

                const luts = new Map();
                for(const prop of this.propertyNames.values()) {
                    const lut = new Lut("OrRd", 32);
                    lut.minV = 0;
                    lut.maxV = Math.log(this.max[prop]);
                    luts.set(prop, lut);
                }

                const latSet = new Set();
                const lngSet = new Set();

                // Draw circles for each value
                for (const val of this.data) {
                    latSet.add(val.latitude);
                    lngSet.add(val.longitude);
                }

                // Sorted list of all lats and longs (to find neigbours)
                const latitudes = [...latSet.values()].sort();
                const longitudes = [...lngSet.values()].sort();

                const scaleFactor = 4; // Number of pixels per grid cell
                for (const prop of this.propertyNames.values()) {
                    // Create and paint a canvas with a heatmap
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    const size = this.map.getSize();
                    canvas.width = size.x * scaleFactor;
                    canvas.height = size.y * scaleFactor;
                    for (const val of this.data) {
                        if (val[prop] !== null) {
                            // Get colour from lookuptable
                            const color = luts.get(prop).getColor(Math.log(val[prop]));
                            ctx.fillStyle = `rgba(${color.r*255}, ${color.g*255}, ${color.b*255}, 0.8)`;

                            // Convert latlng to pixel coordinates
                            let localXY = this.map.latLngToLayerPoint([val.latitude, val.longitude]);
                            localXY = this.map.layerPointToContainerPoint(localXY);

                            // Calculate the size of the rectangle (always setting it to 1) creates
                            // odd artifacts of overlapping rectangles, so we check how far it is
                            // to the next rectangle.
                            const nextLat = latitudes[latitudes.findIndex(v=>v==val.latitude) + 1];
                            const nextLng = longitudes[longitudes.findIndex(v=>v==val.longitude) + 1];
                            let distXY = {x: 1, y: 1};
                            if (nextLat !== undefined && nextLng !== undefined) {
                                let localXY2 = this.map.latLngToLayerPoint([nextLat, nextLng]);
                                localXY2 = this.map.layerPointToContainerPoint(localXY2);
                                distXY = {
                                    x: Math.min(10, Math.abs(localXY2.x - localXY.x)),
                                    y: Math.min(10, Math.abs(localXY2.y - localXY.y))
                                };
                            }
                            // Draw rectangle on canvas
                            ctx.fillRect(
                                localXY.x * scaleFactor,
                                localXY.y * scaleFactor,
                                distXY.x * scaleFactor,
                                distXY.y * scaleFactor
                            );
                        }
                    }
                    const heatmap = leaflet.imageOverlay(
                        canvas.toDataURL(),
                        this.map.getBounds(), {
                            attribution: "&copy; Jalkanen et al <a href=\"https://zenodo.org/records/4063643\">10.5281/zenodo.4063643</a>."
                        }
                    );
                    this.heatmaps[prop] = heatmap;
                    this.layerControl.addOverlay(heatmap, prop);
                }
            });
        });

        for (const annotation of annotations) {
            annotation.onSelect = () => {
                for (const key of this.propertyNames) {
                    if (annotation.dataKey === key) {
                        this.heatmaps[key].addTo(this.map);
                    } else {
                        this.heatmaps[key].removeFrom(this.map);
                    }
                }
            };
        }
    }
}

export {MapView};