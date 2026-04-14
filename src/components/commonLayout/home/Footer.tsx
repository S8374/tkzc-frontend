"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Gift,
  Download,
  User,
  Headset,
} from "lucide-react";
import { useState, useEffect } from "react";
import CustomerModal from "../model/CustomerModal";
import { useTranslation } from "@/hooks/useTranslation";
import toast from "react-hot-toast";
import { authService } from "@/services/api/auth.services";

const Footer = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  console.log("Footer rendered, isLoggedIn:", isLoggedIn);
  // ✅ Check login using /auth/me
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authService.me(undefined);
        console.log("Auth check response:", res);
        setIsLoggedIn(!!(res?.success && res?.data));
      } catch {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  const navItems = [
    {
      id: "home",
      label: t("footer.home", "Home"),
      href: "/",
      icon: Home,
    },
    {
      id: "promotion",
      label: t("footer.promo", "Promo"),
      href: "/promotion",
      icon: Gift,
    },
    {
      id: "customer",
      label: t("footer.customer", "Customer"),
      href: "#",
      icon: Headset,
    },
    {
      id: "download",
      label: t("footer.download", "Download"),
      href: "/vpn-download",
      icon: Download,
    },
    {
      id: "account",
      label: t("footer.account", "Account"),
      href: "/account",
      icon: User,
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <>
      <footer className="bg-[#22222B]/80 sticky bottom-0 z-50 backdrop-blur-sm border-t border-gray-800">
        <nav className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={(e) => {
                  e.preventDefault();

                  if (item.id === "customer") {
                    setIsCustomerOpen(true);
                    return;
                  }

                  // 🔒 Protected pages
                  const protectedRoutes = [
                    "/account",
                    "/deposit",
                    "/withdraw",
                    "/tasks",
                    "/my-income",
                    "/invite",
                  ];

                  if (protectedRoutes.includes(item.href)) {
                    authService.me(undefined)
                      .then((res) => {
                        if (res?.success && res?.data) {
                          setIsLoggedIn(true);
                          handleNavigation(item.href);
                          return;
                        }
                        setIsLoggedIn(false);
                        toast.error("Please login first");
                      })
                      .catch(() => {
                        setIsLoggedIn(false);
                        toast.error("Please login first");
                      });
                    return;
                  }

                  handleNavigation(item.href);
                }}
                className={`flex flex-col cursor-pointer items-center justify-center gap-1 flex-1 py-2 transition-all duration-200
                  ${isActive
                    ? "text-[#a79556] scale-105"
                    : "text-white hover:text-[#a79556] hover:scale-105"
                  }
                `}
                aria-label={item.label}
              >
                <Icon
                  className={`w-6 h-6 transition-all duration-200 ${isActive ? "scale-110" : "scale-100"
                    }`}
                />

                <span className="text-[11px] font-medium leading-none">
                  {item.label}
                </span>

                {isActive && (
                  <span className="absolute -top-1 w-1 h-1 rounded-full bg-[#a79556]" />
                )}
              </button>
            );
          })}
        </nav>
      </footer>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isCustomerOpen}
        onClose={() => setIsCustomerOpen(false)}
      />
    </>
  );
};

export default Footer;