// stores/useUserStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  userId: string | null;
  coins: number;
  fcmToken?: string;
  setUserId: (id: string) => void;
  setCoins: (coins: number) => void;
  updateCoins: (delta: number) => void;
  setFcmToken: (token: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      coins: 0,
      fcmToken: undefined,

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
    }
  )
);
