"use client";

import { Suspense, useEffect, useState } from "react";
import BackButton from "@/components/ui/BackButton";
import { cryptoExchangeService, CryptoExchange } from "@/services/api/cryptoExchange.service";
import Link from "next/link";

export default function BuyCryptoPage() {
  const [items, setItems] = useState<CryptoExchange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await cryptoExchangeService.getActiveExchanges();
        setItems(res?.data || []);
      } catch (error) {
        console.error("Failed to load crypto exchanges:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#1E1D2A] text-white pb-8">
      <div className="relative h-16 flex items-center px-4 border-b border-gray-800">
        <Suspense fallback={<div>Loading...</div>}>
          <BackButton fallback="/account" />
        </Suspense>
        <h1 className="text-xl font-bold flex-1 text-center">Buy Crypto</h1>
        <div className="w-10" />
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center text-gray-400 py-10">Loading exchanges...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No active exchanges found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="rounded-xl p-4 border border-gray-700"
                style={{
                  background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="w-10 h-10 rounded-full bg-white/20 p-1"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs opacity-80">{item.slug}</p>
                  </div>
                </div>
                <Link href="/deposit" className="mt-4 inline-block bg-black/30 px-3 py-1.5 rounded-lg text-sm font-medium">
                  Use for deposit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}