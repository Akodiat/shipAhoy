import {parseCSVPath} from "./csv.js";

const {DeckGL, ScatterplotLayer, H3HexagonLayer} = deck;

const data = await parseCSVPath("cargo.csv");
data.forEach(d=>d.value = parseFloat(d.value));

const maxVal = Math.max(...data.map(v=>v.value));

new DeckGL({
    container: document.body,
    width: '100vw',
    height: '100vh',
    mapStyle: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
    initialViewState: {
        longitude: 11.126,
        latitude: 55.244,
        zoom: 4
    },
    controller: true,
    layers: [
        new H3HexagonLayer({
            data: data,
            extruded: false,
            getHexagon: d => d.id,
            opacity: 0.5,
            filled: true,
            getFillColor: d => [255, (1 - d.value / maxVal) * 255, 0]
        })
    ]
});