// components/account/SafeCenter.tsx
"use client";

import {
  Mail,
  Lock,
  Shield,
  Wallet,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import AddWalletAddressModal from "./modal/AddWalletAddressModal";
import SetWithdrawPasswordModal from "./modal/SetWithdrawPasswordModal";
import ModifyLoginPasswordModal from "./modal/ModifyLoginPasswordModal";
import SetEmailModal from "./modal/SetEmailModal";
import AddNewAddressModal from "./modal/AddNewAddressModal";
import BackButton from "@/components/ui/BackButton";


export default function SafeCenter() {
  // Modal states
  const [isSetEmailOpen, setIsSetEmailOpen] = useState(false);
  const [isModifyPassOpen, setIsModifyPassOpen] = useState(false);
  const [isSetWithdrawOpen, setIsSetWithdrawOpen] = useState(false);
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isAddNewAddressOpen, setIsAddNewAddressOpen] = useState(false);
  const [addressMode, setAddressMode] = useState<"add" | "update">("add");
  const [initialAddress, setInitialAddress] = useState("");
  const [initialProtocol, setInitialProtocol] = useState<"TRC20" | "ERC20" | "BEP20">("TRC20");

  const items = [
    {
      id: "email",
      label: "Set email",
      icon: Mail,
      onClick: () => setIsSetEmailOpen(true)
    },
    {
      id: "password",
      label: "Modify log in password",
      icon: Lock,
      onClick: () => setIsModifyPassOpen(true)
    },
    {
      id: "withdraw-password",
      label: "Set withdraw password",
      icon: Shield,
      onClick: () => setIsSetWithdrawOpen(true)
    },
    {
      id: "wallet",
      label: "Bind withdraw wallet address",
      icon: Wallet,
      onClick: () => setIsAddWalletOpen(true)
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F0D2A] pb-20">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        <BackButton />
        <h2 className="text-xl font-bold text-white">Safe Center</h2>
        <p></p>
      </div>
      {/* Hero */}
      <div className="relative h-48 overflow-hidden">
        <div
          className="absolute inset-0  bg-cover bg-center"
          style={{
            backgroundImage: `radial-gradient(circle at center, #1a1826 0%, #0F0D2A 70%)`,
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <div className="relative w-24 h-24 mb-4">
            <div className="absolute inset-0 rounded-full bg-linear-to-r from-yellow-500 to-orange-500 blur-xl opacity-50 animate-pulse"></div>
            <div className="relative w-full h-full rounded-full bg-black/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Account Security</h1>
          <p className="text-gray-300 max-w-xs">
            Manage password, email, and withdraw wallet protection
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 pt-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="w-full flex items-center justify-between p-4 bg-[#1E1D2A] rounded-xl border border-gray-700 hover:bg-[#252334] transition-colors mb-3"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-400" />
                <span className="text-white">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          );
        })}
      </div>

      {/* Modals */}
      <SetEmailModal
        isOpen={isSetEmailOpen}
        onClose={() => setIsSetEmailOpen(false)}
      />

      <ModifyLoginPasswordModal
        isOpen={isModifyPassOpen}
        onClose={() => setIsModifyPassOpen(false)}
      />

      <SetWithdrawPasswordModal
        isOpen={isSetWithdrawOpen}
        onClose={() => setIsSetWithdrawOpen(false)}
      />

      <AddWalletAddressModal
        isOpen={isAddWalletOpen}
        onClose={() => setIsAddWalletOpen(false)}
        onAddNew={() => {
          setAddressMode("add");
          setInitialAddress("");
          setInitialProtocol("TRC20");
          setIsAddWalletOpen(false);
          setIsAddNewAddressOpen(true);
        }}
        onEdit={(walletAddress, protocol) => {
          setAddressMode("update");
          setInitialAddress(walletAddress);
          setInitialProtocol(protocol);
          setIsAddWalletOpen(false);
          setIsAddNewAddressOpen(true);
        }}
      />

      <AddNewAddressModal
        isOpen={isAddNewAddressOpen}
        onClose={() => setIsAddNewAddressOpen(false)}
        mode={addressMode}
        initialAddress={initialAddress}
        initialProtocol={initialProtocol}
        onSaved={() => {
          setIsAddNewAddressOpen(false);
          setIsAddWalletOpen(true);
        }}
      />

      {/* Bottom padding */}
      <div className="h-20"></div>
    </div>
  );
}