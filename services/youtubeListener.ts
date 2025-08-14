// services/youtubeListener.ts
import { AppState } from "react-native";
import { EventEmitter } from "eventemitter3";
import displayOverApp from "~/modules/display-over-app";

class YouTubeListenerService {
  private static instance: YouTubeListenerService;
  private youtubeOpenFired = false;
  private initialized = false;
  private watchDuration: number | null = null;
  private emitter = new EventEmitter();
  private watchDurationListener?: (duration: number) => void;

  private constructor() { } // prevents direct `new`

  public static getInstance(): YouTubeListenerService {
    if (!YouTubeListenerService.instance) {
      YouTubeListenerService.instance = new YouTubeListenerService();
    }
    return YouTubeListenerService.instance;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    displayOverApp.addListener("onYoutubeWatch", (payload) => {
      console.log("YouTube watch duration:", payload.duration);
      this.watchDuration = payload.duration;
      this.emitter.emit("watchDuration", payload.duration);
    });

    displayOverApp.addListener("onYoutubeOpen", (payload) => {
      if (this.youtubeOpenFired) return;
      this.youtubeOpenFired = true;
      this.watchDuration = null;
      console.log("YouTube opened at:", payload.timestamp);
    });

    AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        console.log("App came to foreground → removing overlay");
        displayOverApp.removeOverlay()
          .then(() => console.log("Overlay removed due to app foreground"));
        displayOverApp.hideTimerOverlay()
          .then(() => console.log("Timer overlay hidden"));
        console.log("app state change block: ", this.watchDuration)
        if (this.watchDuration !== null) {
          // this.emitter.emit("watchDuration", this.watchDuration)
          this.youtubeOpenFired = false;
          this.removeWatchDurationListener();
        }
      }
    });

    console.log("YouTubeListenerService initialized");
  }

  onWatchDuration(callback: (duration: number) => void) {
    // Prevent multiple subscriptions of the same callback
    if (this.watchDurationListener) {
      console.log("Removing previous watch duration listener")
      this.emitter.removeListener("watchDuration", this.watchDurationListener);
    }
    console.log("Adding new watch duration listener")
    this.watchDurationListener = callback;
    this.emitter.on("watchDuration", callback);

  }

  removeWatchDurationListener() {
    if (this.watchDurationListener) {
      this.emitter.removeListener("watchDuration", this.watchDurationListener);
      this.watchDurationListener = undefined;
      this.youtubeOpenFired = false;
    }
  }
}

export const youtubeListenerService = YouTubeListenerService.getInstance();