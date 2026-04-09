"use client";

import Link from "next/link";
import { ArrowLeft, Target } from "lucide-react";

export default function ValidBetsPage() {
    return (
        <div className="min-h-screen bg-[#1E1D2A] pb-20">
            {/* Header */}
            <div className="relative h-14 flex items-center px-4 bg-gradient-to-r from-[#0F0D2A] to-[#3A1C71] sticky top-0 z-50 shadow-md border-b border-gray-800">
                <Link href="/my-income" className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/40 transition-colors mr-3">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-lg font-bold text-white flex-1 text-center pr-12 tracking-wide">Valid Bets</h1>
            </div>

            <div className="max-w-md mx-auto px-4 pt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[#252334] rounded-2xl border border-white/5 shadow-md">
                    <Target className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-300 mb-2">No Data Available</h3>
                    <p className="text-sm text-gray-500">
                        You have not placed any valid bets yet.
                    </p>
                </div>
            </div>
        </div>
    );
}
