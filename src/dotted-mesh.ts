import { setEngine } from "./app/getEngine";
import { DottedMeshScreen } from "./app/screens/DottedMeshScreen";
import { CreationEngine } from "./engine/engine";

const engine = new CreationEngine();
setEngine(engine);

(async () => {
  await document.fonts.ready;

  await engine.init({
    background: "#181825", // Catppuccin Mantle
    resizeOptions: { minWidth: 400, minHeight: 300, letterbox: false },
  });

  await engine.navigation.showScreen(DottedMeshScreen);
})();
