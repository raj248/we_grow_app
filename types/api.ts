// src/types/api.ts

export interface APIResponse<T> {
  success: boolean;
  lastUpdated?: number;
  source?: string;
  error?: string;
  data?: T;
  code?: number;
}
