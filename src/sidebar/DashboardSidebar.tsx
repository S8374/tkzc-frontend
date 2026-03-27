/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SIDEBAR_CONFIG, hasChildren } from "./sidebar.config";
import { cn } from "@/lib/utils";
import Logo from "@/shared/Logo/Logo";
import { authService } from "@/services/api/auth.services";
import toast from "react-hot-toast";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { 
  MenuIcon, 
  XIcon, 
  ChevronDown, 
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import { UserRole } from "@/types/user.role";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  role: UserRole;
}

export default function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout(undefined);
      toast.success("Logged out successfully");
      router.replace("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  // Detect mobile
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 1024);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Toggle dropdown with animation
  const toggleDropdown = (title: string) => {
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  // Check if dropdown is open
  const isDropdownOpen = (title: string) => openDropdowns.has(title);

  // Desktop Sidebar with hover effect
  const DesktopSidebar = () => (
    <div
      className="hidden lg:flex flex-col min-h-screen w-72 bg-linear-to-b from-gray-900 to-gray-800 text-white shadow-2xl relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500" />
      
      {/* Logo with animation */}
      <motion.div 
        className="flex items-center justify-center h-20 border-b border-white/10"
        whileHover={{ scale: 1.05 }}
      >
        <Logo />
      </motion.div>

      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {SIDEBAR_CONFIG.filter((section) => section.roles.includes(role)).map((section, i) => (
          <div 
            key={i} 
            className="space-y-1"
          >
            {section.items.map((item) => {
              const isActive = pathname === item.url;
              const Icon = item.icon;

              return (
                <div key={item.title} className="relative">
                  {hasChildren(item) ? (
                    <>
                      <motion.button
                        onClick={() => toggleDropdown(item.title)}
                        className={cn(
                          "flex items-center justify-between w-full gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-300",
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                          <span className="truncate font-medium">{item.title}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: isDropdownOpen(item.title) ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4 text-white/50" />
                        </motion.div>
                      </motion.button>

                      {/* Submenu with animation */}
                      <AnimatePresence>
                        {isDropdownOpen(item.title) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-8 mt-1 space-y-1 overflow-hidden"
                          >
                            {item.items?.map((subItem) => {
                              const subIsActive = pathname === subItem.url;
                              const SubIcon = subItem.icon;
                              return (
                                <motion.div
                                  key={subItem.url}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Link
                                    href={subItem.url!}
                                    className={cn(
                                      "flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all duration-300",
                                      subIsActive
                                        ? "bg-white/20 text-white font-medium"
                                        : "text-white/60 hover:text-white hover:bg-white/10"
                                    )}
                                  >
                                    {SubIcon && <SubIcon className="h-3.5 w-3.5 flex-shrink-0" />}
                                    <span className="truncate">{subItem.title}</span>
                                    {subItem.badge && (
                                      <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">
                                        {subItem.badge}
                                      </Badge>
                                    )}
                                  </Link>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
               
                      <Link
                        href={item.url!}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-300",
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                        <span className="truncate font-medium">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
 
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom navigation */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
        >
          <Settings className="h-5 w-5" />
          <span className="truncate font-medium">Settings</span>
        </Link>
        <Link
          href="/help"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="truncate font-medium">Help & Support</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-all duration-300"
        >
          <LogOut className="h-5 w-5" />
          <span className="truncate font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  // Mobile Sidebar (Sheet) with enhanced design
  const MobileSidebar = () => (
    <>
      {/* Mobile Sidebar Trigger */}
      <motion.div 
        className="lg:hidden fixed top-4 left-4 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              aria-label="Open menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </SheetTrigger>

          <SheetContent side="left" className="w-72 p-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white border-r border-white/10">
            <div className="flex flex-col h-full">
              {/* Logo with close button */}
              <div className="flex items-center justify-between h-20 border-b border-white/10 px-4">
                <Logo  />
                <SheetClose className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <XIcon className="h-5 w-5 text-white/70" />
                </SheetClose>
              </div>

              {/* User profile */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white/30">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">AD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-base font-semibold">John Doe</p>
                    <p className="text-xs text-white/60">Administrator</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
                {SIDEBAR_CONFIG.filter((section) => section.roles.includes(role)).map((section, i) => (
                  <div key={i} className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.url;
                      const Icon = item.icon;

                      return (
                        <div key={item.title} className="relative">
                          {hasChildren(item) ? (
                            <>
                              <button
                                onClick={() => toggleDropdown(item.title)}
                                className={cn(
                                  "flex items-center justify-between w-full gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-300",
                                  isActive
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                                    : "text-white/70 hover:text-white hover:bg-white/10"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="truncate font-medium">{item.title}</span>
                                </div>
                                <ChevronDown className={cn(
                                  "h-4 w-4 transition-transform duration-300",
                                  isDropdownOpen(item.title) ? "rotate-180" : ""
                                )} />
                              </button>

                              <AnimatePresence>
                                {isDropdownOpen(item.title) && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="ml-8 mt-1 space-y-1 overflow-hidden"
                                  >
                                    {item.items?.map((subItem) => {
                                      const subIsActive = pathname === subItem.url;
                                      const SubIcon = subItem.icon;
                                      return (
                                        <SheetClose asChild key={subItem.url}>
                                          <Link
                                            href={subItem.url!}
                                            className={cn(
                                              "flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all duration-300",
                                              subIsActive
                                                ? "bg-white/20 text-white font-medium"
                                                : "text-white/60 hover:text-white hover:bg-white/10"
                                            )}
                                          >
                                            <span className="truncate">{subItem.title}</span>
                                          </Link>
                                        </SheetClose>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={item.url!}
                                className={cn(
                                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-300",
                                  isActive
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                                    : "text-white/70 hover:text-white hover:bg-white/10"
                                )}
                              >
                                <span className="truncate font-medium">{item.title}</span>
                              </Link>
                            </SheetClose>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </nav>

              {/* Bottom actions */}
              <div className="border-t border-white/10 p-3 space-y-1">
                <SheetClose asChild>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="truncate font-medium">Settings</span>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/help"
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span className="truncate font-medium">Help & Support</span>
                  </Link>
                </SheetClose>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-all duration-300"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="truncate font-medium">Logout</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}