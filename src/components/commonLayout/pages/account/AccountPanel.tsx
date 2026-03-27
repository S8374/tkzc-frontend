/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import { authService } from "@/services/api/auth.services";
import {
  Wallet,
  ArrowDownToLine,
  FileText,
  BarChart3,
  Repeat,
  ClipboardList,
  Coins,
  Bitcoin,
  Gift,
  ShieldCheck,
  Users,
  Download,
  Sparkles,
  ArrowRight,
  GamepadDirectional,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
export default function ProfileWallet() {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await authService.logout(undefined);

      toast.success("Logged out successfully 👋");

      router.replace("/");

    } catch (error) {
      toast.error("Logout failed");
    }
  };
  return (
    <div>
      <div style={{
        backgroundImage: "url('https://img.tkzc886.com/imgcn/tkzc/bg_login.webp')",
      }} className="min-h-screen w-full bg-no-repeat bg-cover bg-[#3b3b3b] text-white p-4  ">
        {/* Header */}
        <div className="relative     pt-32 p-4 mb-4">
          <div className="flex items-center gap-3">
            <img
              src="https://tkzc668.com/static/img/avatar1.ab81aa68.png"
              className="w-20 h-20 rounded-full border-2 border-yellow-400"
              alt="avatar"
            />
            <div>
              <p className="font-semibold text-xl">roni123</p>
              <p className="text-xl text-gray-300 flex items-center gap-1">
                ID: 72059
              </p>
            </div>
          </div>


        </div>
        {/* VIP */}
        <div className="mt-4 bg-[#4a4a4a] w-full rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-xl">VIP0</span>
            <button className="text-yellow-400 text-xl font-semibold">
              VIP Details &gt;
            </button>
          </div>

          <p className="text-xs text-gray-300 mb-2">
            need to deposit 50U more to join the VIP membership
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-600 rounded-full">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            </div>
            <span className="text-xs">VIP1</span>
          </div>
        </div>
        {/* Balance */}
        <div className="bg-[#4a4a4a] mt-4 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Coins className="text-green-400" />
              <span className="font-semibold">Balance</span>
            </div>
            <span className="text-yellow-400 font-bold">0.00</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/deposit" className="block">
              <button className="bg-yellow-400 text-black py-2 rounded-lg font-semibold flex items-center justify-center gap-2 w-full">
                <Wallet size={18} /> Deposit
              </button>
            </Link>
            <Link href={`/withdraw`}>
              <button
                className="bg-gray-600 py-2 w-full rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <ArrowDownToLine size={18} /> Withdraw
              </button>
            </Link>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-4 gap-4 mt-5 text-center text-xs">
            <MenuItem icon={<FileText />} label="Balance Det" href="/balance-det" />
            <MenuItem icon={<BarChart3 />} label="Profit Report" href="profit-report" />
            <MenuItem icon={<Repeat />} label="Transaction" href="transaction-record" />
            <MenuItem icon={<ClipboardList />} label="Task" href="tasks" />
            <MenuItem icon={<Coins />} label="My Bets" href="" />
            <MenuItem icon={<Bitcoin />} label="Buy Crypto" href="" />
            <MenuItem icon={<Gift />} label="LuckyWheel" href="" />
          </div>
        </div>

        {/* Referral */}
        <div className="bg-[#4a4a4a] rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <Gift className="text-yellow-400" />
            <div className="flex-1">
              <p className="text-sm">up to 0.6% bets commission</p>
              <div className="flex items-center gap-2 mt-2">
                <input
                  readOnly
                  value="https://t.me/sky8app_bot?start=72059"
                  className="flex-1 bg-gray-600 text-xs p-2 rounded-md"
                />
                <button className="bg-yellow-400 text-black px-3 py-1 rounded-md text-xs font-semibold">
                  copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* List Menu */}
        <div className="bg-[#4a4a4a] rounded-xl divide-y divide-gray-600">
          <ListItem icon={<ShieldCheck />} label="Safe Center" href="/safe-center" />
          <ListItem icon={<Users />} label="Affiliate" href="/affiliate" />
          <ListItem icon={<Download />} label="Vpn Download" href="/vpn-download" />
          <ListItem icon={<Sparkles />} label="LuckySpin" href="/lucky-spin" />
          <ListItem icon={<GamepadDirectional />} label="Red Packet" href="/red-packet" />


        </div>
        <div className="text-center mt-4 flex justify-center">
          <div
            onClick={handleLogout}
            className="text-red-500 cursor-pointer font-semibold"
          >
            Log Out
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable Components */
const MenuItem = ({ icon, label, href }: any) => (
  <Link href={href}>
    <div className="flex flex-col  cursor-pointer items-center gap-1 text-gray-200">
      <div className="text-background">{icon}</div>
      <span>{label}</span>
    </div>
  </Link>

);

const ListItem = ({ icon, label, href }: any) => (
  <Link href={href} className="block">
    <div className="flex items-center justify-between p-4  transition ">
      <div className="flex items-center gap-3">
        <span className="text-yellow-400">{icon}</span>
        <span>{label}</span>
      </div>
      <ArrowRight className="text-gray-300" />
    </div>
  </Link>
);

