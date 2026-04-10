import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface AutoDeposit {
  _id: string;
  status: string;
  amount: number;
  transaction_id: string;
  invoice_number: string;
  session_code: string;
  bank: string;
  footprint: string;
  bonusAmount?: number;
  turnoverRequired?: number;
  createdAt: string;
}

export const autoDepositService = {
  getAllRequests: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    try {
      const token = Cookies.get("accessToken");
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);

      const response = await fetch(`${API_URL}/auto-deposits/admin/all?${queryParams}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return await response.json();
    } catch (error) {
      console.error("AutoDeposit Service Error:", error);
      throw error;
    }
  },
};
