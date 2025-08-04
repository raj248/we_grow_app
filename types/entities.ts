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