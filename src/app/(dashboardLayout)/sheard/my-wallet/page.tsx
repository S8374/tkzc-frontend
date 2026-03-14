"use client";

import { useState, useEffect } from "react";
import {
  Wallet as WalletIcon,
  Copy,
  Eye,
  EyeOff,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Shield,
  Globe,
  Lock
} from "lucide-react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/ui/BackButton";
import { useTranslation } from "@/hooks/useTranslation";
import toast from "react-hot-toast";
import { Wallet, walletService } from "@/services/api/wallet.api";

export default function MyWalletPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    walletPassword: '',
    walletAddress: '',
    protocol: '' as 'TRC20' | 'ERC20' | 'BEP20' | '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const response = await walletService.getMyWallet();
      console.log("Wallet fetch response:", response);
      if (response?.success) {
        setWallet(response.data);
        setEditForm({
          walletPassword: '',
          walletAddress: response.data.walletAddress || '',
          protocol: response.data.protocol || '',
        });
      }
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
      toast.error("Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchWallet();
      toast.success("Wallet refreshed");
    } catch (error) {
      console.error("Failed to refresh wallet:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateWallet = async () => {
    try {
      setUpdating(true);
      
      const updateData: any = {};
      if (editForm.walletPassword) updateData.walletPassword = editForm.walletPassword;
      if (editForm.walletAddress) updateData.walletAddress = editForm.walletAddress;
      if (editForm.protocol) updateData.protocol = editForm.protocol;

      const response = await walletService.updateWallet(updateData);
      
      if (response?.success) {
        toast.success("Wallet updated successfully!");
        setIsEditing(false);
        fetchWallet();
      }
    } catch (error) {
      console.error("Failed to update wallet:", error);
      toast.error("Failed to update wallet");
    } finally {
      setUpdating(false);
    }
  };

  const getProtocolColor = (protocol?: string) => {
    switch (protocol) {
      case 'TRC20': return 'text-green-400 bg-green-600/20';
      case 'ERC20': return 'text-blue-400 bg-blue-600/20';
      case 'BEP20': return 'text-yellow-400 bg-yellow-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const getProtocolIcon = (protocol?: string) => {
    switch (protocol) {
      case 'TRC20': return <Globe className="w-4 h-4" />;
      case 'ERC20': return <Globe className="w-4 h-4" />;
      case 'BEP20': return <Globe className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1D2A] text-white">
        <div className="relative h-16 flex items-center px-4 border-b border-gray-800">
          <BackButton />
          <h1 className="text-xl font-bold flex-1 text-center">My Wallet</h1>
          <div className="w-10" />
        </div>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-gray-400">Loading wallet...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1D2A] text-white pb-10">
      {/* Header */}
      <div className="relative h-16 flex items-center justify-between px-4 border-b border-gray-800">
        <BackButton />
        <h1 className="text-xl font-bold flex-1 text-center">My Wallet</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Wallet Card */}
      <div className="max-w-md mx-auto px-4 mt-6">
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 shadow-xl border border-purple-500/30">
          {/* Balance Section */}
          <div className="text-center mb-6">
            <p className="text-gray-300 text-sm mb-1">Total Balance</p>
            <div className="text-4xl font-bold text-white">
              ৳{wallet?.balance?.toFixed(2) || '0.00'}
            </div>
            <div className="flex justify-center gap-3 mt-3">
              <button
                onClick={() => router.push('/deposit')}
                className="flex items-center gap-1 px-4 py-2 bg-green-600 rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                <ArrowUpRight className="w-4 h-4" />
                Deposit
              </button>
              <button
                onClick={() => router.push('/withdraw')}
                className="flex items-center gap-1 px-4 py-2 bg-red-600 rounded-lg text-sm font-medium hover:bg-red-700 transition"
              >
                <ArrowDownLeft className="w-4 h-4" />
                Withdraw
              </button>
            </div>
          </div>

          {/* Wallet Details */}
          <div className="space-y-3 pt-4 border-t border-purple-500/30">
            {/* Wallet Address */}
            {wallet?.walletAddress ? (
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Address:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-200">
                    {wallet.walletAddress.slice(0, 6)}...{wallet.walletAddress.slice(-4)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(wallet.walletAddress!)}
                    className="p-1 hover:bg-purple-600/30 rounded"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Address:</span>
                <span className="text-sm text-gray-500">Not set</span>
              </div>
            )}

            {/* Protocol */}
            {wallet?.protocol && (
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Protocol:</span>
                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getProtocolColor(wallet.protocol)}`}>
                  {getProtocolIcon(wallet.protocol)}
                  {wallet.protocol}
                </span>
              </div>
            )}

            {/* Wallet Password (if exists) */}
            {wallet?.walletPassword && (
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Password:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {showPassword ? wallet.walletPassword : '••••••••'}
                  </span>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:bg-purple-600/30 rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
              <span>Last updated:</span>
              <span>
                {wallet?.updatedAt ? new Date(wallet.updatedAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Edit className="w-4 h-4" />
            Edit Wallet Settings
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => router.push('/history')}
            className="bg-gray-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-gray-700 transition"
          >
            <History className="w-6 h-6 text-blue-400" />
            <span className="text-sm">Transaction History</span>
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="bg-gray-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-gray-700 transition"
          >
            <Lock className="w-6 h-6 text-green-400" />
            <span className="text-sm">Security Settings</span>
          </button>
        </div>
      </div>

      {/* Edit Wallet Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Edit Wallet</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateWallet();
            }} className="space-y-4">
              {/* Wallet Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={editForm.walletAddress}
                  onChange={(e) => setEditForm({...editForm, walletAddress: e.target.value})}
                  placeholder="Enter wallet address"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              {/* Protocol */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Protocol
                </label>
                <select
                  value={editForm.protocol}
                  onChange={(e) => setEditForm({...editForm, protocol: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select Protocol</option>
                  <option value="TRC20">TRC20 (Tron)</option>
                  <option value="ERC20">ERC20 (Ethereum)</option>
                  <option value="BEP20">BEP20 (Binance)</option>
                </select>
              </div>

              {/* Wallet Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Wallet Password (Optional)
                </label>
                <input
                  type="password"
                  value={editForm.walletPassword}
                  onChange={(e) => setEditForm({...editForm, walletPassword: e.target.value})}
                  placeholder="Enter wallet password"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty to keep current password
                </p>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}