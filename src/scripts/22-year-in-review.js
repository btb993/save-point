  // ================= year in review =================
  function openReview(year){
    year = year || new Date().getFullYear(); const y = String(year);
    if (!settings.reviewed) { settings.reviewed = true; applySettings(); checkTrophies(true); }
    const fin = games.filter(g => g.status === "finished" && (g.finished || "").startsWith(y));
    const touched = games.filter(g => g.status !== "wishlist" && inYear(g, y));
    let sessH = 0; const monthH = Array(12).fill(0), monthF = Array(12).fill(0);
    games.forEach(g => (g.sessions || []).forEach(s => { if (s.d.startsWith(y)) { sessH += s.h; monthH[+s.d.slice(5, 7) - 1] += s.h; } }));
    fin.forEach(g => { const m = +String(g.finished).slice(5, 7); if (m) monthF[m - 1]++; });
    const hours = sessH || fin.reduce((s, g) => s + (Number(g.hours) || 0), 0);
    const top = [...touched].filter(g => g.rating).sort((a, b) => b.rating - a.rating || (Number(b.hours) || 0) - (Number(a.hours) || 0))[0] || fin[0];
    const cnt = arr => { const m = new Map(); arr.forEach(x => x && m.set(x, (m.get(x) || 0) + 1)); return [...m].sort((a, b) => b[1] - a[1]); };
    const gen = cnt(touched.flatMap(g => (g.genres || []).slice(0, 2))), plat = cnt(touched.map(g => mainPlat(g) && PLAT_NAMES[platFamily(mainPlat(g))]));
    const best = monthF.some(Boolean) ? monthF.indexOf(Math.max(...monthF)) : monthH.some(Boolean) ? monthH.indexOf(Math.max(...monthH)) : -1;
    const tro = Object.entries(lsGet(LS_TRO, {})).filter(([, d]) => d.startsWith(y)).map(([id]) => trophyList().find(t => t.id === id)).filter(Boolean);
    const covers = (list, n) => `<div class="rcovers">${list.slice(0, n).map((g, i) => `<div style="--i:${i}">${boxHTML(g)}</div>`).join("")}</div>`;
    const slides = touched.length ? [
      `<span class="px">Save Point presents</span><h1 class="rbig">Your ${y}<br>in games</h1><p>Tap to begin</p>`,
      `<span class="px">Games cleared</span><div class="rnum">${fin.length}</div><p>${fin.length ? `game${fin.length === 1 ? "" : "s"} finished this year` : "No finishes logged yet, but you played " + touched.length}</p>${covers(fin.length ? fin : touched, 8)}`,
      `<span class="px">Time played</span><div class="rnum">${Math.round(hours).toLocaleString()}</div><p>hours${sessH ? " logged this year" : " in the games you finished"}${hours >= 2 ? `, about ${Math.round(hours / 2)} movies' worth` : ""}</p>`,
      touched.length > 1 ? `<span class="px">Everything you played</span><div class="rnum">${touched.length}</div><p>game${touched.length === 1 ? "" : "s"} in ${y}</p>${covers([...touched].sort((a, b) => inYear(b, y).localeCompare(inYear(a, y))), 12)}` : "",
      top ? `<span class="px">Game of the year</span><div class="rgoty">${boxHTML(top)}</div><h2>${esc(top.title)}</h2>${top.rating ? `<div class="stars rstars">${stars(top.rating)}</div>` : ""}` : "",
      gen.length || plat.length ? `<span class="px">Your style</span>${gen.length ? `<p>Favourite genre</p><h2 class="rmid">${esc(gen[0][0])}</h2>` : ""}${plat.length ? `<p>Most played on</p><h2 class="rmid">${esc(plat[0][0])}</h2>` : ""}` : "",
      best >= 0 ? `<span class="px">Busiest month</span><h2 class="rmid">${["January","February","March","April","May","June","July","August","September","October","November","December"][best]}</h2><div class="rbars">${monthF.map((v, i) => `<i style="--h:${(Math.max(v, monthH[i] / 10) / Math.max(1, ...monthF, ...monthH.map(h => h / 10)) * 100).toFixed(0)}%" class="${i === best ? "on" : ""}"></i>`).join("")}</div>` : "",
      tro.length ? `<span class="px">Trophies earned</span><div class="rnum">${tro.length}</div><div class="rtro">${tro.slice(0, 8).map(t => medal(t, 52)).join("")}</div>` : "",
      `<span class="px">That's a wrap</span><h2 class="rmid">${y}: ${fin.length} cleared · ${Math.round(hours)} h${top ? ` · ${esc(top.title)}` : ""}</h2><p>See you next year, Player 1.</p><button class="btn primary" type="button" data-rclose>Back to my library</button>`
    ].filter(Boolean) : [`<span class="px">Year in review</span><h1 class="rbig">${y}</h1><p>Nothing logged for ${y} yet. Finish or play a few games and come back.</p><button class="btn primary" type="button" data-rclose>Close</button>`];
    let i = 0;
    const el = document.createElement("div"); el.className = "story"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", `Your ${y} in games`);
    const draw = () => { el.innerHTML = `<div class="sbar">${slides.map((_, k) => `<i class="${k < i ? "done" : k === i ? "on" : ""}"></i>`).join("")}</div><button class="mx" type="button" data-rclose aria-label="Close">✕</button><div class="slide" data-k="${i}">${slides[i]}</div><button class="snav prev" type="button" aria-label="Previous"></button><button class="snav next" type="button" aria-label="Next"></button>`; };
    const go = d => { i = Math.max(0, Math.min(slides.length - 1, i + d)); draw(); };
    const key = e => { if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(1); } if (e.key === "ArrowLeft") go(-1); if (e.key === "Escape") close(); };
    const close = () => { el.remove(); document.removeEventListener("keydown", key, true); };
    el.addEventListener("click", e => { if (e.target.closest("[data-rclose]")) return close(); if (e.target.closest(".prev")) return go(-1); if (e.target.closest(".next")) return go(1); });
    document.addEventListener("keydown", key, true);
    draw(); document.body.append(el);
  }

