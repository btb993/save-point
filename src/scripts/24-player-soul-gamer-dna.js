  // ================= player soul & gamer DNA =================
  // what the app knows about a game: title, series, studio, genres, plus Wikidata tags and the first sentence of its Wikipedia article
  const gtext = g => `${g.title} ${g.series || ""} ${g.developer || ""} ${(g.genres || []).join(" ")} ${g.lore?.t || ""} ${g.lore?.x1 || ""}`.toLowerCase();
  const rx = (g, re) => re.test(gtext(g));
  const ARCH = [
    { k: "souls", genre: "Soulslike", name: "The Soulsborne Pilgrim", short: "Pilgrim", g: "☠", c: "#A33A3A", d: "You die, you learn, you go again. Brutal bosses and quiet, punishing worlds are where you feel most alive.", t: g => rx(g, /souls|fromsoftware|elden ring|bloodborne|sekiro|lies of p|\bnioh|lords of the fallen|khazan|mortal shell|salt and sanctuary|remnant|wo long|thymesia|black myth|the surge/) ? 1 : 0 },
    { k: "rpg", genre: "RPG", name: "The Party Leader", short: "Party Leader", g: "⚔", c: "#7A3FC4", d: "Character sheets, side quests and loyal companions: you live for long role-playing journeys.", t: g => rx(g, /role-playing|\brpg|baldur|persona|final fantasy|dragon quest|witcher|mass effect|elder scrolls|fallout|dragon age|kingdom hearts|xenoblade|pillars of eternity|divinity|metaphor/) ? 1 : 0 },
    { k: "explore", genre: "Open world", name: "The Open-World Explorer", short: "Explorer", g: "⌖", c: "#2F8A72", d: "You see a mountain, you climb it. Maps, landmarks and total freedom pull you in.", t: g => rx(g, /open world|open-world|zelda|red dead|horizon|assassin's creed|ghost of|skyrim|no man's sky|subnautica|outer wilds|death stranding|grand theft auto/) ? .9 : rx(g, /action-adventure|adventure/) ? .35 : 0 },
    { k: "rogue", genre: "Roguelike", name: "The Run Gambler", short: "Gambler", g: "✧", c: "#D06A2A", d: "One more run. Random builds, permadeath and the perfect loop keep you coming back.", t: g => rx(g, /rogue|hades|dead cells|slay the spire|balatro|binding of isaac|vampire survivors|returnal|risk of rain|enter the gungeon|monster train|spelunky|inscryption|darkest dungeon|noita|cult of the lamb/) ? 1 : 0 },
    { k: "metroid", tag: "Metroidvania", genre: "Metroidvania & platformer", name: "The Map Completionist", short: "Completionist", g: "◈", c: "#3B60B0", d: "Locked doors, new abilities and that last 2% of the map. Metroidvanias and platformers feel like home.", t: g => rx(g, /metroidvania|hollow knight|silksong|ori and|metroid|castlevania|blasphemous|celeste|bloodstained|axiom verge|animal well|nine sols|the lost crown/) ? 1 : rx(g, /platform/) ? .6 : 0 },
    { k: "shooter", genre: "Shooter", name: "The Sharpshooter", short: "Sharpshooter", g: "⊕", c: "#C0394E", d: "Fast reflexes, tight aim and the satisfaction of a perfect headshot.", t: g => rx(g, /shooter|\bfps\b|call of duty|halo|doom|battlefield|counter-strike|apex|overwatch|destiny|titanfall|valorant|borderlands/) ? 1 : 0 },
    { k: "strategy", tag: "Strategy", genre: "Strategy & tactics", name: "The Grand Strategist", short: "Strategist", g: "♞", c: "#4E7A3C", d: "You think three turns ahead. Empires, tactics and careful planning beat button-mashing.", t: g => rx(g, /strateg|tactic|4x|civilization|xcom|total war|stellaris|crusader kings|age of empires|starcraft|fire emblem|into the breach/) ? 1 : 0 },
    { k: "story", tag: "Story", genre: "Story-driven", name: "The Story Seeker", short: "Story Seeker", g: "✎", c: "#8E5AA8", d: "You play for the plot. Characters, choices and endings stay with you long after the credits.", t: g => rx(g, /narrative|interactive|visual novel|point-and-click|graphic adventure|walking simulator|life is strange|telltale|disco elysium|what remains|firewatch|detroit|alan wake|\bcontrol\b|the last of us|bioshock|kentucky route|oxenfree|night in the woods/) ? 1 : 0 },
    { k: "horror", genre: "Horror", name: "The Fear Collector", short: "Fear Collector", g: "☾", c: "#5A3E78", d: "Dark corridors and a racing heart. You seek out the games that make you jump.", t: g => rx(g, /horror|resident evil|silent hill|dead space|outlast|amnesia|alien: isolation|five nights|until dawn|the evil within/) ? 1 : 0 },
    { k: "cozy", tag: "Cozy", genre: "Cozy & life sim", name: "The Cozy Farmer", short: "Cozy Farmer", g: "❀", c: "#5FA052", d: "Crops, cafés and friendly villagers. Your games are a warm blanket.", t: g => rx(g, /life sim|farming|stardew|animal crossing|cozy|harvest moon|story of seasons|the sims|spiritfarer|unpacking|a short hike|coral island|dredge|tomodachi/) ? 1 : 0 },
    { k: "builder", tag: "Building", genre: "Building & sandbox", name: "The Master Builder", short: "Builder", g: "⚙", c: "#9A7330", d: "Factories, cities and blocky castles: you'd rather build a world than save one.", t: g => rx(g, /sandbox|city-build|city build|construction|management|minecraft|factorio|terraria|cities: skylines|satisfactory|rimworld|planet coaster|hytale|survival/) ? 1 : rx(g, /simulation/) ? .5 : 0 },
    { k: "speed", tag: "Racing & sports", genre: "Racing, fighting & sports", name: "The Speed Demon", short: "Speed Demon", g: "⚡", c: "#E08A1E", d: "Racing lines, combos and pure adrenaline. If it's fast, you're in.", t: g => rx(g, /racing|forza|gran turismo|need for speed|mario kart|fighting|street fighter|tekken|mortal kombat|smash bros|rocket league|sports|fifa|\bfc \d|nba 2k/) ? 1 : 0 },
    { k: "social", tag: "Co-op", genre: "Co-op & multiplayer", name: "The Co-op Captain", short: "Co-op Captain", g: "♛", c: "#2A86B0", d: "Games are better together. Raids, squads and couch co-op are your thing.", t: g => rx(g, /multiplayer|massively|mmo|co-op|cooperative|battle royale|it takes two|split fiction|overcooked|fortnite|world of warcraft|sea of thieves|deep rock|monster hunter|helldivers|valheim|among us|left 4 dead/) ? 1 : 0 },
    { k: "puzzle", genre: "Puzzle", name: "The Puzzle Mind", short: "Puzzle Mind", g: "✦", c: "#2E9090", d: "Aha moments. Logic, physics and clever rules are your favourite kind of challenge.", t: g => rx(g, /puzzle|portal|the witness|tetris|baba is you|return of the obra dinn|talos principle|braid|fez|limbo|lemmings|the room|myst|riven|monument valley|superliminal|viewfinder/) ? 1 : 0 },
    { k: "stealth", genre: "Stealth", name: "The Shadow", short: "Shadow", g: "◐", c: "#45546A", d: "Patience, silence and the perfect unseen route through every level.", t: g => rx(g, /stealth|metal gear|hitman|dishonored|splinter cell|\bthief\b|deathloop|styx|a plague tale|mark of the ninja|aragami|shadow tactics/) ? 1 : 0 },
    { k: "retro", tag: "Retro", genre: "Retro classic", name: "The Retro Keeper", short: "Retro Keeper", g: "☆", c: "#C5487E", d: "Pixels and cartridges. You keep the classics alive and know where every warp pipe goes.", t: g => g.year && g.year < 2000 ? 1 : g.year && g.year < 2008 ? .35 : rx(g, /pixel|retro/) ? .5 : 0 }
  ];
  const RANKS = [[0, "Rookie"], [1, "Apprentice"], [5, "Adventurer"], [10, "Veteran"], [25, "Elite"], [50, "Champion"], [100, "Legend"], [200, "Mythic"]];
  const gameWeight = g => {
    const st = { finished: 1.25, playing: 1, dropped: .3 }[g.status] || 0; if (!st) return 0;
    const r = g.rating ? Math.max(.15, (g.rating - 1.5) / 2.5) : 1, h = 1 + Math.min(1.2, Math.log10(1 + (Number(g.hours) || 0)) / 2);
    return st * r * h;
  };
  function playerSoul(){
    const played = games.filter(g => !UNPLAYED.has(g.status));
    if (played.length < 3) return null;
    const score = Object.fromEntries(ARCH.map(a => [a.k, 0]));
    played.forEach(g => { const w = gameWeight(g); ARCH.forEach(a => { const t = a.t(g); if (t) score[a.k] += w * t; }); });
    const tot = Object.values(score).reduce((s, v) => s + v, 0); if (!tot) return null;
    const dna = ARCH.map(a => ({ ...a, pct: Math.round(score[a.k] / tot * 100), raw: score[a.k] })).filter(a => a.raw > 0).sort((a, b) => b.raw - a.raw);
    const fin = games.filter(g => g.status === "finished").length;
    let ri = 0; RANKS.forEach(([n], i) => { if (fin >= n) ri = i; });
    const next = RANKS[ri + 1];
    return { dna, top: dna[0], second: dna[1], third: dna[2], rank: RANKS[ri][1], fin, next: next ? { at: next[0], title: next[1], pct: Math.round((fin - RANKS[ri][0]) / (next[0] - RANKS[ri][0]) * 100) } : null, score, played };
  }
  function traits(S){
    const played = S.played, fin = played.filter(g => g.status === "finished").length, quit = played.filter(g => g.status === "dropped").length;
    const sc = k => S.score[k] || 0, share = (a, b) => { const A = a.reduce((s, k) => s + sc(k), 0), B = b.reduce((s, k) => s + sc(k), 0); return A + B ? Math.round(B / (A + B) * 100) : 50; };
    const years = played.map(g => +g.year).filter(Boolean), avgY = years.length ? years.reduce((s, y) => s + y, 0) / years.length : null, now = new Date().getFullYear();
    const rated = played.filter(g => g.rating), avgR = rated.length ? rated.reduce((s, g) => s + g.rating, 0) / rated.length : null;
    const devs = new Map(); played.forEach(g => (g.developer || "").split(", ").filter(Boolean).forEach(d => devs.set(d, (devs.get(d) || 0) + 1)));
    const repeat = played.length ? Math.round([...devs.values()].filter(n => n > 1).reduce((s, n) => s + n, 0) / played.length * 100) : 0;
    return [
      ["Sampler", "Completionist", fin + quit ? Math.round(fin / (fin + quit + played.filter(g => g.status === "playing").length * .5) * 100) : 50, "How often you see games through to the end"],
      ["Story", "Action", share(["story", "rpg", "puzzle", "cozy"], ["shooter", "speed", "souls", "rogue"]), "What pulls you in: plot and characters, or pace and skill"],
      ["Solo", "Social", Math.min(100, Math.round(sc("social") / Object.values(S.score).reduce((s, v) => s + v, 0) * 250)), "Lone adventurer, or always with a squad"],
      ["Relaxed", "Hardcore", share(["cozy", "builder", "puzzle", "story"], ["souls", "rogue", "shooter", "strategy"]), "Comfort games versus punishing challenges"],
      ["Classic", "Cutting edge", avgY ? Math.max(0, Math.min(100, Math.round((avgY - 1990) / (now - 1990) * 100))) : 50, avgY ? `Your games' average release year is ${Math.round(avgY)}` : "Add release years to measure this"],
      ["Loyal", "Adventurous", 100 - Math.min(100, repeat), "Sticking with studios you love, or always trying someone new"],
      ["Tough critic", "Generous", avgR ? Math.round((avgR - 1) / 4 * 100) : 50, avgR ? `Your average rating is ${avgR.toFixed(1)} stars` : "Rate games to measure this"]
    ];
  }
  function deepStatsHTML(){
    const played = games.filter(g => !UNPLAYED.has(g.status));
    if (!played.length) return {};
    const decades = new Map(); played.forEach(g => { if (g.year) { const d = Math.floor(g.year / 10) * 10; decades.set(d, (decades.get(d) || 0) + 1); } });
    const decRows = [...decades].sort((a, b) => a[0] - b[0]).map(([d, n]) => [`${d}s`, n, "var(--accent)"]);
    const by = key => { const m = new Map(); played.forEach(g => String(g[key] || "").split(", ").filter(Boolean).forEach(x => { const o = m.get(x) || { n: 0, r: 0, rn: 0, f: 0 }; o.n++; if (g.rating) { o.r += g.rating; o.rn++; } if (g.status === "finished") o.f++; m.set(x, o); })); return [...m].filter(([, o]) => o.n >= 1).sort((a, b) => b[1].n - a[1].n || (b[1].rn ? b[1].r / b[1].rn : 0) - (a[1].rn ? a[1].r / a[1].rn : 0)).slice(0, 6); };
    const studios = by("developer"), series = by("series").filter(([, o]) => o.n >= 1);
    const crit = played.filter(g => g.rating && mcNum(g)).map(g => ({ g, d: g.rating * 20 - mcNum(g) }));
    const gems = crit.filter(x => x.d >= 8).sort((a, b) => b.d - a.d).slice(0, 4), takes = crit.filter(x => x.d <= -8).sort((a, b) => a.d - b.d).slice(0, 4);
    const wd = Array(7).fill(0); games.forEach(g => (g.sessions || []).forEach(s => { wd[(new Date(s.d + "T12:00:00").getDay() + 6) % 7] += s.h; }));
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], hasDays = wd.some(Boolean), bestDay = wd.indexOf(Math.max(...wd));
    const exact = s => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
    const dur = games.filter(g => g.status === "finished" && exact(g.started) && exact(g.finished)).map(g => ({ g, d: Math.max(1, Math.round((new Date(g.finished) - new Date(g.started)) / 864e5) + 1) }));
    const avgDur = dur.length ? Math.round(dur.reduce((s, x) => s + x.d, 0) / dur.length) : null;
    const fin = games.filter(g => g.status === "finished" && Number(g.hours));
    const longest = [...fin].sort((a, b) => b.hours - a.hours)[0], shortest = [...fin].sort((a, b) => a.hours - b.hours)[0];
    const sess = games.flatMap(g => g.sessions || []), avgSess = sess.length ? sess.reduce((s, x) => s + x.h, 0) / sess.length : null;
    const glist = (list, sign) => list.length ? `<div class="vs">${list.map(({ g, d }) => `<div class="vsrow"><button class="linkbtn" type="button" data-open="${esc(g.id)}" style="text-align:left;color:var(--ink);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(g.title)}</button><span class="muted num">${stars(g.rating)} vs ${mcNum(g)}</span><span class="d ${sign}">${d > 0 ? "+" : ""}${d}</span></div>`).join("")}</div>` : "";
    const slist = rows => `<div class="vs">${rows.map(([k, o]) => `<div class="vsrow"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(k)}</span><span class="muted num">${o.n} played${o.f ? ` · ${o.f} cleared` : ""}</span><span class="stars" style="font-size:13px">${o.rn ? stars(o.r / o.rn) : ""}</span></div>`).join("")}</div>`;
    return {
      eras: `<div class="panel"><h3>Eras you play</h3>${decRows.length ? hbars(decRows, "") : `<div class="note">Release years appear once details are filled in.</div>`}</div>`,
      studios: `<div class="panel"><h3>Studios you trust</h3>${studios.length ? slist(studios) : `<div class="note">Studios appear once details are filled in.</div>`}</div>`,
      series: series.length ? `<div class="panel"><h3>Series you follow</h3>${slist(series)}</div>` : "",
      gems: `<div class="panel"><h3>Hidden gems</h3>${gems.length ? glist(gems, "up") + `<div class="note">Games you rated well above the critics.</div>` : `<div class="note">Rate games that have critic scores. The ones you love more than critics do show up here.</div>`}</div>`,
      takes: `<div class="panel"><h3>Hot takes</h3>${takes.length ? glist(takes, "down") + `<div class="note">Critics loved these more than you did.</div>` : `<div class="note">No hot takes yet. You and the critics mostly agree.</div>`}</div>`,
      when: `<div class="panel"><h3>When you play</h3>${hasDays ? `<div class="cols" style="--n:7;height:130px">${wd.map((h, i) => `<div class="col${i === bestDay ? " cur" : ""}" data-tip="${days[i]}: ${Math.round(h * 10) / 10} h"><span style="height:${(h / Math.max(...wd) * 100).toFixed(1)}%"></span></div>`).join("")}</div><div class="xl" style="--n:7">${days.map(d => `<span>${d}</span>`).join("")}</div><div class="note">${days[bestDay]} is your gaming day.${avgSess ? ` Average session ${fmtH(avgSess)}.` : ""}</div>` : `<div class="note">Log sessions to see which days you play most.</div>`}</div>`,
      pace: `<div class="panel"><h3>Pace</h3><div class="facts2">
        <div><b>${avgDur ? `${avgDur} days` : "–"}</b><span>average from start to finish</span></div>
        <div><b>${longest ? fmtH(longest.hours) : "–"}</b><span>${longest ? `longest clear: ${esc(longest.title)}` : "longest clear"}</span></div>
        <div><b>${shortest && shortest !== longest ? fmtH(shortest.hours) : "–"}</b><span>${shortest && shortest !== longest ? `quickest clear: ${esc(shortest.title)}` : "quickest clear"}</span></div>
        <div><b>${played.length ? Math.round(played.reduce((s, g) => s + (Number(g.hours) || 0), 0) / played.length) + " h" : "–"}</b><span>average time per game</span></div></div></div>`
    };
  }

