# Neon Coast — Poster Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/hqnsyhrn/gta6-cover-art-01-v8/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/hqnsyhrn/gta6-cover-art-01-v8/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Built for the [Make GTA 6 Cover Art bounty](https://make.fun/bounty/gta6-cover-art-01) on make.fun.

Neon Coast turns any photo into GTA-style multi-panel cover art, offline in
the browser. Pick a preset, fill the nine panels with your own photos, write
the story — every panel gets a place, a time and a one-line hook — grade it
with Poster Ink, and export a PNG to share.

## What it does

- **9-panel collage** with the duo in the CENTER panel, largest of all — the
  cover's hero is two outlaws in a red convertible at sunset.
- **Story captions on every panel** (place + time + hook), with a Location
  tags toggle and per-panel Place / Time / Hook fields.
- **Press furniture**: a five-star press quote, WANTED pill, volume, ribbon,
  barcode, NC seal and a credit line — the cover reads as a printed product.
- **8 grades**, including Poster Ink (light halftone print treatment) and Ink
  Strong (heavy posterize + contrast 1.6 + magenta tint), **7 layouts** and
  **5 presets** (Sunset Duo, Sunset Chase, Neon Nights, Pier Pressure,
  Golden Getaway).
- **20 original photos**, all golden hour, made with an image model in this
  session — plus upload of your own photos, with per-panel crop (zoom + pan).
- **PNG export** in 1080 × 1080, 1080 × 1350 and 1920 × 1080, with undo/redo.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Everything runs offline;
your photos never leave your machine.

## Originality

All art is original and made for this studio: no Rockstar Games logo,
wordmark, official artwork, character or font. The lettering is Anton and
Pacifico, both under the SIL Open Font License (see `app/fonts/OFL.txt`).

## License

MIT — see [LICENSE](LICENSE).
