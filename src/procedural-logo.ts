import { setEngine } from "./app/getEngine";
import { ProceduralLogoScreen } from "./app/screens/ProceduralLogoScreen";
import { CreationEngine } from "./engine/engine";

const engine = new CreationEngine();
setEngine(engine);

(async () => {
  // Block until all declared fonts are downloaded and ready.
  await Promise.all([
    document.fonts.load("400 1em 'Silkscreen'"),
    document.fonts.load("700 1em 'Silkscreen'"),
  ]);
  await document.fonts.ready;

  await engine.init({
    background: "transparent",
    backgroundAlpha: 0,
    resizeOptions: { minWidth: 400, minHeight: 400, letterbox: false },
  });

  await engine.navigation.showScreen(ProceduralLogoScreen);
})();
