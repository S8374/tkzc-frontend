"use client";

import { BellIcon, ChevronDownIcon, SearchIcon, UserIcon, LogOutIcon, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/api/auth.services";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DashboardHeader() {
  const router = useRouter();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notifications] = useState(3); // Example notification count

  const handleLogout = async () => {
    try {
      await authService.logout(undefined);
      toast.success("Logged out successfully");
      router.replace("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-gradient-to-r from-[#0f2b3f] to-[#1f3d5b] border-b border-white/10 shadow-lg backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Left side - Welcome message (hidden on mobile) */}
        <div className="hidden md:block">
          <h2 className="text-sm font-medium text-white/70">Welcome back,</h2>
          <p className="text-lg font-semibold text-white">Admin User</p>
        </div>

        {/* Center - Search bar (hidden on mobile) */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10 pr-4 rounded-full focus:bg-white/20 transition-all duration-300"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <AnimatePresence>
              {isSearchFocused && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border p-2 text-sm text-gray-600"
                >
                  Press <kbd className="px-2 py-1 bg-gray-100 rounded">⌘</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded">K</kbd> to search
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-4 text-white">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-white px-3"
              >
                <span className="text-lg animate-pulse">🇺🇸</span>
                <span className="hidden sm:inline">English</span>
                <ChevronDownIcon size={14} className="text-white/70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="cursor-pointer hover:bg-blue-50">
                <span className="mr-2">🇺🇸</span> English
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-blue-50">
                <span className="mr-2">🇧🇩</span> বাংলা
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative text-white hover:bg-white/10 transition-all duration-300 hover:scale-110"
              >
                <BellIcon size={20} />
                {notifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                  Mark all as read
                </Button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {[1, 2, 3].map((i) => (
                  <DropdownMenuItem key={i} className="cursor-pointer p-4 hover:bg-gray-50 border-b last:border-0">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <BellIcon size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">New notification {i}</p>
                        <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <div className="p-2 border-t">
                <Button variant="ghost" size="sm" className="w-full text-xs text-gray-600 hover:text-gray-900">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 hover:bg-white/10 pl-2 pr-3">
                <Avatar className="h-8 w-8 border-2 border-white/30 transition-transform duration-300 hover:scale-110">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">AD</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">John Doe</p>
                  <p className="text-xs text-white/70">Administrator</p>
                </div>
                <ChevronDownIcon size={14} className="text-white/70 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-3 border-b">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-gray-500">john.doe@example.com</p>
              </div>
              <DropdownMenuItem className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}