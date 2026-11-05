  // ================= library =================
  const missing = () => games.filter(g => (!g.lookedUp && (!g.developer || !(g.genres || []).length || !g.year || !g.steamAppId)) || !g.artChecked);
  function renderLibrary(){
    const counts = { all: games.length }; Object.keys(STATUS).forEach(k => counts[k] = games.filter(g => g.status === k).length);
    $("#filter").innerHTML = [["all","All"], ...Object.entries(STATUS)].filter(([k]) => k !== "dropped" || counts.dropped)
      .map(([k, v]) => `<button type="button" data-filter="${k}" aria-pressed="${filter === k}">${v}<span class="n">${counts[k]}</span></button>`).join("");
    const miss = missing().length, tools = $("#tools");
    if (!tools.contains(document.activeElement)) tools.innerHTML = games.length ? `<input class="filterq" id="libq" type="search" placeholder="Filter your library…" value="${esc(libQ)}" aria-label="Filter your library">${miss ? `<button class="btn small" type="button" id="fill-btn">Fill missing details and art (${miss})</button>` : ""}` : "";
    let list = games.filter(g => (filter === "all" || g.status === filter) && (!libQ || norm(g.title + " " + (g.developer || "") + " " + (g.genres || []).join(" ") + " " + mainPlat(g)).includes(norm(libQ))));
    const by = {
      added: (a, b) => (b.added || "").localeCompare(a.added || ""),
      played: (a, b) => lastPlayed(b).localeCompare(lastPlayed(a)) || (b.finished || "").localeCompare(a.finished || ""),
      title: (a, b) => (a.title || "").localeCompare(b.title || ""),
      rating: (a, b) => (b.rating || 0) - (a.rating || 0),
      hours: (a, b) => (Number(b.hours) || 0) - (Number(a.hours) || 0),
      mc: (a, b) => (mcNum(b) || 0) - (mcNum(a) || 0),
      year: (a, b) => (Number(b.year) || 0) - (Number(a.year) || 0)
    };
    list = [...list].sort(by[sortBy]);
    if (!games.length) { $("#list").innerHTML = `<div class="empty"><h3>Press start</h3><div>Fill your library in whichever way is quickest.</div>
      <div class="starter"><button type="button" data-steam><b>Import from Steam</b><span>Bring your whole Steam library, with hours, in one go.</span></button>
      <button type="button" data-focus-search><b>Search a game</b><span>Look up any game and add it to Playing, Finished or Backlog.</span></button>
      <button type="button" data-restore><b>Load a backup</b><span>Bring games over from the version inside Claude.</span></button></div></div>`; return; }
    if (!list.length) { $("#list").innerHTML = `<div class="empty"><div>No games match.</div></div>`; return; }
    $("#list").innerHTML = `<div class="grid">${list.map(g => { const p = progressOf(g); return `<button class="game" type="button" data-open="${esc(g.id)}">${boxHTML(g)}
      <span class="gt">${esc(g.title)}${timesDone(g) > 1 || g.replaying ? ` <span class="runsb" title="${g.replaying ? `Replay #${replayNo(g)}` : `Finished ${timesDone(g)} times`}">↻${g.replaying ? replayNo(g) : timesDone(g)}</span>` : ""}</span>
      ${g.status === "playing" && p ? `<span class="mini"><span style="width:${p}%"></span></span>` : ""}
      <span class="gs"><span class="pill ${g.status}">${STATUS[g.status] || ""}</span><span>${Number(g.hours) ? fmtH(g.hours) : ""}</span></span>
      ${g.rating ? `<span class="stars">${stars(g.rating)}</span>` : ""}</button>`; }).join("")}</div>`;
  }
  let filling = false;
  async function fillDetails(btn){
    if (filling) return; filling = true;
    const todo = missing(); let done = 0, i = 0;
    btn.disabled = true;
    try {
      for (const g of todo) {
        i++; btn.textContent = `Looking up ${i} of ${todo.length}…`;
        let r = null; if (!g.lookedUp || !g.wikidata) { try { r = await lookupOne(g); } catch {} }
        const cur = games.find(x => x.id === g.id); if (!cur) continue;
        const out = { ...cur };
        if (r) {
          for (const k of ["developer", "year", "series", "steamAppId", "metacritic", "criticBy", "wikidata", "wiki", "logoUrl", "release"]) if (!out[k] && r[k]) out[k] = r[k];
          if (!(out.genres || []).length && r.genres.length) out.genres = r.genres;
          if (!(out.platforms || []).length || (out.platforms.length === 1 && out.platforms[0] === "PC")) out.platforms = r.platforms.length ? r.platforms : out.platforms;
          if (!out.summary && r.summary) out.summary = r.summary;
          done++;
        }
        if (!out.coverUrl && out.wiki) { try { const c = await wikiCovers("en", [out.wiki]); if (c[out.wiki]) out.coverUrl = c[out.wiki].url; } catch {} }
        out.artChecked = true; out.lookedUp = true;
        out.updatedAt = Date.now();
        games[games.findIndex(x => x.id === g.id)] = out;
        if (i % 5 === 0) { saveLocal(); renderRack(); }
      }
      commit(`Found details for ${done} of ${todo.length} game${todo.length === 1 ? "" : "s"}${done < todo.length ? ". The rest can be filled in by hand." : ""}`);
    } finally { filling = false; btn.disabled = false; renderLibrary(); }
  }

