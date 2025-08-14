import { useUserStore } from "~/stores/useUserStore";
import { safeFetch, BASE_URL } from "./api";
import { APIResponse } from "~/types/api";
import { Order } from "~/types/entities";
import { getStoredUserId } from "~/utils/device-info";

export async function getOrders(timestamp?: number): Promise<APIResponse<Order[]>> {
  const userId = useUserStore.getState().userId || await getStoredUserId()
  const url = new URL(`${BASE_URL}/api/order/user/${userId}`);

  if (timestamp) {
    url.searchParams.set("timestamp", timestamp.toString());
  }
  return safeFetch(url.toString());
}