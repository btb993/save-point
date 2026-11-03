// Browser smoke test: loads the app with sample games and clicks through every main screen.
// Run: node tools/smoke.mjs   (needs Playwright: npm i -D playwright && npx playwright install chromium)
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // plain require also finds a globally installed Playwright
const root = path.resolve("."), types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".webmanifest": "application/manifest+json", ".sql": "text/plain", ".ts": "text/plain" };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split("?")[0]).replace(/^\/$/, "/index.html")); if (!f.startsWith(root) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r); }).listen(0);
const url = `http://127.0.0.1:${srv.address().port}/index.html`;
const st = ["playing", "finished", "finished", "backlog", "wishlist", "dropped", "finished", "backlog"];
const games = Array.from({ length: 24 }, (_, i) => ({ id: "g" + i, title: "Sample Game " + i, status: st[i % st.length], rating: i % 5 + 1, hours: i * 3, genres: [["role-playing"], ["roguelike"], ["puzzle"], ["shooter"]][i % 4], year: 2000 + i, added: "2025-01-01T00:00:00Z", finished: st[i % st.length] === "finished" ? `2026-0${1 + i % 9}-10` : "" }));
const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 1280, height: 900 } }), errors = [];
page.on("pageerror", e => errors.push(e.message));
await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
await page.goto(url); await page.evaluate(g => { localStorage.clear(); localStorage.setItem("save-point-games", JSON.stringify(g)); localStorage.setItem("save-point-settings", JSON.stringify({ toured: true, buddyAsked: true, buddy: { type: "pip", name: "Pip" }, seenVer: document.documentElement.dataset.ver })); }, games);
await page.goto(url + "?r=1"); await page.waitForTimeout(1200);
const steps = [["library", "[data-nav=library]"], ["discover", "[data-nav=discover]"], ["wishlist", "[data-nav=wishlist]"], ["you", "[data-nav=stats]"], ["friends", "[data-nav=friends]"], ["trophies", "[data-nav=trophies]"], ["back", "[data-nav=library]"], ["room", "#nook-roomback"], ["room setup", "[data-roomgo=desk]"], ["tonight", "[data-tonight]"], ["settings", "#settings-btn"], ["a game", "#shelves .spine[data-open]"]];
for (const [name, sel] of steps) { await page.keyboard.press("Escape"); const ok = await page.evaluate(s => { const el = document.querySelector(s); if (!el) return false; el.click(); return true; }, sel); await page.waitForTimeout(400); console.log((ok ? "✓ " : "✗ ") + name + (ok ? "" : " (not found: " + sel + ")")); if (!ok) errors.push("missing " + sel); }
await browser.close(); srv.close();
if (errors.length) { console.error("\nProblems:\n" + errors.join("\n")); process.exit(1); } console.log("\nSmoke test passed");
