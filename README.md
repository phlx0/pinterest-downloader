# Pinterest HD Downloader

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Firefox](https://img.shields.io/badge/Firefox-compatible-FF7139?logo=firefox-browser&logoColor=white)

A Firefox extension for downloading Pinterest images and videos in full resolution. No account needed, no third-party services — just the original file straight from Pinterest's CDN.

---

## Features

- **Hover button** — appears on every pin, downloads the image or video immediately
- **Automatic folders** — files are sorted by board so your downloads stay organized
- **Always original quality** — rewrites Pinterest's resized CDN URLs to the full-resolution source

---

## How it works

Pinterest serves images from `i.pinimg.com` with a resolution prefix baked into the URL (e.g. `/236x/`, `/736x/`). The extension rewrites that prefix to `/originals/` before downloading, so you always get the source file — not a resized copy.

For videos it reads the source URL directly from the `<video>` element on the page.

---

## Folder structure

Files land in your default downloads directory under `Pinterest/`:

```
Pinterest/
  {board}/   ← named after the board you're browsing
```

The board name is taken from the page URL — `/username/board-name/` becomes `board-name`. On a pin detail page or the home feed it falls back to `unsorted`.

---

## Install

`about:debugging` → This Firefox → Load Temporary Add-on → pick any file from the repo.

The extension only runs on `pinterest.com` and requests the minimum permissions needed — `downloads` to save files.
