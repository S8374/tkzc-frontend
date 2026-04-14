"use client";

import BackButton from "@/components/ui/BackButton";
import { sliderService } from "@/services/api/slider.service";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

type PromotionSliderDetail = {
  _id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  detailTitle?: string;
  detailSubtitle?: string;
  activityTimeText?: string;
  introText?: string;
  rewardDetailsText?: string;
  rulesText?: string;
  buttonText?: string;
  buttonLink?: string;
};

const splitLines = (text?: string) =>
  (text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

export default function PromotionDetailPage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [promotion, setPromotion] = useState<PromotionSliderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPromotion = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const res = await sliderService.getSliderById(id);
        const row = (res?.data || res) as PromotionSliderDetail;
        setPromotion(row || null);
      } catch (error) {
        console.error("Failed to load promotion detail:", error);
        setPromotion(null);
      } finally {
        setLoading(false);
      }
    };

    loadPromotion();
  }, [id]);

  const rewardLines = useMemo(() => splitLines(promotion?.rewardDetailsText), [promotion?.rewardDetailsText]);
  const ruleLines = useMemo(() => splitLines(promotion?.rulesText), [promotion?.rulesText]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#1A1826] to-[#2D2C3A] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#1A1826] to-[#2D2C3A] flex items-center justify-center px-6">
        <p className="text-gray-300 text-center">Promotion details not found.</p>
      </div>
    );
  }

  const headingTitle = promotion.detailTitle || promotion.title || "Promotion";
  const headingSubtitle = promotion.detailSubtitle || promotion.subtitle || "Complete task and claim reward";

  return (
    <div className="min-h-screen bg-linear-to-b from-[#1A1826] to-[#2D2C3A] pb-20">
      <div className="relative h-14 flex items-center px-4 bg-linear-to-r from-[#0F0D2A] to-[#3A1C71]">
        <Suspense fallback={<div>Loading...</div>}>
          <BackButton fallback="/promotion" />
        </Suspense>
        <h1 className="text-xl font-bold text-white mx-auto truncate">{promotion.title || "Promotion"}</h1>
        <div className="w-8" />
      </div>

      <div className="p-6">
        <div className="relative h-48 rounded-xl overflow-hidden bg-[#1E1D2A]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${promotion.image || "https://admin.tkv6test.cc/uploads/20251126/0ab6232392ffde09f96e20d02035afea.png"})`,
            }}
          />
        </div>

        <div className="max-w-2xl mx-auto px-4 pt-6">
          <h2 className="text-2xl font-bold text-white mb-2">{headingTitle}</h2>
          <p className="text-yellow-400 text-sm mb-6">{headingSubtitle}</p>

          <div className="bg-[#252334] rounded-xl p-4 mb-6">
            <h3 className="font-bold text-white mb-2">Activity Time</h3>
            <p className="text-gray-300">{promotion.activityTimeText || "Long-term valid"}</p>
          </div>

          <div className="bg-[#252334] rounded-xl p-4 mb-6">
            <h3 className="font-bold text-white mb-2">Introduction</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {promotion.introText || promotion.description || "Complete the required activity and claim your reward."}
            </p>
          </div>

          <div className="bg-[#252334] rounded-xl p-4 mb-6">
            <h3 className="font-bold text-white mb-3">Reward Details</h3>
            {rewardLines.length > 0 ? (
              <ul className="space-y-2 text-gray-300">
                {rewardLines.map((line) => (
                  <li key={line} className="text-sm leading-relaxed">{line}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-300 text-sm">Reward details will be announced soon.</p>
            )}
          </div>

          <div className="bg-[#252334] rounded-xl p-4 mb-8">
            <h3 className="font-bold text-white mb-3">Rules</h3>
            {ruleLines.length > 0 ? (
              <ol className="space-y-3 text-gray-300 list-decimal pl-5">
                {ruleLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-300 text-sm">Standard platform rules apply.</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* <Link
              href={promotion.buttonLink || "/deposit"}
              className="flex-1 py-4 bg-linear-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-xl text-center hover:opacity-90 transition-opacity"
            >
              {promotion.buttonText || "Join Now"}
            </Link> */}
            <Link
              href="/tasks"
              className="flex-1 py-4 bg-[#1E1D2A] text-white font-bold rounded-xl border border-gray-700 text-center hover:bg-[#252334] transition-colors"
            >
              Go to Tasks
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
