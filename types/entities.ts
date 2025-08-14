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

export type BoostPlan = {
  id: string;
  type: "VIEW" | "LIKE";
  title: string;
  description: string | null;
  price: number;
  views: number;
  likes: number;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export type Order = {
  id: string;
  userId: string;
  planId: string;
  url: string;
  completedCount: number;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  boostPlan: BoostPlan;
  videoTitle?: string;
  videoThumbnail?: string;
};