import {loadData} from "./loadData.js";

const {DeckGL, H3HexagonLayer} = deck;

const mapContainer = document.getElementById("mapContainer");
const shipTypes = ["Cargo", "Passenger", "Tanker"];
const dataMap = await loadData("counts.csv", shipTypes);

const deckGL = new DeckGL({
    container: mapContainer,
    mapStyle: 'osm_water.json', // Edit with https://maplibre.org/maputnik/
    initialViewState: {
        longitude: 11.126,
        latitude: 55.244,
        zoom: 2
    },
    controller: true,
    getTooltip: ({object: d}) => {
        console.log(d);
        const s = getShipType();
        return d && `${d[`count${s}`].toLocaleString()} ${s.toLowerCase()} ships`
    }
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
        getFillColor: d => [
            255,
            (1 - Math.log(d[`count${shipType}`]) /
                Math.log(dataMap.maxVal)) * 255,
            0],
        pickable: true
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
