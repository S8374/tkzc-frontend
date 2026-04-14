/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/shared/Logo/Logo";
import { Globe } from "lucide-react";
import SignInModal from "@/components/auth/SignInModal";
import SignUpModal from "@/components/auth/SignUpModal";
import BalanceHeader from "./BalanceHeader";
import { authService } from "@/services/api/auth.services";
import { useTranslation } from "@/hooks/useTranslation";

const Header = () => {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  // ── Auth state ────────────────────────────────────────
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch user function
  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await authService.me(undefined);
      setUser(response?.data || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Run once on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = [
    { 
      code: "zh", 
      name: "简中",
      flag: "🇨🇳",
    },
    { 
      code: "en", 
      name: "EN",
      flag: "🇬🇧",
    },
    { 
      code: "vi", 
      name: "VI",
      flag: "🇻🇳",
    },
    {
      code: "bn",
      name: "BN",
      flag: "🇧🇩",
    },
  ];

  const wallet = user?.wallet || { balance: 0 };

  const isLoggedIn = !!user;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#7A6828] bg-linear-to-r from-[#7E6A24] via-[#7A6A2A] to-[#6D5C22] shadow-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-4 lg:px-6">
          {/* Logo */}
          <div className="flex shrink-0 h-20 w-20 items-center">
            <Logo />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
            ) : isLoggedIn ? (
              <>
                <BalanceHeader 
                  wallet={wallet} 
                  onRefresh={fetchUser}
                />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full border-[#EAD73A] bg-transparent px-5 text-[#F4F1D8] hover:bg-[#EAD73A]/10 hover:text-white"
                  onClick={() => setIsSignInOpen(true)}
                >
                  {t('common.signIn')}
                </Button>

                <Button
                  size="sm"
                  className="h-9 rounded-full bg-[#F1DF3A] px-5 font-semibold text-[#2F2A12] hover:bg-[#F5E85D]"
                  onClick={() => setIsSignUpOpen(true)}
                >
                  {t('common.signUp')}
                </Button>
              </div>
            )}

            {/* Language Selector */}
            <div className="relative" ref={dropdownRef}>
              <Button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                size="icon"
                className="h-8 w-8 rounded-full border border-[#D9C96A]/60 bg-[#7A6828]/50 text-[#F4F1D8] hover:bg-[#8B7830]"
                aria-label="Change language"
              >
                <Globe className="h-4 w-4" />
              </Button>

              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#F3F3F3] shadow-2xl z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsLanguageOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition ${
                        currentLanguage === lang.code
                          ? "bg-[#E9E9E9] font-semibold text-[#1A1A1A]"
                          : "text-[#2C2C2C] hover:bg-[#EDEDED]"
                      }`}
                    >
                      <span className="text-left font-bold tracking-wide">{lang.name}</span>
                      {currentLanguage === lang.code && (
                        <span className="ml-auto text-xs text-green-500">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onLoginSuccess={fetchUser}
      />
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onRegisterSuccess={fetchUser}
      />
    </>
  );
};

export default Header;