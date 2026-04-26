browser.runtime.onMessage.addListener((message) => {
  if (message.type !== "download") return;

  const { url, filename } = message;

  return fetch(url, { credentials: "include" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      return browser.downloads
        .download({ url: blobUrl, filename, saveAs: false })
        .then(() => {
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        });
    })
    .catch((err) => {
      console.warn(
        "Pinterest Downloader: blob fetch failed, trying direct download.",
        err,
      );
      return browser.downloads
        .download({ url, filename, saveAs: false })
        .catch((err2) => {
          console.warn(
            "Pinterest Downloader: direct download failed, opening tab.",
            err2,
          );
          browser.tabs.create({ url, active: true });
        });
    });
});
