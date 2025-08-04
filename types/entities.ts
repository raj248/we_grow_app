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