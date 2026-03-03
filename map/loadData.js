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

export {loadData};