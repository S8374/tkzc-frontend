/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api";

export interface Wallet {
  _id: string;
  user: string;
  balance: number;
  walletPassword?: string;
  walletAddress?: string;
  protocol?: 'TRC20' | 'ERC20' | 'BEP20';
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateWalletData {
  walletPassword?: string;
  walletAddress?: string;
  protocol?: 'TRC20' | 'ERC20' | 'BEP20';
}

export const walletService = {
  // Get current user's wallet
  async getMyWallet() {
    const response = await api.get("/user/wallet");
    return response?.data;
  },

  // Update wallet
  async updateWallet(data: UpdateWalletData) {
    const response = await api.patch("/user/wallet/update", data);
    return response?.data;
  },
};