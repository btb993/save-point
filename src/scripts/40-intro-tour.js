  // ================= intro tour =================
  // A short visual guide: a welcome card, then a spotlight on each part of the app. Shown once, replayable from Settings.
  const TOUR_ICON = {
    add: `<path d="M12 5v14M5 12h14"/>`, play: `<path d="M8 5v14l11-7z"/>`, shelf: `<path d="M3 20h18M5 20V6h3v14M10 20V4h3v16M15.5 7l3 .8-3.2 12"/>`,
    brush: `<path d="M4 20c3 0 5-1.5 5-4l9-9-3-3-9 9c-2.5 0-4 2-4 5z"/>`, game: `<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>`,
    soul: `<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.6 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>`, friends: `<circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9.5" r="2.6"/><path d="M2.5 20c.8-3.8 3.4-5.6 6.5-5.6s5.7 1.8 6.5 5.6M15.5 14.6c2.7-.3 5 1.2 6 4.6"/>`,
    sync: `<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4"/>`, buddy: `<circle cx="12" cy="12" r="8"/><path d="M9 10h.01M15 10h.01M8.5 14.5c2 1.8 5 1.8 7 0"/>`, flag: `<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>`
  };
  const tourIcon = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${TOUR_ICON[k]}</svg>`;
  const TOUR = [
    { t: ["#deck:not([hidden])"], i: "play", h: "Now playing", p: "Games you're playing live here. Press <b>▶ Play</b> to start one, add time with <b>+30 min</b> or the timer, tap the hours to type your total, and press <b>Finished it</b> when the credits roll." },
    { t: [".bnav [data-nav=add]", ".console"], i: "add", h: "Add your games", p: "Search any game by name and add it as Playing, Finished or Backlog. Got a Steam library? <b>Import from Steam</b> brings it all in at once, with hours." },
    { t: [".rack"], i: "shelf", h: "Your gamer's nook", p: "Every game sits on a shelf by status. <b>Drag a game</b> (or press and hold on a phone) to move it, even to another shelf. Finished games fly to Finished by themselves." },
    { t: ["[data-nookmenu]"], i: "brush", h: "Make it yours", p: "<b>Customize</b> switches the room (Cozy room, Display case, Classic rack), sorts shelves, adds new shelves, decorations and a sign with your name. Tap a trinket to remove it, or drag it anywhere." },
    { t: ["#shelves .spine[data-open]", ".rack"], i: "game", h: "Open any game", p: "Tap a game to rate it, set dates and hours, choose how it launches, read playtime from save files, and tag how it made you feel." },
    { t: [".bnav [data-nav=stats]", "#tab-stats"], i: "soul", h: "You", p: "Your stats, <b>Your year</b> with a wrap-up story, and <b>the Gamer's Soul</b>: your gamer type and DNA, which shift with every game you play." },
    { t: [".bnav [data-nav=friends]", "#tab-friends"], i: "friends", h: "Friends", p: "Pick a gamer tag, add friends by theirs, and look through each other's shelves and stats." },
    { t: ["#sync-btn"], i: "sync", h: "Phone and PC, one library", p: "Sign in here and your games, shelves and sessions sync between all your devices." },
    { t: ["#buddy-btn"], i: "buddy", h: "Your co-op buddy", p: "A little companion that cheers you on. Tap to chat, double-tap to pet, or seat it on your main page." }
  ];
  let tourEl = null, tourI = -1, tourSteps = [];
  const tourTarget = st => { for (const sel of st.t) { const el = [...document.querySelectorAll(sel)].find(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(x).visibility !== "hidden"; }); if (el) return el; } return null; };
  function tourEnd(done){
    if (!tourEl) return; tourEl.remove(); tourEl = null; removeEventListener("resize", tourPlace); removeEventListener("scroll", tourPlace, true); document.removeEventListener("keydown", tourKey, true);
    settings.toured = true; applySettings();
    if (done === "add") { showTab("library"); requestAnimationFrame(() => { $(".console")?.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" }); setTimeout(() => $("#q")?.focus({ preventScroll: true }), 400); }); }
    if (!settings.buddyAsked) setTimeout(() => { if (!root.innerHTML) buddy.openPicker(); }, 600);
  }
  function tourKey(e){ if (!tourEl) return; if (e.key === "Escape") { e.preventDefault(); tourEnd(); } else if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); tourGo(1); } else if (e.key === "ArrowLeft") { e.preventDefault(); tourGo(-1); } }
  function tourPlace(){
    if (!tourEl || tourI < 0) return; const st = tourSteps[tourI], el = tourTarget(st), hole = tourEl.querySelector(".thole"), card = tourEl.querySelector(".tcard");
    if (!el) return; const r = el.getBoundingClientRect(), pad = 8, big = r.height > innerHeight * .6;
    const top = Math.max(6, r.top - pad), h = big ? Math.min(innerHeight * .5, r.height + pad * 2) : r.height + pad * 2;
    Object.assign(hole.style, { left: Math.max(6, r.left - pad) + "px", top: top + "px", width: Math.min(innerWidth - 12, r.width + pad * 2) + "px", height: h + "px" });
    const cw = Math.min(360, innerWidth - 24), ch = card.offsetHeight || 220, below = top + h + 14, above = top - 14 - ch;
    const y = below + ch < innerHeight - 8 ? below : above > 8 ? above : Math.max(8, innerHeight - ch - 8);
    const x = Math.max(12, Math.min(innerWidth - cw - 12, r.left + r.width / 2 - cw / 2));
    Object.assign(card.style, { left: x + "px", top: y + "px", width: cw + "px" });
  }
  function tourGo(d){
    if (!tourEl) return;
    tourI += d; if (tourI < 0) tourI = 0;
    if (tourI >= tourSteps.length) return tourFinish();
    const st = tourSteps[tourI], el = tourTarget(st); if (!el) { tourSteps.splice(tourI, 1); if (d < 0) return tourGo(-1); tourI--; return tourGo(1); } // skip parts that aren't on screen (no Now playing yet, for example)
    tourEl.className = "tour spot";
    tourEl.innerHTML = `<div class="thole"></div><div class="tcard" role="dialog" aria-modal="true" aria-labelledby="tour-h" tabindex="-1"><div class="tic">${tourIcon(st.i)}</div><span class="px">Step ${tourI + 1} of ${tourSteps.length}</span><h3 id="tour-h">${st.h}</h3><p>${st.p}</p>
      <div class="tdots">${tourSteps.map((_, k) => `<i class="${k === tourI ? "on" : k < tourI ? "done" : ""}"></i>`).join("")}</div>
      <div class="tfoot"><button class="linkbtn" type="button" data-tskip>Skip tour</button><span>${tourI ? `<button class="btn small" type="button" data-tback>Back</button>` : ""}<button class="btn small primary" type="button" data-tnext>${tourI === tourSteps.length - 1 ? "Finish" : "Next"}</button></span></div></div>`;
    const r = el.getBoundingClientRect(), fixed = getComputedStyle(el).position === "fixed" || el.closest(".bnav,.buddy,header");
    if (!fixed && (r.top < 70 || r.bottom > innerHeight - 140)) el.scrollIntoView({ block: r.height > innerHeight * .6 ? "start" : "center", behavior: "auto" });
    requestAnimationFrame(() => { tourPlace(); tourEl.querySelector(".tcard")?.focus({ preventScroll: true }); });
  }
  function tourFinish(){
    tourEl.className = "tour center";
    tourEl.innerHTML = `<div class="tcard big" role="dialog" aria-modal="true" aria-labelledby="tour-h" tabindex="-1"><div class="tic win">${tourIcon("flag")}</div><h2 id="tour-h">You're all set, Player 1</h2><p>Start by adding a few games you've played. The more you add, the more your shelves, stats and Gamer's Soul come alive.</p>
      <div class="tfoot"><button class="btn" type="button" data-tdone>Look around</button><button class="btn primary" type="button" data-tadd>Add my first games</button></div><p class="note">You can replay this tour any time from Settings.</p></div>`;
    tourEl.querySelector(".tcard").focus();
  }
  function startTour(){
    if (tourEl) return; closeModal?.(); showTab("library"); window.scrollTo({ top: 0, behavior: "auto" });
    tourSteps = TOUR.slice(); tourI = -1;
    tourEl = document.createElement("div"); tourEl.className = "tour center";
    const steps = [["add", "Track every game", "Playing, finished, backlog and wishlist, with hours, ratings and dates."], ["shelf", "Build your nook", "Shelves, rooms and trinkets you arrange yourself."], ["soul", "Discover your gamer self", "Stats, a yearly wrap-up and your Gamer's Soul."], ["friends", "Play together", "Sync your devices and compare shelves with friends."]];
    tourEl.innerHTML = `<div class="tcard big welcome" role="dialog" aria-modal="true" aria-labelledby="tour-h" tabindex="-1"><span class="px">Welcome to</span><h2 id="tour-h" class="tlogo">Save <span>Point</span></h2><p>Your games, your shelves, your story. Here's what you can do:</p>
      <ul class="tfeat">${steps.map(([i, h, p]) => `<li><span class="tic">${tourIcon(i)}</span><span><b>${h}</b><small>${p}</small></span></li>`).join("")}</ul>
      <div class="tfoot"><button class="btn" type="button" data-tskip>Skip</button><button class="btn primary" type="button" data-tnext>Show me around</button></div><p class="note">About a minute. Use the arrow keys or the buttons.</p></div>`;
    document.body.append(tourEl);
    tourEl.addEventListener("click", e => {
      if (e.target.closest("[data-tnext]")) return tourGo(1);
      if (e.target.closest("[data-tback]")) return tourGo(-1);
      if (e.target.closest("[data-tskip]") || e.target.closest("[data-tdone]")) return tourEnd();
      if (e.target.closest("[data-tadd]")) return tourEnd("add");
    });
    addEventListener("resize", tourPlace); addEventListener("scroll", tourPlace, true); document.addEventListener("keydown", tourKey, true);
    tourEl.querySelector(".tcard").focus();
  }
  const hashTab = location.hash.slice(1); if (TABS.includes(hashTab) && hashTab !== "library") showTab(hashTab);
  renderResults("idle");
  render();
  sync.paint();
  startSparks();
  setTimeout(() => { try { soulData(); } catch {} }, 1200); // sets the starting point for DNA shifts
  setTimeout(() => { launcherInbox(); backFromGame(); }, 900);
  addEventListener("storage", e => { if (e.key === LS && !root.innerHTML) { games = lsGet(LS, []); render(); } }); // another tab (like the launcher's) changed your games
  const buddyMoved = buddy.migrate();
  buddy.render();
  buddy.welcomeBack();
  if (buddyMoved) setTimeout(() => { if (!root.innerHTML) buddy.openPicker(settings.buddy?.type, "Your co-op crew got an upgrade"); }, 1800);
  else if (!settings.toured && !new URLSearchParams(location.search).has("splog") && !PUB_SLUG) setTimeout(() => { if (!root.innerHTML) startTour(); }, 1200);
  else if (!settings.buddyAsked) setTimeout(() => { if (!root.innerHTML) buddy.openPicker(); }, 1800);
  addEventListener("load", () => { sync.connect(); });
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
