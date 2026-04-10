/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api";
import { walletService } from "./wallet.api";

export interface UpdateCurrentUserData {
  email?: string;
  name?: string;
  phone?: string;
  address?: string;
  currentPassword?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateWithdrawPasswordData {
  newWalletPassword: string;
  currentWalletPassword?: string;
}

export interface UpdateWalletAddressData {
  walletAddress: string;
  protocol?: "TRC20" | "ERC20" | "BEP20";
  currentWalletPassword: string;
}

export interface DeleteWalletAddressData {
  currentWalletPassword: string;
}

export const accountService = {
  async updateCurrentUser(data: UpdateCurrentUserData) {
    const response = await api.patch("/user/me", data);
    return response?.data;
  },

  async changeLoginPassword(data: ChangePasswordData) {
    const response = await api.patch("/user/password", data);
    return response?.data;
  },

  async setWithdrawPassword(data: UpdateWithdrawPasswordData) {
    const response = await walletService.updateWallet({
      newWalletPassword: data.newWalletPassword,
      currentWalletPassword: data.currentWalletPassword,
    });
    return response?.data;
  },

  async setWalletAddress(data: UpdateWalletAddressData) {
    const response = await walletService.updateWallet(data);
    return response?.data;
  },

  async deleteWalletAddress(data: DeleteWalletAddressData) {
    const response = await walletService.updateWallet({
      currentWalletPassword: data.currentWalletPassword,
      clearWalletAddress: true,
    });
    return response?.data;
  },

  async getWallet() {
    const response = await walletService.getMyWallet();
    return response?.data;
  },
};
