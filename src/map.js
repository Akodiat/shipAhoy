import * as L from "leaflet";

class MapView {
    constructor(element) {
        // Use https://github.com/uber/h3-js to make grid and heatmap?
        this.map = L.map(element);
        this.map.setView([57.5, 11.16], 10);

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
        }).addTo(this.map);

        L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
            attribution: "Map data: &copy; <a href=\"http://www.openseamap.org\">OpenSeaMap</a> contributors"
        }).addTo(this.map);
    }
}

export {MapView};