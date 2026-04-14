/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api";

export interface MarqueeTextTranslations {
  en?: string;
  zh?: string;
  vi?: string;
  bn?: string;
}

export interface MarqueeData {
  text: string;
  textTranslations?: MarqueeTextTranslations;
  isActive?: boolean;
  order?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface Marquee {
  _id: string;
  text: string;
  textTranslations?: MarqueeTextTranslations;
  isActive: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const marqueeService = {
  // Get all marquees
  async getAllMarquees(): Promise<{ success: boolean; data: Marquee[] }> {
    const res = await api.get("/marquee");
    return res.data;
  },

  // Get only active marquees
  async getActiveMarquees(): Promise<{ success: boolean; data: Marquee[] }> {
    const res = await api.get("/marquee/active");
    return res.data;
  },

  // Create new marquee
  async createMarquee(data: MarqueeData): Promise<any> {
    const res = await api.post("/marquee", data);
    return res.data;
  },

  // Update marquee
  async updateMarquee(id: string, data: Partial<MarqueeData>): Promise<any> {
    const res = await api.patch(`/marquee/${id}`, data);
    return res.data;
  },

  // Delete marquee
  async deleteMarquee(id: string): Promise<any> {
    const res = await api.delete(`/marquee/${id}`);
    return res.data;
  },
};