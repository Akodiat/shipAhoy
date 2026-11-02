import { init, loadShip, registerSW } from "./main.js";
import { initLanguage, t } from "./i18n.js";

async function start() {
    try {
        await initLanguage();
        init();
        registerSW();
        loadShip("cruise", () => {
            document.getElementById("titleboxWrapper").style.display = "";
        }, showError);
    } catch (error) {
        showError(error);
    }
}

function showError(error) {
    console.error(error);
    document.getElementById("loader").style.display = "";
    document.getElementById("loaderProgress").hidden = true;
    document.querySelector('[data-i18n="controls.loading"]').textContent = t("controls.loadError");
}

start();
