import type { APIResponse } from "~/types/api"
import { PurchaseOption } from "~/types/entities";

const BASE_URL = process.env.EXPO_PUBLIC_API_SERVER_URL;

async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ success: boolean; error?: string; data?: T }> {
  console.log(`Fetching ${url}`);
  try {
    const res = await fetch(url, options);
    const result = await res.json();

    if (!res.ok || !result.success) {
      console.error(`API error (${url}):`, result.error ?? res.statusText);
      return { success: false, error: result.error ?? res.statusText };
    }

    return result;
  } catch (error) {
    console.error(`Fetch error (${url}):`, error);
    return { success: false, error: (error as Error).message ?? "Unknown error" };
  }
}

// ------------------- User --------------------

export async function registerUser(userId: string, fcmToken?: string) {
  return safeFetch<APIResponse<{ id: string; userId: string; fcmToken?: string }>>(
    `${BASE_URL}/api/user`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, fcmToken }),
    }
  );
}
export async function updateFcmToken(userId: string, fcmToken: string) {
  return safeFetch<APIResponse<{ id: string; fcmToken: string }>>(
    `${BASE_URL}/api/user/${userId}/fcm`,
    {
      method: "PATCH", // ✅ Changed from PUT to PATCH
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fcmToken }),
    }
  );
}
export async function updateLastActive(userId: string) {
  return safeFetch<APIResponse<{ id: string; lastActiveAt: string }>>(
    `${BASE_URL}/api/user/${userId}/last-active`,
    {
      method: "PATCH",
    }
  );
}

export async function fetchActiveUserCount() {
  return safeFetch<number>(`${BASE_URL}/api/user/active`);
}

// ------------------- Order / Purchase Options --------------------

export async function createPurchaseOption(payload: {
  coins: number;
  googleProductId: string;
}) {
  return safeFetch<APIResponse<{
    id: string;
    coins: number;
    googleProductId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>>(`${BASE_URL}/api/purchase-options`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getAllPurchaseOptions(): Promise<APIResponse<PurchaseOption[]>> {
  return safeFetch(`${BASE_URL}/api/purchase-options`);
}

export async function getPurchaseOptionById(id: string): Promise<APIResponse<PurchaseOption>> {
  return safeFetch(`${BASE_URL}/api/purchase-options/${id}`);
}

export async function updatePurchaseOption(id: string, payload: {
  coins?: number;
  googleProductId?: string;
  isActive?: boolean;
}): Promise<APIResponse<PurchaseOption>> {
  return safeFetch(`${BASE_URL}/api/purchase-options/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deletePurchaseOption(id: string): Promise<APIResponse<PurchaseOption>> {
  return safeFetch(
    `${BASE_URL}/api/purchase-options/${id}`,
    {
      method: "DELETE",
    }
  );
}
