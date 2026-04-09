"use client";

import Link from "next/link";
import { 
  Send,
  Link as LinkIcon,
  MessageCircle,
  ArrowLeft,
  Copy,
  CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";
import { authService } from "@/services/api/auth.services";
import toast from "react-hot-toast";

export default function InvitePage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, statsRes] = await Promise.all([
          authService.me(undefined),
          authService.getMyStats()
        ]);
        if (userRes?.success) setUser(userRes.data);
        if (statsRes?.success) setStats(statsRes.data);
      } catch (error) {
        console.error("Failed to fetch referral data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const referralCode = user?.referralCode || "";
  const shareLink = typeof window !== "undefined" 
    ? `${window.location.host}/register?ref=${referralCode}` 
    : "";

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const shareViaTelegram = () => {
    const text = `Join me on this amazing platform! Use my referral code: ${referralCode}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const shareViaWhatsApp = () => {
    const text = `Join me on this amazing platform! Use my referral code: ${referralCode}\n${shareLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#1E1D2A] pb-24">
      {/* Header */}
      <div className="relative h-14 flex items-center px-4 bg-gradient-to-r from-[#0F0D2A] to-[#3A1C71] sticky top-0 z-50 shadow-md border-b border-gray-800">
        <Link href="/account" className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/40 transition-colors mr-3">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-white flex-1 text-center pr-12 tracking-wide">Share</h1>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Referral Code Display */}
        <div className="bg-[#252334] rounded-2xl p-6 border border-white/5 shadow-lg text-center">
            <div className="text-gray-400 text-sm mb-2">My Referral Code</div>
            <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-widest">
                    {loading ? "......" : referralCode}
                </span>
                <button 
                  onClick={() => handleCopy(referralCode, 'code')}
                  className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    {copied === 'code' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                </button>
            </div>
        </div>

        {/* Share Options */}
        <div className="bg-[#252334] rounded-2xl p-5 border border-yellow-500/20 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="mb-4 relative z-10">
            <span className="text-gray-300 font-bold text-sm">Share to:</span>
          </div>

          <div className="space-y-3 relative z-10">
            <button 
              onClick={shareViaTelegram}
              className="w-full flex items-center justify-between p-4 bg-[#1E1D2A] rounded-xl border border-white/5 hover:border-blue-500/30 group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-900/40">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold">TG One-click Share</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-gray-600 rotate-180 group-hover:text-blue-400 transition-colors" />
            </button>

            <button 
              onClick={() => handleCopy(shareLink, 'tg-link')}
              className="w-full flex items-center justify-between p-4 bg-[#1E1D2A] rounded-xl border border-white/5 hover:border-cyan-500/30 group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-900/40">
                  <LinkIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold">Copy TG share link</span>
              </div>
              {copied === 'tg-link' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />}
            </button>

            <button 
              onClick={() => handleCopy(shareLink, 'web-link')}
              className="w-full flex items-center justify-between p-4 bg-[#1E1D2A] rounded-xl border border-white/5 hover:border-purple-500/30 group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-900/40">
                  <LinkIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold">Copy Web share link</span>
              </div>
              {copied === 'web-link' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />}
            </button>

            <button 
              onClick={shareViaWhatsApp}
              className="w-full flex items-center justify-between p-4 bg-[#1E1D2A] rounded-xl border border-white/5 hover:border-green-500/30 group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shadow-lg shadow-green-900/40">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold">WhatsApp One-click Share</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-gray-600 rotate-180 group-hover:text-green-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-[#1E1D2A] to-[#252334] rounded-2xl p-6 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-500 to-orange-600"></div>
          <div className="grid grid-cols-2 gap-8 relative z-10">
            <div className="text-center">
              <div className="text-3xl font-black text-white">{loading ? "..." : stats?.newDirectSubordinatesCount || 0}</div>
              <div className="text-gray-400 text-[10px] uppercase font-bold tracking-tighter mt-1 leading-tight">New Direct<br/>subordinates</div>
            </div>
            <div className="text-center border-l border-white/5">
              <div className="text-3xl font-black text-white">{loading ? "..." : stats?.directSubordinatesCount || 0}</div>
              <div className="text-gray-400 text-[10px] uppercase font-bold tracking-tighter mt-1 leading-tight">Direct<br/>subordinates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-20"></div>
    </div>
  );
}