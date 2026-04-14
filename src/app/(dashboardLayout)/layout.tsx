"use client";

import DashboardHeader from "@/sidebar/DashboardHeader";
import DashboardSidebar from "@/sidebar/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@/types/user.role";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  console.log("DashboardLayout: User:", user, "Loading:", loading);
  const router = useRouter();

  // 🔐 Protect dashboard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/?auth=required");
    }
  }, [user, loading]);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 p-10 text-gray-300">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-900">
      <DashboardSidebar role={user.role as UserRole} />

      <div className="flex flex-col flex-1">
        <DashboardHeader />
        <main className="flex-1 bg-gray-900">{children}</main>
      </div>
    </div>
  );
}