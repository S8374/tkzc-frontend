"use client";

import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { authService } from "@/services/api/auth.services";

const NavItems = () => {
  const { t } = useTranslation();
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [loading, setLoading] = useState(true);
  console.log("NavItems rendered, isLoggedIn:", isLoggedIn);
  const items = useMemo(() => [
    {
      iconImg: "https://tkzc668.com/static/img/%E9%87%91%E5%88%9A%E5%8C%BA_%E5%85%85%E5%80%BC.79e3487a.webp",
      translationKey: "deposit",
      href: "/deposit",
      color: "from-blue-500 to-cyan-500",
    },
    {
      iconImg: "https://tkzc668.com/static/img/recharge.77f88fba.png",
      translationKey: "withdraw",
      href: "/withdraw",
      color: "from-green-500 to-emerald-500",
    },
    {
      iconImg: "https://tkzc668.com/static/img/renwu.08955b7b.png",
      translationKey: "tasks",
      href: "/tasks",
      color: "from-purple-500 to-pink-500",
    },
    {
      iconImg: "https://tkzc668.com/static/img/shouru.c9225545.png",
      translationKey: "income",
      href: "/my-income",
      color: "from-rose-500 to-pink-500",
    },
    {
      iconImg: "https://tkzc668.com/static/img/inviteFriends.78ba91c4.png",
      translationKey: "invite",
      href: "/invite",
      color: "from-indigo-500 to-violet-500",
    },
  ], []);

  const getTranslatedLabel = (key: string): string => {
    const translationMap: Record<string, string> = {
      deposit: t("common.deposit"),
      withdraw: t("common.withdraw"),
      tasks: t("header.games"),
      income: t("wallet.balance"),
      invite: t("auth.referralCode"),
    };

    return translationMap[key] || key;
  };
useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await authService.me(undefined);

      if (res?.statusCode === 200) {
        setIsLoggedIn(true);
      }
    } catch {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, []);

  // 🔥 LOGIN CHECK
const handleProtectedClick = (e: React.MouseEvent) => {
  if (loading) {
    e.preventDefault();
    return;
  }

  if (!isLoggedIn) {
    e.preventDefault();
    toast.error("Please login first");
  }
};
  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 px-2 py-4">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={handleProtectedClick}
          className="flex flex-col items-center group cursor-pointer"
        >
          <img
            src={item.iconImg}
            alt={getTranslatedLabel(item.translationKey)}
            className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
          />

          <span className="mt-2 text-xs sm:text-sm font-medium text-background dark:text-gray-300 group-hover:text-blue-400 transition-colors duration-300">
            {getTranslatedLabel(item.translationKey)}
          </span>

          <span
            className={`w-1 h-1 rounded-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${item.color}`}
          />
        </Link>
      ))}
    </div>
  );
};

export default NavItems;