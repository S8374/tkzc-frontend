// components/modals/AddNewAddressModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Zap, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle,
  ChevronLeft,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import { accountService } from "@/services/api/account.service";

interface AddNewAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  mode?: "add" | "update";
  initialAddress?: string;
  initialProtocol?: "TRC20" | "ERC20" | "BEP20";
}

export default function AddNewAddressModal({
  isOpen,
  onClose,
  onSaved,
  mode = "add",
  initialAddress = "",
  initialProtocol = "TRC20",
}: AddNewAddressModalProps) {
  const [protocol, setProtocol] = useState("TRC20");
  const [address, setAddress] = useState("");
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setProtocol(initialProtocol);
    setAddress(initialAddress);
    setWithdrawPassword("");
  }, [isOpen, initialAddress, initialProtocol]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim()) {
      toast.error("Please enter wallet address");
      return;
    }

    if (!withdrawPassword.trim()) {
      toast.error("Please enter withdrawal password");
      return;
    }

    try {
      setSubmitting(true);
      await accountService.setWalletAddress({
        walletAddress: address.trim(),
        protocol: protocol as "TRC20" | "ERC20" | "BEP20",
        currentWalletPassword: withdrawPassword,
      });
      toast.success(mode === "update" ? "Wallet address updated successfully" : "Wallet address saved successfully");
      setAddress("");
      setWithdrawPassword("");
      onSaved?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save wallet address");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div ref={modalRef} className="w-full max-w-md rounded-t-2xl overflow-hidden bg-[#1E1D2A] border-t-4 border-gray-800">
        {/* Header */}
        <div className="p-4 flex items-center gap-2 border-b border-gray-800">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/40"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white">
            {mode === "update" ? "Update wallet address" : "Add new address"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Select protocol */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Zap className="w-5 h-5 text-gray-400" />
            </div>
            <select
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-[#252334] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none"
            >
              <option value="TRC20">TRC-20</option>
              <option value="ERC20">ERC-20</option>
              <option value="BEP20">BEP-20</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Add address */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Wallet className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Please enter wallet address"
              className="w-full pl-10 pr-4 py-3 bg-[#252334] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Withdraw Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={withdrawPassword}
              onChange={(e) => setWithdrawPassword(e.target.value)}
              placeholder="Enter withdraw password to confirm"
              className="w-full pl-10 pr-10 py-3 bg-[#252334] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Hint */}
          <div className="flex items-start gap-2 p-3 bg-[#252334] rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-gray-300 text-sm">
              Hint: For the safety of your funds, please make sure that the address you add is the same as the selected protocol.
            </p>
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-linear-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-60"
          >
            {submitting ? "Saving..." : mode === "update" ? "Update Address" : "Confirm"}
          </button>
        </form>
      </div>
    </div>
  );
}