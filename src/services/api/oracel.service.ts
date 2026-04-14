/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const oracleProxyApi = axios.create({
  baseURL: "/api/oracle",
});

export const oracleService = {
  async getProviders() {
    const response = await oracleProxyApi.get("/providers");
    return response.data;
  },
  async getProviderDetails(code: string) {
    const response = await oracleProxyApi.get(`/providers/${encodeURIComponent(code)}`);
    return response.data;
  },

};