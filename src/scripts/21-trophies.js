  // ================= trophies =================
  const LS_TRO = "save-point-trophies";
  const TIER = { bronze: "Bronze", silver: "Silver", gold: "Gold", platinum: "Platinum" };
  const ICON = {
    star: `<path d="M24 9l4.6 9.3 10.3 1.5-7.4 7.3 1.7 10.2L24 32.5l-9.2 4.8 1.7-10.2-7.4-7.3 10.3-1.5z"/>`,
    crown: `<path d="M10 33h28l2-17-8 7-8-11-8 11-8-7z M10 36h28v4H10z"/>`,
    clock: `<path d="M24 9a15 15 0 1 0 0 30 15 15 0 0 0 0-30zm0 4a11 11 0 1 1 0 22 11 11 0 0 1 0-22zm-2 4v9l7 4 2-3-5-3v-7z"/>`,
    flame: `<path d="M24 7c2 7 10 10 10 20a10 10 0 0 1-20 0c0-5 3-8 5-10 0 4 2 6 4 7-1-6 1-11 1-17z"/>`,
    gem: `<path d="M15 12h18l7 9-16 18L8 21z M15 12l9 27 9-27 M8 21h32" fill-rule="evenodd"/>`,
    heart: `<path d="M24 39S9 30 9 19a8 8 0 0 1 15-4 8 8 0 0 1 15 4c0 11-15 20-15 20z"/>`,
    sword: `<path d="M34 8h6v6L22 32l3 3-3 3-3-3-5 5-3-3 5-5-3-3 3-3 3 3z"/>`
  };
  function maxStreak(){ const ds = [...playDays().keys()].sort(); let best = 0, cur = 0, prev = null; for (const d of ds) { cur = prev && (new Date(d) - new Date(prev)) / 864e5 === 1 ? cur + 1 : 1; best = Math.max(best, cur); prev = d; } return best; }
  function trophyList(){
    const fin = games.filter(g => g.status === "finished"), played = games.filter(g => !UNPLAYED.has(g.status)), rated = games.filter(g => g.rating);
    const hours = games.reduce((s, g) => s + (Number(g.hours) || 0), 0), maxH = Math.max(0, ...games.map(g => Number(g.hours) || 0));
    const fams = new Set(played.map(g => mainPlat(g)).filter(Boolean).map(platFamily)).size;
    const genres = new Set(played.flatMap(g => g.genres || [])).size;
    const most = (key) => { const m = new Map(); fin.forEach(g => String(g[key] || "").split(", ").filter(Boolean).forEach(x => m.set(x, (m.get(x) || 0) + 1))); return Math.max(0, ...m.values()); };
    const y = String(new Date().getFullYear()), goal = Math.max(1, +settings.goal || 12), finY = fin.filter(g => (g.finished || "").startsWith(y)).length;
    const exact = s => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
    const T = (id, name, desc, tier, icon, have, need) => ({ id, name, desc, tier, icon, have: Math.min(have, need), need, done: have >= need });
    return [
      T("start", "Press Start", "Add your first game", "bronze", "star", games.length, 1),
      T("clear1", "First Clear", "Finish a game", "bronze", "crown", fin.length, 1),
      T("clear10", "Finisher", "Finish 10 games", "silver", "crown", fin.length, 10),
      T("clear25", "Completionist", "Finish 25 games", "gold", "crown", fin.length, 25),
      T("clear50", "Hall of Fame", "Finish 50 games", "platinum", "crown", fin.length, 50),
      T("goal", "Goal Getter", `Reach your ${y} goal of ${goal} games`, "gold", "star", finY, goal),
      T("critic", "Critic", "Rate 10 games", "bronze", "star", rated.length, 10),
      T("perfect", "Perfect Score", "Give a game 5 stars", "bronze", "heart", rated.filter(g => g.rating === 5).length, 1),
      T("contra", "Contrarian", "Disagree with the critics by 30 points", "silver", "sword", rated.filter(g => mcNum(g) && Math.abs(g.rating * 20 - mcNum(g)) >= 30).length, 1),
      T("h100", "Marathon", "Play 100 hours in total", "silver", "clock", Math.round(hours), 100),
      T("h500", "Devoted", "Play 500 hours in total", "gold", "clock", Math.round(hours), 500),
      T("h1000", "Legend", "Play 1,000 hours in total", "platinum", "clock", Math.round(hours), 1000),
      T("deep", "Deep Dive", "Spend 100 hours in one game", "silver", "clock", Math.round(maxH), 100),
      T("streak3", "On a Roll", "Log play 3 days in a row", "bronze", "flame", maxStreak(), 3),
      T("streak7", "Week Warrior", "Log play 7 days in a row", "gold", "flame", maxStreak(), 7),
      T("speed", "Speedrunner", "Finish a game within 7 days of starting it", "silver", "flame", fin.filter(g => exact(g.started) && exact(g.finished) && (new Date(g.finished) - new Date(g.started)) / 864e5 <= 7).length, 1),
      T("hopper", "Platform Hopper", "Play on 3 kinds of platform", "silver", "gem", fams, 3),
      T("explorer", "Genre Explorer", "Play 8 different genres", "silver", "gem", genres, 8),
      T("retro", "Old School", "Finish a game released before 2000", "silver", "sword", fin.filter(g => g.year && g.year < 2000).length, 1),
      T("dayone", "Day One", "Finish a game in the year it came out", "silver", "star", fin.filter(g => g.year && String(g.finished || "").startsWith(String(g.year))).length, 1),
      T("slayer", "Backlog Slayer", "Finish a game that waited a year in your library", "gold", "sword", fin.filter(g => exact(g.finished) && g.added && (new Date(g.finished) - new Date(g.added)) / 864e5 >= 365).length, 1),
      T("series", "Series Devotee", "Finish 3 games from one series", "gold", "crown", most("series"), 3),
      T("studio", "Studio Loyalist", "Finish 3 games from one studio", "silver", "heart", most("developer"), 3),
      T("lib50", "Collector", "Have 50 games in your library", "silver", "gem", games.length, 50),
      T("lib200", "Archivist", "Have 200 games in your library", "gold", "gem", games.length, 200),
      T("wish", "Window Shopper", "Wishlist 10 games", "bronze", "heart", games.filter(g => g.status === "wishlist").length, 10),
      T("review", "Look Back", "Open your year in review", "bronze", "star", settings.reviewed ? 1 : 0, 1)
    ];
  }
  function medal(t, size = 56){
    return `<svg class="medal ${t.tier}${t.done ? "" : " locked"}" width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" class="mr"/><circle cx="24" cy="24" r="18" class="mi"/><g class="mg">${ICON[t.icon] || ICON.star}</g></svg>`;
  }
  function checkTrophies(announce){
    let got = lsGet(LS_TRO, null); const first = !got; got = got || {};
    const fresh = trophyList().filter(t => t.done && !got[t.id]);
    if (!fresh.length) { if (first) lsSet(LS_TRO, got); return; }
    fresh.forEach(t => got[t.id] = todayISO()); lsSet(LS_TRO, got);
    if (announce && !first) { const t = fresh[0]; setTimeout(() => buddy.react("gotTrophy", { t: t.name }), 4200); setTimeout(() => achieve(`Trophy: ${t.name}`, `${TIER[t.tier]} · ${t.desc}${fresh.length > 1 ? ` (+${fresh.length - 1} more)` : ""}`), 900); }
  }
  function renderTrophies(){
    const list = trophyList(), got = lsGet(LS_TRO, {}), done = list.filter(t => t.done).length;
    const order = ["platinum", "gold", "silver", "bronze"];
    const byTier = order.map(k => [k, list.filter(t => t.tier === k)]);
    $("#view-trophies").innerHTML = buddy.card() + `<div class="trohead"><div>${medal({ tier: "gold", icon: "crown", done: true }, 64)}</div><div><h2>Trophy cabinet</h2><div class="note">${done} of ${list.length} unlocked</div><div class="xpbar" style="margin-top:6px;max-width:320px"><span style="width:${(done / list.length * 100).toFixed(1)}%"></span></div></div></div>
      ${byTier.map(([k, ts]) => `<section class="dsec"><h3 class="tiertitle ${k}">${TIER[k]}</h3><div class="trogrid">${ts.sort((a, b) => b.done - a.done).map(t => `<div class="trophy${t.done ? " got" : ""}">${medal(t)}<div class="tm"><b>${esc(t.name)}</b><span>${esc(t.desc)}</span>${t.done ? `<em>${got[t.id] ? `Unlocked ${esc(fmtDate(got[t.id]))}` : "Unlocked"}</em>` : `<div class="tp"><i style="width:${(t.have / t.need * 100).toFixed(1)}%"></i></div><em>${t.have.toLocaleString()} / ${t.need.toLocaleString()}</em>`}</div></div>`).join("")}</div></section>`).join("")}`;
  }

