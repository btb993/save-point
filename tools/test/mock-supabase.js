// A tiny in-memory stand-in for supabase-js, for browser tests. window.__DB holds the tables; window.__ME is the signed-in user id.
(function(){
  const DB = window.__DB = window.__DB || { game_library: [], sp_profiles: [], sp_friends: [], sp_shelves: [], sp_notes: [], sp_public: [] };
  const me = () => window.__ME;
  function q(table){
    let rows = null, op = "select", payload = null, filters = [], order = null, lim = null, single = false;
    const api = {
      select(){ return api; }, insert(p){ op = "insert"; payload = p; return api; }, upsert(p){ op = "upsert"; payload = p; return api; }, update(p){ op = "update"; payload = p; return api; }, delete(){ op = "delete"; return api; },
      eq(k, v){ filters.push(r => r[k] === v); return api; }, in(k, vs){ filters.push(r => vs.includes(r[k])); return api; },
      match(o){ filters.push(r => Object.entries(o).every(([k, v]) => r[k] === v)); return api; },
      or(s){ const parts = [...s.matchAll(/and\(([^)]*)\)/g)].map(m => m[1].split(",").map(c => c.split(".eq."))); filters.push(r => parts.some(p => p.every(([k, v]) => r[k] === v))); return api; },
      order(k, o){ order = [k, o?.ascending !== false]; return api; }, limit(n){ lim = n; return api; },
      maybeSingle(){ single = true; return api.then(); },
      then(res, rej){ return Promise.resolve(run()).then(res, rej); }
    };
    function vis(r){ if (table === "sp_notes") return [r.sender, r.recipient].includes(me()); return true; }
    function run(){
      const T = DB[table] = DB[table] || [];
      if (op === "insert") { const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), read: false, sender: me(), reply_to: null, ...payload };
        if (table === "sp_notes" && window.__OLDKINDS && !["rec", "skip", "ask", "answer", "cheer"].includes(row.kind)) return { error: { code: "23514", message: "violates check constraint" } };
        T.push(row); (window.__onInsert || []).forEach(f => f(table, row)); return { data: [row], error: null }; }
      if (op === "upsert") { const k = Object.keys(payload)[0], i = T.findIndex(r => r[k] === payload[k]); if (i >= 0) T[i] = { ...T[i], ...payload }; else T.push({ ...payload }); return { data: null, error: null }; }
      let out = T.filter(vis).filter(r => filters.every(f => f(r)));
      if (op === "update") { out.forEach(r => Object.assign(r, payload)); return { data: null, error: null }; }
      if (op === "delete") { DB[table] = T.filter(r => !out.includes(r)); return { data: null, error: null }; }
      if (order) out = [...out].sort((a, b) => (a[order[0]] > b[order[0]] ? 1 : -1) * (order[1] ? 1 : -1));
      if (lim) out = out.slice(0, lim);
      out = JSON.parse(JSON.stringify(out));
      return single ? { data: out[0] || null, error: null } : { data: out, error: null };
    }
    return api;
  }
  window.supabase = { createClient(){ return {
    from: q,
    auth: { getSession: async () => ({ data: { session: me() ? { user: { id: me(), email: "me@test" }, access_token: "eyTEST" } : null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } } }), signOut: async () => ({}) },
    channel(){ const ch = { on(_e, _f, cb){ (window.__onInsert = window.__onInsert || []).push((t, row) => { if (t === "sp_notes" && row.recipient === me()) cb({ new: row }); }); return ch; }, subscribe(){ return ch; }, unsubscribe(){} }; return ch; },
    removeChannel(){}
  }; } };
})();
