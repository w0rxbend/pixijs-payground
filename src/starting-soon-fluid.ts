import { setEngine } from "./app/getEngine";
import { StartingSoonFluidScreen } from "./app/screens/StartingSoonFluidScreen";
import { CreationEngine } from "./engine/engine";

const eng = new CreationEngine();
setEngine(eng);

(async () => {
  // Ensure the font is loaded as it's used for sampling
  await document.fonts.load("bold 100px Silkscreen");
  await document.fonts.ready;

  await eng.init({
    background: 0x000000, // Pure Black
    backgroundAlpha: 1, // Opaque Background
    resizeOptions: { minWidth: 800, minHeight: 450, letterbox: false },
  });

  await eng.navigation.showScreen(StartingSoonFluidScreen);
})();
