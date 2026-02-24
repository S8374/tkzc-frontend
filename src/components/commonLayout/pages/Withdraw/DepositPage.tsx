// app/deposit/page.tsx
"use client";

import { useState } from "react";
import {
  Wallet,
  Copy,
  Upload,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import BackButton from "@/components/ui/BackButton";

type Tab = "manual" | "auto" | "crypto";

export default function DepositPage() {
  const [activeTab, setActiveTab] = useState<Tab>("crypto"); // default to crypto like your last screenshot
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");

  const walletAddress = "TEfuvvysBmXuUmBUxZGFM1J9a6LSVHGCP";
  const transactionIdExample = "dfsdfwqo39338th40-2"; // from your screenshot

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyTxId = () => {
    navigator.clipboard.writeText(transactionIdExample);
    // can add separate copied state if needed
  };

  return (
    <div className="min-h-screen bg-[#1E1D2A] text-white pb-10">
      {/* Header */}
      <div className="relative h-16 flex items-center justify-between px-4 border-b border-gray-800">
        <BackButton />
        <h1 className="text-xl font-bold flex-1 text-center">Deposit</h1>
        <button className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50">
          <AlertCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-5 pb-3">
        <div className="grid grid-cols-3 gap-2 bg-[#252334] rounded-xl p-1.5 border border-gray-800/60">
          <button
            onClick={() => setActiveTab("manual")}
            className={`py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === "manual"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
              : "text-gray-400 hover:text-white hover:bg-black/30"
              }`}
          >
            BDT - Manual
          </button>
          <button
            onClick={() => setActiveTab("auto")}
            className={`py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === "auto"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
              : "text-gray-400 hover:text-white hover:bg-black/30"
              }`}
          >
            Auto Deposit
          </button>
          <button
            onClick={() => setActiveTab("crypto")}
            className={`py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === "crypto"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md"
              : "text-gray-400 hover:text-white hover:bg-black/30"
              }`}
          >
            Crypto Deposit
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-md mx-auto px-4">
        {activeTab === "manual" && (
          <div className="bg-[#252334] rounded-2xl p-6 border border-gray-800/50">
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {["bKash", "Nagad", "Rocket", "Upay", "SureCash", "bKash", "Bank Transfer"].map((method) => (
                <div
                  key={method}
                  className="w-28 h-20 bg-gray-800 rounded-xl flex flex-col items-center justify-center p-2 hover:bg-gray-700 transition"
                >
                  <div className="w-8 h-8 bg-white rounded-full mb-1 flex items-center justify-center">
                    {/* Replace with real icons/logos */}
                    <span className="text-xs font-bold text-black">{method.slice(0, 2)}</span>
                  </div>
                  <span className="text-xs text-center">{method}</span>
                </div>
              ))}
            </div>
            {/* Instructions – exactly as you showed */}
            <div className="bg-gray-900/60 rounded-xl p-5 border border-gray-700/50">
              {/* <h3 className="text-base font-semibold mb-4 text-yellow-400 flex items-center gap-2">
        How to Send Money via bKash
      </h3> */}
              <ul className="space-y-3 text-sm text-gray-200">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">•</span>
                  <span>Dial <span className="font-mono bg-black/40 px-1.5 py-0.5 rounded">*247#</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">•</span>
                  <span>Select <strong>Send Money</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">•</span>
                  <span>Select Receiver's bKash Number</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">•</span>
                  <span>Enter the Amount</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">•</span>
                  <span>Enter a Reference (optional, e.g., Rent / Gift)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">•</span>
                  <span>Enter your bKash PIN</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">•</span>
                  <span>Confirm the transaction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold mt-0.5">•</span>
                  <span>Confirmation SMS → Type transaction ID</span>
                </li>
              </ul>
            </div>


            <div className="space-y-4">

              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Enter Amount (BDT)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter Amount (BDT)"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white text-center text-xl placeholder-gray-500 focus:outline-none focus:border-green-500"
                />

              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Type SMS transaction ID (optional)</label>
                <input
                  type="text"
                  placeholder="Enter SMS ID"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white text-center text-xl placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Sender Account Number</label>
                <input
                  type="text"
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white text-center text-xl placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>
              <button className="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:brightness-110 transition">
                Deposit Now
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-5">
              Minimum: 100 BDT • Maximum deposit amount 10,000 BDT
            </p>
          </div>
        )}

        {activeTab === "auto" && (
          <div className="bg-[#252334] rounded-2xl p-6 border border-gray-800/50 text-center">
            <div className="mb-6">
              <div className="bg-green-900/30 border border-green-800/50 rounded-lg p-4 mb-5 text-sm">
                <p className="text-green-300 font-medium">
                  গাড়ি পেমেন্ট করতে হলে ২.০% চার্জ লাগবে এবং বিকাশ/নগদ/রকেট থেকে পেমেন্ট করুন
                </p>
              </div>
              <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  {/* Replace with real bKash/Nagad auto logo */}
                  <span className="text-xl font-bold text-black">Auto</span>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">Auto Deposit (bKash / Nagad)</h3>
              <p className="text-gray-400 text-sm">
                Instant deposit — no need to upload screenshot
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter Amount (BDT)"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-white text-center text-xl placeholder-gray-500 focus:outline-none focus:border-green-500"
              />

              <button className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-lg rounded-xl hover:brightness-110 transition">
                Proceed to Auto Deposit
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Service charge may apply • Instant confirmation
            </p>
          </div>
        )}

        {activeTab === "crypto" && (
          <div className="bg-[#252334] rounded-2xl p-6 border border-gray-800/50">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full">
                <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">USDT</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full">
                <span className="font-bold text-orange-400">TRON</span>
                <span className="text-xs text-gray-400">TRC20</span>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-gray-200">
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold mt-0.5">•</span>
                <span>Dial <span className="font-mono bg-black/40 px-1.5 py-0.5 rounded">*247#</span></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold mt-0.5">•</span>
                <span>Select <strong>Send Money</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold mt-0.5">•</span>
                <span>Select Receiver's bKash Number</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-bold mt-0.5">•</span>
                <span>Enter the Amount</span>
              </li>

            </ul>
            {/* QR would go here - you can add it like previous version */}

            <div className="text-center mb-5">
              <div className="text-gray-400 text-sm mb-2">Wallet / TRC20 Address</div>
              <div className="font-mono bg-black/40 flex items-center justify-center rounded-lg p-3 break-all text-sm">
                {walletAddress} <button
                  onClick={copyAddress}
                  className="mt-2 text-xs  text-yellow-400 hover:underline flex items-center gap-1 mx-auto"
                >
                  <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy"}
                </button>
              </div>

            </div>

            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Enter Amount (USDT)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Upload Screenshot (optional)</label>
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-5 text-center hover:border-yellow-500/50 transition cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-400">Tap to upload proof</p>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:brightness-110 transition">
                Deposit Now
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-5">
              Minimum: 1 USDT • Maximum deposit amount 100 USDT
            </p>
          </div>
        )}
      </div>
    </div>
  );
}