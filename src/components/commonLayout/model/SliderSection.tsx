"use client";

import { useEffect, useState } from "react";
import CardSlider from "@/components/reUseAbleItems/CardSlider";
import { sliderService } from "@/services/api/slider.service";
import { oracleService } from "@/services/api/oracel.service";
import { oracleGameApi } from "@/services/oracle.Game.Api";
import { useAuth } from "@/context/AuthContext";
import { openGameInIframe } from "@/lib/gameIframe";
import toast from "react-hot-toast";

const ORACLE_LAUNCH_MONEY = Number(process.env.NEXT_PUBLIC_ORACLE_LAUNCH_MONEY || 1);

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
  const { user } = useAuth();
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
            provider_code: item.provider_code,
            game_code: item.game_code,
            game_type: item.game_type,
          }));

          setItems(mapped);
        }
      } catch (error) {
        console.error(`Failed to fetch ${type} sliders`, error);
      }
    };

    fetchSliders();
  }, [type]);

  const handleCardClick = async (item: any) => {
    if (!item?.provider_code || !item?.game_code) return;

    try {
      const username = user?.name || user?.email;
      if (!username) {
        toast.error("Please sign in first");
        return;
      }

      const payload = {
        username,
        money: Number.isFinite(ORACLE_LAUNCH_MONEY) && ORACLE_LAUNCH_MONEY > 0 ? ORACLE_LAUNCH_MONEY : 1,
        provider_code: item.provider_code,
        game_code: item.game_code || 0,
        game_type: item.game_type || 0,
      };

      console.log("[Oracle Launch Payload]", payload);

      const response = await oracleGameApi.launchGame(payload);
      console.log("[Oracle Launch Response]", response);
      console.log("[Oracle Launch Full JSON]", JSON.stringify(response, null, 2));

      if (response?.success && response?.url) {
        openGameInIframe(response.url);
        return;
      }

      toast.error(response?.message || "Unable to launch game");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Unable to launch game");
      console.error("[Oracle Launch Error]", error?.response?.data || error?.message || error);
    }
  };

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
      onCardClick={handleCardClick}
    />
  );
};

export default SliderSection;