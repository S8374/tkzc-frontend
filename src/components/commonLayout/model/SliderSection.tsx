"use client";

import { useEffect, useState } from "react";
import CardSlider from "@/components/reUseAbleItems/CardSlider";
import { sliderService } from "@/services/api/slider.service";
import { oracleService } from "@/services/api/oracel.service";

const SliderSection = ({
  type,
  title,
  icon,
  showArrows = true,
}: {
  type: string;
  title: string;
  icon?: React.ReactNode;
  showArrows?: boolean;
}) => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await sliderService.getAllSliders({ type });

        if (res?.success && res?.data) {
          const sliders: any[] = res.data;
          const providerCodes = Array.from(
            new Set(
              sliders
                .filter((item: any) => !item.image && item.provider_code && item.game_code)
                .map((item: any) => item.provider_code)
            )
          );

          let gameImageMap: Record<string, string> = {};
          if (providerCodes.length) {
            const detailsList = await Promise.all(
              providerCodes.map((providerCode) => oracleService.getProviderDetails(providerCode))
            );

            detailsList.forEach((details: any) => {
              const games = details?.games || [];
              games.forEach((game: any) => {
                if (game?.provider_code && game?.game_code && game?.image) {
                  gameImageMap[`${game.provider_code}:${game.game_code}`] = game.image;
                }
              });
            });
          }

          const mapped = sliders.map((item: any) => ({
            id: item._id,
            title: item.title,
            subtitle: item.subtitle,
            imageUrl:
              item.image ||
              gameImageMap[`${item.provider_code}:${item.game_code}`] ||
              "https://via.placeholder.com/300x200?text=No+Image",
          }));

          setItems(mapped);
        }
      } catch (error) {
        console.error(`Failed to fetch ${type} sliders`, error);
      }
    };

    fetchSliders();
  }, [type]);

  if (!items.length) return null; // hide section if empty

  return (
    <CardSlider
      items={items}
      title={title}
      icon={icon}
      rounded={false}
      cardWidth={{ base: "140px", sm: "140px", md: "160px" }}
      cardHeight="140px"
      spaceBetween={10}
      showArrows={showArrows}
    />
  );
};

export default SliderSection;