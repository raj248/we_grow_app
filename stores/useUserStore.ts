// stores/useUserStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { fetchWalletBalance } from '~/lib/api/api';

interface UserState {
  userId: string | null;
  coins: number;
  fcmToken?: string;
  loading: boolean;
  error: string | null;
  lastFetched?: number;

  setloading: (loading: boolean) => void;
  setError: (error: string) => void;
  setLastFetched: (lastFetched: number) => void;

  refreshCoins: () => Promise<void>;

  setUserId: (id: string) => void;
  setCoins: (coins: number) => void;
  updateCoins: (delta: number) => void;
  setFcmToken: (token: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: null,
      coins: 0,
      fcmToken: undefined,
      loading: false,
      error: null,
      lastFetched: undefined,

      setloading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: false }),
      setLastFetched: (lastFetched) => set({ lastFetched }),

      refreshCoins: async () => {
        set({ loading: true, error: null });
        try {
          const userId = get().userId;
          if (!userId) {
            console.log('User ID not found');
            return;
          }
          const res = await fetchWalletBalance(userId);
          if (res.success && res.data) {
            set({ coins: res.data.balance, lastFetched: res.lastUpdated, loading: false });
          } else {
            set({ error: res.error || 'Failed to fetch coins', loading: false });
          }
        } catch (err: any) {
          set({ error: err.message || 'Error refreshing coins', loading: false });
        }
      },

      setUserId: (id) => set({ userId: id }),
      setCoins: (coins) => set({ coins }),
      updateCoins: (delta) => set((state) => ({ coins: state.coins + delta })),
      setFcmToken: (token) => set({ fcmToken: token }),

      reset: () =>
        set({
          userId: null,
          coins: 0,
          fcmToken: undefined,
        }),
    }),
    {
      name: 'user-storage', // localStorage/AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
      version: 1, // a migration will be triggered if the version differs
    }
  )
);
