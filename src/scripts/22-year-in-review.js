  // ================= year in review =================
  // A story, slide by slide. Hours come from your sessions that year; a game finished that year with no sessions counts
  // its logged hours, and if it has none, its typical playtime (always shown with ~ and called an estimate).
  const RV_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function reviewData(y){
    const fin = games.filter(g => g.status === "finished" && (g.finished || "").startsWith(y));
    const touched = games.filter(g => g.status !== "wishlist" && inYear(g, y));
    const monthH = Array(12).fill(0), monthF = Array(12).fill(0), days = new Set(), per = new Map();
    let logged = 0, est = 0, estN = 0;
    games.forEach(g => (g.sessions || []).forEach(s => { if (s.d && s.d.startsWith(y)) { const h = Number(s.h) || 0; logged += h; monthH[+s.d.slice(5, 7) - 1] += h; days.add(s.d.slice(0, 10)); per.set(g.id, (per.get(g.id) || 0) + h); } }));
    const noHours = [];
    fin.forEach(g => { const m = +String(g.finished).slice(5, 7); if (m) monthF[m - 1]++;
      if (per.get(g.id)) return;
      if (Number(g.hours) > 0) { logged += Number(g.hours); per.set(g.id, Number(g.hours)); return; }
      const e = settings.countEst !== false ? estH(g) : 0;
      if (e) { est += e; estN++; per.set(g.id, e); g.__est = true; } else noHours.push(g);
    });
    // longest run of days in a row with a session
    const sorted = [...days].sort(); let streak = 0, run = 0, prev = null;
    sorted.forEach(d => { const t = Date.parse(d); run = prev !== null && t - prev === 864e5 ? run + 1 : 1; prev = t; streak = Math.max(streak, run); });
    const marathon = [...per].sort((a, b) => b[1] - a[1]).map(([id, h]) => ({ g: games.find(x => x.id === id), h })).find(x => x.g);
    const top = [...touched].filter(g => g.rating).sort((a, b) => b.rating - a.rating || (per.get(b.id) || 0) - (per.get(a.id) || 0))[0] || fin[0];
    const cnt = arr => { const m = new Map(); arr.forEach(x => x && m.set(x, (m.get(x) || 0) + 1)); return [...m].sort((a, b) => b[1] - a[1]); };
    const gen = cnt(touched.flatMap(g => (g.genres || []).slice(0, 2))), plat = cnt(touched.map(g => mainPlat(g) && PLAT_NAMES[platFamily(mainPlat(g))]));
    const feels = cnt(touched.flatMap(g => feelsOf(g))).slice(0, 3).map(([id, n]) => ({ ...FEEL.get(id), times: n }));
    const best = monthF.some(Boolean) ? monthF.indexOf(Math.max(...monthF)) : monthH.some(Boolean) ? monthH.indexOf(Math.max(...monthH)) : -1;
    // the longest-waiting backlog game you finally finished this year
    const waited = fin.filter(g => g.added && g.added < y + "-01-01").sort((a, b) => a.added.localeCompare(b.added))[0];
    const rated = touched.filter(g => g.rating), avg = rated.length ? rated.reduce((s, g) => s + g.rating, 0) / rated.length : 0;
    const tro = Object.entries(lsGet(LS_TRO, {})).filter(([, d]) => d.startsWith(y)).map(([id]) => trophyList().find(t => t.id === id)).filter(Boolean);
    return { y, fin, touched, monthH, monthF, logged, est, estN, noHours, streak, days: days.size, marathon, top, gen, plat, feels, best, waited, avg, rated: rated.length, fives: rated.filter(g => g.rating >= 5).length, tro, total: logged + est };
  }
  function openReview(year){
    year = year || new Date().getFullYear(); const y = String(year);
    if (!settings.reviewed) { settings.reviewed = true; applySettings(); checkTrophies(true); }
    let D = reviewData(y), i = 0, looking = false;
    const covers = (list, n) => `<div class="rcovers">${list.slice(0, n).map((g, k) => `<div style="--i:${k}">${boxHTML(g)}</div>`).join("")}</div>`;
    const H = h => Math.round(h).toLocaleString();
    const slides = () => {
      const d = D, fin = d.fin, touched = d.touched;
      if (!touched.length) return [`<span class="px">Year in review</span><h1 class="rbig">${y}</h1><p>Nothing logged for ${y} yet. Finish or play a few games and come back.</p><button class="btn primary" type="button" data-rclose>Close</button>`];
      const timeNote = [d.logged ? `${H(d.logged)} h logged by you` : "", d.est ? `~${H(d.est)} h typical playtime for ${d.estN} finished game${d.estN === 1 ? "" : "s"} with no hours entered` : ""].filter(Boolean).join(" + ");
      const missing = d.noHours.length ? `<p class="rnote">${d.noHours.length} finished game${d.noHours.length === 1 ? " has" : "s have"} no hours yet${looking ? ". Looking up typical playtimes…" : "."}</p>${looking ? "" : estOn() ? `<button class="btn small" type="button" data-restlook>Look up typical playtimes</button>` : `<button class="btn small" type="button" data-restsetup>Fill them in with typical playtimes</button>`}` : "";
      return [
        `<span class="px">Save Point presents</span><h1 class="rbig">Your ${y}<br>in games</h1><p>Tap to begin</p>`,
        `<span class="px">Games cleared</span><div class="rnum">${fin.length}</div><p>${fin.length ? `game${fin.length === 1 ? "" : "s"} finished this year` : "No finishes logged yet, but you played " + touched.length}</p>${covers(fin.length ? fin : touched, 8)}`,
        `<span class="px">Time played</span><div class="rnum">${d.est ? "~" : ""}${H(d.total)}</div><p>hours in ${y}${d.total >= 2 ? `, about ${H(d.total / 2)} movies' worth` : ""}</p>${timeNote ? `<p class="rnote">${esc(timeNote)}</p>` : ""}${missing}`,
        d.marathon && d.marathon.h >= 1 ? `<span class="px">Your marathon</span><div class="rgoty">${boxHTML(d.marathon.g)}</div><h2>${esc(d.marathon.g.title)}</h2><p>${d.marathon.g.__est ? "~" : ""}${fmtH(d.marathon.h)}${d.marathon.g.__est ? " (typical playtime)" : ""}, more than any other game this year</p>` : "",
        touched.length > 1 ? `<span class="px">Everything you played</span><div class="rnum">${touched.length}</div><p>game${touched.length === 1 ? "" : "s"} in ${y}</p>${covers([...touched].sort((a, b) => inYear(b, y).localeCompare(inYear(a, y))), 12)}` : "",
        d.top ? `<span class="px">Game of the year</span><div class="rgoty">${boxHTML(d.top)}</div><h2>${esc(d.top.title)}</h2>${d.top.rating ? `<div class="stars rstars">${stars(d.top.rating)}</div>` : ""}` : "",
        d.rated >= 3 ? `<span class="px">How you rated</span><div class="rnum">${d.avg.toFixed(1)}</div><p>average stars across ${d.rated} games${d.fives ? `, with ${d.fives} perfect five${d.fives === 1 ? "" : "s"}` : ""}</p>` : "",
        d.feels.length ? `<span class="px">How it felt</span><div class="rfeels">${d.feels.map((f, k) => `<div style="--c:${f.c};--i:${k}"><b>${esc(f.n)}</b><small>${esc(f.gn)} · ${f.times} game${f.times === 1 ? "" : "s"}</small></div>`).join("")}</div>` : "",
        d.gen.length || d.plat.length ? `<span class="px">Your style</span>${d.gen.length ? `<p>Favourite genre</p><h2 class="rmid">${esc(d.gen[0][0])}</h2>` : ""}${d.plat.length ? `<p>Most played on</p><h2 class="rmid">${esc(d.plat[0][0])}</h2>` : ""}` : "",
        d.best >= 0 ? `<span class="px">Busiest month</span><h2 class="rmid">${RV_MONTHS[d.best]}</h2><div class="rbars">${d.monthF.map((v, k) => `<i style="--h:${(Math.max(v, d.monthH[k] / 10) / Math.max(1, ...d.monthF, ...d.monthH.map(h => h / 10)) * 100).toFixed(0)}%" class="${k === d.best ? "on" : ""}"></i>`).join("")}</div>${d.streak >= 2 ? `<p class="rnote">Longest streak: ${d.streak} days in a row · played on ${d.days} days</p>` : ""}` : "",
        d.waited ? `<span class="px">Finally!</span><div class="rgoty">${boxHTML(d.waited)}</div><h2>${esc(d.waited.title)}</h2><p>waited in your library since ${esc(fmtDate(String(d.waited.added).slice(0, 10)))} before you finished it</p>` : "",
        d.tro.length ? `<span class="px">Trophies earned</span><div class="rnum">${d.tro.length}</div><div class="rtro">${d.tro.slice(0, 8).map(t => medal(t, 52)).join("")}</div>` : "",
        `<span class="px">That's a wrap</span><h2 class="rmid">${y}: ${fin.length} cleared · ${d.est ? "~" : ""}${H(d.total)} h${d.top ? ` · ${esc(d.top.title)}` : ""}</h2><p>See you next year, Player 1.</p><div class="chips" style="justify-content:center"><button class="btn primary" type="button" data-rshare>Save as image</button><button class="btn" type="button" data-rclose>Back to my library</button></div>`
      ].filter(Boolean);
    };
    let S = slides();
    const el = document.createElement("div"); el.className = "story"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", `Your ${y} in games`);
    const draw = () => { el.innerHTML = `<div class="sbar">${S.map((_, k) => `<i class="${k < i ? "done" : k === i ? "on" : ""}"></i>`).join("")}</div><button class="mx" type="button" data-rclose aria-label="Close">✕</button><div class="slide" data-k="${i}">${S[i]}</div><button class="snav prev" type="button" aria-label="Previous"></button><button class="snav next" type="button" aria-label="Next"></button>`; };
    const go = k => { i = Math.max(0, Math.min(S.length - 1, i + k)); draw(); };
    const key = e => { if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(1); } if (e.key === "ArrowLeft") go(-1); if (e.key === "Escape") close(); };
    const close = () => { el.remove(); document.removeEventListener("keydown", key, true); games.forEach(g => delete g.__est); };
    // fetch typical playtimes for finished games with no hours, then redraw on the same slide
    const look = async () => { if (looking || !estOn()) return; looking = true; S = slides(); draw(); try { await estHunt(true); } catch {} looking = false; if (!el.isConnected) return; games.forEach(g => delete g.__est); D = reviewData(y); S = slides(); i = Math.min(i, S.length - 1); draw(); };
    el.addEventListener("click", e => {
      if (e.target.closest("[data-rclose]")) return close();
      if (e.target.closest("[data-restlook]")) return look();
      if (e.target.closest("[data-restsetup]")) { close(); openEstSetup(); return; }
      if (e.target.closest("[data-rshare]")) return reviewImage(D);
      if (e.target.closest(".prev")) return go(-1); if (e.target.closest(".next")) return go(1);
    });
    document.addEventListener("keydown", key, true);
    draw(); document.body.append(el);
    if (D.noHours.length && estOn()) look();
  }
  // a shareable card of the year, drawn on a canvas and saved (or shared on phones)
  async function reviewImage(d){
    const W = 1080, Hh = 1350, cv = document.createElement("canvas"); cv.width = W; cv.height = Hh; const x = cv.getContext("2d");
    const cs = getComputedStyle(document.documentElement), lamp = `rgb(${cs.getPropertyValue("--lamp").trim() || "122,150,255"})`, lamp2 = `rgb(${cs.getPropertyValue("--lamp2").trim() || "255,140,90"})`;
    const font = (cs.getPropertyValue("--f-display").trim() || "system-ui").replace(/;$/, "");
    const bg = x.createLinearGradient(0, 0, W, Hh); bg.addColorStop(0, "#0B0D1E"); bg.addColorStop(1, "#1A1033"); x.fillStyle = bg; x.fillRect(0, 0, W, Hh);
    const glow = (cx, cy, r, c) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, c); g.addColorStop(1, "transparent"); x.globalAlpha = .35; x.fillStyle = g; x.fillRect(0, 0, W, Hh); x.globalAlpha = 1; };
    glow(160, 140, 520, lamp); glow(960, 1200, 560, lamp2);
    x.fillStyle = "rgba(255,255,255,.7)"; x.font = `700 34px ${font}`; x.textAlign = "left"; x.fillText("SAVE POINT", 90, 130);
    x.fillStyle = "#fff"; x.font = `800 120px ${font}`; x.fillText(`My ${d.y}`, 86, 270); x.fillText("in games", 86, 390);
    const stat = (n, label, yy) => { x.fillStyle = "#fff"; x.font = `800 150px ${font}`; x.fillText(n, 86, yy); const w = x.measureText(n).width; x.fillStyle = "rgba(255,255,255,.75)"; x.font = `600 40px ${font}`; x.fillText(label, 86 + w + 26, yy - 14); };
    stat(String(d.fin.length), d.fin.length === 1 ? "game cleared" : "games cleared", 600);
    stat((d.est ? "~" : "") + Math.round(d.total).toLocaleString(), "hours played", 790);
    stat(String(d.touched.length), d.touched.length === 1 ? "game played" : "games played", 980);
    if (d.top) { x.fillStyle = lamp2; x.font = `700 34px ${font}`; x.fillText("GAME OF THE YEAR", 90, 1110); x.fillStyle = "#fff"; x.font = `800 60px ${font}`; let t = d.top.title; while (x.measureText(t).width > 900 && t.length > 4) t = t.slice(0, -2); x.fillText(t === d.top.title ? t : t + "…", 86, 1185); }
    if (d.est) { x.fillStyle = "rgba(255,255,255,.5)"; x.font = `500 24px ${font}`; x.fillText("~ includes typical playtimes for finished games with no hours logged", 90, 1280); }
    const blob = await new Promise(r => cv.toBlob(r, "image/png")), name = `save-point-${d.y}.png`;
    try { const f = new File([blob], name, { type: "image/png" }); if (navigator.canShare?.({ files: [f] })) { await navigator.share({ files: [f], title: `My ${d.y} in games` }); return; } } catch (e) { if (e?.name === "AbortError") return; }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); toast("Image saved");
  }
