/* eslint-disable react/jsx-key */
"use client";

import { sliderTypeService } from "@/services/api/slider.types";
import Logo from "@/shared/Logo/Logo";
import Link from "next/link";
import { useEffect, useState } from "react";

// const promotionItems = [
//   {
//     id: "1",
//     image:
//       "https://admin.tkv6test.cc/uploads/20251126/0ab6232392ffde09f96e20d02035afea.png",
//   },
//   {
//     id: "2",
//     image:
//       "https://admin.tkv6test.cc/uploads/20251126/1f97f88339250ae8d7a654b598a645d8.png",
//   },
//   {
//     id: "3",
//     image:
//       "https://admin.tkv6test.cc/uploads/20251126/ef98c6653485bd4e4176289a99ceeaab.png",
//   },
// ];

const PromotionSection = () => {
  const [promotionBanner, setpromotionBanner] = useState<any[]>([]);
  console.log("Promotion Banners:", promotionBanner);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both sliders and marquees in parallel
        const [sliderRes] = await Promise.all([
          sliderTypeService.getSliderTypeWithSliders(),
        ]);

        // Process slider data
        if (sliderRes?.success && sliderRes?.data) {
          const heroType = sliderRes.data.find(
            (type: any) => type.name.toLowerCase() === "promotion"
          );
          if (heroType && heroType.sliders) {
            setpromotionBanner(heroType.sliders);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p>Loading promotions...</p>
      </div>
    );
  }
  return (
    <div
      style={{
        backgroundImage:
          "url('https://img.tkzc886.com/imgcn/tkzc/bg_login.webp')",
      }}
      className="min-h-dvh"
    >
      {/* Logo */}
      <div className="flex shrink-0 h-20 w-20 ml-4 items-center">
        <Logo />
      </div>

      {/* Promotions */}
      <div className="max-w-6xl mx-auto space-y-4 p-4">
        {promotionBanner.map((item) => (
          <Link
            key={item._id}
            href={`/promotion/${item._id}`}
            className="block"
          >
            <div
              className="relative rounded-xl overflow-hidden group cursor-pointer"
              style={{
                backgroundImage: `url(${item.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "180px",
              }}
            >
              {/* Optional hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
export default PromotionSection;