  // ================= notifications and messages =================
  // A bell up top: friend requests, game notes grouped into conversations (one per friend and game), quick reactions,
  // replies and friends' latest finishes. New notes arrive live when the database allows it, otherwise within a minute.
  const NC = { open: false, key: "", answering: "" };
  const REACTS = ["👍", "❤️", "😂", "🔥", "🎉"];
  // chat extras: an emoji tray and game stickers (a sticker travels as the text ":st:name:")
  const EMOJI = ["😀","😂","🥲","😍","🤩","😎","🤔","😴","😭","😤","🤯","🥳","👍","👏","🙌","💪","❤️","💔","🔥","✨","💯","👀","🎮","🕹️","👾","🏆","⭐","🎯","⚔️","🛡️","🗺️","🧩","🐉","👻","💀","🍕","☕","🌙","💤","🎉"];
  const STK = (bg, art, label, ink = "#fff") => `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="5" y="5" width="90" height="90" rx="24" fill="${bg}" stroke="#fff" stroke-width="5"/>${art}<text x="50" y="86" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="${label.length > 7 ? 12 : 15}" fill="${ink}">${label}</text></svg>`;
  const STICKERS = {
    gg: ["GG", STK("#5654F0", `<path d="M22 26h56a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H44l-12 10v-10H22a8 8 0 0 1-8-8V34a8 8 0 0 1 8-8z" fill="#fff"/><text x="50" y="55" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="900" font-size="26" fill="#5654F0">GG</text>`, "GG WP")],
    win: ["Victory", STK("#F2A516", `<path d="M34 22h32v14a16 16 0 0 1-32 0z" fill="#FFF3C4"/><path d="M34 26h-8a8 8 0 0 0 8 12M66 26h8a8 8 0 0 1-8 12" fill="none" stroke="#FFF3C4" stroke-width="4"/><rect x="46" y="51" width="8" height="10" fill="#FFF3C4"/><rect x="38" y="61" width="24" height="6" rx="2" fill="#FFF3C4"/><path d="M50 27l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z" fill="#F2A516"/>`, "VICTORY!")],
    rage: ["Rage quit", STK("#E5484D", `<rect x="22" y="36" width="56" height="28" rx="14" fill="#fff"/><path d="M33 44v12M27 50h12" stroke="#E5484D" stroke-width="4" stroke-linecap="round"/><circle cx="64" cy="46" r="3.5" fill="#E5484D"/><circle cx="70" cy="53" r="3.5" fill="#E5484D"/><path d="M50 30l-4 10 6 4-5 12" fill="none" stroke="#E5484D" stroke-width="3" stroke-linejoin="round"/><path d="M28 28q-4-8 2-12M72 28q4-8-2-12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`, "RAGE QUIT")],
    turn: ["One more turn", STK("#0F9F6A", `<path d="M36 20h28M36 66h28M38 20c0 14 24 16 24 23S38 52 38 66M62 20c0 14-24 16-24 23s24 9 24 23" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M44 58l6-7 6 7z" fill="#fff"/>`, "ONE MORE")],
    coop: ["Co-op?", STK("#2F80ED", `<rect x="12" y="34" width="34" height="20" rx="10" fill="#fff"/><rect x="54" y="34" width="34" height="20" rx="10" fill="#fff"/><path d="M20 44h8M24 40v8M62 44h8M66 40v8" stroke="#2F80ED" stroke-width="3" stroke-linecap="round"/><circle cx="38" cy="42" r="2.5" fill="#2F80ED"/><circle cx="80" cy="42" r="2.5" fill="#2F80ED"/><path d="M50 24c-4-6-12-2-8 4l8 7 8-7c4-6-4-10-8-4z" fill="#FF8FB0"/>`, "CO-OP?")],
    boss: ["Boss fight", STK("#3B2F57", `<path d="M30 30l7 8 13-14 13 14 7-8-3 18H33z" fill="#FFD66B"/><path d="M33 48h34v8a17 17 0 0 1-34 0z" fill="#fff"/><circle cx="43" cy="56" r="4" fill="#3B2F57"/><circle cx="57" cy="56" r="4" fill="#3B2F57"/>`, "BOSS")],
    loot: ["Loot!", STK("#8A5A44", `<path d="M24 46h52v20H24z" fill="#F2A516"/><path d="M24 46a26 14 0 0 1 52 0z" fill="#FFC24A"/><rect x="24" y="44" width="52" height="5" fill="#6B4434"/><rect x="45" y="44" width="10" height="12" rx="2" fill="#6B4434"/><path d="M30 28l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM70 22l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="#FFF3C4"/>`, "LOOT!")],
    afk: ["AFK", STK("#4B5675", `<path d="M58 22a22 22 0 1 0 18 34 18 18 0 0 1-18-34z" fill="#FFE7A3"/><text x="68" y="34" font-family="system-ui,sans-serif" font-weight="900" font-size="12" fill="#fff">z</text><text x="76" y="26" font-family="system-ui,sans-serif" font-weight="900" font-size="9" fill="#fff">z</text>`, "AFK")],
    respawn: ["Respawning", STK("#7C5CFA", `<path d="M34 64V42a16 16 0 0 1 32 0v22l-5-5-5 5-6-5-6 5-5-5z" fill="#fff"/><circle cx="44" cy="42" r="3.5" fill="#7C5CFA"/><circle cx="56" cy="42" r="3.5" fill="#7C5CFA"/>`, "BRB")],
    saved: ["Game saved", STK("#EE3F78", `<path d="M50 66L28 44a12 12 0 0 1 22-14 12 12 0 0 1 22 14z" fill="#fff"/><rect x="36" y="20" width="28" height="4" rx="2" fill="#FFD0DE"/>`, "SAVED")],
    hype: ["Hype", STK("#FF6A3D", `<path d="M50 18c4 12 18 16 18 32a18 18 0 0 1-36 0c0-8 4-12 8-16 0 6 3 9 6 9-2-9 0-18 4-25z" fill="#FFE07A"/><path d="M50 46c2 6 8 8 8 14a8 8 0 0 1-16 0c0-5 4-8 8-14z" fill="#fff"/>`, "HYPE!")],
    noob: ["Learning", STK("#16A3B8", `<path d="M30 44l20-10 20 10-20 10z" fill="#fff"/><path d="M38 48v10c6 5 18 5 24 0V48l-12 6z" fill="#fff"/><path d="M70 44v12" stroke="#fff" stroke-width="3"/><circle cx="70" cy="58" r="3" fill="#FFE07A"/>`, "NOOB")],
  };
  const stickerOf = b => { const m = /^:st:([a-z]+):$/.exec(String(b || "").trim()); return m && STICKERS[m[1]] ? m[1] : ""; };
  const jumbo = b => { const x = String(b || "").trim(); return x && x.length <= 12 && /^(?:\p{Extended_Pictographic}|\p{Emoji_Component}|‍|️|\s)+$/u.test(x) && !/^[\d#*\s]+$/.test(x); };
  const nTray = () => `<div class="nctray" role="dialog" aria-label="Emoji and stickers"><div class="nctabs"><button type="button" data-nctab="e" aria-pressed="${NC.tray !== "s"}">😀 Emoji</button><button type="button" data-nctab="s" aria-pressed="${NC.tray === "s"}">🎮 Stickers</button></div>${NC.tray === "s" ? `<div class="ncstk">${Object.entries(STICKERS).map(([k, [n, svg]]) => `<button type="button" data-ncsticker="${k}" title="Send “${esc(n)}”" aria-label="Send sticker: ${esc(n)}">${svg}</button>`).join("")}</div>` : `<div class="ncemo">${EMOJI.map(e => `<button type="button" data-ncemoji="${e}" aria-label="Insert ${e}">${e}</button>`).join("")}</div>`}</div>`;
  const otherOf = n => n.sender === sync.user?.id ? n.recipient : n.sender;
  const threadKey = n => otherOf(n) + "|" + norm(n.game?.t || "");
  const whoName = id => { const p = fr.profiles[id]; return p ? p.name || "@" + p.handle : "Friend"; };
  function ncThreads(){
    const me = sync.user?.id, T = new Map();
    [...fr.notes].sort((a, b) => a.created_at.localeCompare(b.created_at)).forEach(n => {
      const k = threadKey(n); if (!T.has(k)) T.set(k, { key: k, other: otherOf(n), game: n.game, msgs: [], reacts: [], unread: 0, last: n });
      const t = T.get(k); if (n.kind === "react") t.reacts.push(n); else { t.msgs.push(n); t.game = n.game?.t ? { ...t.game, ...n.game } : t.game; }
      t.last = n; if (n.recipient === me && !n.read) t.unread++;
    });
    return [...T.values()].filter(t => t.msgs.length).sort((a, b) => b.last.created_at.localeCompare(a.last.created_at));
  }
  const msgLine = (n, mine) => {
    const k = { rec: "🎮 Recommended it", skip: "🙅 Says skip it", ask: "❓ How was it?", answer: "💬 Played it", cheer: "🎉 Cheered the finish", reply: "" }[n.kind] ?? "";
    if (stickerOf(n.body)) return (mine ? "You sent" : "Sent") + " a sticker: " + STICKERS[stickerOf(n.body)][0];
    return [mine ? "You" : "", k, n.body ? "“" + n.body.slice(0, 70) + (n.body.length > 70 ? "…" : "") + "”" : ""].filter(Boolean).join(mine ? ": " : " · ").replace(/^You: /, "You: ");
  };
  const avatar = id => { const p = fr.profiles[id] || {}, B = BUDDIES[p.buddy]; return `<span class="ncav" style="--c:${B?.c || "#5B8DEF"}">${B ? `<span class="fig">${buddySVG(p.buddy, "happy")}</span>` : esc((p.name || p.handle || "?")[0].toUpperCase())}</span>`; };
  const gameThumb = G => { const u = G?.c || (G?.a ? steamCover(G.a) : ""); return u ? `<img class="ncthumb" src="${esc(u)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'ncthumb blank',textContent:'🎮'}))">` : `<span class="ncthumb blank">🎮</span>`; };
  function ncCount(){
    const me = sync.user?.id; if (!me) return 0;
    return (fr.rels || []).filter(r => r.status === "pending" && r.addressee === me).length + fr.notes.filter(n => n.recipient === me && !n.read).length;
  }
  function ncList(){
    const u = sync.user;
    if (!u) return `<div class="ncempty"><p>Sign in to get messages from friends.</p><button class="btn small primary" type="button" data-ncsignin>Sign in</button></div>`;
    if (!fr.me && fr.st === "ready") return `<div class="ncempty"><p>Pick a gamer tag in the Friends tab, then add friends to chat about games.</p><button class="btn small primary" type="button" data-ncfriends>Open Friends</button></div>`;
    if (fr.notesSt === "missing" || NC.fix) return `<div class="ncempty"><p>${NC.fix ? "Your messages setup needs a quick update for replies and reactions." : "Messages need one small table in Supabase."}</p><div class="chips"><button class="btn small" type="button" data-notesql>Copy the setup</button><a class="btn small" href="https://supabase.com/dashboard/project/${esc(sync.ref)}/sql/new" target="_blank" rel="noopener">Open the SQL editor ↗</a></div><p class="note">Paste it, press Run, then reload. It's safe to run again.</p></div>`;
    const me = u.id, req = (fr.rels || []).filter(r => r.status === "pending" && r.addressee === me), T = ncThreads();
    const ids = (fr.rels || []).filter(r => r.status === "accepted").map(r => r.requester === me ? r.addressee : r.requester);
    let h = "";
    if (req.length) h += `<div class="ncsec"><span class="px">Friend requests</span>${req.map(r => `<div class="ncrow">${avatar(r.requester)}<div class="nct"><b>${esc(whoName(r.requester))}</b><small>wants to be friends</small></div><button class="btn small primary" type="button" data-ncaccept="${esc(r.requester)}">Accept</button><button class="btn small" type="button" data-ncdecline="${esc(r.requester)}">Decline</button></div>`).join("")}</div>`;
    h += `<div class="ncsec"><span class="px">Messages</span>${T.length ? T.slice(0, 30).map(t => { const mine = t.last.sender === me, r = t.last.kind === "react";
      return `<button type="button" class="ncrow ncthread${t.unread ? " unread" : ""}" data-ncthread="${esc(t.key)}">${avatar(t.other)}<div class="nct"><b>${esc(whoName(t.other))} <span class="ncg">· ${esc(t.game?.t || "")}</span></b><small>${esc(r ? `${mine ? "You" : whoName(t.other)} reacted ${t.last.body}` : msgLine(t.last, mine))}</small></div><span class="nctime">${esc(relDay(t.last.created_at.slice(0, 10)))}</span>${t.unread ? `<i class="ncdot" aria-label="${t.unread} new"></i>` : ""}</button>`; }).join("")
      : `<p class="note">No messages yet. Open a friend's shelves and tap a game to recommend it, ask how it was, or start a chat.</p>`}</div>`;
    const act = ids.length ? activityBlock(ids) : ""; if (act) h += `<div class="ncsec ncact">${act}</div>`;
    h += `<details class="ncfoot"><summary>Messages setup</summary><p class="note">If replies, reactions or instant delivery don't work, run the messages setup again in Supabase. It's safe to run again and keeps your messages.</p><div class="chips"><button class="btn small" type="button" data-notesql>Copy the setup</button><a class="btn small" href="https://supabase.com/dashboard/project/${esc(sync.ref)}/sql/new" target="_blank" rel="noopener">Open the SQL editor ↗</a></div></details>`;
    return h;
  }
  function ncThread(){
    const me = sync.user?.id, t = ncThreads().find(x => x.key === NC.key) || NC.draft; if (!t) { NC.key = ""; return ncList(); }
    const G = t.game || {}, mine = games.find(g => norm(g.title) === norm(G.t || "")), lastIn = [...t.msgs].reverse().find(n => n.sender !== me);
    const reactsOn = id => { const R = t.reacts.filter(r => r.reply_to === id); const by = {}; R.forEach(r => (by[r.body] = by[r.body] || []).push(r.sender)); return Object.entries(by).map(([e, who]) => `<span class="ncreact${who.includes(me) ? " me" : ""}" title="${esc(who.map(w => w === me ? "You" : whoName(w)).join(", "))}">${esc(e)}${who.length > 1 ? who.length : ""}</span>`).join(""); };
    const bubble = n => { const out = n.sender === me, k = { rec: "🎮 Recommended it", skip: "🙅 Says skip it", ask: "❓ How was it?", answer: "💬 Played it", cheer: "🎉 Cheered the finish" }[n.kind];
      return `<div class="ncmsg${out ? " out" : ""}${stickerOf(n.body) && n.kind === "reply" ? " stk" : ""}"><div class="ncb">${k ? `<span class="nck">${k}</span>` : ""}${n.kind === "answer" || n.kind === "rec" ? (n.game?.r ? `<span class="stars">${stars(n.game.r)}</span>` : "") : ""}${(n.kind === "answer" || n.kind === "rec") && n.game?.fe?.length ? `<div class="fchips">${feelChips(n.game.fe)}</div>` : ""}${stickerOf(n.body) ? `<span class="ncsticker" role="img" aria-label="Sticker: ${esc(STICKERS[stickerOf(n.body)][0])}">${STICKERS[stickerOf(n.body)][1]}</span>` : n.body ? `<p${jumbo(n.body) ? ' class="jumbo"' : ""}>${esc(n.body)}</p>` : ""}
        <small>${esc(relDay(n.created_at.slice(0, 10)))}${out && n.read ? " · seen" : ""}</small></div><div class="ncrx">${reactsOn(n.id)}${out ? "" : `<span class="ncpick">${REACTS.map(e => `<button type="button" data-ncreact="${esc(n.id)}" data-e="${e}" aria-label="React ${e}">${e}</button>`).join("")}</span>`}</div></div>`; };
    const answerable = lastIn && lastIn.kind === "ask" && !t.msgs.some(n => n.sender === me && n.kind === "answer" && n.created_at > lastIn.created_at);
    return `<div class="nchead2"><button class="ncback" type="button" data-ncback aria-label="Back">←</button>${avatar(t.other)}<div class="nct"><b>${esc(whoName(t.other))}</b><small>@${esc((fr.profiles[t.other] || {}).handle || "")}</small></div></div>
      <div class="ncgame">${gameThumb(G)}<div class="nct"><b>${esc(G.t || "")}</b><small>${mine ? `In your ${esc((STATUS[mine.status] || "library").toLowerCase())}${mine.rating ? " · " + stars(mine.rating) : ""}` : "Not in your library"}</small></div>
        ${mine ? `<button class="btn small" type="button" data-ncopen="${esc(mine.id)}">Open</button>` : `<button class="btn small primary" type="button" data-ncadd="backlog">+ Backlog</button><button class="btn small" type="button" data-ncadd="wishlist">♥</button>`}</div>
      <div class="ncmsgs">${t.msgs.map(bubble).join("") || `<p class="note">Say something about ${esc(G.t || "this game")}.</p>`}</div>
      ${NC.answering ? replyForm(lastIn) : `${answerable ? `<button class="btn small primary ncanswer" type="button" data-ncanswer="${esc(lastIn.id)}">⭐ Answer with your rating</button>` : ""}
      ${NC.trayOpen ? nTray() : ""}<form class="nccompose" data-nccompose><button class="nctraybtn" type="button" data-nctray aria-label="Emoji and stickers" aria-expanded="${!!NC.trayOpen}">😊</button><textarea rows="1" maxlength="500" placeholder="Message ${esc(whoName(t.other))}…" aria-label="Message"></textarea><button class="btn small primary" type="submit" aria-label="Send">➤</button></form>`}`;
  }
  function ncRender(){
    const el = $("#ncenter"); if (!el || !NC.open) return;
    const keepText = el.querySelector(".nccompose textarea")?.value || "";
    el.innerHTML = `<div class="ncpanel" role="dialog" aria-label="Notifications">${NC.key ? ncThread() : `<div class="nchead"><b>Notifications</b>${ncCount() ? `<button class="linkbtn" type="button" data-ncallread>Mark all read</button>` : ""}<button class="ncx" type="button" data-ncx aria-label="Close">×</button></div>${ncList()}`}</div>`;
    const ta = el.querySelector(".nccompose textarea"); if (ta && keepText) ta.value = keepText;
    const box = el.querySelector(".ncmsgs"); if (box) box.scrollTop = box.scrollHeight;
    if (NC.key) { const me = sync.user?.id, t = ncThreads().find(x => x.key === NC.key), ids = t ? [...t.msgs, ...t.reacts].filter(n => n.recipient === me && !n.read).map(n => n.id) : []; if (ids.length) markNotesRead(ids).then(() => { ncBadge(); }); }
  }
  function ncBadge(){
    const b = $("#bell-btn"); if (!b) return; const n = ncCount(); let i = b.querySelector(".nbadge");
    b.hidden = !sync.user;
    if (!n) { i?.remove(); return; } if (!i) { i = document.createElement("i"); i.className = "nbadge"; b.append(i); } i.textContent = n > 9 ? "9+" : n;
  }
  async function ncOpen(key){
    NC.open = true; NC.key = key || ""; NC.answering = ""; const el = $("#ncenter"); el.hidden = false; $("#bell-btn")?.setAttribute("aria-expanded", "true");
    if (!NC.key) el.innerHTML = `<div class="ncpanel"><div class="nchead"><b>Notifications</b><button class="ncx" type="button" data-ncx aria-label="Close">×</button></div><p class="note">Loading…</p></div>`;
    ncRender();
    if (sync.user) { try { if (fr.st !== "ready") await friendsLoad(true); else await loadNotes(); } catch {} ncRender(); ncBadge(); }
  }
  function ncClose(){ NC.open = false; NC.trayOpen = false; NC.key = ""; NC.draft = null; const el = $("#ncenter"); if (el) el.hidden = true; $("#bell-btn")?.setAttribute("aria-expanded", "false"); }
  // open a conversation about one of a friend's games, even before anyone has written
  function ncStart(fid2, g){ const G = noteGame(g), key = fid2 + "|" + norm(G.t); NC.draft = { key, other: fid2, game: G, msgs: [], reacts: [] }; ncOpen(key); }
  async function ncSend(kind, body, replyTo){
    const t = ncThreads().find(x => x.key === NC.key) || NC.draft; if (!t) return false;
    const r = await sendNoteRaw(t.other, kind, { ...t.game }, body, replyTo);
    if (r === "old") { NC.fix = true; NC.key = ""; ncRender(); return false; }
    return r === "ok";
  }
  // like sendNote, but tells an old setup (no replies or reactions yet) apart from other problems
  async function sendNoteRaw(to, kind, game, body = "", replyTo = null){
    const c = sync.client; if (!c) return "err";
    const { error } = await c.from("sp_notes").insert({ recipient: to, kind, game, body: String(body).slice(0, 500), reply_to: replyTo });
    if (error) { if (error.code === "23514" || /check constraint/i.test(error.message || "")) return "old"; toast(frMissing(error) ? "Messages need a one-time database step." : "Couldn't send that right now."); return "err"; }
    await loadNotes(); return "ok";
  }
  // the bell lives in the top bar; the panel floats under it (a sheet on phones)
  (function ncInit(){
    const settingsBtn = $("#settings-btn"); if (!settingsBtn) return;
    settingsBtn.insertAdjacentHTML("beforebegin", `<button class="ibtn bell" type="button" id="bell-btn" aria-label="Notifications" aria-expanded="false" aria-controls="ncenter" hidden><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button>`);
    document.body.insertAdjacentHTML("beforeend", `<div class="ncenter" id="ncenter" hidden></div>`);
    $("#bell-btn").addEventListener("click", () => NC.open ? ncClose() : ncOpen());
    const el = $("#ncenter");
    el.addEventListener("click", async e => {
      const t = e.target;
      if (t.closest("[data-ncx]")) return ncClose();
      if (t.closest("[data-ncback]")) { NC.key = ""; NC.draft = null; NC.answering = ""; return ncRender(); }
      if (t.closest("[data-ncsignin]")) { ncClose(); return sync.open(); }
      if (t.closest("[data-ncfriends]")) { ncClose(); showTab("friends"); return; }
      if (t.closest("[data-notesql]")) { fetch(NOTES_SQL_URL).then(r => r.text()).then(x => copyText(x, "Setup copied. Paste it into the SQL editor and press Run.")); return; }
      const th = t.closest("[data-ncthread]"); if (th) { NC.key = th.dataset.ncthread; NC.answering = ""; return ncRender(); }
      if (t.closest("[data-ncallread]")) { const me = sync.user?.id; await markNotesRead(fr.notes.filter(n => n.recipient === me && !n.read).map(n => n.id)); ncRender(); ncBadge(); return; }
      const ac = t.closest("[data-ncaccept]"); if (ac) { ac.disabled = true; await frAct(() => sync.client.from("sp_friends").update({ status: "accepted" }).match({ requester: ac.dataset.ncaccept, addressee: sync.user.id }), "Friend added."); ncRender(); ncBadge(); return; }
      const dc = t.closest("[data-ncdecline]"); if (dc) { const id = dc.dataset.ncdecline, u = sync.user.id; await frAct(() => sync.client.from("sp_friends").delete().or(`and(requester.eq.${u},addressee.eq.${id}),and(requester.eq.${id},addressee.eq.${u})`), ""); ncRender(); ncBadge(); return; }
      const rx = t.closest("[data-ncreact]"); if (rx) { rx.disabled = true; const me = sync.user.id, old = fr.notes.find(n => n.kind === "react" && n.sender === me && n.reply_to === rx.dataset.ncreact && n.body === rx.dataset.e);
        if (old) { await sync.client.from("sp_notes").delete().eq("id", old.id); await loadNotes(); } else await ncSend("react", rx.dataset.e, rx.dataset.ncreact); ncRender(); return; }
      const op = t.closest("[data-ncopen]"); if (op) { ncClose(); openById(op.dataset.ncopen); return; }
      const ad = t.closest("[data-ncadd]"); if (ad) { const tt = ncThreads().find(x => x.key === NC.key) || NC.draft; if (tt) { addFromDiscover({ title: tt.game.t, wikidata: tt.game.w, steamAppId: tt.game.a, coverUrl: tt.game.c, year: tt.game.y }, ad.dataset.ncadd); setTimeout(ncRender, 300); } return; }
      if (t.closest("[data-nctray]")) { NC.trayOpen = !NC.trayOpen; ncRender(); el.querySelector(".nccompose textarea")?.focus(); return; }
      const tb = t.closest("[data-nctab]"); if (tb) { NC.tray = tb.dataset.nctab; return ncRender(); }
      const em = t.closest("[data-ncemoji]"); if (em) { const ta = el.querySelector(".nccompose textarea"); if (ta) { const a = ta.selectionStart ?? ta.value.length, b2 = ta.selectionEnd ?? a; ta.value = (ta.value.slice(0, a) + em.dataset.ncemoji + ta.value.slice(b2)).slice(0, 500); const c = Math.min(a + em.dataset.ncemoji.length, ta.value.length); ta.focus(); ta.setSelectionRange(c, c); } return; }
      const sk = t.closest("[data-ncsticker]"); if (sk) { el.querySelectorAll("[data-ncsticker]").forEach(b => b.disabled = true); const tt = ncThreads().find(x => x.key === NC.key) || NC.draft, last = tt?.msgs[tt.msgs.length - 1];
        if (await ncSend("reply", `:st:${sk.dataset.ncsticker}:`, last?.id || null)) { NC.draft = null; NC.trayOpen = false; } ncRender(); return; }
      const an = t.closest("[data-ncanswer]"); if (an) { NC.answering = an.dataset.ncanswer; return ncRender(); }
      if (t.closest("[data-replycancel]")) { NC.answering = ""; return ncRender(); }
      const rs = t.closest("[data-rstar]"); if (rs) { const v = +rs.dataset.rstar; rs.parentElement.querySelectorAll("[data-rstar]").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.rstar <= v))); return; }
      const rf = t.closest("[data-rfeel]"); if (rf) { const on = rf.getAttribute("aria-pressed") !== "true"; if (on && rf.parentElement.querySelectorAll('[aria-pressed="true"]').length >= 4) { toast("Pick up to 4."); return; } rf.setAttribute("aria-pressed", String(on)); return; }
    });
    el.addEventListener("submit", async e => {
      e.preventDefault();
      const f = e.target;
      if (f.matches(".nccompose")) { const ta = f.querySelector("textarea"), txt = ta.value.trim(); if (!txt) return; f.querySelector("button").disabled = true; const t = ncThreads().find(x => x.key === NC.key) || NC.draft, last = t?.msgs[t.msgs.length - 1];
        if (await ncSend("reply", txt, last?.id || null)) { ta.value = ""; NC.draft = null; NC.trayOpen = false; } ncRender(); return; }
      if (f.matches(".nreply")) { const n = fr.notes.find(x => x.id === f.dataset.replyto); if (!n) return;
        const r = f.querySelectorAll('[data-rstar][aria-pressed="true"]').length, fe = [...f.querySelectorAll('[data-rfeel][aria-pressed="true"]')].map(b => b.dataset.rfeel), body = f.querySelector("textarea").value.trim();
        f.querySelector("[type=submit]").disabled = true; if (await sendNote(n.sender, "answer", { ...n.game, r, fe }, body, n.id)) { NC.answering = ""; toast("Sent. Thanks for sharing!"); } ncRender(); }
    });
    el.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey && e.target.matches(".nccompose textarea")) { e.preventDefault(); e.target.form.requestSubmit(); } });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && NC.open) ncClose(); });
    document.addEventListener("pointerdown", e => { if (NC.open && !e.target.closest("#ncenter,#bell-btn,.frgame-pop,.frpop,.scrim")) ncClose(); });
    // live: a new note pops in the moment it's sent (needs the realtime line in notes.sql)
    let live = null; setInterval(() => { const c = sync.client, u = sync.user; ncBadge(); if (!c || !u || live === u.id) return; live = u.id;
      try { c.channel("notes-" + u.id).on("postgres_changes", { event: "INSERT", schema: "public", table: "sp_notes", filter: `recipient=eq.${u.id}` }, async () => { frPollAt = 0; await frPoll(true); await loadNotes(); ncRender(); ncBadge(); if (tab === "friends") repaintFriends(); }).subscribe(); } catch {}
    }, 3000);
  })();
