# Save Point source

The app ships as one file, `index.html`, so GitHub Pages and the offline cache keep working.
That file is **built** from the parts in this folder; edit the parts, not `index.html`.

- `page/` – the HTML around everything (head, body markup, script tags)
- `styles/` – the CSS, in the order it loads (later files override earlier ones)
- `scripts/` – the app, one file per feature (`13-the-gaming-room.js`, `20-wishlist-prices.js`, …).
  They all run in one shared scope, in the order listed in `parts.json`.

## Commands

    node tools/build.mjs     # glue src/ back into index.html
    node tools/check.mjs     # build check, syntax, duplicate functions, version/update log, cached files
    node tools/smoke.mjs     # clicks through every screen in a real browser (needs Playwright)

GitHub runs the checks and the smoke test on every push.

## Releasing

1. Bump `data-ver` in `src/page/head.html` and the shell version in `sw.js`.
2. Add an entry at the top of `CHANGELOG` (in `scripts/34-settings.js`).
3. `node tools/build.mjs && node tools/check.mjs`, then commit and push.
