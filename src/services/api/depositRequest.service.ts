/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api";

export interface DepositRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  userName: string;
  userEmail?: string;
  depositType: 'manual' | 'auto' | 'crypto';
  paymentMethod: string;
  amount: number;
  promotionId?: string;
  promotionName?: string;
  promotionType?: 'PERCENT' | 'FIXED';
  promotionValue?: number;
  bonusAmount?: number;
  turnoverMultiplier?: number;
  turnoverRequired?: number;
  formData: Record<string, any>;
  screenshot?: string;
  transactionId?: string;
  senderNumber?: string;
  walletAddress?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  adminNote?: string;
  processedAt?: string;
  processedBy?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DepositRequestData {
  depositType: 'manual' | 'auto' | 'crypto';
  paymentMethod: string;
  amount: number;
  promotionId?: string;
  promotionName?: string;
  promotionType?: 'PERCENT' | 'FIXED';
  promotionValue?: number;
  turnoverMultiplier?: number;
  turnoverRequired?: number;
  formData: Record<string, any>;
  screenshot?: string;
  transactionId?: string;
  senderNumber?: string;
  walletAddress?: string;
}

export const depositRequestService = {
  // User: Create deposit request
  async createRequest(data: DepositRequestData) {
    const response = await api.post("/deposit-requests", data);
    return response?.data;
  },

  // User: Get user's deposit requests
  async getUserRequests(params?: { page?: number; limit?: number; status?: string }) {
    const response = await api.get("/deposit-requests/my-requests", { params });
    return response?.data;
  },

  // Admin: Get all deposit requests
  async getAllRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
    depositType?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await api.get("/deposit-requests/admin/all", { params });
    return response?.data;
  },

  // Admin: Get single request
  async getRequestById(id: string) {
    const response = await api.get(`/deposit-requests/admin/${id}`);
    return response?.data;
  },

  // Admin: Approve request
  async approveRequest(id: string, adminNote?: string, bonusAmount?: number, turnoverRequired?: number) {
    const response = await api.patch(`/deposit-requests/admin/${id}/approve`, { 
      adminNote, 
      bonusAmount, 
      turnoverRequired 
    });
    return response?.data;
  },

  // Admin: Reject request
  async rejectRequest(id: string, adminNote?: string) {
    const response = await api.patch(`/deposit-requests/admin/${id}/reject`, { adminNote });
    return response?.data;
  },

  // Admin: Delete request
  async deleteRequest(id: string) {
    const response = await api.delete(`/deposit-requests/admin/${id}`);
    return response?.data;
  },
};