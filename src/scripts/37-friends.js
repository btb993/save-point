  // ================= friends =================
  // Friends see a copy of your shelves and stats (sp_shelves), never your notes or session details.
  // Needs three extra tables in the same Supabase project; supabase/friends.sql creates them.
  const FRIENDS_SQL_URL = "supabase/friends.sql";
  const fr = { st: "idle", at: 0, err: "", me: null, rels: [], profiles: {}, shelves: {}, pushedSig: "", pushTimer: null, sending: false, msg: "", notes: [], notesSt: "", reply: null };
  // ---------- notes between friends: recommend, "skip it", "how was it?", answers and cheers (supabase/notes.sql) ----------
  const NOTES_SQL_URL = "supabase/notes.sql";
  const NOTE_KIND = { rec: ["🎮", "recommends"], skip: ["🙅", "says skip"], ask: ["❓", "asks how this was:"], answer: ["💬", "on"], cheer: ["🎉", "cheered you for finishing"] };
  const noteGame = g => ({ t: String(g.title || g.t || "").slice(0, 120), w: /^Q\d+$/.test(g.wikidata || g.w || "") ? (g.wikidata || g.w) : "", a: /^\d{1,10}$/.test(String(g.steamAppId || g.a || "")) ? String(g.steamAppId || g.a) : "", c: (s => /^https:\/\//.test(s) ? s.slice(0, 400) : "")(String(g.coverUrl || g.coverPick || g.c || "")), y: Number.isInteger(+g.year || +g.y) ? (+g.year || +g.y) : null });
  const cleanNoteGame = x => { x = x && typeof x === "object" ? x : {}; return { ...noteGame(x), r: Math.max(0, Math.min(5, +x.r || 0)), fe: (Array.isArray(x.fe) ? x.fe : []).filter(f => typeof f === "string" && FEEL.has(f)).slice(0, 4) }; };
  async function loadNotes(){
    const c = sync.client, u = sync.user; if (!c || !u) return;
    const r = await c.from("sp_notes").select("*").order("created_at", { ascending: false }).limit(120);
    if (r.error) { fr.notesSt = frMissing(r.error) || /sp_notes/i.test(r.error.message || "") ? "missing" : "error"; return; }
    fr.notesSt = "ok"; fr.notes = (r.data || []).map(n => ({ ...n, game: cleanNoteGame(n.game), body: String(n.body || "").slice(0, 500) }));
  }
  async function sendNote(to, kind, game, body = "", replyTo = null){
    const c = sync.client; if (!c) return false;
    const { error } = await c.from("sp_notes").insert({ recipient: to, kind, game, body: String(body).slice(0, 500), reply_to: replyTo });
    if (error) { toast(frMissing(error) || /sp_notes/i.test(error.message || "") ? "Notes need a one-time database step: see the Friends tab." : "Couldn't send that right now."); return false; }
    await loadNotes(); return true;
  }
  const noteFrom = n => fr.profiles[n.sender] || { handle: "friend", name: "" };
  const feelChips = ids => (ids || []).map(id => FEEL.get(id)).filter(Boolean).map(f => `<span class="fchip" style="--fc:${f.c}">${esc(f.n)}</span>`).join("");
  // how alike your ratings are, from games you've both rated
  function tasteMatch(d){
    const mine = new Map(games.filter(g => g.rating).map(g => [norm(g.title), g.rating])), both = (d?.games || []).filter(g => g.r && mine.has(norm(g.t)));
    if (both.length < 3) return null;
    const diff = both.reduce((a, g) => a + Math.abs(g.r - mine.get(norm(g.t))), 0) / both.length;
    return { pct: Math.max(0, Math.round(100 - diff * 22)), n: both.length };
  }
  const frMissing = e => ["42P01", "PGRST205", "PGRST202", "42883"].includes(e?.code) || /sp_profiles|sp_friends|sp_shelves|schema cache|does not exist/i.test(e?.message || "");
  const handleOk = h => /^[a-z0-9_]{3,20}$/.test(h);
  async function copyText(text, ok){ try { await navigator.clipboard.writeText(text); toast(ok); } catch { toast("Couldn't copy. Select the text and copy it yourself."); } }
  // the shareable copy of your library
  function shareSnapshot(){
    const V = (() => { try { return soulData(); } catch { return null; } })();
    const idx = new Map(games.map((g, i) => [g.id, i]));
    const img = u => u && !String(u).startsWith("data:") ? String(u).slice(0, 400) : "";
    return { v: 1, at: new Date().toISOString(), name: fr.me?.name || "", handle: fr.me?.handle || "",
      games: games.map(g => ({ st: g.started || "", fe: feelsOf(g).slice(0, 4), lp: lastPlayed(g) || "", t: g.title, s: g.status, p: mainPlat(g), r: g.rating || 0, h: Number(g.hours) || 0, f: g.finished || "", y: g.year || null, g: (g.genres || []).slice(0, 3), a: g.steamAppId || "", c: img(g.coverPick !== "none" ? g.coverPick || g.coverUrl : ""), l: img(g.logoPick !== "none" ? g.logoPick || g.logoUrl : ""), d: Array.isArray(g.dna) ? g.dna : undefined, w: g.wikidata || "" })),
      nook: { scene: nook.scene, best: (nook.best || []).map(id => idx.get(id)).filter(x => x != null).slice(0, 10), shelves: nook.shelves.filter(s => s.kind === "custom" && !s.hidden).map(s => ({ n: s.name, c: s.color, i: shelfGames(s).map(g => idx.get(g.id)).filter(x => x != null) })) },
      soul: V?.S ? { title: V.hyb ? V.hyb.title : V.dna[0]?.name || "", dna: V.dna.slice(0, 5).map(x => [x.k, x.pct]), rank: V.S.rank } : null };
  }
  function pushShelves(){
    clearTimeout(fr.pushTimer);
    fr.pushTimer = setTimeout(async () => {
      const c = sync.client, u = sync.user; if (!c || !u || !fr.me) return;
      const data = shareSnapshot(), sig = JSON.stringify({ ...data, at: "" }); if (sig === fr.pushedSig) return;
      const { error } = await c.from("sp_shelves").upsert({ user_id: u.id, data, updated_at: new Date().toISOString() });
      if (!error) fr.pushedSig = sig;
      if (settings.pubOn) pubPush();
    }, 6000);
  }
  async function friendsLoad(force){
    const c = sync.client, u = sync.user;
    if (!c || !u) { fr.st = "signedout"; return; }
    if (fr.st === "loading" || (!force && fr.st === "ready" && Date.now() - fr.at < 60000)) return;
    fr.st = "loading"; repaintFriends();
    try {
      const me = await c.from("sp_profiles").select("*").eq("user_id", u.id).maybeSingle(); if (me.error) throw me.error;
      fr.me = me.data || null;
      const rels = await c.from("sp_friends").select("*"); if (rels.error) throw rels.error;
      fr.rels = rels.data || [];
      const ids = [...new Set(fr.rels.flatMap(r => [r.requester, r.addressee]).filter(id => id !== u.id))];
      fr.profiles = {}; fr.shelves = {};
      if (ids.length) {
        const ps = await c.from("sp_profiles").select("*").in("user_id", ids); if (ps.error) throw ps.error;
        (ps.data || []).forEach(p => fr.profiles[p.user_id] = p);
        const friendIds = fr.rels.filter(r => r.status === "accepted").map(r => r.requester === u.id ? r.addressee : r.requester);
        if (friendIds.length) { const sh = await c.from("sp_shelves").select("user_id, data, updated_at").in("user_id", friendIds); if (!sh.error) (sh.data || []).forEach(x => fr.shelves[x.user_id] = { ...x, data: cleanFriend(x.data) }); }
      }
      try { await loadNotes(); } catch {}
      fr.st = "ready"; fr.at = Date.now(); fr.err = "";
      if (fr.me) pushShelves();
    } catch (e) { fr.st = frMissing(e) ? "setup" : "error"; fr.err = e?.message || ""; }
    repaintFriends();
  }
  function repaintFriends(){ const el = document.getElementById("y-friends"); if (!el) return; const t = document.createElement("div"); t.innerHTML = friendsHTML(true); el.replaceWith(t.firstElementChild); }
  function renderFriends(){ $("#view-friends").innerHTML = friendsHTML(); }
  // A friend's shared data comes from someone else's device: keep only expected fields, types and lengths,
  // so nothing in it can break out of the page's HTML or styles.
  function cleanFriend(d){
    if (!d || typeof d !== "object") return {};
    const str = (v, n = 200) => typeof v === "string" ? v.slice(0, n) : "", num = (v, lo, hi) => { const x = Number(v); return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : 0; };
    const ST = new Set(["playing", "finished", "played", "backlog", "wishlist", "dropped"]), url = v => typeof v === "string" && (/^https:\/\/[^\s"'<>]+$/i.test(v) || v === "none") ? v.slice(0, 600) : "";
    const games = (Array.isArray(d.games) ? d.games : []).slice(0, 3000).filter(g => g && typeof g === "object").map(g => ({
      t: str(g.t), s: ST.has(g.s) ? g.s : "backlog", p: str(g.p, 40), r: num(g.r, 0, 5), h: num(g.h, 0, 1e5), f: /^\d{4}(-\d{2}){0,2}$/.test(g.f || "") ? g.f : "",
      st: /^\d{4}(-\d{2}){0,2}$/.test(g.st || "") ? g.st : "", lp: /^\d{4}-\d{2}-\d{2}$/.test(g.lp || "") ? g.lp : "", fe: (Array.isArray(g.fe) ? g.fe : []).filter(x => typeof x === "string" && FEEL.has(x)).slice(0, 4),
      y: Number.isInteger(g.y) ? g.y : null, g: (Array.isArray(g.g) ? g.g : []).filter(x => typeof x === "string").slice(0, 8).map(x => x.slice(0, 40)),
      a: /^\d{1,10}$/.test(String(g.a || "")) ? String(g.a) : "", c: url(g.c), l: url(g.l), d: g.d && typeof g.d === "object" && !Array.isArray(g.d) ? Object.fromEntries(Object.entries(g.d).filter(([k, v]) => Object.hasOwn(AIDX, k) && Number.isFinite(+v)).map(([k, v]) => [k, +v])) : undefined, w: /^Q\d{1,12}$/.test(g.w || "") ? g.w : "" }));
    const shelves = (Array.isArray(d.nook?.shelves) ? d.nook.shelves : []).slice(0, 40).map(sh => ({ n: str(sh?.n, 40), c: /^#[0-9a-f]{3,8}$/i.test(sh?.c || "") ? sh.c : "", i: (Array.isArray(sh?.i) ? sh.i : []).filter(Number.isInteger).slice(0, 3000) }));
    const soul = d.soul && typeof d.soul === "object" ? { title: str(d.soul.title, 80), rank: str(d.soul.rank, 40), dna: (Array.isArray(d.soul.dna) ? d.soul.dna : []).filter(x => Array.isArray(x) && typeof x[0] === "string" && Object.hasOwn(AIDX, x[0])).slice(0, 20).map(([k, v]) => [k.slice(0, 20), Math.round(num(v, 0, 100))]) } : null;
    const best = (Array.isArray(d.nook?.best) ? d.nook.best : []).filter(i => Number.isInteger(i) && i >= 0 && i < games.length).slice(0, 10);
    return { games, nook: { shelves, best }, soul, at: typeof d.at === "string" && /^\d{4}-\d{2}-\d{2}[T0-9:.Z+-]{0,20}$/.test(d.at) ? d.at : "" };
  }

