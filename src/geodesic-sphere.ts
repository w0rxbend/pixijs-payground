import { setEngine } from "./app/getEngine";
import { GeodesicSphereScreen } from "./app/screens/GeodesicSphereScreen";
import { CreationEngine } from "./engine/engine";

const engine = new CreationEngine();
setEngine(engine);

(async () => {
  await document.fonts.ready;
  await engine.init({
    background: 0x1e1e2e,
    resizeOptions: { minWidth: 400, minHeight: 300, letterbox: false },
  });
  await engine.navigation.showScreen(GeodesicSphereScreen);
})();
