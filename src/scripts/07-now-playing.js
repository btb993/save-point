  // ================= now playing =================
  function segs(p){
    let h = ""; for (let i = 0; i < 10; i++) { const f = Math.max(0, Math.min(1, (p - i * 10) / 10)); h += f >= 1 ? `<i class="on"></i>` : f > 0 ? `<i class="part" style="--p:${Math.round(f * 100)}%"></i>` : `<i></i>`; }
    return `<div class="segs" aria-hidden="true">${h}</div>`;
  }
  let logOpen = "";
  function renderDeck(){
    const list = games.filter(g => g.status === "playing").sort((a, b) => lastPlayed(b).localeCompare(lastPlayed(a)));
    const el = $("#deck"); el.hidden = !list.length; if (!list.length) { el.innerHTML = ""; return; }
    el.innerHTML = `<div class="deckhead"><h2 class="live">Now playing</h2><button class="tnbtn" type="button" data-tonight title="Can't decide? Let me pick tonight's game" aria-label="What should I play tonight?">🎲</button></div><div class="npgrid">${list.map(g => {
      const p = progressOf(g), H = Number(g.hours) || 0, L = Number(g.length), lp = lastPlayed(g);
      const ptxt = (Number(g.progress) > 0 ? `<b>${p}%</b> complete · ` : "") + `<button type="button" class="sethrs" data-sethours="${esc(g.id)}" title="Type in your hours">${H ? `<b>${fmtH(H)}</b> played` : "Set hours played"} <i aria-hidden="true">✎</i></button>${L && !(Number(g.progress) > 0) ? ` of ~${L} h story` : ""}`;
      const steam = g.steamAppId && !g.cover;
      return `<div class="np${steam ? "" : " blur"}" style="--c:${caseColor(g)}"><div class="bgart">${steam ? chainImg([steamImg(g.steamAppId, "library_hero.jpg"), ...coverChain(g)], "", "spHeroErr") : imgTag(g, "")}</div><div class="shade"></div>
        ${boxHTML(g, "button", `type="button" data-open="${esc(g.id)}" aria-label="Open ${esc(g.title)}"`)}
        <div class="body"><button class="t" type="button" data-open="${esc(g.id)}">${chainImg(logoChain(g), `class="logo" onload="spLogoOk(this, '.np')"`)}<span class="tt">${esc(g.title)}</span></button>${g.replaying ? `<span class="replaytag" title="You've finished it ${timesDone(g) === 1 ? "once" : timesDone(g) + " times"} before">↻ Replay #${replayNo(g)}</span>` : ""}
          <div class="sub">${mainPlat(g) ? `<span class="plat" style="--pc:${pcVar(mainPlat(g))}">${esc(mainPlat(g))}</span>` : ""}<span>${lp ? `Last played ${relDay(lp)}` : "Not logged yet"}</span>${(g.sessions || []).length ? `<span>${g.sessions.length} session${g.sessions.length > 1 ? "s" : ""}</span>` : ""}</div>
          ${segs(p)}
          <div class="prog"><span>${ptxt}</span><span>${p ? p + "%" : ""}</span></div>
          ${playStatus(g)}${g.quests ? (() => { const c = qCount(g.quests); return `<button type="button" class="qchip" data-quests="${esc(g.id)}"><span class="qbar"><i style="width:${c.n ? c.d / c.n * 100 : 0}%"></i></span>Quests ${c.d}/${c.n}</button>`; })() : `<button type="button" class="qchip add" data-quests="${esc(g.id)}">＋ Quest log</button>`}
          <div class="qa"><button class="qbtn play" type="button" data-play="${esc(g.id)}" title="${esc(playTitle(g))}">▶ Play</button><button class="qbtn" type="button" data-logopen="${esc(g.id)}" aria-expanded="${logOpen === g.id}">＋ Log time</button>${settings.timer?.id === g.id ? `<button class="qbtn timer on" type="button" data-tstop="${esc(g.id)}" title="Stop and log this session">■ <span class="tclock" data-start="${settings.timer.start}">0:00:00</span></button>` : `<button class="qbtn timer" type="button" data-tstart="${esc(g.id)}" title="Time a session">▶ Timer</button>`}<button class="qbtn win" type="button" data-beat="${esc(g.id)}">✓ Finished it</button></div>${logOpen === g.id ? `<form class="logpop" data-logform="${esc(g.id)}"><label>Hours <input type="number" name="h" min="0" max="24" step="1" inputmode="numeric" placeholder="0"></label><label>Minutes <input type="number" name="m" min="0" max="59" step="5" inputmode="numeric" placeholder="30"></label><button class="btn small primary" type="submit">Add</button><button class="btn small" type="button" data-logx>Cancel</button></form>` : ""}
        </div></div>`; }).join("")}</div>`;
  }

  // ＋ Log time opens a small form right on the card: type the hours and minutes you played
  document.addEventListener("click", e => {
    const o = e.target.closest("[data-logopen]"); if (o) { logOpen = logOpen === o.dataset.logopen ? "" : o.dataset.logopen; renderDeck(); if (logOpen) document.querySelector(`[data-logform="${CSS.escape(logOpen)}"] input`)?.focus(); return; }
    if (e.target.closest("[data-logx]")) { logOpen = ""; renderDeck(); }
  });
  document.addEventListener("submit", e => {
    const f = e.target.closest("[data-logform]"); if (!f) return; e.preventDefault();
    const h = Math.max(0, Number(f.h.value) || 0), m = Math.max(0, Number(f.m.value) || 0), tot = h + m / 60;
    if (!(tot > 0)) { toast("Type how long you played."); f.h.focus(); return; }
    if (tot > 24) { toast("That's more than a day. Split it into separate days in the game's Play tab."); return; }
    const id = f.dataset.logform; logOpen = ""; logSession(id, Math.round(tot * 100) / 100, f.querySelector("button[type=submit]"));
  });
