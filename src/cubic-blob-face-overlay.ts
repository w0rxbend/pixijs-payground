import { setEngine } from "./app/getEngine";
import { CubicBlobFaceOverlayScreen } from "./app/screens/CubicBlobFaceOverlayScreen";
import { CreationEngine } from "./engine/engine";

const engine = new CreationEngine();
setEngine(engine);

(async () => {
  await engine.init({
    background: "transparent",
    backgroundAlpha: 0,
    resizeOptions: { minWidth: 1280, minHeight: 720, letterbox: false },
  });

  await engine.navigation.showScreen(CubicBlobFaceOverlayScreen);
})();
