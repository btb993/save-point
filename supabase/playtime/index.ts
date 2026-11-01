// Save Point: "playtime" Edge Function
// Looks up how long games usually take, so games with no hours logged can show an estimate.
//  - IGDB time-to-beat (main story / main + extras / 100%), if you add free Twitch keys as secrets:
//      IGDB_CLIENT_ID and IGDB_CLIENT_SECRET   (https://dev.twitch.tv/console/apps)
//  - SteamSpy average and median playtime of Steam owners (no key needed).
// Request:  POST { games: [{ id, title, steam?, year? }] }   (up to 12 per call)
// Response: { ok: true, igdb: boolean, results: { [id]: { main?, extra?, full?, count?, igdbName?, steamAvg?, steamMedian? } } }
// Deploy it with "Verify JWT" turned OFF so the app can call it with its public key.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const hrs = (sec?: number) => (sec && sec > 0 ? Math.round((sec / 3600) * 10) / 10 : undefined);
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();

let token: { v: string; exp: number } | null = null;
async function igdbToken(): Promise<string | null> {
  const id = Deno.env.get("IGDB_CLIENT_ID"), secret = Deno.env.get("IGDB_CLIENT_SECRET");
  if (!id || !secret) return null;
  if (token && token.exp > Date.now() + 60_000) return token.v;
  const r = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`, { method: "POST" });
  if (!r.ok) return null;
  const j = await r.json();
  token = { v: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return token.v;
}
async function igdb(path: string, body: string, tok: string) {
  const r = await fetch(`https://api.igdb.com/v4/${path}`, { method: "POST", headers: { "Client-ID": Deno.env.get("IGDB_CLIENT_ID")!, Authorization: `Bearer ${tok}`, Accept: "application/json" }, body });
  await sleep(260); // IGDB allows 4 requests a second
  return r.ok ? r.json() : [];
}
async function igdbGame(g: { title: string; steam?: string; year?: number }, tok: string) {
  // by Steam app id first (exact), then by name
  if (g.steam && /^\d+$/.test(g.steam)) {
    // newer IGDB uses external_game_source, older used category; 1 = Steam either way
    for (const f of ["external_game_source", "category"]) {
      const ex = await igdb("external_games", `fields game; where uid = "${g.steam}" & ${f} = 1; limit 1;`, tok);
      if (Array.isArray(ex) && ex[0]?.game) return { id: ex[0].game as number, name: "" };
    }
  }
  const q = g.title.replace(/"/g, "");
  const list = await igdb("games", `search "${q}"; fields id,name,first_release_date; where version_parent = null; limit 8;`, tok);
  if (!list.length) return null;
  const want = norm(g.title);
  const yr = (x: { first_release_date?: number }) => (x.first_release_date ? new Date(x.first_release_date * 1000).getUTCFullYear() : 0);
  const best = list.find((x: { name: string; first_release_date?: number }) => norm(x.name) === want && (!g.year || Math.abs(yr(x) - g.year) <= 1))
    || list.find((x: { name: string }) => norm(x.name) === want);
  return best ? { id: best.id as number, name: best.name as string } : null;
}
async function steamSpy(appid: string) {
  const r = await fetch(`https://steamspy.com/api.php?request=appdetails&appid=${appid}`);
  await sleep(1000); // SteamSpy allows 1 request a second
  if (!r.ok) return null;
  const j = await r.json();
  return { avg: hrs((j.average_forever || 0) * 60), median: hrs((j.median_forever || 0) * 60) };
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: true, igdb: !!Deno.env.get("IGDB_CLIENT_ID") });
  let body: { games?: { id: string; title: string; steam?: string; year?: number }[] };
  try { body = await req.json(); } catch { return json({ ok: false, error: "bad request" }, 400); }
  const games = (body.games || []).filter(g => g && g.id && g.title).slice(0, 12);
  const tok = await igdbToken().catch(() => null);
  const results: Record<string, Record<string, unknown>> = {};
  for (const g of games) {
    const out: Record<string, unknown> = {};
    try {
      if (tok) {
        const hit = await igdbGame(g, tok);
        if (hit) {
          const t = (await igdb("game_time_to_beats", `fields hastily,normally,completely,count; where game_id = ${hit.id};`, tok))[0];
          if (t) Object.assign(out, { main: hrs(t.hastily), extra: hrs(t.normally), full: hrs(t.completely), count: t.count || 0, igdbName: hit.name || undefined });
        }
      }
    } catch { /* keep going */ }
    try {
      if (g.steam && /^\d+$/.test(g.steam)) {
        const s = await steamSpy(g.steam);
        if (s) { out.steamAvg = s.avg; out.steamMedian = s.median; }
      }
    } catch { /* keep going */ }
    results[g.id] = out;
  }
  return json({ ok: true, igdb: !!tok, results });
});
