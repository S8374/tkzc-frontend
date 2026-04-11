export const openGameInIframe = (url: string) => {
  if (typeof window === "undefined" || typeof url !== "string" || !/^https?:\/\//i.test(url)) {
    console.error("[Game Iframe] invalid url", url);
    return;
  }

  window.dispatchEvent(
    new CustomEvent("game:open", {
      detail: { url },
    })
  );
};
