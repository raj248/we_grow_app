import { safeFetch, BASE_URL } from "~/lib/api";
import { APIResponse } from "~/types/api";
import { PurchaseOption, Transaction, Wallet } from "~/types/entities";

interface PurchasePayload {
  userId: string;
  productId: string;
  purchaseToken: string;
}

export async function getAllPurchaseOptions(): Promise<APIResponse<PurchaseOption[]>> {
  return safeFetch(`${BASE_URL}/api/purchase-options`);
}

export async function makePurchase(
  payload: PurchasePayload
): Promise<APIResponse<{ wallet: Wallet; transaction: Transaction }>> {
  return safeFetch(`${BASE_URL}/api/wallet/purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
