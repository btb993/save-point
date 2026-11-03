  // ================= steam import =================
  const JUNK = /^(store page|community hub|find community content|view stats|view your stats|achievements?\b.*|perfect games|recently played|all games|games|sort by.*|search.*|add to collection|play|install|manage|properties|guides|discussions|workshop|screenshots|videos|news|reviews|hide|uninstall|favorites|uncategorized|collections|filter|steam|library|home|downloads|friends|chat|privacy settings|followed games|wishlist|inventory|groups|badges|.*\bacquired\b.*|last (two weeks|played).*|(\d+\s*\/\s*\d+|[\d.,]+%)|https?:\/\/.*)$/i;
  function parseImport(text){
    text = String(text || "").trim(); if (!text) return [];
    const out = [];
    const push = (name, hours, appid) => { name = String(name || "").replace(/\s+/g, " ").trim(); if (!name || name.length > 120) return; out.push({ name, hours: hours != null && !isNaN(hours) ? Math.round(hours * 10) / 10 : null, appid: appid ? String(appid) : "" }); };
    if (/^[\[{]/.test(text)) {
      try {
        const j = JSON.parse(text);
        const arr = j?.response?.games || j?.games || (Array.isArray(j) ? j : []);
        arr.forEach(g => typeof g === "string" ? push(g) : push(g.name || g.title, g.playtime_forever != null ? g.playtime_forever / 60 : g.hours, g.appid || g.appID || g.steamAppId));
        if (out.length) return dedupe(out);
      } catch {}
    }
    if (/<gamesList|<game>/i.test(text)) {
      try {
        const doc = new DOMParser().parseFromString(text, "text/xml");
        doc.querySelectorAll("game").forEach(n => { const t = s => n.querySelector(s)?.textContent || ""; const h = t("hoursOnRecord"); push(t("name"), h ? parseFloat(h.replace(",", "")) : null, t("appID")); });
        if (out.length) return dedupe(out);
      } catch {}
    }
    let last = null;
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim(); if (!t) continue;
      const hm = t.match(/([\d][\d.,]*)\s*(hrs?|hours?|h)\b/i);
      if (hm && (/played|record|playtime/i.test(t) || /^[\d.,]+\s*(hrs?|hours?|h)\b/i.test(t))) { if (last && last.hours == null) last.hours = parseFloat(hm[1].replace(",", "")); continue; }
      const csv = t.match(/^(.+?)\s*[,;\t|]\s*([\d.]+)\s*(hrs?|hours?|h)?\s*$/i);
      if (csv && !/^\d+$/.test(csv[1])) { push(csv[1].replace(/^"|"$/g, ""), parseFloat(csv[2])); last = null; continue; }
      if (JUNK.test(t) || /^[\d\s.,:/-]+$/.test(t)) continue;
      push(t); last = out[out.length - 1];
    }
    return dedupe(out);
  }
  function dedupe(list){ const seen = new Set(); return list.filter(x => { const k = norm(x.name); if (!k || seen.has(k)) return false; seen.add(k); return true; }); }
  function openImport(){
    let rows = [], playedTo = "playing", unplayedTo = "backlog";
    const html = () => {
      const fresh = rows.filter(r => !r.dupe), pick = fresh.filter(r => r.on).length;
      return `<div class="modal wide imp" role="dialog" aria-modal="true" aria-label="Import from Steam">
        <div class="reshead"><h2>Import from Steam</h2><button class="btn small" type="button" data-mclose>Close</button></div>
        ${!rows.length ? `
        <ol class="how">
          <li><b>Copy and paste (easiest).</b> In Steam, open your profile, then <b>Games</b>, then <b>All games</b>. Select the whole page (Ctrl+A), copy (Ctrl+C) and paste it below. Hours come along too.</li>
          <li><b>Or upload a file</b>, which also brings the covers. Open <code>https://steamcommunity.com/id/YOUR-NAME/games?tab=all&amp;xml=1</code> (or <code>/profiles/YOUR-ID/…</code>), save the page with Ctrl+S, and choose it below. Your Game details must be Public in Steam's privacy settings.</li>
          <li>A plain list works too: one game per line, optionally <code>Name, hours</code>.</li>
        </ol>
        <textarea id="imp-text" placeholder="Paste your Steam games page or a list of games here…"></textarea>
        <div class="reshead"><label class="btn small" style="cursor:pointer">Choose a file<input type="file" id="imp-file" accept=".xml,.json,.txt,.csv,.html,.htm" hidden></label><button class="btn primary" type="button" id="imp-read">Read list</button></div>`
        : `
        <div class="reshead"><span class="px">${fresh.length} game${fresh.length === 1 ? "" : "s"} found${rows.length > fresh.length ? ` · ${rows.length - fresh.length} already in your library` : ""}</span><span class="chips"><button class="chip" type="button" id="imp-all">Select all</button><button class="chip" type="button" id="imp-none">Select none</button></span></div>
        <div class="reshead"><label class="note" style="display:flex;gap:6px;align-items:center">Games with play time go to <select class="sort" id="imp-played">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === playedTo ? "selected" : ""}>${v}</option>`).join("")}</select></label><label class="note" style="display:flex;gap:6px;align-items:center">Unplayed go to <select class="sort" id="imp-unplayed">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === unplayedTo ? "selected" : ""}>${v}</option>`).join("")}</select></label></div>
        <div class="implist">${rows.map((r, i) => `<div class="irow${r.dupe ? " dupe" : ""}"><input type="checkbox" data-ri="${i}" ${r.on ? "checked" : ""} ${r.dupe ? "disabled" : ""} aria-label="Import ${esc(r.name)}"><span class="nm" title="${esc(r.name)}">${esc(r.name)}</span><span class="h">${r.hours ? fmtH(r.hours) : "–"}</span>${r.dupe ? `<span class="px">In library</span>` : `<select data-rs="${i}" aria-label="Status for ${esc(r.name)}">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === r.status ? "selected" : ""}>${v}</option>`).join("")}</select>`}</div>`).join("")}</div>
        <div class="note">Uncheck anything that isn't a game. Afterwards, Fill missing details in the Library adds genres, studios and covers.</div>
        <div class="mfoot"><button class="btn small" type="button" id="imp-back">Start over</button><div class="r"><button class="btn primary" type="button" id="imp-go" ${pick ? "" : "disabled"}>Import ${pick} game${pick === 1 ? "" : "s"}</button></div></div>`}
      </div>`;
    };
    const draw = () => { $("#scrim").innerHTML = html(); wire(); };
    const wire = () => $("#imp-file")?.addEventListener("change", async e => { const f = e.target.files?.[0]; if (f) { $("#imp-text").value = await f.text(); readList(); } });
    const readList = () => {
      const parsed = parseImport($("#imp-text").value);
      if (!parsed.length) { toast("No games found in that text. Try copying the whole Steam games page."); return; }
      rows = parsed.map(p => { const dupe = !!findSame({ title: p.name, steamAppId: p.appid }); return { ...p, dupe, on: !dupe, status: p.hours > 0 ? playedTo : unplayedTo }; });
      draw();
    };
    openModal(html(), e => {
      const id = e.target.id;
      if (id === "imp-read") return readList();
      if (id === "imp-back") { rows = []; draw(); return; }
      if (id === "imp-all" || id === "imp-none") { rows.forEach(r => { if (!r.dupe) r.on = id === "imp-all"; }); draw(); return; }
      if (id === "imp-go") {
        const sel = rows.filter(r => r.on && !r.dupe), now = Date.now();
        sel.forEach((r, i) => games.push({ id: newId(), title: r.name, platform: "PC", platforms: ["PC"], steamAppId: r.appid || "", hours: r.hours || "", status: r.status, rating: 0, progress: 0, started: "", finished: "", notes: "", genres: [], sessions: [], cover: "", added: new Date(now - i).toISOString(), updatedAt: now }));
        closeModal(); showTab("library");
        if (sel.length) buddy.react("imported", { n: sel.length });
        commit(`Imported ${sel.length} game${sel.length === 1 ? "" : "s"}. Press Fill missing details to add genres and covers.`);
      }
    }, e => {
      if (e.target.matches("[data-ri]")) { rows[+e.target.dataset.ri].on = e.target.checked; const pick = rows.filter(r => r.on && !r.dupe).length; const b = $("#imp-go"); b.textContent = `Import ${pick} game${pick === 1 ? "" : "s"}`; b.disabled = !pick; }
      if (e.target.matches("[data-rs]")) rows[+e.target.dataset.rs].status = e.target.value;
      if (e.target.id === "imp-played" || e.target.id === "imp-unplayed") {
        if (e.target.id === "imp-played") playedTo = e.target.value; else unplayedTo = e.target.value;
        rows.forEach(r => { r.status = r.hours > 0 ? playedTo : unplayedTo; }); draw();
      }
    });
    wire();
  }

