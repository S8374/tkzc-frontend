/* eslint-disable @typescript-eslint/no-explicit-any */
import { oracleApi } from "../oracleApi";

export const oracleService = {
  async getProviders() {
    const response = await oracleApi.get("/providers");
    return response.data;
  },
  async getProviderDetails(code: string) {
    const response = await oracleApi.get(`/providers/${code}`);
    return response.data;
  },

};