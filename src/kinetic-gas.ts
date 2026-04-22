import { setEngine } from "./app/getEngine";
import { KineticGasScreen } from "./app/screens/KineticGasScreen";
import { CreationEngine } from "./engine/engine";

const engine = new CreationEngine();
setEngine(engine);

(async () => {
  await engine.init({
    background: 0x11111b, // Crust
    backgroundAlpha: 1,
  });

  await engine.navigation.showScreen(KineticGasScreen);
})();
