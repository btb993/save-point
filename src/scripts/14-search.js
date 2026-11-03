  // ================= search =================
  const SUGGEST = ["Control Resonant", "Hades II", "Elden Ring", "Baldur's Gate 3", "Hollow Knight", "Zelda"];
  let lastResults = [], lastQuery = "", searchCtl = null;
  function renderResults(state){
    const w = $("#results-wrap");
    if (state === "idle") { w.innerHTML = ""; return; }
    if (state === "loading") { w.innerHTML = `<div class="status"><span class="dots">Looking up “${esc(lastQuery)}”</span></div>`; return; }
    const asTyped = `<button class="btn small" type="button" data-manual>Add “${esc(lastQuery)}” as typed</button>`;
    if (state !== "list") { w.innerHTML = `<div class="reshead"><span class="status">${esc(state)}</span><span class="chips">${asTyped}<button class="btn small" type="button" data-close>Close</button></span></div>`; return; }
    const list = lastResults;
    w.innerHTML = `<div class="results">
      <div class="reshead"><span class="px">${list.length ? `${list.length} match${list.length > 1 ? "es" : ""} for “${esc(lastQuery)}”` : `No games found for “${esc(lastQuery)}”`}</span><span class="chips">${list.some(r => norm(r.title) === norm(lastQuery)) ? "" : asTyped}<button class="btn small" type="button" data-close>✕ Close</button></span></div>
      ${list.map((r, i) => { const have = findSame(r); return `<div class="res">${boxHTML(r)}
        <div class="meta"><div class="t">${esc(r.title)}</div><div class="a">${esc(r.developer || "")}${r.series ? ` · ${esc(r.series)}` : ""}</div>
          <div class="facts">${r.year ? `<span>${esc(r.year)}</span>` : ""}${(r.genres||[]).length ? `<span>${esc(r.genres.join(" / "))}</span>` : ""}</div>
          <div class="plats">${(r.platforms||[]).slice(0, 6).map(p => `<span class="plat" style="--pc:${pcVar(p)}">${esc(p)}</span>`).join("")}</div>
          ${mcBadge(r)}
          ${r.summary ? `<div class="summary">${esc(r.summary)}</div>` : ""}</div>
        <div class="side">${have ? `<span class="owned">${STATUS[have.status] || "In your library"}</span>${!UNPLAYED.has(have.status) ? `<div class="starpick mini">${starsInput(have.rating, `data-qrate="${esc(have.id)}"`).replace(/^<div class="starpick" role="group" aria-label="Rating">|<\/div>$/g, "")}</div>` : ""}<button class="btn small" type="button" data-open="${esc(have.id)}">Details…</button>` : `<div class="qadd"><button class="btn primary small" type="button" data-qadd="${i}" data-qs="finished">✓ Played</button><button class="btn small" type="button" data-qadd="${i}" data-qs="playing">Playing</button><button class="btn small" type="button" data-qadd="${i}" data-qs="backlog">Backlog</button><button class="linkbtn" type="button" data-add="${i}">More…</button></div>`}</div></div>`; }).join("")}
      ${list.length ? "" : `<div class="note">Try a shorter or full title. Very new games can take a few days to appear; add them as typed meanwhile.</div>`}</div>`;
  }
  function closeResults(){ searchCtl?.abort(); lastResults = []; $("#q").value = ""; renderResults("idle"); }
  async function runSearch(q){
    q = q.trim(); if (!q) return;
    lastQuery = q; renderResults("loading");
    searchCtl?.abort(); const ctl = searchCtl = new AbortController();
    try { lastResults = await searchGames(q, ctl.signal); if (ctl === searchCtl) renderResults("list"); }
    catch (e) { if (e.name !== "AbortError") renderResults(navigator.onLine ? "The lookup didn't answer. Try again in a moment." : "You're offline, so lookup isn't available. You can still add the game by hand."); }
    finally { if (ctl === searchCtl) $("#search-btn").disabled = false; }
  }

