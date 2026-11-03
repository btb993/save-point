  // ================= THE GAMER'S SOUL: screens =================
  const SOUL_TABS = [["dna", "Gamer DNA"], ["play", "Playstyle"], ["align", "Alignment"], ["emo", "Emotions"], ["flags", "Flags"], ["eras", "Eras"], ["pass", "Passport"], ["skills", "Skill tree"], ["ach", "Achievements"], ["habits", "Habits"], ["npc", "Inner NPC"], ["hall", "Hall of Legends"], ["mate", "Soulmate"]];
  const SOUL_NAMES = Object.fromEntries(SOUL_TABS);
  const SOUL_BLURB = { dna: "Sixteen archetypes, recalculated every time you add, finish, rate or retag a played game.", align: "Where you land between co-op and competitive, strategic and instinctive.", play: "Your playstyle spectrums, with the evidence behind each one.", emo: "How your games make you feel, from the feelings you've tagged.", flags: "The funny and the flattering, always with receipts.", habits: "Comfort zone, nemesis, backlog personality and how you play over time.", eras: "The chapters of your gaming life, half a year at a time.", pass: "Every kind of world you've set foot in.", skills: "Seven branches that grow as you clear games.", ach: "Soul achievements, counted from your whole history.", hall: "Your personal museum of the games that mattered.", npc: "If you lived in a game, who would you be?", mate: "Compare souls with a friend using soul codes." };
  // the 13 sections, grouped into 4 chapters: [key, name, glyph, short description, sections]
  const SOUL_CH = [["who", "Who you are", "◆", "Soul, DNA and alignment", ["dna", "align"]], ["how", "How you play", "⚔", "Playstyle, feelings, flags", ["play", "emo", "flags", "habits"]], ["journey", "Your journey", "✦", "Eras, passport, skills", ["eras", "pass", "skills"]], ["trophy", "Trophy room", "♛", "Achievements and legends", ["ach", "hall", "npc", "mate"]]];
  const chapterOf = k => SOUL_CH.find(c => c[0] === k) || SOUL_CH.find(c => c[4].includes(soulStore.tab)) || SOUL_CH[0];
  function chapterTease(V){
    const t = {};
    try { t.who = `${V.dna[0].short} ${V.dna[0].pct}%`; } catch {}
    try { const f = flags(V).filter(x => !soulStore.dismissed.includes(x.id)); t.how = `${f.filter(x => x.kind === "red").length} red · ${f.filter(x => x.kind === "green").length} green flags`; } catch {}
    try { const p = passport(); t.journey = `${p.seen} of 16 worlds`; } catch {}
    try { const a = soulAchievements(false); t.trophy = `${a.filter(x => x.done).length} of ${a.length} achievements`; } catch {}
    return t;
  }
  let soulOpen = { arch: "", stamp: "" };
  const pct2 = (a, b) => b ? Math.round(a / b * 100) : 0;
  const glink = g => `<button class="linkbtn sgl" type="button" data-open="${esc(g.id)}">${esc(g.title)}</button>`;
  const glist = gs => gs.length ? gs.map(glink).reduce((s, x, i, a) => s + (i ? (i === a.length - 1 ? " and " : ", ") : "") + x, "") : "";
  const tierCls = t => ({ common: "t-common", rare: "t-rare", epic: "t-epic", legendary: "t-legend" }[t] || "");
  const fun = `<span class="funtag">Just for fun</span>`;
  function titlesOwned(V){
    const out = [];
    skillTree().forEach(b => b.titles.forEach((t, i) => { if (b.tier > i) out.push(["sk:" + b.k + i, t]); }));
    passport().ms.forEach(([n, , have, need]) => { if (have >= need) out.push(["pp:" + n, n]); });
    soulAchievements(false).filter(a => a.done && (a.tier === "epic" || a.tier === "legendary")).forEach(a => out.push(["ac:" + a.id, a.name]));
    if (V.hyb && V.hyb.named) out.push(["hy:" + V.hyb.key, V.hyb.title.replace(/^The /, "")]);
    return out;
  }
  function soulHTML(){
    const V = soulData();
    if (!V.S) return `<section class="gsoul empty"><div class="gs-glyph">?</div><div><span class="px">The Gamer's Soul</span><h2>Your soul hasn't awakened yet</h2><p class="gs-sub">Mark at least 3 games as played or finished, with ratings and hours if you can, and your Gamer's Soul starts to form.</p><button class="btn primary small" type="button" data-goto="discover">Add games from the Top 100</button></div></section>`;
    const a = V.dna[0], b = V.dna[1], c = V.dna[2], H = V.hyb, S = V.S;
    const ownTitles = titlesOwned(V), eq = ownTitles.find(t => t[0] === soulStore.title);
    const ch = chapterOf(soulStore.ch), tease = chapterTease(V);
    const tabs = SOUL_CH.map(([k, n, gl, d]) => `<button type="button" class="gs-ch${ch[0] === k ? " on" : ""}" data-soulch="${k}" aria-pressed="${ch[0] === k}"><i aria-hidden="true">${gl}</i><span><b>${n}</b><small>${d}</small><em>${esc(tease[k] || "")}</em></span></button>`).join("");
    const st = V.stage, nextAt = st.next ? `${st.next[0] - V.fin.length} more cleared to become ${st.next[1].replace(" Soul", "")}` : "The deepest your soul can go.";
    const lead = H ? H.d : AX[a.k].quote;
    const hybLine = b ? `With the heart of <b style="color:${b.c}">${esc(b.name.replace(/^The /, "").replace(/^/, (m, o, str) => /^[AEIOU]/i.test(str) ? "an " : "a "))}</b>${c ? ` and a dash of <b style="color:${c.c}">${esc(c.short)}</b>` : ""}.` : "";
    return `<section class="gsoul" style="--sc:${a.c};--sc2:${(H?.arch?.[1] || b || a).c}" aria-label="The Gamer's Soul">
      <div class="gs-head">
        <div class="gs-glyph" aria-hidden="true">${H ? `<span style="color:${H.arch[0].c}">${H.arch[0].g}</span><span style="color:${H.arch[1].c}">${H.arch[1].g}</span>${H.triple ? `<span style="color:${H.arch[2].c}">${H.arch[2].g}</span>` : ""}` : a.g}</div>
        <div class="gs-main"><span class="px">The Gamer's Soul${H?.triple ? " · rare triple soul" : H ? " · hybrid soul" : ""}</span>
          <h2>${esc(H ? H.title : a.name)}</h2>
          ${eq ? `<span class="gs-title">“${esc(eq[1])}”</span>` : ""}
          <p class="gs-dom">Dominant: <b style="color:${a.c}">${esc(a.short)}</b> ${a.pct}%, the ${esc(a.genre)} fan. ${hybLine}</p>
          <p class="gs-sub">${esc(lead)}</p>
          ${!H ? `<p class="gs-hint">${V.fin.length < 5 ? `Your hybrid soul forms after 5 cleared games (${V.fin.length} so far).` : "A hybrid soul appears once a second archetype is clearly strong (15% or more)."}</p>` : ""}
          <div class="chips"><button class="btn small" type="button" data-soulreveal>${H ? "Replay reveal" : "My soul card"}</button><button class="btn small" type="button" data-soulshare>Share card</button></div>
        </div>
        <div class="gs-side">
          <div class="gs-rank"><span class="px">Rank</span><b>${S.rank}</b>${S.next ? `<span class="lvlbar"><span style="width:${S.next.pct}%"></span></span><small>${S.fin} / ${S.next.at} cleared to become ${S.next.title}</small>` : `<small>The highest rank there is.</small>`}</div>
          <details class="gs-stage"><summary><span class="px">Soul depth</span><b>${st.name}</b><small>${nextAt}</small></summary>
            <div class="note">Depth reflects how much history your soul can read, not your skill. Data quality is <b>${V.quality}</b>: genres on ${pct2(V.q.genres * 100, 100)}% of played games, ratings on ${pct2(V.q.rated * 100, 100)}%, hours on ${pct2(V.q.hours * 100, 100)}%. More cleared games unlock hybrid souls, rare triple souls, deeper descriptions and history.</div></details>
        </div>
      </div>
      <nav class="gs-chapters" aria-label="Gamer's Soul chapters">${tabs}</nav>
      ${(() => { const sec = ch[4].includes(soulStore.sec?.[ch[0]]) ? soulStore.sec[ch[0]] : ch[4][0]; // one section at a time
        return `${ch[4].length > 1 ? `<nav class="gs-jump" role="tablist" aria-label="Sections">${ch[4].map(k => `<button type="button" role="tab" data-soulgo="${k}" aria-selected="${k === sec}">${SOUL_NAMES[k]}</button>`).join("")}</nav>` : ""}
      <div class="gs-body"><section class="gs-sec" id="gs-sec-${sec}" aria-labelledby="gs-h-${sec}"><div class="gs-sechead"><h3 id="gs-h-${sec}">${SOUL_NAMES[sec]}</h3><p>${SOUL_BLURB[sec]}</p></div>${soulSection(V, sec)}</section></div>`; })()}
    </section>`;
  }
  function soulSection(V, k){
    try { return ({ dna: secDNA, play: secPlay, align: secAlign, emo: secEmo, flags: secFlags, eras: secEras, pass: secPass, skills: secSkills, ach: secAch, habits: secHabits, npc: secNPC, hall: secHall, mate: secMate }[k] || secDNA)(V); }
    catch (e) { console.warn(e); return `<div class="note">This section couldn't be drawn. Try another one.</div>`; }
  }
  // ---------- DNA ----------
  function secDNA(V){
    const shown = V.dna.slice(0, 7), other = V.dna.slice(7).reduce((s, x) => s + x.pct, 0);
    const strand = shown.map(x => `<span style="flex:${Math.max(x.pct, 1.5)};--c:${x.c}" title="${esc(x.name)} · ${x.pct}%"></span>`).join("") + (other ? `<span style="flex:${other};--c:#5A6075" title="Other · ${other}%"></span>` : "");
    const open = V.dna.find(x => x.k === soulOpen.arch);
    const deep = V.stage.i;
    const detail = open ? `<div class="gs-card" style="--c:${open.c}"><div class="gs-ch"><span class="gs-cg">${open.g}</span><div><h3>${esc(open.name)}</h3><span class="px">${open.pct}% of your Gamer DNA</span></div><button class="btn small" type="button" data-arch="${open.k}">Close</button></div>
      <blockquote>${esc(AX[open.k].quote)}</blockquote>
      ${deep >= 1 ? `<p>${esc(AX[open.k].long)}</p>` : `<p class="note">Clear 5 games to unlock the full description.</p>`}
      <div class="gs-grid">
        <div><span class="px">You tend to enjoy</span><p>${esc(AX[open.k].prefs)}</p></div>
        ${deep >= 1 ? `<div><span class="px">Strengths</span><ul>${AX[open.k].str.map(s => `<li>${esc(s)}</li>`).join("")}</ul></div><div><span class="px">Playful weaknesses</span><ul>${AX[open.k].weak.map(s => `<li>${esc(s)}</li>`).join("")}</ul></div>` : ""}
        ${deep >= 2 ? `<div><span class="px">Favourite mechanics</span><p>${AX[open.k].mech.join(", ")}</p></div><div><span class="px">Try next</span><p>${AX[open.k].sugg.join(", ")}</p></div>` : deep >= 1 ? `<div><span class="px">More at Emerging Soul</span><p class="note">Mechanics and suggestions unlock at 15 cleared games.</p></div>` : ""}
      </div>
      <div class="gs-why"><span class="px">Why this shows up</span><p>Strongest signals: ${glist(open.games.slice(0, 4))}${open.games.length > 4 ? ` and ${open.games.length - 4} more` : ""}. Each played game adds weight to the archetypes its genres and title match. Finished games count 1.25, playing 1, dropped 0.3, and good ratings and long playtime add more.</p></div></div>` : "";
    const yrs = eras().years, snaps = soulStore.snaps, log = soulStore.dnaLog || [];
    // trend over the last 30 days, from the change log
    const since = Date.now() - 30 * 864e5, trend = {};
    log.filter(e => e.t >= since).forEach(e => Object.entries(e.d).forEach(([k, v]) => trend[k] = (trend[k] || 0) + v));
    const max = Math.max(1, ...V.dna.map(x => x.pct));
    const genes = V.dna.map((x, i) => { const tr = trend[x.k] || 0;
      return `<button type="button" class="gs-gene${soulOpen.arch === x.k ? " on" : ""}" data-arch="${x.k}" aria-expanded="${soulOpen.arch === x.k}" style="--c:${x.c}"><span class="gr">${i + 1}</span><i>${x.g}</i><span class="gn">${esc(x.short)}<small>${esc(x.genre)} · ${x.games.length} game${x.games.length === 1 ? "" : "s"}</small></span><span class="gb"><span style="width:${(x.pct / max * 100).toFixed(1)}%"></span></span><b>${x.pct}%</b><em class="${tr > 0 ? "up" : tr < 0 ? "down" : ""}">${tr ? `${tr > 0 ? "▲" : "▼"}${Math.abs(tr)}` : "–"}</em></button>`; }).join("");
    // the helix: one rung per played game, oldest on the left, so every new game visibly grows it
    const when = g => g.finished || g.started || (g.added || "").slice(0, 10) || "";
    const narrow = innerWidth < 560, H = [...V.played].sort((a, b) => when(a).localeCompare(when(b))).slice(narrow ? -26 : -64), n = H.length, W = narrow ? 330 : 640, mid = 56, amp = 38;
    let helix = "";
    if (n) {
      const xs = i => n === 1 ? W / 2 : 18 + i * (W - 36) / (n - 1), ph = i => i * .55;
      const pts = (sgn) => Array.from({ length: 121 }, (_, j) => { const f = j / 120, x = 18 + f * (W - 36), p = f * Math.max(1, n - 1) * .55; return `${x.toFixed(1)},${(mid + sgn * amp * Math.sin(p)).toFixed(1)}`; }).join(" ");
      helix = `<svg class="gs-helix" viewBox="0 0 ${W} 112" role="img" aria-label="Your DNA helix: ${n} played games, oldest to newest"><polyline points="${pts(1)}" class="hb1"/><polyline points="${pts(-1)}" class="hb2"/>${H.map((g, i) => { const x = xs(i), y1 = mid + amp * Math.sin(ph(i)), y2 = mid - amp * Math.sin(ph(i)), T = topGene(g), c = T ? T.c : "#5A6075", front = Math.cos(ph(i)) > 0;
        return `<g class="rung${i === n - 1 ? " newest" : ""}" data-open="${esc(g.id)}" style="--c:${c};opacity:${front ? 1 : .55}"><title>${esc(g.title)}${T ? ` · ${T.short}` : " · no archetype yet"}</title><line x1="${x.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y2.toFixed(1)}"${T ? "" : ' stroke-dasharray="3 3"'}/><circle cx="${x.toFixed(1)}" cy="${y1.toFixed(1)}" r="${front ? 4.2 : 3}"/><circle cx="${x.toFixed(1)}" cy="${y2.toFixed(1)}" r="${front ? 3 : 4.2}"/></g>`; }).join("")}</svg>`;
    }
    // what the next game would do
    const tot = V.dna.reduce((s2, x) => s2 + x.raw, 0), avgW = V.played.length ? V.played.reduce((s2, g) => s2 + gameWeight(g), 0) / V.played.length : 1;
    const nudge = x => Math.round((x.raw + avgW) / (tot + avgW) * 100 - x.raw / tot * 100);
    const [A, B] = V.dna, gap = A && B ? Math.floor((A.raw - B.raw) / avgW) + 1 : 0;
    const nudges = V.dna.slice(0, 4).map(x => `<li style="--c:${x.c}"><i>${x.g}</i><span>One more <b>${esc(x.short)}</b> game: about <b>+${nudge(x)}%</b></span></li>`).join("");
    const blank = V.played.filter(g => !Object.keys(genesOf(g)).length);
    const shifts = log.slice(0, 8).map(e => `<li><span class="sd">${new Date(e.t).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span><span class="swy">${esc(e.why)} ${e.id && games.some(g => g.id === e.id) ? glink(games.find(g => g.id === e.id)) : `<b>${esc(e.title || "your library")}</b>`}</span><span class="sc">${Object.entries(e.d).map(([k, v]) => `<em class="${v > 0 ? "up" : "down"}" style="--c:${AK(k).c}">${AK(k).short} ${v > 0 ? "+" : ""}${v}%</em>`).join("")}</span>${e.top !== e.was && e.was ? `<span class="slead">New leader: ${esc(AK(e.top).short)}</span>` : ""}</li>`).join("");
    return `<div class="gs-dna">
        <div class="gs-helixwrap">${helix}<p class="note">${narrow && V.played.length > 26 ? "Showing your latest 26 games. " : ""}Each rung is a game you've played, oldest on the left. Its colour is the archetype it feeds most. Every game you add grows the helix and moves your percentages. Tap a rung to open the game.</p></div>
        <div class="strand big">${strand}</div>
        <div class="gs-genes">${genes}</div>
        <p class="note">All ${V.dna.length} archetypes in your DNA, adding up to 100%. Arrows show the change over the last 30 days. Tap one to explore it. Each game's archetypes and worlds come from its genres, Wikidata and the start of its Wikipedia article. <button class="linkbtn" type="button" data-lorerefresh>${loreState.busy ? "Reading game details…" : "Re-read game details"}</button></p></div>${detail}
      <div class="gs-dna2">
        <div class="gs-sub2"><h3>Latest DNA shifts</h3>${shifts ? `<ul class="gs-shifts">${shifts}</ul>` : `<p class="note">From now on, every game you add, finish, rate or retag that moves your DNA shows up here, with exactly what changed.</p>`}</div>
        <div class="gs-sub2"><h3>What your next game would do</h3><ul class="gs-nudge">${nudges}</ul>
          ${A && B ? `<p class="note">${gap <= 12 ? `<b>${esc(B.short)}</b> is about ${gap} game${gap === 1 ? "" : "s"} away from overtaking <b>${esc(A.short)}</b> as your leader.` : `<b>${esc(A.short)}</b> leads comfortably. ${esc(B.short)} would need more than 12 games to catch up.`} Estimates assume a typical game from your library.</p>` : ""}</div>
      </div>
      ${blank.length ? `<div class="gs-sub2"><h3>Games not feeding your DNA</h3><p class="note">${blank.length} played game${blank.length === 1 ? " has" : "s have"} no archetype yet, so ${blank.length === 1 ? "it doesn't" : "they don't"} count: ${glist(blank.slice(0, 6))}${blank.length > 6 ? ` and ${blank.length - 6} more` : ""}. Open one and pick its archetypes under “DNA, feelings, worlds and extras”.</p></div>` : ""}
      <div class="gs-sub2"><h3>How your DNA has changed by year</h3>
        ${yrs.length ? `<div class="gs-years">${yrs.map(y => `<div class="gs-year" style="--c:${y.top.c}"><b>${y.y}</b><span>${esc(y.hyb ? y.hyb.title : y.top.name)}</span><small>${y.n} games finished</small></div>`).join("")}</div><p class="note">Built only from games with finish dates in each year.</p>`
          : `<p class="note">Your history appears once you have at least 3 games with finish dates in a year. Nothing is invented for undated games.</p>`}</div>`;
  }
  // ---------- playstyle ----------
  function secPlay(V){
    return `<div class="gs-traits">${spectra(V).map(s => `<details class="gs-trait${s.ok ? "" : " emerging"}"><summary><span class="tl">${s.l}</span><span class="tbar">${s.ok ? `<i style="left:${s.v}%"></i>` : `<i class="em" style="left:50%"></i>`}</span><span class="tr">${s.r}</span></summary>
      <div class="gs-tx">${s.ok ? `<b>${s.v < 35 ? `Leans ${s.l}` : s.v > 65 ? `Leans ${s.r}` : "Right in the middle"}</b>` : `<b>Still emerging</b> · needs ${s.need} relevant games (you have ${s.n})`}<p>${s.how}</p><p class="note">Evidence: ${esc(s.ev)}.</p></div></details>`).join("")}</div>
      <p class="note">Tap a spectrum to see exactly how it's measured. Nothing here is guessed from a single game.</p>`;
  }
  // ---------- alignment ----------
  function secAlign(V){
    const A = alignment(V), a = soulStore.answers;
    const compass = `<svg class="gs-compass" viewBox="0 0 220 220" role="img" aria-label="Alignment compass: ${A.ok ? A.name : "still forming"}">
      <rect x="10" y="10" width="200" height="200" rx="16" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.12)"/>
      ${[60, 110, 160].map(v => `<path d="M${v} 10V210M10 ${v}H210" stroke="rgba(255,255,255,${v === 110 ? .22 : .07})"/>`).join("")}
      <text x="60" y="34" class="q">Mastermind</text><text x="160" y="34" class="q">Warlord</text><text x="60" y="196" class="q">Guardian</text><text x="160" y="196" class="q">Wildcard</text>
      <text x="16" y="114" class="ax" text-anchor="start">Co-op</text><text x="204" y="114" class="ax" text-anchor="end">Compete</text><text x="110" y="22" class="ax">Strategic</text><text x="110" y="206" class="ax">Instinctive</text>
      ${A.ok ? `<circle class="gs-dot-glow" cx="${10 + A.x * 2}" cy="${210 - A.y * 2}" r="16"/><circle class="gs-dot" cx="${10 + A.x * 2}" cy="${210 - A.y * 2}" r="7"/>` : `<text x="110" y="120" class="ax">?</text>`}</svg>`;
    const qs = QUESTIONS.map(([k, q, opts]) => `<div class="gs-q"><span>${q}</span><div class="chips">${opts.map(([v, n]) => `<button type="button" class="chip" data-ans="${k}:${v}" aria-pressed="${a[k] === v}">${n}</button>`).join("")}${a[k] ? `<button type="button" class="linkbtn" data-ans="${k}:">Clear</button>` : ""}</div></div>`).join("");
    return `<div class="gs-align">${compass}<div class="gs-al">${A.ok ? `<span class="px">Your gaming alignment</span><h3>${A.name}</h3><p>${A.desc}</p><p class="note">Based on ${A.ev}.</p>` : `<span class="px">Your gaming alignment</span><h3>Still taking shape</h3><p>Your Gaming Alignment needs a little more to go on. Tell us how you play below, or track a few more games with genres.</p><p class="note">So far: ${A.ev}.</p>`}</div></div>
      <div class="gs-dims">${A.dims.map(([l, r, v, q]) => `<div class="gs-trait${v == null ? " emerging" : ""}"><div class="row"><span class="tl">${l}</span><span class="tbar">${v == null ? `<i class="em" style="left:50%"></i>` : `<i style="left:${v}%"></i>`}</span><span class="tr">${r}</span></div>${v == null ? `<small class="note">Answer “${QUESTIONS.find(x => x[0] === q)[1]}” below to reveal this.</small>` : ""}</div>`).join("")}</div>
      <details class="gs-qs"><summary><b>Tell us how you play</b> <span class="note">optional · ${Object.keys(a).length} of ${QUESTIONS.length} answered · change anytime</span></summary>${qs}
        <p class="note">Your answers are treated as preferences you told us, not facts about you. They stay on this device.</p></details>`;
  }
  // ---------- emotions ----------
  function secEmo(V){
    const E = emotions(V);
    if (!E.felt.length) return `<div class="gs-empty"><b>Your emotional DNA is waiting</b><p>Open any game you've played and pick how it made you feel under “Feelings, worlds and extras”. After a few games, your emotional profile appears here.</p></div>`;
    const chip = id => { const f = FEEL.get(id); return `<span class="feel" style="--fc:${f.c}"><i>${f.gl}</i>${f.n}</span>`; };
    const tot = [...E.gc.values()].reduce((s, n) => s + n, 0);
    const bar = FEELS.filter(([k]) => E.gc.get(k)).map(([k, n, c]) => `<span style="flex:${E.gc.get(k)};--c:${c}" title="${n}: ${E.gc.get(k)}"></span>`).join("");
    const card = (t, gs) => gs && gs.length ? `<div class="gs-mini"><span class="px">${t}</span>${gs.map(glink).join("")}</div>` : "";
    const yrs = [...E.byYear].sort((a, b) => a[0].localeCompare(b[0])).slice(-5);
    const gf = [...E.genreFeel].filter(([, m]) => [...m.values()].reduce((s, n) => s + n, 0) >= 3).slice(0, 4);
    return `<div class="gs-emo">
      <div class="gs-row3">${E.pos ? `<div class="gs-mini"><span class="px">Most common good feeling</span>${chip(E.pos[0])}<small>${E.pos[1]} games</small></div>` : ""}
        ${E.neg ? `<div class="gs-mini"><span class="px">Most common hard feeling</span>${chip(E.neg[0])}<small>${E.neg[1]} games</small></div>` : ""}
        ${E.tense ? `<div class="gs-mini"><span class="px">Most common tension</span>${chip(E.tense[0])}<small>${E.tense[1]} games</small></div>` : ""}</div>
      <div class="strand big">${bar}</div><div class="gs-legend">${FEELS.filter(([k]) => E.gc.get(k)).map(([k, n, c, , gl]) => `<span class="gs-arch" style="--c:${c}"><i>${gl}</i>${n} <b>${pct2(E.gc.get(k), tot)}%</b></span>`).join("")}</div>
      ${E.insights.length && E.felt.length >= 3 ? `<div class="gs-quote">${E.insights.map(t => `<p>${esc(t)}</p>`).join("")}</div>` : `<p class="note">Insights appear once you've described at least 3 games${E.felt.length < 3 ? ` (${E.felt.length} so far)` : ""}.</p>`}
      <div class="gs-row3">${card("Most intense", E.intense)}${card("Most comforting", E.comfort)}${card("Most heartbreaking", E.heartbreak)}${E.range ? card("Widest emotional range", [E.range]) : ""}</div>
      ${yrs.length >= 2 ? `<div class="gs-sub2"><h3>Feelings over time</h3>${yrs.map(([y, m]) => { const t = [...m.values()].reduce((s, n) => s + n, 0); return `<div class="gs-yrow"><b>${y}</b><div class="strand">${FEELS.filter(([k]) => m.get(k)).map(([k, n, c]) => `<span style="flex:${m.get(k)};--c:${c}" title="${n}"></span>`).join("")}</div><small>${t}</small></div>`; }).join("")}</div>` : ""}
      ${gf.length ? `<div class="gs-sub2"><h3>Feelings by genre</h3>${gf.map(([ge, m]) => { const top = [...m].sort((a, b) => b[1] - a[1])[0]; const G = FEELS.find(f => f[0] === top[0]); return `<p><b>${esc(ge)}</b> mostly brings <span style="color:${G[2]}">${G[1].toLowerCase()}</span>.</p>`; }).join("")}</div>` : ""}
      ${E.surprising ? (() => { const [a, b] = E.surprising[0].split("|").map(k => FEELS.find(f => f[0] === k)); return `<p class="note">Surprising combination: ${E.surprising[1]} games made you feel both <b style="color:${a[2]}">${a[1].toLowerCase()}</b> and <b style="color:${b[2]}">${b[1].toLowerCase()}</b>.</p>`; })() : ""}
    </div>`;
  }
  // ---------- flags ----------
  function secFlags(V){
    const all = flags(V), dis = new Set(soulStore.dismissed), vis = all.filter(f => !dis.has(f.id)), hidden = all.length - vis.length;
    // compact: just the flag's name until you tap it
    const card = f => `<details class="gs-flag ${f.kind}"><summary><b>${esc(f.title)}</b>${f.rarity !== "common" ? `<span class="${tierCls(f.rarity)} gs-rar">${f.rarity}</span>` : ""}</summary><div><p>${esc(f.text)}</p><small>Evidence: ${esc(f.ev)}</small><button class="linkbtn" type="button" data-dismiss="${f.id}" aria-label="Hide ${esc(f.title)}">Hide this flag</button></div></details>`;
    const red = vis.filter(f => f.kind === "red"), green = vis.filter(f => f.kind === "green");
    return `<div class="gs-flags"><div><h3>Your Gaming Red Flags</h3><p class="gs-subt">Your save files have been examined. We have concerns.</p>${red.length ? red.map(card).join("") : `<p class="note">No red flags found. Suspicious. Answering the questions in Alignment can reveal more.</p>`}</div>
      <div><h3>Your Gaming Green Flags</h3><p class="gs-subt">The good stuff, with receipts.</p>${green.length ? green.map(card).join("") : `<p class="note">Green flags appear as your library grows.</p>`}</div></div>
      ${hidden ? `<p class="note">${hidden} hidden. <button class="linkbtn" type="button" data-undismiss>Show them again</button></p>` : ""}<p class="note">Every flag is based on your own data or answers and updates as your library changes.</p>`;
  }
  // ---------- eras ----------
  function secEras(){
    const R = eras();
    if (!R.eras.length) return `<div class="gs-empty"><b>Your gaming eras are still being written</b><p>Eras need finished games with finish dates: at least 3 within the same half-year. ${R.dated.length ? `You have ${R.dated.length} dated clears so far.` : "Add finish dates when you clear games."} Nothing is invented for undated games.</p></div>`;
    return `<div class="gs-eras">${R.eras.map((e, i) => `<div class="gs-era${i === R.eras.length - 1 ? " now" : ""}" style="--c:${e.c}"><span class="dot"></span><div><span class="px">${halfLabel(e.from)}${e.to !== e.from ? ` to ${halfLabel(e.to)}` : ""}${i === R.eras.length - 1 ? " · current era" : ""}</span><h3>${e.name}</h3>
      <p>${e.games.length} finished${e.hours ? ` · ${fmtH(e.hours)} known playtime` : ""}${e.genres.length ? ` · mostly ${e.genres.join(", ")}` : ""}${e.feels.length ? ` · felt ${e.feels.join(", ").toLowerCase()}` : ""}</p><p class="note">Defining games: ${glist(e.defining)}.</p></div></div>`).join("")}</div>
      ${R.drama ? `<div class="gs-quote"><span class="px">Your most dramatic transformation</span><p>From <b>${R.drama.a.name.replace("The ", "")}</b> to <b>${R.drama.b.name.replace("The ", "")}</b> between ${halfLabel(R.drama.a.to)} and ${halfLabel(R.drama.b.from)}. Character development.</p></div>` : ""}`;
  }
  // ---------- passport ----------
  function secPass(){
    const P = passport(), open = P.regions.find(r => r.k === soulOpen.stamp);
    const atlas = `<svg class="gs-atlas" viewBox="0 0 320 180" role="img" aria-label="World atlas: ${P.seen} of 16 regions explored">${P.regions.map((r, i) => { const x = 22 + (i % 6) * 50 + (Math.floor(i / 6) % 2) * 24, y = 30 + Math.floor(i / 6) * 58; return `<g class="${r.stamp ? "lit" : ""}" style="--c:${r.c}"><path d="M${x} ${y - 22}l20 11v22l-20 11-20-11v-22z"/><text x="${x}" y="${y + 5}">${r.gl}</text></g>`; }).join("")}</svg>`;
    return `<div class="gs-pass"><div class="gs-passhead"><div><span class="px">World Passport</span><h3>${P.seen} of 16 worlds explored</h3><p class="note">A game's worlds come from your own tags, or from setting genres like “cyberpunk” or “post-apocalyptic”. Tag worlds in any game under “Feelings, worlds and extras”.${P.untagged ? ` ${P.untagged} played games have no world yet.` : ""}</p></div>${atlas}</div>
      <div class="gs-stamps">${P.regions.map(r => `<button type="button" class="gs-stamp${r.stamp ? " got" : ""}${soulOpen.stamp === r.k ? " on" : ""}" data-stamp="${r.k}" style="--c:${r.c}" aria-label="${r.n}: ${r.gs.length} games"><i>${r.gl}</i><b>${r.n}</b><small>${r.stamp ? `${r.gs.length} visited · ${r.f.length} cleared` : "No stamp yet"}</small></button>`).join("")}</div>
      ${open ? `<div class="gs-card" style="--c:${open.c}"><div class="gs-ch"><span class="gs-cg">${open.gl}</span><div><h3>${open.n}</h3><span class="px">${open.gs.length} games · ${open.f.length} cleared${open.hours ? ` · ${fmtH(open.hours)}` : ""}</span></div><button class="btn small" type="button" data-stamp="${open.k}">Close</button></div>${open.gs.length ? `<p>Visited: ${glist(open.gs.slice(0, 8))}${open.gs.length > 8 ? ` and ${open.gs.length - 8} more` : ""}.</p>${open.fav ? `<p>Favourite here: ${glink(open.fav)} (${stars(open.fav.rating)}).</p>` : ""}` : `<p class="note">Your passport is ready for this stamp.</p>`}</div>` : ""}
      <div class="gs-ms">${P.ms.map(([n, d, have, need]) => `<div class="gs-msi${have >= need ? " got" : ""}"><b>${n}</b><small>${d}</small><span class="lvlbar"><span style="width:${Math.min(100, have / need * 100)}%"></span></span><small>${Math.min(have, need)} / ${need}</small></div>`).join("")}</div></div>`;
  }
  // ---------- skill tree ----------
  function secSkills(V){
    const T = skillTree(), own = titlesOwned(V);
    return `<div class="gs-tree">${T.map(b => `<div class="gs-branch" style="--c:${b.c}"><div class="gs-bh"><i>${b.g}</i><b>${b.name}</b><small>${b.n} finished</small></div><div class="gs-nodes">${b.titles.map((t, i) => `<div class="gs-node${b.tier > i ? " got" : ""}"><span class="n">${i + 1}</span><b>${t}</b><small>${SKILL_AT[i]} cleared</small></div>`).join("")}<div class="gs-node secret${b.secret ? " got" : ""}"><span class="n">★</span><b>${b.secret ? "Heart of the Branch" : "Secret"}</b><small>${b.secret ? "You gave a game here 5 stars" : "???"}</small></div></div>
      ${b.next ? `<span class="lvlbar"><span style="width:${b.n / b.next * 100}%"></span></span><small class="note">${b.next - b.n} more to unlock ${b.titles[b.tier]}</small>` : `<small class="note">Branch complete.</small>`}</div>`).join("")}</div>
      <p class="note">Branches count finished games that strongly match each archetype. They track what you've played, not how skilfully you played it.</p>
      <div class="gs-sub2"><h3>Your titles</h3>${own.length ? `<div class="chips">${own.map(([id, t]) => `<button type="button" class="chip" data-title="${esc(id)}" aria-pressed="${soulStore.title === id}">${esc(t)}</button>`).join("")}</div><p class="note">Pick one to show under your soul name. Earn more from branches, passport milestones, epic achievements and hybrid souls.</p>` : `<p class="note">Clear games to earn your first title.</p>`}</div>`;
  }
  // ---------- achievements ----------
  function secAch(){
    const L = soulAchievements(true), done = L.filter(a => a.done).length;
    const grp = ["common", "rare", "epic", "legendary"];
    return `<p class="note">${done} of ${L.length} unlocked. Separate from Steam or console achievements, and they unlock retroactively from your history.</p>${grp.map(t => { const l = L.filter(a => a.tier === t); return `<div class="gs-sub2"><h3 class="${tierCls(t)}">${t[0].toUpperCase() + t.slice(1)}</h3><div class="gs-achs">${l.map(a => { const hide = a.secret && !a.done;
      return `<div class="gs-ach${a.done ? " got" : ""} ${tierCls(a.tier)}"><i>${a.done ? "✦" : hide ? "?" : "◇"}</i><div><b>${hide ? "Secret achievement" : esc(a.name)}</b><small>${hide ? "Keep playing to discover it." : esc(a.desc)}</small>${a.done ? `<small class="when">Unlocked ${fmtDate(a.date)}</small>` : !hide && a.need > 1 ? `<span class="lvlbar"><span style="width:${a.have / a.need * 100}%"></span></span><small>${a.have} / ${a.need}</small>` : ""}</div></div>`; }).join("")}</div></div>`; }).join("")}`;
  }
  // ---------- habits ----------
  function secHabits(V){
    const H = habits(V), B = backlogP(V), D = discoveries(V);
    const sign = soulStore.sign;
    return `<div class="gs-row2">
      <div class="gs-card plain"><span class="px">Your gaming comfort zone</span>${H.comfort ? `<h3>Your safe haven: ${esc(H.comfort.ge)}</h3><p>${esc(H.comfortQuip)}</p><p class="note">${H.comfort.n} played, ${H.comfort.f} finished${H.comfort.rn ? `, ${(H.comfort.r / H.comfort.rn).toFixed(1)} stars on average` : ""}.</p>` : `<p class="note">Your comfort zone appears once you've played 3 or more games in a genre.</p>`}
        <ul class="gs-facts">${H.bestRated ? `<li>Highest-rated familiar genre: <b>${esc(H.bestRated.ge)}</b> (${(H.bestRated.r / H.bestRated.rn).toFixed(1)} stars)</li>` : ""}${H.franchise ? `<li>Most revisited series: <b>${esc(H.franchise[0])}</b> (${H.franchise[1]} games)</li>` : ""}${H.world ? `<li>Favourite world: <b>${WORLD.get(H.world[0]).n}</b></li>` : ""}<li>Challenge level: <b>${(() => { const s = spectra(V)[3]; return s.ok ? s.v > 60 ? "Hardcore" : s.v < 40 ? "Relaxed" : "A healthy mix" : "Still emerging"; })()}</b></li></ul></div>
      <div class="gs-card plain"><span class="px">Your gaming nemesis</span>${H.nemesis ? `<h3>Your nemesis: ${esc(H.nemesis.ge)}</h3><p>${esc(H.nemesisQuip)}</p><p class="note">${H.nemesis.n} played, ${H.nemesis.d} dropped${H.nemesis.rn ? `, ${(H.nemesis.r / H.nemesis.rn).toFixed(1)} stars on average` : ""}.</p>` : `<h3>No nemesis yet</h3><p class="note">A nemesis needs at least 3 games in a genre that you mostly dropped or rated low. A genre you haven't tried isn't a nemesis.</p>`}</div>
    </div>
    <div class="gs-card plain"><span class="px">Your backlog personality</span>${B.p ? `<h3>${B.p[0]}</h3><p>${B.p[1]}</p>` : `<h3>Still forming</h3><p class="note">Track a few more games (playing, finished or backlog) to reveal it.</p>`}
      <div class="gs-stats"><div><b>${B.back.length}</b><small>in backlog</small></div><div><b>${B.ratio == null ? "–" : Math.round(B.ratio * 100) + "%"}</b><small>of started games finished</small></div><div><b>${B.avgAge == null ? "–" : B.avgAge + " d"}</b><small>average backlog wait</small></div><div><b>${B.wish.length}</b><small>on the wishlist</small></div></div>
      ${B.longest ? `<p class="note">Longest waiting: ${glink(B.longest)}, ${B.longestAge} days.${B.rescued.length ? ` Recently rescued: ${glist(B.rescued)}.` : ""}</p>` : ""}<p class="note">Wishlist games count as wishes, not purchases.</p></div>
    <div class="gs-sub2"><h3>More discoveries</h3>${D.length ? `<div class="gs-disc">${D.map(([, t, x]) => `<div class="gs-mini"><b>${t}</b><p>${esc(x)}</p></div>`).join("")}</div>` : `<p class="note">More discoveries appear as your library grows.</p>`}</div>
    <div class="gs-sub2"><h3>Your gaming horoscope ${fun}</h3><div class="chips">${ZODIAC.map(([k, n]) => `<button type="button" class="chip" data-sign="${k}" aria-pressed="${sign === k}">${n}</button>`).join("")}</div>
      ${sign && V.dna[0] ? `<p class="gs-horo">Your ${ZODIAC.find(z => z[0] === sign)[1]} nature makes you ${ZODIAC_TRAIT[sign]}, but your Gamer DNA says ${esc(V.dna[0].short)} at heart, so expect ${AX[V.dna[0].k].weak[0].toLowerCase()} this week.</p><p class="note">Pure entertainment. The stars know nothing about your backlog.</p>` : `<p class="note">Optional and purely for fun. Pick a sign to see it.</p>`}</div>`;
  }
  // ---------- inner NPC ----------
  function secNPC(V){
    const N = innerNPC(V);
    if (!N) return `<div class="gs-empty"><b>Your inner NPC is still in the character creator</b><p>Play a few more games and they'll step out.</p></div>`;
    const [id, name, , cls, line, ability, weak, quest] = N;
    return `<div class="gs-npc"><div class="gs-npcart" aria-hidden="true"><span>${name.split(" ").pop()[0]}</span></div><div><span class="px">If you were an NPC, you'd be… ${fun}</span><h3>${name}</h3><p class="gs-cls">${cls}</p>
      <blockquote>${line}</blockquote><div class="gs-grid"><div><span class="px">Special ability</span><p>${ability}</p></div><div><span class="px">Fictional weakness</span><p>${weak}</p></div><div><span class="px">Side quest</span><p>${quest}</p></div><div><span class="px">Badge</span><p><span class="gs-badge">${name.replace("The ", "")}</span></p></div></div>
      <p class="note">Picked from your strongest archetypes. A bit of fun, not a personality test.</p></div></div>`;
  }
  // ---------- hall of legends ----------
  function secHall(){
    const nom = new Map(); games.forEach(g => Object.entries(g.awards || {}).forEach(([c, note]) => nom.set(c, { g, note })));
    return `<p class="note">Your personal museum. Nominate the games that mattered most. Suggestions come from your ratings, feelings and playtime.</p><div class="gs-hall">${LEGEND_CATS.map(([k, n]) => { const x = nom.get(k), s = !x && legendSuggest(k);
      return `<div class="gs-award${x ? " got" : ""}">${x ? `<div class="gs-cover">${boxHTML(x.g)}</div>` : `<div class="gs-cover empty"><span>✦</span></div>`}<div class="gs-at"><span class="px">${n}</span>${x ? `<b>${esc(x.g.title)}</b>${x.note ? `<p>“${esc(x.note)}”</p>` : ""}<div class="chips"><button class="btn small" type="button" data-nominate="${k}">Change</button><button class="btn small" type="button" data-shareaward="${k}">Share</button></div>`
        : `<div class="chips"><button class="btn small primary" type="button" data-nominate="${k}">Nominate</button>${s ? `<button class="btn small" type="button" data-nominate="${k}" data-suggest="${esc(s.id)}">Suggest: ${esc(s.title)}</button>` : ""}</div>`}</div></div>`; }).join("")}</div>`;
  }
  // ---------- soulmate ----------
  let mateResult = null;
  function secMate(V){
    const R = mateResult;
    return `<div class="gs-mate"><div class="gs-card plain"><span class="px">Step 1 · share your soul code (opt-in)</span><p>Your soul code contains your Gamer DNA percentages, playstyle positions, up to 25 favourite game titles and series, and your top feelings. No notes, hours or dates.</p>
      <div class="chips"><button class="btn small primary" type="button" data-soulcode>Create my soul code</button></div><textarea id="gs-mycode" class="gs-code" readonly hidden></textarea></div>
      <div class="gs-card plain"><span class="px">Step 2 · paste a friend's code</span><textarea id="gs-friend" class="gs-code" placeholder="SOUL1.…"></textarea><div class="chips"><button class="btn small primary" type="button" data-soulcompare>Compare</button></div></div></div>
      ${R ? `<div class="gs-card" style="--c:var(--sc)"><span class="px">Compatibility</span><h3>${R.id[0]}</h3><p>${esc(R.id[1])}</p>
        <div class="gs-stats"><div><b>${R.score}%</b><small>overall match</small></div><div><b>${R.dnaSim}%</b><small>Gamer DNA overlap</small></div><div><b>${R.spSim == null ? "–" : R.spSim + "%"}</b><small>playstyle closeness</small></div><div><b>${R.shared.length}</b><small>shared favourites</small></div></div>
        ${R.shared.length ? `<p>You both love: ${R.shared.map(esc).join(", ")}.</p>` : ""}${R.sharedSer.length ? `<p class="note">Shared series: ${R.sharedSer.map(esc).join(", ")}.</p>` : ""}
        <p class="note">How it's measured: 60% from how similar your archetype mixes are (cosine similarity) and 40% from the average distance between your playstyle spectrums.</p></div>` : `<p class="note">Comparison happens on this device. Nothing is uploaded.</p>`}`;
  }
  // ---------- interactions ----------
  function rerenderSoul(){ const el = document.querySelector("#view-stats .gsoul"); if (!el) return renderStats(); const tmp = document.createElement("div"); tmp.innerHTML = soulHTML(); el.replaceWith(tmp.firstElementChild); }
  $("#view-stats").addEventListener("click", e => {
    const t = e.target;
    if (t.closest("[data-lorerefresh]")) { if (loreState.busy) return; t.closest("[data-lorerefresh]").textContent = "Reading game details…"; loreHunt(true).then(n => toast(n ? `Updated details for ${n} game${n === 1 ? "" : "s"}. Your DNA and Passport are recalculated.` : "No new details found right now.")); return; }
    const cb = t.closest("[data-soulch]"); if (cb) { soulStore.ch = cb.dataset.soulch; saveSoul(); rerenderSoul(); document.querySelector(".gs-chapters [aria-pressed=true]")?.scrollIntoView({ block: "nearest", inline: "center" }); return; }
    const gj = t.closest("[data-soulgo]"); if (gj) { const ch = chapterOf(soulStore.ch); soulStore.sec = { ...(soulStore.sec || {}), [ch[0]]: gj.dataset.soulgo }; saveSoul(); rerenderSoul(); return; }
    const tb = t.closest("[data-soultab]"); if (tb) { const k = tb.dataset.soultab, c = SOUL_CH.find(c => c[4].includes(k)) || SOUL_CH[0]; soulStore.ch = c[0]; soulStore.sec = { ...(soulStore.sec || {}), [c[0]]: k }; saveSoul(); rerenderSoul(); document.getElementById("gs-sec-" + k)?.scrollIntoView({ block: "start" }); return; }
    const ar = t.closest("[data-arch]"); if (ar) { soulOpen.arch = soulOpen.arch === ar.dataset.arch ? "" : ar.dataset.arch; rerenderSoul(); return; }
    const sp = t.closest("[data-stamp]"); if (sp) { soulOpen.stamp = soulOpen.stamp === sp.dataset.stamp ? "" : sp.dataset.stamp; rerenderSoul(); return; }
    const an = t.closest("[data-ans]"); if (an) { const [k, v] = an.dataset.ans.split(":"); if (!v || soulStore.answers[k] === v) delete soulStore.answers[k]; else soulStore.answers[k] = v; saveSoul(); rerenderSoul(); document.querySelector(".gs-qs")?.setAttribute("open", ""); return; }
    const ds = t.closest("[data-dismiss]"); if (ds) { soulStore.dismissed = [...new Set([...soulStore.dismissed, ds.dataset.dismiss])]; saveSoul(); rerenderSoul(); return; }
    if (t.closest("[data-undismiss]")) { soulStore.dismissed = []; saveSoul(); rerenderSoul(); return; }
    const ti = t.closest("[data-title]"); if (ti) { soulStore.title = soulStore.title === ti.dataset.title ? "" : ti.dataset.title; saveSoul(); rerenderSoul(); return; }
    const sg = t.closest("[data-sign]"); if (sg) { soulStore.sign = soulStore.sign === sg.dataset.sign ? "" : sg.dataset.sign; saveSoul(); soulCache.sig = ""; rerenderSoul(); return; }
    if (t.closest("[data-soulreveal]")) return openReveal(soulData());
    if (t.closest("[data-soulshare]")) return shareSoulCard(soulData());
    const nm = t.closest("[data-nominate]"); if (nm) return openNominate(nm.dataset.nominate, nm.dataset.suggest);
    const sa = t.closest("[data-shareaward]"); if (sa) return shareAward(sa.dataset.shareaward);
    if (t.closest("[data-soulcode]")) { const ta = $("#gs-mycode"); ta.value = soulCode(soulData()); ta.hidden = false; ta.select(); try { navigator.clipboard.writeText(ta.value).then(() => toast("Soul code copied. Send it to a friend.")); } catch {} return; }
    if (t.closest("[data-soulcompare]")) { const d = readSoulCode($("#gs-friend").value); if (!d) { toast("That doesn't look like a soul code. It starts with SOUL1."); return; } mateResult = compare(soulData(), d); rerenderSoul(); return; }
  });
  function openNominate(cat, suggest){
    const name = LEGEND_CATS.find(c => c[0] === cat)[1];
    const P = games.filter(g => !UNPLAYED.has(g.status)).sort((a, b) => (b.rating || 0) - (a.rating || 0) || a.title.localeCompare(b.title));
    const cur = games.find(g => g.awards && cat in g.awards);
    let pick = suggest || cur?.id || "", q = "";
    const html = () => { const list = P.filter(g => !q || g.title.toLowerCase().includes(q)).slice(0, 60);
      return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="nom-t"><div class="reshead"><div><span class="px">Hall of Legends</span><h2 id="nom-t">${name}</h2></div><button class="btn small" type="button" data-mclose>Close</button></div>
        <label class="field"><span class="px">Find a game</span><input id="nom-q" value="${esc(q)}" placeholder="Type a title"></label>
        <div class="nomlist">${list.map(g => `<button type="button" class="nomrow${pick === g.id ? " on" : ""}" data-pick="${esc(g.id)}" aria-pressed="${pick === g.id}"><span>${esc(g.title)}</span><small>${g.rating ? stars(g.rating) : STATUS[g.status]}</small></button>`).join("") || `<p class="note">No played games match.</p>`}</div>
        <label class="field"><span class="px">Why it belongs here (optional)</span><input id="nom-note" maxlength="140" value="${esc(cur?.awards?.[cat] || "")}"></label>
        <div class="mfoot">${cur ? `<button class="btn danger small" type="button" id="nom-rm">Remove nomination</button>` : ""}<div class="r"><button class="btn primary" type="button" id="nom-go">Save</button></div></div></div>`; };
    openModal(html(), e => {
      const p = e.target.closest("[data-pick]"); if (p) { const note = $("#nom-note").value; pick = p.dataset.pick; $("#scrim").innerHTML = html(); $("#nom-note").value = note; return; }
      if (e.target.id === "nom-rm") { const g = games.find(x => x.awards && cat in x.awards); if (g) { const aw = { ...g.awards }; delete aw[cat]; saveGame({ ...g, awards: aw }); } closeModal(); rerenderSoul(); return; }
      if (e.target.id === "nom-go") { if (!pick) { toast("Pick a game first."); return; } const note = $("#nom-note").value.trim().slice(0, 140);
        games.filter(x => x.awards && cat in x.awards && x.id !== pick).forEach(x => { const aw = { ...x.awards }; delete aw[cat]; saveGame({ ...x, awards: aw }); });
        const g = games.find(x => x.id === pick); saveGame({ ...g, awards: { ...(g.awards || {}), [cat]: note } }, `${g.title} joins your Hall of Legends`); closeModal(); soulAchievements(true); rerenderSoul(); }
    }, null);
    root.oninput = e => { if (e.target.id === "nom-q") { q = e.target.value.toLowerCase(); const note = $("#nom-note").value, pos = e.target.selectionStart; $("#scrim").innerHTML = html(); $("#nom-note").value = note; const i = $("#nom-q"); i.focus(); i.setSelectionRange(pos, pos); } };
    modalClose = () => { root.oninput = null; };
  }
  // ---------- reveal ----------
  function openReveal(V){
    const H = V.hyb, a = V.dna[0], b = V.dna[1];
    const still = reduceMotion || settings.motion === "off";
    const title = H ? H.title : a.name, line = H ? H.d : AX[a.k].quote;
    openModal(`<div class="modal gs-reveal${still ? " still" : ""}" role="dialog" aria-modal="true" aria-labelledby="rv-t" style="--sc:${a.c};--sc2:${(b || a).c}">
      <button class="btn small rv-x" type="button" data-mclose>Close</button>
      <p class="rv-1 px">Your soul has awakened</p><p class="rv-2">Across countless worlds, through impossible battles and unforgettable stories, a pattern has begun to emerge.</p>
      <div class="rv-glyph" aria-hidden="true">${(H ? H.arch : [a]).map(x => `<span style="color:${x.c}">${x.g}</span>`).join("")}</div>
      <h2 id="rv-t" class="rv-3">${esc(title)}</h2><p class="rv-4">${esc(line)}</p>
      <div class="rv-5"><div class="strand big">${V.dna.slice(0, 7).map(x => `<span style="flex:${Math.max(x.pct, 1.5)};--c:${x.c}"></span>`).join("")}</div>
        <p>Dominant <b style="color:${a.c}">${esc(a.short)}</b>${b ? ` · Secondary <b style="color:${b.c}">${esc(b.short)}</b>` : ""} · Rank <b>${V.S.rank}</b> · ${V.stage.name}</p>
        <blockquote>${esc(AX[a.k].quote)}</blockquote>
        <div class="chips"><button class="btn primary small" type="button" id="rv-share">Share my soul card</button></div></div></div>`, e => { if (e.target.id === "rv-share") shareSoulCard(V); });
  }
  // ---------- share images (drawn locally on a canvas) ----------
  function wrapText(x, text, maxW){ const words = String(text).split(" "), lines = []; let l = ""; words.forEach(w => { const t = l ? l + " " + w : w; if (x.measureText(t).width > maxW && l) { lines.push(l); l = w; } else l = t; }); if (l) lines.push(l); return lines; }
  async function deliverCanvas(cv, name){
    const blob = await new Promise(r => cv.toBlob(r, "image/png"));
    const file = blob && new File([blob], name, { type: "image/png" });
    if (file && navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: "My Gamer's Soul" }); return; } catch (e) { if (e.name === "AbortError") return; } }
    const a = document.createElement("a"); a.href = cv.toDataURL("image/png"); a.download = name; document.body.append(a); a.click(); a.remove(); toast("Image saved.");
  }
  function cardBase(w, h, c1, c2){
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const x = cv.getContext("2d");
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#0D1124"); g.addColorStop(1, "#1A1438"); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const r = x.createRadialGradient(w * .2, h * .15, 10, w * .2, h * .15, w * .8); r.addColorStop(0, c1 + "66"); r.addColorStop(1, "transparent"); x.fillStyle = r; x.fillRect(0, 0, w, h);
    const r2 = x.createRadialGradient(w * .9, h * .9, 10, w * .9, h * .9, w * .7); r2.addColorStop(0, c2 + "55"); r2.addColorStop(1, "transparent"); x.fillStyle = r2; x.fillRect(0, 0, w, h);
    x.strokeStyle = "rgba(255,255,255,.15)"; x.lineWidth = 3; x.strokeRect(30, 30, w - 60, h - 60); return [cv, x];
  }
  function shareSoulCard(V){
    const a = V.dna[0], b = V.dna[1] || a, H = V.hyb, [cv, x] = cardBase(1080, 1350, a.c, b.c);
    x.fillStyle = "#9FB0FF"; x.font = "600 30px ui-monospace,Menlo,monospace"; x.fillText("THE GAMER'S SOUL · SAVE POINT", 80, 120);
    x.font = "130px serif"; x.fillStyle = a.c; x.fillText((H ? H.arch : [a]).map(y => y.g).join(" "), 80, 300);
    x.fillStyle = "#fff"; x.font = "700 78px system-ui,sans-serif"; wrapText(x, H ? H.title : a.name, 920).forEach((l, i) => x.fillText(l, 80, 430 + i * 88));
    x.font = "400 36px system-ui,sans-serif"; x.fillStyle = "#D8DCF0"; wrapText(x, H ? H.d : AX[a.k].quote, 920).slice(0, 5).forEach((l, i) => x.fillText(l, 80, 640 + i * 50));
    let px = 80; const tot = V.dna.slice(0, 7).reduce((s, y) => s + y.pct, 0) || 1; V.dna.slice(0, 7).forEach(y => { const w = 920 * y.pct / tot; x.fillStyle = y.c; x.fillRect(px, 940, Math.max(4, w - 4), 34); px += w; });
    x.font = "500 30px system-ui,sans-serif"; V.dna.slice(0, 4).forEach((y, i) => { x.fillStyle = y.c; x.fillText(`${y.g} ${y.short} ${y.pct}%`, 80 + (i % 2) * 460, 1040 + Math.floor(i / 2) * 50); });
    x.fillStyle = "#fff"; x.font = "600 34px system-ui,sans-serif"; x.fillText(`Rank ${V.S.rank} · ${V.stage.name}`, 80, 1230);
    deliverCanvas(cv, "gamer-soul.png");
  }
  function shareAward(cat){
    const g = games.find(x => x.awards && cat in x.awards); if (!g) return; const name = LEGEND_CATS.find(c => c[0] === cat)[1];
    const [cv, x] = cardBase(1080, 1080, "#F2C14A", "#8E52FF");
    const finish = () => { x.fillStyle = "#F2C14A"; x.font = "600 30px ui-monospace,Menlo,monospace"; x.fillText("HALL OF LEGENDS", 80, 110);
      x.fillStyle = "#fff"; x.font = "700 52px system-ui,sans-serif"; wrapText(x, name, 920).forEach((l, i) => x.fillText(l, 80, 190 + i * 60));
      x.font = "700 64px system-ui,sans-serif"; x.fillStyle = "#FFE7A0"; wrapText(x, g.title, 560).slice(0, 4).forEach((l, i) => x.fillText(l, 440, 420 + i * 74));
      if (g.awards[cat]) { x.font = "italic 34px Georgia,serif"; x.fillStyle = "#D8DCF0"; wrapText(x, "“" + g.awards[cat] + "”", 920).slice(0, 4).forEach((l, i) => x.fillText(l, 80, 860 + i * 46)); }
      deliverCanvas(cv, "hall-of-legends.png"); };
    const src = g.cover || (g.steamAppId ? steamImg(g.steamAppId, "library_600x900.jpg") : g.coverUrl);
    if (!src) { x.fillStyle = "rgba(255,255,255,.08)"; x.fillRect(80, 330, 320, 480); return finish(); }
    const im = new Image(); im.crossOrigin = "anonymous"; im.onload = () => { try { x.drawImage(im, 80, 330, 320, 480); x.getImageData(0, 0, 1, 1); } catch { const [c2, x2] = cardBase(1080, 1080, "#F2C14A", "#8E52FF"); return shareAwardPlain(c2, x2, g, name, cat); } finish(); }; im.onerror = () => { x.fillStyle = "rgba(255,255,255,.08)"; x.fillRect(80, 330, 320, 480); finish(); }; im.src = src;
  }
  function shareAwardPlain(cv, x, g, name, cat){ x.fillStyle = "#F2C14A"; x.font = "600 30px ui-monospace,Menlo,monospace"; x.fillText("HALL OF LEGENDS", 80, 110); x.fillStyle = "#fff"; x.font = "700 52px system-ui,sans-serif"; wrapText(x, name, 920).forEach((l, i) => x.fillText(l, 80, 190 + i * 60)); x.fillStyle = "#FFE7A0"; x.font = "700 70px system-ui,sans-serif"; wrapText(x, g.title, 920).slice(0, 4).forEach((l, i) => x.fillText(l, 80, 420 + i * 80)); deliverCanvas(cv, "hall-of-legends.png"); }
  // reveal once when a (new) hybrid or triple soul is first earned; snapshot monthly; announce new soul achievements
  function soulAfterRender(){
    const V = soulData(); if (!V.S) return; snapshot(V); soulAchievements(true);
    if (V.hyb && soulStore.revealed !== V.hyb.key) { soulStore.revealed = V.hyb.key; saveSoul(); setTimeout(() => { if (!root.innerHTML && tab === "stats") openReveal(V); }, 700); }
  }

