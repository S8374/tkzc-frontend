/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api";

export interface CryptoExchange {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CryptoExchangeData {
  name: string;
  slug: string;
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  order?: number;
  isActive?: boolean;
}

export const cryptoExchangeService = {
  // Admin: Get all exchanges
  async getAllExchanges() {
    const response = await api.get("/crypto-exchanges");
    return response?.data;
  },

  // Frontend: Get active exchanges only
  async getActiveExchanges() {
    const response = await api.get("/crypto-exchanges/active");
    return response?.data;
  },

  // Admin: Create exchange
  async createExchange(data: CryptoExchangeData) {
    const response = await api.post("/crypto-exchanges", data);
    return response?.data;
  },

  // Admin: Update exchange
  async updateExchange(id: string, data: Partial<CryptoExchangeData>) {
    const response = await api.patch(`/crypto-exchanges/${id}`, data);
    return response?.data;
  },

  // Admin: Delete exchange
  async deleteExchange(id: string) {
    const response = await api.delete(`/crypto-exchanges/${id}`);
    return response?.data;
  },
};