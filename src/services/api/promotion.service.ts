/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api";

export interface Promotion {
  _id: string;
  tab: string;
  bonusName: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  minDeposit?: number;
  maxBonus?: number; // ✅ NEW
  bonusPercentage?: number;
  turnoverValue?: number;
  paymentMethodId?: {  // ✅ NEW
    _id: string;
    name: string;
    icon?: string;
  } | string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  iconUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionData {
  tab: string;
  bonusName: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  minDeposit?: number;
  maxBonus?: number; // ✅ NEW
  bonusPercentage?: number;
  turnoverValue?: number;
  paymentMethodId?: string; // ✅ NEW
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  iconUrl?: string;
}

export const promotionService = {
  // Get all promotions
  async getAllPromotions() {
    const response = await api.get("/promotions");
    return response?.data;
  },

  // Get promotions by tab
  async getPromotionsByTab(tab: string) {
    const response = await api.get(`/promotions/tab/${tab}`);
    return response?.data;
  },

  // Get promotions by payment method
  async getPromotionsByPaymentMethod(paymentMethodId: string) {
    const response = await api.get(`/promotions/payment-method/${paymentMethodId}`);
    return response?.data;
  },

  // Create promotion
  async createPromotion(data: PromotionData) {
    const response = await api.post("/promotions", data);
    return response?.data;
  },

  // Update promotion
  async updatePromotion(id: string, data: Partial<PromotionData>) {
    const response = await api.patch(`/promotions/${id}`, data);
    return response?.data;
  },

  // Delete promotion
  async deletePromotion(id: string) {
    const response = await api.delete(`/promotions/${id}`);
    return response?.data;
  },
};