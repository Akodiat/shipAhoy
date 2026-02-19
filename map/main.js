import {parseCSVPath} from "./csv.js";

const {DeckGL, H3HexagonLayer} = deck;

const mapContainer = document.getElementById("mapContainer");

const shipTypes = ["Cargo", "Passenger", "Tanker"];

// Read csv file
const data = await parseCSVPath("counts.csv");
// Parse values as floats
data.forEach(d=>{
    for (const s of shipTypes) {
        d[`count${s}`] = parseFloat(d[`count${s}`]);
    }
});

// Calculate max count for all ship types
const maxVal = Math.max(...data.flatMap(d=>shipTypes.map(s=>d[`count${s}`])));

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
        data: data,
        extruded: false,
        // Hide hexagons where count is empty
        getHexagon: d => d[`count${shipType}`] > 0 ? d.id : undefined,
        opacity: 0.5,
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
