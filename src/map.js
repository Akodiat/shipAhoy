import * as leaflet from "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet-src.esm.js";
import shp from "https://unpkg.com/shpjs@6.1.0/dist/shp.esm.js";

import {annotations} from "./annotation.js";

class MapView {
    constructor(elementId) {
        const element = document.getElementById(elementId);
        this.fullyLoaded = false;

        // Use https://github.com/uber/h3-js to make grid and heatmap?
        this.map = leaflet.map(elementId, {
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

        this.layerControl = leaflet.control.layers(
            {"OpenStreetMap": baseMap},
            {"Sea map": seaMap}
        ).addTo(this.map);

        this.loadMarineAreas("./resources/HELCOM_marine_area.latlng.zip");

        this.loadHeatmaps("../resources/data.avro");

        this.addLegend();

        // Setup annotations to toggle corresponding heatmaps
        for (const annotation of annotations) {
            annotation.onSelect = () => {
                for (const key of this.propertyNames) {
                    if (annotation.spec.mapLayer === key) {
                        this.heatmaps[key].addTo(this.map);
                    } else {
                        this.heatmaps[key].removeFrom(this.map);
                    }
                }
                if (annotation.spec.mapLayer === undefined) {
                    element.style.display = "none";
                } else {
                    element.style.display = "block";
                }
            };
        }
    }

    /**
     * Load marine area geojson to map
     * @param {string} path Path to a geoJSON zip file
     */
    loadMarineAreas(path) {
        // From https://sdi.eea.europa.eu/catalogue/srv/eng/catalog.search#/metadata/5a8c5848-e131-4196-a14d-85197f284033
        // then converted with py/toLatLong.py and zipped
        shp(path).then(geojson => {
            const helcomLayer = leaflet.geoJSON(geojson, {
                attribution: "&copy; <a href=\"https://sdi.eea.europa.eu/catalogue/srv/eng/catalog.search#/metadata/5a8c5848-e131-4196-a14d-85197f284033\">EEA</a>"
            });
            this.layerControl.addOverlay(helcomLayer, "HELCOM marine areas");
        });
    }

    /**
     * Load data and create heatmaps. This is done through workers to not
     * keep the main thread waiting.
     * @param {string} heatmapDataPath path to AVRO file with heatmap data
     * @param {number} scaleFactor // Number of pixels per grid cell
     */
    loadHeatmaps(heatmapDataPath, scaleFactor = 4) {

        this.heatmaps = {};

        const avscWorkerPath = "src/avscWorker.js";
        const heatmapWorkerPath = "src/heatmapWorker.js";
        const avscWorker = new Worker(avscWorkerPath, {type: "module"});
        avscWorker.addEventListener("message", e => {
            avscWorker.terminate();

            this.propertyNames = e.data.propertyNames;

            // Convert latlngs to pixel coordinates (needed in heatmapWorker)
            for (const val of e.data.data) {
                let localXY = this.map.latLngToLayerPoint([val.latitude, val.longitude]);
                localXY = this.map.layerPointToContainerPoint(localXY);
                val.localXY = localXY;

                val.distXY = {x: 1, y: 1};
                if (val.nextLat !== undefined && val.nextLng !== undefined) {
                    let localXY2 = this.map.latLngToLayerPoint([val.nextLat, val.nextLng]);
                    localXY2 = this.map.layerPointToContainerPoint(localXY2);
                    val.distXY = {
                        x: Math.min(10, Math.abs(localXY2.x - localXY.x)),
                        y: Math.min(10, Math.abs(localXY2.y - localXY.y))
                    };
                }
            }

            // Create offscreen canvas to draw on
            const size = this.map.getSize();
            const canvas = document.createElement("canvas");
            canvas.width = size.x * scaleFactor;
            canvas.height = size.y * scaleFactor;
            const offscreen  = canvas.transferControlToOffscreen();

            const heatmapWorker = new Worker(heatmapWorkerPath, {
                type: "module"
            });

            heatmapWorker.postMessage({
                ...e.data,
                scaleFactor,
                mapSize: this.map.getSize(),
                canvas: offscreen
            }, [offscreen]);

            heatmapWorker.addEventListener("message", e=>{
                heatmapWorker.terminate();
                for (const prop of this.propertyNames.values()) {
                    const heatmap = leaflet.imageOverlay(
                        e.data[prop],
                        this.map.getBounds(), {
                            attribution: "&copy; Jalkanen et al <a href=\"https://zenodo.org/records/4063643\">10.5281/zenodo.4063643</a>."
                        }
                    );
                    this.heatmaps[prop] = heatmap;
                    this.layerControl.addOverlay(heatmap, prop);
                }
                this.fullyLoaded = true;
            });
        });
        avscWorker.postMessage(heatmapDataPath);
    }

    addLegend() {
        const legend = leaflet.control({ position: "bottomright" });

        legend.onAdd = () => {
            const div = leaflet.DomUtil.create("div", "info legend");

            // Create a color gradient for heatmap scale
            const grades = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
            //TODO : Add color gradient from heatmapWorker
            const colors = [
                "#fef0d9",
                "#fdcc8a",
                "#fc8d59",
                "#e34a33",
                "#b30000"
            ];
            div.innerHTML += "<h4>Intensity</h4>";
            for (let i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    `<i style="background:${colors[i]}; width: 30px; height: 20px; float: left; margin-right: 8px; opacity: 0.7;"></i>` +
                    `${grades[i]}${grades[i + 1] ? `&ndash;${grades[i + 1]}<br>` : "+"}`;
            }

            return div;
        };

        legend.addTo(this.map);
    }
}

export {MapView};