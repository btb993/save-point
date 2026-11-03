  // ================= typical playtimes (optional "playtime" function on your Supabase project) =================
  // IGDB time-to-beat (if Twitch keys are set on the function) and SteamSpy owner playtime. Always shown as estimates,
  // never written into your hours unless you press "Use as my hours".
  const EST = { busy: false, last: null };
  const estOld = (at, days) => !at || at < isoOf(new Date(Date.now() - days * 864e5));
  const estSrcs = () => [settings.estIgdb && "i", settings.estRawg && "r", "s"].filter(Boolean).join("");
  const estHas = e => e && (e.main || e.extra || e.rAvg || e.sMed);
  const needsEst = g => g.status !== "wishlist" && g.title && (!g.est || (!estHas(g.est) && g.est.srcs !== estSrcs()) || estOld(g.est.at, estHas(g.est) ? 180 : 30));
  // IGDB's "main story" is sometimes from one rushed player: if it's far below "main + extras", use that instead
  const estBest = e => !e ? 0 : e.main && (!e.extra || e.main >= e.extra * .4) ? e.main : e.extra || e.main || e.rAvg || e.sMed || 0;
  const estH = g => g.status === "finished" && !(Number(g.hours) > 0) && g.est ? estBest(g.est) : 0;
  const estOn = () => settings.estState === "ready";
  async function estCall(body){
    const c = sync.cfg; let tok = c.key;
    if (body) { try { tok = (await sync.client?.auth.getSession())?.data?.session?.access_token || ""; } catch { tok = ""; } if (!tok) throw Object.assign(new Error("signin"), { code: "signin" }); }
    const r = await fetch(`${c.url}/functions/v1/playtime`, { method: body ? "POST" : "GET", headers: { apikey: c.key, Authorization: `Bearer ${tok}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 404) throw Object.assign(new Error("missing"), { code: "missing" });
    if (r.status === 401 || r.status === 403) { const j = await r.json().catch(() => ({})); throw Object.assign(new Error("jwt"), { code: j.error === "sign in first" ? "signin" : body ? "update" : "jwt" }); }
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }
  async function estCheck(){
    try { const j = await estCall(); settings.estState = "ready"; settings.estIgdb = !!j.igdb; settings.estRawg = !!j.rawg; EST.last = null; }
    catch (e) { settings.estState = e.code === "missing" ? "missing" : e.code === "jwt" ? "jwt" : "error"; EST.last = e.message; }
    applySettings(); if (settings.estState === "ready") estHunt(true); return settings.estState;
  }
  async function estHunt(force){
    if (EST.busy || !estOn() || !navigator.onLine) return 0;
    if (!force && (settings.estLast || "") === todayISO()) return 0;
    EST.busy = true; let changed = 0;
    try {
      const rank = g => (g.status === "finished" && !(Number(g.hours) > 0) ? 0 : g.status === "backlog" && !Number(g.length) ? 1 : 2);
      const todo = games.filter(needsEst).filter(g => settings.estIgdb || settings.estRawg || g.steamAppId).sort((a, b) => rank(a) - rank(b)).slice(0, force ? 300 : 48);
      for (let k = 0; k < todo.length; k += 12) {
        if (force && todo.length > 12) toast(`Looking up typical playtimes: ${k} of ${todo.length}…`);
        const batch = todo.slice(k, k + 12), j = await estCall({ games: batch.map(g => ({ id: g.id, title: g.title, steam: g.steamAppId ? String(g.steamAppId) : undefined, year: Number(g.year) || undefined })) });
        batch.forEach(g => {
          const r = j.results?.[g.id] || {}, cur = games.find(x => x.id === g.id); if (!cur) return;
          cur.est = { main: r.main || 0, extra: r.extra || 0, full: r.full || 0, n: r.count || 0, rAvg: r.rawgAvg || 0, sAvg: r.steamAvg || 0, sMed: r.steamMedian || 0, srcs: estSrcs(), at: todayISO() };
          const sm = cur.est.main && (!cur.est.extra || cur.est.main >= cur.est.extra * .4) ? cur.est.main : 0;
          if (!Number(cur.length) && sm) { cur.length = sm; cur.lengthFrom = "IGDB"; }
          cur.updatedAt = Date.now(); changed++;
        });
      }
      settings.estLast = todayISO(); applySettings();
    } catch (e) { console.warn("playtime", e); if (force && e.code === "signin") toast("Sign in with Sync first to look up playtimes."); else if (e.code && e.code !== "signin") { settings.estState = e.code; applySettings(); } }
    finally { EST.busy = false; }
    if (changed) { saveLocal(); render(); try { sync.schedule(); } catch {} }
    return changed;
  }
  setTimeout(() => estHunt(), 12000);
  const estLine = d => {
    const e = d.est; if (!e || !(e.main || e.extra || e.full || e.rAvg || e.sMed)) return "";
    const parts = [e.main && `~${fmtH(e.main)} main story`, e.extra && `~${fmtH(e.extra)} with extras`, e.full && `~${fmtH(e.full)} for 100%`].filter(Boolean);
    const use = estBest(e);
    return `<div class="estline full"><span class="px">Typical playtime</span><p>${parts.length ? `${parts.join(" · ")} <small>(IGDB${e.n ? `, ${e.n} player${e.n === 1 ? "" : "s"}` : ""})</small>` : ""}${parts.length && e.rAvg ? "<br>" : ""}${e.rAvg ? `RAWG players: ~${fmtH(e.rAvg)} on average` : ""}${(parts.length || e.rAvg) && e.sMed ? "<br>" : ""}${e.sMed ? `Steam players: ~${fmtH(e.sMed)} median, ~${fmtH(e.sAvg)} average` : ""}</p>
      ${!(Number(d.hours) > 0) && use ? `<p class="note">${d.status === "finished" && settings.countEst !== false ? "Counted in your stats as an estimate until you add your own hours. " : ""}<button class="linkbtn" type="button" onclick="const i=document.getElementById('f-hours');if(i){i.value='${use}';i.dispatchEvent(new Event('input',{bubbles:true}))}">Use ~${fmtH(use)} as my hours</button></p>` : ""}</div>`;
  };
  function openEstSetup(){
    const ref = sync.ref, st = settings.estState || "unknown";
    const src = [settings.estIgdb && "IGDB", settings.estRawg && "RAWG", "SteamSpy"].filter(Boolean).join(", ");
    const msg = { ready: `Connected, using ${src}.${settings.estIgdb || settings.estRawg ? "" : " Only Steam games get numbers for now. Add IGDB or RAWG (steps 4 and 5) for games from any platform."}`, missing: "The playtime function isn't on your Supabase project yet.", jwt: `The function is there but turned away the app. Turn off "Verify JWT" (step 3).`, signin: "Sign in with Sync (top of the app) first. Only signed-in players can use your playtime function, so strangers can't use up your keys.", update: "Your function is an older version. Copy the code again (step 2), paste it over the old code and deploy.", error: `Couldn't reach it${EST.last ? ` (${esc(EST.last)})` : ""}. Try again in a minute.`, unknown: "Not set up yet." }[st] || "";
    const html = () => `<div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="est-t"><div class="reshead"><div><span class="px">Optional</span><h2 id="est-t">Typical playtimes</h2></div><button class="btn small" type="button" data-mclose>Close</button></div>
      <p style="margin-top:0">For games with no hours logged, Save Point can show how long they usually take: IGDB's main story / extras / 100% times, and how long Steam players spend. They're always marked as estimates, and never replace hours you've entered.</p>
      <p class="note"><b>Status:</b> ${msg}</p>
      <ol class="steps eststeps">
        <li><a class="btn small" href="https://supabase.com/dashboard/project/${esc(ref)}/functions" target="_blank" rel="noopener">Open Edge Functions on Supabase ↗</a> Choose <b>Deploy a new function</b>, then <b>Via Editor</b>.</li>
        <li>Name it <code>playtime</code>, delete the sample code, <button class="btn small" type="button" data-estcopy>Copy the function code</button> and paste it in. Press <b>Deploy function</b>.</li>
        <li>Open the function's <b>Details</b> tab, switch off <b>Verify JWT</b> (it may say "Enforce JWT verification") and save. The function only looks up public game data, so nothing private is exposed.</li>
        <li><i>Optional, best numbers for games on any platform:</i> make a free app on <a href="https://dev.twitch.tv/console/apps" target="_blank" rel="noopener">dev.twitch.tv ↗</a> (any name, redirect URL <code>http://localhost</code>, category Website Integration). Copy its <b>Client ID</b> and make a <b>Client Secret</b>, then add them as <code>IGDB_CLIENT_ID</code> and <code>IGDB_CLIENT_SECRET</code> under <a href="https://supabase.com/dashboard/project/${esc(ref)}/functions/secrets" target="_blank" rel="noopener">Edge Function secrets ↗</a>.</li>
        <li><i>Optional, the quickest key:</i> sign up on <a href="https://rawg.io/apidocs" target="_blank" rel="noopener">rawg.io/apidocs ↗</a> and press <b>Get API key</b> (any site name and description). Add it as <code>RAWG_KEY</code> in the same secrets page. RAWG gives an average playtime for almost every game, on any platform.</li>
        <li><button class="btn primary small" type="button" data-estcheck>Check connection</button></li>
      </ol>
      <label class="check"><input type="checkbox" id="est-count" ${settings.countEst !== false ? "checked" : ""}> Count typical hours in my stats for finished games with no hours (shown with ~)</label>
      ${st === "ready" ? `<div class="chips" style="margin-top:10px"><button class="btn small" type="button" data-estnow>Look up my games now</button></div>` : ""}</div>`;
    openModal(html(), async e => {
      if (e.target.closest("[data-estcopy]")) { try { const code = await fetch("supabase/playtime/index.ts", { cache: "no-store" }).then(r => { if (!r.ok) throw 0; return r.text(); }); await navigator.clipboard.writeText(code); toast("Function code copied"); } catch { window.open("supabase/playtime/index.ts", "_blank"); toast("Opened the code. Select all and copy it."); } return; }
      if (e.target.closest("[data-estcheck]")) { e.target.closest("button").textContent = "Checking…"; await estCheck(); $("#scrim").innerHTML = html(); return; }
      if (e.target.closest("[data-estnow]")) { e.target.closest("button").textContent = "Looking up…"; const n = await estHunt(true); toast(n ? `Found typical playtimes for ${n} game${n === 1 ? "" : "s"}` : "Nothing new to look up"); $("#scrim").innerHTML = html(); return; }
    }, e => { if (e.target.id === "est-count") { settings.countEst = e.target.checked; applySettings(); render(); } });
  }
  let loreKick = null; const kickLore = () => { clearTimeout(loreKick); loreKick = setTimeout(() => { if (games.some(needsLore)) loreHunt(); }, 9000); };
  const feelsOf = g => (g.feel && Array.isArray(g.feel.f) ? g.feel.f.filter(id => FEEL.has(id)) : []);
  // largest-remainder rounding: integer shares that always add up to exactly 100
  function to100(items){ const tot = items.reduce((s, x) => s + x.raw, 0); if (!tot) return items.map(x => ({ ...x, pct: 0 }));
    const r = items.map(x => { const ex = x.raw / tot * 100; return { ...x, pct: Math.floor(ex), rem: ex - Math.floor(ex) }; });
    let left = 100 - r.reduce((s, x) => s + x.pct, 0); [...r].sort((a, b) => b.rem - a.rem || AIDX[a.k] - AIDX[b.k]).forEach(x => { if (left > 0) { x.pct++; left--; } }); return r; }
  // DNA for any set of games (used for today, past years and eras)
  // a game's genes: the archetypes it feeds. Detected from genres and title, or chosen by you in the game's window.
  const autoGenes = g => Object.fromEntries(ARCH.map(a => [a.k, a.t(g)]).filter(([, v]) => v > 0));
  const genesOf = g => Array.isArray(g.dna) && g.dna.some(k => AIDX[k] != null) ? Object.fromEntries(g.dna.filter(k => AIDX[k] != null).map(k => [k, 1])) : autoGenes(g);
  const topGene = g => { const e = Object.entries(genesOf(g)).sort((a, b) => b[1] - a[1] || AIDX[a[0]] - AIDX[b[0]])[0]; return e ? AK(e[0]) : null; };
  function dnaFor(list){
    const score = Object.fromEntries(ARCH.map(a => [a.k, 0])), why = Object.fromEntries(ARCH.map(a => [a.k, []]));
    list.forEach(g => { const w = gameWeight(g), G = genesOf(g); for (const [k, t] of Object.entries(G)) { score[k] += w * t; why[k].push([g, w * t]); } });
    const items = ARCH.map(a => ({ k: a.k, raw: score[a.k] })).filter(x => x.raw > 0);
    // stable order: score, then the archetype's fixed position (deterministic ties)
    const dna = to100(items).map(x => ({ ...AK(x.k), ...x, games: why[x.k].sort((a, b) => b[1] - a[1]).map(y => y[0]) })).sort((a, b) => b.raw - a.raw || AIDX[a.k] - AIDX[b.k]);
    return { dna, score };
  }
  function hybridFor(dna, played, fin){
    const [a, b, c] = dna; if (!a || !b) return null;
    const enough = fin >= 5 && played >= 5 && b.pct >= 15 && (played >= 8 || b.pct >= 20);
    if (!enough) return null;
    if (c && fin >= 15 && played >= 15 && c.pct >= 18 && a.pct - c.pct <= 12) { const t = TRIPLES[comboKey([a.k, b.k, c.k])]; if (t) return { key: comboKey([a.k, b.k, c.k]), triple: true, title: t[0], d: t[1], arch: [a, b, c] }; }
    const key = comboKey([a.k, b.k]), h = HYB[key];
    const [x, y] = key.split("+").map(AK);
    if (h) return { key, title: h[0], d: h[1], str: h[2], weak: h[3], exp: h[4], arch: [a, b], named: true };
    return { key, title: `The ${AX[x.k].adj} ${AX[y.k].noun}`, d: `${x.short} meets ${y.short}: you bring ${AX[x.k].trait} to ${AX[y.k].trait}.`, str: `${AX[x.k].str[0]}, and ${AX[y.k].str[0].toLowerCase()}`, weak: AX[y.k].weak[0], exp: `${AX[x.k].sugg[0]} with ${AX[y.k].sugg[0].toLowerCase()}`, arch: [a, b] };
  }
  const stageOf = fin => { let s = SOUL_STAGES[0], i = 0; SOUL_STAGES.forEach((x, j) => { if (fin >= x[0]) { s = x; i = j; } }); return { i, name: s[1], next: SOUL_STAGES[i + 1] || null }; };
  let soulCache = { sig: "", v: null };
  function soulData(){
    const sig = games.length + "|" + games.reduce((m, g) => Math.max(m, g.updatedAt || 0), 0) + "|" + JSON.stringify(soulStore.answers) + soulStore.sign;
    if (soulCache.sig === sig) return soulCache.v;
    const played = games.filter(g => !UNPLAYED.has(g.status)), fin = games.filter(g => g.status === "finished");
    const S = playerSoul();
    const D = played.length ? dnaFor(played) : { dna: [], score: {} };
    const stage = stageOf(fin.length);
    const q = { genres: played.length ? played.filter(g => (g.genres || []).length).length / played.length : 0, rated: played.length ? played.filter(g => g.rating).length / played.length : 0, hours: played.length ? played.filter(g => hrs(g) != null).length / played.length : 0 };
    const quality = (q.genres + q.rated + q.hours) / 3;
    const v = { S, played, fin, dna: D.dna, score: D.score, stage, q, quality: quality >= .7 ? "high" : quality >= .4 ? "medium" : "low", hyb: S ? hybridFor(D.dna, played.length, fin.length) : null };
    soulCache = { sig, v };
    try { trackDna(v); } catch (e) { console.warn(e); }
    return v;
  }
  // every change to your DNA is written down, with the game that caused it, so you can watch it shift game by game
  let dnaCause = null;
  function trackDna(V){
    if (!V.S) return;
    const now = Object.fromEntries(V.dna.map(x => [x.k, x.pct])), last = soulStore.lastDna;
    if (!last) { soulStore.lastDna = now; saveSoul(); return; }
    const delta = [...new Set([...Object.keys(now), ...Object.keys(last)])].map(k => [k, (now[k] || 0) - (last[k] || 0)]).filter(([, d]) => d).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    if (!delta.length) return;
    const fresh = dnaCause && Date.now() - dnaCause.t < 8000 ? dnaCause : null;
    const cause = fresh || (() => { const g = [...games].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0]; return g ? { id: g.id, title: g.title, why: "Updated" } : { id: "", title: "", why: "Synced" }; })();
    soulStore.dnaLog = [{ t: Date.now(), id: cause.id, title: cause.title, why: cause.why, d: Object.fromEntries(delta.slice(0, 4)), top: V.dna[0]?.k || "", was: Object.entries(last).sort((a, b) => b[1] - a[1])[0]?.[0] || "" }, ...(soulStore.dnaLog || [])].slice(0, 60);
    soulStore.lastDna = now; saveSoul(); dnaCause = null;
  }
  function soulPulse(prev, g){
    const wasP = prev && !UNPLAYED.has(prev.status), isP = !UNPLAYED.has(g.status);
    if (!wasP && !isP) return;
    const why = !wasP ? ({ finished: "Finished", playing: "Started", dropped: "Tried" }[g.status] || "Added") : !isP ? "Moved off your played list" : prev.status !== g.status ? ({ finished: "Finished", playing: "Back to", dropped: "Set aside" }[g.status] || "Moved") : (prev.rating || 0) !== (g.rating || 0) ? "Rated" : String(prev.dna || "") !== String(g.dna || "") ? "Retagged" : (prev.hours || 0) !== (g.hours || 0) ? "Played more of" : "Updated";
    dnaCause = { id: g.id, title: g.title, why, t: Date.now() };
    const before = (soulStore.dnaLog || [])[0]; soulData(); const e = (soulStore.dnaLog || [])[0];
    if (e && e !== before) {
      const parts = Object.entries(e.d).slice(0, 2).map(([k, v]) => `${AK(k).short} ${v > 0 ? "+" : ""}${v}%`);
      setTimeout(() => toast(e.top !== e.was && e.was ? `Your Gamer DNA has a new leader: ${AK(e.top).short}!` : `Gamer DNA updated: ${parts.join(", ")}`), 3300);
    }
  }
  // ---------- playstyle with evidence (A) ----------
  function spectra(V){
    const P = V.played, fin = P.filter(g => g.status === "finished").length, quit = P.filter(g => g.status === "dropped").length, playing = P.filter(g => g.status === "playing").length;
    const sc = k => V.score[k] || 0, tot = Object.values(V.score).reduce((s, v) => s + v, 0) || 1;
    const nk = ks => P.filter(g => ks.some(k => AK(k).t(g))).length;
    const share = (a, b) => { const A = a.reduce((s, k) => s + sc(k), 0), B = b.reduce((s, k) => s + sc(k), 0); return A + B ? Math.round(B / (A + B) * 100) : 50; };
    const years = P.map(g => +g.year).filter(Boolean), avgY = years.length ? years.reduce((s, y) => s + y, 0) / years.length : null, now = new Date().getFullYear();
    const rated = P.filter(g => g.rating), avgR = rated.length ? rated.reduce((s, g) => s + g.rating, 0) / rated.length : null;
    const devs = new Map(); P.forEach(g => (g.developer || "").split(", ").filter(Boolean).forEach(d => devs.set(d, (devs.get(d) || 0) + 1)));
    const withDev = P.filter(g => g.developer).length, repeat = withDev ? Math.round([...devs.values()].filter(n => n > 1).reduce((s, n) => s + n, 0) / withDev * 100) : 0;
    const storyN = nk(["story", "rpg", "puzzle", "cozy"]), actN = nk(["shooter", "speed", "souls", "rogue"]), relN = nk(["cozy", "builder", "puzzle", "story"]), hardN = nk(["souls", "rogue", "shooter", "strategy"]);
    const ans = soulStore.answers;
    return [
      { l: "Sampler", r: "Completionist", v: fin + quit ? Math.round(fin / (fin + quit + playing * .5) * 100) : 50, n: fin + quit + playing, need: 4, how: "Finished games versus dropped ones, with games in progress counting half.", ev: `${fin} finished, ${quit} dropped, ${playing} in progress` },
      { l: "Story", r: "Action", v: share(["story", "rpg", "puzzle", "cozy"], ["shooter", "speed", "souls", "rogue"]), n: storyN + actN, need: 4, how: "Weighted play in story, RPG, puzzle and cosy games versus shooters, racing, soulslikes and roguelikes.", ev: `${storyN} story-leaning, ${actN} action-leaning games` },
      { l: "Solo", r: "Social", v: ans.team === "solo" ? 10 : Math.min(100, Math.round(sc("social") / tot * 250) + (ans.team === "coop" || ans.team === "comp" ? 20 : 0)), n: P.length, need: 5, how: "How much of your play is co-op, MMO and multiplayer games, plus your answer about multiplayer if you gave one.", ev: `${nk(["social"])} social or co-op games${ans.team ? " · your answer counted" : ""}` },
      { l: "Relaxed", r: "Hardcore", v: share(["cozy", "builder", "puzzle", "story"], ["souls", "rogue", "shooter", "strategy"]), n: relN + hardN, need: 4, how: "Comfort genres versus demanding ones: soulslikes, roguelikes, shooters and strategy.", ev: `${relN} relaxing, ${hardN} demanding games` },
      { l: "Classic", r: "Cutting edge", v: avgY ? Math.max(0, Math.min(100, Math.round((avgY - 1990) / (now - 1990) * 100))) : 50, n: years.length, need: 3, how: "The average release year of games you've played.", ev: avgY ? `Average release year ${Math.round(avgY)} across ${years.length} games` : "No release years yet" },
      { l: "Loyal", r: "Adventurous", v: 100 - Math.min(100, repeat), n: withDev, need: 5, how: "How many of your games come from studios you've played more than once.", ev: withDev ? `${repeat}% of games from studios you return to` : "No studios yet" },
      { l: "Tough critic", r: "Generous", v: avgR ? Math.round((avgR - 1) / 4 * 100) : 50, n: rated.length, need: 4, how: "Your average star rating. Unrated games don't count.", ev: avgR ? `Average ${avgR.toFixed(1)} stars over ${rated.length} ratings` : "No ratings yet" }
    ].map(s => ({ ...s, ok: s.n >= s.need }));
  }
  // ---------- alignment (A + B) ----------
  function alignment(V){
    const P = V.played, gt = g => gtext(g);
    const coop = P.filter(g => RX.coop.test(gt(g))).length, comp = P.filter(g => RX.comp.test(gt(g))).length;
    const strat = P.filter(g => RX.strat.test(gt(g))).length, inst = P.filter(g => RX.inst.test(gt(g))).length;
    const a = soulStore.answers;
    let xe = coop + comp, x = xe ? comp / xe * 100 : 50;
    if (a.team === "coop") { x = xe ? x * .5 + 15 : 20; xe += 3; } else if (a.team === "comp") { x = xe ? x * .5 + 40 : 80; xe += 3; }
    let ye = strat + inst, y = ye ? strat / ye * 100 : 50;
    if (a.boss === "prep") { y = ye ? y * .6 + 32 : 78; ye += 3; } else if (a.boss === "try") { y = ye ? y * .6 + 8 : 22; ye += 3; } else if (a.boss === "mix") ye += 1;
    const ok = xe >= 3 && ye >= 3;
    const name = x < 50 ? (y >= 50 ? "The Mastermind" : "The Guardian") : (y >= 50 ? "The Warlord" : "The Wildcard");
    const DESC = { "The Guardian": "Cooperative and instinctive: supportive, spontaneous and team-first.", "The Mastermind": "Cooperative and strategic: preparation, coordination and teamwork.", "The Warlord": "Competitive and strategic: mastery, planning and calculated victories.", "The Wildcard": "Competitive and instinctive: improvisation, action and beautiful chaos." };
    const pick = (q, map) => a[q] && map[a[q]] != null ? map[a[q]] : null;
    const narr = P.length >= 5 ? Math.round(100 - (V.score.story || 0) / ((V.score.story || 0) + (V.score.shooter || 0) + (V.score.rogue || 0) + (V.score.puzzle || 0) + .0001) * 100) : null;
    const dims = [
      ["Empathetic", "Ruthless", pick("moral", { kind: 15, greater: 40, role: 50, win: 85 }), "moral"],
      ["Immersive", "Optimizing", pick("optimize", { feel: 15, some: 50, always: 88 }), "optimize"],
      ["Curious", "Goal-oriented", pick("explore", { every: 12, mix: 50, main: 85 }), "explore"],
      ["Experimental", "Mastery-focused", pick("boss", { try: 18, mix: 50, prep: 82 }), "boss"],
      ["Cautious", "Risk-taking", pick("risk", { safe: 15, mix: 50, push: 85 }), "risk"],
      ["Narrative-driven", "Mechanics-driven", pick("focus", { story: 15, both: 50, mech: 85 }) ?? narr, "focus"]
    ];
    return { x: Math.round(Math.max(4, Math.min(96, x))), y: Math.round(Math.max(4, Math.min(96, y))), ok, name, desc: DESC[name], ev: `${coop} co-op, ${comp} competitive, ${strat} strategic and ${inst} action-paced games${a.team || a.boss ? ", plus your answers" : ""}`, dims };
  }
  // ---------- emotions (B) ----------
  function emotions(V){
    const felt = V.played.filter(g => feelsOf(g).length);
    if (!felt.length) return { felt };
    const count = new Map(); felt.forEach(g => feelsOf(g).forEach(id => count.set(id, (count.get(id) || 0) + 1)));
    const top = val => [...count].filter(([id]) => FEEL.get(id).val === val).sort((a, b) => b[1] - a[1])[0];
    const groups = g => new Set(feelsOf(g).map(id => FEEL.get(id).g));
    const intense = felt.filter(g => g.feel.i).sort((a, b) => b.feel.i - a.feel.i || feelsOf(b).length - feelsOf(a).length).slice(0, 3);
    const byGroup = gk => felt.map(g => [g, feelsOf(g).filter(id => FEEL.get(id).g === gk).length]).filter(x => x[1]).sort((a, b) => b[1] - a[1] || (b[0].rating || 0) - (a[0].rating || 0)).slice(0, 3).map(x => x[0]);
    const range = [...felt].sort((a, b) => groups(b).size - groups(a).size)[0];
    const gc = new Map(); felt.forEach(g => groups(g).forEach(k => gc.set(k, (gc.get(k) || 0) + 1)));
    const byYear = new Map(); felt.forEach(g => { const y = (g.finished || "").slice(0, 4) || (lastPlayed(g) || "").slice(0, 4); if (!y) return; const m = byYear.get(y) || new Map(); groups(g).forEach(k => m.set(k, (m.get(k) || 0) + 1)); byYear.set(y, m); });
    const pairs = new Map(); felt.forEach(g => { const gs = [...groups(g)]; gs.forEach(a => gs.forEach(b => { if (a < b) { const k = a + "|" + b; pairs.set(k, (pairs.get(k) || 0) + 1); } })); });
    const surprising = [...pairs].filter(([k, n]) => { const [a, b] = k.split("|"); const va = FEELS.find(f => f[0] === a)[3], vb = FEELS.find(f => f[0] === b)[3]; return n >= 2 && va !== vb; }).sort((a, b) => b[1] - a[1])[0];
    const genreFeel = new Map(); felt.forEach(g => (g.genres || []).slice(0, 2).forEach(ge => { const m = genreFeel.get(ge) || new Map(); groups(g).forEach(k => m.set(k, (m.get(k) || 0) + 1)); genreFeel.set(ge, m); }));
    const insights = [];
    const lovedSad = felt.filter(g => g.rating >= 4.5 && groups(g).has("sad")).length, loved = felt.filter(g => g.rating >= 4.5).length;
    if (loved >= 3 && lovedSad / loved >= .5) insights.push(`Your most beloved games often leave you emotionally wrecked (${lovedSad} of your ${loved} top-rated felt games). Interesting choice.`);
    const sufferLove = felt.filter(g => g.rating >= 4 && groups(g).has("frust") && groups(g).has("wonder")).length;
    if (sufferLove >= 2) insights.push(`You seem to love games that make you suffer, as long as they reward you with an unforgettable world (${sufferLove} games felt both frustrating and wondrous, and you rated them highly).`);
    const cozyN = felt.filter(g => groups(g).has("joy")).length; if (cozyN >= 3 && cozyN / felt.length >= .6) insights.push(`Comfort is a theme: ${cozyN} of ${felt.length} games you described brought you joy or comfort.`);
    return { felt, count, pos: top("pos"), neg: top("neg"), tense: top("tense"), intense, comfort: byGroup("joy"), heartbreak: byGroup("sad"), range: range && groups(range).size >= 3 ? range : null, gc, byYear, surprising, genreFeel, insights };
  }
  // ---------- red and green flags (A + B, always with evidence) ----------
  function flags(V){
    const P = V.played, G = games, a = soulStore.answers, F = P.filter(g => g.status === "finished");
    const list = [];
    const add = (id, kind, title, text, ev, rarity = "common") => list.push({ id, kind, title, text, ev, rarity });
    const plats = G.filter(g => g.platinum).length;
    const souls = P.filter(g => RX.soulslike.test(gtext(g)) || AK("rogue").t(g));
    const wish = G.filter(g => g.status === "wishlist").length;
    if (a.side === "first") add("side", "red", "The Eternal Side-Quest Tourist", "The main story has been waiting for you since Tuesday.", "You told us you do every side quest first.");
    else { const long = F.filter(g => Number(g.length) && hrs(g) != null && hrs(g) >= Number(g.length) * 2); if (long.length >= 2) add("side", "red", "The Eternal Side-Quest Tourist", "The main story has been waiting for you since Tuesday.", `You spent at least twice the story length in ${long.length} games, like ${long[0].title}.`, "rare"); }
    if (a.hoard === "hoard") add("hoard", "red", "The Digital Hoarder", "You are saving those 47 healing potions for a final boss that may never come.", "You admitted it in the questions.");
    const restarts = G.reduce((s, g) => s + (Number(g.restarts) || 0), 0);
    if (a.restart === "often" || restarts >= 3) add("restart", "red", "The Restart Addict", "You've met the character creator more times than the final boss.", a.restart === "often" ? "You said you restart all the time." : `${restarts} restarts logged across your games.`);
    if (souls.length >= 3) add("suffer", "red", "The Voluntary Sufferer", "Apparently, dying 300 times is your idea of relaxation.", `${souls.length} soulslikes and roguelikes played, including ${souls.slice(0, 2).map(g => g.title).join(" and ")}.`, souls.length >= 6 ? "rare" : "common");
    if (plats >= 3) add("prisoner", "red", "The Achievement Prisoner", "You don't finish games. You negotiate their release.", `${plats} games marked as 100% achievements.`, "epic");
    if (wish >= 10 && wish > F.length) add("wishlist", "red", "The Backlog Collector", "Your wishlist is not a list. It's a long-term emotional commitment.", `${wish} games on your wishlist and ${F.length} finished.`);
    const seq = F.filter(g => ym(g.finished) && (g.genres || []).length).sort((x, y) => x.finished.localeCompare(y.finished));
    let best = { n: 0 }, cur = { n: 0 }; seq.forEach(g => { const ge = g.genres[0]; if (cur.ge === ge) cur.n++; else cur = { ge, n: 1 }; if (cur.n > best.n) best = { ...cur }; });
    if (best.n >= 5) add("loyal", "red", "The Genre Loyalist", `You finished ${best.n} ${best.ge} games in a row. Other genres would like to introduce themselves.`, `Based on your finish dates: ${best.n} ${best.ge} games back to back.`, "rare");
    const nights = G.reduce((s, g) => s + (g.sessions || []).filter(x => x.n).length, 0);
    if (nights >= 2) add("night", "red", "The Midnight Adventurer", "Sleep is temporary. One more quest is forever.", `${nights} timed sessions started between 11 p.m. and 5 a.m.`, "rare");
    const playingN = G.filter(g => g.status === "playing").length;
    if (playingN >= 5) add("juggler", "red", "The Save-File Juggler", "Five games 'in progress' is not multitasking. It's a lifestyle.", `${playingN} games marked as playing right now.`);
    // green flags
    const indie = P.filter(g => RX.indie.test(gtext(g)));
    if (indie.length >= 3) add("indie", "green", "Indie Champion", "You give small studios a chance, and they're lucky to have you.", `${indie.length} indie games played, like ${indie[0].title}.`, indie.length >= 10 ? "rare" : "common");
    const genreSet = new Set(P.flatMap(g => g.genres || [])); if (genreSet.size >= 8) add("genres", "green", "Genre Explorer", "You don't stay in one lane. New genres are new adventures.", `${genreSet.size} different genres in your played games.`, genreSet.size >= 15 ? "rare" : "common");
    const started = P.filter(g => g.status !== "playing").length; if (started >= 5 && F.length / started >= .6) add("finish", "green", "The Finisher", "You see things through. Credits roll for you more than for most.", `${Math.round(F.length / started * 100)}% of games you started and stopped, you finished.`);
    const social = P.filter(g => AK("social").t(g)); if (social.length >= 3) add("social", "green", "Adventure Sharer", "Your best gaming memories have other people in them.", `${social.length} co-op or multiplayer games played.`);
    const sdev = new Set(P.filter(g => AK("story").t(g)).map(g => g.developer).filter(Boolean)); if (sdev.size >= 3) add("narr", "green", "Story Connoisseur", "You seek out stories from many different voices.", `Narrative games from ${sdev.size} different studios.`);
    const back = F.filter(g => (g.sessions || []).some(s => g.finished && s.d > g.finished)); if (back.length) add("return", "green", "Comes Back Home", "You return to the games you love. They remember you too.", `You logged sessions after finishing ${back[0].title}${back.length > 1 ? ` and ${back.length - 1} more` : ""}.`, "rare");
    if (plats >= 1 || a.explore === "every") add("details", "green", "Detail Hunter", "Hidden details don't stay hidden around you.", plats ? `${plats} game${plats > 1 ? "s" : ""} completed to 100% achievements.` : "You said you explore every hidden cave.");
    const relax = P.filter(g => ["cozy", "puzzle"].some(k => AK(k).t(g))).length, hard = souls.length + P.filter(g => AK("shooter").t(g)).length;
    if (relax >= 2 && hard >= 2) add("balance", "green", "Balanced Player", "You know when to fight dragons and when to water crops.", `${relax} relaxing and ${hard} demanding games played.`);
    const crit = P.filter(g => g.rating && mcNum(g)); if (crit.length >= 6) { const d = crit.reduce((s, g) => s + Math.abs(g.rating * 20 - mcNum(g)), 0) / crit.length; if (d >= 10) add("critic", "green", "Independent Thinker", "You decide what's good, not the review score.", `Your ratings differ from Metacritic by ${Math.round(d)} points on average over ${crit.length} games.`, "rare"); }
    return list;
  }
  // ---------- comfort zone and nemesis (A, with minimum samples) ----------
  function habits(V){
    const P = V.played, m = new Map();
    P.forEach(g => (g.genres || []).forEach(ge => { const o = m.get(ge) || { ge, n: 0, f: 0, d: 0, r: 0, rn: 0 }; o.n++; if (g.status === "finished") o.f++; if (g.status === "dropped") o.d++; if (g.rating) { o.r += g.rating; o.rn++; } m.set(ge, o); }));
    const G = [...m.values()].filter(o => o.n >= 3);
    const score = o => (o.f / o.n) * 2 + (o.rn ? (o.r / o.rn) / 5 : .5) * 2 + Math.log2(o.n);
    const comfort = [...G].sort((a, b) => score(b) - score(a) || a.ge.localeCompare(b.ge))[0] || null;
    const bad = G.filter(o => o !== comfort && ((o.d / o.n >= .5) || (o.rn >= 3 && o.r / o.rn <= 2.5))).sort((a, b) => (b.d / b.n) - (a.d / a.n) || (a.rn ? a.r / a.rn : 5) - (b.rn ? b.r / b.rn : 5))[0] || null;
    const bestRated = G.filter(o => o.rn >= 3).sort((a, b) => b.r / b.rn - a.r / a.rn)[0] || null;
    const ser = new Map(); P.forEach(g => { if (g.series) ser.set(g.series, (ser.get(g.series) || 0) + 1); });
    const franchise = [...ser].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1])[0] || null;
    const wc = new Map(); P.forEach(g => worldsOf(g).forEach(k => wc.set(k, (wc.get(k) || 0) + 1)));
    const world = [...wc].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1])[0] || null;
    const QUIP = [[/role-playing|rpg/, "When the world gets overwhelming, you apparently need a sword, a giant map and 200 side quests."], [/shooter/, "Stressful day? Nothing a well-placed headshot can't fix."], [/horror/, "Somehow, being chased by monsters is how you relax."], [/puzzle/, "Your idea of unwinding is a really good brain-teaser."], [/strateg|tactic/, "Peace and quiet, and an empire to manage."], [/platform/, "A good jump, a tight landing and you're home."], [/simulat|life sim|farming/, "Crops, coffee and nowhere to be."], [/racing|sport/, "The finish line is your happy place."], [/adventure/, "Point you at a horizon and you're happy."]];
    const NQUIP = [[/strateg|real-time/, "You keep giving it another chance, but your armies keep disagreeing with your leadership."], [/horror/, "You keep turning the lights off, and it keeps not going well."], [/sport|racing/, "The finish line keeps moving away from you."], [/puzzle/, "The puzzles are winning. For now."], [/shooter/, "The enemy team sends its regards."]];
    const quip = (ge, Q, d) => (Q.find(([re]) => re.test(ge.toLowerCase())) || [0, d])[1];
    return { comfort, comfortQuip: comfort ? quip(comfort.ge, QUIP, `${comfort.ge} is where you feel at home.`) : "", nemesis: bad, nemesisQuip: bad ? quip(bad.ge, NQUIP, `${bad.ge} and you have a complicated relationship.`) : "", bestRated, franchise, world };
  }
  // ---------- backlog personality (A) ----------
  function backlogP(V){
    const G = games, back = G.filter(g => g.status === "backlog"), wish = G.filter(g => g.status === "wishlist"), fin = G.filter(g => g.status === "finished"), playing = G.filter(g => g.status === "playing");
    const started = G.filter(g => !UNPLAYED.has(g.status)).length, ratio = started ? fin.length / started : null;
    const today = new Date(todayISO()), ageD = g => g.added ? Math.max(0, Math.round((today - new Date(String(g.added).slice(0, 10))) / 864e5)) : null;
    const ages = back.map(ageD).filter(x => x != null), avgAge = ages.length ? Math.round(ages.reduce((s, x) => s + x, 0) / ages.length) : null;
    const longest = [...back].filter(g => ageD(g) != null).sort((a, b) => ageD(b) - ageD(a))[0] || null;
    const rescued = G.filter(g => exactDay(g.started) && g.added && (new Date(g.started) - new Date(String(g.added).slice(0, 10))) / 864e5 >= 30 && (today - new Date(g.started)) / 864e5 <= 120).slice(0, 4);
    const recent = new Map(); G.forEach(g => (g.sessions || []).forEach(s => { if ((today - new Date(s.d)) / 864e5 <= 30) recent.set(g.id, 1); }));
    const a = soulStore.answers;
    const evidence = started + back.length + wish.length;
    let p = null;
    if (evidence < 6) p = null;
    else if (a.restart === "often") p = ["The Serial Restarter", "You know the first hour of everything by heart."];
    else if (wish.length >= 20 && wish.length > fin.length) p = ["The Eternal Optimist", "An enormous wishlist and the firm belief you'll get to every one."];
    else if (back.length >= 10 && back.length > fin.length * 1.5) p = ["The Collector", "Your backlog grows faster than you can clear it, and that's half the fun."];
    else if (playing.length >= 4) p = ["The Impulsive Adventurer", "A new game shows up and suddenly you're playing that too."];
    else if (recent.size >= 3) p = ["The Mood Player", "You hop between games depending on how you feel that day."];
    else if (ratio != null && ratio >= .7 && playing.length <= 2) p = ["The Loyal Finisher", "You usually finish what you start before picking the next one."];
    else if (back.length && back.length <= 8 && avgAge != null && avgAge <= 180) p = ["The Strategist", "A tidy, short backlog that actually moves."];
    else p = ["The Mood Player", "No strict system. You play what feels right."];
    return { p, back, wish, ratio, avgAge, longest, longestAge: longest ? ageD(longest) : null, rescued, playing };
  }
  // ---------- soul achievements (A, retroactive, never duplicated) ----------
  const finOf = test => games.filter(g => g.status === "finished" && test(g));
  const nth = (list, n) => { const d = list.map(g => g.finished).filter(exactDay).sort(); return d.length >= n ? d[n - 1] : null; };
  const ACH = [
    ["first", "First Clear", "common", false, "Finish your first game.", () => { const l = finOf(() => true); return [l.length, 1, nth(l, 1)]; }],
    ["ten", "Ten Credits Rolled", "common", false, "Finish 10 games.", () => { const l = finOf(() => true); return [l.length, 10, nth(l, 10)]; }],
    ["critic", "Seasoned Critic", "common", false, "Rate 10 games.", () => [games.filter(g => g.rating).length, 10]],
    ["feels", "In My Feelings", "common", false, "Record feelings for 5 games.", () => [games.filter(g => feelsOf(g).length).length, 5]],
    ["stamp", "First Stamp", "common", false, "Get your first World Passport stamp.", () => [new Set(games.filter(g => !UNPLAYED.has(g.status)).flatMap(worldsOf)).size, 1]],
    ["legend", "Hall of Fame Curator", "common", false, "Nominate a game to your Hall of Legends.", () => [games.filter(g => g.awards && Object.keys(g.awards).length).length, 1]],
    ["tarnished", "The Tarnished", "rare", false, "Finish 5 soulslike games.", () => { const l = finOf(g => RX.soulslike.test(gtext(g))); return [l.length, 5, nth(l, 5)]; }],
    ["decades", "The Time Traveler", "rare", false, "Finish games released in 5 different decades.", () => [new Set(finOf(g => g.year).map(g => Math.floor(g.year / 10))).size, 5]],
    ["series", "Loyal to the End", "rare", false, "Finish 2 or more games in the same series.", () => { const m = new Map(); finOf(g => g.series).forEach(g => m.set(g.series, (m.get(g.series) || 0) + 1)); return [Math.max(0, ...m.values()), 2]; }],
    ["long", "The Long Haul", "rare", false, "Play a single game for 100 hours.", () => [Math.max(0, ...games.map(g => hrs(g) || 0)), 100]],
    ["fear", "Fear Has No Power", "epic", false, "Finish 10 horror games.", () => { const l = finOf(g => RX.horror.test(gtext(g))); return [l.length, 10, nth(l, 10)]; }],
    ["royalty", "Achievement Royalty", "epic", false, "Mark 5 games as 100% achievements.", () => [games.filter(g => g.platinum).length, 5]],
    ["carto", "The Cartographer", "epic", false, "Finish 15 open-world games.", () => { const l = finOf(g => RX.open.test(gtext(g))); return [l.length, 15, nth(l, 15)]; }],
    ["damage", "Emotional Damage", "epic", false, "Mark 10 games as Heartbroken or Devastated.", () => [games.filter(g => feelsOf(g).some(f => f === "heartbroken" || f === "devastated")).length, 10]],
    ["chameleon", "Genre Chameleon", "epic", false, "Finish games across 12 different genres.", () => [new Set(finOf(() => true).flatMap(g => g.genres || [])).size, 12]],
    ["indie", "The Indie Champion", "epic", false, "Finish 25 indie games.", () => { const l = finOf(g => RX.indie.test(gtext(g))); return [l.length, 25, nth(l, 25)]; }],
    ["worlds", "The Collector of Worlds", "epic", false, "Explore 12 different World Passport regions.", () => [new Set(games.filter(g => !UNPLAYED.has(g.status)).flatMap(worldsOf)).size, 12]],
    ["renaissance", "The Renaissance Gamer", "epic", false, "Finish a strategy, RPG, action, puzzle, simulation and adventure game.", () => { const s = new Set(); finOf(() => true).forEach(g => Object.entries(fam(g)).forEach(([k, v]) => v && s.add(k))); return [s.size, 6]; }],
    ["endless", "The Endless Journey", "legendary", false, "Finish 100 games.", () => { const l = finOf(() => true); return [l.length, 100, nth(l, 100)]; }],
    ["thousand", "A Thousand Hours", "legendary", false, "Log 1,000 hours in total.", () => [Math.round(games.reduce((s, g) => s + (hrs(g) || 0), 0)), 1000]],
    ["patient", "The Patient Gamer", "rare", true, "Finish a game that waited in your library for over three years.", () => { const l = finOf(g => g.added && exactDay(g.finished) && (new Date(g.finished) - new Date(String(g.added).slice(0, 10))) / 864e5 >= 1095); return [l.length, 1, nth(l, 1)]; }],
    ["second", "A Second Chance", "rare", true, "Finish a game you once dropped.", () => { const l = finOf(g => g.wasDropped); return [l.length, 1, nth(l, 1)]; }],
    ["owl", "The Night Owl", "rare", true, "Time a session that starts between 11 p.m. and 5 a.m.", () => [games.reduce((s, g) => s + (g.sessions || []).filter(x => x.n).length, 0), 1]],
    ["sprint", "The Sprinter", "rare", true, "Start and finish a game within 3 days (exact dates).", () => { const l = finOf(g => exactDay(g.started) && exactDay(g.finished) && (new Date(g.finished) - new Date(g.started)) / 864e5 <= 2); return [l.length, 1, nth(l, 1)]; }],
    ["marathon", "The Marathon", "epic", true, "Finish a game more than a year after starting it.", () => { const l = finOf(g => exactDay(g.started) && exactDay(g.finished) && (new Date(g.finished) - new Date(g.started)) / 864e5 > 365); return [l.length, 1, nth(l, 1)]; }]
  ];
  // checks every achievement, records first-unlock dates once; returns the full list with state
  function soulAchievements(announce){
    const out = [], fresh = [];
    ACH.forEach(([id, name, tier, secret, desc, test]) => {
      const [have, need, when] = test(); const done = have >= need;
      if (done && !soulStore.ach[id]) { soulStore.ach[id] = when || todayISO(); fresh.push(name); }
      out.push({ id, name, tier, secret, desc, have: Math.min(have, need), need, done: !!soulStore.ach[id], date: soulStore.ach[id] || "" });
    });
    if (fresh.length) { saveSoul(); if (announce) toast(`Gamer's Soul achievement: ${fresh[0]}${fresh.length > 1 ? ` (+${fresh.length - 1} more)` : ""}`); }
    return out;
  }
  // ---------- skill tree (A: finished games with a strong match only) ----------
  function skillTree(){
    return SKILLS.map(([k, name, titles]) => {
      const A = AK(k), done = games.filter(g => g.status === "finished" && A.t(g) >= .6);
      const tier = SKILL_AT.filter(n => done.length >= n).length;
      const secret = done.some(g => g.rating >= 5);
      return { k, name, titles, n: done.length, tier, next: SKILL_AT[tier] || null, c: A.c, g: A.g, secret, top: done.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0] };
    });
  }
  // ---------- eras and identity timeline (A: only games with finish dates) ----------
  function eras(){
    const dated = games.filter(g => g.status === "finished" && ym(g.finished));
    if (dated.length < 6) return { eras: [], years: [], dated };
    const half = g => { const y = g.finished.slice(0, 4), m = +g.finished.slice(5, 7); return `${y}-${m <= 6 ? "H1" : "H2"}`; };
    const buckets = new Map(); dated.forEach(g => { const k = half(g); if (!buckets.has(k)) buckets.set(k, []); buckets.get(k).push(g); });
    const keys = [...buckets.keys()].sort(), list = [];
    keys.forEach(k => { const gs = buckets.get(k); if (gs.length < 3) return; const D = dnaFor(gs).dna; if (!D.length) return; const [ek, en, ec] = ERA_OF[D[0].k];
      const last = list[list.length - 1];
      if (last && last.ek === ek) { last.to = k; last.games.push(...gs); last.dna = dnaFor(last.games).dna; }
      else list.push({ ek, name: en, c: ec, from: k, to: k, games: [...gs], dna: D }); });
    list.forEach(e => { e.hours = e.games.reduce((s, g) => s + (hrs(g) || 0), 0); const gc = new Map(); e.games.forEach(g => (g.genres || []).slice(0, 2).forEach(x => gc.set(x, (gc.get(x) || 0) + 1))); e.genres = [...gc].sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
      const fc = new Map(); e.games.forEach(g => feelsOf(g).forEach(f => fc.set(f, (fc.get(f) || 0) + 1))); e.feels = [...fc].sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => FEEL.get(x[0]).n);
      e.defining = [...e.games].sort((a, b) => (b.rating || 0) - (a.rating || 0) || (hrs(b) || 0) - (hrs(a) || 0)).slice(0, 3); });
    // most dramatic change: biggest swing in archetype mix between neighbouring eras
    let drama = null;
    for (let i = 1; i < list.length; i++) { const A = Object.fromEntries(list[i - 1].dna.map(x => [x.k, x.pct])), B = Object.fromEntries(list[i].dna.map(x => [x.k, x.pct]));
      const diff = ARCH.reduce((s, a) => s + Math.abs((A[a.k] || 0) - (B[a.k] || 0)), 0) / 2; if (!drama || diff > drama.diff) drama = { diff, a: list[i - 1], b: list[i] }; }
    const yb = new Map(); dated.forEach(g => { const y = g.finished.slice(0, 4); if (!yb.has(y)) yb.set(y, []); yb.get(y).push(g); });
    const years = [...yb].sort((a, b) => a[0].localeCompare(b[0])).filter(([, gs]) => gs.length >= 3).map(([y, gs]) => { const D = dnaFor(gs).dna; const h = hybridFor(D, gs.length, gs.length); return { y, top: D[0], hyb: h && gs.length >= 5 ? h : null, n: gs.length }; });
    return { eras: list, drama: drama && drama.diff >= 25 ? drama : null, years, dated };
  }
  const halfLabel = k => { const [y, h] = k.split("-"); return `${h === "H1" ? "Early" : "Late"} ${y}`; };
  // ---------- world passport ----------
  function passport(){
    const P = games.filter(g => !UNPLAYED.has(g.status));
    const regions = WORLDS.map(([k, n, gl, c]) => { const gs = P.filter(g => worldsOf(g).includes(k)); const f = gs.filter(g => g.status === "finished");
      const fav = [...gs].filter(g => g.rating).sort((a, b) => b.rating - a.rating)[0] || null;
      return { k, n, gl, c, gs, f, fav, hours: gs.reduce((s, g) => s + (hrs(g) || 0), 0), stamp: gs.length > 0 }; });
    const seen = regions.filter(r => r.stamp).length;
    const ms = [["Realm Wanderer", "Explore 5 world types", seen, 5], ["Dimensional Traveler", "Explore 10 world types", seen, 10], ["The Eternal Voyager", "Explore all 16 world types", seen, 16],
      ["Kingdom Collector", "Finish 10 fantasy-world games", regions[0].f.length, 10], ["The Last Survivor", "Finish 10 post-apocalyptic games", regions[2].f.length, 10]];
    return { regions, seen, ms, untagged: P.filter(g => !worldsOf(g).length).length };
  }
  // ---------- inner NPC (C) ----------
  function innerNPC(V){
    if (!V.dna.length || V.played.length < 3) return null;
    const pct = Object.fromEntries(V.dna.map(x => [x.k, x.pct]));
    let best = null; NPCS.forEach((n, i) => { const s = n[2].reduce((t, k) => t + (pct[k] || 0), 0) + (n[2][0] === V.dna[0].k ? 15 : 0); if (!best || s > best.s) best = { s, n, i }; });
    return best.n;
  }
  // ---------- extra discoveries (A) ----------
  function discoveries(V){
    const P = V.played, out = [], total = games.reduce((s, g) => s + (hrs(g) || 0), 0);
    const big = [...games].filter(g => hrs(g)).sort((a, b) => hrs(b) - hrs(a))[0];
    if (big && total >= 50 && hrs(big) / total >= .25) out.push(["obsession", "The One-Game Obsession", `${big.title} has taken ${Math.round(hrs(big) / total * 100)}% of all your logged hours.`]);
    const stale = games.filter(g => g.status === "playing" && lastPlayed(g)).sort((a, b) => lastPlayed(a).localeCompare(lastPlayed(b)))[0];
    if (stale) { const d = Math.round((new Date(todayISO()) - new Date(lastPlayed(stale))) / 864e5); if (d >= 30) out.push(["forgotten", "The Forgotten Worlds", `${stale.title} is still 'playing', but you last visited ${d} days ago. It misses you.`]); }
    const ser = new Map(); P.forEach(g => { if (g.series) ser.set(g.series, (ser.get(g.series) || 0) + (hrs(g) || 1)); }); const fr = [...ser].sort((a, b) => b[1] - a[1])[0];
    if (fr && P.filter(g => g.series === fr[0]).length >= 2) out.push(["franchise", "The Franchise Loyalist", `${fr[0]} has earned the most of your attention: ${P.filter(g => g.series === fr[0]).length} games.`]);
    const ys = P.map(g => +g.year).filter(Boolean); if (ys.length >= 5) { const old = ys.filter(y => y < 2010).length / ys.length; out.push(["time", "The Gaming Time Traveler", old >= .4 ? `${Math.round(old * 100)}% of your games came out before 2010. A true classic keeper.` : `${Math.round((1 - old) * 100)}% of your games are from 2010 or later. You live on the cutting edge.`]); }
    const crit = P.filter(g => g.rating && mcNum(g)); const gems = crit.filter(g => g.rating * 20 - mcNum(g) >= 15); if (crit.length >= 5) out.push(["gems", "The Hidden Gem Hunter", gems.length ? `You loved ${gems.length} games far more than critics did, like ${gems[0].title}.` : "You mostly agree with critics. No hidden gems spotted yet."]);
    const E = emotions(V); if (E.range) out.push(["coaster", "The Emotional Roller Coaster", `${E.range.title} made you feel ${new Set(feelsOf(E.range).map(id => FEEL.get(id).g)).size} different kinds of feelings.`]);
    const dg = new Map(); P.filter(g => g.status === "dropped").forEach(g => (g.genres || []).slice(0, 1).forEach(x => dg.set(x, (dg.get(x) || 0) + 1))); const grave = [...dg].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1])[0];
    if (grave) out.push(["grave", "The Genre Graveyard", `You've dropped ${grave[1]} ${grave[0]} games. It keeps calling, you keep hanging up.`]);
    const rep = games.filter(g => g.status === "finished" && (g.sessions || []).some(s => g.finished && s.d > g.finished)); if (rep.length) out.push(["replay", "The Comfort Replay", `You came back to ${rep[0].title} after finishing it.`]);
    return out;
  }
  // ---------- hall of legends suggestions (A + B) ----------
  function legendSuggest(cat){
    const P = games.filter(g => !UNPLAYED.has(g.status)), has = (g, ids) => feelsOf(g).some(f => ids.includes(f));
    const by = (list, f) => [...list].sort((a, b) => f(b) - f(a))[0] || null;
    const S = {
      goat: () => by(P.filter(g => g.rating >= 4.5), g => g.rating * 10 + Math.log(1 + (hrs(g) || 0))),
      changed: () => by(P.filter(g => has(g, ["inspired", "moved", "transported"])), g => g.rating || 0),
      beauty: () => by(P.filter(g => has(g, ["awestruck", "enchanted", "mesmerized"])), g => g.rating || 0),
      story: () => by(P.filter(g => AK("story").t(g) || AK("rpg").t(g)), g => (g.rating || 0) * 10 + (hrs(g) || 0) / 10),
      hardest: () => by(P.filter(g => g.status === "finished" && (RX.soulslike.test(gtext(g)) || has(g, ["resilient", "determined", "frustrated"]))), g => hrs(g) || 0),
      heart: () => by(P.filter(g => has(g, ["heartbroken", "devastated", "melancholic"])), g => g.rating || 0),
      comfort: () => by(P.filter(g => has(g, ["cozy", "comforted", "peaceful"]) || AK("cozy").t(g)), g => (g.sessions || []).length + (g.rating || 0)),
      surprise: () => by(P.filter(g => g.rating && mcNum(g)), g => g.rating * 20 - mcNum(g)),
      memory: () => by(P.filter(g => g.rating >= 4), g => (hrs(g) || 0)),
      again: () => by(P.filter(g => g.status === "finished" && g.rating >= 4.5), g => feelsOf(g).length)
    };
    return S[cat] ? S[cat]() : null;
  }
  // ---------- monthly snapshot of identity (for future history; never back-filled) ----------
  function snapshot(V){
    if (!V.dna.length) return; const m = todayISO().slice(0, 7); const last = soulStore.snaps[soulStore.snaps.length - 1];
    const snap = { m, top: V.dna[0].k, hyb: V.hyb?.title || "", dna: Object.fromEntries(V.dna.slice(0, 7).map(x => [x.k, x.pct])) };
    if (last && last.m === m) soulStore.snaps[soulStore.snaps.length - 1] = snap; else soulStore.snaps.push(snap);
    if (soulStore.snaps.length > 60) soulStore.snaps.shift(); saveSoul();
  }
  // ---------- soulmate: opt-in soul code (no notes, no private data) ----------
  function soulCode(V){
    const sp = spectra(V).map(s => s.ok ? s.v : null), E = emotions(V);
    const fav = games.filter(g => g.rating >= 4.5).map(g => g.title).slice(0, 25), ser = [...new Set(games.map(g => g.series).filter(Boolean))].slice(0, 25);
    const data = { v: 1, dna: Object.fromEntries(V.dna.slice(0, 8).map(x => [x.k, x.pct])), sp, fav, ser, feel: E.count ? [...E.count].sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0]) : [] };
    return "SOUL1." + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  }
  function readSoulCode(code){ try { const s = String(code || "").trim(); if (!s.startsWith("SOUL1.")) return null; const d = JSON.parse(decodeURIComponent(escape(atob(s.slice(6))))); return d && d.v === 1 && d.dna ? d : null; } catch { return null; } }
  function compare(V, other){
    const mine = Object.fromEntries(V.dna.map(x => [x.k, x.pct])), keys = ARCH.map(a => a.k);
    const dot = keys.reduce((s, k) => s + (mine[k] || 0) * (other.dna[k] || 0), 0), na = Math.sqrt(keys.reduce((s, k) => s + (mine[k] || 0) ** 2, 0)), nb = Math.sqrt(keys.reduce((s, k) => s + (other.dna[k] || 0) ** 2, 0));
    const dnaSim = na && nb ? dot / na / nb : 0;
    const sp = spectra(V); const pairs = sp.map((s, i) => [s, other.sp?.[i]]).filter(([s, o]) => s.ok && o != null);
    const spSim = pairs.length ? 1 - pairs.reduce((t, [s, o]) => t + Math.abs(s.v - o), 0) / pairs.length / 100 : null;
    const myFav = new Set(games.filter(g => g.rating >= 4.5).map(g => g.title.toLowerCase())), shared = (other.fav || []).filter(t => myFav.has(String(t).toLowerCase()));
    const mySer = new Set(games.map(g => g.series).filter(Boolean)), sharedSer = (other.ser || []).filter(s => mySer.has(s));
    const story = sp[1], storyOpp = story.ok && other.sp?.[1] != null && Math.abs(story.v - other.sp[1]) >= 50;
    const score = Math.round((dnaSim * .6 + (spSim ?? dnaSim) * .4) * 100);
    const id = score >= 80 ? ["Mirror Souls", "You might be the same player in two bodies. Fight over the controller accordingly."]
      : storyOpp ? ["Rivals by Destiny", "One of you plays for the story. The other skips every cutscene."]
      : score >= 60 ? ["The Perfect Co-op Duo", "Close enough to agree on what to play, different enough to cover each other's blind spots."]
      : shared.length >= 2 ? ["The Chaotic Alliance", `Your tastes are wildly different, but somehow you both love ${shared.length} of the same games.`]
      : ["Complementary Opposites", "You'd introduce each other to games neither of you would ever pick alone."];
    return { score, dnaSim: Math.round(dnaSim * 100), spSim: spSim == null ? null : Math.round(spSim * 100), shared, sharedSer, id, other };
  }
