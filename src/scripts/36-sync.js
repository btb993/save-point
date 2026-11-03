  // ================= sync (shares your Book Nook's Supabase project and login) =================
  const sync = (() => {
    const TABLE = "game_library";
    const DEFAULT = { url: "https://adkfuzmontecmhfnrcyb.supabase.co", key: "sb_publishable_sDtY-M37SKKBOqUe0mlZUA_jOrOW4E9" };
    const shared = lsGet("reading-ledger-sync", null);
    const cfg = shared?.url && shared?.key ? { url: shared.url, key: shared.key } : DEFAULT;
    const ref = (cfg.url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/) || [])[1] || "";
    const SQL = `create table if not exists public.${TABLE} (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.${TABLE} enable row level security;
create policy "read own games" on public.${TABLE} for select using (auth.uid() = user_id);
create policy "add own games" on public.${TABLE} for insert with check (auth.uid() = user_id);
create policy "change own games" on public.${TABLE} for update using (auth.uid() = user_id);
alter publication supabase_realtime add table public.${TABLE};`;
    let client = null, user = null, state = "off", detail = "", busy = false, again = false, timer = null, lastPush = null, chan = null, lastOk = null;
    const LABEL = { off: "Sync", signedout: "Sign in to sync", syncing: "Syncing…", ok: "Synced", setup: "Finish sync setup", offline: "Offline", error: "Sync problem" };
    function paint(){
      $("#sync-label").textContent = LABEL[state] || "Sync";
      $("#sync-dot").className = "dot " + (state === "ok" ? "ok" : state === "syncing" ? "busy" : ["setup", "error", "signedout"].includes(state) ? "warn" : "");
      $("#storage-note").textContent = user && state === "ok" ? `Synced to your account (${user.email}). Changes reach your other devices within seconds.` : "Your games are saved on this device. Sign in with your Book Nook account to sync them to your phone.";
      if ($("#sync-panel")) panel();
    }
    const set = (s, d = "") => { state = s; detail = d; if (s === "ok") lastOk = new Date(); paint(); };
    const sig = lib => (lib.games || []).map(g => g.id + ":" + (g.updatedAt || 0)).sort().join(",") + "|" + Object.keys(lib.deleted || {}).sort().join(",");
    function merge(a, b){
      const del = { ...(a.deleted || {}) };
      for (const [k, v] of Object.entries(b.deleted || {})) del[k] = Math.max(del[k] || 0, v);
      const m = new Map();
      for (const g of [...(a.games || []), ...(b.games || [])]) {
        const have = m.get(g.id);
        if (!have) { m.set(g.id, g); continue; }
        const [old, nw] = (g.updatedAt || 0) >= (have.updatedAt || 0) ? [have, g] : [g, have];
        const sess = new Map(); [...(old.sessions || []), ...(nw.sessions || [])].forEach(s => sess.set(s.d, s));
        m.set(g.id, { ...nw, sessions: [...sess.values()].sort((x, y) => x.d.localeCompare(y.d)) });
      }
      return { games: [...m.values()].filter(g => !(del[g.id] && del[g.id] >= (g.updatedAt || 0))), deleted: del };
    }
    const missingTable = e => ["42P01", "PGRST205", "PGRST202"].includes(e?.code) || /game_library|schema cache|does not exist/i.test(e?.message || "");
    async function connect(){
      if (!window.supabase?.createClient) return set("off");
      try { client = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true, storageKey: "reading-ledger-auth" } }); }
      catch { return set("error", "The sync settings don't look right."); }
      const { data } = await client.auth.getSession(); user = data.session?.user || null;
      client.auth.onAuthStateChange((_e, s) => { const u = s?.user || null, changed = (u?.id || null) !== (user?.id || null); user = u; if (changed) { if (user) { subscribe(); pull(); } else { unsubscribe(); set("signedout"); } } });
      if (user) { subscribe(); pull(); } else set("signedout");
    }
    async function pull(){
      if (!client || !user) return;
      if (busy) { again = true; return; }
      busy = true; set("syncing");
      try {
        const { data, error } = await client.from(TABLE).select("data, updated_at").eq("user_id", user.id).maybeSingle();
        if (error) throw error;
        const remote = data?.data || null, local = { games, deleted };
        const merged = remote ? merge(local, remote) : local;
        if (sig(merged) !== sig(local)) { games = merged.games; deleted = merged.deleted; saveLocal(); render(); }
        const rn = remote?.nook, rnAt = +rn?.updatedAt || 0;
        if (rn && rnAt > nook.updatedAt) { lsSet(LS_NOOK, rn); nook = loadNook(); renderRack(); }
        if (!remote || sig(merged) !== sig(remote) || nook.updatedAt > rnAt) {
          lastPush = new Date().toISOString();
          const { error: e2 } = await client.from(TABLE).upsert({ user_id: user.id, data: { games: merged.games, deleted: merged.deleted, nook, app: "save-point" }, updated_at: lastPush });
          if (e2) throw e2;
        }
        set("ok");
      } catch (e) {
        if (missingTable(e)) set("setup");
        else if (!navigator.onLine) set("offline");
        else set("error", e?.message || "Something went wrong.");
      } finally { busy = false; if (again) { again = false; pull(); } }
    }
    function subscribe(){
      unsubscribe(); if (!client || !user) return;
      try { chan = client.channel("games-" + user.id).on("postgres_changes", { event: "*", schema: "public", table: TABLE, filter: `user_id=eq.${user.id}` }, p => { if (p.new?.updated_at && lastPush && new Date(p.new.updated_at).getTime() === new Date(lastPush).getTime()) return; pull(); }).subscribe(); } catch {}
    }
    function unsubscribe(){ if (chan) { try { client.removeChannel(chan); } catch {} chan = null; } }
    function schedule(){ if (!user) return; clearTimeout(timer); timer = setTimeout(pull, 1200); }
    addEventListener("online", () => pull());
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") pull(); });

    let authMode = "in", authMsg = "";
    function panel(){
      const el = $("#sync-panel"); if (!el) return;
      const head = `<div class="reshead"><h2>Sync between your devices</h2><button class="btn small" type="button" data-mclose>Close</button></div>`;
      const appUrl = location.protocol.startsWith("http") ? location.href.split("#")[0] : "";
      const phone = appUrl ? `<div class="opt"><span class="px">On your phone</span><div class="urlbox"><span>${esc(appUrl)}</span><button class="btn small" type="button" data-copy="${esc(appUrl)}">Copy</button></div><div class="note">Open this address on your phone and sign in. iPhone: Safari, Share, Add to Home Screen. Android: Chrome, ⋮ menu, Install app.</div></div>` : "";
      if (!window.supabase?.createClient) { el.innerHTML = head + `<p class="note">The sync library couldn't load. Check your internet connection and reload.</p>`; return; }
      if (!user) {
        el.innerHTML = head + `<p class="note" style="margin:0">Use the same email and password as your Book Nook. Your games go into your own Supabase database, next to your books, and only you can sign in to it.</p>
          <form class="authf" id="auth-form"><input id="au-email" type="email" autocomplete="email" placeholder="Email" required><input id="au-pass" type="password" autocomplete="${authMode === "in" ? "current-password" : "new-password"}" placeholder="Password" minlength="6" required>
          ${authMode === "up" ? `<input id="au-invite" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Invite code (ask whoever shared the app)" required>` : ""}
          <div class="reshead"><button class="btn primary" type="submit">${authMode === "in" ? "Sign in" : "Create account"}</button><button class="linkbtn" type="button" id="au-mode">${authMode === "in" ? "New here? Create an account" : "Have an account? Sign in"}</button></div>
          ${authMsg ? `<div class="note">${esc(authMsg)}</div>` : ""}</form>`;
        return;
      }
      if (state === "setup") {
        el.innerHTML = head + `<p style="margin:0">You're signed in as <b>${esc(user.email)}</b>. One last, one-time step: give your database a place for games.</p>
          <ol class="steps"><li><button class="btn small" type="button" data-copy-sql>Copy the database setup</button></li>
          <li><a class="btn small" href="https://supabase.com/dashboard/project/${esc(ref)}/sql/new" target="_blank" rel="noopener">Open the Supabase SQL editor ↗</a> and sign in if asked.</li>
          <li>Paste it in and press <b>Run</b>. It should say “Success. No rows returned.”</li>
          <li><button class="btn primary small" type="button" data-retry>Check again</button></li></ol>
          <div class="note">This only adds a new table for games. Your Book Nook data isn't touched.</div>`;
        return;
      }
      el.innerHTML = head + `<p style="margin:0">Signed in as <b>${esc(user.email)}</b>.</p>
        <p class="note" style="margin:0">${state === "ok" ? `Everything is synced${lastOk ? ` (checked ${lastOk.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` : ""}.` : state === "syncing" ? "Syncing now…" : state === "offline" ? "You're offline. Changes sync when you're back." : `Sync stopped: ${esc(detail)}`}</p>
        <div class="chips"><button class="btn small" type="button" data-retry>Sync now</button><button class="btn small" type="button" data-signout>Sign out</button></div>
        ${phone}
        <div class="note">Signing out here also signs this browser out of your Book Nook, because they share one login.</div>`;
    }
    function open(){
      openModal(`<div class="modal" role="dialog" aria-modal="true" aria-label="Sync" id="sync-panel"></div>`, async e => {
        const t = e.target;
        if (t.id === "au-mode") { authMode = authMode === "in" ? "up" : "in"; authMsg = ""; panel(); return; }
        if (t.closest("[data-retry]")) { pull(); return; }
        if (t.closest("[data-signout]")) { await client.auth.signOut(); return; }
        const c = t.closest("[data-copy]"); if (c) { copy(c.dataset.copy, "Address copied"); return; }
        if (t.closest("[data-copy-sql]")) { copy(SQL, "Database setup copied"); return; }
      });
      $("#scrim").addEventListener("submit", async e => {
        if (e.target.id !== "auth-form") return; e.preventDefault();
        const email = $("#au-email").value.trim(), password = $("#au-pass").value, invite = ($("#au-invite")?.value || "").trim().toLowerCase();
        authMsg = authMode === "in" ? "Signing in…" : "Creating your account…"; panel(); $("#au-email").value = email; if ($("#au-invite")) $("#au-invite").value = invite;
        // the shared Book Nook project only lets new accounts in with the invite code
        const res = authMode === "in" ? await client.auth.signInWithPassword({ email, password }) : await client.auth.signUp({ email, password, options: { data: { invite, name: email.split("@")[0].slice(0, 40), app: "save-point" } } });
        if (res.error) { const m = res.error.message || "";
          authMsg = /database error saving new user|invite/i.test(m) ? "That invite code isn't right. Ask whoever shared the app with you." : /already registered/i.test(m) ? "That email already has an account. Sign in instead." : /invalid login/i.test(m) ? "That email and password don't match." : m;
          panel(); $("#au-email").value = email; if ($("#au-invite")) $("#au-invite").value = invite; return; }
        if (authMode === "up" && !res.data.session) { authMsg = "Check your email to confirm the account, then sign in here."; authMode = "in"; panel(); }
      });
      panel();
    }
    async function copy(text, ok){ try { await navigator.clipboard.writeText(text); toast(ok); } catch { const ta = document.createElement("textarea"); ta.value = text; document.body.append(ta); ta.select(); try { document.execCommand("copy"); toast(ok); } catch { toast("Couldn't copy. Select the text and copy it yourself."); } ta.remove(); } }
    return { connect, schedule, pull, open, paint, get state(){ return state; }, get client(){ return client; }, get user(){ return user; }, ref, cfg };
  })();
