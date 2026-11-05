  // ================= stats =================
  let tipEl = null;
  function showTip(e, text){ if (!tipEl) { tipEl = document.createElement("div"); tipEl.className = "tip"; document.body.append(tipEl); } tipEl.textContent = text; tipEl.hidden = false; tipEl.style.left = Math.min(innerWidth - 270, e.clientX + 12) + "px"; tipEl.style.top = (e.clientY - 44) + "px"; }
  function hbars(rows, unit){
    const max = Math.max(1, ...rows.map(r => r[1]));
    return `<div class="hbars">${rows.map(([k, v, f]) => `<div class="hb" data-tip="${esc(k)}: ${Math.round(v * 10) / 10}${unit}"><span class="k" title="${esc(k)}">${f ? `<i style="--fill:${f}"></i>` : ""}${esc(k)}</span><span class="t"><span style="width:${(v / max * 100).toFixed(1)}%;--fill:${f || "var(--accent)"}"></span></span><span class="v">${Math.round(v).toLocaleString()}${unit}</span></div>`).join("")}</div>`;
  }
  function niceMax(v){ if (v <= 4) return 4; const p = Math.pow(10, Math.floor(Math.log10(v))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p; return v; }
  // games you touched in a year: finished, started, a logged session or a save-file play day in that year
  // a game counts in a year when you actually played it then: finished it, logged time, saved, or started it and it's
  // still in Playing / Finished / Dropped. Games that went Playing → back to Backlog without any play don't count.
  const playedEver = g => (Number(g.hours) || 0) > 0 || (g.sessions || []).length > 0 || (g.saveDays || []).length > 0 || ["playing", "finished", "dropped"].includes(g.status);
  const inYear = (g, Y) => [(g.finished || ""), ...(g.past || []).map(x => x.f || ""), playedEver(g) ? (g.started || "") : "", ...(g.sessions || []).map(s => s.d), ...(g.saveDays || [])].filter(d => d.startsWith(Y)).sort().pop() || "";
  function yearZone(){
    const yrs = new Set([new Date().getFullYear()]); games.forEach(g => [(g.finished || ""), (g.started || ""), ...(g.sessions || []).map(s => s.d), ...(g.saveDays || [])].forEach(d => { const y = +d.slice(0, 4); if (y > 1970) yrs.add(y); }));
    const Y = String(yrSel), list = games.filter(g => g.status !== "wishlist").map(g => [g, inYear(g, Y)]).filter(([, d]) => d).sort((a, b) => b[1].localeCompare(a[1])).map(([g]) => g);
    const fin = list.filter(g => g.status === "finished" && (g.finished || "").startsWith(Y)), sessH = games.reduce((s, g) => s + (g.sessions || []).filter(x => x.d.startsWith(Y)).reduce((a, x) => a + x.h, 0), 0);
    const days = new Set(games.flatMap(g => [...(g.sessions || []).map(s => s.d), ...(g.saveDays || [])]).filter(d => d.startsWith(Y))).size;
    const added = games.filter(g => (g.added || "").startsWith(Y)).length;
    const badge = g => g.status === "finished" && (g.finished || "").startsWith(Y) ? `<span class="yb yb-fin">Finished${g.finished.length >= 7 ? " " + MONTHS[+g.finished.slice(5, 7) - 1] : ""}</span>` : g.status === "playing" ? `<span class="yb yb-play">Playing now</span>` : g.status === "dropped" ? `<span class="yb yb-drop">Set aside</span>` : `<span class="yb">Played</span>`;
    return `<section class="yzone z-year" id="y-year" aria-labelledby="yh-year"><div class="yzh"><i aria-hidden="true">✦</i><div><h2 id="yh-year">Your ${Y}</h2><p>Every game you played this year, and your wrap-up.</p></div></div>
      <div class="yyears" role="group" aria-label="Year">${[...yrs].sort((a, b) => b - a).map(y => `<button type="button" class="chip" data-yr="${y}" aria-pressed="${y === yrSel}">${y}</button>`).join("")}</div>
      <button class="reviewcta" type="button" data-review="${Y}"><span class="px">Wrap-up</span><b>Your ${Y} in games</b><span>Your year in review, story by story</span><i>▶</i></button>
      <div class="ystats"><div><b>${list.length}</b><span>games played</span></div><div><b>${fin.length}</b><span>finished</span></div><div><b>${sessH ? Math.round(sessH).toLocaleString() + " h" : "–"}</b><span>${sessH ? "logged in sessions" : "no sessions logged"}</span></div><div><b>${days || "–"}</b><span>days you played</span></div><div><b>${added}</b><span>added to your library</span></div></div>
      ${list.length ? `<div class="ygrid">${list.map(g => `<button type="button" class="ygame" data-open="${esc(g.id)}" title="${esc(g.title)}">${boxHTML(g)}<span class="yt">${esc(g.title)}</span>${badge(g)}</button>`).join("")}</div><p class="note">Counts games you finished or started in ${Y}, or logged a session or save-file play day for.</p>`
        : `<p class="note">Nothing logged for ${Y} yet. Finish a game, start one, or log a session and it shows up here.</p>`}</section>`;
  }
  let yrSel = new Date().getFullYear();
  // the You zones show one panel at a time, picked from a row of tabs, instead of a long grid
  const zoneSel = {};
  function tabifyZones(){
    document.querySelectorAll("#view-stats .yzone .panels").forEach(box => {
      const zone = box.closest(".yzone"), panels = [...box.children].filter(p => p.classList.contains("panel")); if (panels.length < 2) return;
      const names = panels.map(p => (p.querySelector("h3")?.textContent || "More").trim());
      let cur = names.indexOf(zoneSel[zone.id]); if (cur < 0) cur = 0;
      const bar = document.createElement("div"); bar.className = "ztabs"; bar.setAttribute("role", "tablist");
      bar.innerHTML = names.map((n, i) => `<button type="button" role="tab" data-ztab="${i}" aria-selected="${i === cur}">${esc(n)}</button>`).join("");
      box.before(bar); box.classList.add("tabbed");
      panels.forEach((p, i) => { p.hidden = i !== cur; p.classList.add("wide"); });
      bar.addEventListener("click", e => { const b = e.target.closest("[data-ztab]"); if (!b) return; const i = +b.dataset.ztab; zoneSel[zone.id] = names[i];
        bar.querySelectorAll("[data-ztab]").forEach(x => x.setAttribute("aria-selected", String(x === b))); panels.forEach((p, k) => p.hidden = k !== i);
        const hm = panels[i].querySelector(".heat"); if (hm) hm.scrollLeft = hm.scrollWidth; });
    });
  }
  function renderStats(){
    const el = $("#view-stats");
    if (!games.length) { el.innerHTML = `<div class="empty"><h3>No stats yet</h3><div>Add a few games with hours and ratings and this screen fills in.</div></div>`; return; }
    const fin = games.filter(g => g.status === "finished"), back = games.filter(g => g.status === "backlog");
    const H = g => Number(g.hours) || 0;
    const hours = games.reduce((s, g) => s + H(g), 0);
    const estG = settings.countEst !== false ? games.filter(g => estH(g)) : [], estHrs = estG.reduce((s, g) => s + estH(g), 0), estN = estG.length;
    const rated = games.filter(g => g.rating);
    const avgR = rated.length ? rated.reduce((s, g) => s + g.rating, 0) / rated.length : 0;
    const finYear = fin.filter(g => (g.finished || "").startsWith(String(statYear)));
    const backHours = back.reduce((s, g) => s + (Number(g.length) || 0), 0), backUnknown = back.filter(g => !Number(g.length)).length;
    const years = [...new Set(fin.filter(g => g.finished).map(g => +g.finished.slice(0, 4)))];
    if (!years.includes(new Date().getFullYear())) years.push(new Date().getFullYear());
    years.sort();
    const started = games.filter(g => !UNPLAYED.has(g.status)).length, clearRate = started ? Math.round(fin.length / started * 100) : 0;

    const now = new Date(), months = [];
    for (let i = 11; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: MONTHS[d.getMonth()], y: d.getFullYear(), h: 0, by: {} }); }
    let anySess = false;
    games.forEach(g => (g.sessions || []).forEach(s => { const m = months.find(x => x.key === s.d.slice(0, 7)); if (m) { anySess = true; m.h += s.h; m.by[g.title] = (m.by[g.title] || 0) + s.h; } }));
    const mmax = niceMax(Math.max(...months.map(m => m.h)));
    const monthChart = anySess ? `<div class="cols" style="--n:12">${[.5, 1].map(f => `<div class="gl" style="bottom:${f * 100}%"><span>${Math.round(mmax * f * 10) / 10} h</span></div>`).join("")}${months.map((m, i) => { const top = Object.entries(m.by).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t, h]) => `${t} ${Math.round(h * 10) / 10} h`).join(", "); return `<div class="col${i === 11 ? " cur" : ""}" data-tip="${esc(m.label)} ${m.y}: ${Math.round(m.h * 10) / 10} h${top ? " · " + esc(top) : ""}"><span style="height:${(m.h / mmax * 100).toFixed(1)}%"></span></div>`; }).join("")}</div><div class="xl" style="--n:12">${months.map(m => `<span>${m.label}</span>`).join("")}</div>`
      : `<div class="note">Log sessions with the +30 min, +1 h and +2 h buttons under Now playing and your play time appears here month by month.</div>`;

    // last 52 weeks of play, one square per day
    const days = playDays(), heat = [], saveDays = new Set(games.flatMap(g => g.saveDays || []));
    const s0 = new Date(); s0.setDate(s0.getDate() - (7 * 51 + ((s0.getDay() + 6) % 7)));
    for (let d = new Date(s0), end = todayISO(); isoOf(d) <= end; d.setDate(d.getDate() + 1)) { const k = isoOf(d), h = days.get(k) || 0; heat.push(`<i class="${h >= 3 ? "l3" : h >= 1.5 ? "l2" : h > 0 ? "l1" : saveDays.has(k) ? "sv" : ""}" data-tip="${fmtDate(k)}: ${h ? fmtH(h) : saveDays.has(k) ? "played (from save files)" : "no play"}"></i>`); }

    const plat = new Map(); games.forEach(g => { if (!mainPlat(g) || !H(g)) return; const f = platFamily(mainPlat(g)); plat.set(f, (plat.get(f) || 0) + H(g)); });
    const platRows = [...plat].sort((a, b) => b[1] - a[1]).map(([f, v]) => [PLAT_NAMES[f], v, `var(--p-${f})`]);
    const gen = new Map(); games.forEach(g => (g.genres || []).slice(0, 2).forEach(x => gen.set(x, (gen.get(x) || 0) + 1)));
    const genRows = [...gen].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8).map(([k, v]) => [k, v, "var(--hot)"]);
    const most = games.filter(H).sort((a, b) => H(b) - H(a)).slice(0, 6).map(g => [g.title, H(g), "var(--accent)"]);
    const curM = new Date().getFullYear() === statYear ? new Date().getMonth() : -1;
    const perM = MONTHS.map((_, i) => finYear.filter(g => +g.finished.slice(5, 7) === i + 1));
    const distRows = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, .5].map(v => [v, rated.filter(g => g.rating === v).length]).filter(([v, n]) => v % 1 === 0 || n), dmax = Math.max(1, ...distRows.map(x => x[1]));
    const vs = rated.filter(mcNum).map(g => ({ g, d: g.rating * 20 - mcNum(g) })).sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).slice(0, 6);

    const D = deepStatsHTML();
    const zone = (id, cls, glyph, title, sub, body) => `<section class="yzone ${cls}" id="y-${id}" aria-labelledby="yh-${id}"><div class="yzh"><i aria-hidden="true">${glyph}</i><div><h2 id="yh-${id}">${title}</h2><p>${sub}</p></div></div>${body}</section>`;
    const ynav = [["over", "Overview"], ["top10", "Top 10"], ["year", "This year"], ["soul", "Gamer's Soul"], ["time", "Play time"], ["lib", "Library"], ["taste", "Taste"]];
    el.innerHTML = `<nav class="ynav" aria-label="Sections of this page">${ynav.map(([k, n]) => `<button type="button" data-ygo="${k}">${n}</button>`).join("")}</nav>
    <section class="yzone z-over" id="y-over" aria-label="Overview"><div class="kpis">
      <div class="kpi" style="--k:#5B8DEF"><i class="ki" aria-hidden="true">◷</i><span class="px">Hours played</span><span class="v">${estHrs ? "~" + Math.round(hours + estHrs).toLocaleString() : Math.round(hours).toLocaleString()}</span><span class="s">${estHrs ? `${Math.round(hours).toLocaleString()} h logged + ~${Math.round(estHrs).toLocaleString()} h typical for ${estN} game${estN === 1 ? "" : "s"} with no hours` : `across ${games.filter(H).length} game${games.filter(H).length === 1 ? "" : "s"}`}</span></div>
      <div class="kpi" style="--k:#5BC08A"><i class="ki" aria-hidden="true">✓</i><span class="px">Finished</span><span class="v">${fin.length}</span><span class="s">${finYear.length} in ${statYear}</span></div>
      <div class="kpi" style="--k:#E8A33D"><i class="ki" aria-hidden="true">◎</i><span class="px">Clear rate</span><span class="v">${started ? clearRate + "%" : "–"}</span><span class="s">of games you started</span></div>
      <div class="kpi" style="--k:#B07CF0"><i class="ki" aria-hidden="true">☰</i><span class="px">Backlog</span><span class="v">${back.length}</span><span class="s">${backHours ? `~${Math.round(backHours).toLocaleString()} h to clear${backUnknown ? `, ${backUnknown} unknown` : ""}` : "add story lengths to estimate"}</span></div>
      <div class="kpi" style="--k:#F2BE45"><i class="ki" aria-hidden="true">★</i><span class="px">Your average</span><span class="v">${avgR ? avgR.toFixed(1) : "–"}</span><span class="s">${avgR ? `<span class="stars">${stars(avgR)}</span> · ${rated.length} rated` : "rate a game to see this"}</span></div>
    </div></section>
    <section class="yzone z-top10" id="y-top10" aria-label="My top 10">${top10HTML()}</section>
    ${yearZone()}
    <div id="y-soul" class="yanchor">${soulHTML()}</div>
    ${zone("time", "z-time", "◷", "Play time", "When and how much you play.", `<div class="panels">
      <div class="panel wide"><div class="reshead"><h3>Hours played per month</h3><span class="px">Last 12 months</span></div>${monthChart}</div>
      <div class="panel wide"><div class="reshead"><h3>Days you played</h3><span class="px">Last 52 weeks</span></div><div class="heat">${heat.join("")}</div><div class="heatkey">Less <i style="background:var(--bg);box-shadow:inset 0 0 0 1px var(--line)"></i><i style="background:color-mix(in srgb,var(--good) 35%,var(--bg))"></i><i style="background:color-mix(in srgb,var(--good) 65%,var(--bg))"></i><i style="background:var(--good)"></i> 3 h+</div></div>
      <div class="panel"><div class="reshead"><h3>Finished per month</h3><div class="yearsel">${years.map(y => `<button class="chip" type="button" data-year="${y}" aria-pressed="${y === statYear}">${y}</button>`).join("")}</div></div>
