  // ================= public profile page (supabase/public.sql) =================
  // Opt-in: a read-only page anyone with the link can open, even without the app: shelves, this year and the Gamer's Soul.
  const PUBLIC_SQL_URL = "supabase/public.sql", PUB_SLUG = (new URLSearchParams(location.search).get("p") || "").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
  const pubURL = slug => `${location.origin}${location.pathname}?p=${encodeURIComponent(slug)}`;
  const pubData = () => ({ ...shareSnapshot(), name: fr.me?.name || "", handle: fr.me?.handle || "" });
  async function pubPush(){
    const c = sync.client, u = sync.user; if (!c || !u || !fr.me || !settings.pubOn) return false;
    const { error } = await c.from("sp_public").upsert({ user_id: u.id, slug: fr.me.handle, data: pubData(), updated_at: new Date().toISOString() });
    settings.pubErr = error ? (frMissing(error) || /sp_public/i.test(error.message || "") ? "missing" : error.message) : ""; applySettings(); return !error;
  }
  async function pubOff(){ const c = sync.client, u = sync.user; if (!c || !u) return; await c.from("sp_public").delete().eq("user_id", u.id); }
  function openPublic(){
    const draw = () => {
      const signed = sync.user && fr.me, on = !!settings.pubOn, url = fr.me ? pubURL(fr.me.handle) : "";
      return `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="pub-t"><div class="reshead"><div><span class="px">Share</span><h2 id="pub-t">Public profile</h2></div><button class="btn small" type="button" data-mclose>Done</button></div>
        <p style="margin-top:0">A page anyone can open with the link, even without Save Point: your shelves, your ratings, this year's wrap-up and your Gamer's Soul. Never your notes or sessions.</p>
        ${!signed ? `<p class="note">Sign in with Sync and pick a gamer tag in the Friends tab first; your page uses your tag as its address.</p>`
        : settings.pubErr === "missing" ? `<div class="frsetup2"><p class="note">One small table is needed in Supabase first.</p><div class="chips"><button class="btn small" type="button" data-pubsql>Copy the setup</button><a class="btn small" href="https://supabase.com/dashboard/project/${esc(sync.ref)}/sql/new" target="_blank" rel="noopener">Open the SQL editor ↗</a><button class="btn small primary" type="button" data-pubon>Check again</button></div></div>`
        : `<div class="srow"><div class="sl"><b>${on ? "Your page is public" : "Your page is off"}</b><small>${on ? "It updates when your shelves change" : "Nobody can see it"}</small></div><div class="sc"><button class="btn small${on ? "" : " primary"}" type="button" ${on ? "data-puboff" : "data-pubon"}>${on ? "Turn off" : "Make it public"}</button></div></div>
          ${on ? `<div class="urlbox"><span>${esc(url)}</span><button class="btn small" type="button" data-copy="${esc(url)}" data-pubcopy>Copy link</button></div><div class="chips" style="margin-top:8px"><a class="btn small" href="${esc(url)}" target="_blank" rel="noopener">Open my page ↗</a></div>` : ""}
          ${settings.pubErr && settings.pubErr !== "missing" ? `<p class="note">Couldn't update it: ${esc(settings.pubErr)}</p>` : ""}`}
        <div class="srow"><div class="sl"><b>Share image</b><small>For Instagram, Discord or anywhere: your soul, stats and favourite games</small></div><div class="sc"><button class="btn small primary" type="button" data-pubimg>Save image</button></div></div></div>`; };
    openModal(draw(), async e => {
      if (e.target.closest("[data-pubsql]")) { fetch(PUBLIC_SQL_URL).then(r => r.text()).then(x => copyText(x, "Setup copied. Paste it into the SQL editor and press Run.")); return; }
      if (e.target.closest("[data-pubon]")) { settings.pubOn = true; applySettings(); const ok = await pubPush(); if (!ok && settings.pubErr !== "missing") settings.pubOn = false; applySettings(); $("#scrim").innerHTML = draw(); if (ok) toast("Your page is public. Copy the link to share it."); return; }
      if (e.target.closest("[data-puboff]")) { settings.pubOn = false; applySettings(); await pubOff(); $("#scrim").innerHTML = draw(); toast("Your page is off and its data was removed."); return; }
      if (e.target.closest("[data-pubcopy]")) { copyText(e.target.closest("[data-pubcopy]").dataset.copy, "Link copied"); return; }
      if (e.target.closest("[data-pubimg]")) { const b = e.target.closest("button"); b.disabled = true; b.textContent = "Making it…"; await shareImage(fr.me ? pubData() : { ...shareSnapshot(), name: "", handle: "" }); b.disabled = false; b.textContent = "Save image"; return; }
    });
  }
  // a 1080 x 1350 card (Instagram portrait): name, soul, stats, this year and favourite covers
  async function shareImage(d){
    d = cleanFriend(d) && { ...cleanFriend(d), name: String(d.name || "").slice(0, 40), handle: String(d.handle || "").slice(0, 20) };
    const W = 1080, H = 1350, cv = document.createElement("canvas"); cv.width = W; cv.height = H; const x = cv.getContext("2d");
    const S = friendStats(d), Y = new Date().getFullYear(), finY = (d.games || []).filter(g => g.s === "finished" && (g.f || "").startsWith(String(Y)));
    const favs = (d.games || []).filter(g => g.r && g.s !== "wishlist").sort((a, b) => b.r - a.r || (b.h || 0) - (a.h || 0)).slice(0, 8);
    const load = g => new Promise(res => { const u = g.c || (g.a ? steamCover(g.a) : ""); if (!u) return res(null); const im = new Image(); im.crossOrigin = "anonymous"; im.referrerPolicy = "no-referrer"; im.onload = () => res(im); im.onerror = () => res(null); im.src = u; setTimeout(() => res(null), 6000); });
    const imgs = await Promise.all(favs.map(load));
    const paint = withArt => {
      const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#1B1446"); gr.addColorStop(1, "#3A1C5C"); x.fillStyle = gr; x.fillRect(0, 0, W, H);
      const sr = recRng("stars" + (d.handle || "")); for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(255,255,255,${(.08 + sr() * .3).toFixed(2)})`; x.fillRect(Math.round(sr() * W), Math.round(sr() * 560), 3, 3); }
      // the Health Bar Heart
      const px = 6, hx = 80, hy = 70, heart = ["..XXXX...XXXX..", ".XXXXXX.XXXXXX.", "XXXXXXXXXXXXXXX", "XXXXXXXXXXXXXXX", "XXXXXXXXXXXXXXX", ".XXXXXXXXXXXXX.", "..XXXXXXXXXXX..", "...XXXXXXXXX...", "....XXXXXXX....", ".....XXXXX.....", "......XXX......", ".......X......."];
      heart.forEach((r, j) => [...r].forEach((c, i) => { if (c === "X") { x.fillStyle = i < 7 ? "#FF5C8A" : "#3B3456"; x.fillRect(hx + i * px, hy + j * px, px, px); } }));
      x.fillStyle = "#3B3456"; x.fillRect(hx, hy + 84, 90, 10); x.fillStyle = "#3BFF8A"; x.fillRect(hx, hy + 84, 54, 10);
      x.fillStyle = "#fff"; x.font = "900 64px system-ui,sans-serif"; x.fillText(d.name || (d.handle ? "@" + d.handle : "My Save Point"), 210, 120);
      x.fillStyle = "#C9C0EA"; x.font = "600 30px system-ui,sans-serif"; x.fillText(d.handle ? `@${d.handle} · Save Point` : "Save Point", 212, 166);
      if (d.soul?.title) { x.fillStyle = "#FFD27A"; x.font = "800 40px system-ui,sans-serif"; x.fillText(d.soul.title, 80, 270); }
      const dna = (d.soul?.dna || []).filter(([k]) => Object.hasOwn(AIDX, k)); let dx = 80; const tot = dna.reduce((a, [, v]) => a + v, 0) || 1;
      dna.forEach(([k, v]) => { const w = 920 * v / tot; x.fillStyle = AK(k).c; x.fillRect(dx, 296, Math.max(2, w - 4), 22); dx += w; });
      x.font = "600 24px system-ui,sans-serif"; dna.slice(0, 3).forEach(([k, v], i) => { x.fillStyle = "#E1DBF7"; x.fillText(`${AK(k).short} ${v}%`, 80 + i * 310, 352); });
      [["games", S.n], ["finished", S.fin], ["hours", S.h.toLocaleString()], [`finished in ${Y}`, finY.length]].forEach(([l, v], i) => { const bx = 80 + i * 235; x.fillStyle = "rgba(255,255,255,.08)"; x.fillRect(bx, 400, 215, 130); x.fillStyle = "#fff"; x.font = "900 52px system-ui,sans-serif"; x.fillText(String(v), bx + 20, 470); x.fillStyle = "#C9C0EA"; x.font = "600 22px system-ui,sans-serif"; x.fillText(l, bx + 20, 508); });
      x.fillStyle = "#fff"; x.font = "800 34px system-ui,sans-serif"; x.fillText("Favourite games", 80, 600);
      favs.forEach((g, i) => { const cw = 215, ch = 300, cx2 = 80 + (i % 4) * 235, cy = 630 + Math.floor(i / 4) * 330; const im = withArt && imgs[i];
        x.fillStyle = `hsl(${hashNum(g.t, 360)},35%,32%)`; x.fillRect(cx2, cy, cw, ch);
        if (im) { const r = Math.max(cw / im.width, ch / im.height), iw = im.width * r, ih = im.height * r; x.save(); x.beginPath(); x.rect(cx2, cy, cw, ch); x.clip(); x.drawImage(im, cx2 + (cw - iw) / 2, cy + (ch - ih) / 2, iw, ih); x.restore(); }
        else { x.fillStyle = "#fff"; x.font = "800 24px system-ui,sans-serif"; String(g.t).split(/\s+/).reduce((ls, w) => { const l = ls[ls.length - 1]; if ((l + " " + w).trim().length > 14) ls.push(w); else ls[ls.length - 1] = (l + " " + w).trim(); return ls; }, [""]).slice(0, 4).forEach((l, k) => x.fillText(l, cx2 + 14, cy + 40 + k * 30)); }
        x.fillStyle = "rgba(0,0,0,.6)"; x.fillRect(cx2, cy + ch - 34, cw, 34); x.fillStyle = "#FFD27A"; x.font = "700 22px system-ui,sans-serif"; x.fillText("★".repeat(Math.round(g.r)), cx2 + 10, cy + ch - 10); });
      x.fillStyle = "#9B8FC0"; x.font = "600 24px system-ui,sans-serif"; x.fillText(d.handle ? pubURL(d.handle).replace(/^https?:\/\//, "") : "Save Point", 80, H - 50);
    };
    paint(true);
    const blob = await new Promise(res => { try { cv.toBlob(b => res(b), "image/png"); } catch { res(null); } }) || (paint(false), await new Promise(res => cv.toBlob(b => res(b), "image/png")));
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `save-point-${d.handle || "profile"}.png`; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast("Image saved to your downloads");
  }
  // the page visitors see at ?p=yourtag
  async function renderPublicPage(){
    let host = document.getElementById("pubview"); if (!host) { host = document.createElement("div"); host.id = "pubview"; document.body.append(host); }
    host.innerHTML = `<div class="pubwrap"><p class="note">Loading @${esc(PUB_SLUG)}…</p></div>`;
    let row = null;
    try { const c = window.supabase.createClient(sync.cfg.url, sync.cfg.key, { auth: { persistSession: false, autoRefreshToken: false, storageKey: "sp-public-view" } });
      const r = await c.from("sp_public").select("slug,data,updated_at").eq("slug", PUB_SLUG).maybeSingle(); row = r.data; } catch {}
    if (!row) { host.innerHTML = `<div class="pubwrap"><h1>Not found</h1><p>No public Save Point page for @${esc(PUB_SLUG)}.</p><a class="btn primary" href="${esc(location.pathname)}">Open Save Point</a></div>`; return; }
    const d = cleanFriend(row.data), name = String(row.data.name || "").slice(0, 40), Y = new Date().getFullYear(), S = friendStats(d);
    document.title = `${name || "@" + PUB_SLUG} · Save Point`;
    const G = (d.games || []).map((g, i) => ({ id: "fr" + i, title: g.t, status: g.s, platform: g.p, rating: g.r, hours: g.h, finished: g.f, year: g.y, genres: g.g || [], steamAppId: g.a, coverPick: g.c, logoPick: g.l, wikidata: g.w, friend: true }));
    const by = st => G.filter(g => g.status === st), finY = G.filter(g => g.status === "finished" && (g.finished || "").startsWith(String(Y))).sort((a, b) => (b.finished || "").localeCompare(a.finished || ""));
    const goty = finY.filter(g => g.rating).sort((a, b) => b.rating - a.rating)[0];
    const shelf = (nm, list, col) => list.length ? `<div class="frshelf" style="--sc:${col}"><div class="frsh"><b>${esc(nm)}</b><span>${list.length}</span></div><div class="spines">${list.slice(0, 120).map(spine).join("")}</div></div>` : "";
    const dna = (d.soul?.dna || []).filter(([k]) => Object.hasOwn(AIDX, k));
    host.innerHTML = `<div class="pubwrap">
      <header class="pubhead"><div><span class="px">Save Point</span><h1>${esc(name || "@" + PUB_SLUG)}</h1><p>@${esc(PUB_SLUG)}${row.updated_at ? ` · updated ${esc(relDay(row.updated_at.slice(0, 10)))}` : ""}</p></div>
        <div class="pubkpis"><div><b>${S.n}</b><span>games</span></div><div><b>${S.fin}</b><span>finished</span></div><div><b>${S.h.toLocaleString()}</b><span>hours</span></div></div></header>
      ${d.soul?.title ? `<section class="pubcard"><span class="px">Gamer's Soul</span><h2>${esc(d.soul.title)}</h2>${d.soul.rank ? `<p class="note">${esc(d.soul.rank)}</p>` : ""}<div class="strand">${dna.map(([k, v]) => `<span style="flex:${v};--c:${AK(k).c}" title="${esc(AK(k).short)} ${v}%"></span>`).join("")}</div><div class="frdna">${dna.map(([k, v]) => `<span style="--c:${AK(k).c}"><i>${AK(k).g}</i>${esc(AK(k).short)} ${v}%</span>`).join("")}</div></section>` : ""}
      <section class="pubcard"><span class="px">${Y} so far</span><h2>${finY.length} game${finY.length === 1 ? "" : "s"} finished</h2>${goty ? `<p>Game of the year so far: <b>${esc(goty.title)}</b> ${stars(goty.rating)}</p>` : ""}
        ${finY.length ? `<div class="pubcovers">${finY.slice(0, 12).map(g => `<div title="${esc(g.title)}">${boxHTML(g)}<small>${esc(fmtDate(g.finished))}</small></div>`).join("")}</div>` : ""}</section>
      <section class="pubcard"><span class="px">Shelves</span><div class="frrack">${shelf("Playing", by("playing"), "#F08A4B")}${shelf("Finished", by("finished").sort((a, b) => (b.finished || "").localeCompare(a.finished || "")), "#5BC08A")}${shelf("Backlog", by("backlog"), "#7A8CFF")}${(d.nook?.shelves || []).map(sh => shelf(sh.n, sh.i.map(i => G[i]).filter(Boolean), sh.c || "#B07CF0")).join("")}</div></section>
      <footer class="pubfoot"><button class="btn" type="button" id="pub-img">Save as image</button><a class="btn primary" href="${esc(location.pathname)}">Make your own Save Point</a></footer></div>`;
    host.querySelector("#pub-img").onclick = () => shareImage({ ...row.data, handle: PUB_SLUG });
  }
  if (PUB_SLUG) { document.documentElement.classList.add("pubmode"); addEventListener("load", () => setTimeout(renderPublicPage, 50)); }
  const friendStats = d => { const G = d?.games || [], fin = G.filter(g => g.s === "finished"); return { n: G.filter(g => g.s !== "wishlist").length, fin: fin.length, h: Math.round(G.reduce((s, g) => s + (g.h || 0), 0)), playing: G.filter(g => g.s === "playing") }; };
  function friendsHTML(noLoad){
    const u = sync.user;
    if (!noLoad && u && (fr.st === "idle" || fr.st === "signedout" || (fr.st === "ready" && Date.now() - fr.at > 60000))) setTimeout(() => friendsLoad(), 0);
    const head = (sub) => `<div class="yzh"><i aria-hidden="true">♥</i><div><h2 id="yh-friends">Friends</h2><p>${sub}</p></div></div>`;
    let body;
    if (!u) body = `${head("See what your friends are playing and compare shelves.")}<div class="frempty"><p>Sign in to sync first. Friends use the same account.</p><button class="btn primary small" type="button" data-frsignin>Sign in</button></div>`;
    else if (fr.st === "setup") body = `${head("One-time setup needed.")}<div class="frsetup"><p>Friends needs three small tables in your Supabase project. It doesn't touch your games or Book Nook.</p>
      <ol class="steps"><li><button class="btn small" type="button" data-frsql>Copy the friends setup</button></li><li><a class="btn small" href="https://supabase.com/dashboard/project/${esc(sync.ref)}/sql/new" target="_blank" rel="noopener">Open the Supabase SQL editor ↗</a></li><li>Paste it and press <b>Run</b>.</li><li><button class="btn primary small" type="button" data-frretry>Check again</button></li></ol></div>`;
    else if (fr.st === "error") body = `${head("Couldn't reach your friends list.")}<div class="frempty"><p class="note">${esc(fr.err || "Something went wrong.")}</p><button class="btn small" type="button" data-frretry>Try again</button></div>`;
    else if (fr.st !== "ready") body = `${head("Loading…")}<div class="frempty"><span class="dots">Looking up your friends</span></div>`;
    else if (!fr.me) body = `${head("Pick a gamer tag so friends can find you.")}<form class="frjoin" id="fr-join"><label class="field"><span class="px">Gamer tag</span><input id="fr-handle" maxlength="20" placeholder="e.g. pixel_knight" autocomplete="off" spellcheck="false"></label><label class="field"><span class="px">Display name</span><input id="fr-name" maxlength="40" placeholder="What friends see"></label><button class="btn primary" type="submit">Create my tag</button></form>
      <p class="note">3 to 20 lowercase letters, numbers or _. Friends see your shelves, ratings, hours and Gamer's Soul summary. Never your notes or session details.</p>${fr.msg ? `<p class="note frmsg">${esc(fr.msg)}</p>` : ""}`;
    else {
      const me = u.id, inc = fr.rels.filter(r => r.status === "pending" && r.addressee === me), out = fr.rels.filter(r => r.status === "pending" && r.requester === me), acc = fr.rels.filter(r => r.status === "accepted");
      const P = id => fr.profiles[id] || { handle: "unknown", name: "" };
      const ids = acc.map(r => r.requester === me ? r.addressee : r.requester);
      // newest activity first, so the friends who just played something sit on top
      const lastAct = id => { const G = fr.shelves[id]?.data?.games || []; return G.reduce((m, g) => { const d = g.s === "playing" ? (g.lp || g.st || "") : g.f || ""; return d > m ? d : m; }, ""); };
      const unreadOf = id => (fr.notes || []).filter(n => n.sender === id && n.recipient === me && !n.read).length;
      const row = id => { const p = P(id), d = fr.shelves[id]?.data, S = friendStats(d), B = BUDDIES[p.buddy], tm = d ? tasteMatch(d) : null, un = unreadOf(id);
        const line = !d ? "Hasn't shared shelves yet" : S.playing.length ? `Playing ${S.playing.slice(0, 2).map(g => g.t).join(", ")}` : `${S.n} games · ${S.fin} finished`;
        return `<button type="button" class="frli" data-frview="${esc(id)}" ${d ? "" : "disabled"}><span class="fav" style="--c:${B?.c || "#5B8DEF"}">${B ? `<span class="fig">${buddySVG(p.buddy, "happy")}</span>` : esc((p.name || p.handle)[0]?.toUpperCase() || "?")}</span>
          <span class="frlim"><b>${esc(p.name || p.handle)}${tm ? ` <span class="tmatch">${tm.pct}%</span>` : ""}</b><small>@${esc(p.handle)}${d?.soul?.title ? ` · ${esc(d.soul.title)}` : ""}</small><small class="frline">${esc(line)}</small></span>
          ${un ? `<i class="frun" aria-label="${un} new messages">${un}</i>` : ""}<i class="frgo" aria-hidden="true">›</i></button>`; };
      const ev = ids.length ? activityEvents(ids) : [], unreadAll = ids.reduce((a, id) => a + unreadOf(id), 0), recent = ev.filter(e => Date.now() - new Date(e.d) < 7 * 864e5).length;
      const T = ["list", "activity", "chats"].includes(fr.tab) ? fr.tab : "list";
      const tabs = `<div class="seg frtabs" role="tablist">${[["list", `Friends <small>${ids.length}</small>`], ["activity", `Activity${recent ? ` <small>${recent}</small>` : ""}`], ["chats", `Chats${unreadAll ? ` <small class="hot">${unreadAll}</small>` : ""}`]].map(([k, n]) => `<button type="button" role="tab" data-frtab="${k}" aria-selected="${T === k}" aria-pressed="${T === k}">${n}</button>`).join("")}</div>`;
      const pane = !ids.length ? `<p class="note">No friends yet. Tap ＋ Add friend and type their gamer tag. They'll see your request when they open Save Point.</p>`
        : T === "activity" ? activityPane(ev) : T === "chats" ? notesBlock() || `<p class="note">Chats need the messages setup. Open the bell to set it up.</p>`
        : `<div class="frlist2">${[...ids].sort((a, b) => lastAct(b).localeCompare(lastAct(a))).map(row).join("")}</div>`;
      body = `${head(`You're <b>@${esc(fr.me.handle)}</b>`)}
        <div class="frtop"><button class="btn small${fr.addOpen ? "" : " primary"}" type="button" data-fraddopen aria-expanded="${!!fr.addOpen}">＋ Add friend</button><button class="btn small" type="button" data-frcopy>Copy my tag</button></div>
        ${fr.addOpen ? `<form class="fradd" id="fr-add"><input id="fr-find" maxlength="21" placeholder="Their gamer tag" autocomplete="off" spellcheck="false" aria-label="Friend's gamer tag"><button class="btn primary small" type="submit"${fr.sending ? " disabled" : ""}>Send request</button></form>` : ""}${fr.msg ? `<p class="note frmsg">${esc(fr.msg)}</p>` : ""}
        ${inc.length ? `<div class="frreq"><span class="px">Friend requests</span>${inc.map(r => `<div class="frrow"><b>${esc(P(r.requester).name || P(r.requester).handle)}</b><small>@${esc(P(r.requester).handle)}</small><button class="btn small primary" type="button" data-fraccept="${esc(r.requester)}">Accept</button><button class="btn small" type="button" data-frremove="${esc(r.requester)}">Decline</button></div>`).join("")}</div>` : ""}
        ${ids.length ? tabs : ""}${pane}
        ${out.length ? `<p class="note">Waiting for: ${out.map(r => `@${esc(P(r.addressee).handle)} <button class="linkbtn" type="button" data-frremove="${esc(r.addressee)}">cancel</button>`).join(", ")}</p>` : ""}`;
    }
    return `<section class="yzone z-friends" id="y-friends" aria-labelledby="yh-friends">${body}</section>`;
  }

  function notesBlock(){
    if (fr.notesSt === "missing") return `<div class="frnotes frsetup2"><span class="px">New: recommend games to each other</span><p class="note">Send friends recommendations, "skip this one" warnings, ask how a game was and cheer their finishes. It needs one more small table in Supabase.</p>
      <div class="chips"><button class="btn small" type="button" data-notesql>Copy the setup</button><a class="btn small" href="https://supabase.com/dashboard/project/${esc(sync.ref)}/sql/new" target="_blank" rel="noopener">Open the SQL editor ↗</a><button class="btn small primary" type="button" data-frretry>Check again</button></div></div>`;
    if (fr.notesSt !== "ok") return "";
    // conversations, newest first; tapping one opens it in the notifications panel
    const T = ncThreads().slice(0, 8), me = sync.user.id;
    return `<div class="frnotes"><div class="reshead"><span class="px">Conversations</span><button class="linkbtn" type="button" data-ncopenall>All notifications</button></div>${T.length ? T.map(t => `<button type="button" class="ncrow ncthread frconv${t.unread ? " unread" : ""}" data-ncthread="${esc(t.key)}">${avatar(t.other)}${gameThumb(t.game)}<div class="nct"><b>${esc(whoName(t.other))} <span class="ncg">· ${esc(t.game?.t || "")}</span></b><small>${esc(t.last.kind === "react" ? (t.last.sender === me ? "You" : whoName(t.other)) + " reacted " + t.last.body : msgLine(t.last, t.last.sender === me))}</small></div><span class="nctime">${esc(relDay(t.last.created_at.slice(0, 10)))}</span>${t.unread ? `<i class="ncdot"></i>` : ""}</button>`).join("") : `<p class="note">Nothing yet. Open a friend's shelves and tap a game to recommend it, ask how it was, or chat about it.</p>`}</div>`;
  }
  function replyForm(n){
    const mine = games.find(g => norm(g.title) === norm(n.game.t)), r0 = mine?.rating || 0, fe0 = mine ? feelsOf(mine).slice(0, 4) : [];
    const top = FEELS.flatMap(([, , , , , list]) => list.slice(0, 2)).map(fid).filter(id => FEEL.has(id)).slice(0, 14);
    return `<form class="nreply" data-replyto="${esc(n.id)}"><div class="nrow"><span class="px">Your rating</span><div class="nstars">${[1, 2, 3, 4, 5].map(v => `<button type="button" data-rstar="${v}" aria-pressed="${r0 >= v}">★</button>`).join("")}</div></div>
      <div class="nrow"><span class="px">How it felt</span><div class="fchips pick">${[...new Set([...fe0, ...top])].map(id => { const f = FEEL.get(id); return `<button type="button" class="fchip" data-rfeel="${id}" aria-pressed="${fe0.includes(id)}" style="--fc:${f.c}">${esc(f.n)}</button>`; }).join("")}</div></div>
      <textarea rows="2" maxlength="500" placeholder="A few words: would you play it again?"></textarea><div class="nact"><button class="btn small" type="button" data-replycancel>Cancel</button><button class="btn small primary" type="submit">Send</button></div></form>`;
  }
  async function markNotesRead(ids){ const c = sync.client; if (!c || !ids.length) return; await c.from("sp_notes").update({ read: true }).in("id", ids); fr.notes.forEach(n => { if (ids.includes(n.id)) n.read = true; }); frPollAt = 0; frPoll(true); }
  // what your friends have been up to, from what they share
  function activityEvents(ids){
    const now = Date.now(), ev = [];
    ids.forEach(id => { const d = fr.shelves[id]?.data, p = fr.profiles[id]; if (!d || !p) return;
      (d.games || []).forEach((g, i) => {
        if (g.s === "finished" && g.f && g.f.length === 10 && now - new Date(g.f) < 60 * 864e5) ev.push({ id, p, g, i, k: "fin", d: g.f });
        else if (g.s === "playing" && (g.lp || g.st) && now - new Date(g.lp || g.st) < 30 * 864e5) ev.push({ id, p, g, i, k: "play", d: g.lp || g.st });
      }); });
    return ev.sort((a, b) => b.d.localeCompare(a.d));
  }
  // the bell keeps a short version: the latest few, one line each
  function activityBlock(ids){
    const ev = activityEvents(ids); if (!ev.length) return "";
    return `<div class="frfeed"><span class="px">What your friends are playing</span>${ev.slice(0, 6).map(e => `<div class="frev"><span class="ni">${e.k === "fin" ? "🏁" : "🎮"}</span><p><b>${esc(e.p.name || "@" + e.p.handle)}</b> ${e.k === "fin" ? "finished" : "is playing"} <button class="linkbtn" type="button" data-frgame="${esc(e.id)}:${e.i}">${esc(e.g.t)}</button> <small>${relDay(e.d)}</small></p></div>`).join("")}</div>`;
  }
  // the Activity tab: grouped by day, then by friend, so six finishes in one evening are one tidy row
  function activityPane(ev){
    if (!ev.length) return `<p class="note">Nothing new from your friends in the last few weeks.</p>`;
    const f = ["all", "fin", "play"].includes(fr.actF) ? fr.actF : "all", who = fr.actWho || "";
    const L = ev.filter(e => (f === "all" || e.k === f) && (!who || e.id === who));
    const cheered = new Set(fr.notes.filter(n => n.kind === "cheer" && n.sender === sync.user.id).map(n => n.recipient + "|" + norm(n.game.t)));
    const people = [...new Map(ev.map(e => [e.id, e.p])).entries()];
    const chips = `<div class="fractf"><div class="seg">${[["all", "All"], ["fin", "🏁 Finished"], ["play", "🎮 Playing"]].map(([k, n]) => `<button type="button" data-fractf="${k}" aria-pressed="${f === k}">${n}</button>`).join("")}</div>
      ${people.length > 1 ? `<select data-fractwho aria-label="Whose activity"><option value="">Everyone</option>${people.map(([id, p]) => `<option value="${esc(id)}"${who === id ? " selected" : ""}>${esc(p.name || "@" + p.handle)}</option>`).join("")}</select>` : ""}</div>`;
    const day = d => { const t = todayISO(), y = isoOf(new Date(Date.now() - 864e5)); return d === t ? "Today" : d === y ? "Yesterday" : relDay(d); };
    const groups = []; L.forEach(e => { const k = e.d.slice(0, 10) + "|" + e.id + "|" + e.k, last = groups[groups.length - 1]; if (last && last.key === k) last.items.push(e); else groups.push({ key: k, d: e.d.slice(0, 10), e, items: [e] }); });
    const shown = groups.slice(0, fr.actMore ? 60 : 12);
    let lastDay = "", h = "";
    shown.forEach(gp => {
      const dd = day(gp.d); if (dd !== lastDay) { h += `<div class="fradate">${esc(dd)}</div>`; lastDay = dd; }
      const p = gp.e.p, B = BUDDIES[p.buddy], n = gp.items.length, fin = gp.e.k === "fin";
      h += `<div class="frag"><span class="fav sm" style="--c:${B?.c || "#5B8DEF"}">${B ? `<span class="fig">${buddySVG(p.buddy, "happy")}</span>` : esc((p.name || p.handle)[0]?.toUpperCase() || "?")}</span>
        <div class="fragm"><p><b>${esc(p.name || "@" + p.handle)}</b> ${fin ? "finished" : n > 1 ? "is playing" : "is playing"} ${n > 1 ? `<b>${n} games</b>` : `<button class="linkbtn" type="button" data-frgame="${esc(gp.e.id)}:${gp.e.i}">${esc(gp.e.g.t)}</button>${fin && gp.e.g.r ? ` <span class="stars">${stars(gp.e.g.r)}</span>` : ""}`}</p>
        <div class="fragc">${gp.items.slice(0, 8).map(e => { const c = cheered.has(e.id + "|" + norm(e.g.t)); return `<button type="button" class="fragg" data-frgame="${esc(e.id)}:${e.i}" title="${esc(e.g.t)}${e.g.r ? " · " + starText(e.g.r) : ""}">${boxHTML({ title: e.g.t, coverUrl: e.g.c, steamAppId: e.g.a, platforms: [e.g.p].filter(Boolean) })}${fin && c ? `<i class="fragok" aria-label="Cheered">🎉</i>` : ""}</button>`; }).join("")}${n > 8 ? `<span class="fragmore">+${n - 8}</span>` : ""}</div></div>
        ${fin && n === 1 && !cheered.has(gp.e.id + "|" + norm(gp.e.g.t)) ? `<button class="btn small" type="button" data-frcheer="${esc(gp.e.id)}:${gp.e.i}" aria-label="Cheer">🎉</button>` : ""}</div>`;
    });
    return chips + `<div class="fract2">${h || `<p class="note">Nothing matches.</p>`}</div>${groups.length > shown.length ? `<button class="btn small" type="button" data-fractmore>Show more</button>` : ""}<p class="note">Tap a game to see their rating and dates, cheer a finish, or chat about it.</p>`;
  }
  // one of a friend's games, up close: their rating, feelings, dates and what you can do with it
  function friendGame(fid2, i){
    const p = fr.profiles[fid2], d = fr.shelves[fid2]?.data, g = d?.games?.[+i]; if (!p || !g) return;
    const mine = games.find(x => norm(x.title) === norm(g.t)), who = esc(p.name || "@" + p.handle), cov = g.c || (g.a ? steamCover(g.a) : "");
    const dates = [g.st && `Started ${fmtDate(g.st)}`, g.f && `Finished ${fmtDate(g.f)}`, g.lp && g.s === "playing" && `Last played ${relDay(g.lp)}`].filter(Boolean).join(" · ");
    const asked = fr.notes.some(n => n.kind === "ask" && n.recipient === fid2 && norm(n.game.t) === norm(g.t));
    const box = document.querySelector(".frgame-pop"); if (box) box.remove();
    const el = document.createElement("div"); el.className = "frgame-pop"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", g.t);
    el.innerHTML = `<div class="fgp-in">${cov ? `<img src="${esc(cov)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}<div class="fgp-tx"><span class="px">${who}'s ${esc((STATUS[g.s] || "").toLowerCase())}</span><h3>${esc(g.t)}</h3>
      ${g.r ? `<div class="stars big">${stars(g.r)}</div>` : `<small class="note">${g.s === "finished" || g.s === "dropped" ? "Not rated" : ""}</small>`}
      ${g.fe?.length ? `<div class="fchips">${feelChips(g.fe)}</div>` : ""}
      <p class="note">${[dates, g.h ? fmtH(g.h) + " played" : "", g.p].filter(Boolean).map(esc).join(" · ")}</p>
      ${mine ? `<p class="note">You: ${esc(STATUS[mine.status] || "")}${mine.rating ? " · " + stars(mine.rating) : ""}</p>` : ""}
      <div class="nact">${mine ? (UNPLAYED.has(mine.status) || mine.status === "wishlist" ? `<button class="btn small primary" type="button" data-fgmark="${esc(mine.id)}">✓ I've played it</button>` : "") : `${g.s === "finished" || g.s === "dropped" || g.s === "playing" ? `<button class="btn small primary" type="button" data-fgadd="finished">✓ I've played it</button>` : ""}<button class="btn small${g.s === "finished" || g.s === "dropped" || g.s === "playing" ? "" : " primary"}" type="button" data-fgadd="backlog">+ Backlog</button><button class="btn small" type="button" data-fgadd="wishlist">♥ Wishlist</button>`}
        ${g.s !== "wishlist" && g.s !== "backlog" ? (asked ? `<small class="note">You asked how it was</small>` : `<button class="btn small" type="button" data-fgask>❓ Ask how it was</button>`) : ""}
        ${g.s === "finished" ? `<button class="btn small" type="button" data-fgcheer>🎉 Cheer</button>` : ""}<button class="btn small" type="button" data-fgchat>💬 Chat about it</button><button class="btn small" type="button" data-fgx>Close</button></div></div></div>`;
    el.addEventListener("click", async e => {
      if (e.target === el || e.target.closest("[data-fgx]")) { el.remove(); return; }
      const ad = e.target.closest("[data-fgadd]"); if (ad) { addFromDiscover({ title: g.t, wikidata: g.w, steamAppId: g.a, coverUrl: g.c, year: g.y }, ad.dataset.fgadd); frAdded(g.t, ad.dataset.fgadd); el.remove(); return; }
      const mk = e.target.closest("[data-fgmark]"); if (mk) { const m = games.find(x => x.id === mk.dataset.fgmark); if (m) { saveGame({ ...m, status: "finished", progress: 100 }, `Moved ${m.title} to Finished`); frAdded(m.title, "finished"); } el.remove(); return; }
      if (e.target.closest("[data-fgask]")) { const b = e.target.closest("button"); b.disabled = true; if (await sendNote(fid2, "ask", noteGame(g))) { toast(`Asked ${p.name || "@" + p.handle} how ${g.t} was`); el.remove(); } else b.disabled = false; return; }
      if (e.target.closest("[data-fgchat]")) { el.remove(); closeModal(); ncStart(fid2, g); return; }
      if (e.target.closest("[data-fgcheer]")) { const b = e.target.closest("button"); b.disabled = true; if (await sendNote(fid2, "cheer", noteGame(g))) { toast("Cheer sent 🎉"); el.remove(); } else b.disabled = false; return; }
    });
    document.body.append(el);
  }
  let frAdded = () => {};
  // recommend one of your games to a friend, or tell them to skip it
  function openRecommend(fid2){
    const p = fr.profiles[fid2]; if (!p) return;
    let kind = "rec", q = "", pick = null;
    const el = document.createElement("div"); el.className = "frgame-pop";
    const draw = () => {
      const list = games.filter(g => !UNPLAYED.has(g.status) && (!q || norm(g.title).includes(norm(q)))).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 30);
      el.innerHTML = `<div class="fgp-in rec"><div class="fgp-tx"><span class="px">To ${esc(p.name || "@" + p.handle)}</span><h3>Send a game</h3>
        <div class="seg">${[["rec", "🎮 Recommend it"], ["skip", "🙅 Tell them to skip it"]].map(([k, n]) => `<button type="button" data-rk="${k}" aria-pressed="${kind === k}">${n}</button>`).join("")}</div>
        <input class="recq" placeholder="Search your games" value="${esc(q)}" aria-label="Search your games">
        <div class="recl">${list.map(g => `<button type="button" class="recg${pick === g.id ? " on" : ""}" data-rg="${esc(g.id)}"><b>${esc(g.title)}</b><small>${g.rating ? stars(g.rating) : esc(STATUS[g.status])}</small></button>`).join("") || `<p class="note">No played games match.</p>`}</div>
        <textarea rows="2" maxlength="500" placeholder="${kind === "rec" ? "Why they'd love it" : "Why it's not worth it"}"></textarea>
        <div class="nact"><button class="btn small" type="button" data-fgx>Cancel</button><button class="btn small primary" type="button" data-rsend ${pick ? "" : "disabled"}>Send</button></div></div></div>`;
    };
    el.addEventListener("click", async e => {
      if (e.target === el || e.target.closest("[data-fgx]")) { el.remove(); return; }
      const k = e.target.closest("[data-rk]"); if (k) { kind = k.dataset.rk; const t = el.querySelector("textarea").value; draw(); el.querySelector("textarea").value = t; return; }
      const g = e.target.closest("[data-rg]"); if (g) { pick = g.dataset.rg; const t = el.querySelector("textarea").value; draw(); el.querySelector("textarea").value = t; return; }
      if (e.target.closest("[data-rsend]")) { const gm = games.find(x => x.id === pick); if (!gm) return; const b = e.target.closest("button"); b.disabled = true;
        const body = el.querySelector("textarea").value.trim(), payload = { ...noteGame(gm), r: gm.rating || 0, fe: feelsOf(gm).slice(0, 4) };
        if (await sendNote(fid2, kind, payload, body)) { toast(kind === "rec" ? `Recommended ${gm.title}` : `Told them to skip ${gm.title}`); el.remove(); } else b.disabled = false; }
    });
    el.addEventListener("input", e => { if (e.target.classList.contains("recq")) { q = e.target.value; const t = el.querySelector("textarea").value; draw(); const i = el.querySelector(".recq"); i.focus(); i.setSelectionRange(q.length, q.length); el.querySelector("textarea").value = t; } });
    draw(); document.body.append(el);
  }
  // ---------- friend alerts: requests and new friends show up wherever you are ----------
  let frPollAt = 0;
  async function frPoll(force){
    const c = sync.client, u = sync.user; if (!c || !u || (!force && (document.hidden || Date.now() - frPollAt < 45000))) return;
    frPollAt = Date.now();
    try {
      const r = await c.from("sp_friends").select("requester,addressee,status"); if (r.error) return;
      const inc = r.data.filter(x => x.status === "pending" && x.addressee === u.id), acc = r.data.filter(x => x.status === "accepted" && x.requester === u.id);
      let unread = [];
      try { const nr = await c.from("sp_notes").select("id,sender,kind,game,body,created_at").eq("recipient", u.id).eq("read", false).order("created_at", { ascending: false }).limit(20); if (!nr.error) unread = nr.data || []; } catch {}
      frBadge(inc.length + unread.length);
      const seenN = new Set(settings.frSeenN || []), freshN = unread.filter(n => !seenN.has(n.id));
      if (freshN.length) { freshN.forEach(n => seenN.add(n.id)); settings.frSeenN = [...seenN].slice(-300); applySettings();
        const psn = await c.from("sp_profiles").select("user_id,handle,name").in("user_id", [...new Set(freshN.map(n => n.sender))]); const PN = new Map((psn.data || []).map(p => [p.user_id, p]));
        frPop(freshN.map(n => ({ k: "n", id: n.sender, n: { ...n, game: cleanNoteGame(n.game) }, p: PN.get(n.sender) || { handle: "friend", name: "" } }))); if (tab === "friends") friendsLoad(true); }
      // first run: friends you already have don't need a "new friend" alert
      if (!settings.frSeen) { settings.frSeen = acc.map(x => "a:" + x.addressee); applySettings(); }
      const seen = new Set(settings.frSeen || []), fresh = [...inc.map(x => ["i", x.requester]), ...acc.map(x => ["a", x.addressee])].filter(([k, id]) => !seen.has(k + ":" + id));
      if (!fresh.length) return;
      const ps = await c.from("sp_profiles").select("user_id,handle,name").in("user_id", fresh.map(x => x[1])); const P = new Map((ps.data || []).map(p => [p.user_id, p]));
      fresh.forEach(([k, id]) => seen.add(k + ":" + id)); settings.frSeen = [...seen].slice(-300); applySettings();
      frPop(fresh.map(([k, id]) => ({ k, id, p: P.get(id) || { handle: "someone", name: "" } })));
      if (tab === "friends") friendsLoad(true);
    } catch {}
  }
  function frBadge(n){
    try { ncBadge(); } catch {}
    document.querySelectorAll('[data-nav=friends], #tab-friends').forEach(b => { let i = b.querySelector(".nbadge"); if (!n) { i?.remove(); return; } if (!i) { i = document.createElement("i"); i.className = "nbadge"; b.append(i); } i.textContent = n > 9 ? "9+" : n; i.setAttribute("aria-label", `${n} friend request${n === 1 ? "" : "s"}`); });
  }
  function frPop(list){
    document.querySelector(".frpop")?.remove();
    const el = document.createElement("div"); el.className = "frpop"; el.setAttribute("role", "alert");
    el.innerHTML = `<div class="frpop-in"><span class="frpop-ic" aria-hidden="true">${list[0].k === "n" ? NOTE_KIND[list[0].n.kind]?.[0] || "♥" : "♥"}</span><div class="frpop-tx">${list.slice(0, 3).map(x => x.k === "n"
        ? `<p><b>${esc(x.p.name || "@" + x.p.handle)}</b> ${esc(NOTE_KIND[x.n.kind]?.[1] || "sent you")} <b>${esc(x.n.game.t)}</b>${x.n.body ? `: “${esc(x.n.body.slice(0, 90))}”` : ""}</p><div class="frpop-act"><button class="btn small primary" type="button" data-popnote="${esc(x.id + "|" + norm(x.n.game.t || ""))}">Open</button></div>`
        : x.k === "i"
        ? `<p><b>${esc(x.p.name || "@" + x.p.handle)}</b> <small>@${esc(x.p.handle)}</small> wants to be friends!</p><div class="frpop-act"><button class="btn small primary" type="button" data-popaccept="${esc(x.id)}">Accept</button><button class="btn small" type="button" data-popview>See requests</button></div>`
        : `<p><b>${esc(x.p.name || "@" + x.p.handle)}</b> accepted your friend request. You can see each other's shelves now.</p><div class="frpop-act"><button class="btn small primary" type="button" data-popview>View friends</button></div>`).join("")}${list.length > 3 ? `<p class="note">and ${list.length - 3} more</p>` : ""}</div><button class="frpop-x" type="button" aria-label="Close">×</button></div>`;
    el.addEventListener("click", async e => {
      if (e.target.closest(".frpop-x")) { el.remove(); return; }
      const pn = e.target.closest("[data-popnote]"); if (pn) { el.remove(); ncOpen(pn.dataset.popnote); return; }
      if (e.target.closest("[data-popview]")) { el.remove(); showTab("friends"); window.scrollTo({ top: 0, behavior: "auto" }); friendsLoad(true); return; }
      const a = e.target.closest("[data-popaccept]"); if (a) { a.disabled = true; const c = sync.client, u = sync.user;
        const { error } = await c.from("sp_friends").update({ status: "accepted" }).match({ requester: a.dataset.popaccept, addressee: u.id });
        toast(error ? "Couldn't accept that right now. Try from the Friends tab." : "Friend added! ♥"); el.remove(); frPollAt = 0; frPoll(true); friendsLoad(true); }
    });
    document.body.append(el); try { navigator.vibrate?.(60); } catch {}
    setTimeout(() => el.isConnected && el.classList.add("out"), 20000); setTimeout(() => el.remove(), 20600);
  }
  setInterval(() => frPoll(), 60000); setTimeout(() => frPoll(true), 5000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { frPoll(); checkUpdate(); } });

  // ---------- a newer Save Point is out: reload by itself when nothing is open ----------
  let updAt = 0;
  async function checkUpdate(){
    if (!location.protocol.startsWith("http") || Date.now() - updAt < 10 * 60000) return; updAt = Date.now();
    try { const t = await fetch(`index.html?v=${Date.now()}`, { cache: "no-store" }).then(r => r.ok ? r.text() : ""); const v = (t.match(/data-ver="([^"]+)"/) || [])[1];
      if (v && v !== document.documentElement.dataset.ver) { if (!root.innerHTML && !document.querySelector(".tour,.frpop,.scrim:not(#scrim)")) location.reload(); else toast(`Save Point ${v} is ready. Reload to get it.`); } } catch {}
  }
  setTimeout(checkUpdate, 15000);
  async function frAct(fn, okMsg){ fr.sending = true; fr.lastErr = ""; repaintFriends(); try { const { error } = await fn(); if (error) throw error; fr.msg = okMsg || ""; await friendsLoad(true); } catch (e) { fr.lastErr = e?.message || ""; fr.msg = /duplicate|unique/i.test(fr.lastErr) ? "That's already done." : `Couldn't do that: ${fr.lastErr || "unknown problem"}`; } finally { fr.sending = false; repaintFriends(); } }
  document.getElementById("view-friends").addEventListener("change", e => { if (e.target.matches("[data-fractwho]")) { fr.actWho = e.target.value; repaintFriends(); } });
  document.getElementById("view-friends").addEventListener("submit", async e => {
    const c = sync.client, u = sync.user; if (!c || !u) return;
    if (e.target.id === "fr-join") { e.preventDefault();
      const h = $("#fr-handle").value.trim().toLowerCase().replace(/^@/, ""), name = $("#fr-name").value.trim().slice(0, 40);
      if (!handleOk(h)) { fr.msg = "Use 3 to 20 lowercase letters, numbers or _."; repaintFriends(); return; }
      await frAct(() => c.from("sp_profiles").insert({ user_id: u.id, handle: h, name, buddy: settings.buddy?.type || "" }), "");
      if (/duplicate|unique/i.test(fr.lastErr)) { fr.msg = "That gamer tag is taken. Try another."; repaintFriends(); }
      return; }
    if (e.target.id === "fr-add") { e.preventDefault();
      const h = $("#fr-find").value.trim().toLowerCase().replace(/^@/, "");
      if (!handleOk(h)) { fr.msg = "That doesn't look like a gamer tag."; repaintFriends(); return; }
      if (h === fr.me?.handle) { fr.msg = "That's you!"; repaintFriends(); return; }
      const { data, error } = await c.from("sp_profiles").select("user_id, handle").eq("handle", h).maybeSingle();
      if (error || !data) { fr.msg = error ? `Couldn't look that up: ${error.message}` : `No one has the tag @${h} yet.`; repaintFriends(); return; }
      const back = fr.rels.find(r => r.requester === data.user_id && r.addressee === u.id);
      if (back) await frAct(() => c.from("sp_friends").update({ status: "accepted" }).match({ requester: data.user_id, addressee: u.id }), `You and @${h} are now friends.`);
      else await frAct(() => c.from("sp_friends").insert({ requester: u.id, addressee: data.user_id }), `Request sent to @${h}.`);
    }
  });
  document.getElementById("view-stats").addEventListener("click", e => {
    const go = e.target.closest("[data-ygo]"); if (go) document.getElementById("y-" + go.dataset.ygo)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
  document.getElementById("view-friends").addEventListener("click", e => {
    const t = e.target, c = sync.client, u = sync.user;
    if (t.closest("[data-frsignin]")) return sync.open();
    if (t.closest("[data-frretry]")) return friendsLoad(true);
    if (t.closest("[data-frsql]")) { fetch(FRIENDS_SQL_URL).then(r => r.text()).then(x => copyText(x, "Setup copied. Paste it into the SQL editor and press Run.")).catch(() => toast("Couldn't load the setup. Check your connection.")); return; }
    if (t.closest("[data-frcopy]")) { copyText(`Add me on Save Point: @${fr.me?.handle} (${location.origin}${location.pathname})`, "Your gamer tag is copied"); return; }
    if (!c || !u) return;
    const ac = t.closest("[data-fraccept]"); if (ac) { const id = ac.dataset.fraccept; frAct(() => c.from("sp_friends").update({ status: "accepted" }).match({ requester: id, addressee: u.id }), "Friend added."); return; }
    const rm = t.closest("[data-frremove]"); if (rm) { const id = rm.dataset.frremove; frAct(() => c.from("sp_friends").delete().or(`and(requester.eq.${u.id},addressee.eq.${id}),and(requester.eq.${id},addressee.eq.${u.id})`), ""); return; }
    const vw = t.closest("[data-frview]"); if (vw) openFriend(vw.dataset.frview);
    const ft = t.closest("[data-frtab]"); if (ft) { fr.tab = ft.dataset.frtab; repaintFriends(); return; }
    if (t.closest("[data-fraddopen]")) { fr.addOpen = !fr.addOpen; repaintFriends(); if (fr.addOpen) $("#fr-find")?.focus(); return; }
    const af = t.closest("[data-fractf]"); if (af) { fr.actF = af.dataset.fractf; repaintFriends(); return; }
    if (t.closest("[data-fractmore]")) { fr.actMore = true; repaintFriends(); return; }
    const nth = t.closest("[data-ncthread]"); if (nth) { ncOpen(nth.dataset.ncthread); return; }
    if (t.closest("[data-ncopenall]")) { ncOpen(); return; }
    if (t.closest("[data-notesql]")) { fetch(NOTES_SQL_URL).then(r => r.text()).then(x => copyText(x, "Setup copied. Paste it into the SQL editor and press Run.")).catch(() => toast("Couldn't load the setup.")); return; }
    const na = t.closest("[data-noteadd]"); if (na) { const [nid, st] = na.dataset.noteadd.split(":"), n = fr.notes.find(x => x.id === nid); if (n) { addFromDiscover({ title: n.game.t, wikidata: n.game.w, steamAppId: n.game.a, coverUrl: n.game.c, year: n.game.y }, st); setTimeout(repaintFriends, 400); } return; }
    const nr = t.closest("[data-notereply]"); if (nr) { fr.reply = nr.dataset.notereply; repaintFriends(); return; }
    if (t.closest("[data-replycancel]")) { fr.reply = null; repaintFriends(); return; }
    const rs = t.closest("[data-rstar]"); if (rs) { const v = +rs.dataset.rstar; rs.parentElement.querySelectorAll("[data-rstar]").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.rstar <= v))); return; }
    const rf = t.closest("[data-rfeel]"); if (rf) { const on = rf.getAttribute("aria-pressed") !== "true", n = rf.parentElement.querySelectorAll('[aria-pressed="true"]').length; if (on && n >= 4) { toast("Pick up to 4."); return; } rf.setAttribute("aria-pressed", String(on)); return; }
    const fg = t.closest("[data-frgame]"); if (fg) { const [fid2, i] = fg.dataset.frgame.split(":"); friendGame(fid2, i); return; }
    const ch = t.closest("[data-frcheer]"); if (ch) { const [fid2, i] = ch.dataset.frcheer.split(":"), g = fr.shelves[fid2]?.data?.games?.[+i]; if (g) { ch.disabled = true; sendNote(fid2, "cheer", noteGame(g)).then(ok => { if (ok) { toast("Cheer sent 🎉"); repaintFriends(); } else ch.disabled = false; }); } return; }
  });
  document.getElementById("view-friends").addEventListener("submit", async e => {
    const f = e.target.closest(".nreply"); if (!f) return; e.preventDefault();
    const n = fr.notes.find(x => x.id === f.dataset.replyto); if (!n) return;
    const r = f.querySelectorAll('[data-rstar][aria-pressed="true"]').length, fe = [...f.querySelectorAll('[data-rfeel][aria-pressed="true"]')].map(b => b.dataset.rfeel), body = f.querySelector("textarea").value.trim();
    f.querySelector('[type=submit]').disabled = true;
    if (await sendNote(n.sender, "answer", { ...n.game, r, fe }, body, n.id)) { fr.reply = null; toast("Sent. Thanks for sharing!"); repaintFriends(); }
  });
  // a friend's shelves and stats, read-only
  function openFriend(id){
    const p = fr.profiles[id], d = fr.shelves[id]?.data; if (!p || !d) return;
    const G = (d.games || []).map((g, i) => ({ id: "fr" + i, title: g.t, status: g.s, platform: g.p, rating: g.r, hours: g.h, finished: g.f, year: g.y, genres: g.g || [], steamAppId: g.a, coverPick: g.c, logoPick: g.l, dna: g.d, wikidata: g.w, friend: true }));
    const S = friendStats(d), mine = new Map(games.map(g => [norm(g.title), g]));
    // after you add one of their games, mark it in place in the list (no redraw, so the list doesn't jump)
    frAdded = (title, st) => { const k = norm(title), g2 = games.find(x => norm(x.title) === k); if (g2) mine.set(k, g2);
      document.querySelectorAll("#frcmp .frc").forEach(row => { if (norm(row.querySelector(".frct b")?.textContent || "") !== k) return; const a = row.querySelector(".frcact"); if (a) a.innerHTML = `<span class="frdone">✓ In your ${esc((STATUS[st] || st).toLowerCase())}</span>`; }); };
    const both = G.filter(g => mine.has(norm(g.title)) && g.status !== "wishlist" && !UNPLAYED.has(mine.get(norm(g.title)).status) && !UNPLAYED.has(g.status));
    const rec = G.filter(g => g.status === "finished" && g.rating >= 4 && (!mine.has(norm(g.title)) || mine.get(norm(g.title)).status === "backlog" || mine.get(norm(g.title)).status === "wishlist")).sort((a, b) => b.rating - a.rating).slice(0, 8);
    const shelf = (name, list, col) => `<div class="frshelf" style="--sc:${col}"><div class="frsh"><b>${esc(name)}</b><span>${list.length}</span></div><div class="spines">${list.slice(0, 80).map(spine).join("") || `<span class="note">Empty</span>`}</div></div>`;
    const by = s => G.filter(g => g.status === s);
    const custom = (d.nook?.shelves || []).map(sh => shelf(sh.n, sh.i.map(i => G[i]).filter(Boolean), sh.c || "#B07CF0"));
    const dna = (d.soul?.dna || []).filter(([k]) => Object.hasOwn(AIDX, k)), tm = tasteMatch(d);
    // compare: same games, only theirs, only yours, their best and worst, where you disagree
    const played = g => g && !UNPLAYED.has(g.status) && g.status !== "wishlist";
    const theirs = G.filter(played), mineP = games.filter(played), theirSet = new Set(theirs.map(g => norm(g.title)));
    const FR_VIEWS = [["shelves", "Shelves"], ["both", `Both played (${both.length})`], ["theirs", "Only them"], ["mine", "Only you"], ["best", "Their best"], ["worst", "Their least"], ["disagree", "Disagree"]];
    const FR_SORTS = [["auto", "Best for this view"], ["rdesc", "Their rating: high to low"], ["rasc", "Their rating: low to high"], ["mdesc", "Your rating: high to low"], ["hours", "Most hours"], ["recent", "Finished most recently"], ["az", "A to Z"]];
    const cmp = { view: "shelves", sort: "auto" };
    const r = n => n ? `<span class="stars">${stars(n)}</span><b class="frnum">${String(n).replace(".5", "½")}</b>` : `<small class="muted">not rated</small>`;
    function cmpHTML(){
      if (cmp.view === "shelves") return `<div class="frrack">${shelf("Playing", by("playing"), "#F08A4B")}${shelf("Finished", by("finished").sort((a, b) => (b.finished || "").localeCompare(a.finished || "")), "#5BC08A")}${shelf("Backlog", by("backlog"), "#7A8CFF")}${custom.join("")}</div>`;
      let rows, kind = "theirs";
      if (cmp.view === "both") rows = both.map(g => ({ g, m: mine.get(norm(g.title)) }));
      else if (cmp.view === "theirs") rows = theirs.filter(g => !played(mine.get(norm(g.title)))).map(g => ({ g, m: mine.get(norm(g.title)) }));
      else if (cmp.view === "mine") { kind = "mine"; rows = mineP.filter(g => !theirSet.has(norm(g.title))).map(m => ({ g: null, m })); }
      else if (cmp.view === "best") rows = theirs.filter(g => g.rating).map(g => ({ g, m: mine.get(norm(g.title)) }));
      else if (cmp.view === "worst") rows = theirs.filter(g => g.rating).map(g => ({ g, m: mine.get(norm(g.title)) }));
      else rows = both.filter(g => g.rating && mine.get(norm(g.title))?.rating).map(g => ({ g, m: mine.get(norm(g.title)) }));
      const tr = x => x.g?.rating || 0, mr = x => x.m?.rating || 0, ttl = x => (x.g || x.m).title, hrs = x => Number((x.g || x.m).hours) || 0, fin = x => (x.g || x.m).finished || "";
      const auto = { both: (a, b) => tr(b) + mr(b) - tr(a) - mr(a), theirs: (a, b) => tr(b) - tr(a), mine: (a, b) => mr(b) - mr(a), best: (a, b) => tr(b) - tr(a) || hrs(b) - hrs(a), worst: (a, b) => tr(a) - tr(b), disagree: (a, b) => Math.abs(tr(b) - mr(b)) - Math.abs(tr(a) - mr(a)) }[cmp.view];
      const S2 = { auto, rdesc: (a, b) => tr(b) - tr(a), rasc: (a, b) => (tr(a) || 9) - (tr(b) || 9), mdesc: (a, b) => mr(b) - mr(a), hours: (a, b) => hrs(b) - hrs(a), recent: (a, b) => fin(b).localeCompare(fin(a)), az: (a, b) => ttl(a).localeCompare(ttl(b)) }[cmp.sort] || auto;
      rows.sort(S2); if (cmp.view === "best" || cmp.view === "worst") rows = rows.slice(0, 25);
      if (!rows.length) return `<p class="note frcempty">${{ both: "No games you've both played yet.", theirs: "You've played everything they have.", mine: "They've played everything you have.", best: "They haven't rated any games yet.", worst: "They haven't rated any games yet.", disagree: "No games you've both rated yet." }[cmp.view]}</p>`;
      const nm = esc(p.name || p.handle);
      return `<div class="frcmp">${rows.slice(0, 120).map(x => { const G0 = x.g || x.m, diff = x.g && x.m && tr(x) && mr(x) ? mr(x) - tr(x) : null;
        return `<div class="frc">${x.g ? `<button type="button" class="frcbox" data-open="${esc(x.g.id)}" aria-label="${esc(G0.title)}">${boxHTML(x.g)}</button>` : `<span class="frcbox">${boxHTML(x.m)}</span>`}
          <div class="frct"><b>${esc(G0.title)}</b>
            <div class="frcr">${kind === "theirs" ? `<span><small>${nm}</small>${r(tr(x))}</span>` : ""}<span><small>You</small>${x.m && played(x.m) ? r(mr(x)) : `<small class="muted">${x.m ? esc(STATUS[x.m.status]) : "not played"}</small>`}</span>${diff ? `<span class="frdiff ${diff > 0 ? "up" : "down"}">${diff > 0 ? "+" : ""}${String(diff).replace(".5", "½")}</span>` : ""}</div>
            <small class="muted">${[x.g?.hours ? `${nm}: ${fmtH(x.g.hours)}` : "", x.m?.hours ? `you: ${fmtH(x.m.hours)}` : "", x.g?.finished ? `finished ${fmtDate(x.g.finished)}` : ""].filter(Boolean).join(" · ")}</small></div>
          <div class="frcact">${kind === "mine" ? `<button class="btn small" type="button" data-frrecone="${esc(x.m.id)}">🎮 Recommend</button>` : !x.m ? `<button class="btn small primary" type="button" data-fradd="${esc(x.g.id)}" data-st="finished" title="I've played it too">✓ Played</button><button class="btn small" type="button" data-fradd="${esc(x.g.id)}" data-st="backlog">+ Backlog</button>` : !played(x.m) ? `<button class="btn small primary" type="button" data-frmark="${esc(x.m.id)}" title="Move it to your Finished shelf">✓ Played</button>` : ""}</div></div>`; }).join("")}</div>`;
    }
    openModal(`<div class="modal wide frmodal" role="dialog" aria-modal="true" aria-labelledby="frv-t"><div class="reshead"><div><span class="px">@${esc(p.handle)}${d.at ? ` · updated ${relDay(d.at.slice(0, 10))}` : ""}</span><h2 id="frv-t">${esc(p.name || p.handle)}'s shelves</h2></div><button class="btn small" type="button" data-mclose>Close</button></div>
      <div class="chips frmact"><button class="btn small primary" type="button" data-frrec>🎮 Send a game</button><button class="btn small" type="button" data-frchat2>💬 Chat</button>${tm ? `<span class="tmatch big" title="From ${tm.n} games you've both rated">${tm.pct}% taste match</span>` : ""}<span class="note">Tap any game to see their rating, feelings and dates.</span></div>
      <div class="frkpis"><div><b>${S.n}</b><span>games</span></div><div><b>${S.fin}</b><span>finished</span></div><div><b>${S.h.toLocaleString()}</b><span>hours</span></div><div><b>${both.length}</b><span>played by you both</span></div></div>
      ${d.soul ? `<div class="frsoul"><span class="px">Gamer's Soul</span><b>${esc(d.soul.title)}</b>${d.soul.rank ? `<small>${esc(d.soul.rank)}</small>` : ""}<div class="strand">${dna.map(([k, v]) => `<span style="flex:${v};--c:${AK(k).c}" title="${esc(AK(k).short)} ${v}%"></span>`).join("")}</div><div class="frdna">${dna.map(([k, v]) => `<span style="--c:${AK(k).c}"><i>${AK(k).g}</i>${esc(AK(k).short)} ${v}%</span>`).join("")}</div></div>` : ""}
      ${(d.nook?.best || []).length ? `<div class="frtop10"><span class="px">${esc((p.name || p.handle).split(" ")[0])}'s top 10</span><ol class="frt10">${d.nook.best.map(i => G[i]).filter(Boolean).map((g, k) => `<li><span class="t10n">${k + 1}</span><button type="button" class="t10box" data-open="${esc(g.id)}" aria-label="${esc(g.title)}">${boxHTML(g)}</button><small>${esc(g.title)}</small></li>`).join("")}</ol></div>` : ""}
      <div class="frcmpbar"><div class="seg frviews">${FR_VIEWS.map(([k, n]) => `<button type="button" data-frv="${k}" aria-pressed="${cmp.view === k}">${n}</button>`).join("")}</div>
        <label class="frsort" ${cmp.view === "shelves" ? "hidden" : ""}><span class="px">Sort</span><select id="fr-sort">${FR_SORTS.map(([k, n]) => `<option value="${k}"${cmp.sort === k ? " selected" : ""}>${n}</option>`).join("")}</select></label></div>
      <div id="frcmp">${cmpHTML()}</div>
      <p class="frfoot"><button class="linkbtn" type="button" data-frunfriend>Remove friend</button></p>
    </div>`, e => {
      const sp = e.target.closest(".frmodal [data-open]"); if (sp && /^fr\d+$/.test(sp.dataset.open)) { e.stopPropagation(); friendGame(id, sp.dataset.open.slice(2)); return true; }
      if (e.target.closest("[data-frrec]")) { openRecommend(id); return true; }
      if (e.target.closest("[data-frchat2]")) { closeModal(); ncStart(id); return true; }
      const rmf = e.target.closest("[data-frunfriend]"); if (rmf) { if (rmf.dataset.sure !== "1") { rmf.dataset.sure = "1"; rmf.textContent = "Tap again to remove"; return true; } const u = sync.user, c = sync.client; closeModal(); frAct(() => c.from("sp_friends").delete().or(`and(requester.eq.${u.id},addressee.eq.${id}),and(requester.eq.${id},addressee.eq.${u.id})`), "Friend removed"); return true; }
      const v = e.target.closest("[data-frv]"); if (v) { cmp.view = v.dataset.frv; cmp.sort = "auto"; document.querySelectorAll(".frviews [data-frv]").forEach(b => b.setAttribute("aria-pressed", String(b === v))); const sl = $(".frsort"); sl.hidden = cmp.view === "shelves"; $("#fr-sort").value = "auto"; $("#frcmp").innerHTML = cmpHTML(); return true; }
      // adding keeps you exactly where you are: only that row changes
      const ad = e.target.closest("[data-fradd]"); if (ad) { const g = G.find(x => x.id === ad.dataset.fradd), st = ad.dataset.st || "backlog"; if (g) { addFromDiscover({ title: g.title, wikidata: g.wikidata, steamAppId: g.steamAppId, coverUrl: g.coverPick, year: g.year }, st); frAdded(g.title, st); } return true; }
      const mk = e.target.closest("[data-frmark]"); if (mk) { const m = games.find(x => x.id === mk.dataset.frmark); if (m) { saveGame({ ...m, status: "finished", progress: 100 }, `Moved ${m.title} to Finished`); frAdded(m.title, "finished"); } return true; }
      const ro = e.target.closest("[data-frrecone]"); if (ro) { const gm = games.find(x => x.id === ro.dataset.frrecone); if (gm) { ro.disabled = true; sendNote(id, "rec", { ...noteGame(gm), r: gm.rating || 0, fe: feelsOf(gm).slice(0, 4) }, "").then(ok => { ro.textContent = ok ? "Sent ✓" : "🎮 Recommend"; ro.disabled = ok; if (ok) toast(`Recommended ${gm.title}`); }); } return true; }
    }, e => { if (e.target.id === "fr-sort") { cmp.sort = e.target.value; $("#frcmp").innerHTML = cmpHTML(); } });
  }
  { let n = 0; const tryFr = () => { if (sync.user) friendsLoad(); else if (++n < 20) setTimeout(tryFr, 1500); }; setTimeout(tryFr, 1500); } // keeps your shared shelves up to date

