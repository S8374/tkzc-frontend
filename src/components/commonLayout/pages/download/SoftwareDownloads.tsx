// components/account/SoftwareDownloads.tsx
"use client";

import BackButton from "@/components/ui/BackButton";
import {
  Shield,
  Zap,
  Wallet,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { DownloadApp, downloadAppService } from "@/services/api/downloadApp.service";

export default function SoftwareDownloads() {
  const [apps, setApps] = useState<DownloadApp[]>([]);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await downloadAppService.getActiveApps();
        if (response?.success) {
          setApps(response.data || []);
        }
      } catch {
        setApps([]);
      }
    };

    fetchApps();
  }, []);

  const vpnApps = useMemo(() => apps.filter((app) => app.category === "VPN"), [apps]);
  const walletApps = useMemo(() => apps.filter((app) => app.category === "WALLET"), [apps]);

  const fallbackIcon = (name: string) => {
    const key = name.toLowerCase();
    if (key.includes("vpn")) return Shield;
    if (key.includes("1.1.1.1") || key.includes("cloudflare") || key.includes("tron")) return Zap;
    return Wallet;
  };

  return (
    <div className="min-h-screen bg-[#252334] text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 h-16 flex items-center px-4 border-b border-gray-800 bg-[#252334]">
 
  <Suspense fallback={<div>Loading...</div>}>
        <BackButton className="mr-3" fallback="/" />
    </Suspense>
        <h1 className="text-xl font-bold">Software Downloads</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 pt-6 space-y-8">
        {/* VPN Section */}
        <div className="bg-[#1E1D2A] rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-lg mb-5">VPN Recommendations</h2>
          <div className="grid grid-cols-2 gap-4">
            {vpnApps.map((app) => (
              <div
                key={app._id}
                className="flex flex-col bg-gray-800 rounded  justify-between items-start text-start"
              >
                <div className="p-4 w-full">
                  <div className="flex justify-start">
                    {app.icon ? (
                      <img src={app.icon} alt={app.name} className="w-7 h-7 object-contain" />
                    ) : (
                      (() => {
                        const Icon = fallbackIcon(app.name);
                        return <Icon className="w-7 h-7 text-white" />;
                      })()
                    )}
                    <span className="text-sm font-semibold mb-3">{app.name}</span>
                  </div>

                  <a
                    href={app.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block p-1 rounded text-foreground text-sm bg-chart-4"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
            {vpnApps.length === 0 && <p className="text-xs text-gray-400 col-span-2">No VPN items available</p>}
          </div>
        </div>

        {/* Wallet Section */}
        <div className="bg-[#1E1D2A] rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-lg mb-3">Official Recommended Wallet</h2>
          <p className="text-gray-400 text-xs mb-5 leading-relaxed">
            In addition to recommended exchanges, it is also possible to transfer money through decentralized wallets
          </p>
          <div className="grid grid-cols-2 gap-4">
            {walletApps.map((app) => (
              <div
                key={app._id}
                className="flex flex-col justify-between items-start text-start"
              >
               <div className="p-4 bg-gray-800 w-full">
                 <div className="flex justify-start">
                  {app.icon ? (
                    <img src={app.icon} alt={app.name} className="w-7 h-7 object-contain" />
                  ) : (
                    (() => {
                      const Icon = fallbackIcon(app.name);
                      return <Icon className="w-7 h-7 text-white" />;
                    })()
                  )}
                  <span className="text-sm font-semibold mb-3">{app.name}</span>
                </div>

                <a
                  href={app.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block p-1 text-sm rounded text-foreground bg-chart-4"
                >
                  Download
                </a>
               </div>
              </div>
            ))}
            {walletApps.length === 0 && <p className="text-xs text-gray-400 col-span-2">No wallet items available</p>}
          </div>
        </div>
      </div>

      {/* Extra bottom space for mobile navigation bar feel */}
      <div className="h-24"></div>
    </div>
  );
}