<div class="months">${perM.map((l, i) => `<div class="mo" data-tip="${MONTHS[i]}: ${esc(l.map(g => g.title).join(", ") || "none")}"><span class="n">${l.length || ""}</span><div class="c">${l.map(() => `<i class="${i === curM ? "now" : ""}"></i>`).join("")}</div><span class="m">${MONTHS[i]}</span></div>`).join("")}</div>
<div class="note">Each block is one game you finished.${finYear.filter(g => g.finished.length < 7).length ? ` Plus ${finYear.filter(g => g.finished.length < 7).length} finished in ${statYear} with no month set.` : ""}</div></div>
      ${D.when || ""}${D.pace || ""}</div>`)}
    ${zone("lib", "z-lib", "▤", "Your library", "Where your time goes and what you collect.", `<div class="panels">
      <div class="panel"><h3>Hours by platform</h3>${platRows.length ? hbars(platRows, " h") : `<div class="note">Log hours on a game to see where your time goes.</div>`}</div>
      <div class="panel"><h3>Most played</h3>${most.length ? hbars(most, " h") : `<div class="note">No hours logged yet.</div>`}</div>
      <div class="panel"><h3>Genres you play</h3>${genRows.length ? hbars(genRows, "") : `<div class="note">Use Fill missing details in the Library to add genres.</div>`}</div>
      ${D.eras || ""}${D.studios || ""}${D.series || ""}</div>`)}
    ${zone("taste", "z-taste", "★", "Your taste", "How you rate games, and where you and the critics disagree.", `<div class="panels">
      <div class="panel"><h3>How you rate</h3>${rated.length ? `<div class="hbars">${distRows.map(([v, n]) => `<div class="hb" data-tip="${String(v).replace(".5", "½")} stars: ${n} game${n === 1 ? "" : "s"}"><span class="k stars">${stars(v)}</span><span class="t"><span style="width:${(n / dmax * 100).toFixed(1)}%;--fill:var(--star)"></span></span><span class="v">${n}</span></div>`).join("")}</div>` : `<div class="note">Rate games you've played to see your spread.</div>`}</div>
      <div class="panel"><h3>You vs the critics</h3>${vs.length ? `<div class="vs">${vs.map(({ g, d }) => `<div class="vsrow"><button class="linkbtn" type="button" data-open="${esc(g.id)}" style="text-align:left;color:var(--ink);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(g.title)}</button><span class="muted num">${g.rating * 20} vs ${mcNum(g)}</span><span class="d ${d > 0 ? "up" : d < 0 ? "down" : ""}">${d > 0 ? "+" : ""}${d}</span></div>`).join("")}</div><div class="note">Your stars × 20 against the Metacritic score. Biggest disagreements first.</div>` : `<div class="note">Rate games that have a Metacritic score to compare.</div>`}</div>
      ${D.gems || ""}${D.takes || ""}</div>`)}`;
    const hm = el.querySelector(".heat"); if (hm) hm.scrollLeft = hm.scrollWidth;
    tabifyZones();
    soulAfterRender();
  }

