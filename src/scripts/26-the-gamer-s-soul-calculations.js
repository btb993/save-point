  // ================= THE GAMER'S SOUL: calculations =================
  const AIDX = Object.fromEntries(ARCH.map((a, i) => [a.k, i]));
  const AK = k => ARCH[AIDX[k]];
  const comboKey = ks => [...ks].sort((a, b) => AIDX[a] - AIDX[b]).join("+");
  const exactDay = s => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
  const ym = s => /^\d{4}-\d{2}/.test(s || "") ? s.slice(0, 7) : "";
  const hrs = g => { const h = Number(g.hours); return g.hours === "" || g.hours == null || isNaN(h) ? null : h; }; // missing playtime stays missing
  const genresOf = g => (g.genres || []).map(s => String(s).toLowerCase());
  const RX = {
    soulslike: /souls|fromsoftware|elden ring|bloodborne|sekiro|lies of p|\bnioh|lords of the fallen|khazan|mortal shell|salt and sanctuary|remnant|wo long|thymesia|black myth|the surge/, horror: /horror|resident evil|silent hill|dead space|outlast|amnesia|alien: isolation/,
    open: /open world|open-world|zelda: breath|tears of the kingdom|red dead|horizon|skyrim|elden ring|witcher 3|ghost of|assassin's creed|no man's sky|subnautica|grand theft auto/, indie: /\bindie|independent/,
    coop: /co-op|cooperative|massively|mmo|it takes two|split fiction|overcooked|sea of thieves|deep rock|monster hunter|helldivers|valheim|left 4 dead|party/,
    comp: /battle royale|fighting|sports|racing|esport|competitive|moba|arena|pvp|counter-strike|valorant|overwatch|apex|fortnite|rocket league|street fighter|tekken|\bfc \d|fifa|nba 2k|call of duty/,
    strat: /strateg|tactic|4x|puzzle|turn-based|card|deck|city-build|management|immersive sim|stealth|grand strategy/, inst: /action|shooter|hack and slash|beat 'em up|platform|roguelike|roguelite|arcade|rhythm|racing|fighting/
  };
  const fam = g => { const t = gtext(g); return { strategy: /strateg|tactic|4x/.test(t), rpg: /role-playing|\brpg/.test(t), action: /action|shooter|hack and slash|beat/.test(t), puzzle: /puzzle/.test(t), sim: /simulat|management|life sim|city-build/.test(t), adventure: /adventure/.test(t) }; };
  function worldsOf(g){ const set = new Set((g.worlds || []).filter(k => WORLD.has(k))); if (!g.worldsSet) { const gs = [...genresOf(g), g.title, g.series || "", g.lore?.t || "", g.lore?.x || ""].join(" | ").toLowerCase(); WORLDS.forEach(([k, , , , re]) => { if (re.test(gs)) set.add(k); }); } return [...set]; }

  // ---------- learning more about each game, so archetypes and worlds are right ----------
  // For played games the app reads Wikidata (setting, period, subjects, play modes) and the opening of the Wikipedia
  // article ("X is a 2015 action role-playing game set in a dark fantasy world…"). Saved on the game as g.lore.
  const loreState = { busy: false, done: 0 };
  const needsLore = g => !UNPLAYED.has(g.status) && (!g.lore || (g.lore.v || 0) < 1) && !(g.loreTry && Date.now() - new Date(g.loreTry) < 7 * 864e5);
  async function loreHunt(force){
    if (loreState.busy || !navigator.onLine) return 0; loreState.busy = true; let changed = 0;
    try {
      let todo = games.filter(g => force ? !UNPLAYED.has(g.status) : needsLore(g)).slice(0, force ? 200 : 60);
      // games that were never matched to Wikidata get looked up first (a few per visit)
      for (const g of todo.filter(x => !x.wikidata).slice(0, 12)) { try { const r = await lookupOne(g); const cur = games.find(x => x.id === g.id); if (r && cur) { Object.assign(cur, { wikidata: r.wikidata, wiki: cur.wiki || r.wiki, genres: (cur.genres || []).length ? cur.genres : r.genres }); } } catch {} }
      todo = todo.map(g => games.find(x => x.id === g.id)).filter(Boolean);
      for (let i = 0; i < todo.length; i += 20) {
        const batch = todo.slice(i, i + 20), ids = batch.map(g => g.wikidata).filter(Boolean);
        const ents = ids.length ? (await wd({ action: "wbgetentities", ids: ids.join("|"), props: "claims|sitelinks" })).entities || {} : {};
        const want = new Set(), pick = (e, p) => (e.claims?.[p] || []).map(c => c.mainsnak?.datavalue?.value?.id).filter(Boolean);
        Object.values(ents).forEach(e => ["P404", "P840", "P2408", "P921", "P136"].forEach(p => pick(e, p).slice(0, 6).forEach(x => want.add(x))));
        const labels = {}; const wl = [...want];
        for (let k = 0; k < wl.length; k += 50) { const j = await wd({ action: "wbgetentities", ids: wl.slice(k, k + 50).join("|"), props: "labels", languages: "en" }); Object.values(j.entities || {}).forEach(e => labels[e.id] = e.labels?.en?.value || ""); }
        const titles = batch.map(g => g.wiki || ents[g.wikidata]?.sitelinks?.enwiki?.title).filter(Boolean), ex = {};
        if (titles.length) { const j = await wp("en", { action: "query", prop: "extracts", exintro: 1, explaintext: 1, exsentences: 4, exlimit: 20, titles: titles.join("|"), redirects: 1 });
          const map = {}; [...(j.query?.normalized || []), ...(j.query?.redirects || [])].forEach(x => map[x.to] = map[x.from] || x.from);
          Object.values(j.query?.pages || {}).forEach(pg => { if (pg.extract) ex[map[pg.title] || pg.title] = pg.extract; }); }
        batch.forEach(g => {
          const e = ents[g.wikidata] || {}, L = p => pick(e, p).map(x => labels[x]).filter(Boolean);
          const modes = L("P404"), multiOnly = modes.length && !modes.some(m => /single/i.test(m));
          const tags = [...L("P136"), ...L("P840"), ...L("P2408"), ...L("P921"), ...modes.filter(m => /co-?op|cooperative|massively/i.test(m) || (multiOnly && /multiplayer/i.test(m)))];
          const text = (ex[g.wiki || e.sitelinks?.enwiki?.title] || "").replace(/\s+/g, " ").trim(), first = (text.match(/^.*?[.!?](\s|$)/) || [text])[0];
          const cur = games.find(x => x.id === g.id); if (!cur) return;
          cur.lore = { v: 1, t: [...new Set(tags)].join(", ").slice(0, 400), x1: first.slice(0, 300), x: text.slice(0, 700), at: todayISO() };
          if (!text && !tags.length) { delete cur.lore; cur.loreTry = todayISO(); }
          cur.updatedAt = Date.now(); changed++;
        });
      }
    } catch (e) { console.warn("lore", e); }
    finally { loreState.busy = false; }
    if (changed) { dnaCause = { id: "", title: `details for ${changed} game${changed === 1 ? "" : "s"}`, why: "Learned more from", t: Date.now() }; saveLocal(); render(); try { sync.schedule(); } catch {} }
    return changed;
  }
  setTimeout(() => loreHunt(), 6000);

