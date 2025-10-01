import { create } from 'zustand';
import { getAllPurchaseOptions, makeTopup } from '~/lib/api/purchase';
import type { PurchaseOption } from '~/types/entities';
import type { APIResponse } from '~/types/api';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProducts, getAvailablePurchases, Product, PurchaseAndroid, useIAP } from 'expo-iap';

type State = {
  purchaseOptions: PurchaseOption[];
  loading: boolean;
  error: string | null;
  lastFetched?: number;
};

type Actions = {
  fetchPurchaseOptions: (soft?: boolean) => Promise<PurchaseOption[]>;
  purchase: (
    userId: string,
    productId: string,
    purchaseToken: string
  ) => Promise<APIResponse<{ wallet: any; transaction: any }>>;
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

        if (res.code === 304) {
          console.log('Data unchanged, skipping fetch');
          set({ loading: false });
          return get().purchaseOptions;
        }

        if (res.success && res.data) {
          const serverOptions = res.data;
          const productIds = serverOptions.map((option) => option.id);

          let products: Product[] = [];
          if (productIds?.length) {
            try {
              products = (await fetchProducts({ skus: productIds, type: 'all' })) ?? [];
              getAvailablePurchases().then((purchases) => {
                console.log('Available purchases:', purchases);
              });
            } catch (err) {
              console.error('Error fetching IAP products:', err);
              set({ error: 'Error fetching IAP products', loading: false });
            } finally {
              set({ loading: false });
            }
          }

          // Merge server + IAP details in one step
          const mergedOptions = serverOptions.map((option) => {
            const product = products.find((p) => p.id === option.id);
            return product
              ? {
                  ...option,
                  salePrice: product.displayPrice,
                  title: product.title,
                }
              : null;
          });
          // remove null values
          const filteredOptions = mergedOptions.filter(
            (option): option is PurchaseOption => option !== null
          );
          // console.log('Filtered options:', filteredOptions);
          set({
            purchaseOptions: filteredOptions,
            loading: false,
            lastFetched: res.lastUpdated,
          });

          return filteredOptions;
        } else {
          set({
            error: res.error ?? 'Failed to load purchase options',
            loading: false,
          });
          return [];
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
