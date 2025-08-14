import { create } from 'zustand';
import { Transaction } from '~/types/entities';
import { fetchTransactionHistory } from '~/lib/api/transactions';
import { persist } from 'zustand/middleware';

type State = {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  lastFetched?: number;
};

type Actions = {
  loadTransactions: (userId: string) => Promise<void>;
  clearTransactions: () => void;
};

export const useTransactionStore = create<State & Actions>()
  (persist(
    (set, get) => ({
      transactions: [],
      loading: false,
      error: null,
      lastFetched: undefined,

      loadTransactions: async (userId) => {
        set({ loading: true, error: null });
        try {
          // const res = await fetchTransactionHistory(userId, get().lastFetched);
          const res = await fetchTransactionHistory(userId);
          if (res.code === 304) {
            console.log("Data is unchanged, skipping fetch")
            set({ loading: false });
            return;
          }
          if (res.success) {
            set({ transactions: res.data || [], lastFetched: res.lastUpdated });
          } else {
            set({ error: res.error || 'Failed to load transactions' });
          }
        } catch (err) {
          set({ error: 'Unexpected error occurred' });
        } finally {
          set({ loading: false });
        }
      },

      clearTransactions: () => {
        set({ transactions: [], error: null });
      },
    }),
    {
      name: 'transaction-storage', // unique name
      // getStorage: () => ({
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
  )
