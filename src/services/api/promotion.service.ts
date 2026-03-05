/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api";

export interface Promotion {
  _id: string;
  tab: string; // manual, auto, crypto
  bonusName: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  minDeposit?: number;
  maxBonus?: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionData {
  tab: string;
  bonusName: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  minDeposit?: number;
  maxBonus?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export const promotionService = {
  // Get all promotions
  async getAllPromotions() {
    const response = await api.get("/promotions");
    return response?.data;
  },

  // Get promotions by tab (for frontend display)
  async getPromotionsByTab(tab: string) {
    const response = await api.get(`/promotions/tab/${tab}`);
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