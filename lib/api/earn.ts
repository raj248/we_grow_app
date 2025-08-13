import { Linking } from "react-native";
import { safeFetch, BASE_URL } from "~/lib/api/api";
import displayOverApp from "~/modules/display-over-app";
import { useUserStore } from "~/stores/useUserStore";
import { APIResponse } from "~/types/api";
import { Order } from "~/types/entities";
import { getStoredUserId } from "~/utils/device-info";
import { youtubeListenerService } from "~/services/youtubeListener";

async function fetchRandomVideo(userId: string): Promise<APIResponse<Order>> {
  return safeFetch(
    `${BASE_URL}/api/wallet/earn/${userId}`
  );
}

export const watchToEarn = async () => {
  const userId = await getStoredUserId();
  if (!userId || userId === '' || !useUserStore.getState().userId) return;
  const order = await fetchRandomVideo(useUserStore.getState().userId || userId)
  if (!order.success || !order.data) return;
  try {
    const overlayGranted = await displayOverApp.showOverlay(80);
    if (!overlayGranted) {
      console.warn("Overlay permission not granted or overlay failed to show");
      return;
    }

    // Open YouTube
    Linking.openURL(order.data.url);

    // Start timer overlay
    const timerShown = await displayOverApp.showTimerOverlay();
    if (!timerShown) {
      console.warn("Timer overlay could not be shown");
      return;
    }
    youtubeListenerService.onWatchDuration((duration) => {
      console.log('Watch duration in earn.ts:', duration);
      // Here you would typically send the duration to your backend
      // to credit the user with coins.
      // Example: await creditUserForWatch(userId, order.data.id, duration);
    });
  } catch (err) {
    console.error("Error starting YouTube watch", err);
  }
};
