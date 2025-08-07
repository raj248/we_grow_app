import { safeFetch, BASE_URL } from "~/lib/api/api";
import { APIResponse } from "~/types/api";
import { PurchaseOption, Transaction, Wallet } from "~/types/entities";

interface PurchasePayload {
  userId: string;
  productId: string;
  purchaseToken: string;
}

export async function getAllPurchaseOptions(timestamp?: number): Promise<APIResponse<PurchaseOption[]>> {
  const url = new URL(`${BASE_URL}/api/topup-options`);

  if (timestamp) {
    url.searchParams.set("timestamp", timestamp.toString());
  }

  return safeFetch(url.toString());
}

export async function makeTopup(
  payload: PurchasePayload
): Promise<APIResponse<{ wallet: Wallet; transaction: Transaction }>> {
  return safeFetch(`${BASE_URL}/api/wallet/topup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

