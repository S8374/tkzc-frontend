/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api";

export interface Support {
  _id: string;
  label: string;
  icon: string;
  link: string;
  buttonText: string;
  buttonUrl: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportData {
  label: string;
  icon: string;
  link: string;
  buttonText: string;
  buttonUrl: string;
  order?: number;
  isActive?: boolean;
}

// Icon name to component mapping (for frontend)
export const iconMap: Record<string, any> = {
  Send: 'Send',
  Headphones: 'Headphones',
  Crown: 'Crown',
  ShieldCheck: 'ShieldCheck',
  Bot: 'Bot',
  MessageCircle: 'MessageCircle',
  Phone: 'Phone',
  Mail: 'Mail',
};

export const supportService = {
  // Admin: Get all support items
  async getAllSupports() {
    const response = await api.get("/supports");
    return response?.data;
  },

  // Frontend: Get active support items
  async getActiveSupports() {
    const response = await api.get("/supports/active");
    return response?.data;
  },

  // Admin: Create support item
  async createSupport(data: SupportData) {
    const response = await api.post("/supports", data);
    return response?.data;
  },

  // Admin: Update support item
  async updateSupport(id: string, data: Partial<SupportData>) {
    const response = await api.patch(`/supports/${id}`, data);
    return response?.data;
  },

  // Admin: Delete support item
  async deleteSupport(id: string) {
    const response = await api.delete(`/supports/${id}`);
    return response?.data;
  },
};