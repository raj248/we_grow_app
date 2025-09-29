import type { APIResponse } from '~/types/api';
import { PurchaseOption, Wallet } from '~/types/entities';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';

// export const BASE_URL = process.env.EXPO_PUBLIC_API_SERVER_URL;
type Extra = {
  BASE_URL: string;
};

const extra = Constants.expoConfig?.extra as Extra;
export const BASE_URL = extra.BASE_URL;

console.log('BASE_URL =', BASE_URL);

export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ success: boolean; error?: string; data?: T; code?: number }> {
  console.log(`Fetching ${url}`);
  try {
    const res = await fetch(url, options);

    if (res.status === 304) {
      return {
        success: true,
        error: 'Unchanged',
        code: 304,
      };
    }
    const result = await res.json();

    if (!res.ok || !result.success) {
      console.error(`API error (${url}):`, result.error ?? res.statusText);
      return { success: false, error: result.error ?? res.statusText };
    }

    return result;
  } catch (error) {
    console.error(`Fetch error (${url}):`, error);
    Toast.show({ text1: 'Network Error', text2: (error as Error).message, type: 'error' });
    return { success: false, error: (error as Error).message ?? 'Unknown error' };
  }
}

// ------------------- User --------------------

export async function registerUser(userId: string, fcmToken?: string) {
  return safeFetch<APIResponse<{ id: string; userId: string; fcmToken?: string }>>(
    `${BASE_URL}/api/user`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, fcmToken }),
    }
  );
}
export async function updateFcmToken(userId: string, fcmToken: string) {
  return safeFetch<APIResponse<{ id: string; fcmToken: string }>>(
    `${BASE_URL}/api/user/${userId}/fcm`,
    {
      method: 'PATCH', // ✅ Changed from PUT to PATCH
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fcmToken }),
    }
  );
}
export async function updateLastActive(userId: string) {
  return safeFetch<APIResponse<{ id: string; lastActiveAt: string }>>(
    `${BASE_URL}/api/user/${userId}/last-active`,
    {
      method: 'PATCH',
    }
  );
}

// ------------------- Wallet -------------------

export async function fetchWalletBalance(userId: string): Promise<APIResponse<Wallet>> {
  return safeFetch(`${BASE_URL}/api/wallet/${userId}`);
}

// SERVER SIDE API
export async function fetchActiveUserCount() {
  return safeFetch<number>(`${BASE_URL}/api/user/active`);
}

// ------------------- Order / Purchase Options --------------------

// SERVER SIDE API
export async function createPurchaseOption(payload: { coins: number; googleProductId: string }) {
  return safeFetch<
    APIResponse<{
      id: string;
      coins: number;
      googleProductId: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }>
  >(`${BASE_URL}/api/purchase-options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
// SERVER SIDE API
export async function getPurchaseOptionById(id: string): Promise<APIResponse<PurchaseOption>> {
  return safeFetch(`${BASE_URL}/api/purchase-options/${id}`);
}
// SERVER SIDE API
export async function updatePurchaseOption(
  id: string,
  payload: {
    coins?: number;
    googleProductId?: string;
    isActive?: boolean;
  }
): Promise<APIResponse<PurchaseOption>> {
  return safeFetch(`${BASE_URL}/api/purchase-options/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
// SERVER SIDE API
export async function deletePurchaseOption(id: string): Promise<APIResponse<PurchaseOption>> {
  return safeFetch(`${BASE_URL}/api/purchase-options/${id}`, {
    method: 'DELETE',
  });
}
