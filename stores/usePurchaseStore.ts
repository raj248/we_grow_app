import { create } from 'zustand';
import { getAllPurchaseOptions, makeTopup } from '~/lib/api/purchase';
import type { PurchaseOption } from '~/types/entities';
import type { APIResponse } from '~/types/api';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, PurchaseAndroid } from 'expo-iap';

type State = {
  purchaseOptions: PurchaseOption[];
  loading: boolean;
  error: string | null;
  lastFetched?: number;
};

type Actions = {
  fetchPurchaseOptions: (soft?: boolean) => Promise<void>;
  purchase: (
    userId: string,
    productId: string,
    purchaseToken: string
  ) => Promise<APIResponse<{ wallet: any; transaction: any }>>;
  updatePurchaseOptions: (options: Product[]) => void;
  clearStore: () => void;
};

export const usePurchaseStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      purchaseOptions: [],
      loading: false,
      error: null,
      lastFetched: undefined,

      fetchPurchaseOptions: async (soft = true) => {
        set({ loading: true, error: null });
        const res = await getAllPurchaseOptions(soft ? get().lastFetched : undefined);

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
      updatePurchaseOptions: (options) => {
        const currentOptions = get().purchaseOptions;
        const updatedOptions = currentOptions.map((option) => {
          const product = options.find((p) => p.id === option.id);
          if (product) {
            console.log(`Product found: ${product.price} for ${option.originalPrice}`);
            return {
              ...option,
              salePrice: product.displayPrice,
              title: product.title,
            };
          }
          return option;
        });
        set({ purchaseOptions: updatedOptions });
      },

      clearStore: () => {
        set({ purchaseOptions: [], loading: false, error: null, lastFetched: undefined });
      },
    }),
    {
      name: 'purchase-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage),

      version: 1, // a migration will be triggered if the version differs
    }
  )
);
