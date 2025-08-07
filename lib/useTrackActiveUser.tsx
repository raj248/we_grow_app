import { AppState } from 'react-native';
import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateLastActive } from './api/api';
import { getStoredUserId } from '~/utils/device-info';

const LAST_SYNC_KEY = 'LAST_ACTIVE_SYNC';
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useTrackActiveUser() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    let subscription: ReturnType<typeof AppState.addEventListener>;

    const tryUpdateLastActive = async () => {
      const id = await getStoredUserId();
      if (!id) return;

      const lastSynced = await AsyncStorage.getItem(LAST_SYNC_KEY);
      const now = Date.now();
      const diff = lastSynced ? now - Number(lastSynced) : Infinity;

      if (diff > COOLDOWN_MS) {
        await updateLastActive(id);
        await AsyncStorage.setItem(LAST_SYNC_KEY, String(now));
        console.log("✅ Updated Active User");
      } else {
        console.log("⏳ Active user update on cooldown. Next update in:", (COOLDOWN_MS - diff) / 1000 / 60 / 60, "hours");
      }
    };

    (async () => {
      console.log("🚀 Initializing Active User Check...");
      await tryUpdateLastActive(); // 🔥 Run once at app startup

      subscription = AppState.addEventListener('change', async (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          console.log("📱 App returned to foreground");
          await tryUpdateLastActive(); // 🔁 Run on foreground
        }

        appState.current = nextAppState;
      });
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);
}
