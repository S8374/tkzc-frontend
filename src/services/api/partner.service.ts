/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api";

export interface Partner {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartnerData {
  name: string;
  slug: string;
  logo: string;
  order?: number;
  isActive?: boolean;
}

export const partnerService = {
  // Admin: Get all partners
  async getAllPartners() {
    const response = await api.get("/partners");
    return response?.data;
  },

  // Frontend: Get active partners only
  async getActivePartners() {
    const response = await api.get("/partners/active");
    return response?.data;
  },

  // Admin: Create partner
  async createPartner(data: PartnerData) {
    const response = await api.post("/partners", data);
    return response?.data;
  },

  // Admin: Update partner
  async updatePartner(id: string, data: Partial<PartnerData>) {
    const response = await api.patch(`/partners/${id}`, data);
    return response?.data;
  },

  // Admin: Delete partner
  async deletePartner(id: string) {
    const response = await api.delete(`/partners/${id}`);
    return response?.data;
  },
};