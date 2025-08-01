import type { APIResponse } from "~/types/api"

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

export async function registerGuestUser(guestId: string, fcmToken?: string) {
  return safeFetch<APIResponse<{ id: string; guestId: string; fcmToken?: string }>>(
    `${BASE_URL}/api/user/guest`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId, fcmToken }),
    }
  );
}
export async function updateFcmToken(userId: string, fcmToken: string) {
  return safeFetch<APIResponse<{ id: string; fcmToken: string }>>(
    `${BASE_URL}/api/user/${userId}/fcm-token`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fcmToken }),
    }
  );
}
