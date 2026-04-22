import { setEngine } from "./app/getEngine";
import { VoronoiStipplingScreen } from "./app/screens/VoronoiStipplingScreen";
import { CreationEngine } from "./engine/engine";

const engine = new CreationEngine();
setEngine(engine);

(async () => {
  await document.fonts.ready;

  await engine.init({
    background: 0x11111b, // Catppuccin Crust
    backgroundAlpha: 1,
    resizeOptions: { minWidth: 400, minHeight: 400, letterbox: false },
  });

  await engine.navigation.showScreen(VoronoiStipplingScreen);
})();
