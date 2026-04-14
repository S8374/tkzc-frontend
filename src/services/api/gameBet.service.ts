import api from "../api";

export interface GameBetRecord {
  _id: string;
  provider_code: string;
  game_code: string;
  bet_type: string;
  transaction_id: string;
  amount: number;
  balanceChange: number;
  walletBalanceBefore: number;
  walletBalanceAfter: number;
  status: "won" | "lost" | "refunded" | "cancelled";
  createdAt: string;
}

export interface MyBetsResponse {
  success: boolean;
  message?: string;
  data?: {
    data: GameBetRecord[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalRecords: number;
      totalBetAmount: number;
      totalWinAmount: number;
      netBalanceChange: number;
    };
  };
}

export const gameBetService = {
  async getMyBets(params?: { page?: number; limit?: number; provider_code?: string; status?: string; bet_type?: string }) {
    const response = await api.get<MyBetsResponse>("/game/my-bets", { params });
    return response.data;
  },
};