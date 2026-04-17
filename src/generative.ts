import { setEngine } from "./app/getEngine";
import { GenerativeScreen } from "./app/screens/GenerativeScreen";
import { CreationEngine } from "./engine/engine";

const eng = new CreationEngine();
setEngine(eng);

(async () => {
  await document.fonts.ready;

  await eng.init({
    background: 0x11111b,
    resizeOptions: { minWidth: 800, minHeight: 450, letterbox: false },
  });

  await eng.navigation.showScreen(GenerativeScreen);
})();
