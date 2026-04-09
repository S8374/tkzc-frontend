/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api";

export interface RegisterData {
  name: string;
  password: string;
  imHuman: boolean;
  referralCode:string;
}

export const authService = {
  async login(credentials: any): Promise<any> {
    const response = await api.post("/auth/login", credentials);
    return response?.data;
  },

  async register(data: RegisterData): Promise<any> {
    const response = await api.post("/user/register", data);
    return response?.data;
  },
  async me(data: any): Promise<any> {
    const response = await api.get("/auth/me", data);
    return response?.data;
  },
  async logout(data: any): Promise<any> {
    const response = await api.post("/auth/logout", data);
    return response?.data;
  },
  async getMyStats(): Promise<any> {
    const response = await api.get("/user/stats");
    return response?.data;
  },
};
