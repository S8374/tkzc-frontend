/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api";

export type DownloadCategory = "VPN" | "WALLET";

export interface DownloadApp {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  category: DownloadCategory;
  downloadUrl: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DownloadAppData {
  name: string;
  slug: string;
  icon: string;
  category: DownloadCategory;
  downloadUrl: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export const downloadAppService = {
  async getAllApps() {
    const response = await api.get("/download-apps");
    return response?.data;
  },

  async getActiveApps() {
    const response = await api.get("/download-apps/active");
    return response?.data;
  },

  async createApp(data: DownloadAppData) {
    const response = await api.post("/download-apps", data);
    return response?.data;
  },

  async updateApp(id: string, data: Partial<DownloadAppData>) {
    const response = await api.patch(`/download-apps/${id}`, data);
    return response?.data;
  },

  async deleteApp(id: string) {
    const response = await api.delete(`/download-apps/${id}`);
    return response?.data;
  },
};
