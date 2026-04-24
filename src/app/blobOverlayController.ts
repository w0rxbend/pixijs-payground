export type BlobReactionCommand = "smile" | "blink" | "hmm" | "nod" | "no-no";

type BlobReactionListener = (command: BlobReactionCommand) => void;

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function normalizeBlobReactionCommand(
  value: string,
): BlobReactionCommand | null {
  const normalized = value.trim().toLowerCase();

  switch (normalized) {
    case "smile":
      return "smile";
    case "blink":
      return "blink";
    case "hmm":
      return "hmm";
    case "nod":
      return "nod";
    case "no-no":
    case "no no":
    case "nono":
    case "shake":
    case "shake-head":
    case "head-shake":
      return "no-no";
    default:
      return null;
  }
}

function extractBlobReactionCommand(
  payload: unknown,
): BlobReactionCommand | null {
  if (typeof payload === "string") {
    const directCommand = normalizeBlobReactionCommand(payload);
    if (directCommand) {
      return directCommand;
    }

    try {
      return extractBlobReactionCommand(JSON.parse(payload) as unknown);
    } catch {
      return null;
    }
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    for (const key of ["command", "reaction", "action", "type"]) {
      const value = record[key];
      if (typeof value !== "string") {
        continue;
      }

      const command = normalizeBlobReactionCommand(value);
      if (command) {
        return command;
      }
    }
  }

  return null;
}

export class BlobOverlayController {
  private readonly listeners = new Set<BlobReactionListener>();

  public onCommand(listener: BlobReactionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public trigger(command: BlobReactionCommand): void {
    for (const listener of this.listeners) {
      listener(command);
    }
  }

  public dispatchMessage(payload: unknown): BlobReactionCommand | null {
    const command = extractBlobReactionCommand(payload);
    if (command) {
      this.trigger(command);
    }

    return command;
  }

  public smile(): void {
    this.trigger("smile");
  }

  public blink(): void {
    this.trigger("blink");
  }

  public hmm(): void {
    this.trigger("hmm");
  }

  public nod(): void {
    this.trigger("nod");
  }

  public noNo(): void {
    this.trigger("no-no");
  }
}

export class BlobOverlaySocketBridge {
  private socket?: WebSocket;

  private readonly onMessage = (event: MessageEvent<string>): void => {
    this.handleMessage(event.data);
  };

  constructor(private readonly controller: BlobOverlayController) {}

  public connect(url: string): WebSocket {
    this.disconnect();

    this.socket = new WebSocket(url);
    this.socket.addEventListener("message", this.onMessage);

    return this.socket;
  }

  public disconnect(): void {
    if (!this.socket) {
      return;
    }

    this.socket.removeEventListener("message", this.onMessage);
    this.socket.close();
    this.socket = undefined;
  }

  public handleMessage(payload: unknown): BlobReactionCommand | null {
    return this.controller.dispatchMessage(payload);
  }
}

export class BlobOverlayRandomDriver {
  private readonly timerIds = new Set<number>();
  private running = false;

  constructor(private readonly controller: BlobOverlayController) {}

  public start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.scheduleBlinkLoop();
    this.scheduleReactionLoop();
  }

  public stop(): void {
    this.running = false;

    for (const timerId of this.timerIds) {
      window.clearTimeout(timerId);
    }

    this.timerIds.clear();
  }

  private schedule(delayMs: number, callback: () => void): void {
    const timerId = window.setTimeout(() => {
      this.timerIds.delete(timerId);

      if (!this.running) {
        return;
      }

      callback();
    }, delayMs);

    this.timerIds.add(timerId);
  }

  private scheduleBlinkLoop(): void {
    this.schedule(randomRange(1800, 4200), () => {
      this.controller.blink();

      if (Math.random() < 0.2) {
        this.schedule(randomRange(120, 240), () => {
          this.controller.blink();
        });
      }

      this.scheduleBlinkLoop();
    });
  }

  private scheduleReactionLoop(): void {
    this.schedule(randomRange(1400, 3200), () => {
      const roll = Math.random();

      if (roll < 0.34) {
        this.controller.smile();
      } else if (roll < 0.54) {
        this.controller.nod();
      } else if (roll < 0.74) {
        this.controller.hmm();
      } else if (roll < 0.9) {
        this.controller.noNo();
      } else {
        this.controller.smile();
        this.schedule(randomRange(220, 420), () => {
          this.controller.nod();
        });
      }

      this.scheduleReactionLoop();
    });
  }
}

export interface BlobOverlayRuntime {
  controller: BlobOverlayController;
  randomDriver: BlobOverlayRandomDriver;
  socketBridge: BlobOverlaySocketBridge;
}

export const blobOverlayController = new BlobOverlayController();
export const blobOverlayRandomDriver = new BlobOverlayRandomDriver(
  blobOverlayController,
);
export const blobOverlaySocketBridge = new BlobOverlaySocketBridge(
  blobOverlayController,
);
