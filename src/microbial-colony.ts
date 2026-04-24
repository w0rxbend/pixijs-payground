import { setEngine } from "./app/getEngine";
import { MicrobialColonyScreen } from "./app/screens/MicrobialColonyScreen";
import { CreationEngine } from "./engine/engine";

const engine = new CreationEngine();
setEngine(engine);

(async () => {
  await engine.init({
    background: 0x11111b,
    resizeOptions: { minWidth: 1920, minHeight: 1080, letterbox: false },
  });

  await engine.navigation.showScreen(MicrobialColonyScreen);
})();
