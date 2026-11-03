  // ================= search =================
  const SUGGEST = ["Control Resonant", "Hades II", "Elden Ring", "Baldur's Gate 3", "Hollow Knight", "Zelda"];
  let lastResults = [], lastQuery = "", searchCtl = null;
  function renderResults(state){
    const w = $("#results-wrap");
    if (state === "idle") { w.innerHTML = ""; return; }
    if (state === "loading") { w.innerHTML = `<div class="status"><span class="dots">Looking up “${esc(lastQuery)}”</span></div>`; return; }
    const asTyped = `<button class="btn small" type="button" data-manual>Add “${esc(lastQuery)}” as typed</button>`;
    if (state !== "list") { w.innerHTML = `<div class="reshead"><span class="status">${esc(state)}</span><span class="chips">${asTyped}<button class="btn small" type="button" data-close>Close</button></span></div>`; return; }
    const list = sfApply(lastResults), hidden = lastResults.length - list.length, fd = sfDescribe();
    w.innerHTML = `<div class="results">
      <div class="reshead"><span class="px">${list.length ? `${list.length} match${list.length > 1 ? "es" : ""} for “${esc(lastQuery)}”` : `No games found for “${esc(lastQuery)}”`}${fd ? ` · ${esc(fd)}` : ""}</span><span class="chips">${list.some(r => norm(r.title) === norm(lastQuery)) ? "" : asTyped}<button class="btn small" type="button" data-close>✕ Close</button></span></div>
      ${hidden ? `<div class="sfhid"><span>${hidden} more result${hidden === 1 ? "" : "s"} hidden by your filters${fd ? ` (${esc(fd)})` : ""}.</span><button class="linkbtn" type="button" data-sfopen>Change</button><button class="linkbtn" type="button" data-sfclear2>Show all</button></div>` : ""}
      ${list.map((r, i) => { const have = findSame(r); return `<div class="res">${boxHTML(r)}
        <div class="meta"><div class="t">${esc(r.title)}</div><div class="a">${esc(r.developer || "")}${r.series ? ` · ${esc(r.series)}` : ""}</div>
          <div class="facts">${r.year ? `<span>${esc(r.year)}</span>` : ""}${(r.genres||[]).length ? `<span>${esc(r.genres.join(" / "))}</span>` : ""}</div>
          <div class="plats">${(r.platforms||[]).slice(0, 6).map(p => `<span class="plat" style="--pc:${pcVar(p)}">${esc(p)}</span>`).join("")}</div>
          ${mcBadge(r)}
          ${r.summary ? `<div class="summary">${esc(r.summary)}</div>` : ""}</div>
        <div class="side">${have ? `<span class="owned">${STATUS[have.status] || "In your library"}</span>${!UNPLAYED.has(have.status) ? `<div class="starpick mini">${starsInput(have.rating, `data-qrate="${esc(have.id)}"`).replace(/^<div class="starpick" role="group" aria-label="Rating">|<\/div>$/g, "")}</div>` : ""}<button class="btn small" type="button" data-open="${esc(have.id)}">Details…</button>` : `<div class="qadd"><button class="btn primary small" type="button" data-qadd="${i}" data-qs="finished">✓ Played</button><button class="btn small" type="button" data-qadd="${i}" data-qs="playing">Playing</button><button class="btn small" type="button" data-qadd="${i}" data-qs="backlog">Backlog</button><button class="linkbtn" type="button" data-add="${i}">More…</button></div>`}</div></div>`; }).join("")}
      ${list.length && !searchMore && searchGames.more !== false && list.length >= 6 ? `<div class="resmore"><button class="btn" type="button" data-searchmore>Show more results</button></div>` : ""}
      ${list.length ? "" : `<div class="note">Try a shorter or full title. Very new games can take a few days to appear; add them as typed meanwhile.</div>`}</div>`;
  }
  document.addEventListener("click", e => { if (e.target.closest("[data-searchmore]")) { const b = e.target.closest("button"); b.disabled = true; b.textContent = "Looking for more…"; runSearch(lastQuery, true); } });
  function closeResults(){ searchCtl?.abort(); lastResults = []; $("#q").value = ""; renderResults("idle"); }
  let searchMore = false;
  async function runSearch(q, more = false){
    q = q.trim(); if (!q) return; more = more || sfFilters(); searchMore = more;
    lastQuery = q; if (!more) renderResults("loading");
    searchCtl?.abort(); const ctl = searchCtl = new AbortController();
    try { lastResults = await searchGames(q, ctl.signal, more); if (ctl === searchCtl) renderResults("list"); }
    catch (e) { if (e.name !== "AbortError") renderResults(navigator.onLine ? "The lookup didn't answer. Try again in a moment." : "You're offline, so lookup isn't available. You can still add the game by hand."); }
    finally { if (ctl === searchCtl) $("#search-btn").disabled = false; }
  }

  // ---------- search filters: console, release years and order ----------
  const SF_FAM = [["", "Any"], ["ps", "PlayStation"], ["xb", "Xbox"], ["ns", "Nintendo"], ["pc", "PC"], ["mo", "Mobile"], ["ot", "Retro & other"]];
  const SF_CON = {
    ps: [["ps5", "PS5", /playstation 5/], ["ps4", "PS4", /playstation 4/], ["ps3", "PS3", /playstation 3/], ["ps2", "PS2", /playstation 2/], ["ps1", "PS1", /^playstation( \(console\))?$|^ps1$|^psx$/], ["psp", "PSP", /playstation portable|^psp$/], ["vita", "Vita", /vita/], ["psvr", "PS VR", /playstation vr/]],
    xb: [["xsx", "Series X|S", /series x|series s/], ["xone", "Xbox One", /xbox one/], ["x360", "Xbox 360", /xbox 360/], ["xog", "Original Xbox", /^xbox$/]],
    ns: [["sw2", "Switch 2", /switch 2/], ["sw", "Switch", /nintendo switch(?! 2)|^switch$/], ["wiiu", "Wii U", /wii u/], ["wii", "Wii", /^wii$/], ["gc", "GameCube", /gamecube/], ["n64", "N64", /nintendo 64|^n64$/], ["snes", "SNES", /super nintendo|snes|super famicom/], ["nes", "NES", /^nintendo entertainment system|^nes$|^famicom/], ["3ds", "3DS", /3ds/], ["ds", "DS", /nintendo ds|^ds$/], ["gba", "GBA", /game boy advance|^gba$/], ["gb", "Game Boy", /^game boy( color)?$/]],
    pc: [["win", "Windows", /windows|^pc$|microsoft windows|dos/], ["mac", "Mac", /mac/], ["lin", "Linux", /linux|steamos/]],
    mo: [["ios", "iOS", /ios|iphone|ipad/], ["and", "Android", /android/]],
    ot: [["sega", "Sega", /sega|genesis|mega drive|dreamcast|saturn|master system|game gear/], ["atari", "Atari", /atari/], ["arcade", "Arcade", /arcade/], ["neo", "Neo Geo", /neo ?geo/]]
  };
  const SF_ERA = [["", "Any time"], ["new", "Last 2 years"], ["2020", "2020s"], ["2010", "2010s"], ["2000", "2000s"], ["1990", "1990s"], ["old", "Before 1990"], ["soon", "Not out yet"]];
  const SF_SORT = [["", "Best match"], ["new", "Newest"], ["old", "Oldest"], ["az", "A to Z"]];
  const sf = () => { const f = settings.searchF || {}; return { fam: f.fam || "", con: f.con || "", era: f.era || "", sort: f.sort || "" }; };
  const sfCount = () => { const f = sf(); return [f.fam, f.era, f.sort].filter(Boolean).length; };
  const sfFilters = () => { const f = sf(); return !!(f.fam || f.era); };
  function sfPass(r){
    const f = sf(), ps = (r.platforms || []).map(p => String(p).toLowerCase());
    if (f.fam) {
      if (!ps.length) return false;
      const C = f.con && (SF_CON[f.fam] || []).find(c => c[0] === f.con);
      if (C ? !ps.some(p => C[2].test(p)) : !ps.some(p => platFamily(p) === f.fam || (f.fam === "ot" && (SF_CON.ot.some(c => c[2].test(p)))))) return false;
    }
    if (f.era) {
      const y = Number(String(r.year || "").slice(0, 4)), now = new Date().getFullYear();
      if (f.era === "soon") return !y || y > now || (r.released && r.released > todayISO());
      if (!y) return false;
      if (f.era === "new" && y < now - 1) return false;
      if (f.era === "old" && y >= 1990) return false;
      if (/^\d{4}$/.test(f.era) && (y < +f.era || y > +f.era + 9)) return false;
    }
    return true;
  }
  function sfApply(list){
    const f = sf(), out = list.filter(sfPass), yr = r => Number(String(r.year || "").slice(0, 4)) || 0;
    if (f.sort === "new") out.sort((a, b) => yr(b) - yr(a));
    else if (f.sort === "old") out.sort((a, b) => (yr(a) || 9999) - (yr(b) || 9999));
    else if (f.sort === "az") out.sort((a, b) => a.title.localeCompare(b.title));
    return out;
  }
  function sfDescribe(){ const f = sf(), C = f.con && (SF_CON[f.fam] || []).find(c => c[0] === f.con);
    return [C ? C[1] : f.fam ? (SF_FAM.find(x => x[0] === f.fam) || [])[1] : "", f.era ? (SF_ERA.find(x => x[0] === f.era) || [])[1] : ""].filter(Boolean).join(" · "); }
  function sfRender(){
    const el = $("#search-filters"), f = sf(), n = sfCount(), b = $("#search-filt");
    const chips = (k, list, cur) => `<div class="sfchips">${list.map(([v, nm]) => `<button type="button" class="sfchip" data-sf="${k}" data-v="${v}" aria-pressed="${cur === v}">${esc(nm)}</button>`).join("")}</div>`;
    if (b) { const i = b.querySelector(".sfn"); i.hidden = !n; i.textContent = n; b.classList.toggle("on", !!n); }
    if (!el || el.hidden) return;
    el.innerHTML = `<div class="sfrow"><span class="px">Console</span>${chips("fam", SF_FAM, f.fam)}</div>
      ${f.fam && SF_CON[f.fam] ? `<div class="sfrow sub"><span class="px">Which one</span>${chips("con", [["", "Any " + (SF_FAM.find(x => x[0] === f.fam) || [])[1]], ...SF_CON[f.fam].map(c => [c[0], c[1]])], f.con)}</div>` : ""}
      <div class="sfrow"><span class="px">Released</span>${chips("era", SF_ERA, f.era)}</div>
      <div class="sfrow"><span class="px">Order</span>${chips("sort", SF_SORT, f.sort)}</div>
      <div class="sffoot">${n ? `<button class="linkbtn" type="button" data-sfclear>Clear filters</button>` : `<span class="note">Filters stay on until you clear them.</span>`}<button class="btn small" type="button" data-sfdone>Done</button></div>`;
  }
  function sfChanged(){ applySettings(); sfRender(); if (lastQuery && $("#results-wrap .results")) { if (sfFilters() && !searchMore) runSearch(lastQuery, true); else renderResults("list"); } }
  $("#search-filt").addEventListener("click", () => { const el = $("#search-filters"); el.hidden = !el.hidden; $("#search-filt").setAttribute("aria-expanded", String(!el.hidden)); sfRender(); });
  $("#search-filters").addEventListener("click", e => {
    const c = e.target.closest("[data-sf]"); if (c) { const f = sf(), k = c.dataset.sf; f[k] = c.dataset.v; if (k === "fam") f.con = ""; settings.searchF = f; sfChanged(); return; }
    if (e.target.closest("[data-sfclear]")) { settings.searchF = {}; sfChanged(); return; }
    if (e.target.closest("[data-sfdone]")) { $("#search-filters").hidden = true; $("#search-filt").setAttribute("aria-expanded", "false"); $("#q").focus(); }
  });
  document.addEventListener("click", e => { if (e.target.closest("[data-sfclear2]")) { settings.searchF = {}; sfChanged(); } if (e.target.closest("[data-sfopen]")) { const el = $("#search-filters"); el.hidden = false; $("#search-filt").setAttribute("aria-expanded", "true"); sfRender(); } });
  sfRender();
