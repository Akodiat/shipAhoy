import { ships, init, loadShip, registerSW } from "./main.js";
registerSW?.();

const startScreen   = document.getElementById("startScreen");
const shipChooserEl = document.getElementById("shipChooser");
const enterBtn      = document.getElementById("enterButton");

let pickedShipName = null;

//create ship buttons
ships.forEach(({ name }) => {
  const btn = document.createElement("div");
  btn.className  = "ship-button";
  btn.textContent = name;
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".ship-button")
      .forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    pickedShipName    = name;
    enterBtn.disabled = false;
  });
  shipChooserEl.appendChild(btn);
});

//launch scene 
enterBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  init();       
  loadShip(pickedShipName);
});
