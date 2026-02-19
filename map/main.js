import {parseCSVPath} from "./csv.js";

const {DeckGL, H3HexagonLayer} = deck;

const mapContainer = document.getElementById("mapContainer");

const shipTypes = ["Cargo", "Passenger", "Tanker"];

// Read csv file
const allCounts = await parseCSVPath("counts.csv");
const dataMap = new Map();
shipTypes.forEach(s=>dataMap.set(s, []));
let maxVal = -Infinity;
// Parse values as floats and calculate max value
allCounts.forEach(d=>{
    for (const s of shipTypes) {
        const k = `count${s}`;
        d[k] = parseFloat(d[k]);
        maxVal = Math.max(maxVal, d[k]);
        if (d[k] > 0) {
            dataMap.get(s).push(d);
        }
    }
});

const deckGL = new DeckGL({
    container: mapContainer,
    mapStyle: 'osm_water.json',
    initialViewState: {
        longitude: 11.126,
        latitude: 55.244,
        zoom: 2
    },
    controller: true
});

/**
 * Draw a provided ship type layer
 * @param {string} shipType
 */
function renderLayer(shipType) {
    const layer = new H3HexagonLayer({
        id: shipType,
        data: dataMap.get(shipType),
        extruded: false,
        getHexagon: d => d.id,
        opacity: 0.3,
        filled: true,
        getFillColor: d => [255, (1 - Math.log(d[`count${shipType}`]) / Math.log(maxVal)) * 255, 0]
    });
    deckGL.setProps({
        layers: [layer]
    });
}

/**
 * Get selection from radio buttons
 * @returns {string} Selected ship type
 */
function getShipType() {
    return document.querySelector('input[name="shipType"]:checked').id;
}

// Draw currently selected ship type
renderLayer(getShipType());

// Update layes when selected ship type changes
document.querySelectorAll('input[name="shipType"]').forEach(
    e=>e.addEventListener("change", ()=>{
        renderLayer(getShipType());
    })
);
