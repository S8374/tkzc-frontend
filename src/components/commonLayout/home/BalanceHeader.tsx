"use client";

import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { authService } from '@/services/api/auth.services';
import { useRouter } from 'next/navigation';

interface Wallet {
  balance: number;
  walletAddress?: string;
  protocol?: string;
}

interface BalanceHeaderProps {
  wallet: Wallet;
  onRefresh?: () => void; // Optional callback to trigger refresh in parent
}

const BalanceHeader = ({ wallet, onRefresh }: BalanceHeaderProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balance, setBalance] = useState(wallet?.balance || 0);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Fetch latest user data which includes updated wallet balance
      const response = await authService.me(undefined);
      
      if (response?.success && response?.data) {
        const newBalance = response.data.wallet?.balance || 0;
        setBalance(newBalance);
        
        // Call parent's onRefresh if provided
        if (onRefresh) {
          onRefresh();
        }
        
        // Optional: Show a small visual feedback
        // You could add a toast notification here
      }
    } catch (error) {
      console.error("Failed to refresh balance:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeposit = () => {
    // Navigate to deposit page
    router.push('/deposit');
  };

  return (
    <div className="bg-chart-4/10 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center justify-between shadow-sm gap-2">
      {/* Left: Token + Balance */}
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">T</span>
        </div>
        <span className="text-white font-medium text-sm">
          {balance.toFixed(2)}
        </span>
      </div>

      {/* Middle: Refresh */}
      <button 
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="p-1.5 rounded-full hover:bg-gray-600 transition-colors disabled:opacity-50"
        title="Refresh balance"
      >
        <RotateCcw 
          size={16} 
          className={`text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} 
        />
      </button>

      {/* Right: Deposit Button */}
      <button 
        onClick={handleDeposit}
        className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg font-semibold text-white text-xs shadow-md hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Deposit
      </button>
    </div>
  );
};

export default BalanceHeader;