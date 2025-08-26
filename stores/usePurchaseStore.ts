import { create } from 'zustand';
import { getAllPurchaseOptions, makeTopup } from '~/lib/api/purchase';
import type { PurchaseOption } from '~/types/entities';
import type { APIResponse } from '~/types/api';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type State = {
  purchaseOptions: PurchaseOption[];
  loading: boolean;
  error: string | null;
  lastFetched?: number;
};

type Actions = {
  fetchPurchaseOptions: () => Promise<void>;
  purchase: (
    userId: string,
    productId: string,
    purchaseToken: string
  ) => Promise<APIResponse<{ wallet: any; transaction: any }>>;
};

export const usePurchaseStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      purchaseOptions: [],
      loading: false,
      error: null,
      lastFetched: undefined,

      fetchPurchaseOptions: async () => {
        set({ loading: true, error: null });
        const res = await getAllPurchaseOptions(get().lastFetched);

        // Exit early if response indicates data is unchanged
        if (res.code === 304) {
          console.log('Data is unchanged, skipping fetch');
          set({ loading: false });
          return;
        }

        if (res.success && res.data) {
          set({ purchaseOptions: res.data, loading: false, lastFetched: res.lastUpdated });
        } else {
          set({
            error: res.error ?? 'Failed to load purchase options',
            loading: false,
          });
        }
      },

      purchase: async (userId, productId, purchaseToken) => {
        set({ loading: true, error: null });
        const res = await makeTopup({ userId, productId, purchaseToken });
        if (res.success && res.data) {
          // optional: update wallet or state if needed
          return res;
        } else {
          set({ error: res.error ?? 'Failed to purchase', loading: false });
        }
        return res;
      },
    }),
    {
      name: 'purchase-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage),

      version: 1, // a migration will be triggered if the version differs
    }
  )
);
