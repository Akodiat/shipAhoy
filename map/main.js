import {parseCSVPath} from "./csv.js";

const {DeckGL, H3HexagonLayer} = deck;

const mapContainer = document.getElementById("mapContainer");

const shipTypes = ["Cargo", "Passenger", "Tanker"];

const data = new Map();
for (const t of shipTypes) {
    // Read csv file
    const d = await parseCSVPath(`density${t}.csv`);
    // Parse values as floats
    d.forEach(d=>d.count = parseFloat(d.count));

    data.set(t, d);
}

// Calculate max count for all ship types
const maxVal = Math.max(...[...data.values()].flatMap(s=>s).map(s=>s.count));

const deckGL = new DeckGL({
    container: mapContainer,
    mapStyle: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
    initialViewState: {
        longitude: 11.126,
        latitude: 55.244,
        zoom: 4
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
        data: data.get(shipType),
        extruded: false,
        getHexagon: d => d.id,
        opacity: 0.5,
        filled: true,
        getFillColor: d => [255, (1 - Math.log(d.count) / Math.log(maxVal)) * 255, 0]
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
