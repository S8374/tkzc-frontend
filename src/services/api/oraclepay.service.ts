import axios from "axios";

const ORACLEPAY_TOKEN =
  process.env.NEXT_PUBLIC_ORACLEPAY_API_TOKEN ||
  "f1f24b484a8e615cd879c5f49b49b4c1528a4860a1e6ddc4";

const oraclePayApi = axios.create({
  baseURL: "https://api.oraclepay.org/api",
  headers: {
    "Content-Type": "application/json",
    "X-Opay-Business-Token": ORACLEPAY_TOKEN,
  },
});

export interface OraclePayGeneratePaymentPageRequest {
  payment_amount: number;
  user_identity_address: string;
  callback_url: string;
  success_redirect_url: string;
  invoice_number: string;
  checkout_items: {
    type: string;
    initiator?: string;
  };
}

export interface OraclePayGeneratePaymentPageResponse {
  success: boolean;
  payment_page_url?: string;
  short_code?: string;
  amount?: number;
  user_identity_address?: string;
  callback_url?: string;
  success_redirect_url?: string;
  invoice_number?: string;
  checkout_items?: {
    type: string;
    initiator?: string;
  };
  expires_at?: string;
  message?: string;
  code?: number;
}

export const oraclePayService = {
  async generatePaymentPage(data: OraclePayGeneratePaymentPageRequest) {
    const response = await oraclePayApi.post<OraclePayGeneratePaymentPageResponse>(
      "/opay-business/generate-payment-page",
      data
    );
    return response?.data;
  },
};