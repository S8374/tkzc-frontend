/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api";

export type WithdrawStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface WithdrawRequest {
  _id: string;
  user?: {
    _id: string;
    name?: string;
    email?: string;
  };
  userName: string;
  userEmail?: string;
  paymentMethod: string;
  accountNumber: string;
  amount: number;
  status: WithdrawStatus;
  adminNote?: string;
  adminSenderNumber?: string;
  adminTransactionId?: string;
  processedAt?: string;
  processedBy?: {
    _id: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateWithdrawRequestData {
  paymentMethod: string;
  accountNumber: string;
  amount: number;
}

export interface ProcessWithdrawData {
  adminNote?: string;
  adminSenderNumber?: string;
  adminTransactionId?: string;
}

export const withdrawRequestService = {
  async createWithdrawRequest(data: CreateWithdrawRequestData) {
    const response = await api.post("/withdraw-requests", data);
    return response?.data;
  },

  async getUserWithdrawRequests(params?: { page?: number; limit?: number; status?: string }) {
    const response = await api.get("/withdraw-requests/my-requests", { params });
    return response?.data;
  },

  async cancelWithdrawRequest(id: string) {
    const response = await api.patch(`/withdraw-requests/${id}/cancel`);
    return response?.data;
  },

  async getAllWithdrawRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await api.get("/withdraw-requests/admin/all", { params });
    return response?.data;
  },

  async getSingleWithdrawRequest(id: string) {
    const response = await api.get(`/withdraw-requests/admin/${id}`);
    return response?.data;
  },

  async approveWithdrawRequest(id: string, data: ProcessWithdrawData) {
    const response = await api.patch(`/withdraw-requests/admin/${id}/approve`, data);
    return response?.data;
  },

  async rejectWithdrawRequest(id: string, data: ProcessWithdrawData) {
    const response = await api.patch(`/withdraw-requests/admin/${id}/reject`, data);
    return response?.data;
  },
};
