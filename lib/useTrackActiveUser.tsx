import { AppState } from 'react-native';
import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { updateLastActive } from './api';
import { getStoredUserId } from '~/utils/device-info';

const LAST_SYNC_KEY = 'LAST_ACTIVE_SYNC';

export function useTrackActiveUser(userId: string) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const id = getStoredUserId();
    if (!id) return;
    const sub = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const lastSynced = await AsyncStorage.getItem(LAST_SYNC_KEY);
        const now = Date.now();
        const diff = lastSynced ? now - Number(lastSynced) : Infinity;

        const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours

        if (diff > cooldownMs) {
          // ✅ Send to server
          updateLastActive(userId);
          await AsyncStorage.setItem(LAST_SYNC_KEY, String(now));
        }
      }

      appState.current = nextAppState;
    });

    return () => sub.remove();
  }, []);
}
