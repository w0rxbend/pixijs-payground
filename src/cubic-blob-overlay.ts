import {
  blobOverlayController,
  blobOverlayRandomDriver,
  blobOverlaySocketBridge,
  type BlobOverlayRuntime,
} from "./app/blobOverlayController";
import { setEngine } from "./app/getEngine";
import { CubicBlobOverlayScreen } from "./app/screens/CubicBlobOverlayScreen";
import { CreationEngine } from "./engine/engine";

declare global {
  interface Window {
    obsBlobOverlay?: BlobOverlayRuntime;
  }
}

const engine = new CreationEngine();
setEngine(engine);

const wsUrl = new URLSearchParams(window.location.search).get("ws");

window.obsBlobOverlay = {
  controller: blobOverlayController,
  randomDriver: blobOverlayRandomDriver,
  socketBridge: blobOverlaySocketBridge,
};

(async () => {
  await engine.init({
    background: "transparent",
    backgroundAlpha: 0,
    resizeOptions: { minWidth: 1280, minHeight: 720, letterbox: false },
  });

  await engine.navigation.showScreen(CubicBlobOverlayScreen);

  if (wsUrl) {
    blobOverlayRandomDriver.stop();
    blobOverlaySocketBridge.connect(wsUrl);
    return;
  }

  blobOverlayRandomDriver.start();
})();
