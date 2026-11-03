  // ================= wiring =================
  function render(){
    renderPlayer(); renderDeck(); renderRack(); renderLibrary();
    if (tab === "stats") renderStats();
    if (tab === "discover") { renderNext(); renderDiscover(!discQuiet); discQuiet = false; } // a new game changes the seeds, so recommendations refresh
    if (tab === "wishlist") renderWishlist();
    if (tab === "trophies") renderTrophies();
    checkTrophies(false);
    buddy.render();
    if (lastResults.length && $("#results-wrap .results")) renderResults("list");
  }
  function showTab(t){
    tab = t;
    for (const k of TABS) { $("#tab-" + k).setAttribute("aria-selected", k === t); $("#view-" + k).hidden = k !== t; }
    document.body.dataset.tab = t;
    $("#bubble").hidden = true;
    document.querySelectorAll(".bnav [data-nav]").forEach(b => { b.classList.toggle("on", b.dataset.nav === t); if (b.dataset.nav === t) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    if (t === "stats") renderStats();
    if (t === "friends") renderFriends();
    if (t === "discover") { renderNext(); renderDiscover(true); }
    if (t === "wishlist") renderWishlist();
    if (t === "trophies") renderTrophies();
    try { history.replaceState(null, "", t === "library" ? location.pathname : "#" + t); } catch {}
  }
  const openById = id => { const g = games.find(x => x.id === id); if (g) openEditor(g, false); };
  document.addEventListener("keydown", e => { if (e.key !== "Escape") return; const art = document.querySelector(".art-scrim"); if (art) { art.remove(); return; } if (root.innerHTML) closeModal(); });
  $("#search-form").addEventListener("submit", e => { e.preventDefault(); clearTimeout(liveT); runSearch($("#q").value); });
  // results appear as you type, after a short pause
  let liveT = null;
  $("#q").addEventListener("input", e => { clearTimeout(liveT); const v = e.target.value.trim(); if (v.length < 3) { if (!v) { searchCtl?.abort(); renderResults("idle"); } return; } liveT = setTimeout(() => { if (v !== lastQuery) runSearch(v); }, 450); });
  $("#manual-btn").addEventListener("click", () => openEditor({ title: $("#q").value.trim() }, true));
  $("#steam-btn").addEventListener("click", openImport);
  $("#settings-btn").addEventListener("click", () => openSettings());
  $("#sync-btn").addEventListener("click", () => sync.open());
  $("#backup-btn").addEventListener("click", backup);
  $("#restore-btn").addEventListener("click", () => $("#restore-file").click());
  $("#restore-file").addEventListener("change", e => { const f = e.target.files?.[0]; if (f) restore(f); e.target.value = ""; });
  $("#pcard").addEventListener("click", e => { if (e.target.closest("#goal-btn")) openSettings(true); });
  $("#results-wrap").addEventListener("click", e => {
    const chip = e.target.closest("[data-q]"); if (chip) { $("#q").value = chip.dataset.q; return runSearch(chip.dataset.q); }
    if (e.target.closest("[data-close]")) return closeResults();
    if (e.target.closest("[data-manual]")) return openEditor({ title: lastQuery }, true);
    const qa = e.target.closest("[data-qadd]");
    if (qa) {
      const r = lastResults[+qa.dataset.qadd], st = qa.dataset.qs;
      saveGame({ ...r, id: newId(), status: st, rating: 0, hours: "", progress: st === "finished" ? 100 : 0, started: st === "playing" ? todayISO() : "", finished: "", notes: "", sessions: [], cover: "", platform: (r.platforms || []).length === 1 ? r.platforms[0] : "", added: new Date().toISOString(), lookedUp: true, artChecked: true },
        st === "finished" ? `Added ${r.title} as played. Tap the stars to rate it.` : `Added ${r.title} to ${STATUS[st]}`);
      return;
    }
    const qr = e.target.closest("[data-qrate]");
    if (qr) { const g = games.find(x => x.id === qr.dataset.qrate); if (g) { const v = +qr.dataset.v; saveGame({ ...g, rating: g.rating === v ? 0 : v }); } return; }
    const add = e.target.closest("[data-add]"); if (add) return openEditor({ ...lastResults[+add.dataset.add], lookedUp: true, artChecked: true }, true);
    const op = e.target.closest("[data-open]"); if (op) openById(op.dataset.open);
  });
  for (const sel of ["#deck", "#bdock", ".rack", "#list", "#view-stats", "#view-next", "#view-wishlist", "#view-trophies"]) $(sel).addEventListener("click", e => {
    if (e.target.closest("[data-mypc]")) return openMyPC();
    const ra = e.target.closest("[data-runall]"); if (ra) { ra.disabled = true; checkMany(games.filter(g => g.status === "wishlist" && !g.reqs), ra); return; }
    if (e.target.closest("[data-buddypick]")) return buddy.openPicker();
    if (e.target.closest("[data-buddytalk]")) return buddy.talk();
    if (e.target.closest("[data-buddyprofile]")) return buddy.profile();
    if (e.target.closest("[data-buddyhide]")) { settings.buddyHidden = !settings.buddyHidden; applySettings(); buddy.render(); renderTrophies(); return; }
    if (e.target.closest("[data-review]")) return openReview(+e.target.closest("[data-review]").dataset.review);
    if (e.target.closest("[data-goto]")) return showTab(e.target.closest("[data-goto]").dataset.goto);
    const pl = e.target.closest("[data-play]"); if (pl) { playGame(pl.dataset.play); return; }
    const qq = e.target.closest("[data-quests]"); if (qq) { openQuests(qq.dataset.quests); return; }
    const sh = e.target.closest("[data-sethours]"); if (sh) { setHours(sh.dataset.sethours); return; }
    if (e.target.closest("[data-launchclear]")) { settings.launched = null; applySettings(); renderDeck(); return; }
    const lm = e.target.closest("[data-launchmanual]"); if (lm) { const L = settings.launched; settings.launched = null; applySettings(); renderDeck(); if (L) { const h = Math.max(1 / 60, (Date.now() - L.at) / 36e5); logSession(lm.dataset.launchmanual, h, null, L.at); } return; }
    if (e.target.closest("[data-launchsetup]")) { const g = games.find(x => x.id === e.target.closest("[data-launchsetup]").dataset.launchsetup); if (g) openEditor(g, false, "Choose how to launch it under “How to launch”."); return; }
    const tb = e.target.closest("[data-tstart]"); if (tb) { startTimer(tb.dataset.tstart); return; }
    const ts = e.target.closest("[data-tstop]"); if (ts) { stopTimer(ts); return; }
    const mv = e.target.closest("[data-move]"); if (mv) { const g = games.find(x => x.id === mv.dataset.id); if (g) saveGame({ ...g, status: mv.dataset.move, started: mv.dataset.move === "playing" ? (g.started || todayISO()) : g.started }, `${g.title} moved to ${STATUS[mv.dataset.move]}`); return; }
    const y = e.target.closest("[data-year]"); if (y) { statYear = +y.dataset.year; renderStats(); return; }
    const yr = e.target.closest("[data-yr]"); if (yr) { yrSel = +yr.dataset.yr; const z = $("#y-year"), t = document.createElement("div"); t.innerHTML = yearZone(); z.replaceWith(t.firstElementChild); return; }
    const m = e.target.closest("[data-mode]"); if (m) { nextMode = m.dataset.mode; renderNext(); return; }
    const l = e.target.closest("[data-log]"); if (l) { logSession(l.dataset.log, +l.dataset.h, l); return; }
    const b = e.target.closest("[data-beat]"); if (b) { markBeaten(b.dataset.beat); return; }
    const st = e.target.closest("[data-start]"); if (st) { startPlaying(st.dataset.start); return; }
    if (e.target.closest("[data-steam]")) return openImport();
    if (e.target.closest("[data-restore]")) return $("#restore-file").click();
    if (e.target.closest("[data-focus-search]")) { $("#q").focus(); $("#q").scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" }); return; }
    const s = e.target.closest("[data-open]"); if (s) openById(s.dataset.open);
  });
  for (const sel of ["#view-stats"]) {
    $(sel).addEventListener("mousemove", e => { const t = e.target.closest("[data-tip]"); if (t) showTip(e, t.dataset.tip); else if (tipEl) tipEl.hidden = true; });
    $(sel).addEventListener("mouseleave", () => { if (tipEl) tipEl.hidden = true; });
  }
  $("#tools").addEventListener("click", e => { if (e.target.id === "fill-btn") fillDetails(e.target); });
  $("#tools").addEventListener("input", e => { if (e.target.id === "libq") { libQ = e.target.value; renderLibrary(); } });
  $("#filter").addEventListener("click", e => { const f = e.target.closest("[data-filter]"); if (f) { filter = f.dataset.filter; renderLibrary(); } });
  $("#sort").addEventListener("change", e => { sortBy = e.target.value; renderLibrary(); });
  for (const k of TABS) $("#tab-" + k).addEventListener("click", () => showTab(k));
  const phone = () => matchMedia("(max-width:700px)").matches;
  $(".bnav").addEventListener("click", e => {
    const b = e.target.closest("[data-nav]"); if (!b) return;
    if (b.dataset.nav === "add") { showTab("library"); requestAnimationFrame(() => { $(".console").scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" }); setTimeout(() => $("#q").focus({ preventScroll: true }), reduceMotion ? 0 : 350); }); return; }
    showTab(b.dataset.nav); if (phone()) window.scrollTo({ top: 0, behavior: "auto" });
  });
  document.body.dataset.tab = tab;
  // another tab of this app changed the library
  addEventListener("storage", e => { if (e.key === LS) { games = lsGet(LS, []); deleted = lsGet(LS_DEL, {}); render(); } });

  // a mouse wheel over a sideways list (Discover rows, shelves, tabs, chips) scrolls it left and right;
  // at either end, the page scrolls as usual. Trackpads that already scroll sideways are left alone.
  addEventListener("wheel", e => {
    if (e.ctrlKey || e.shiftKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY) || !e.deltaY) return;
    let el = e.target instanceof Element ? e.target : null;
    for (let i = 0; el && el !== document.body && i < 10; i++, el = el.parentElement) {
      if (el.scrollWidth <= el.clientWidth + 2) continue;
      const cs = getComputedStyle(el); if (!/(auto|scroll)/.test(cs.overflowX)) continue;
      if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2) return; // it scrolls up and down too: leave it
      const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaMode === 2 ? e.deltaY * el.clientWidth : e.deltaY;
      const max = el.scrollWidth - el.clientWidth;
      if ((dy < 0 && el.scrollLeft <= 0) || (dy > 0 && el.scrollLeft >= max - 1)) return;
      e.preventDefault();
      // snapping would pull small wheel steps back to the same card, so it pauses while you scroll
      if (!el._wsnap) { el._wsnap = el.style.scrollSnapType || "-"; el.style.scrollSnapType = "none"; }
      clearTimeout(el._wsnapT); el._wsnapT = setTimeout(() => { el.style.scrollSnapType = el._wsnap === "-" ? "" : el._wsnap; el._wsnap = null; }, 350);
      el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft + dy));
      return;
    }
  }, { passive: false });
