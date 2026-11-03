  // ================= local storage =================
  const LS = "save-point-games", LS_DEL = "save-point-deleted", LS_SET = "save-point-settings";
  const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
  let games = lsGet(LS, []), deleted = lsGet(LS_DEL, {});
  let settings = { theme: "auto", lamp: "arcade", goal: 12, motion: "full", skin: "retro", ...lsGet(LS_SET, {}) };
  let filter = "all", sortBy = "added", tab = "library", statYear = new Date().getFullYear(), libQ = "", nextMode = "fit";

  function saveLocal(){ const ok = lsSet(LS, games) && lsSet(LS_DEL, deleted); if (!ok) toast("This browser's storage is full. Remove some cover images, or save a backup."); return ok; }
  function commit(msg){ saveLocal(); render(); sync.schedule(); try { pushShelves(); kickLore(); } catch {} if (msg) toast(msg); checkTrophies(true); }
  const tallies = () => ({ hours: games.reduce((s, x) => s + (Number(x.hours) || 0), 0), owned: games.filter(x => x.status !== "wishlist").length, fin: games.filter(x => x.status === "finished").length });
  function saveGame(g, msg){
    g.updatedAt = lastLocalChange = Date.now(); const i = games.findIndex(x => x.id === g.id), prev = i >= 0 ? games[i] : null, before = tallies();
    if (g.status === "dropped" || prev?.wasDropped) g.wasDropped = true; // lets "A Second Chance" work for future clears
    i >= 0 ? games[i] = g : games.push(g); commit(msg);
    try { buddy.event(prev, g, before, tallies()); } catch (e) { console.warn(e); }
    try { soulPulse(prev, g); } catch (e) { console.warn(e); }
  }
  function removeGame(id, msg){ const gone = games.find(g => g.id === id); if (gone && !UNPLAYED.has(gone.status)) dnaCause = { id: "", title: gone.title, why: "Removed", t: Date.now() }; games = games.filter(g => g.id !== id); deleted[id] = Date.now(); commit(msg); }
  function applySettings(){
    lsSet(LS_SET, settings);
    const r = document.documentElement;
    // set the page attributes only when they change: every change restyles the whole page
    const put = (k, v) => { if (v == null) { if (r.hasAttribute("data-" + k)) r.removeAttribute("data-" + k); } else if (r.dataset[k] !== String(v)) r.dataset[k] = v; };
    put("theme", settings.theme === "auto" ? null : settings.theme);
    put("lamp", settings.lamp); put("gold", settings.goldBands ? "on" : "off");
    put("motion", settings.motion);
    put("skin", settings.skin);
  }
  applySettings();

