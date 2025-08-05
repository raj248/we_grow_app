import { create } from 'zustand';
import { Transaction } from '~/types/entities';
import { fetchTransactionHistory } from '~/api/transactions';

type State = {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
};

type Actions = {
  loadTransactions: (userId: string) => Promise<void>;
  clearTransactions: () => void;
};

export const useTransactionStore = create<State & Actions>((set) => ({
  transactions: [],
  loading: false,
  error: null,

  loadTransactions: async (userId) => {
    set({ loading: true, error: null });
    try {
      const res = await fetchTransactionHistory(userId);
      if (res.success) {
        set({ transactions: res.data || [] });
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
}));
