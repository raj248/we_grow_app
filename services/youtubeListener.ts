// services/youtubeListener.ts
import { AppState } from "react-native";
import { EventEmitter } from "eventemitter3";
import displayOverApp from "~/modules/display-over-app";

class YouTubeListenerService {
  private youtubeOpenFired = false;
  private initialized = false;
  private watchDuration: number | null = null;
  private emitter = new EventEmitter();
  private watchDurationListener?: (duration: number) => void;

  init() {
    if (this.initialized) return;
    this.initialized = true;

    displayOverApp.addListener("onYoutubeWatch", (payload) => {
      console.log("YouTube watch duration:", payload.duration);
      this.watchDuration = payload.duration;
      this.emitter.emit("watchDuration", payload.duration);
      this.youtubeOpenFired = false;
    });

    displayOverApp.addListener("onYoutubeOpen", (payload) => {
      if (this.youtubeOpenFired) return;
      this.youtubeOpenFired = true;
      console.log("YouTube opened at:", payload.timestamp);
    });

    AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        console.log("App came to foreground → removing overlay");
        displayOverApp.removeOverlay()
          .then(() => console.log("Overlay removed due to app foreground"));
        displayOverApp.hideTimerOverlay()
          .then(() => console.log("Timer overlay hidden"));
      }
    });

    console.log("YouTubeListenerService initialized");
  }

  onWatchDuration(callback: (duration: number) => void) {
    // Prevent multiple subscriptions of the same callback
    if (this.watchDurationListener) {
      this.emitter.removeListener("watchDuration", this.watchDurationListener);
    }
    this.watchDurationListener = callback;
    this.emitter.on("watchDuration", callback);

    // If duration already exists, trigger immediately
    if (this.watchDuration !== null) {
      callback(this.watchDuration);
    }
  }

  removeWatchDurationListener() {
    if (this.watchDurationListener) {
      this.emitter.removeListener("watchDuration", this.watchDurationListener);
      this.watchDurationListener = undefined;
    }
  }
}

export const youtubeListenerService = new YouTubeListenerService();
