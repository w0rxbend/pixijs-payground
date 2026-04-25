import { setEngine } from "./app/getEngine";
import { CatMeshScreen } from "./app/screens/CatMeshScreen";
import { CreationEngine } from "./engine/engine";

const engine = new CreationEngine();
setEngine(engine);

(async () => {
  await document.fonts.ready;

  await engine.init({
    backgroundAlpha: 0,
    resizeOptions: { minWidth: 400, minHeight: 300, letterbox: false },
  });

  await engine.navigation.showScreen(CatMeshScreen);
})();
