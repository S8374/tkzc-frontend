"use client";

import { Suspense, useEffect, useState } from "react";
import BackButton from "@/components/ui/BackButton";
import { gameBetService, GameBetRecord } from "@/services/api/gameBet.service";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

type BetsSummary = {
  totalRecords: number;
  totalBetAmount: number;
  totalWinAmount: number;
  netBalanceChange: number;
};

const toMoney = (v: number) => `৳${Number(v || 0).toFixed(2)}`;

export default function MyBetsPage() {
  const [bets, setBets] = useState<GameBetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<BetsSummary>({
    totalRecords: 0,
    totalBetAmount: 0,
    totalWinAmount: 0,
    netBalanceChange: 0,
  });

  const fetchBets = async (targetPage = page) => {
    try {
      setLoading(true);
      const res = await gameBetService.getMyBets({ page: targetPage, limit: 20 });
      const rows = res?.data?.data || [];
      const meta = res?.data?.meta;
      const serverSummary = res?.data?.summary;

      setBets(rows);
      setPage(meta?.page || targetPage);
      setTotalPages(meta?.totalPages || 1);
      setSummary({
        totalRecords: Number(serverSummary?.totalRecords || 0),
        totalBetAmount: Number(serverSummary?.totalBetAmount || 0),
        totalWinAmount: Number(serverSummary?.totalWinAmount || 0),
        netBalanceChange: Number(serverSummary?.netBalanceChange || 0),
      });
    } catch (error) {
      console.error("Failed to fetch my bets:", error);
      setBets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBets(1);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBets(page);
  };

  return (
    <div className="min-h-screen bg-[#1E1D2A] text-white pb-8">
      <div className="relative h-16 flex items-center px-4 border-b border-gray-800">
        <Suspense fallback={<div>Loading...</div>}>
          <BackButton fallback="/account" />
        </Suspense>
        <h1 className="text-xl font-bold flex-1 text-center">My Bets</h1>
        <button onClick={onRefresh} className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        <Stat title="Total Bets" value={String(summary.totalRecords)} />
        <Stat title="Bet Amount" value={toMoney(summary.totalBetAmount)} />
        <Stat title="Win Amount" value={toMoney(summary.totalWinAmount)} />
        <Stat title="Net Change" value={toMoney(summary.netBalanceChange)} />
      </div>

      <div className="px-4 space-y-3">
        {loading ? (
          <div className="text-center text-gray-400 py-10">Loading bets...</div>
        ) : bets.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No bet history found</div>
        ) : (
          bets.map((bet) => (
            <div key={bet._id} className="bg-[#252334] border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{bet.provider_code} • {bet.game_code}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-700 uppercase">{bet.bet_type}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-300">Amount: <span className="text-white">{toMoney(bet.amount)}</span></p>
                <p className="text-gray-300 text-right">Change: <span className={bet.balanceChange >= 0 ? "text-green-400" : "text-red-400"}>{toMoney(bet.balanceChange)}</span></p>
                <p className="text-gray-400 col-span-2">Tx: {bet.transaction_id}</p>
                <p className="text-gray-400 col-span-2">{new Date(bet.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            disabled={page <= 1}
            onClick={() => fetchBets(page - 1)}
            className="px-3 py-2 rounded-lg bg-gray-700 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-sm text-gray-300">Page {page} / {totalPages}</p>
          <button
            disabled={page >= totalPages}
            onClick={() => fetchBets(page + 1)}
            className="px-3 py-2 rounded-lg bg-gray-700 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-[#252334] rounded-xl p-3 border border-gray-800">
      <p className="text-xs text-gray-400">{title}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  );
}