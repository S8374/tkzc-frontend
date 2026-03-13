"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Headphones,
  Crown,
  ShieldCheck,
  Bot,
  X,
  MessageCircle,
  Phone,
  Mail,
  Loader2
} from "lucide-react";
import { supportService, Support } from "@/services/api/support.service";
import { useTranslation } from "@/hooks/useTranslation";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Icon mapping
const iconComponents: Record<string, any> = {
  Send,
  Headphones,
  Crown,
  ShieldCheck,
  Bot,
  MessageCircle,
  Phone,
  Mail,
};

// Color mapping for different icons
const iconColors: Record<string, string> = {
  Send: "text-sky-400",
  Headphones: "text-orange-400",
  Crown: "text-yellow-400",
  ShieldCheck: "text-purple-400",
  Bot: "text-pink-400",
  MessageCircle: "text-green-400",
  Phone: "text-blue-400",
  Mail: "text-red-400",
};

export default function CustomerModal({
  isOpen,
  onClose,
}: CustomerModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const [supports, setSupports] = useState<Support[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch active supports
  useEffect(() => {
    if (isOpen) {
      fetchSupports();
    }
  }, [isOpen]);

  const fetchSupports = async () => {
    try {
      setLoading(true);
      const response = await supportService.getActiveSupports();
      if (response?.success) {
        setSupports(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch supports:", error);
    } finally {
      setLoading(false);
    }
  };

  // ESC + outside click
  useEffect(() => {
    if (!isOpen) return;

    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const clickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", esc);
    document.addEventListener("mousedown", clickOutside);

    return () => {
      document.removeEventListener("keydown", esc);
      document.removeEventListener("mousedown", clickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="relative w-full max-w-sm rounded-t-3xl bg-[#2c2b33] border border-yellow-500/60 shadow-[0_0_30px_rgba(255,200,80,0.25)]"
      >
        {/* Robot */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Bot className="w-12 h-12 text-black" />
          </div>
        </div>

        {/* Header */}
        <div className="pt-16 pb-4 text-center px-4">
          <h2 className="text-lg font-bold text-white">
            {t('support.title', '24 hours online service')}
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            {t('support.subtitle', 'serve wholeheartedly for you')}
          </p>
        </div>

        {/* List */}
        <div className="px-4 pb-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
            </div>
          ) : supports.length > 0 ? (
            supports.sort((a, b) => a.order - b.order).map((item) => {
              const IconComponent = iconComponents[item.icon] || MessageCircle;
              const colorClass = iconColors[item.icon] || "text-gray-400";

              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#1f1e26] border border-yellow-500/20"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-5 h-5 ${colorClass}`} />
                    <span className="text-white text-sm font-medium">
                      {item.label}
                    </span>
                  </div>

                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold shadow hover:brightness-110 transition"
                  >
                    {item.buttonText}
                  </a>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">{t('support.no_support', 'No support options available')}</p>
            </div>
          )}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}