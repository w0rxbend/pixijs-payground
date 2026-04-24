import { setEngine } from "./app/getEngine";
import { StartingSoonParticleMeshScreen } from "./app/screens/StartingSoonParticleMeshScreen";
import { CreationEngine } from "./engine/engine";

const engine = new CreationEngine();
setEngine(engine);

(async () => {
  await document.fonts.load("400 1em 'Bangers'");
  await document.fonts.ready;

  await engine.init({
    background: "transparent",
    backgroundAlpha: 0,
    resizeOptions: { minWidth: 800, minHeight: 450, letterbox: false },
  });

  await engine.navigation.showScreen(StartingSoonParticleMeshScreen);
})();
