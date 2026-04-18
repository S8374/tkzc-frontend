"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Parallax, Pagination, Navigation, Autoplay } from "swiper/modules";
import Marquee from "react-fast-marquee";
import { Megaphone } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { sliderTypeService } from "@/services/api/slider.types";
import { marqueeService } from "@/services/api/marquee.service";
import { useTranslation } from "@/hooks/useTranslation";

interface Slider {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  order: number;
}

interface MarqueeItem {
  _id: string;
  text: string;
  textTranslations?: {
    en?: string;
    zh?: string;
    vi?: string;
    bn?: string;
  };
  isActive: boolean;
  order: number;
}

const HERO_BANNER_HEIGHT = "h-[150px] ";

export default function Banner() {
  const { currentLanguage } = useTranslation();
  const [slides, setSlides] = useState<Slider[]>([]);
  const [marquees, setMarquees] = useState<MarqueeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizedLanguage = currentLanguage?.toLowerCase().startsWith("zh")
    ? "zh"
    : currentLanguage?.toLowerCase().startsWith("vi")
      ? "vi"
      : currentLanguage?.toLowerCase().startsWith("bn")
        ? "bn"
        : "en";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both sliders and marquees in parallel
        const [sliderRes, marqueeRes] = await Promise.all([
          sliderTypeService.getSliderTypeWithSliders(),
          marqueeService.getActiveMarquees()
        ]);

        // Process slider data
        if (sliderRes?.success && sliderRes?.data) {
          const heroType = sliderRes.data.find(
            (type: any) => type.name.toLowerCase() === "hero"
          );
          if (heroType && heroType.sliders) {
            setSlides(heroType.sliders);
          }
        }

        // Process marquee data
        if (marqueeRes?.success && marqueeRes?.data) {
          // Sort by order to ensure proper display order
          const sortedMarquees = marqueeRes.data.sort((a: MarqueeItem, b: MarqueeItem) => a.order - b.order);
          setMarquees(sortedMarquees);
        }

      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combine all active marquee texts
  const marqueeText = marquees
    .map((m) => {
      const translations = m.textTranslations || {};
      const byCurrentLang = translations[normalizedLanguage as keyof typeof translations];

      return byCurrentLang || translations.en || m.text;
    })
    .join(" • ");

  if (loading) {
    return (
      <div className="relative rounded-xl overflow-hidden">
        <div className="bg-linear-to-r from-[#7E6A24] via-[#7A6A2A] to-[#6D5C22] h-10 animate-pulse"></div>
        <div className={`w-full ${HERO_BANNER_HEIGHT} bg-gray-800 animate-pulse`}></div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Marquee - Only show if there are active marquees */}
      {marquees.length > 0 && (
        <div className="bg-linear-to-r from-[#7E6A24] via-[#7A6A2A] to-[#6D5C22]">
          <div className="p-2 flex items-center">
            <Megaphone className="text-white mr-2 ml-2" size={20} />
            <Marquee 
              className="text-white font-medium"
              speed={40}
              gradient={false}
              pauseOnHover
            >
              {marqueeText}
            </Marquee>
          </div>
        </div>
      )}

      {/* Swiper - Only show if there are slides */}
      {slides.length > 0 ? (
        <Swiper
          speed={800}
          parallax
          autoplay={{ delay: 4000 }}
          pagination={{ clickable: true }}
          navigation
          modules={[Parallax, Pagination, Navigation, Autoplay]}
          className={`w-full ${HERO_BANNER_HEIGHT}`}
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide._id}>
              {/* Background */}
              <div
                className="absolute inset-0 bg-cover bg-center rounded-none"
                style={{ backgroundImage: `url(${slide.image})` }}
                data-swiper-parallax="-30%"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className={`w-full ${HERO_BANNER_HEIGHT} bg-gray-800 flex items-center justify-center`}>
          <p className="text-gray-400">No hero slides available</p>
        </div>
      )}
    </div>
  );
}