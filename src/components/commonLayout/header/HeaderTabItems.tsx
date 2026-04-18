/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { User, Flame, Eye, Tv, Fish, Ticket, Target, Dice5, Gamepad2, Home } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";

// Import tab contents
import HomeTabContent from "./tabContent/HomeTabContent";
import { sliderTypeService } from "@/services/api/slider.types";
import { sliderService } from "@/services/api/slider.service";
import { oracleService } from "@/services/api/oracel.service";
import { oracleGameApi } from "@/services/oracle.Game.Api";
import { useAuth } from "@/context/AuthContext";
import { openGameInIframe } from "@/lib/gameIframe";
import SearchField from "@/components/reUseAbleItems/SearchField";
import ItemsCard from "@/components/reUseAbleItems/ItemsCard";
import toast from "react-hot-toast";

const ORACLE_LAUNCH_MONEY = Number(process.env.NEXT_PUBLIC_ORACLE_LAUNCH_MONEY || 1);

// Map of icons for different tab types
const iconMap: Record<string, any> = {
  home: Home,
  hot: Flame,
  'recent-views': Eye,
  live: Tv,
  'fishing-game': Fish,
  lottory: Ticket,
  sport: Target,
  'table-game': Dice5,
  'slot-game': Gamepad2,
  // Default icon for dynamic tabs
  default: User
};

