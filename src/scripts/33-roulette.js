  // ================= roulette =================
  function openRoulette(){
    const pool = games.filter(g => g.status === "backlog"); if (!pool.length) return;
    const any = () => pool[Math.floor(Math.random() * pool.length)];
    const spin = () => {
      const pick = any(), strip = [...Array.from({ length: 28 }, any), pick, any()];
      $("#scrim").innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="Backlog roulette">
        <div class="reshead"><h2>Backlog roulette</h2><button class="btn small" type="button" data-mclose>Close</button></div>
        <div class="reel"><div class="win"></div><div class="strip" id="strip">${strip.map(g => `<div class="it">${esc(g.title)}</div>`).join("")}</div></div>
        <div id="picked" aria-live="polite"></div></div>`;
      const el = $("#strip"), target = (strip.length - 2) * 58 - (210 / 2 - 29);
      const done = () => {
        $("#picked").innerHTML = `<div class="picked">${boxHTML(pick)}<div class="meta"><div class="px">Your next game</div><div class="t" style="font-size:24px">${esc(pick.title)}</div>
          <div class="facts">${pick.length ? `<span>~${pick.length} h to beat</span>` : ""}${(pick.genres || []).length ? `<span>${esc(pick.genres[0])}</span>` : ""}${mainPlat(pick) ? `<span>${esc(mainPlat(pick))}</span>` : ""}</div>
          <div class="qa" style="margin-top:8px"><button class="btn primary small" type="button" data-start="${esc(pick.id)}">Start playing</button><button class="btn small" type="button" id="respin">Spin again</button></div></div></div>`;
      };
      if (reduceMotion || !el.animate) { el.style.transform = `translateY(${-target}px)`; done(); return; }
      el.animate([{ transform: "translateY(0)" }, { transform: `translateY(${-target}px)` }], { duration: 2600, easing: "cubic-bezier(.12,.75,.2,1)", fill: "forwards" }).onfinish = done;
    };
    openModal("", e => {
      if (e.target.id === "respin") return spin();
      const s = e.target.closest("[data-start]"); if (s) { startPlaying(s.dataset.start); closeModal(); }
    });
    spin();
  }
  function startPlaying(id){
    const g = games.find(x => x.id === id); if (!g) return;
    saveGame({ ...g, status: "playing", started: g.started || todayISO() }, `${g.title} is now Playing`);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

