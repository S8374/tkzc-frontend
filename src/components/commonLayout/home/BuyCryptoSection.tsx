"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { cryptoExchangeService, CryptoExchange } from "@/services/api/cryptoExchange.service";
import { useTranslation } from "@/hooks/useTranslation";

export default function BuyCryptoSection() {
  const { t } = useTranslation();
  const [exchanges, setExchanges] = useState<CryptoExchange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExchanges();
  }, []);

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const response = await cryptoExchangeService.getActiveExchanges();
      if (response?.success) {
        setExchanges(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch exchanges:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#3B393A] rounded-xl p-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-white">
            {t('crypto.buy', 'Buy Crypto')}
          </h2>
          <div className="w-40 h-10 bg-gray-700 animate-pulse rounded-lg"></div>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (exchanges.length === 0) return null;

  return (
    <div className="bg-[#3B393A] rounded-xl p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">
          {t('crypto.buy', 'Buy Crypto')}
        </h2>
        <button className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-medium text-black shadow-md hover:shadow-lg transition-shadow">
          {t('crypto.recommend_vpn', 'Recommend VPN')}
        </button>
      </div>

      {/* Exchange Icons */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        {exchanges.map((exchange) => (
          <div key={exchange._id} className="flex flex-col items-center group">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${exchange.gradientFrom} ${exchange.gradientTo} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 p-2`}>
              {exchange.icon ? (
                <img 
                  src={exchange.icon} 
                  alt={exchange.name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <ImageIcon size={20} className="text-white opacity-50" />
              )}
            </div>
            <span className="mt-3 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
              {exchange.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}