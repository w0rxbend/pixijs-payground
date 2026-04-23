import { setEngine } from "./app/getEngine";
import { TrapNationScreen } from "./app/screens/TrapNationScreen";
import { CreationEngine } from "./engine/engine";

/**
 * Entry point for the TrapNation Visualizer.
 */
async function start() {
  // Ensure the DOM target exists before the engine tries to access it
  let container = document.getElementById("pixi-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "pixi-container";
    const appDiv = document.getElementById("app") || document.body;
    appDiv.appendChild(container);
  }

  const eng = new CreationEngine();
  setEngine(eng);

  await document.fonts.ready;

  await eng.init({
    background: 0x0b0b12, // Dark cinematic background
    resizeTo: window,
    resizeOptions: {
      minWidth: 1080,
      minHeight: 1080,
      letterbox: true,
    },
  });

  // Use the navigation system to show the screen.
  // This automatically handles asset bundle loading (TrapNationScreen.assetBundles).
  await eng.navigation.showScreen(TrapNationScreen);
}

start();
