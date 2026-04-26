const ICON_IMAGE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <polyline points="7 10 12 15 17 10"/>
  <line x1="12" y1="15" x2="12" y2="3"/>
</svg>`;

const ICON_VIDEO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <polyline points="7 10 12 15 17 10"/>
  <line x1="12" y1="15" x2="12" y2="3"/>
  <polyline points="17 8 23 4 23 16 17 12"/>
</svg>`;

const RESOLUTION_RE = /\/\d+x(\d+)?(?:\/|$)/;

function toOriginalUrl(url) {
  if (!url || !url.includes("pinimg.com")) return url;
  return url.replace(RESOLUTION_RE, "/originals/");
}

function filenameFromUrl(url) {
  try {
    const base = new URL(url).pathname.split("/").pop() || "pinterest-image";
    return "pinterest_" + base;
  } catch {
    return "pinterest-image.jpg";
  }
}

function imageUrlFromImg(img) {
  const srcset = img.srcset || img.getAttribute("srcset") || "";
  if (srcset) {
    const entries = srcset.split(",").map((s) => {
      const [u, w] = s.trim().split(/\s+/);
      return { url: u, w: parseFloat(w) || 1 };
    });
    entries.sort((a, b) => b.w - a.w);
    if (entries.length && entries[0].url) return toOriginalUrl(entries[0].url);
  }
  if (img.src && img.src.includes("pinimg.com")) return toOriginalUrl(img.src);
  return null;
}

function bestVideoUrl(root) {
  const video = root.matches("video") ? root : root.querySelector("video");
  if (!video) return null;
  for (const source of video.querySelectorAll("source")) {
    if (source.src) return source.src;
  }
  return video.src || null;
}

const BUTTON_CLASS = "phd-btn";
const PROCESSED_ATTR = "data-phd";

function pageBoardName() {
  function sanitize(s) {
    return s.replace(/[^a-zA-Z0-9_\-. ]/g, "_").slice(0, 64);
  }
  const parts = location.pathname.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
  if (!parts.length || parts[0] === "pin") return "unsorted";
  if (parts[0] === "search") return "search";
  if (parts.length >= 2) return sanitize(parts[1]);
  return sanitize(parts[0]);
}

const _parser = new DOMParser();
function _parseSvg(svgStr) {
  return _parser.parseFromString(svgStr, "image/svg+xml").documentElement;
}

function makeButton(url, isVideo) {
  const btn = document.createElement("button");
  btn.className = BUTTON_CLASS;
  btn.title = isVideo ? "Download video (HD)" : "Download image (HD)";
  btn.setAttribute("aria-label", btn.title);
  btn.appendChild(_parseSvg(isVideo ? ICON_VIDEO : ICON_IMAGE));

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const finalUrl = isVideo ? url : toOriginalUrl(url);
    browser.runtime
      .sendMessage({
        type: "download",
        url: finalUrl,
        filename: `Pinterest/${pageBoardName()}/${filenameFromUrl(finalUrl)}`,
      })
      .catch((err) => {
        console.error("Pinterest Downloader: messaging failed.", err);
      });
    btn.classList.add("phd-btn--done");
    setTimeout(() => btn.classList.remove("phd-btn--done"), 1500);
  });

  return btn;
}

function injectButton(container, imageUrl) {
  if (container.hasAttribute(PROCESSED_ATTR)) return;
  container.setAttribute(PROCESSED_ATTR, "1");

  const videoUrl = bestVideoUrl(container);
  const url = videoUrl || imageUrl;
  if (!url) return;

  if (getComputedStyle(container).position === "static") {
    container.style.position = "relative";
  }

  container.appendChild(makeButton(url, !!videoUrl));
}

function findContainer(img) {
  const anchor = img.closest('a[href*="/pin/"]');
  if (anchor) {
    return anchor.parentElement || anchor;
  }
  let el = img.parentElement;
  while (el && el !== document.body) {
    if (el.offsetWidth >= 80 && el.offsetHeight >= 80) return el;
    el = el.parentElement;
  }
  return null;
}

function processAll() {
  document
    .querySelectorAll('img[src*="pinimg.com"], img[srcset*="pinimg.com"]')
    .forEach((img) => {
      const container = findContainer(img);
      if (!container) return;
      if (container.hasAttribute(PROCESSED_ATTR)) return;
      if (container.closest(`[${PROCESSED_ATTR}]`)) return;
      injectButton(container, imageUrlFromImg(img));
    });

  document
    .querySelectorAll('[data-test-id="pin-closeup-image"]')
    .forEach((el) => {
      if (el.hasAttribute(PROCESSED_ATTR)) return;
      const img = el.querySelector(
        'img[src*="pinimg.com"], img[srcset*="pinimg.com"]',
      );
      injectButton(el, img ? imageUrlFromImg(img) : null);
    });
}

let debounceTimer = null;

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(processAll, 150);
});

observer.observe(document.body, { childList: true, subtree: true });

processAll();
