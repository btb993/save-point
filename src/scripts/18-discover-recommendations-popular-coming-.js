  // ================= discover: recommendations, popular, coming soon, top 100 (Wikidata, free) =================
  const DISC_KEY = "save-point-discover-v1";
  let disc = lsGet(DISC_KEY, {}), discLoading = {}, topHideOwned = false;
  async function sparql(q, signal){
    const r = await fetch("https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(q), { signal, headers: { Accept: "application/sparql-results+json" } });
    if (!r.ok) throw new Error("query " + r.status);
    const j = await r.json();
    return j.results.bindings.map(b => Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v.value.replace("http://www.wikidata.org/entity/", "")])));
  }
  const SEL = `(SAMPLE(?l) AS ?title) (SAMPLE(?links) AS ?n) (SAMPLE(?st) AS ?steam) (SAMPLE(?w) AS ?wiki)`;
  const EXTRA = `OPTIONAL { ?g rdfs:label ?l FILTER(LANG(?l) IN ("en","mul")) } OPTIONAL { ?g wdt:P1733 ?st } OPTIONAL { ?w0 schema:about ?g; schema:isPartOf <https://en.wikipedia.org/>; schema:name ?w }`;
  const isoDay = d => String(d || "").slice(0, 10);
  // Wikidata stores "year only" release dates as 1 January
  const relFromDate = d => { d = isoDay(d); return !d ? "" : d.endsWith("-01-01") ? d.slice(0, 4) : d; };
  const toItem = r => ({ title: r.title || r.wiki || "", wikidata: r.g, wiki: r.wiki || "", steamAppId: r.steam || "", n: +r.n || 0,
    year: r.year ? +r.year : r.date ? +r.date.slice(0, 4) : null, release: r.date ? relFromDate(r.date) : "", metacritic: r.score ? +r.score : null, criticBy: r.score ? "Critics" : "", score: +r.wscore || 0, reasons: r.reasons || "" });
  async function withCovers(items, signal){
    const parts = []; for (let i = 0; i < items.length; i += 40) parts.push(items.slice(i, i + 40));
    await Promise.all(parts.map(async part => { const wikis = part.map(x => x.wiki).filter(Boolean);
      try { const c = await wikiCovers("en", wikis, signal); part.forEach(x => { if (c[x.wiki]) x.coverUrl = c[x.wiki].url; }); } catch (e) { if (e.name === "AbortError") throw e; } }));
    return items.filter(x => x.title);
  }
  // what recommendations are built from: games you loved count most, recent ones get a boost so every new game shifts the list,
  // and games you rated low or dropped push similar games down. Backlog games aren't used: you haven't played them yet.
  function seeds(){
    const now = Date.now(), recent = g => { const d = g.finished || lastPlayed(g) || (g.added || "").slice(0, 10); const days = d ? (now - new Date(d)) / 864e5 : 9999; return days < 30 ? 1.5 : days < 120 ? 1.2 : 1; };
    const all = games.filter(g => g.wikidata && g.status !== "backlog").map(g => {
      let w = g.rating ? g.rating - 2.5 : g.status === "finished" ? 1.5 : g.status === "playing" ? 1.1 : g.status === "wishlist" ? .6 : g.status === "dropped" ? -1 : 0;
      if (w > 0) w *= recent(g) * (1 + Math.min(.5, Math.log10(1 + (Number(g.hours) || 0)) / 4));
      return { id: g.wikidata, t: g.title, w: Math.round(w * 100) / 100, at: g.updatedAt || 0 };
    }).filter(x => x.w !== 0);
    const pos = all.filter(x => x.w > 0).sort((a, b) => b.w - a.w), neg = all.filter(x => x.w < 0).sort((a, b) => a.w - b.w).slice(0, 6);
    const newest = [...pos].sort((a, b) => b.at - a.at).slice(0, 6); // the games you touched most recently always count
    const top = [...new Map([...newest, ...pos].map(x => [x.id, x])).values()].slice(0, 24);
    return [...top, ...neg];
  }
  // today's recommendations, drawn from the saved pool: returns [item, index in the pool]
  // how much people are reading about each game right now (Wikipedia page views, last 30 days): a good "buzz" signal
  async function pageviews(titles, signal, days = 30){
    const out = {}, list = [...new Set(titles.filter(Boolean))];
    for (let i = 0; i < list.length; i += 50) {
      try { const j = await wp("en", { action: "query", prop: "pageviews", pvipdays: days, titles: list.slice(i, i + 50).join("|"), redirects: 1 }, signal);
        const back = {}; [...(j.query?.normalized || []), ...(j.query?.redirects || [])].forEach(x => back[x.to] = back[x.from] || x.from);
        Object.values(j.query?.pages || {}).forEach(pg => { out[back[pg.title] || pg.title] = Object.values(pg.pageviews || {}).reduce((a, b) => a + (b || 0), 0); });
      } catch (e) { if (e.name === "AbortError") throw e; }
    }
    return out;
  }
  // critic scores (out of 100: Metacritic, OpenCritic and others) from Wikidata, for a quality boost
  async function criticScores(ids, signal){
    if (!ids.length) return {};
    try { const rows = await sparql(`SELECT ?g (AVG(?s) AS ?score) WHERE { VALUES ?g { ${ids.slice(0, 200).map(x => "wd:" + x).join(" ")} } ?g wdt:P444 ?v. FILTER(STRENDS(STR(?v), "/100")) BIND(xsd:decimal(STRBEFORE(STR(?v), "/")) AS ?s) } GROUP BY ?g`, signal);
      return Object.fromEntries(rows.map(r => [r.g, +r.score]).filter(([, v]) => v > 0 && v <= 100)); } catch (e) { if (e.name === "AbortError") throw e; return {}; }
  }
  // a remaster, edition or collection of a game you already have isn't a real recommendation
  const reissueOfOwned = it => { const t = norm(it.title || ""); if (!/remaster|definitive|edition|collection|remake|director|complete|goty|anniversary|deluxe|hd\b|bundle/i.test(it.title || "")) return false; return games.some(g => { const n = norm(g.title); return n.length > 3 && t.startsWith(n.split(" ").slice(0, 3).join(" ")); }); };
  function recPick(pool){
    // every number comes from today's salt plus the game's id, so adding or hiding one game doesn't reshuffle the rest
    const seen = settings.recSeen || {}, hide = new Set(settings.recHide || []), boost = new Map();
    const mult = id => { if (!boost.has(id)) boost.set(id, .55 + recRng("m" + id)() * .9); return boost.get(id); }; // each of your games counts a bit more or less today
    const list = pool.map((it, i) => [it, i]).filter(([it]) => !it.hidden && !hide.has(it.wikidata) && !ownedOf(it));
    const sc = list.map(([it]) => it.rank * ((it.src || []).reduce((m, id) => Math.max(m, mult(id)), .55)) * Math.pow(.8, Math.max(0, (seen[it.wikidata] || 0) - 2)));
    const top = Math.max(...sc, 1);
    const drawn = list.map((x, k) => [x, Math.pow(recRng("r" + x[0].wikidata)(), top / Math.max(top * .05, sc[k]))]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
    const cap = new Map(), per = new Map();
    const out = drawn.filter(([it]) => { const g = it.group || "", n = (cap.get(g) || 0) + 1; cap.set(g, n); const src = (it.src || [])[0] || "", m = (per.get(src) || 0) + 1; per.set(src, m);
      return (!g || n <= (g[0] === "s" ? 2 : 3)) && m <= 3; }).slice(0, 30);
    if (settings.recSeenDay !== todayISO() && out.length) { const s2 = { ...seen }; out.slice(0, 10).forEach(([it]) => s2[it.wikidata] = (s2[it.wikidata] || 0) + 1); settings.recSeen = Object.fromEntries(Object.entries(s2).slice(-400)); settings.recSeenDay = todayISO(); applySettings(); }
    return out;
  }
  // a small seeded random generator: the same picks all day, new ones tomorrow or after Shuffle
  const recSalt = () => `${todayISO()}|${settings.recSpin || 0}`;
  function recRng(tag){ let h = 2166136261; for (const ch of recSalt() + tag) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const DISC = {
    recs: { title: "Recommended for you", note: "Based on the games you've rated highly, finished or are playing. New picks every day, or press Shuffle.", ttl: 3 * 864e5,
      // one bigger lookup, kept for a few days; the daily picks and Shuffle are drawn from it on your device, instantly
      key: () => "recs4:" + seeds().map(x => x.id + ":" + Math.round(x.w * 2)).join(","),
      async load(signal){
        const sd = seeds(); if (!sd.some(x => x.w > 0)) return [];
        const vals = a => a.map(x => `(wd:${x.id} ${x.w.toFixed(2)})`).join(" ");
        const gseeds = [...sd.filter(x => x.w > 0).slice(0, 10), ...sd.filter(x => x.w < 0).slice(0, 3)]; // genre matches are the slow part: only from your top games
        const excl = [...new Set([...sd.map(x => x.id), ...games.filter(g => /^Q\d+$/.test(g.wikidata || "")).map(g => g.wikidata), ...(settings.recHide || [])])].map(x => "wd:" + x).join(",");
        const rows = await sparql(`SELECT ?g ${SEL} (SUM(?wt) AS ?wscore) (GROUP_CONCAT(DISTINCT CONCAT(?why, ":", STRAFTER(STR(?seed), "entity/")); separator="|") AS ?reasons) (MIN(YEAR(?d)) AS ?year) WHERE {
          { VALUES (?seed ?sw) { ${vals(sd)} }
            { ?seed wdt:P179 ?x. ?g wdt:P179 ?x. BIND("series" AS ?why) BIND(4 AS ?k) }
            UNION { ?seed wdt:P178 ?x. ?g wdt:P178 ?x. BIND("dev" AS ?why) BIND(3 AS ?k) }
            UNION { ?seed wdt:P155|wdt:P156 ?g. BIND("next" AS ?why) BIND(5 AS ?k) }
            UNION { ?seed wdt:P840 ?x. ?g wdt:P840 ?x. BIND("setting" AS ?why) BIND(1.6 AS ?k) }
            UNION { ?seed wdt:P921 ?x. ?g wdt:P921 ?x. BIND("theme" AS ?why) BIND(1.6 AS ?k) } }
          UNION { VALUES (?seed ?sw) { ${vals(gseeds)} } ?seed wdt:P136 ?x. ?g wdt:P136 ?x. BIND("genre" AS ?why) BIND(1 AS ?k) }
          ?g wdt:P31 wd:Q7889; wikibase:sitelinks ?links. FILTER(?links >= 12)
          FILTER(?g NOT IN (${excl}))
          BIND(?k * ?sw AS ?wt) OPTIONAL { ?g wdt:P577 ?d } ${EXTRA}
        } GROUP BY ?g ORDER BY DESC(?wscore) DESC(?n) LIMIT 200`, signal);
        const names = Object.fromEntries(sd.map(x => [x.id, x.t]));
        const items = rows.map(toItem).map(it => {
          const rs = it.reasons.split("|").map(x => x.split(":")), by = k => rs.filter(r => r[0] === k).map(r => names[r[1]]).filter(Boolean);
          const ser = by("series"), dv = by("dev"), gn = [...new Set(by("genre"))], nx = by("next"), set = [...new Set([...by("setting"), ...by("theme")])];
          it.because = nx.length ? `Follows on from ${nx[0]}` : ser.length ? `Same series as ${ser[0]}` : dv.length ? `From the studio behind ${dv[0]}` : set.length ? `Similar world to ${set[0]}` : gn.length > 1 ? `Like ${gn[0]} and ${gn[1]}` : gn.length ? `Like ${gn[0]}` : "";
          it.src = [...new Set(rs.map(r => r[1]))]; // which of your games point at it
          const weak = !ser.length && !dv.length && !nx.length;
          it.rank = it.score * (weak ? (set.length ? .9 : gn.length > 1 ? .8 : .45) : 1) * (1 + Math.min(.6, (it.src.length - 1) * .15)) + Math.log2(it.n + 1);
          it.group = nx.length || ser.length ? "s:" + (ser[0] || nx[0]) : dv.length ? "d:" + dv[0] : "";
          return it;
        }).filter(it => it.rank > 0 && !reissueOfOwned(it));
        // quality and buzz: Metacritic score and how much people read about it lately
        const top = [...items].sort((a, b) => b.rank - a.rank).slice(0, 160), [cs, pv] = await Promise.all([criticScores(top.map(it => it.wikidata), signal), pageviews(top.map(it => it.wiki), signal, 60)]);
        items.forEach(it => { const c = cs[it.wikidata], v = pv[it.wiki] || 0; if (c) it.metacritic = c;
          it.rank *= (c >= 88 ? 1.45 : c >= 80 ? 1.25 : c >= 72 ? 1.05 : c && c < 62 ? .6 : 1) * (1 + Math.min(.35, Math.log10(1 + v / 2000) * .25)); });
        return withCovers(items, signal);
      } },
    pop: { title: "Popular right now", note: "Games out in the last 18 months that people are reading about most this month.", ttl: 864e5, key: () => "pop2",
      async load(signal){
        const from = new Date(Date.now() - 548 * 864e5).toISOString().slice(0, 10);
        const rows = await sparql(`SELECT ?g ${SEL} (MIN(?d) AS ?date) WHERE {
          ?g wdt:P31 wd:Q7889; wdt:P577 ?d; wikibase:sitelinks ?links. FILTER(?links >= 5)
          FILTER(?d >= "${from}T00:00:00Z"^^xsd:dateTime && ?d <= NOW())
          FILTER NOT EXISTS { ?g wdt:P577 ?e FILTER(?e < "${from}T00:00:00Z"^^xsd:dateTime) } ${EXTRA}
        } GROUP BY ?g ORDER BY DESC(?n) LIMIT 120`, signal);
        const items = rows.map(toItem).filter(it => it.wiki), pv = await pageviews(items.map(it => it.wiki), signal, 30);
        items.forEach(it => it.views = pv[it.wiki] || 0);
        // fresher games get a nudge so this month's releases aren't buried under last year's hits
        const age = it => it.release ? Math.max(0, (Date.now() - new Date(it.release)) / 864e5) : 400;
        const ranked = items.filter(it => it.views > 0).sort((a, b) => b.views * (1.4 - Math.min(.6, age(b) / 900)) - a.views * (1.4 - Math.min(.6, age(a) / 900))).slice(0, 30);
        ranked.forEach(it => it.because = `${it.views >= 1000 ? Math.round(it.views / 1000) + "k" : it.views} reads this month`);
        return withCovers(ranked.length >= 8 ? ranked : rows.map(toItem).slice(0, 30), signal);
      } },
    soon: { title: "Coming soon", note: "The most anticipated games that aren't out yet, by how much people are reading about them. Wishlist one to follow it on your release radar.", ttl: 864e5, key: () => "soon2",
      async load(signal){
        const rows = await sparql(`SELECT ?g ${SEL} (MIN(?d) AS ?date) WHERE {
          ?g wdt:P31 wd:Q7889; wdt:P577 ?d; wikibase:sitelinks ?links. FILTER(?links >= 3) FILTER(?d > NOW())
          FILTER NOT EXISTS { ?g wdt:P577 ?e FILTER(?e <= NOW()) } ${EXTRA}
        } GROUP BY ?g ORDER BY DESC(?n) LIMIT 120`, signal);
        const items = rows.map(toItem), pv = await pageviews(items.map(it => it.wiki), signal, 30);
        items.forEach(it => it.views = pv[it.wiki] || 0);
        const ranked = items.sort((a, b) => b.views - a.views || b.n - a.n).slice(0, 30);
        ranked.forEach(it => { if (it.views >= 500) it.because = `${it.views >= 1000 ? Math.round(it.views / 1000) + "k" : it.views} reads this month`; });
        return withCovers(ranked, signal);
      } },
    jog: { title: "Jog your memory", note: "Lists to help you find games you've played but forgotten to add. Tap ✓ Played on any you remember.", ttl: 7 * 864e5,
      key: () => { const j = jogState(); return `jog:${j.mode}:${j.val}:${j.mode === "series" || j.mode === "studio" ? jogSeeds().join(",") : ""}`; },
      async load(signal){
        const j = jogState(), base = `?g wdt:P31 wd:Q7889; wikibase:sitelinks ?links.`;
        let where;
        if (j.mode === "year") where = `${base} FILTER(?links >= 10) ?g wdt:P577 ?d.`;
        else if (j.mode === "console") where = `${base} ?g wdt:P400 wd:${j.val}. FILTER(?links >= 10) OPTIONAL { ?g wdt:P577 ?d }`;
        else { const sd = jogSeeds(); if (!sd.length) return []; const p = j.mode === "series" ? "P179" : "P178";
          where = `VALUES ?seed { ${sd.map(x => "wd:" + x).join(" ")} } ?seed wdt:${p} ?x. ?g wdt:${p} ?x. ${base} FILTER(?links >= 6) FILTER(?g NOT IN (${sd.map(x => "wd:" + x).join(",")})) OPTIONAL { ?g wdt:P577 ?d }`; }
        const rows = await sparql(`SELECT ?g ${SEL} (MIN(YEAR(?d)) AS ?year) WHERE { ${where} ${EXTRA} } GROUP BY ?g ${j.mode === "year" ? `HAVING(MIN(YEAR(?d)) = ${+j.val}) ` : ""}ORDER BY DESC(?n) LIMIT 60`, signal);
        return withCovers(rows.map(toItem), signal);
      } },
    coop: { title: "Play together", note: "Co-op and multiplayer games. Tap 👥 to keep one on your play-together list, then ask a friend to join you.", ttl: 7 * 864e5,
      key: () => `coop:${coopMode()}:${coopEra()}`,
      async load(signal){
        const re = coopMode() === "coop" ? "co-?op|cooperative" : "multiplayer|online", era = coopEra() === "recent" ? `?g wdt:P577 ?d0. FILTER(YEAR(?d0) >= ${new Date().getFullYear() - 8})` : "";
        const rows = await sparql(`SELECT ?g ${SEL} (MIN(YEAR(?d)) AS ?year) WHERE { ?g wdt:P31 wd:Q7889; wikibase:sitelinks ?links. FILTER(?links >= ${coopEra() === "recent" ? 15 : 30}) ${era}
          ?g wdt:P404 ?m. ?m rdfs:label ?ml. FILTER(LANG(?ml) = "en" && REGEX(?ml, "${re}", "i")) OPTIONAL { ?g wdt:P577 ?d } ${EXTRA} } GROUP BY ?g ORDER BY DESC(?n) LIMIT 80`, signal);
        return withCovers(rows.map(toItem), signal);
      } },
    top: { title: "Top 100 of all time", note: "The best-reviewed games ever, by critic score. Tap ✓ on the ones you've played to fill your library fast.", ttl: 7 * 864e5, key: () => "top",
      async load(signal){
        const rows = await sparql(`SELECT ?g ${SEL} (MAX(?sc) AS ?score) (MIN(YEAR(?d)) AS ?year) WHERE {
          VALUES ?by { wd:Q150248 wd:Q21039459 }
          ?g wdt:P31 wd:Q7889; p:P444 ?s; wikibase:sitelinks ?links. ?s ps:P444 ?v; pq:P447 ?by. FILTER(?links >= 12)
          FILTER(STRENDS(?v, "/100")) BIND(xsd:integer(STRBEFORE(?v, "/")) AS ?sc) FILTER(?sc >= 87)
          OPTIONAL { ?g wdt:P577 ?d } ${EXTRA}
        } GROUP BY ?g ORDER BY DESC(?score) DESC(?n) LIMIT 100`, signal);
        return withCovers(rows.map(toItem), signal);
      } }
  };
  // "Jog your memory": the year, console, series or studio to browse
  const JOG_CONSOLES = [["Q1406", "PC"], ["Q63184502", "PlayStation 5"], ["Q5014725", "PlayStation 4"], ["Q10683", "PlayStation 3"], ["Q10680", "PlayStation 2"], ["Q10677", "PlayStation"], ["Q170325", "PSP"], ["Q188808", "PS Vita"], ["Q122761124", "Switch 2"], ["Q19610114", "Switch"], ["Q56942", "Wii U"], ["Q8079", "Wii"], ["Q182172", "GameCube"], ["Q184839", "Nintendo 64"], ["Q183259", "SNES"], ["Q172742", "NES"], ["Q203597", "3DS"], ["Q170323", "Nintendo DS"], ["Q188642", "Game Boy Advance"], ["Q186437", "Game Boy"], ["Q98973368", "Xbox Series X|S"], ["Q13361286", "Xbox One"], ["Q48263", "Xbox 360"], ["Q132020", "Xbox"]];
  const jogState = () => { const j = settings.jog || {}, mode = ["year", "console", "series", "studio"].includes(j.mode) ? j.mode : "year"; const val = mode === "year" ? (+j.val >= 1975 && +j.val <= new Date().getFullYear() ? +j.val : 2015) : mode === "console" ? (JOG_CONSOLES.some(c => c[0] === j.val) ? j.val : "Q5014725") : ""; return { mode, val }; };
  const jogSeeds = () => games.filter(g => g.wikidata && !UNPLAYED.has(g.status)).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 40).map(g => g.wikidata);
  const jogControls = () => { const j = jogState(), Y = new Date().getFullYear();
    return `<div class="jogbar"><div class="seg">${[["year", "By year"], ["console", "By console"], ["series", "More from my series"], ["studio", "More from my studios"]].map(([k, n]) => `<button type="button" data-jog="${k}" aria-pressed="${j.mode === k}">${n}</button>`).join("")}</div>
      ${j.mode === "year" ? `<select id="jog-val" aria-label="Year">${Array.from({ length: Y - 1979 }, (_, i) => Y - i).map(y => `<option value="${y}"${y === j.val ? " selected" : ""}>${y}</option>`).join("")}</select>` : j.mode === "console" ? `<select id="jog-val" aria-label="Console">${JOG_CONSOLES.map(([id, n]) => `<option value="${id}"${id === j.val ? " selected" : ""}>${n}</option>`).join("")}</select>` : ""}</div>`; };
  const ownedOf = it => games.find(g => (it.wikidata && g.wikidata === it.wikidata) || norm(g.title) === norm(it.title));
  // ---------- play together: co-op/multiplayer browsing and a list you keep (synced with your shelves) ----------
  const coopMode = () => settings.coopMode === "multi" ? "multi" : "coop", coopEra = () => settings.coopEra === "all" ? "all" : "recent";
  const togetherOf = () => Array.isArray(nook.together) ? nook.together : [];
  const inTogether = it => togetherOf().some(x => (it.wikidata && x.w === it.wikidata) || norm(x.t) === norm(it.title || it.t || ""));
  const coopControls = () => `<div class="jogbar"><div class="seg">${[["coop", "Co-op"], ["multi", "Multiplayer"]].map(([k, n]) => `<button type="button" data-coopmode="${k}" aria-pressed="${coopMode() === k}">${n}</button>`).join("")}</div><div class="seg">${[["recent", "Recent"], ["all", "All time"]].map(([k, n]) => `<button type="button" data-coopera="${k}" aria-pressed="${coopEra() === k}">${n}</button>`).join("")}</div></div>`;
  function togetherList(){
    const L = togetherOf(); if (!L.length) return "";
    return `<div class="tglist"><span class="px">Your play-together list (${L.length})</span><div class="tgrow">${L.map((x, i) => `<div class="tgcard">${boxHTML({ title: x.t, coverUrl: x.c, steamAppId: x.a, year: x.y })}<b title="${esc(x.t)}">${esc(x.t)}</b>${x.asked?.length ? `<small>Asked ${x.asked.map(id => "@" + esc((fr.profiles[id] || {}).handle || "friend")).join(", ")}</small>` : ""}
      <div class="tgact"><button class="btn small primary" type="button" data-tgask="${i}">Ask a friend</button><button class="linkbtn" type="button" data-tgrm="${i}" aria-label="Remove ${esc(x.t)}">Remove</button></div></div>`).join("")}</div></div>`;
  }
  function toggleTogether(it){
    const L = togetherOf();
    nook.together = inTogether(it) ? L.filter(x => !((it.wikidata && x.w === it.wikidata) || norm(x.t) === norm(it.title))) : [{ ...noteGame(it), added: todayISO(), asked: [] }, ...L].slice(0, 120);
    saveNook(false); renderDiscover(); toast(inTogether(it) ? `${it.title} is on your play-together list` : `Removed ${it.title}`);
  }
  // pick a friend to ask: sends them a note ("Want to play this together?")
  function askFriendToPlay(x, done){
    const acc = (fr.rels || []).filter(r => r.status === "accepted").map(r => r.requester === sync.user?.id ? r.addressee : r.requester).filter(id => fr.profiles[id]);
    if (!sync.user) { toast("Sign in and add friends first (Friends tab)."); return; }
    if (!acc.length) { toast("Add a friend first in the Friends tab."); return; }
    const el = document.createElement("div"); el.className = "frgame-pop";
    el.innerHTML = `<div class="fgp-in rec"><div class="fgp-tx"><span class="px">Play together</span><h3>${esc(x.t)}</h3><p class="note">Who do you want to play it with?</p>
      <div class="recl">${acc.map(id => `<button type="button" class="recg" data-askf="${esc(id)}"><b>${esc(fr.profiles[id].name || "@" + fr.profiles[id].handle)}</b><small>@${esc(fr.profiles[id].handle)}</small></button>`).join("")}</div>
      <textarea rows="2" maxlength="500">Want to play this together?</textarea><div class="nact"><button class="btn small" type="button" data-fgx>Cancel</button></div></div></div>`;
    el.addEventListener("click", async e => {
      if (e.target === el || e.target.closest("[data-fgx]")) { el.remove(); return; }
      const b = e.target.closest("[data-askf]"); if (!b) return; b.disabled = true;
      if (await sendNote(b.dataset.askf, "rec", { t: x.t, w: x.w, a: x.a, c: x.c, y: x.y }, el.querySelector("textarea").value.trim())) { toast(`Asked ${fr.profiles[b.dataset.askf].name || "@" + fr.profiles[b.dataset.askf].handle}`); el.remove(); done?.(b.dataset.askf); } else b.disabled = false;
    });
    document.body.append(el);
  }
  function dcard(it, k, i, rank){
    const have = ownedOf(it), soon = k === "soon";
    const meta = soon ? fmtRelease(it.release) : [it.year, it.metacritic ? `${it.metacritic} critics` : ""].filter(Boolean).join(" · ");
    return `<div class="dcard${have ? " have" : ""}">
      <button class="dcov" type="button" data-dopen="${k}:${i}" aria-label="Open ${esc(it.title)}">${boxHTML(it)}${rank ? `<b class="drank">${rank}</b>` : ""}${have ? `<span class="dhave">${esc(STATUS[have.status])}</span>` : ""}</button>
      <div class="dt" title="${esc(it.title)}">${esc(it.title)}</div>
      <div class="dm${soon ? " two" : ""}">${esc(meta || " ")}</div>
      ${it.because ? `<div class="dwhy">${esc(it.because)}</div>` : ""}${k === "recs" && !have ? `<button class="linkbtn dnope" type="button" data-dnope="${k}:${i}">Not for me</button>` : ""}
      ${k === "coop" ? `<button class="btn small dtog${inTogether(it) ? " on" : ""}" type="button" data-dtog="${k}:${i}" title="Play-together list" aria-pressed="${inTogether(it)}">👥${inTogether(it) ? " ✓" : ""}</button>` : ""}
      ${have ? "" : `<div class="dact">${soon ? `<button class="btn primary small" type="button" data-dadd="${k}:${i}:wishlist">♥ Wishlist</button>` : `<button class="btn primary small" type="button" data-dadd="${k}:${i}:finished" title="I've played it">✓ Played</button><button class="btn small" type="button" data-dadd="${k}:${i}:wishlist" title="Add to wishlist" aria-label="Add to wishlist">♥</button><button class="btn small" type="button" data-dadd="${k}:${i}:backlog" title="Add to backlog" aria-label="Add to backlog">+</button>`}</div>`}
    </div>`;
  }
  const skel = n => Array.from({ length: n }, () => `<div class="dcard skel"><div class="box"></div><div class="dt">&nbsp;</div><div class="dm">&nbsp;</div></div>`).join("");
  function renderDiscover(load){
    const el = $("#disc"), y = window.scrollY, keep = new Map([...el.querySelectorAll(".dsec")].map(s => [s.id, s.querySelector(".shelfrow,.topgrid")?.scrollLeft || 0]));
    requestAnimationFrame(() => { keep.forEach((x, id) => { const r = document.getElementById(id)?.querySelector(".shelfrow,.topgrid"); if (r && x) r.scrollLeft = x; }); if (Math.abs(window.scrollY - y) > 2) window.scrollTo({ top: y, behavior: "auto" }); });
    el.innerHTML = Object.entries(DISC).map(([k, d]) => {
      const c = disc[k], fresh = c && c.key === d.key() && Date.now() - c.t < d.ttl, items = k === "jog" && c && c.key !== d.key() && (discLoading[k] || load) ? [] : c?.items || []; // recommendations keep showing the last list while a new one loads
      const shut = (k === "top" || k === "jog") && !(settings.discOpen || {})[k]; // big lists stay folded until you open them
      if (shut) return `<section class="dsec dfold" id="d-${k}"><button type="button" class="dfoldbtn" data-dfold="${k}" aria-expanded="false"><span><b>${d.title}</b><small>${k === "top" ? "The best-reviewed games ever" : "Lists to find games you forgot to add"}</small></span><i aria-hidden="true">▾</i></button></section>`;
      if (load && !fresh && !discLoading[k]) loadDisc(k);
      let body;
      if (k === "recs" && !seeds().length) body = `<div class="empty" style="margin-top:0"><div>Rate a few games, or mark some finished, and recommendations appear here. Games added through search or Discover count.</div></div>`;
      else if (!items.length && discLoading[k]) body = `<div class="shelfrow">${skel(6)}</div>`;
      else if (!items.length && c?.err) body = `<div class="status">${esc(c.err)} <button class="linkbtn" type="button" data-dreload="${k}">Try again</button></div>`;
      else if (k === "jog" && ["series", "studio"].includes(jogState().mode) && !jogSeeds().length) body = `<div class="status">Mark a few games as played or finished and their series and studios show up here.</div>`;
      else if (!items.length) body = `<div class="status">Nothing here yet.</div>`;
      else if (k === "top") { const list = items.map((it, i) => [it, i]).filter(([it]) => !topHideOwned || !ownedOf(it)); body = `<div class="topgrid">${list.map(([it, i]) => dcard(it, k, i, i + 1)).join("")}</div>`; }
      else { const list = k === "recs" ? recPick(items) : items.map((it, i) => [it, i]).filter(([it]) => !ownedOf(it) && !it.hidden); // games you've already saved leave the recommendations
        body = list.length ? `<div class="shelfrow">${list.map(([it, i]) => dcard(it, k, i)).join("")}</div>` : `<div class="status">You already have every game in this row. New ones appear as the list updates.</div>`; }
      const extra = k === "coop" ? coopControls() : k === "recs" && seeds().length ? `<span class="chips">${discLoading.recs && (disc.recs?.items || []).length ? `<span class="note">Updating…</span>` : ""}<button class="btn small" type="button" data-recspin>⟳ Shuffle</button></span>` : k === "jog" ? jogControls() : k === "top" && items.length ? `<label class="chip" style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" id="top-hide" ${topHideOwned ? "checked" : ""}> Hide games I have</label>` : (c && items.length ? `<button class="linkbtn" type="button" data-dreload="${k}" style="font-weight:400">Refresh</button>` : "");
      return `<section class="dsec" id="d-${k}"><div class="reshead"><div><h2>${d.title}${k === "top" || k === "jog" ? ` <button class="linkbtn dhide" type="button" data-dfold="${k}" aria-expanded="true">Hide</button>` : ""}</h2><div class="note">${d.note}</div></div>${extra}</div>${k === "coop" ? togetherList() : ""}${body}</section>`;
    }).join("");
  }
  async function loadDisc(k){
    discLoading[k] = true;
    const key = DISC[k].key();
    try { const items = await DISC[k].load(); disc[k] = { key, t: Date.now(), items }; }
    catch { disc[k] = { ...(disc[k] || {}), err: navigator.onLine ? "Couldn't reach Wikidata right now." : "You're offline, so Discover can't load." }; }
    finally { discLoading[k] = false; lsSet(DISC_KEY, disc); if (tab === "discover") renderDiscover(k === "jog" && key !== DISC[k].key()); }
  }
  const discItem = ref => { const [k, i] = ref.split(":"); return disc[k]?.items?.[+i]; };
  async function enrich(id){
    const g = games.find(x => x.id === id); if (!g?.wikidata) return;
    try {
      const [r] = await toGames([g.wikidata]); if (!r) return;
      const cur = games.find(x => x.id === id); if (!cur) return;
      const out = { ...cur, lookedUp: true, artChecked: true };
      for (const k of ["developer", "year", "series", "steamAppId", "metacritic", "criticBy", "wiki", "logoUrl", "release", "summary"]) if (!out[k] && r[k]) out[k] = r[k];
      if (out.criticBy === "Critics" && r.criticBy) { out.criticBy = r.criticBy; out.metacritic = r.metacritic || out.metacritic; }
      if (!(out.genres || []).length && r.genres.length) out.genres = r.genres;
      if (!(out.platforms || []).length && r.platforms.length) out.platforms = r.platforms;
      saveGame(out);
    } catch {}
  }
  let discQuiet = false; // adding from Discover keeps the lists where they are; they refresh next visit
  function addFromDiscover(it, st){
    discQuiet = true;
    const g = { title: it.title, wikidata: it.wikidata, wiki: it.wiki, steamAppId: it.steamAppId, year: it.year, release: it.release, metacritic: it.metacritic, criticBy: it.criticBy, coverUrl: it.coverUrl || "",
      id: newId(), status: st, rating: 0, hours: "", progress: st === "finished" ? 100 : 0, started: "", finished: "", notes: "", sessions: [], cover: "", genres: [], platforms: [], added: new Date().toISOString() };
    saveGame(g, st === "finished" ? `Added ${it.title} as played. Rate it from its window anytime.` : `Added ${it.title} to ${STATUS[st]}`);
    enrich(g.id);
  }
  $("#disc").addEventListener("click", e => {
    const t = e.target;
    const fo = t.closest("[data-dfold]"); if (fo) { const k = fo.dataset.dfold; settings.discOpen = { ...(settings.discOpen || {}), [k]: !(settings.discOpen || {})[k] }; applySettings(); renderDiscover(true); return; }
    const tg = t.closest("[data-dtog]"); if (tg) { const it = discItem(tg.dataset.dtog); if (it) toggleTogether(it); return; }
    const cm = t.closest("[data-coopmode]"); if (cm) { settings.coopMode = cm.dataset.coopmode; applySettings(); renderDiscover(true); return; }
    const ce = t.closest("[data-coopera]"); if (ce) { settings.coopEra = ce.dataset.coopera; applySettings(); renderDiscover(true); return; }
    const ta = t.closest("[data-tgask]"); if (ta) { const L = togetherOf(), x = L[+ta.dataset.tgask]; if (x) askFriendToPlay(x, fid => { x.asked = [...new Set([...(x.asked || []), fid])]; saveNook(false); renderDiscover(); }); return; }
    const tr = t.closest("[data-tgrm]"); if (tr) { nook.together = togetherOf().filter((_, j) => j !== +tr.dataset.tgrm); saveNook(false); renderDiscover(); return; }
    if (t.closest("[data-recspin]")) { settings.recSpin = (settings.recSpin || 0) + 1; applySettings(); renderDiscover(); document.getElementById("d-recs")?.querySelector(".shelfrow")?.scrollTo({ left: 0, behavior: reduceMotion ? "auto" : "smooth" }); return; }
    const r = t.closest("[data-dreload]"); if (r) { delete disc[r.dataset.dreload]; loadDisc(r.dataset.dreload); renderDiscover(); return; }
    const no = t.closest("[data-dnope]"); if (no) { const [k, i] = no.dataset.dnope.split(":"), it = disc[k]?.items?.[+i]; if (it?.wikidata) { settings.recHide = [...(settings.recHide || []), it.wikidata].slice(-300); applySettings(); disc[k].items = disc[k].items.map((x, j) => j === +i ? { ...x, hidden: true } : x); renderDiscover(); toast(`Got it. ${it.title} won't be recommended again.`); } return; }
    const a = t.closest("[data-dadd]"); if (a) { const [k, i, st] = a.dataset.dadd.split(":"); const it = disc[k]?.items?.[+i]; if (it) addFromDiscover(it, st); return; }
    const o = t.closest("[data-dopen]"); if (o) { const it = discItem(o.dataset.dopen); if (!it) return; const have = ownedOf(it); if (have) openEditor(have, false); else openEditor({ ...it, status: o.dataset.dopen.startsWith("soon") ? "wishlist" : "backlog", lookedUp: false }, true); }
  });
  $("#disc").addEventListener("change", e => { if (e.target.id === "top-hide") { topHideOwned = e.target.checked; renderDiscover(); } if (e.target.id === "jog-val") { settings.jog = { ...jogState(), val: e.target.value }; applySettings(); renderDiscover(true); } });
  $("#disc").addEventListener("click", e => { const b = e.target.closest("[data-jog]"); if (!b) return; settings.jog = { mode: b.dataset.jog, val: "" }; applySettings(); renderDiscover(true); });

