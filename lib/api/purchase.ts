import { PurchaseAndroid } from 'expo-iap';
import { safeFetch, BASE_URL } from '~/lib/api/api';
import { useUserStore } from '~/stores/useUserStore';
import { APIResponse } from '~/types/api';
import { PurchaseOption, Transaction, Wallet } from '~/types/entities';

interface PurchasePayload {
  userId: string;
  productId: string;
  purchaseToken: string;
}

type MakeOrderInput = {
  userId: string;
  planId: string;
  url: string;
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

export async function getAllPurchaseOptions(
  timestamp?: number
): Promise<APIResponse<PurchaseOption[]>> {
  const url = new URL(`${BASE_URL}/api/topup-options`);

  if (timestamp) {
    url.searchParams.set('timestamp', timestamp.toString());
  }

  return safeFetch(url.toString());
}

export async function makeTopup(
  payload: PurchasePayload
): Promise<APIResponse<{ wallet: Wallet; transaction: Transaction }>> {
  return safeFetch(`${BASE_URL}/api/wallet/topup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

// validateReciept
export async function validateReceipt(purchase: PurchaseAndroid): Promise<APIResponse<boolean>> {
  const { productId, purchaseToken, transactionId, packageNameAndroid } = purchase;
  const userId = useUserStore.getState().userId;

  if (!userId) Promise.reject('User not logged in');

  return safeFetch(`${BASE_URL}/api/topup-options/validate-receipt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, purchaseToken, transactionId, packageNameAndroid, userId }),
  });
}
// export  = async (receipt: string) => {}

export const createOrder = async (
  userId: string,
  planId: string,
  link: string
): Promise<APIResponse<MakeOrderResponse>> => {
  const url = `${BASE_URL}/api/order/`;
  console.log(`Creating order for ${userId} with plan ${planId} and video ${link}`);
  return safeFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, planId, link }),
  });
};

export async function processPurchase(purchase: PurchaseAndroid) {
  if (!purchase) return;
  if (purchase.purchaseState === 'purchased') {
    await validateReceipt(purchase);
  }
}
