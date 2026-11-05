  // ================= editor =================
  const root = $("#modal-root");
  let modalClose = null;
  function openModal(html, onClick, onChange){
    root.innerHTML = `<div class="scrim" id="scrim">${html}</div>`;
    root.onclick = e => { if (e.target.id === "scrim" || e.target.closest("[data-mclose]")) return closeModal(); onClick?.(e); };
    root.onchange = onChange || null;
  }
  function closeModal(){ root.innerHTML = ""; root.onclick = root.onchange = null; modalClose?.(); modalClose = null; }
  // add or remove a game from your own shelves straight from its window
  root.addEventListener("click", e => {
    const b = e.target.closest("[data-shelfadd]"); if (!b) return;
    const sh = shelfById(b.dataset.shelfadd), gid = b.dataset.gid; if (!sh) return;
    const on = sh.ids.includes(gid); sh.ids = on ? sh.ids.filter(x => x !== gid) : [...sh.ids, gid];
    b.setAttribute("aria-pressed", String(!on)); saveNook();
  });
  const shelfChips = d => { const mine = nook.shelves.filter(s => s.kind === "custom"); if (!mine.length || !d.id || !games.some(g => g.id === d.id)) return "";
    return `<div class="field"><span class="px">On your shelves</span><div class="seg shelfchips">${mine.map(s => `<button type="button" data-shelfadd="${esc(s.id)}" data-gid="${esc(d.id)}" aria-pressed="${s.ids.includes(d.id)}" style="--sc:${shelfColor(s, nook.shelves.indexOf(s))}">${esc(s.name)}${s.rule && ruleMatch(s.rule, d) ? " (auto)" : ""}</button>`).join("")}</div></div>`; };

  let moreOpen = false, soulMoreOpen = false, edTab = "basics";
  function openEditor(g, isNew, hint){
    edTab = /launch/i.test(hint || "") ? "play" : "basics";
    const d = { status: isNew ? "backlog" : g.status, rating: 0, hours: "", progress: 0, started: "", finished: "", notes: "", platforms: [], genres: [], sessions: [], ...g };
    if (!d.platform && (d.platforms || []).length === 1) d.platform = d.platforms[0];
    const prev = document.activeElement, sq = encodeURIComponent(d.title || "");
    const titleMain = isNew && !d.wikidata;
    const html = () => {
      const sess = [...(d.sessions || [])].sort((a, b) => b.d.localeCompare(a.d));
      const steam = d.steamAppId && !d.cover;
      return `<div class="modal game" role="dialog" aria-modal="true" aria-label="${isNew ? "Add game" : "Edit game"}">
        <div class="mban${steam ? "" : " blur"}" style="--c:${caseColor(d)}">${steam ? chainImg([steamImg(d.steamAppId, "library_hero.jpg"), ...coverChain(d)], "", "spHeroErr") : imgTag(d, "")}<button class="mx" type="button" data-mclose aria-label="Close">✕</button></div>
        <div class="mhead"><div>${boxHTML(d)}
          <div class="coverctl"><label class="drop" id="drop" tabindex="0">${d.cover ? "Replace image" : "Upload art"}<input type="file" id="f-cover" accept="image/*" hidden></label>
            <button class="btn small artbtn" type="button" id="art-btn">Find art</button>
            <div class="links">${d.cover ? `<button class="linkbtn" type="button" id="cover-rm" style="font-weight:400">Remove my image</button>` : ""}</div></div></div>
          <div class="meta">
            <div class="px">${isNew ? "Add to your library" : "In your library"}</div>
            <div class="t" style="font-size:22px">${esc(d.title || "New game")}</div>
            <div class="a">${esc(d.developer || "")}${d.year ? ` · ${esc(d.year)}` : ""}</div>
            ${mcBadge(d)}
            ${d.length ? `<div class="facts"><span>~${esc(d.length)} h to beat the main story</span></div>` : ""}
            ${d.summary ? `<div class="summary">${esc(d.summary)}</div>` : ""}
            <div class="facts"><a href="https://store.steampowered.com/${d.steamAppId ? "app/" + encodeURIComponent(d.steamAppId) : "search/?term=" + sq}" target="_blank" rel="noopener">Steam ↗</a><a href="https://howlongtobeat.com/?q=${sq}" target="_blank" rel="noopener">HowLongToBeat ↗</a><a href="https://www.metacritic.com/search/${sq}/" target="_blank" rel="noopener">Metacritic ↗</a></div>
          </div></div>
        ${hint ? `<div class="edhint">${esc(hint)}</div>` : ""}
        <div class="edquick">
        <div class="field edstatus"><span class="px">Status</span><div class="statpick">${Object.entries(STATUS).map(([k, v]) => `<button type="button" data-st="${k}" aria-pressed="${d.status === k}">${v}</button>`).join("")}</div></div>
          ${!UNPLAYED.has(d.status) ? `<div class="field edrate"><span class="px">Your rating</span>${starsInput(d.rating, "data-star")}</div>` : ""}
          ${!isNew && (d.status === "finished" || d.status === "dropped" || timesDone(d)) ? replayField(d) : ""}
        </div>
        ${(() => { const T = [["basics", "Basics"], ...(isNew ? [] : [["play", "Play"]]), ["details", "Details"], ...(!UNPLAYED.has(d.status) ? [["soul", "Soul"]] : [])]; const cur = T.some(x => x[0] === edTab) ? edTab : "basics";
          return `<div class="edtabs" role="tablist">${T.map(([k, n]) => `<button type="button" role="tab" data-edtab="${k}" aria-selected="${cur === k}">${n}</button>`).join("")}</div>`; })()}
        <div class="edpane" data-pane="basics">
          <div class="fields">
          ${titleMain ? `<label class="field full"><span class="px">Title</span><input id="f-title" value="${esc(d.title || "")}"></label>` : ""}
          <label class="field"><span class="px">Played on</span><input id="f-platform" list="plat-list" value="${esc(d.platform || "")}" placeholder="e.g. PS5, Switch, PC"><datalist id="plat-list">${[...new Set([...(d.platforms || []), "PS5", "PS4", "Xbox Series X|S", "Switch 2", "Switch", "PC", "Steam Deck", "Mobile"])].map(p => `<option value="${esc(p)}">`).join("")}</datalist></label>
          <label class="field"><span class="px">Hours played</span><input id="f-hours" type="number" min="0" step="0.5" inputmode="decimal" value="${esc(d.hours || "")}"${!(Number(d.hours) > 0) && estH(d) ? ` placeholder="~${esc(fmtH(estH(d)))} typical"` : ""}></label>
          ${estLine(d)}
          ${d.status === "playing" || d.status === "dropped" ? `<label class="field full"><span class="px">Completion: <output id="o-prog">${d.progress ? d.progress + "%" : "from hours"}</output></span><input id="f-progress" type="range" min="0" max="100" step="5" value="${esc(d.progress || 0)}"></label>` : ""}
          ${!UNPLAYED.has(d.status) ? dateField(d, "started", "Started") : ""}
          ${d.status === "finished" ? dateField(d, "finished", "Finished") : ""}
          </div>
          ${shelfChips(d)}
        </div>
        <div class="edpane" data-pane="play">
          ${games.some(x => x.id === d.id) && d.status !== "wishlist" ? (() => { const c = qCount(d.quests); return `<div class="field qfield"><span class="px">Quest log</span><div class="launchrow"><span>${d.quests ? `<b>${c.d}</b> of ${c.n} done` : "Track main and side quests from the IGN guide."}</span><button class="btn small primary" type="button" data-openquests>${d.quests ? "Open quest log" : "Load quests"}</button></div></div>`; })() : ""}
          ${runField(d)}
          ${launchField(d)}
          <div class="fields">
          ${d.status !== "wishlist" && games.some(x => x.id === d.id) ? `<div class="field full savefield"><button class="btn small" type="button" id="save-imp">Read playtime from save files</button><small class="muted">${d.saveImport ? `Last read ${relDay(d.saveImport.at)}: ${(d.saveDays || []).length} play days${d.hoursFrom ? `, hours from “${esc(d.hoursFrom.field)}”` : ""}.` : "PC games: pick the save folder to get play days, and total playtime when the save has it."}</small></div>` : ""}
          ${sess.length ? `<div class="field full"><span class="px">Sessions · ${sess.length}</span><div class="sess">${sess.slice(0, 12).map(s => `<span>${fmtDate(s.d)} · ${fmtH(s.h)}<button type="button" data-rmsess="${esc(s.d)}" aria-label="Remove session">✕</button></span>`).join("")}${sess.length > 12 ? `<span>+${sess.length - 12} more</span>` : ""}</div></div>` : ""}
          </div>
        </div>
        <div class="edpane" data-pane="details">
          <div class="fields">
          ${titleMain ? "" : `<label class="field full"><span class="px">Title</span><input id="f-title" value="${esc(d.title || "")}"></label>`}
          <label class="field"><span class="px">Developer</span><input id="f-dev" value="${esc(d.developer || "")}"></label>
          <label class="field"><span class="px">Genres</span><input id="f-genres" value="${esc((d.genres || []).join(", "))}" placeholder="comma separated"></label>
          <label class="field"><span class="px">Release year</span><input id="f-year" type="number" inputmode="numeric" min="1970" max="2100" value="${esc(d.year || "")}"></label>
          <label class="field"><span class="px">Hours to beat (story)</span><input id="f-length" type="number" inputmode="decimal" min="0" step="0.5" value="${esc(d.length || "")}" placeholder="see HowLongToBeat"></label>
          <label class="field"><span class="px">Metacritic</span><input id="f-mc" type="number" inputmode="numeric" min="0" max="100" value="${esc(d.metacritic || "")}"></label>
          <label class="field"><span class="px">Release date</span><input id="f-release" value="${esc(d.release || "")}" placeholder="YYYY-MM-DD, YYYY-MM or YYYY"></label>
          <label class="field"><span class="px">Steam app ID</span><input id="f-steam" inputmode="numeric" value="${esc(d.steamAppId || "")}" placeholder="for the cover"></label>
          <label class="field full"><span class="px">Notes</span><textarea id="f-notes" placeholder="Build, where you left off, thoughts…">${esc(d.notes || "")}</textarea></label>
          </div>
        </div>
        ${!UNPLAYED.has(d.status) ? `<div class="edpane" data-pane="soul">
        <div class="feelbox"><span class="px">Gamer DNA: the archetypes this game feeds</span>
          <div class="feelpills">${(() => { const on = Object.keys(genesOf(d)); return ARCH.map(a => `<button type="button" class="feel${on.includes(a.k) ? " on" : ""}" data-gene="${a.k}" aria-pressed="${on.includes(a.k)}" style="--fc:${a.c}"><i>${a.g}</i>${a.genre}</button>`).join(""); })()}</div>
          <small class="muted">${Array.isArray(d.dna) && d.dna.length ? `Chosen by you. <button class="linkbtn" type="button" data-geneauto>Go back to automatic</button>` : Object.keys(autoGenes(d)).length ? (d.lore ? "Picked automatically from its genres and its Wikipedia description. Tap to change." : "Picked automatically from its genres and title. Tap to change.") : "Nothing matched automatically yet, so this game doesn't shape your DNA. Pick the ones that fit."}</small></div>
        <div class="feelbox"><span class="px">How did it make you feel? Pick as many as you like</span>
          ${FEELS.map(([gk, gn, c, , gl, list]) => `<div class="feelgrp"><small style="color:${c}">${gn}</small><div class="feelpills">${list.map(n => { const id = fid(n), on = (d.feel?.f || []).includes(id); return `<button type="button" class="feel${on ? " on" : ""}" data-feel="${id}" aria-pressed="${on}" style="--fc:${c}"><i>${gl}</i>${n}${d.feel?.dom === id ? " ★" : ""}</button>`; }).join("")}</div></div>`).join("")}
          <label class="field"><span class="px">Other feelings (comma separated)</span><input id="f-cfeel" value="${esc((d.feel?.custom || []).join(", "))}"></label>
          ${(d.feel?.f || []).length ? `<label class="field"><span class="px">Dominant feeling</span><select id="f-dom"><option value="">None</option>${d.feel.f.map(id => `<option value="${id}" ${d.feel.dom === id ? "selected" : ""}>${FEEL.get(id).n}</option>`).join("")}</select></label>` : ""}
          <div class="field"><span class="px">Emotional intensity</span><div class="seg">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-int="${n}" aria-pressed="${d.feel?.i === n}">${n}</button>`).join("")}</div></div>
          <span class="px">Worlds you visited (World Passport)</span><div class="feelpills">${WORLDS.map(([k, n, gl, c]) => { const on = worldsOf(d).includes(k); return `<button type="button" class="feel${on ? " on" : ""}" data-world="${k}" aria-pressed="${on}" style="--fc:${c}"><i>${gl}</i>${n}</button>`; }).join("")}</div>
          <label class="check"><input type="checkbox" id="f-plat" ${d.platinum ? "checked" : ""}> 100% achievements or platinum</label>
          <label class="field" style="max-width:260px"><span class="px">Times restarted from the beginning</span><input id="f-restart" type="number" min="0" max="99" inputmode="numeric" value="${esc(d.restarts || "")}"></label>
        </div></div>` : ""}
        <div id="confirm-slot"></div>
        <div class="mfoot">${isNew ? "" : `<button class="btn danger small" type="button" id="m-del">Remove</button>`}${!isNew && sync.user && (fr.rels || []).some(r => r.status === "accepted") ? `<button class="btn small" type="button" id="m-rec" title="Send this game to a friend">🎮 Recommend</button>` : ""}
          <div class="r"><button class="btn" type="button" data-mclose>Cancel</button><button class="btn primary" type="button" id="m-save">${isNew ? "Add game" : "Save"}</button></div></div>
      </div>`;
    };
    const wire = () => {
      const drop = $("#drop");
      drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("over"); });
      drop.addEventListener("dragleave", () => drop.classList.remove("over"));
      drop.addEventListener("drop", e => { e.preventDefault(); drop.classList.remove("over"); const f = imageFrom(e.dataTransfer?.files); if (f) setCover(f); });
      drop.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("#f-cover").click(); } });
      $("#f-cover").addEventListener("change", e => { const f = e.target.files?.[0]; if (f) setCover(f); });
      $("#more")?.addEventListener("toggle", e => { moreOpen = e.target.open; });
      $("#soulmore")?.addEventListener("toggle", e => { soulMoreOpen = e.target.open; });
      edShow();
      $("#f-progress")?.addEventListener("input", e => { $("#o-prog").textContent = +e.target.value ? e.target.value + "%" : "from hours"; });
    };
    const draw = () => { $("#scrim").innerHTML = html(); wire(); };
    // one tab of the game window at a time; every field stays in the page so nothing typed is lost when switching
    function edShow(){ const tabs = [...document.querySelectorAll(".modal.game [data-edtab]")]; if (!tabs.some(b => b.dataset.edtab === edTab)) edTab = "basics";
      tabs.forEach(b => b.setAttribute("aria-selected", String(b.dataset.edtab === edTab))); document.querySelectorAll(".modal.game .edpane").forEach(p => p.hidden = p.dataset.pane !== edTab); }
    const grab = () => {
      const v = id => $("#" + id)?.value;
      const dv = id => { const x = String(v(id) || "").trim(); return /^\d{4}(-\d{2}(-\d{2})?)?$/.test(x) ? x : ""; };
      d.title = (v("f-title") ?? d.title).trim(); d.platform = (v("f-platform") ?? "").trim(); d.hours = v("f-hours") ?? d.hours;
      d.developer = (v("f-dev") ?? "").trim(); d.genres = (v("f-genres") ?? "").split(",").map(s => s.trim()).filter(Boolean);
      d.year = v("f-year") ? Number(v("f-year")) : null; d.length = v("f-length") ? Number(v("f-length")) : null;
      d.metacritic = v("f-mc") ? Number(v("f-mc")) : null; if ($("#f-release")) d.release = dv("f-release"); d.steamAppId = (v("f-steam") ?? "").replace(/\D/g, "");
      if ($("#f-progress")) d.progress = Number(v("f-progress")) || 0;
      if ($("#f-cfeel")) { d.feel = { f: [], dom: "", i: 0, custom: [], ...(d.feel || {}) }; d.feel.custom = (v("f-cfeel") ?? "").split(",").map(x => x.trim()).filter(Boolean).slice(0, 12); if ($("#f-dom")) d.feel.dom = v("f-dom") || ""; d.platinum = !!$("#f-plat")?.checked; d.restarts = v("f-restart") ? Math.max(0, Math.min(99, Number(v("f-restart")) || 0)) : 0; }
      if ($("#f-started")) d.started = dv("f-started"); if ($("#f-finished")) d.finished = dv("f-finished"); d.notes = v("f-notes") ?? d.notes;
      if ($("#f-launchurl")) d.launch = { ...(d.launch || {}), kind: "url", url: v("f-launchurl").trim().slice(0, 500) };
    };
    async function setCover(f){ try { grab(); d.cover = await downscale(f); draw(); } catch { toast("That image couldn't be read. Try a JPG or PNG."); } }
    const onPaste = e => { const f = imageFrom(e.clipboardData?.files); if (f) { e.preventDefault(); setCover(f); } };
    document.addEventListener("paste", onPaste);
    modalClose = () => { document.removeEventListener("paste", onPaste); prev?.focus?.(); };
    openModal(html(), e => {
      const t = e.target;
      if (t.id === "cover-rm") { grab(); d.cover = ""; draw(); return; }
      if (t.id === "art-btn") { grab(); openArt(d, pick => { Object.assign(d, pick); draw(); }); return; }
      if (t.id === "save-imp") { grab(); openSaveImport(d, got => { Object.assign(d, got); draw(); toast(`Read from your saves${got.hours != null ? `: ${fmtH(got.hours)} played` : ""}${got.saveDays ? `, ${got.saveDays.length} play days` : ""}. Press Save to keep it.`); }); return; }
      const rs = t.closest("[data-rmsess]"); if (rs) { grab(); const s = d.sessions.find(x => x.d === rs.dataset.rmsess); d.sessions = d.sessions.filter(x => x !== s); if (s) d.hours = Math.max(0, Math.round(((Number(d.hours) || 0) - s.h) * 10) / 10); draw(); return; }
      if (t.closest("[data-replay]")) { grab(); const g0 = games.find(x => x.id === d.id) || d; closeModal(); startReplay(g0.id); return; }
      const rp = t.closest("[data-runs]"); if (rp) { grab(); const past = [...(d.past || [])]; if (rp.dataset.runs === "+") past.unshift({ f: "", r: 0, h: 0, added: true }); else { const i = past.findIndex(x => x.added); past.splice(i >= 0 ? i : past.length - 1, 1); } d.past = past; draw(); return; }
      const st = t.closest("[data-st]");
      if (st) { grab(); if (d.status === "finished" && st.dataset.st !== "finished" && Number(d.progress) >= 100) d.progress = 0; d.status = st.dataset.st;
        if (d.status === "finished" && !d.finished && !isNew) d.finished = todayISO();
        if (d.status === "playing" && !d.started) d.started = todayISO();
        draw(); return; }
      const fe = t.closest("[data-feel]"); if (fe) { grab(); const id = fe.dataset.feel, f = d.feel.f; d.feel.f = f.includes(id) ? f.filter(x => x !== id) : [...f, id]; if (!d.feel.f.includes(d.feel.dom)) d.feel.dom = ""; draw(); return; }
      const fi = t.closest("[data-int]"); if (fi) { grab(); d.feel.i = d.feel.i === +fi.dataset.int ? 0 : +fi.dataset.int; draw(); return; }
      const et = t.closest("[data-edtab]"); if (et) { edTab = et.dataset.edtab; edShow(); return; }
      if (t.closest("[data-openquests]")) { grab(); openQuests(d.id); return; }
      if (t.closest("[data-mypc]")) { grab(); const back = () => openEditor({ ...d }, false); openMyPC(back); return; }
      if (t.closest("[data-runcheck]")) { grab(); const b = t.closest("[data-runcheck]"); b.textContent = "Checking…"; b.disabled = true; checkRun(d.id, true).then(r => { if (r) d.reqs = r; draw(); }); return; }
      const sm = t.closest(".modal.game .summary"); if (sm) { sm.classList.toggle("open"); return; }
      const la = t.closest("[data-launch]"); if (la) { grab(); const k = la.dataset.launch; if (k === "steam") delete d.launch; else if (k === "none") d.launch = { kind: "none" }; else d.launch = { ...(d.launch || {}), kind: k }; draw(); return; }
      if (t.closest("[data-linkexe]")) { grab(); if (!games.some(x => x.id === d.id)) { toast("Save the game first, then connect its .exe."); return; } linkExe(d); return; }
      const ge = t.closest("[data-gene]"); if (ge) { grab(); const cur = Object.keys(genesOf(d)), k = ge.dataset.gene, nx = cur.includes(k) ? cur.filter(x => x !== k) : [...cur, k]; const auto = Object.keys(autoGenes(d)).sort().join(); if (!nx.length || nx.slice().sort().join() === auto) delete d.dna; else d.dna = nx; draw(); return; }
      if (t.closest("[data-geneauto]")) { grab(); delete d.dna; draw(); return; }
      const wo = t.closest("[data-world]"); if (wo) { grab(); const cur = worldsOf(d), k = wo.dataset.world; d.worldsSet = true; d.worlds = cur.includes(k) ? cur.filter(x => x !== k) : [...cur, k]; draw(); return; }
      const sr = t.closest("[data-star]"); if (sr) { grab(); const n = +sr.dataset.v; d.rating = d.rating === n ? 0 : n; draw(); return; }
      if (t.id === "m-del") { $("#confirm-slot").innerHTML = `<div class="confirm"><span>Remove “${esc(d.title)}” from your library?</span><button class="btn danger small" type="button" id="m-del-yes">Remove</button><button class="btn small" type="button" id="m-del-no">Keep</button></div>`; return; }
      if (t.id === "m-rec") { recommendGame(games.find(x => x.id === d.id) || d); return; }
      if (t.id === "m-del-no") { $("#confirm-slot").innerHTML = ""; return; }
      if (t.id === "m-del-yes") { removeGame(d.id, "Removed"); closeModal(); return; }
      if (t.id === "m-save") {
        grab(); if (!d.title) { $("#f-title").focus(); toast("Give the game a title."); return; }
        const out = { ...d, hours: d.hours === "" ? "" : Math.max(0, Number(d.hours) || 0), id: d.id || newId(), added: d.added || new Date().toISOString() };
        { const cur = games.find(x => x.id === out.id); if (cur?.launch?.name && out.launch?.kind === "exe" && !out.launch.name) out.launch = cur.launch; } // the launcher may have connected the .exe in another tab
        if (UNPLAYED.has(out.status)) out.rating = 0;
        if (out.status !== "finished") out.finished = "";
        if (out.status === "finished" || out.status === "dropped") out.replaying = false;
        saveGame(out, isNew ? `Added to ${STATUS[out.status]}` : "Saved");
        closeModal(); if (isNew && lastResults.length) renderResults("list");
      }
    }, e => {
      const k = e.target.dataset?.prec; if (!k) return;
      grab(); const cur = d[k] || "", t = todayISO();
      d[k] = { day: cur.length === 10 ? cur : cur.length === 7 ? cur + "-01" : cur.length === 4 ? cur + t.slice(4) : t, month: (cur || t).slice(0, 7), year: (cur || t).slice(0, 4), none: "" }[e.target.value];
      draw(); $("#p-" + k)?.focus();
    });
    wire(); if (isNew) $("#f-title")?.focus();
  }

