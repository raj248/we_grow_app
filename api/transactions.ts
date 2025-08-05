import { safeFetch, BASE_URL } from "~/lib/api";
import { APIResponse } from "~/types/api";
import { Transaction } from "~/types/entities";

export async function fetchTransactionHistory(userId: string): Promise<APIResponse<Transaction[]>> {
  return safeFetch(
    `${BASE_URL}/api/transactions/user/${userId}`
  );
}