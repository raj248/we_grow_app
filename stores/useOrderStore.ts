// stores/useOrderStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getOrders } from '~/lib/api/orders';
import { Order } from '~/types/entities';

type State = {
  orders: Order[];
  loading: boolean;
  error: string | null;
  lastFetched?: number;
}

type Actions = {
  loadOrders: () => Promise<void>;
  clearOrders: () => void;
}

export const useOrderStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      orders: [],
      loading: false,
      error: null,
      lastFetched: undefined,

      loadOrders: async () => {
        set({ loading: true, error: null });
        try {
          // const res = await getOrders(get().lastFetched);
          const res = await getOrders();
          if (res.code === 304) {
            console.log("Data is unchanged, skipping fetch")
            set({ loading: false });
            return;
          }
          if (res.success) {
            set({ orders: res.data || [], lastFetched: Date.now() });
          } else {
            set({ error: res.error || 'Failed to load orders' });
          }
        } catch (err) {
          set({ error: 'Unexpected error occurred' });
        } finally {
          set({ loading: false });
        }
      },

      clearOrders: () => {
        set({ orders: [], error: null, lastFetched: undefined });
      },
    }),
    {
      name: 'order-storage', // unique name
      // storage: () => ({
      //   setItem: (name, value) => {
      //     return localStorage.setItem(name, value);
      //   },
      //   getItem: (name) => {
      //     return localStorage.getItem(name);
      //   },
      //   removeItem: (name) => {
      //     return localStorage.removeItem(name);
      //   },
      // }),
      version: 1, // a migration will be triggered if the version differs
    }
  )
);