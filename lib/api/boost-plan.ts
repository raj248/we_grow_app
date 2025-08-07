import { safeFetch, BASE_URL } from "~/lib/api/api";
import { APIResponse } from "~/types/api";
import { BoostPlan } from "~/types/entities";

interface CreateBoostPlanPayload {
  type: "VIEW" | "LIKE";
  title: string;
  description?: string;
  price: number;
  views?: number;
  likes?: number;
}

interface UpdateBoostPlanPayload {
  type?: "VIEW" | "LIKE";
  title?: string;
  description?: string;
  price?: number;
  views?: number;
  likes?: number;
  isActive?: boolean;
}

// GET all boost plans (optionally filtered by type)
export async function getAllBoostPlans(type?: "VIEW" | "LIKE"): Promise<APIResponse<BoostPlan[]>> {
  const url = new URL(`${BASE_URL}/api/boost-plans`);
  if (type) {
    url.searchParams.set("type", type);
  }
  return safeFetch(url.toString());
}

// GET a specific plan by ID
export async function getBoostPlanById(id: string): Promise<APIResponse<BoostPlan>> {
  return safeFetch(`${BASE_URL}/api/boost-plans/${id}`);
}

// CREATE a new boost plan
export async function createBoostPlan(payload: CreateBoostPlanPayload): Promise<APIResponse<BoostPlan>> {
  return safeFetch(`${BASE_URL}/api/boost-plans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

// UPDATE an existing boost plan
export async function updateBoostPlan(id: string, payload: UpdateBoostPlanPayload): Promise<APIResponse<BoostPlan>> {
  return safeFetch(`${BASE_URL}/api/boost-plans/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

// DELETE / deactivate a plan
export async function deactivateBoostPlan(id: string): Promise<APIResponse<{ success: boolean }>> {
  return safeFetch(`${BASE_URL}/api/boost-plans/${id}`, {
    method: "DELETE",
  });
}
