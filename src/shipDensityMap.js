const {DeckGL, H3HexagonLayer} = deck;

class ShipDensityMap {
    constructor(
        bgMapContainer,
        mapStylePath,
        shipTypes = ["Cargo", "Passenger", "Tanker"],
        highPrecision=false,
    ) {
        this.shipTypes = shipTypes;
        this.shipType = shipTypes[0];
        this.highPrecision = highPrecision;
        this.deckGL = new DeckGL({
            container: bgMapContainer,
            mapStyle: mapStylePath, // Edit with https://maplibre.org/maputnik/
            initialViewState: {
                longitude: 11.126,
                latitude: 55.244,
                zoom: 2
            },
            controller: true,
            getTooltip: ({object: d}) => {
                const s = this.shipType;
                return d && `${d[`count${s}`].toLocaleString()} ${s.toLowerCase()} ships`
            }
        });
    }
    async setData(path) {
        this.dataMap = await loadData(path, this.shipTypes);
        this.renderLayer();
    }
    updateShipType(shipType) {
        this.shipType = shipType;
        this.renderLayer();
    }
    updateHighPrecision(highPrecision) {
        this.highPrecision = highPrecision;
        this.renderLayer();
    }
    /**
     * Draw a provided ship type layer
     * @param {string} shipType
     */
    renderLayer() {
        if (this.dataMap === undefined) {
            return;
        }
        const layer = new H3HexagonLayer({
            id: this.shipType,
            data: this.dataMap.get(this.shipType),
            extruded: false,
            getHexagon: d => d.id,
            opacity: 0.3,
            filled: true,
            getFillColor: d => [
                255,
                (1 - Math.log(d[`count${this.shipType}`]) /
                    Math.log(this.dataMap.maxVal)) * 255,
                0],
            pickable: true,
            highPrecision: this.highPrecision
        });
        this.deckGL.setProps({
            layers: [layer]
        });
    }
}

/**
 * Load data from CSV
 * @param {string} path URL to CSV file
 * @param {string[]} shipTypes List of ship types
 * @returns
 */
async function loadData(path, shipTypes) {
    // Read csv file
    const allCounts = await parseCSVPath(path);
    const dataMap = new Map();
    shipTypes.forEach(s=>dataMap.set(s, []));
    dataMap.maxVal = -Infinity;
    // Parse values as floats and calculate max value
    allCounts.forEach(d=>{
        for (const s of shipTypes) {
            const k = `count${s}`;
            d[k] = parseFloat(d[k]);
            dataMap.maxVal = Math.max(dataMap.maxVal, d[k]);
            if (d[k] > 0) {
                dataMap.get(s).push(d);
            }
        }
    });
    return dataMap
}

/**
 * Parse CSV path with header, if you need to do anything fancier,
 * just use PapaParse instead (https://www.papaparse.com/)
 * @param {string} path URL
 * @param {string} sep Separator (defaults to comma)
 * @returns
 */
async function parseCSVPath(path, sep=",") {
    const text = await textFileFromPath(path);
    return parseCSV(text, sep);
}

/**
 * Parse CSV with header, if you need to do anything fancier,
 * just use PapaParse instead (https://www.papaparse.com/)
 * @param {string} csvStr String representing the CSV content
 * @param {string} sep Separator (defaults to comma)
 * @returns
 */
function parseCSV(csvStr, sep=",") {
    // Split on newlines
    let lines = csvStr.split("\n");

    // Separate header from following lines
    const header = lines[0].split(sep).map(v=>v.trim());
    lines = lines.slice(1);
    lines = lines.filter(l=>l!=="");

    return lines.map(line => {
        const values = line.split(sep).map(v=>v.trim());
        const e = {};
        header.forEach((key, i) =>
            e[key] = values[i]
        );
        return e;
    });
}

async function textFileFromPath(path) {
    const res = await fetch(path);
    const text = await res.text();
    return text;
}

export {ShipDensityMap}
