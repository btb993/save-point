  // ================= quest log =================
  // Quest lists come from the game's IGN guide (its table of contents: Walkthrough, Side Quests, Treasure Hunts…).
  // You pick which parts to track; ticks are saved on the game and sync with it.
  const IGN = "https://www.ign.com/wikis/";
  const QUEST_RX = /walkthrough|quest|mission|job|side|errand|contract|bounty|hunt|treasure|collectible|trial|shrine|boss|challenge|dlc|expansion|erdtree|phantom|burning|stories|activities|strangers|freaks/i;
  const QUEST_NO = /beginner|tips|build|romance|sex|cheat|patch|mod|how.?to|edition|weapon|armou?r|skill|companion|party|character|class|origin|about|best|tier|console|faq|controls|settings|photo/i;
  const igSlug = t => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[™®©]/g, "").replace(/&/g, "and").replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const ROMAN = { " v": " 5", " iv": " 4", " iii": " 3", " ii": " 2", " vi": " 6" };
  function igCandidates(t){
    t = String(t || ""); const out = new Set(), add = x => { const s = igSlug(x); if (s) out.add(s); };
    add(t); add(t.replace(/^the /i, "")); add(t.split(/[:–—]| - /)[0]);
    const ab = t.replace(/^grand theft auto/i, "gta"); add(ab); let r = ab.toLowerCase(); for (const [k, v] of Object.entries(ROMAN)) r = r.replace(new RegExp(k + "\\b"), v); add(r);
    return [...out].slice(0, 6);
  }
  async function igNav(slug, signal){
    const r = await fetch(IGN + slug, { signal }); if (!r.ok) return null;
    const m = (await r.text()).match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/); if (!m) return null;
    const pg = JSON.parse(m[1]).props?.pageProps?.page || {}, nav = pg.navigation || [];
    return nav.length ? { slug, title: pg.wiki?.name || pg.title || slug, nav } : null;
  }
  async function igFind(g, signal){
    for (const c of igCandidates(g.title)) { try { const n = await igNav(c, signal); if (n) return n; } catch (e) { if (e.name === "AbortError") throw e; } }
    return null;
  }
  // turn one section of the guide's table of contents into groups of checklist items
  function igSection(node){
    const groups = [], loose = [];
    const leaf = n => [String(n.label || "").replace(/ Walkthrough$/i, "").trim().slice(0, 90), String(n.url || "")];
    (node.subnav || []).forEach(c => {
      if ((c.subnav || []).length) { const items = []; const walk = x => (x.subnav || []).forEach(y => (y.subnav || []).length ? walk(y) : items.push(leaf(y))); walk(c); groups.push({ n: String(c.label).slice(0, 80), items: items.slice(0, 300) }); }
      else loose.push(leaf(c));
    });
    if (loose.length) groups.unshift({ n: "", items: loose.slice(0, 300) });
    return { n: String(node.label).slice(0, 80), groups };
  }
  const qKeyOf = it => it[1] || "t:" + it[0];
  function qCount(q){ let n = 0, d = 0; (q?.secs || []).forEach(s => s.groups.forEach(gr => gr.items.forEach(it => { n++; if (q.done?.[qKeyOf(it)]) d++; }))); (q?.mine || []).forEach((m, i) => { n++; if (q.done?.["m:" + i]) d++; }); return { n, d }; }
  function openQuests(id){
    const g0 = games.find(x => x.id === id); if (!g0) return;
    document.querySelector(".quest-scrim")?.remove();
    const el = document.createElement("div"); el.className = "scrim quest-scrim"; document.body.append(el);
    const ctl = new AbortController();
    let found = null, pickSecs = new Set(), filt = "todo", q = "", busy = "", err = "";
    const G = () => games.find(x => x.id === id) || g0;
    const save = (quests, msg) => { const g = G(); saveGame({ ...g, quests }, msg); };
    const close = () => { ctl.abort(); el.remove(); document.removeEventListener("keydown", key, true); };
    const key = e => { if (e.key === "Escape") { e.stopPropagation(); close(); } };
    document.addEventListener("keydown", key, true);
    const chooser = () => { const secs = found.nav.filter(n => (n.subnav || []).length);
      return `<p>Found <b>${esc(found.title)}</b> on IGN. Pick what to track:</p>
        <div class="qchips">${secs.map((n, i) => `<button type="button" class="chip" data-qsec="${i}" aria-pressed="${pickSecs.has(i)}">${esc(n.label)} <small>${(n.subnav || []).length}</small></button>`).join("")}</div>
        <div class="mfoot"><button class="btn small" type="button" data-qother>Wrong game?</button><div class="r"><button class="btn primary" type="button" data-qload ${pickSecs.size ? "" : "disabled"}>Load quest list</button></div></div>`; };
    const draw = () => {
      const g = G(), Q = g.quests;
      let body;
      if (busy) body = `<p class="status"><span class="dots">${esc(busy)}</span></p>`;
      else if (found) body = chooser();
      else if (!Q) body = `<p>Load the main quests, side quests and more for <b>${esc(g.title)}</b> from its IGN guide, then tick them off as you go.</p>
        ${err ? `<p class="note qerr">${esc(err)}</p>` : ""}
        <div class="chips"><button class="btn primary" type="button" data-qfind>Find the IGN guide</button><button class="btn" type="button" data-qempty>Start my own list</button></div>
        <div class="lgurl"><input id="q-url" type="url" placeholder="Or paste the IGN guide link, e.g. https://www.ign.com/wikis/elden-ring" aria-label="IGN guide link"><button class="btn small" type="button" data-qurl>Use link</button></div>
        <p class="note">Lists come from IGN's guide pages, so they're as complete as IGN's guide.</p>`;
      else {
        const { n, d } = qCount(Q), match = it => (!q || norm(it[0]).includes(norm(q))) && (filt === "all" || (filt === "todo") !== !!Q.done?.[qKeyOf(it)]);
        const row = (it, k) => `<label class="qrow${Q.done?.[k] ? " done" : ""}"><input type="checkbox" data-qk="${esc(k)}" ${Q.done?.[k] ? "checked" : ""}><span>${esc(it[0])}</span>${it[1] ? `<a href="${IGN}${esc(Q.slug)}/${esc(it[1])}" target="_blank" rel="noopener" title="Open on IGN" aria-label="Open ${esc(it[0])} on IGN">↗</a>` : ""}</label>`;
        const secs = (Q.secs || []).map((s, si) => { const all = s.groups.flatMap(gr => gr.items), dn = all.filter(it => Q.done?.[qKeyOf(it)]).length;
          const inner = s.groups.map(gr => { const vis = gr.items.filter(match); if (!vis.length) return ""; return `${gr.n ? `<div class="qgrp">${esc(gr.n)} <small>${gr.items.filter(it => Q.done?.[qKeyOf(it)]).length}/${gr.items.length}</small></div>` : ""}${vis.map(it => row(it, qKeyOf(it))).join("")}`; }).join("");
          return `<details class="qsec" ${Q.open?.includes(si) ? "open" : ""} data-qopen="${si}"><summary><b>${esc(s.n)}</b><span class="qbar"><i style="width:${all.length ? dn / all.length * 100 : 0}%"></i></span><small>${dn}/${all.length}</small></summary><div class="qlist">${inner || `<p class="note">${filt === "todo" ? "All done here!" : "Nothing matches."}</p>`}</div></details>`; }).join("");
        body = `<div class="qtop"><div class="qtot"><b>${d}</b> of ${n} done<span class="qbar big"><i style="width:${n ? d / n * 100 : 0}%"></i></span></div>
          <div class="seg">${[["todo", "To do"], ["done", "Done"], ["all", "All"]].map(([k, v]) => `<button type="button" data-qf="${k}" aria-pressed="${filt === k}">${v}</button>`).join("")}</div>
          <input id="q-find" type="search" placeholder="Find a quest" value="${esc(q)}" aria-label="Find a quest"></div>
          ${secs}
          <details class="qsec" open><summary><b>My own</b><small>${(Q.mine || []).length}</small></summary><div class="qlist">${(Q.mine || []).map((m, i) => (!q || norm(m).includes(norm(q))) && (filt === "all" || (filt === "todo") !== !!Q.done?.["m:" + i]) ? `<label class="qrow${Q.done?.["m:" + i] ? " done" : ""}"><input type="checkbox" data-qk="m:${i}" ${Q.done?.["m:" + i] ? "checked" : ""}><span>${esc(m)}</span><button type="button" class="linkbtn" data-qrm="${i}" aria-label="Remove">✕</button></label>` : "").join("")}
            <form class="qadd" id="q-add"><input id="q-new" maxlength="90" placeholder="Add a quest, collectible or goal"><button class="btn small" type="submit">Add</button></form></div></details>
          <div class="mfoot">${Q.slug ? `<a class="linkbtn" href="${IGN}${esc(Q.slug)}" target="_blank" rel="noopener">IGN guide ↗</a><button class="linkbtn" type="button" data-qresec>Change sections</button>` : `<button class="linkbtn" type="button" data-qfind>Load from IGN</button>`}<div class="r"><button class="btn danger small" type="button" data-qdel>Remove list</button></div></div>`;
      }
      el.innerHTML = `<div class="modal wide questmod" role="dialog" aria-modal="true" aria-labelledby="q-t"><div class="reshead"><div><span class="px">Quest log</span><h2 id="q-t">${esc(G().title)}</h2></div><button class="btn small" type="button" data-qx>Close</button></div>${body}</div>`;
    };
    const find = async slugOrNull => {
      busy = "Looking for the IGN guide"; err = ""; draw();
      try { found = slugOrNull ? await igNav(slugOrNull, ctl.signal) : await igFind(G(), ctl.signal); }
      catch (e) { if (e.name === "AbortError") return; found = null; }
      busy = "";
      if (!found) { err = navigator.onLine ? "Couldn't find an IGN guide under that name. Paste the guide's link from IGN instead." : "You're offline."; draw(); return; }
      const secs = found.nav.filter(n => (n.subnav || []).length);
      pickSecs = new Set(secs.map((n, i) => [n, i]).filter(([n]) => QUEST_RX.test(n.label) && (!QUEST_NO.test(n.label) || /quest|mission|job/i.test(n.label))).map(([, i]) => i));
      const prev = G().quests; if (prev?.secs) secs.forEach((n, i) => { if (prev.secs.some(s => s.n === String(n.label).slice(0, 80))) pickSecs.add(i); });
      draw();
    };
    el.addEventListener("click", e => {
      const t = e.target;
      if (t === el || t.closest("[data-qx]")) return close();
      if (t.closest("[data-qfind]")) return find(null);
      if (t.closest("[data-qother]")) { found = null; err = "Paste the right guide's link from IGN below."; draw(); return; }
      if (t.closest("[data-qurl]")) { const m = ($("#q-url", el)?.value || "").match(/ign\.com\/wikis\/([^/?#]+)/i); if (!m) { err = "That doesn't look like an IGN guide link (ign.com/wikis/…)."; draw(); return; } return find(m[1]); }
      if (t.closest("[data-qempty]")) return save({ slug: "", secs: [], done: {}, mine: [] }, "Quest log started");
      const sc = t.closest("[data-qsec]"); if (sc) { const i = +sc.dataset.qsec; pickSecs.has(i) ? pickSecs.delete(i) : pickSecs.add(i); draw(); return; }
      if (t.closest("[data-qload]")) {
        const secs = found.nav.filter(n => (n.subnav || []).length).filter((_, i) => pickSecs.has(i)).map(igSection);
        let total = 0; secs.forEach(s => s.groups.forEach(gr => { gr.items = gr.items.slice(0, Math.max(0, 900 - total)); total += gr.items.length; }));
        const prev = G().quests || {}, slug = found.slug; found = null;
        save({ slug, secs, done: prev.done || {}, mine: prev.mine || [], open: [0], at: todayISO() }, `Loaded ${total} things to track for ${G().title}`); draw(); return;
      }
      if (t.closest("[data-qresec]")) return find(G().quests.slug);
      if (t.closest("[data-qdel]")) { if (!el.dataset.sure) { el.dataset.sure = 1; t.closest("[data-qdel]").textContent = "Tap again to remove"; return; } const g = G(); const { quests, ...rest } = g; saveGame({ ...rest }, "Quest log removed"); found = null; draw(); return; }
      const f = t.closest("[data-qf]"); if (f) { filt = f.dataset.qf; draw(); return; }
      const rm = t.closest("[data-qrm]"); if (rm) { const Q = G().quests, i = +rm.dataset.qrm, mine = Q.mine.filter((_, k) => k !== i), done = {}; Object.entries(Q.done || {}).forEach(([k, v]) => { if (!k.startsWith("m:")) done[k] = v; else { const n = +k.slice(2); if (n < i) done[k] = v; else if (n > i) done["m:" + (n - 1)] = v; } }); save({ ...Q, mine, done }); draw(); return; }
    });
    el.addEventListener("toggle", e => { const s = e.target.closest?.("[data-qopen]"); if (!s) return; const Q = G().quests; if (!Q) return; const i = +s.dataset.qopen, open = new Set(Q.open || []); s.open ? open.add(i) : open.delete(i); Q.open = [...open]; }, true);
    el.addEventListener("change", e => { const c = e.target.closest("[data-qk]"); if (!c) return; const Q = G().quests, done = { ...(Q.done || {}) }; if (c.checked) done[c.dataset.qk] = todayISO(); else delete done[c.dataset.qk]; save({ ...Q, done }); setTimeout(() => { if (filt !== "all") draw(); else c.closest(".qrow")?.classList.toggle("done", c.checked); }, filt === "all" ? 0 : 450); });
    el.addEventListener("input", e => { if (e.target.id !== "q-find") return; q = e.target.value; const pos = e.target.selectionStart; draw(); const i = $("#q-find", el); i.focus(); i.setSelectionRange(pos, pos); });
    el.addEventListener("submit", e => { if (e.target.id !== "q-add") return; e.preventDefault(); const v = $("#q-new", el).value.trim().slice(0, 90); if (!v) return; const Q = G().quests; save({ ...Q, mine: [...(Q.mine || []), v] }); draw(); setTimeout(() => $("#q-new", el)?.focus(), 30); });
    draw();
  }
