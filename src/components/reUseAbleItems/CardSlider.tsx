/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface CardSliderItem {
    id: string | number;
    title: string;
    subtitle?: string;
    imageUrl: string;
    extra?: ReactNode;
    provider_code?: string;
    game_code?: string;
    game_type?: string;
}

interface CardSliderProps {
    items: CardSliderItem[];
    cardWidth?: { base: string; sm?: string; md?: string }; // width strings, e.g., "140px"
    cardHeight?: string; // e.g., "140px"
    spaceBetween?: number;
    title?: string;
    icon?: ReactNode;
    className?: string;
    rounded?: boolean; // optional rounded control
    showArrows?: boolean; // ✅ NEW
    onCardClick?: (item: CardSliderItem) => Promise<void>; // ✅ NEW

}

export default function CardSlider({
    items,
    cardWidth = { base: "120px", sm: "130px", md: "140px" },
    cardHeight = "140px",
    spaceBetween = 14,
    title,
    icon,
    className = "",
    rounded = true,
    showArrows = true, // ✅ default: show arrows
    onCardClick, // ✅ NEW

}: CardSliderProps) {
    const [swiper, setSwiper] = useState<any>(null);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);
    const [launchingId, setLaunchingId] = useState<string | number | null>(null); // ✅ NEW

    const syncState = (s: any) => {
        if (!s) return;
        setIsBeginning(s.isBeginning);
        setIsEnd(s.isEnd);
    };

    // Helper for rounded classes
    const roundedClass = rounded ? "rounded-lg" : "";

    return (
        <div className={`w-full bg-[#3B393A] px-4 py-4 ${className}`}>
            {(title || icon) && (
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-background font-semibold">
                        {icon} <span className="text-white">{title}</span>
                    </div>


                    {showArrows && (
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={() => swiper?.slidePrev()}
                                disabled={!swiper || isBeginning}
                                className={`w-8 h-8 flex items-center justify-center bg-white text-black hover:bg-gray-200 hover:text-black shadow-sm
          ${isBeginning ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>

                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={() => swiper?.slideNext()}
                                disabled={!swiper || isEnd}
                                className={`w-8 h-8 flex items-center justify-center bg-white text-black hover:bg-gray-200 hover:text-black shadow-sm
          ${isEnd ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <Swiper
                modules={[Navigation]}
                slidesPerView="auto"
                spaceBetween={spaceBetween}
                grabCursor
                watchOverflow
                onSwiper={(s) => {
                    setSwiper(s);
                    syncState(s);
                }}
                onSlideChange={syncState}
                onResize={syncState}
                className="w-full overflow-visible!"
            >
                {items.map((item) => (
                    <SwiperSlide
                        key={item.id}
                        style={{
                            width: cardWidth.base, // dynamic width for base
                        }}
                        className="overflow-visible!"
                    >
                        <button
                            onClick={async () => {
                                if (onCardClick && item.provider_code && item.game_code) {
                                    setLaunchingId(item.id);
                                    try {
                                        await onCardClick(item);
                                    } finally {
                                        setLaunchingId(null);
                                    }
                                }
                            }}
                            disabled={launchingId === item.id}
                            className={`group flex flex-col border border-black/30 overflow-hidden cursor-pointer bg-black/20 backdrop-blur-sm hover:border-white/30 transition-all w-full ${roundedClass} ${launchingId === item.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                            style={{
                                borderRadius: rounded ? undefined : 0,
                            }}
                        >
                            {/* Image */}
                            <div
                                className="relative w-full overflow-hidden"
                                style={{ height: cardHeight }}
                            >
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="absolute bg-no-repeat bg-cover inset-0 w-full h-full transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                                {launchingId === item.id && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                    </div>
                                )}
                            </div>

                            {/* Text */}
                            {/* <div className="p-2 text-white">
                                <div className="text-sm font-semibold leading-tight truncate">
                                    {item.title}
                                </div>
                                {item.subtitle && (
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        {item.subtitle}
                                    </div>
                                )}
                                {item.extra && <div className="mt-1">{item.extra}</div>}
                            </div> */}
                        </button>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
