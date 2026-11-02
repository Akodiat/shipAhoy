const dictionaries = {};
let language = "it";
const annotationKeys = {
    "Scrubber water": "scrubberWater",
    "Exhaust gas": "exhaustGas",
    "Underwater radiated noise": "underwaterRadiatedNoise"
};

export function t(key) {
    return key.split(".").reduce((value, part) => value?.[part], dictionaries[language]) ?? key;
}

export async function initLanguage() {
    await Promise.all(["it", "en"].map(async code => {
        const response = await fetch(`translations/${code}.json`);
        if (!response.ok) throw new Error(`Unable to load ${code} translations`);
        dictionaries[code] = await response.json();
    }));
    document.getElementById("languageButton").onclick = () => {
        language = language === "it" ? "en" : "it";
        applyLanguage();
    };
    applyLanguage();
}

function applyLanguage() {
    document.documentElement.lang = language;
    document.getElementById("languageButton").textContent = language === "it" ? "English" : "Italiano";
    document.querySelectorAll("[data-i18n]").forEach(element => {
        element.innerHTML = t(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-title]").forEach(element => {
        element.title = t(element.dataset.i18nTitle);
    });
    document.getElementById("seaMovementButton").querySelector("img").alt = t("controls.seaMovement");
    document.getElementById("overviewReturnButton").title = t("controls.overview");
    document.getElementById("imageModal").open = false;
    window.dispatchEvent(new Event("languagechange"));
}

export function localizeAnnotation(original) {
    const dictionary = dictionaries[language];
    if (!dictionary) return original;
    const key = annotationKeys[original.name];
    const translation = dictionary.annotations?.[key] ?? dictionary[key];
    const spec = { ...original, ...translation };
    if (original.images) {
        const images = translation.images ?? translation.immagini;
        spec.images = original.images.map((image, index) => ({ ...image, ...Object.values(images)[index] }));
        spec.environmentalImpact = translation.environmentalImpact ?? translation["Impatto ambientale"];
        spec.humanImpact = translation.humanImpact ?? translation["Impatto umano"];
    }
    if (original.plotSpec) {
        spec.plotSpec = structuredClone(original.plotSpec);
        const chart = translation.chart;
        if (chart.description) spec.plotSpec.description = chart.description;
        for (const axis of ["x", "y"]) spec.plotSpec.encoding[axis].title = chart.encoding[axis].title;
        spec.plotSpec.encoding.tooltip.forEach((tooltip, index) => {
            tooltip.title = Object.values(chart.encoding.tooltip)[index].title;
        });
        if (chart.categories?.fuel) {
            spec.plotSpec.data.values.forEach((row, index) => {
                row.fuel = Object.values(chart.categories.fuel)[index];
            });
        }
    }
    return spec;
}
