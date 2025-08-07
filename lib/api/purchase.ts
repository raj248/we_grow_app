import { safeFetch, BASE_URL } from "~/lib/api/api";
import { APIResponse } from "~/types/api";
import { PurchaseOption, Transaction, Wallet } from "~/types/entities";

interface PurchasePayload {
  userId: string;
  productId: string;
  purchaseToken: string;
}

type MakeOrderInput = {
  userId: string;
  planId: string;
};

type MakeOrderResponse = {
  success: boolean;
  message: string;
  order: {
    id: string;
    userId: string;
    planId: string;
    status: string;
    createdAt: string;
  };
  transaction: {
    id: string;
    userId: string;
    amount: number;
    type: string;
    source: string;
    status: string;
    transactionId: string;
    createdAt: string;
  };
  wallet: {
    id: string;
    userId: string;
    balance: number;
    updatedAt: string;
  };
};

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

export async function makeOrder(input: MakeOrderInput): Promise<MakeOrderResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add Auth token if required
    },
    body: JSON.stringify(input),
    credentials: 'include', // if cookies/session required
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to make order');
  }

  return res.json();
}

export const createOrder = async (userId: string, planId: string) => {
  const response = await fetch(`${BASE_URL}/api/wallet/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, planId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create order");
  }

  return response.json();
};