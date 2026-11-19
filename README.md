[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/mekzibnn/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/mekzibnn/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Vice Cover Maker — gta6-cover-art-01

A free offline web app that turns your photos and a caption into a GTA-style
multi-panel poster cover, in the Vice City neon-sunset look — and exports it as
a PNG to share. Made for the [make.fun gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **Three photo panels** — a big hero panel plus two smaller ones, the classic
  poster grid. Upload a photo per panel, or use the built-in samples.
- **Crop and position per panel** — click a panel to select it, drag it to
  reposition its photo, zoom slider per panel.
- **Poster lettering** — a bold title and subtitle in the genre's style,
  fitted to the cover, with a neon gradient rule.
- **Three colour grades** — Sunset, Neon Nights, Palm Dusk: a warm
  sunset/neon grade over every panel.
- **One-step export** — PNG in the common post sizes: 1080×1080 (square),
  1080×1350 (portrait), 1920×1080 (wide).
- **Offline, private** — plain static files, no network requests, no
  libraries; your photos never leave your machine.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step. `main.ts` (Node 22, standard library only) hands the app in:
it copies `app/` and `screenshots/` to `/output` and writes
`/output/dossier.json` with the vendored `vendor/makefun-app.ts` library.

## Files

- `app/index.html`, `app/style.css`, `app/src/cover.js` (the cover
  renderer), `app/src/main.js` (wiring), `app/src/shots.js` (fixed scenes
  for screenshots)
- `app/samples/` — `pier.jpg` and `boulevard.jpg` were made for make.fun
  with an image model and are free to use; `sunset.jpg` is original art
  drawn procedurally by the author
- `screenshots/` — the app with a photo loaded, and covers it exported
- `shots.json` — the three screenshot scenes
- `main.ts`, `serve.ts`, `vendor/makefun-app.ts` — kit plumbing/library

## Own art only

No Rockstar Games logo, official artwork, or fonts. All lettering uses
system fonts, all scenery is drawn in code or from the free samples above,
and every photo on a cover is the user's own or a sample.

## License

MIT — see [LICENSE](LICENSE).
