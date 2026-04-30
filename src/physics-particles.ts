import { setEngine } from "./app/getEngine";
import { PhysicsParticlesScreen } from "./app/screens/PhysicsParticlesScreen";
import { CreationEngine } from "./engine/engine";

const engine = new CreationEngine();
setEngine(engine);

(async () => {
  await engine.init({
    background: 0x11111b,
    resizeOptions: { minWidth: 1280, minHeight: 720, letterbox: false },
  });

  await engine.navigation.showScreen(PhysicsParticlesScreen);
})();
