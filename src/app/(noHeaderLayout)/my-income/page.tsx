"use client";

import Link from "next/link";
import { ArrowLeft, User, Wallet, Activity, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { authService } from "@/services/api/auth.services";

export default function MyIncomePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUser = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            const res = await authService.me(undefined);
            if (res?.success && res?.data) {
                setUser(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        } finally {
            setLoading(false);
            if (isRefresh) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const balance = user?.wallet?.balance || 0;
    const username = user?.name || "Guest";

    return (
        <div className="min-h-screen bg-[#1E1D2A] pb-20">
            {/* Header */}
            <div className="relative h-14 flex items-center px-4 bg-gradient-to-r from-[#0F0D2A] to-[#3A1C71] sticky top-0 z-50 shadow-md border-b border-gray-800">
                <Link href="/account" className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/40 transition-colors mr-3">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-lg font-bold text-white flex-1 text-center pr-12 tracking-wide">My Income</h1>
            </div>

            <div className="max-w-md mx-auto px-4 pt-6 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* User Info & Balance Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#2D234A] to-[#1B192A] rounded-2xl p-5 shadow-lg shadow-purple-900/20 border border-purple-500/20">
                    {/* Decorative Blobs */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        {/* Profile header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 p-[2px]">
                                    <div className="w-full h-full bg-[#1E1D2A] rounded-full flex items-center justify-center overflow-hidden">
                                        <User className="w-6 h-6 text-gray-300" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg leading-tight">{loading ? "Loading..." : username}</h2>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <ShieldCheck className="w-3 h-3 text-green-400" />
                                        <span className="text-gray-400 text-xs">Verified Member</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => fetchUser(true)}
                                disabled={refreshing}
                                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {/* Balance display */}
                        <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                            <div className="text-gray-400 text-xs font-medium mb-1 uppercase tracking-wider flex items-center gap-1.5">
                                <Wallet className="w-3.5 h-3.5 text-pink-400" /> Total Balance
                            </div>
                            <div className="flex items-end gap-1 font-bold text-3xl text-white tracking-tight">
                                <span className="text-xl text-emerald-400 mb-0.5">৳</span>
                                {loading ? "..." : balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cashback rewards */}
                <div className="bg-[#252334] rounded-2xl p-5 border border-white/5 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-yellow-500" />
                            <span className="font-bold text-white text-base">Cashback rewards</span>
                        </div>
                        <span className="bg-yellow-500/10 text-yellow-400 text-xs px-2 py-1 rounded-full border border-yellow-500/20">up to 1.2%</span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-900/20">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 mb-0.5">Available</div>
                                <div className="text-white text-lg font-bold">0.00</div>
                            </div>
                        </div>
                        <button className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 hover:from-yellow-400 to-orange-600 hover:to-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-900/20 transform transition-all hover:-translate-y-0.5 active:translate-y-0">
                            Claim Now
                        </button>
                    </div>
                </div>

                {/* Stats Rows */}
                <div className="bg-[#252334] rounded-2xl border border-white/5 overflow-hidden shadow-md">
                    <Link href="/my-income/bets" className="flex justify-between items-center p-4 py-4 hover:bg-white/5 transition-colors border-b border-gray-800 group">
                        <span className="text-gray-300 font-medium group-hover:text-white transition-colors">All bets</span>
                        <div className="flex items-center gap-3">
                            <span className="text-white font-bold bg-black/30 px-3 py-1 rounded-lg">0</span>
                            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                        </div>
                    </Link>
                    <Link href="/bets" className="flex justify-between items-center p-4 py-4 hover:bg-white/5 transition-colors group">
                        <span className="text-gray-300 font-medium group-hover:text-white transition-colors">Valid bets</span>
                        <div className="flex items-center gap-3">
                            <span className="text-white font-bold bg-black/30 px-3 py-1 rounded-lg">0</span>
                            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                        </div>
                    </Link>
                </div>

                {/* Cashback settlement */}
                <div className="bg-[#252334] rounded-2xl p-5 border border-white/5 shadow-md mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-white">Cashback settlement</span>
                        <Link href="/my-income/settlement" className="text-purple-400 text-sm hover:text-purple-300 hover:underline">Details &gt;</Link>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Yesterday", value: "0.00" },
                            { label: "Today", value: "0.00" },
                            { label: "Total", value: "0.00" },
                        ].map((item) => (
                            <div key={item.label} className="bg-[#1E1D2A] rounded-xl p-3 text-center border border-white/5 hover:border-purple-500/30 transition-colors cursor-default">
                                <div className="text-gray-400 text-xs mb-1.5 font-medium">{item.label}</div>
                                <div className="text-white font-bold">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="h-20"></div>
        </div>
    );
}