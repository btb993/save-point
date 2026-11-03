// Automatic checks. Run: node tools/check.mjs   (GitHub runs it on every push, see .github/workflows/check.yml)
import fs from "node:fs";
import { execFileSync } from "node:child_process";
let bad = 0; const ok = m => console.log("✓ " + m), fail = m => { console.error("✗ " + m); bad++; };
// 1) index.html is exactly what src/ builds
try { execFileSync(process.execPath, ["tools/build.mjs", "--check"], { stdio: "pipe" }); ok("index.html matches src/"); } catch (e) { fail(String(e.stderr || e.message).trim()); }
const html = fs.readFileSync("index.html", "utf8");
// 2) every inline script parses
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>\n/g)].map(m => m[1]);
scripts.forEach((js, i) => { try { new Function(js); ok(`script ${i + 1} parses (${js.split("\n").length} lines)`); } catch (e) { fail(`script ${i + 1}: ${e.message}`); } });
// 3) no function is declared twice at the top level of the app script (the second would silently replace the first)
const app = scripts[scripts.length - 1] || "", seen = new Map();
for (const m of app.matchAll(/^ {2}(?:async )?function ([A-Za-z0-9_$]+)\(/gm)) seen.set(m[1], (seen.get(m[1]) || 0) + 1);
const dup = [...seen].filter(([, n]) => n > 1).map(([k]) => k); dup.length ? fail("declared twice: " + dup.join(", ")) : ok(`${seen.size} functions, none declared twice`);
// 4) the version, the service worker and the update log agree
const ver = (html.match(/data-ver="([^"]+)"/) || [])[1], log = (app.match(/const CHANGELOG = \[\{"v": "([^"]+)"/) || [])[1];
ver && ver === log ? ok(`version ${ver} has an update-log entry`) : fail(`data-ver ${ver} but newest update log entry is ${log}`);
const sw = fs.readFileSync("sw.js", "utf8"), files = JSON.parse((sw.match(/const FILES = (\[[^\]]*\])/) || [, "[]"])[1]);
files.filter(f => f !== "./" && !fs.existsSync(f)).forEach(f => fail("sw.js caches a missing file: " + f));
/savepoint-shell-v\d+/.test(sw) ? ok("service worker cache " + sw.match(/savepoint-shell-v\d+/)[0]) : fail("sw.js has no shell version");
const man = JSON.parse(fs.readFileSync("manifest.webmanifest", "utf8")); man.icons.forEach(i => fs.existsSync(i.src) || fail("manifest icon missing: " + i.src));
// 5) setup files the app links to exist
for (const m of app.matchAll(/"(supabase\/[a-z/._]+)"/g)) fs.existsSync(m[1]) ? ok("found " + m[1]) : fail("missing " + m[1]);
// 6) the Supabase helper parses (needs Node 22.13+ to read TypeScript)
try { const { stripTypeScriptTypes } = await import("node:module"); if (!stripTypeScriptTypes) throw Object.assign(new Error("old node"), { skip: 1 });
  new Function(stripTypeScriptTypes(fs.readFileSync("supabase/playtime/index.ts", "utf8")).replace(/^\s*export\s+/gm, "")); ok("supabase/playtime/index.ts parses"); }
catch (e) { e.skip ? console.log("- skipped the helper check (needs Node 22.13+)") : fail("playtime helper: " + e.message); }
console.log(bad ? `\n${bad} problem${bad === 1 ? "" : "s"}` : "\nAll checks passed"); process.exit(bad ? 1 : 0);
