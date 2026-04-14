"use client"
import BackButton from "@/components/ui/BackButton";
import { Suspense, useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { sliderTypeService } from "@/services/api/slider.types";
import { sliderService } from "@/services/api/slider.service";
import { oracleService } from "@/services/api/oracel.service";
import ItemsCard from "@/components/reUseAbleItems/ItemsCard";
import SearchField from "@/components/reUseAbleItems/SearchField";
import { Gamepad2, Flame, Eye, Tv, Fish, Ticket, Target, Dice5, User } from "lucide-react";

// Icons map
const iconMap: Record<string, any> = {
  hot: Flame,
  'recent-views': Eye,
  live: Tv,
  'fishing-game': Fish,
  lottory: Ticket,
  sport: Target,
  'table-game': Dice5,
  'slot-game': Gamepad2,
  default: User
};

export default function GamesPage() {
  const { t } = useTranslation();
  const [sliderTypes, setSliderTypes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch slider types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true);
        const res = await sliderTypeService.getAllSliderTypes();
        if (res?.success && res?.data) {
          const types = res.data.filter(
            (type: any) => type.name.toLowerCase() !== "hero" &&
              type.name.toLowerCase() !== "home" &&
              type.name.toLowerCase() !== "promotion"
          );
          // Sort types by name simply or keep response order
          setSliderTypes(types);
          if (types.length > 0) setActiveTab(types[0]._id);
        }
      } catch (error) {
        console.error("Failed to fetch slider types", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#1a1b20] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center h-14 px-4 bg-[#21232b] shadow-md border-b border-gray-800">
        <Suspense fallback={<div className="w-8 h-8" />}>
          <BackButton fallback="/" />
        </Suspense>
        <h1 className="text-lg font-bold text-white mx-auto tracking-wide">{t("header.games", "Game Center")}</h1>
        <div className="w-8"></div>
      </div>

      {loading ? (
        <div className="p-4 flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Categories / Tabs */}
          <div className="sticky top-14 z-40 bg-[#1a1b20]/95 backdrop-blur-sm border-b border-white/5 py-3 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth">
            <div className="flex gap-2 px-4">
              {sliderTypes.map((type) => {
                const Icon = iconMap[type.name.toLowerCase()] || iconMap.default;
                const isSelected = activeTab === type._id;

                return (
                  <button
                    key={type._id}
                    onClick={() => setActiveTab(type._id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isSelected
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)] scale-105'
                        : 'bg-[#292c35] text-gray-400 hover:text-gray-200 hover:bg-[#343742]'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'animate-pulse' : ''}`} />
                    {String(t(`tabs.${type.name.toLowerCase().replace(/\s+/g, '_')}`, type.name))}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Game Content */}
          <div className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab && (
              <GameCategoryContent
                sliderTypeId={activeTab}
                sliderTypeName={sliderTypes.find(t => t._id === activeTab)?.name || ""}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

const GameCategoryContent = ({ sliderTypeId, sliderTypeName }: { sliderTypeId: string, sliderTypeName: string }) => {
  const { t } = useTranslation();
  const [sliders, setSliders] = useState<any[]>([]);
  const [gameImageMap, setGameImageMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        setLoading(true);
        const res = await sliderService.getAllSliders({ sliderTypeId });
        if (res?.success && res?.data) {
          setSliders(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch sliders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSliders();
  }, [sliderTypeId]);

  useEffect(() => {
    const preloadGameImages = async () => {
      const providerCodes = Array.from(
        new Set(
          sliders
            .filter((item) => !item.image && item.provider_code && item.game_code)
            .map((item) => item.provider_code)
        )
      );

      if (!providerCodes.length) {
        setGameImageMap({});
        return;
      }

      try {
        const detailsList = await Promise.all(
          providerCodes.map((providerCode) => oracleService.getProviderDetails(providerCode))
        );

        const map: Record<string, string> = {};
        detailsList.forEach((details: any) => {
          const games = details?.games || [];
          games.forEach((game: any) => {
            if (game?.provider_code && game?.game_code && game?.image) {
              map[`${game.provider_code}:${game.game_code}`] = game.image;
            }
          });
        });

        setGameImageMap(map);
      } catch {
        setGameImageMap({});
      }
    };

    preloadGameImages();
  }, [sliders]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return sliders;
    const query = searchQuery.toLowerCase();
    return sliders.filter((item) =>
      item.title?.toLowerCase().includes(query) ||
      item.subtitle?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.game_code?.toLowerCase().includes(query)
    );
  }, [sliders, searchQuery]);

  const mappedItems = filteredItems.map((item) => ({
    id: item._id,
    title: item.title || item.game_code || "Game",
    subtitle: item.subtitle,
    imageUrl:
      item.image ||
      gameImageMap[`${item.provider_code}:${item.game_code}`] ||
      "https://raw.githubusercontent.com/placeholder-image/image/main/gaming-placeholder.png", // aesthetic fallback
    onClick: () => {
      if (item.imageRedirectLink) {
        window.open(item.imageRedirectLink, "_blank");
      }
    },
  }));

  const displayName = t(`tabs.${sliderTypeName.toLowerCase().replace(/\s+/g, '_')}`, sliderTypeName);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-end">
        <SearchField
          onSearch={(q) => setSearchQuery(q)}
          placeholder={`${t('common.search', 'Search')} ${displayName}...`}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-full aspect-[4/5] bg-gray-800 rounded-xl animate-pulse ring-1 ring-white/5"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {searchQuery && (
            <div className="text-sm font-medium text-pink-400">
              {t('common.found', 'Found')} {filteredItems.length} {t('common.results', 'results')}
            </div>
          )}

          <ItemsCard
            items={mappedItems}
            title={searchQuery ? t('common.search_results', 'Search Results') : `${displayName} ${t('common.games', 'Games')}`}
            rounded={true}
            icon={<Gamepad2 className="w-5 h-5 text-purple-400" />}
            cardWidth={{ base: "30%", sm: "140px", md: "160px" }}
            cardHeight="150px"
            spaceBetween={12}
            className="w-full"
          />

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[#21232b] rounded-2xl border border-white/5">
              <Gamepad2 className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-300 mb-2">{t('common.no_games', 'No Games Found')}</h3>
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? `${t('common.try_adjusting', 'Try adjusting your search query')}`
                  : `${t('common.check_later', 'Check back later for new exclusive titles')}`
                }
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};