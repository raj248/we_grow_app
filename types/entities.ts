export type PurchaseOption = {
  id: string;
  coins: number;
  googleProductId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Wallet = {
  id: string;
  userId: string;
  balance: number;
  updatedAt: string;
  createdAt: string;
};

export type Transaction = {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  source: string;
  transactionId: string | null;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = 'CREDIT' | 'DEBIT';
export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export type Order = {
  id: string;
  userId: string;
  planId: string;
  url: string;
  status: "PENDING" | "COMPLETED" | "FAILED"; // Extend if you have more statuses
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export interface BoostPlan {
  id: string;
  type: "VIEW" | "LIKE";
  title: string;
  description?: string;
  price: number;
  views: number;
  likes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

