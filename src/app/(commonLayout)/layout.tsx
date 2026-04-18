import Footer from "@/components/commonLayout/home/Footer";
import Header from "@/components/commonLayout/home/Header";
import React from "react";

export default function CommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex justify-center bg-[#3B393A]">
      {/* App Container */}
      <div className="w-full  max-w-112.5 flex flex-col min-h-dvh">
        
        {/* Header */}
        <Header />

        {/* Scrollable Content */}
        <main className="flex-1 w-full max-w-112.5 flex flex-col min-h-dvh">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
