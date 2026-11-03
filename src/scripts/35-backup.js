  // ================= backup =================
  // One file with everything this device keeps: games, shelves and room, settings, trophies, your soul and play log.
  // Loading it can either add the games you're missing, or put this device back exactly as the backup was.
  const BK_SKIP = new Set(["save-point-discover-v1"]); // caches that refill themselves
  const bkKeys = () => { const k = []; try { for (let i = 0; i < localStorage.length; i++) { const n = localStorage.key(i); if (n && n.startsWith("save-point-") && !BK_SKIP.has(n)) k.push(n); } } catch {} return k.sort(); };
  function backup(){
    const data = {}; bkKeys().forEach(k => { try { data[k] = JSON.parse(localStorage.getItem(k)); } catch {} });
    data[LS] = games; data[LS_NOOK] = nook; // the live copies, in case anything is waiting to be saved
    const json = JSON.stringify({ app: "save-point", version: 3, appVersion: document.documentElement.dataset.ver, exported: new Date().toISOString(), games, nook, data }, null, 1);
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([json], { type: "application/json" })); a.download = `save-point-backup-${todayISO()}.json`;
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    settings.lastBackup = todayISO(); applySettings(); toast(`Backup saved: ${games.length} game${games.length === 1 ? "" : "s"}, shelves, room and settings`);
  }
  async function restore(file){
    let j; try { j = JSON.parse(await file.text()); } catch { toast("That file isn't a Save Point backup."); return; }
    const list = Array.isArray(j) ? j : j && j.games;
    if (!Array.isArray(list)) { toast("That file isn't a Save Point backup."); return; }
    const full = j && j.version >= 3 && j.data && typeof j.data === "object";
    const add = list.filter(g => g && g.title && !games.some(x => x.id === g.id || norm(x.title) === norm(g.title)));
    const when = j.exported ? fmtDate(String(j.exported).slice(0, 10)) : "";
    const extra = full ? [j.nook?.shelves?.length && "shelves and room", j.data[LS_SET] && "settings", j.data[LS_TRO] && "trophies", j.data[LS_SOUL] && "your soul"].filter(Boolean) : j.nook ? ["shelves and room"] : [];
    openModal(`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="bk-t"><div class="reshead"><div><span class="px">Load a backup</span><h2 id="bk-t">${list.length} game${list.length === 1 ? "" : "s"}${when ? ` from ${esc(when)}` : ""}</h2></div><button class="btn small" type="button" data-mclose>Close</button></div>
      <p>${extra.length ? `Also inside: ${esc(extra.join(", "))}.` : "Only games are inside this file."} You have ${games.length} game${games.length === 1 ? "" : "s"} here now.</p>
      <div class="bkopts"><button class="bkopt" type="button" data-bkadd ${add.length ? "" : "disabled"}><b>Add what's missing</b><span>${add.length ? `Adds ${add.length} game${add.length === 1 ? "" : "s"} you don't have. Nothing here changes.` : "Every game in it is already here."}</span></button>
      <button class="bkopt warn" type="button" data-bkall><b>Restore everything</b><span>This device goes back to exactly how the backup was${extra.length ? `: games, ${esc(extra.join(", "))}` : ""}. Games added since then are removed${sync.user ? ", and with Sync on this becomes the version on your other devices too" : ""}.</span></button></div>
      <p class="note">Tip: save a fresh backup first if you might want today's version back.</p></div>`, e => {
      if (e.target.closest("[data-bkadd]")) { const now = Date.now(); add.forEach(g => { games.push({ ...g, id: g.id || newId(), updatedAt: now }); delete deleted[g.id]; }); closeModal(); commit(`Loaded ${add.length} game${add.length === 1 ? "" : "s"} from the backup`); return; }
      const b = e.target.closest("[data-bkall]"); if (!b) return;
      if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.querySelector("b").textContent = "Tap again to restore everything"; return; }
      const now = Date.now(), keep = new Set(list.map(g => g.id));
      games.forEach(g => { if (!keep.has(g.id)) deleted[g.id] = now; });
      const restored = list.filter(g => g && g.title).map(g => ({ ...g, id: g.id || newId(), updatedAt: now }));
      restored.forEach(g => delete deleted[g.id]);
      try {
        if (full) Object.entries(j.data).forEach(([k, v]) => { if (k.startsWith("save-point-") && !BK_SKIP.has(k) && k !== LS && k !== LS_DEL) localStorage.setItem(k, JSON.stringify(v)); });
        if (j.nook) localStorage.setItem(LS_NOOK, JSON.stringify({ ...j.nook, updatedAt: now }));
        localStorage.setItem(LS, JSON.stringify(restored)); localStorage.setItem(LS_DEL, JSON.stringify(deleted));
      } catch { toast("This browser's storage is full, so the backup couldn't be restored."); return; }
      // keep the copies in memory in step, so nothing saves today's version back over the restored one before the reload
      if (full && j.data[LS_SET] && typeof j.data[LS_SET] === "object") { Object.keys(settings).forEach(k => delete settings[k]); Object.assign(settings, j.data[LS_SET]); }
      if (j.nook) { nook = loadNook(); }
      games = restored; closeModal(); toast("Backup restored. Reloading…");
      try { sync.schedule(); } catch {}
      setTimeout(() => location.reload(), sync.user ? 2500 : 600);
    });
  }
