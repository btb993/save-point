// Builds index.html from the parts in src/ (in the order of src/parts.json). Run: node tools/build.mjs
import fs from "node:fs";
const order = JSON.parse(fs.readFileSync("src/parts.json", "utf8"));
const out = order.map(f => fs.readFileSync("src/" + f, "utf8")).join("");
if (process.argv.includes("--check")) {
  const cur = fs.readFileSync("index.html", "utf8");
  if (cur !== out) { console.error("index.html is out of date with src/. Run: node tools/build.mjs"); process.exit(1); }
  console.log("index.html matches src/");
} else { fs.writeFileSync("index.html", out); console.log("built index.html from", order.length, "parts"); }
