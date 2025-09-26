export type PurchaseOption = {
  id: string;
  coins: number;
  originalPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // play store provided
  salePrice: string;
  title: string;
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
};

export type TransactionType = 'CREDIT' | 'DEBIT';
export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export type BoostPlan = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  views: number;
  reward: number;
  duration: number;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export type Order = {
  id: string;
  userId: string;
  planId: string;
  url: string;
  viewCount: number;
  completedViewCount: number;
  completedCount: number;
  status: OrderStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  boostPlan: BoostPlan;
  videoTitle?: string;
  videoThumbnail?: string;
  duration?: number;
  token?: string;
};

export type OrderStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type randomVideo = {
  url: string;
  token: string;
  duration: number;
  reward: number;
  videoTitle?: string;
  videoThumbnail?: string;
};
