import { setEngine } from "./app/getEngine";
import { EmberPentagramOverlayScreen } from "./app/screens/EmberPentagramOverlayScreen";
import { CreationEngine } from "./engine/engine";

const engine = new CreationEngine();
setEngine(engine);

(async () => {
  await engine.init({
    background: 0x09070b,
    resizeOptions: { minWidth: 1920, minHeight: 1080, letterbox: false },
  });

  await engine.navigation.showScreen(EmberPentagramOverlayScreen);
})();
