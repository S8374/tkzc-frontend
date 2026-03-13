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
  isActive: boolean;
  order: number;
}

export default function Banner() {
  const [slides, setSlides] = useState<Slider[]>([]);
  const [marquees, setMarquees] = useState<MarqueeItem[]>([]);
  const [loading, setLoading] = useState(true);
 console.log("marquees:", marquees);
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
  const marqueeText = marquees.map(m => m.text).join(" • ");
  console.log("marqueeText:", marqueeText);
  if (loading) {
    return (
      <div className="relative rounded-xl overflow-hidden">
        <div className="bg-chart-4/30 h-10 animate-pulse"></div>
        <div className="w-full h-[30vh] md:h-[30vh] bg-gray-800 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Marquee - Only show if there are active marquees */}
      {marquees.length > 0 && (
        <div className="bg-chart-4/30 ">
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
          className="w-full h-[30vh] "
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide._id}>
              {/* Background */}
              <div
                className="absolute inset-0 bg-cover bg-center rounded-none"
                style={{ backgroundImage: `url(${slide.image})` }}
                data-swiper-parallax="-30%"
              />

              {/* You can add title/subtitle here if needed */}
              <div className="absolute bottom-10 left-10 text-white z-10">
            
                {slide.subtitle && (
                  <p className="text-lg">{slide.subtitle}</p>
                )}
                {slide.buttonText && slide.buttonLink && (
                  <a
                    href={slide.buttonLink}
                    className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {slide.buttonText}
                  </a>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="w-full h-[30vh] md:h-[30vh] bg-gray-800 flex items-center justify-center">
          <p className="text-gray-400">No hero slides available</p>
        </div>
      )}
    </div>
  );
}