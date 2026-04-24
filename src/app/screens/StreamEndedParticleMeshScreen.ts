import { StartingSoonParticleMeshScreen } from "./StartingSoonParticleMeshScreen";

export class StreamEndedParticleMeshScreen extends StartingSoonParticleMeshScreen {
  protected override getTextLines(): readonly string[] {
    return ["STREAM", "ENDED"];
  }
}
