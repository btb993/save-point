  // ================= up next (picked from your backlog) =================
  function renderNext(){
    const el = $("#view-next");
    const back = games.filter(g => g.status === "backlog"), played = games.filter(g => !UNPLAYED.has(g.status));
    const head = `<div class="panel nextpanel" style="margin-bottom:14px"><div class="reshead"><h2>From your backlog</h2><button class="linkbtn tnlink" type="button" data-tonight>Can't decide? Pick for me</button></div><div class="note">Games you already have, ranked by how well each matches what you've enjoyed.</div>
      <div class="chips">${[["fit","Best match"],["short","Short ones"],["critics","Critics' favourites"],["oldest","Waiting longest"]].map(([k, v]) => `<button class="chip" type="button" data-mode="${k}" aria-pressed="${nextMode === k}">${v}</button>`).join("")}</div></div>`;
    if (!back.length) { el.innerHTML = ""; return; }
    const aff = new Map(), dev = new Map(), why = new Map();
    for (const g of played) {
      const w = g.rating ? g.rating - 2.5 : g.status === "finished" ? 1 : g.status === "dropped" ? -1.5 : .5;
      (g.genres || []).forEach(x => { aff.set(x, (aff.get(x) || 0) + w); if (w > 0 && (!why.has(x) || (g.rating || 0) > (why.get(x).rating || 0))) why.set(x, g); });
      (g.developer || "").split(", ").filter(Boolean).forEach(x => { dev.set(x, (dev.get(x) || 0) + w * 1.5); if (w > 0 && !why.has("dev:" + x)) why.set("dev:" + x, g); });
    }
    const scored = back.map(g => {
      let s = 0, reason = "";
      const gs = (g.genres || []).map(x => [x, aff.get(x) || 0]).sort((a, b) => b[1] - a[1]);
      gs.forEach(([, v]) => s += v);
      const ds = (g.developer || "").split(", ").filter(Boolean).map(x => [x, dev.get(x) || 0]).sort((a, b) => b[1] - a[1]);
      ds.forEach(([, v]) => s += v);
      s += (mcNum(g) || 70) / 25;
      if (ds[0] && ds[0][1] > 0) { const src = why.get("dev:" + ds[0][0]); reason = `Same studio as ${src.title}${src.rating ? `, which you gave ${src.rating}★` : ""}.`; }
      else if (gs[0] && gs[0][1] > 0) { const src = why.get(gs[0][0]); reason = `${gs[0][0]}, like ${src.title}${src.rating ? ` (${src.rating}★)` : ""}.`; }
      else if (mcNum(g) >= 85) reason = `Critics loved it: ${mcNum(g)} on Metacritic.`;
      return { g, s, reason };
    });
    if (nextMode === "short") scored.sort((a, b) => (Number(a.g.length) || 999) - (Number(b.g.length) || 999) || b.s - a.s);
    else if (nextMode === "critics") scored.sort((a, b) => (mcNum(b.g) || 0) - (mcNum(a.g) || 0));
    else if (nextMode === "oldest") scored.sort((a, b) => (a.g.added || "").localeCompare(b.g.added || ""));
    else scored.sort((a, b) => b.s - a.s);
    const top = scored.slice(0, 9);
    const note = nextMode === "short" && !back.some(g => Number(g.length)) ? `<div class="note" style="margin-bottom:10px">None of your backlog has a story length yet. Add “Hours to beat” on a game to sort by it.</div>` : "";
    el.innerHTML = head + note + `<div class="recs">${top.map(({ g, reason }, i) => `<div class="rec">${boxHTML(g, "button", `type="button" data-open="${esc(g.id)}" aria-label="Open ${esc(g.title)}" style="border:0;padding:0;cursor:pointer;--c:${caseColor(g)};--pc:${pcVar(mainPlat(g))}"`)}<div class="meta">
        <span class="rank">#${i + 1}</span><div class="t">${esc(g.title)}</div><div class="a">${esc(g.developer || "")}</div>
        <div class="facts">${g.year ? `<span>${esc(g.year)}</span>` : ""}${(g.genres || []).length ? `<span>${esc(g.genres[0])}</span>` : ""}${g.length ? `<span>~${esc(g.length)} h</span>` : ""}</div>
        ${mcBadge(g)}
        ${reason ? `<div class="because">${esc(reason)}</div>` : ""}
        <div class="qa"><button class="btn primary small" type="button" data-start="${esc(g.id)}">Start playing</button></div>
      </div></div>`).join("")}</div>`;
  }

