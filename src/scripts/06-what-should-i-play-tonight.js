  // ================= what should I play tonight? =================
  // You pick how long you have and the mood; it picks from Playing and your backlog using how long each game takes,
  // your Gamer DNA and what you've left waiting longest.
  const TN_TIME = [["short", "30 minutes", "⏱"], ["evening", "An evening", "🌙"], ["weekend", "A weekend", "🏕"]];
  const TN_MOOD = [["chill", "Chill", "☕", ["cozy", "puzzle", "builder", "explore", "retro"]], ["intense", "Intense", "🔥", ["souls", "shooter", "rogue", "speed", "horror", "stealth", "metroid"]], ["story", "Story", "📖", ["story", "rpg", "explore", "horror"]], ["any", "Surprise me", "🎲", []]];
  let tn = { time: "evening", mood: "any", spin: 0 };
  function tonightPicks(){
    const pool = games.filter(g => g.status === "playing" || g.status === "backlog"); if (!pool.length) return [];
    let dna = {}; try { (soulData().dna || []).forEach(x => dna[x.k] = x.pct); } catch {}
    const M = TN_MOOD.find(m => m[0] === tn.mood) || TN_MOOD[3], now = Date.now(), rnd = recRng("tonight" + tn.spin + tn.time + tn.mood);
    return pool.map(g => {
      const G = Object.keys(genesOf(g)), T = topGene(g), L = Number(g.length) || estBest(g.est) || 0, H = Number(g.hours) || 0, left = L ? Math.max(0, L - H) : 0;
      const last = lastPlayed(g) || (g.added || "").slice(0, 10), days = last ? Math.round((now - new Date(last)) / 864e5) : 0, why = [];
      let sc = 10 + rnd() * 6;
      // mood
      if (M[3].length) { const hit = G.filter(k => M[3].includes(k)); if (hit.length) { sc += 18 + hit.length * 4; why.push(`${M[1]} pick: ${AK(hit[0]).genre}`); } else sc -= 12; }
      // time you have
      if (tn.time === "short") { if (G.some(k => ["rogue", "puzzle", "speed", "shooter", "social"].includes(k))) { sc += 12; why.push("Great in short bursts"); } if (g.status === "playing") { sc += 8; why.push("Pick up where you left off"); } if (L > 40 && g.status === "backlog") sc -= 10; }
      else if (tn.time === "evening") { if (left && left <= 4) { sc += 22; why.push(g.status === "playing" ? `About ${fmtH(left)} left: you could see the credits tonight` : `About ${fmtH(left)} long: done in one sitting`); } else if (g.status === "playing") { sc += 10; why.push("Keep your run going"); } if (L > 60 && g.status === "backlog") sc -= 6; }
      else { if (left && left >= 6 && left <= 25) { sc += 18; why.push(`About ${fmtH(left)}${g.status === "playing" ? " left" : ""}: a perfect weekend`); } else if (L > 25) { sc += 6; why.push("A big one to sink into"); } }
      // your Gamer DNA
      if (T && dna[T.k]) { sc += Math.min(16, dna[T.k] * .5); if (dna[T.k] >= 12) why.push(`${dna[T.k]}% of your DNA is ${T.short}`); }
      // neglect
      if (g.status === "playing" && days >= 14) { sc += Math.min(14, days / 4); why.push(`You haven't played it in ${days >= 60 ? Math.round(days / 30) + " months" : Math.round(days / 7) + " weeks"}`); }
      if (g.status === "backlog" && days >= 180) { sc += Math.min(10, days / 90); why.push(`Waiting in your backlog for ${days >= 365 ? Math.round(days / 365) + " year" + (days >= 730 ? "s" : "") : Math.round(days / 30) + " months"}`); }
      if (g.metacritic >= 85) { sc += 4; why.push(`Critics: ${g.metacritic}`); }
      return { g, sc, why: why.slice(0, 3), L, left };
    }).sort((a, b) => b.sc - a.sc).slice(0, 3);
  }
  document.addEventListener("click", e => { if (e.target.closest("[data-tonight]")) openTonight(); });
  function openTonight(){
    const html = () => { const P = tonightPicks();
      return `<div class="modal wide tnmod" role="dialog" aria-modal="true" aria-labelledby="tn-t"><div class="reshead"><div><span class="px">Tonight</span><h2 id="tn-t">What should I play?</h2></div><button class="btn small" type="button" data-mclose>Close</button></div>
        <div class="tnq"><span class="px">How much time do you have?</span><div class="tnchips">${TN_TIME.map(([k, n, i]) => `<button type="button" data-tntime="${k}" aria-pressed="${tn.time === k}"><i>${i}</i>${n}</button>`).join("")}</div></div>
        <div class="tnq"><span class="px">What are you in the mood for?</span><div class="tnchips">${TN_MOOD.map(([k, n, i]) => `<button type="button" data-tnmood="${k}" aria-pressed="${tn.mood === k}"><i>${i}</i>${n}</button>`).join("")}</div></div>
        ${P.length ? `<div class="tnpicks">${P.map((x, i) => `<div class="tnpick${i ? "" : " top"}">${boxHTML(x.g)}<div class="tnt"><span class="px">${i ? "Or" : "Tonight's pick"}</span><b>${esc(x.g.title)}</b><small>${esc(STATUS[x.g.status])}${x.g.platform ? " · " + esc(mainPlat(x.g)) : ""}${x.L ? ` · ~${fmtH(x.L)} to beat` : ""}</small>
            <ul>${x.why.map(w => `<li>${esc(w)}</li>`).join("") || "<li>A good fit for tonight</li>"}</ul>
            <div class="nact">${launchKind(x.g) ? `<button class="btn small primary" type="button" data-tnplay="${esc(x.g.id)}">▶ Play</button>` : ""}${x.g.status === "backlog" ? `<button class="btn small${launchKind(x.g) ? "" : " primary"}" type="button" data-tnstart="${esc(x.g.id)}">Start playing</button>` : ""}<button class="btn small" type="button" data-tnopen="${esc(x.g.id)}">Details</button></div></div></div>`).join("")}</div>
          <div class="nact"><button class="btn small" type="button" data-tnspin>🎲 Pick again</button></div>`
        : `<p class="note">Add games to Playing or your backlog and I'll pick from them.</p>`}</div>`; };
    openModal(html(), e => {
      const t = e.target.closest("[data-tntime]"); if (t) { tn.time = t.dataset.tntime; $("#scrim").innerHTML = html(); return; }
      const m = e.target.closest("[data-tnmood]"); if (m) { tn.mood = m.dataset.tnmood; $("#scrim").innerHTML = html(); return; }
      if (e.target.closest("[data-tnspin]")) { tn.spin++; $("#scrim").innerHTML = html(); return; }
      const pl = e.target.closest("[data-tnplay]"); if (pl) { closeModal(); playGame(pl.dataset.tnplay); return; }
      const st = e.target.closest("[data-tnstart]"); if (st) { closeModal(); startPlaying(st.dataset.tnstart); return; }
      const op = e.target.closest("[data-tnopen]"); if (op) { closeModal(); openById(op.dataset.tnopen); return; }
    });
  }
