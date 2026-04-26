# Changelog

## [1.0.0] - 2026-04-26

### Added
- Hover button on every pin to download the image or video in the highest available resolution
- Automatic folder organization: `Pinterest/{board}` sorted by board name
- Board name is parsed from the page URL, falls back to `unsorted` on pin detail and home pages
- Blob-fetch with direct download fallback for reliable saves across different pin types
