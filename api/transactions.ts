import { safeFetch, BASE_URL } from "~/lib/api";
import { APIResponse } from "~/types/api";
import { Transaction } from "~/types/entities";

export async function fetchTransactionHistory(userId: string, timestamp?: number): Promise<APIResponse<Transaction[]>> {
  const url = new URL(`${BASE_URL}/api/transactions/user/${userId}`);
  if (timestamp) {
    url.searchParams.set("timestamp", timestamp.toString());
  }

  return safeFetch(url.toString());
}