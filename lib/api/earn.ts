import { Linking } from "react-native";
import { safeFetch, BASE_URL } from "~/lib/api/api";
import displayOverApp from "~/modules/display-over-app";
import { useUserStore } from "~/stores/useUserStore";
import { APIResponse } from "~/types/api";
import { getStoredUserId } from "~/utils/device-info";
import { youtubeListenerService } from "~/services/youtubeListener";
import Toast from "react-native-toast-message";

async function fetchRandomVideo(userId: string): Promise<APIResponse<{ url: string, token: string }>> {
  return safeFetch(
    `${BASE_URL}/api/order/earn/${userId}`
  );
}
async function fetchReward(token: string, duration: number): Promise<APIResponse<{ message: string, rewardAmount: number }>> {
  return safeFetch(`${BASE_URL}/api/order/reward`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, duration }),
  })
}
async function creditUserForWatch(token: string, duration: number) {

  const reward = await fetchReward(token, duration);
  if (!reward.success || !reward.data) {
    console.error("Failed to fetch reward", reward.error);
    return;
  }

  const { message, rewardAmount } = reward.data;
  console.log(message, rewardAmount);

}
export const watchToEarn = async () => {
  const userId = await getStoredUserId();
  if (!userId || userId === '' || !useUserStore.getState().userId) return;
  const order = await fetchRandomVideo(useUserStore.getState().userId || userId)
  if (!order.success || !order.data) {
    Toast.show({ text1: 'Failed to fetch random video', text2: order.error, type: 'error' });
    return;
  };
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
    youtubeListenerService.removeWatchDurationListener()
    let count = 0
    youtubeListenerService.onWatchDuration((duration) => {
      console.log('Watch duration in earn.ts:', duration, "count: ", ++count);
      // Here you would typically send the duration to your backend
      // to credit the user with coins.
      // Example: await creditUserForWatch(userId, order.data.id, duration);
      order.data && creditUserForWatch(order.data.token, duration);
    });
  } catch (err) {
    console.error("Error starting YouTube watch", err);
  }
};
