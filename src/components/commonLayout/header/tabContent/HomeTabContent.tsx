"use client";

import { useTranslation } from "@/hooks/useTranslation";
import BuyCryptoSection from "../../home/BuyCryptoSection";
import PartnerMarquee from "../../home/PartnersSection";
import SliderSection from "../../model/SliderSection";

const HomeTabContent = () => {
  const { t } = useTranslation();

  // Section configuration with translation keys
  const sections = [
    {
      type: "hot",
      translationKey: "sections.hot_games",
      icon: "🔥",
      showArrows: true,
    },
    {
      type: "slot-game",
      translationKey: "sections.slot_games",
      icon: "🎰",
      showArrows: true,
    },
    {
      type: "lottory",
      translationKey: "sections.lottery_games",
      icon: "🎟️",
      showArrows: true,
    },
    {
      type: "live",
      translationKey: "sections.live_games",
      icon: "📺",
      showArrows: false,
    },
    {
      type: "sport",
      translationKey: "sections.sports_games",
      icon: "🏆",
      showArrows: false,
    },
    {
      type: "table-game",
      translationKey: "sections.table_games",
      icon: "🎲",
      showArrows: false,
    },
  ];

  return (
    <div className="bg-[#3B393A]">
      {sections.map((section) => (
        <SliderSection
          key={section.type}
          type={section.type}
          title={t(section.translationKey)}
          icon={section.icon}
          showArrows={section.showArrows}
        />
      ))}

      <BuyCryptoSection />
      <PartnerMarquee />
    </div>
  );
};

export default HomeTabContent;