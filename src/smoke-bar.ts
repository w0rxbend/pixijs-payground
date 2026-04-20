import { setEngine } from "./app/getEngine";
import { SmokeBarScreen } from "./app/screens/SmokeBarScreen";
import { CreationEngine } from "./engine/engine";

const engine = new CreationEngine();
setEngine(engine);

(async () => {
  await document.fonts.ready;

  await engine.init({
    background: "transparent",
    backgroundAlpha: 0,
    resizeOptions: { minWidth: 1920, minHeight: 70, letterbox: false },
  });

  await engine.navigation.showScreen(SmokeBarScreen);
})();
