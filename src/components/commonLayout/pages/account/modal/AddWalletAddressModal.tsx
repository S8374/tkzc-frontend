// components/modals/AddWalletAddressModal.tsx
"use client";

import { useEffect, useState } from "react";
import { 
  Plus,
  ChevronLeft,
  Pencil,
  Trash2,
  Lock,
} from "lucide-react";
import { accountService } from "@/services/api/account.service";
import toast from "react-hot-toast";

interface AddWalletAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNew: () => void;
  onEdit: (walletAddress: string, protocol: "TRC20" | "ERC20" | "BEP20") => void;
}

export default function AddWalletAddressModal({ isOpen, onClose, onAddNew, onEdit }: AddWalletAddressModalProps) {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [protocol, setProtocol] = useState<"TRC20" | "ERC20" | "BEP20">("TRC20");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchWallet = async () => {
    try {
      const wallet = await accountService.getWallet();
      setWalletAddress(wallet?.walletAddress || "");
      setProtocol((wallet?.protocol as "TRC20" | "ERC20" | "BEP20") || "TRC20");
    } catch {
      setWalletAddress("");
      setProtocol("TRC20");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchWallet();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-2xl overflow-hidden bg-[#1E1D2A] border-t-4 border-gray-800">
        {/* Header */}
        <div className="p-4 flex items-center gap-2 border-b border-gray-800">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/40"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white">Add wallet address</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="rounded-xl border border-gray-700 bg-[#252334] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Bound wallet address</span>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">{protocol}</span>
            </div>
            <p className="text-yellow-300 text-sm break-all min-h-10">
              {walletAddress || "No wallet address added yet"}
            </p>
          </div>

          <div className="flex gap-2">
            {!walletAddress ? (
              <button
                onClick={onAddNew}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-blue-400 hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Address</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => onEdit(walletAddress, protocol)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-blue-500/50 rounded-lg text-blue-300 hover:bg-blue-500/10 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Update Address</span>
                </button>
                <button
                  onClick={onAddNew}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-blue-400 hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Again</span>
                </button>
              </>
            )}
          </div>

          {walletAddress && (
            <div className="rounded-xl border border-red-500/30 bg-red-900/10 p-4 space-y-3">
              <p className="text-sm text-red-200 font-semibold">Delete Address</p>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter withdraw password"
                  className="w-full pl-9 pr-3 py-2 bg-[#1E1D2A] border border-gray-700 rounded-lg text-white"
                />
              </div>
              <button
                onClick={async () => {
                  if (!deletePassword.trim()) {
                    toast.error("Please enter withdraw password");
                    return;
                  }

                  try {
                    setDeleting(true);
                    await accountService.deleteWalletAddress({ currentWalletPassword: deletePassword });
                    toast.success("Wallet address deleted");
                    setDeletePassword("");
                    fetchWallet();
                  } catch (error: any) {
                    toast.error(error?.response?.data?.message || "Failed to delete wallet address");
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Deleting..." : "Delete Address"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}