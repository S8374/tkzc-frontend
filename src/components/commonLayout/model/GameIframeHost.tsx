"use client";

import { useEffect, useState } from "react";

type GameOpenEvent = CustomEvent<{ url: string }>;

const EVENT_NAME = "game:open";

export default function GameIframeHost() {
  const [url, setUrl] = useState("");
  const [visible, setVisible] = useState(false);
  console.log("GameIframeHost rendered with URL:", url, "and visibility:", visible);
  useEffect(() => {
    const onGameOpen = (event: Event) => {
      const customEvent = event as GameOpenEvent;
      const nextUrl = customEvent.detail?.url;
      if (!nextUrl) return;

      setUrl(nextUrl);
      setVisible(true);
      console.log("[Game Iframe URL]", nextUrl);
    };

    window.addEventListener(EVENT_NAME, onGameOpen as EventListener);
    return () => {
      window.removeEventListener(EVENT_NAME, onGameOpen as EventListener);
    };
  }, []);

  if (!visible || !url) return null;

  return (
    <div className="fixed inset-0 z-9999 bg-black/80">
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <button
          type="button"
          className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded"
          onClick={() => {
            setVisible(false);
            setUrl("");
          }}
        >
          Close
        </button>
      </div>

      <iframe
        src={url}
        frameBorder="0"
        className="w-full h-full"
        allowFullScreen
        title="Game Player"
      />
    </div>
  );
}
