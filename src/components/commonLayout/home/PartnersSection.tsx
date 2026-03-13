/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { partnerService, Partner } from "@/services/api/partner.service";
import { useTranslation } from "@/hooks/useTranslation";

export default function PartnerMarquee() {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await partnerService.getActivePartners();
      if (response?.success) {
        setPartners(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch partners:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;
  if (loading) {
    return (
      <div className="bg-[#3B393A] py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-start text-white font-semibold mb-4">
            {t('partners.title', 'Partners and Industry Associations')}
          </h3>
          <div className="flex justify-center items-center h-20">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }
  if (partners.length === 0) return null;

  return (
    <div className="bg-[#3B393A] py-6">
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="text-start text-white font-semibold mb-4">
          {t('partners.title', 'Partners and Industry Associations')}
        </h3>

        {/* Smooth CSS Marquee */}
        <div className="overflow-hidden">
          <div 
            className="flex animate-marquee whitespace-nowrap"
            style={{
              animationDuration: `${Math.max(20, partners.length * 3)}s`,
            }}
          >
            {/* First copy */}
            {partners.map((partner) => (
              <div key={`orig-${partner._id}`} className="flex-shrink-0 mx-6">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-10 object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
                  loading="lazy"
                />
              </div>
            ))}
           
          </div>
        </div>
      </div>

      {/* Custom CSS for smooth marquee */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}