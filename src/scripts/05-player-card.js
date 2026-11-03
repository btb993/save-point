  // ================= player card =================
  let shownLevel = 0, lastLocalChange = 0;
  function renderPlayer(){
    const hours = games.reduce((s, g) => s + (Number(g.hours) || 0), 0);
    const fin = games.filter(g => g.status === "finished");
    const xp = Math.round(hours * 10 + fin.length * 300);
    let L = 1; while (125 * L * (L + 1) <= xp) L++;
    if (shownLevel && L > shownLevel && Date.now() - lastLocalChange < 4000) levelUp(L);
    shownLevel = L;
    const lo = 125 * L * (L - 1), hi = 125 * L * (L + 1);
    const pct = Math.max(0, Math.min(100, (xp - lo) / (hi - lo) * 100));
    document.documentElement.style.setProperty("--xp", Math.max(6, Math.round(pct)));
    const y = new Date().getFullYear(), done = fin.filter(g => (g.finished || "").startsWith(String(y))).length, goal = Math.max(1, +settings.goal || 12);
    const C = 2 * Math.PI * 25, st = streak();
    $("#pcard").innerHTML = `<div class="lvl"><div><small>LV</small><b>${L}</b></div></div>
      <div class="xp"><div class="reshead"><span class="px">Experience</span><span class="px">${(xp - lo).toLocaleString()} / ${(hi - lo).toLocaleString()} XP</span></div><div class="xpbar"><span style="width:${pct.toFixed(1)}%"></span></div></div>
      <button class="goal" type="button" id="goal-btn" title="${y} goal: finish ${goal} games. Click to change." aria-label="${y} goal: ${done} of ${goal} games finished"><svg viewBox="0 0 58 58" aria-hidden="true"><circle class="tr" cx="29" cy="29" r="25"/><circle class="fg" cx="29" cy="29" r="25" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - Math.min(1, done / goal))).toFixed(1)}"/></svg><span class="gv"><span>${done}/${goal}<small>${y} GOAL</small></span></span></button>
      <div class="pstats">${st ? `<span class="fire">${st} day streak</span>` : ""}<span>${fmtH(hours)} played</span><span>${fin.length} cleared</span></div>`;
  }


