"use client";

import { Suspense, useMemo, useState } from "react";
import BackButton from "@/components/ui/BackButton";
import { promotionService, Promotion } from "@/services/api/promotion.service";
import { useEffect } from "react";

function randomIndex(max: number) {
  return Math.floor(Math.random() * max);
}

export default function LuckyWheelPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Promotion | null>(null);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        setLoading(true);
        const res = await promotionService.getAllPromotions();
        const rows: Promotion[] = (res?.data || []).filter((p: Promotion) => p.isActive);
        setPromotions(rows);
      } catch (error) {
        console.error("Failed to load lucky wheel promotions:", error);
        setPromotions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPromotions();
  }, []);

  const spin = async () => {
    if (!promotions.length || spinning) return;
    setSpinning(true);
    setResult(null);
    const idx = randomIndex(promotions.length);
    setTimeout(() => {
      setResult(promotions[idx]);
      setSpinning(false);
    }, 1400);
  };

  const prizeText = useMemo(() => {
    if (!result) return "";
    return result.type === "PERCENT" ? `${result.value}% Bonus` : `৳${result.value} Bonus`;
  }, [result]);

  return (
    <div className="min-h-screen bg-[#1E1D2A] text-white pb-8">
      <div className="relative h-16 flex items-center px-4 border-b border-gray-800">
        <Suspense fallback={<div>Loading...</div>}>
          <BackButton fallback="/account" />
        </Suspense>
        <h1 className="text-xl font-bold flex-1 text-center">Lucky Wheel</h1>
        <div className="w-10" />
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center text-gray-400 py-10">Loading prize pool...</div>
        ) : promotions.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No active rewards available now</div>
        ) : (
          <>
            <div className="rounded-2xl border border-yellow-600/30 bg-linear-to-b from-yellow-900/30 to-transparent p-6 text-center">
              <p className="text-sm text-yellow-200">Spin to reveal a reward from active promotions</p>
              <button
                onClick={spin}
                disabled={spinning}
                className="mt-4 px-8 py-3 rounded-full bg-yellow-400 text-black font-semibold disabled:opacity-60"
              >
                {spinning ? "Spinning..." : "Spin Now"}
              </button>
              {result && (
                <div className="mt-5 p-3 rounded-xl bg-black/30">
                  <p className="text-xs text-gray-300">You got</p>
                  <p className="text-xl font-bold text-yellow-300 mt-1">{prizeText}</p>
                  <p className="text-sm text-gray-300 mt-1">{result.bonusName}</p>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {promotions.map((item) => (
                <div key={item._id} className="bg-[#252334] rounded-xl p-3 border border-gray-800">
                  <p className="font-medium">{item.bonusName}</p>
                  <p className="text-sm text-gray-300 mt-1">
                    {item.type === "PERCENT" ? `${item.value}% bonus` : `৳${item.value} bonus`}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}