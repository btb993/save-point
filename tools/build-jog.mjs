// Builds data/jog.json: the "Jog your memory" lists (most notable games of every year since 1980, and of every
// console in the app), with box art, straight from Wikidata and Wikipedia. The app reads this file first, so those
// lists open instantly; it only asks Wikidata live for anything not in here. Run by .github/workflows/jog-data.yml
// every week, or by hand: node tools/build-jog.mjs
import fs from "node:fs";

const UA = "SavePointJogBuilder/1.0 (https://github.com/btb993/save-point)";
const CONSOLES = ["Q1406", "Q63184502", "Q5014725", "Q10683", "Q10680", "Q10677", "Q170325", "Q188808", "Q122761124", "Q19610114", "Q56942", "Q8079", "Q182172", "Q184839", "Q183259", "Q172742", "Q203597", "Q170323", "Q188642", "Q186437", "Q98973368", "Q13361286", "Q48263", "Q132020"];
const SEL = `(SAMPLE(?l) AS ?title) (SAMPLE(?links) AS ?n) (SAMPLE(?st) AS ?steam) (SAMPLE(?w) AS ?wiki)`;
const EXTRA = `OPTIONAL { ?g rdfs:label ?l FILTER(LANG(?l) IN ("en","mul")) } OPTIONAL { ?g wdt:P1733 ?st } OPTIONAL { ?w0 schema:about ?g; schema:isPartOf <https://en.wikipedia.org/>; schema:name ?w }`;
const BASE = `?g wdt:P31 wd:Q7889; wikibase:sitelinks ?links.`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function sparql(q){
  for (let a = 0; a < 4; a++) {
    try {
      const r = await fetch("https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(q), { headers: { Accept: "application/sparql-results+json", "User-Agent": UA } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      return j.results.bindings.map(b => Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v.value.replace("http://www.wikidata.org/entity/", "")])));
    } catch (e) { if (a === 3) throw e; await sleep(4000 * (a + 1)); }
  }
}
async function covers(wikis){
  const out = {};
  for (let i = 0; i < wikis.length; i += 40) {
    const u = "https://en.wikipedia.org/w/api.php?" + new URLSearchParams({ action: "query", format: "json", titles: wikis.slice(i, i + 40).join("|"), prop: "pageimages", piprop: "thumbnail", pithumbsize: "600", pilicense: "any", redirects: "1" });
    try {
      const j = await (await fetch(u, { headers: { "User-Agent": UA } })).json(), map = {};
      for (const x of [...(j.query?.normalized || []), ...(j.query?.redirects || [])]) map[x.to] = map[x.from] || x.from;
      for (const pg of Object.values(j.query?.pages || {})) if (pg.thumbnail?.source) out[map[pg.title] || pg.title] = pg.thumbnail.source;
    } catch {}
  }
  return out;
}
// a Wikimedia image address, shortened (the app rebuilds it): site letter, thumb or original, hash folder, file name
function enc(url){
  if (!url) return 0;
  const c = url.replace(/\?.*$/, "");
  const m = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/(commons|en)\/(thumb\/)?([0-9a-f])\/([0-9a-f]{2})\/([^/]+)(?:\/(\d+px-[^/]+))?$/.exec(c);
  if (!m) return "!" + c;
  const [, site, th, , ab, file, tn] = m;
  let o = (site === "en" ? "e" : "c") + (th ? "t" : "u") + ab + "/" + file;
  if (th && tn && tn !== "600px-" + file) o += "|" + tn;
  return o;
}
async function list(q){
  const rows = await sparql(q), cv = await covers(rows.map(r => r.wiki).filter(Boolean));
  return rows.filter(r => r.title || r.wiki).map(r => { const t = r.title || r.wiki; return [r.g.slice(1), t, r.wiki === t ? 1 : r.wiki || 0, r.steam || 0, r.year ? +r.year : 0, +r.n || 0, enc(cv[r.wiki])]; });
}

const Y = new Date().getFullYear(), jobs = [];
for (let y = 1980; y <= Y; y++) jobs.push(["year", String(y), `SELECT ?g ${SEL} (MIN(YEAR(?d)) AS ?year) WHERE { ${BASE} FILTER(?links >= 10) ?g wdt:P577 ?d. FILTER(?d >= "${y}-01-01T00:00:00Z"^^xsd:dateTime && ?d < "${y + 1}-01-01T00:00:00Z"^^xsd:dateTime) FILTER NOT EXISTS { ?g wdt:P577 ?e FILTER(?e < "${y}-01-01T00:00:00Z"^^xsd:dateTime) } ${EXTRA} } GROUP BY ?g ORDER BY DESC(?n) LIMIT 60`]);
for (const c of CONSOLES) jobs.push(["console", c, `SELECT ?g ${SEL} (MIN(YEAR(?d)) AS ?year) WHERE { ${BASE} ?g wdt:P400 wd:${c}. FILTER(?links >= 10) OPTIONAL { ?g wdt:P577 ?d } ${EXTRA} } GROUP BY ?g ORDER BY DESC(?n) LIMIT 60`]);

const prev = (() => { try { return JSON.parse(fs.readFileSync("data/jog.json", "utf8")); } catch { return { year: {}, console: {} }; } })();
const out = { v: 1, at: new Date().toISOString().slice(0, 10), year: {}, console: {} };
let failed = 0;
async function worker(){
  while (jobs.length) {
    const [k, v, q] = jobs.shift();
    try { out[k][v] = await list(q); console.log(k, v, out[k][v].length); }
    catch (e) { failed++; console.warn("failed", k, v, e.message); if (prev[k]?.[v]) out[k][v] = prev[k][v]; } // keep last week's list rather than lose it
    await sleep(500);
  }
}
await Promise.all([worker(), worker()]);
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync("data/jog.json", JSON.stringify(out));
console.log(`wrote data/jog.json: ${Object.keys(out.year).length} years, ${Object.keys(out.console).length} consoles, ${failed} failed`);
if (Object.keys(out.year).length < 20) process.exit(1);
