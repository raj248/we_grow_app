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
  topUpId: string | null;
  amount: number;
  source: string;
  transactionId: string | null;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type TransactionType = 'CREDIT' | 'DEBIT';
export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';

export type BoostPlan = {
  id: string;
  title: string;
  duration: number;
  price: number;
  reward: number;
  description: string | null;

  views: number;
  likes: number;
  subscribers: number;

  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export interface Order {
  id: string;
  userId: string;
  planId: string;
  url: string;

  initialViewCount: number;
  initialLikeCount: number;
  initialSubscriberCount: number;

  finalViewCount: number;
  finalLikeCount: number;
  finalSubscriberCount: number;

  progressViewCount: number;
  progressLikeCount: number;
  progressSubscriberCount: number;

  completedCount: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;

  videoTitle?: string;
  videoThumbnail?: string;
  duration?: number;
  token?: string;

  boostPlan?: BoostPlan;
}

export type OrderStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type randomVideo = {
  url: string;
  token: string;
  duration: number;
  reward: number;
  videoTitle?: string;
  videoThumbnail?: string;
};
