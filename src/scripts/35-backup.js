  // ================= backup =================
  function backup(){
    const data = JSON.stringify({ app: "save-point", version: 2, exported: new Date().toISOString(), games, nook }, null, 1);
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type: "application/json" })); a.download = `save-point-backup-${todayISO()}.json`;
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  async function restore(file){
    try {
      const j = JSON.parse(await file.text()); const list = Array.isArray(j) ? j : j.games;
      if (!Array.isArray(list)) throw 0;
      const now = Date.now();
      const add = list.filter(g => g && g.title && !games.some(x => x.id === g.id || norm(x.title) === norm(g.title)));
      add.forEach(g => { games.push({ ...g, id: g.id || newId(), updatedAt: now }); delete deleted[g.id]; });
      commit(add.length ? `Loaded ${add.length} game${add.length === 1 ? "" : "s"} from the backup` : "Everything in that backup is already here");
    } catch { toast("That file isn't a Save Point backup."); }
  }