// Skeleton Loader Component
const TabsSkeleton = () => {
  return (
    <div className="w-full bg-[#3B393A]">
      {/* Tabs List Skeleton */}
      <div className="sticky top-16 z-40">
        <div className="w-full whitespace-nowrap bg-[#3B393A] overflow-hidden">
          <div className="inline-flex h-10 bg-[#3B393A] items-center justify-center p-1 gap-2 min-w-full">
            {/* Home Tab Skeleton */}
            <div className="inline-flex items-center justify-center whitespace-nowrap rounded px-2 py-4 min-w-fit">
              <div className="w-4 h-4 bg-gray-600 rounded-full mr-2 animate-pulse"></div>
              <div className="w-12 h-4 bg-gray-600 rounded animate-pulse"></div>
            </div>
            
            {/* Generate 5 skeleton tabs */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="inline-flex items-center justify-center whitespace-nowrap rounded px-2 py-4 min-w-fit">
                <div className="w-4 h-4 bg-gray-600 rounded-full mr-2 animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-600 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="relative overflow-hidden min-h-100">
        {/* Search Bar Skeleton */}
        <div className="max-w-4xl mx-auto mb-6 flex justify-end">
          <div className="w-40 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>

        {/* Games Grid Skeleton - 3 cards per row */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gray-600 rounded-full animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-600 rounded animate-pulse"></div>
          </div>
          
          {/* Grid with 3 columns */}
          <div className="grid grid-cols-3 gap-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-full aspect-square bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-600 rounded mt-2 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dynamic Tab Content Skeleton
const DynamicTabSkeleton = () => {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Search Bar Skeleton */}
      <div className="mb-6 flex justify-end">
        <div className="w-40 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
      </div>

      {/* Title Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-gray-600 rounded-full animate-pulse"></div>
        <div className="w-32 h-6 bg-gray-600 rounded animate-pulse"></div>
      </div>

      {/* Games Grid Skeleton - 3 cards per row */}
      <div className="grid grid-cols-3 gap-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-full aspect-square bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-20 h-4 bg-gray-600 rounded mt-2 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HeaderTabItems = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("home");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const stickyTabsRef = useRef<HTMLDivElement>(null);
  const [sliderTypes, setSliderTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTabsStuck, setIsTabsStuck] = useState(false);

  // Fetch slider types from API
  useEffect(() => {
    const fetchSliderTypes = async () => {
      try {
        setLoading(true);
        const res = await sliderTypeService.getAllSliderTypes();
        if (res?.success && res?.data) {
          setSliderTypes(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch slider types", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSliderTypes();
  }, []);

  // Filter out "hero", "home", and "promotion" from dynamic tabs
  const filteredSliderTypes = sliderTypes.filter(
    (type) => type.name.toLowerCase() !== "hero" && 
               type.name.toLowerCase() !== "home" && 
               type.name.toLowerCase() !== "promotion"
  );

  // Dynamic tabs from API
  const dynamicTabs = filteredSliderTypes.map((type) => ({
    id: type.name.toLowerCase().replace(/\s+/g, '-'),
    label: type.name,
    translatedLabel: t(`tabs.${type.name.toLowerCase().replace(/\s+/g, '_')}`, type.name),
    icon: iconMap[type.name.toLowerCase()] || iconMap.default,
    originalName: type.name,
    _id: type._id
  }));

  // Static Home tab
  const homeTab = {
    id: "home",
    label: t('tabs.home', 'Home'),
    translatedLabel: t('tabs.home', 'Home'),
    icon: iconMap.home
  };

  // Combine tabs
  const allTabs = [homeTab, ...dynamicTabs];

  // Auto-scroll to active tab
  useEffect(() => {
    if (scrollAreaRef.current) {
      const activeElement = scrollAreaRef.current.querySelector('[data-state="active"]');
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const checkStickyState = () => {
      if (!stickyTabsRef.current) return;
      const { top } = stickyTabsRef.current.getBoundingClientRect();
      setIsTabsStuck(top <= 64);
    };

    checkStickyState();
    window.addEventListener("scroll", checkStickyState, { passive: true });

    return () => {
      window.removeEventListener("scroll", checkStickyState);
    };
  }, []);

  if (loading) {
    return <TabsSkeleton />;
  }

  return (
    <Tabs 
      defaultValue="home" 
      value={activeTab}
      onValueChange={setActiveTab}
      className={`w-full transition-colors duration-300 ${
        isTabsStuck ? "bg-[#18264F] " : "bg-[#3B393A]"
      }`}
    >
      {/* Scrollable Tabs List */}
      <div
        ref={stickyTabsRef}
        className={`sticky top-16 z-40 transition-all duration-300 ${
          isTabsStuck
            ? " bg-[#18264F]/95 backdrop-blur-md border-b border-[#2D3D77]"
            : "bg-[#3B393A]"
        }`}
      >
        <ScrollArea 
          ref={scrollAreaRef}
          className={`w-full whitespace-nowrap transition-colors duration-300 ${
            isTabsStuck ? "bg-[#18264F] -mt-2.5 py-1.5" : "bg-[#3B393A]"
          }`}
        >
          <TabsList
            className={`inline-flex h-10 items-center  justify-center p-1  text-background gap-2 min-w-full transition-colors duration-300 ${
              isTabsStuck ? "bg-[#18264F] " : "bg-[#3B393A]"
            }`}
          >
            {allTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`
                    inline-flex items-center justify-center whitespace-nowrap rounded px-2 py-4 text-sm font-medium 
                    text-background ring-offset-background transition-all duration-300 ease-in-out 
                    focus-visible:outline-none focus-visible:ring-2  focus-visible:ring-ring focus-visible:ring-offset-2 
                    disabled:pointer-events-none disabled:opacity-50
                    ${
                      isTabsStuck
                        ? "data-[state=active]:bg-[#253870] hover:bg-[#223567] "
                        : "data-[state=active]:bg-[#525151] hover:bg-[#525151]"
                    }
                    data-[state=active]:text-background data-[state=active]:shadow-sm data-[state=active]:rounded
                    min-w-fit
                  `}
                >
                  <Icon className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
                  <span className="transition-all duration-200">{tab.translatedLabel || tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <ScrollBar orientation="horizontal" className="opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </ScrollArea>
      </div>

      {/* Tabs Content */}
      <div className="relative overflow-hidden min-h-100">
        {/* Home Tab Content */}
        <TabsContent value="home" className="mt-0 data-[state=active]:animate-fadeIn data-[state=inactive]:animate-fadeOut">
          <HomeTabContent />
        </TabsContent>
        
        {/* Dynamic content for slider types */}
        {dynamicTabs.map((tab) => (
          <TabsContent 
            key={tab.id}
            value={tab.id} 
            className="mt-0 data-[state=active]:animate-fadeIn data-[state=inactive]:animate-fadeOut"
          >
            <DynamicTabContent 
              sliderTypeId={tab._id} 
              sliderTypeName={tab.label}
              translatedName={String(tab.translatedLabel)}
            />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

const DynamicTabContent = ({
  sliderTypeId,
  sliderTypeName,
  translatedName,
}: {
  sliderTypeId: string;
  sliderTypeName: string;
  translatedName?: string;
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sliders, setSliders] = useState<any[]>([]);
  const [gameImageMap, setGameImageMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProviderCode, setSelectedProviderCode] = useState<string | null>(null);
  const [launchingItemId, setLaunchingItemId] = useState<string | number | null>(null);

  const handleGameLaunch = async (item: any) => {
    if (launchingItemId === item?._id) return;

    setLaunchingItemId(item?._id ?? null);
    try {
      if (item?.provider_code && item?.game_code) {
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
        return;
      }

      if (item?.imageRedirectLink) {
        console.log("[Fallback Redirect Link]", item.imageRedirectLink);
        if (typeof item.imageRedirectLink === "string") {
          openGameInIframe(item.imageRedirectLink);
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Unable to launch game");
      console.error("[Oracle Launch Error]", error?.response?.data || error?.message || error);
    } finally {
      setLaunchingItemId(null);
    }
  };

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        setLoading(true);
        const res = await sliderService.getAllSliders({
          sliderTypeId,
        });

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
          const games = details?.data?.games || details?.games || [];

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

  useEffect(() => {
    setSelectedProviderCode(null);
  }, [sliderTypeId]);

  // 🔎 Search filter
  const filteredItems = useMemo(() => {
    const baseItems = selectedProviderCode
      ? sliders.filter((item) => item.provider_code === selectedProviderCode)
      : sliders;

    if (!searchQuery.trim()) return baseItems;
    
    const query = searchQuery.toLowerCase();
    return baseItems.filter((item) =>
      item.title?.toLowerCase().includes(query) ||
      item.subtitle?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  }, [sliders, searchQuery, selectedProviderCode]);

  const providerCodes = useMemo(
    () => Array.from(new Set(sliders.filter((item) => item.provider_code).map((item) => item.provider_code))),
    [sliders]
  );

  // 🔁 Convert API sliders → ItemsCard format
  const mappedItems = filteredItems.map((item) => ({
    id: item._id,
    title: item.title || item.game_code || "Game",
    subtitle: item.subtitle,
    imageUrl:
      item.image ||
      gameImageMap[`${item.provider_code}:${item.game_code}`] ||
      "https://via.placeholder.com/300x200?text=No+Image",
    onClick: () => {
      void handleGameLaunch(item);
    },
  }));

  if (loading) {
    return <DynamicTabSkeleton />;
  }

  const displayName = translatedName || sliderTypeName;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <SearchField
          onSearch={(q) => setSearchQuery(q)}
          onFilterChange={(providerCode) => setSelectedProviderCode(providerCode)}
          filters={providerCodes.map((code) => ({ id: code, label: code.toUpperCase() }))}
          placeholder={t('common.search', 'Search') + ` ${displayName}...`}
        />
      </div>

      {searchQuery && (
        <div className="mb-4 text-sm text-gray-400">
          {t('common.found', 'Found')} {filteredItems.length} {t('common.results', 'results')} for "{searchQuery}"
        </div>
      )}

      <ItemsCard
        items={mappedItems}
        loadingItemId={launchingItemId}
        title={searchQuery ? t('common.search_results', 'Search Results') : `${displayName} ${t('common.games', 'Games')}`}
        rounded={true}
        icon="🎮"
        cardWidth={{ base: "130px" }}
        cardHeight="160px"
        spaceBetween={12}
      />

      {filteredItems.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-400">
            {t('common.no_results', 'No games found matching')} "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
};

export default HeaderTabItems;