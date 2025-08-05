import { create } from "zustand";
import { getAllPurchaseOptions, makePurchase } from "~/api/purchase";
import type { PurchaseOption } from "~/types/entities";
import type { APIResponse } from "~/types/api";

type State = {
  purchaseOptions: PurchaseOption[];
  loading: boolean;
  error: string | null;
};

type Actions = {
  fetchPurchaseOptions: () => Promise<void>;
  purchase: (userId: string, productId: string, purchaseToken: string) => Promise<APIResponse<{ wallet: any; transaction: any }>>;
};

export const usePurchaseStore = create<State & Actions>((set) => ({
  purchaseOptions: [],
  loading: false,
  error: null,

  fetchPurchaseOptions: async () => {
    set({ loading: true, error: null });
    const res = await getAllPurchaseOptions();
    if (res.success && res.data) {
      set({ purchaseOptions: res.data, loading: false });
    } else {
      set({ error: res.error ?? "Failed to load purchase options", loading: false });
    }
  },

  purchase: async (userId, productId, purchaseToken) => {
    set({ loading: true, error: null });
    const res = await makePurchase({ userId, productId, purchaseToken });
    if (res.success && res.data) {
      // optional: update wallet or state if needed
      return res;
    } else {
      set({ error: res.error ?? "Failed to purchase", loading: false });
    }
    return res;
  },
}));
