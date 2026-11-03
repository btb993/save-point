// One-time: cut index.html into src/ parts at its section markers. The build glues them back byte for byte.
import fs from "node:fs";
const html = fs.readFileSync("index.html", "utf8").split(/(?<=\n)/);
const at = (re, from = 0) => { for (let i = from; i < html.length; i++) if (re.test(html[i])) return i; throw new Error("marker not found: " + re); };
const cuts = [];
const S0 = at(/^<style>/), S1 = at(/^<\/style>/), J1 = at(/^<script>/, S1), J1e = at(/^<\/script>/, J1), J2 = at(/^<script>/, J1e), J2e = html.length - 1 - [...html].reverse().findIndex(l => /^<\/script>/.test(l));
const part = (name, a, b) => cuts.push([name, a, b]);
part("page/head.html", 0, S0 + 1);
// styles, split at the big section headers
const cssMarks = [[/^\/\* =+ themes =+ \*\//, "themes"], [/^\/\* ---------- co-op buddy ---------- \*\//, "buddy-and-nook"], [/^\/\* ---------- You tab: distinct zones/, "you-and-scenes"], [/^\/\* ---------- co-op buddies v2/, "buddies-and-soul"], [/^\/\* =+ phone layout =+ \*\//, "phone-and-later"], [/^\/\* ---------- the gaming room ---------- \*\//, "room-and-newest"]];
let prev = S0 + 1, prevName = "base";
for (const [re, name] of cssMarks) { const i = at(re, prev); part(`styles/${String(cuts.length).padStart(2, "0")}-${prevName}.css`, prev, i); prev = i; prevName = name; }
part(`styles/${String(cuts.length).padStart(2, "0")}-${prevName}.css`, prev, S1);
part("page/body.html", S1, J1 + 1);
part("scripts/00-buddy-art.js", J1 + 1, J1e);
part("page/between.html", J1e, J2 + 1);
// the app script, one file per "// ===== section =====" header
let start = J2 + 1, n = 1, name = "start";
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "part";
for (let i = J2 + 1; i < J2e; i++) {
  const m = html[i].match(/^ {2}\/\/ =+ (.+?) =+\s*$/) || html[i].match(/^ {2}\/\/ =+ (.+?)\s*$/);
  if (m && i > start) { part(`scripts/${String(n).padStart(2, "0")}-${name}.js`, start, i); start = i; n++; name = slug(m[1].replace(/\(.*?\)/g, "")); }
  else if (m) name = slug(m[1].replace(/\(.*?\)/g, ""));
}
part(`scripts/${String(n).padStart(2, "0")}-${name}.js`, start, J2e);
part("page/end.html", J2e, html.length);
fs.rmSync("src", { recursive: true, force: true });
const order = [];
for (const [f, a, b] of cuts) { fs.mkdirSync("src/" + f.split("/").slice(0, -1).join("/"), { recursive: true }); fs.writeFileSync("src/" + f, html.slice(a, b).join("")); order.push(f); }
fs.writeFileSync("src/parts.json", JSON.stringify(order, null, 1) + "\n");
console.log(order.length, "parts");
