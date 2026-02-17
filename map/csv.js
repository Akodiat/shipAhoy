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

export {parseCSVPath};