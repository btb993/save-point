  // ================= Wikidata lookup (free, no key) =================
  const WD = "https://www.wikidata.org/w/api.php";
  async function wd(params, signal){
    const u = new URL(WD); Object.entries({ ...params, format: "json", origin: "*" }).forEach(([k, v]) => u.searchParams.set(k, v));
    const r = await fetch(u, { signal }); if (!r.ok) throw new Error("lookup " + r.status); return r.json();
  }
  const PLAT_MAP = [[/windows/i, "PC"], [/macos|mac os/i, "Mac"], [/^linux/i, "Linux"], [/playstation 5/i, "PS5"], [/playstation 4/i, "PS4"], [/playstation 3/i, "PS3"], [/xbox series/i, "Xbox Series X|S"], [/xbox one/i, "Xbox One"], [/xbox 360/i, "Xbox 360"], [/nintendo switch 2/i, "Switch 2"], [/nintendo switch/i, "Switch"], [/steamos|steam deck/i, "Steam Deck"], [/^ios$/i, "iOS"], [/android/i, "Android"]];
  const niceplat = l => { for (const [re, v] of PLAT_MAP) if (re.test(l)) return v; return l; };
  const PLAT_ORDER = ["PC", "PS5", "Xbox Series X|S", "Switch 2", "Switch", "PS4", "Xbox One", "Steam Deck"];
  const cleanGenre = l => { const s = String(l).replace(/\s*video game$|\s*game$/i, "").trim(); return s ? s[0].toUpperCase() + s.slice(1) : ""; };
  const claimIds = (e, p) => (e.claims?.[p] || []).map(c => c.mainsnak?.datavalue?.value?.id).filter(Boolean);
  const claimStr = (e, p) => (e.claims?.[p] || []).map(c => c.mainsnak?.datavalue?.value).filter(v => typeof v === "string");
  // critic score: Metacritic first, then OpenCritic, then any score out of 100
  function criticOf(e){
    const found = [];
    for (const c of (e.claims?.P444 || [])) {
      const by = (c.qualifiers?.P447 || []).map(q => q.datavalue?.value?.id);
      const m = String(c.mainsnak?.datavalue?.value || "").match(/^(\d{1,3})(?:\.\d+)?\s*\/\s*100$/); if (!m) continue;
      found.push({ score: +m[1], by: by.includes("Q150248") ? "Metacritic" : by.includes("Q21039459") ? "OpenCritic" : "Critics", rank: by.includes("Q150248") ? 0 : by.includes("Q21039459") ? 1 : 2 });
    }
    found.sort((a, b) => a.rank - b.rank);
    return found[0] || null;
  }
  const labelOf = e => e?.labels?.en?.value || e?.labels?.mul?.value || "";
  async function entities(ids, signal, props = "labels|descriptions|claims|sitelinks"){
    const out = {};
    for (let i = 0; i < ids.length; i += 50) {
      const j = await wd({ action: "wbgetentities", ids: ids.slice(i, i + 50).join("|"), props, languages: "en|mul", sitefilter: "enwiki" }, signal);
      Object.assign(out, j.entities || {});
    }
    return out;
  }
  async function toGames(ids, signal){
    if (!ids.length) return [];
    const ents = await entities(ids, signal);
    const isGame = e => { const p31 = claimIds(e, "P31"), d = e.descriptions?.en?.value || ""; if (/filmography|discography|bibliography|^list of/i.test(d + " " + labelOf(e))) return false; if (p31.includes("Q7058673") || /series|franchise|bundle|compilation/i.test(d) && !p31.includes("Q7889")) return false; return p31.some(x => ["Q7889", "Q21125433", "Q64170203", "Q865493"].includes(x)) || /video game/i.test(d); };
    const list = ids.map(id => ents[id]).filter(e => e && !e.missing && isGame(e));
    const refs = new Set(); list.forEach(e => ["P178", "P400", "P136", "P179"].forEach(p => claimIds(e, p).forEach(x => refs.add(x))));
    const lab = refs.size ? await entities([...refs], signal, "labels") : {};
    const L = id => { const l = labelOf(lab[id]); return /^Category:/.test(l) ? "" : l; };
    return list.map(e => {
      const years = (e.claims?.P577 || []).map(c => +String(c.mainsnak?.datavalue?.value?.time || "").slice(1, 5)).filter(Boolean);
      const rel = (e.claims?.P577 || []).map(c => c.mainsnak?.datavalue?.value).filter(v => v?.time).map(v => ({ t: v.time.slice(1, 11), p: v.precision })).sort((a, b) => a.t.localeCompare(b.t))[0];
      const cr = criticOf(e), t1476 = (e.claims?.P1476 || []).map(c => c.mainsnak?.datavalue?.value?.text).find(Boolean);
      const plats = [...new Set(claimIds(e, "P400").map(L).filter(Boolean).map(niceplat))].sort((a, b) => (PLAT_ORDER.indexOf(a) + 1 || 99) - (PLAT_ORDER.indexOf(b) + 1 || 99));
      return {
        title: labelOf(e) || e.sitelinks?.enwiki?.title?.replace(/ \((?:\d{4} )?video game\)$/, "") || t1476 || "", wikidata: e.id, wiki: e.sitelinks?.enwiki?.title || "",
        developer: claimIds(e, "P178").map(L).filter(Boolean).slice(0, 2).join(", "),
        year: years.length ? Math.min(...years) : null, platforms: plats,
        genres: [...new Set(claimIds(e, "P136").map(L).map(cleanGenre).filter(Boolean))].slice(0, 3),
        series: L(claimIds(e, "P179")[0]) || null, steamAppId: claimStr(e, "P1733")[0] || "",
        logoUrl: claimStr(e, "P154")[0] ? commonsFile(claimStr(e, "P154")[0], 480) : "",
        release: rel ? (rel.p >= 11 ? rel.t : rel.p === 10 ? rel.t.slice(0, 7) : rel.t.slice(0, 4)) : "",
        metacritic: cr?.score || null, criticBy: cr?.by || "", summary: e.descriptions?.en?.value || "", length: null
      };
    }).filter(g => g.title);
  }
  const commonsFile = (name, w) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(String(name).replace(/^File:/, ""))}?width=${w}`;
  async function wp(lang, params, signal){
    const u = new URL(`https://${lang}.wikipedia.org/w/api.php`); Object.entries({ ...params, format: "json", origin: "*" }).forEach(([k, v]) => u.searchParams.set(k, v));
    const r = await fetch(u, { signal }); if (!r.ok) throw new Error("wiki " + r.status); return r.json();
  }
  // the main picture of each Wikipedia article, which for games is almost always the box art
  async function wikiCovers(lang, titles, signal){
    const out = {}; if (!titles.length) return out;
    const j = await wp(lang, { action: "query", titles: titles.slice(0, 40).join("|"), prop: "pageimages", piprop: "thumbnail|name", pithumbsize: 600, pilicense: "any", redirects: 1 }, signal);
    const map = {}; for (const x of [...(j.query?.normalized || []), ...(j.query?.redirects || [])]) map[x.to] = map[x.from] || x.from;
    for (const pg of Object.values(j.query?.pages || {})) if (pg.thumbnail?.source) { const from = map[pg.title] || pg.title; out[from] = out[map[from] || from] = { url: pg.thumbnail.source, name: pg.pageimage || "" }; }
    return out;
  }
  async function addSummaries(list, signal){
    try { const cov = await wikiCovers("en", list.map(g => g.wiki).filter(Boolean), signal); list.forEach(g => { if (cov[g.wiki]) g.coverUrl = cov[g.wiki].url; }); } catch (e) { if (e.name === "AbortError") throw e; }
    await Promise.all(list.map(async g => {
      if (!g.wiki) return;
      try {
        const r = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(g.wiki.replace(/ /g, "_")), { signal });
        if (!r.ok) return; const j = await r.json();
        const first = String(j.extract || "").split(/(?<=\.)\s+(?=[A-Z])/)[0];
        if (first && first.length < 400) g.summary = first;
      } catch {}
    }));
    return list;
  }
  async function searchGames(q, signal, more = false){
    // two searches at once: one by name (best for exact titles), one full-text limited to video games
    const [byName, byText] = await Promise.all([
      wd({ action: "wbsearchentities", search: q, language: "en", uselang: "en", type: "item", limit: more ? 40 : 15 }, signal).catch(e => { if (e.name === "AbortError") throw e; return {}; }),
      wd({ action: "query", list: "search", srsearch: `${q} haswbstatement:P31=Q7889`, srlimit: more ? 30 : 10, srnamespace: 0 }, signal).catch(e => { if (e.name === "AbortError") throw e; return {}; })
    ]);
    const ids = [], series = [];
    for (const x of (byName.search || [])) { if (/game/i.test(x.description || "") && /series|franchise/i.test(x.description || "")) series.push(x.id); else if (/game/i.test(x.description || "") && !ids.includes(x.id)) ids.push(x.id); }
    for (const x of (byText.query?.search || [])) if (!ids.includes(x.title)) ids.push(x.title);
    // not much found (often a misspelling, like "jack and dexter"): ask Wikipedia, which forgives typos, then map its pages to Wikidata
    if (ids.length < 3) {
      try {
        const look = async s => (await wp("en", { action: "query", list: "search", srsearch: s, srlimit: 8, srinfo: "suggestion" }, signal)).query || {};
        let r = await look(`${q} video game`), titles = (r.search || []).map(x => x.title);
        const sug = r.searchinfo?.suggestion; if (sug) titles = [...(await look(sug)).search?.map(x => x.title) || [], ...titles];
        titles = [...titles, ...((await look(q.split(/\s+/).filter(w => w.length > 2).map(w => w + "~").join(" ") + " video game")).search || []).map(x => x.title)];
        titles = [...new Set(titles)].slice(0, 20);
        if (titles.length) { const j = await wd({ action: "wbgetentities", sites: "enwiki", titles: titles.join("|"), props: "descriptions", languages: "en" }, signal);
          Object.values(j.entities || {}).forEach(e => { if (!e.id || e.missing !== undefined) return; const d = e.descriptions?.en?.value || ""; if (/filmography|discography|bibliography|list of|actor|actress|film\b|television/i.test(d)) return; if (/game/i.test(d) && /series|franchise/i.test(d)) series.push(e.id); else if (/video game/i.test(d) && !ids.includes(e.id)) ids.push(e.id); }); }
      } catch (e) { if (e.name === "AbortError") throw e; }
    }
    // a matching series brings in its games (Jak and Daxter → Jak II, Jak 3, Jak X...)
    if (series.length) { try { const rows = await sparql(`SELECT ?g WHERE { VALUES ?s { ${[...new Set(series)].slice(0, 3).map(x => "wd:" + x).join(" ")} } ?g wdt:P179 ?s; wdt:P31 wd:Q7889. } LIMIT 24`, signal); rows.forEach(r => { if (!ids.includes(r.g)) ids.push(r.g); }); } catch (e) { if (e.name === "AbortError") throw e; } }
    let list = await toGames(ids.slice(0, more ? 48 : series.length ? 24 : 12), signal);
    searchGames.more = ids.length > (series.length ? 12 : 6) || (byName.search || []).length >= 15 || (byText.query?.search || []).length >= 10;
    const nq = norm(q), score = g => (norm(g.title) === nq ? 4 : norm(g.title).startsWith(nq) ? 2 : 0) + (g.steamAppId ? .5 : 0) + (g.platforms.length ? .3 : 0) - ids.indexOf(g.wikidata) * .05;
    list.sort((a, b) => score(b) - score(a));
    list = list.slice(0, more ? 30 : series.length ? 12 : 6);
    return addSummaries(list, signal);
  }
  async function lookupOne(g){
    let ids = [];
    if (g.steamAppId) { const j = await wd({ action: "query", list: "search", srsearch: `haswbstatement:P1733=${g.steamAppId}`, srlimit: 1 }); ids = (j.query?.search || []).map(x => x.title); }
    if (!ids.length) { const j = await wd({ action: "query", list: "search", srsearch: `${g.title} haswbstatement:P31=Q7889`, srlimit: 5 }); ids = (j.query?.search || []).map(x => x.title); }
    if (!ids.length) return null;
    const list = await toGames(ids);
    return list.find(x => g.steamAppId && x.steamAppId === String(g.steamAppId)) || list.find(x => norm(x.title) === norm(g.title)) || (g.steamAppId ? list[0] : null);
  }

