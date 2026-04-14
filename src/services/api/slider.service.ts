/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../api";

export interface SliderData {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  sliderTypeId: string;
  buttonText?: string;
  buttonLink?: string;
  imageRedirectLink?: string;
  detailTitle?: string;
  detailSubtitle?: string;
  activityTimeText?: string;
  introText?: string;
  rewardDetailsText?: string;
  rulesText?: string;
  money?: number;
  username?: string;
  provider_code?: string;
  provider_id?: string;
  game_id?: string;
  game_code?: string;
  game_type?: string;
  order: number;
  isActive?: boolean;
}

export const sliderService = {
  async createSlider(data: SliderData): Promise<any> {
    const response = await api.post("/slider", data);
    return response?.data;
  },

async getAllSliders(
  options?: {
    sliderTypeId?: string;
    type?: string;
  }
): Promise<any> {

  const response = await api.get("/slider", {
    params: {
      sliderTypeId: options?.sliderTypeId,
      type: options?.type,
    },
  });

  return response?.data;
}
,

  async getSliderById(id: string): Promise<any> {
    const response = await api.get(`/slider/${id}`);
    return response?.data;
  },

  async updateSlider(id: string, data: Partial<SliderData>): Promise<any> {
    const response = await api.put(`/slider/${id}`, data);
    return response?.data;
  },

  async deleteSlider(id: string): Promise<any> {
    const response = await api.delete(`/slider/${id}`);
    return response?.data;
  }
};