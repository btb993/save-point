  // ================= launching games =================
  // Steam games open through Steam, other games through a link you paste or the Save Point Launcher on Windows.
  // A browser can't start .exe files by itself, so the launcher (a small script on your PC) starts the game and
  // reports the session back by opening Save Point when you quit.
  const LAUNCHER_ZIP = "launcher/SavePoint-Launcher.zip";
  const launchKind = g => g.launch?.kind === "none" ? "" : g.launch?.kind || (g.steamAppId ? "steam" : "");
  const okLaunchUrl = u => /^[a-z][a-z0-9+.-]*:\/\//i.test(u || "") && !/^(https?|javascript|data|file|vbscript|blob):/i.test(u || "");
  const playTitle = g => ({ steam: "Opens the game in Steam and starts the timer", exe: "Starts the game with the Save Point Launcher and logs the session when you quit", url: "Opens the game's link and starts the timer" }[launchKind(g)] || "Choose how this game launches");
  const hm = d => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fmtDur = sec => { const m = Math.round(sec / 60); return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`; };
  function playStatus(g){
    const L = settings.launched;
    if (L && L.id === g.id && Date.now() - L.at < 16 * 36e5) return `<div class="ingame"><i></i>In game since ${hm(new Date(L.at))}. The session is logged when you quit. <button class="linkbtn" type="button" data-launchclear>Hide</button></div>`;
    return "";
  }
  // tells the launcher which browser this app lives in, so it reopens here (Brave, Chrome or Edge) and not in another browser
  const browserHint = () => { try { if (navigator.brave) return "brave"; const b = (navigator.userAgentData?.brands || []).map(x => x.brand).join(" "); if (/Edge/i.test(b) || /Edg\//.test(navigator.userAgent)) return "edge"; if (/Google Chrome/i.test(b)) return "chrome"; } catch {} return ""; };
  function linkExe(g){
    location.href = `savepoint://link/${encodeURIComponent(g.id)}?t=${encodeURIComponent(String(g.title || "").slice(0, 80))}${browserHint() ? "&b=" + browserHint() : ""}`;
    toast("Pick the game's .exe in the window that opens. Nothing happened? Install the launcher first.");
  }
  function playGame(id){
    const g = games.find(x => x.id === id); if (!g) return;
    const k = launchKind(g);
    if (k === "exe") {
      if (!g.launch?.name) { openEditor(g, false, "Connect the game's .exe under “How to launch” first."); return; }
      settings.launched = { id, at: Date.now() }; applySettings(); renderDeck();
      location.href = `savepoint://play/${encodeURIComponent(id)}${browserHint() ? "?b=" + browserHint() : ""}`;
      toast(`Starting ${g.title}. Your session is logged when you close the game.`);
      return;
    }
    const url = k === "steam" ? `steam://rungameid/${encodeURIComponent(g.steamAppId)}` : k === "url" ? g.launch?.url : "";
    if (!k || !okLaunchUrl(url)) { openEditor(g, false, k === "url" ? "That launch link doesn't look right. Fix it under “How to launch”." : "Choose how to launch it under “How to launch”."); return; }
    if (settings.timer?.id !== id) { if (settings.timer) stopTimer(null); settings.timer = { id, start: Date.now(), auto: true }; applySettings(); renderDeck(); }
    location.href = url;
    toast(`Starting ${g.title}. The timer is running. When you come back, Save Point asks to log the session.`);
  }
  // back from a game started with Play: offer to log the time
  function backFromGame(){
    const t = settings.timer; if (!t?.auto || document.hidden || root.innerHTML) return;
    const mins = (Date.now() - t.start) / 6e4; if (mins < 5 || (t.asked && Date.now() - t.asked < 10 * 6e4)) return;
    const g = games.find(x => x.id === t.id); if (!g) return;
    t.asked = Date.now(); applySettings();
    openModal(`<div class="modal launchmod" role="dialog" aria-modal="true" aria-labelledby="bk-t"><span class="px">Welcome back</span><h2 id="bk-t">Done playing ${esc(g.title)}?</h2><p class="bigtime">${fmtDur((Date.now() - t.start) / 1000)}</p><p class="note">Since you pressed Play at ${hm(new Date(t.start))}. If you took a long break, log it by hand instead.</p>
      <div class="mfoot"><button class="btn small" type="button" id="bk-no">Don't log</button><div class="r"><button class="btn" type="button" id="bk-still">Still playing</button><button class="btn primary" type="button" id="bk-ok">Log session</button></div></div></div>`, e => {
      if (e.target.id === "bk-ok") { closeModal(); stopTimer(null); }
      else if (e.target.id === "bk-still") closeModal();
      else if (e.target.id === "bk-no") { settings.timer = null; applySettings(); closeModal(); renderDeck(); toast("Timer stopped. Nothing was logged."); }
    });
  }
  document.addEventListener("visibilitychange", () => setTimeout(backFromGame, 600));
  // the launcher comes back with ?splinked= (an .exe was connected) or ?splog= (a session ended)
  function launcherInbox(tries = 0){
    const q = new URLSearchParams(location.search); if (!q.has("splog") && !q.has("splinked")) return;
    const id = q.get("splinked") || q.get("splog"), g = games.find(x => x.id === id);
    if (!g && tries < 3) { setTimeout(() => launcherInbox(tries + 1), 3500); return; } // give sync a moment to bring the game in
    try { history.replaceState(null, "", location.pathname + location.hash); } catch {}
    if (!g) { toast("The launcher sent a session for a game that isn't in this library."); return; }
    if (q.has("splinked")) { const name = (q.get("x") || "").replace(/[^\w .()+&'-]/g, "").slice(0, 80); saveGame({ ...g, launch: { kind: "exe", name } }, `${g.title} is connected to ${name || "its .exe"}. Press Play to start it.`); return; }
    const s = +q.get("s"), e = +q.get("e"), n = q.get("n") || "", used = lsGet("save-point-splog", []), sec = e - s, nowS = Date.now() / 1000;
    if (used.includes(n)) { toast("That session was already logged."); return; }
    if (!n || !(sec >= 60 && sec <= 16 * 3600) || !(e <= nowS + 300 && e >= nowS - 7 * 86400)) { toast("The launcher sent a session that doesn't look right, so it wasn't logged."); return; }
    if (settings.launched?.id === id) { settings.launched = null; applySettings(); renderDeck(); }
    // logged straight away, to the minute; a wrong session can be removed under the game's Play tab
    lsSet("save-point-splog", [n, ...used].slice(0, 80));
    const t0 = new Date(s * 1000), t1 = new Date(e * 1000);
    logSession(id, sec / 3600, null, s * 1000);
    setTimeout(() => toast(`Logged ${fmtDur(sec)} of ${g.title} (${hm(t0)} to ${hm(t1)}), timed by the launcher.`), 3400);
  }
  const launchField = d => {
    if (!d.id || !games.some(x => x.id === d.id) || d.status === "wishlist") return "";
    const k = launchKind(d) || "none";
    return `<div class="field launchfield"><span class="px">How to launch (the ▶ Play button)</span><div class="seg">${[["steam", "Steam"], ["exe", "My .exe"], ["url", "Store link"], ["none", "Not set"]].filter(([x]) => x !== "steam" || d.steamAppId).map(([x, n]) => `<button type="button" data-launch="${x}" aria-pressed="${k === x}">${n}</button>`).join("")}</div>
      ${k === "steam" ? `<small class="muted">Play opens the game in Steam and starts the timer. When you come back to Save Point, it asks to log the session.</small>` : ""}
      ${k === "url" ? `<input id="f-launchurl" value="${esc(d.launch?.url || "")}" placeholder="com.epicgames.launcher://apps/…?action=launch" aria-label="Launch link"><small class="muted">A link that starts the game in its store app, like Epic, GOG Galaxy or Xbox. The timer runs until you come back.</small>` : ""}
      ${k === "exe" ? `<div class="launchrow"><span>${d.launch?.name ? `Connected to <b>${esc(d.launch.name)}</b>` : "No .exe connected yet."}</span><button class="btn small primary" type="button" data-linkexe>${d.launch?.name ? "Change .exe" : "Connect .exe"}</button></div>
        <details class="more"><summary>Set up the Save Point Launcher (Windows, one time)</summary><ol class="steps"><li><a class="btn small" href="${LAUNCHER_ZIP}" download>Download the launcher</a> and unzip it.</li><li>Double-click <b>Install Save Point Launcher.cmd</b>. If Windows warns about it, choose More info, then Run anyway. No admin rights needed.</li><li>Come back here and press <b>Connect .exe</b>, then pick the game's .exe (the game's own one, not Steam or Epic).</li><li>Press <b>▶ Play</b> in Now playing. When you close the game, Save Point opens and asks to log the session.</li></ol><p class="note">A browser can't start programs on its own, which is why this small helper is needed. It only starts .exe files you picked yourself and sends nothing over the internet. Uninstall any time with the included uninstall file.</p></details>` : ""}</div>`;
  };
  // type in the hours you've already played, for example from the game's own stats screen
  function setHours(id){
    const g = games.find(x => x.id === id); if (!g) return;
    openModal(`<form class="modal hrsmod" role="dialog" aria-modal="true" aria-labelledby="hr-t" id="hr-form"><span class="px">Hours played</span><h2 id="hr-t">${esc(g.title)}</h2>
      <div class="hrsrow"><input id="hr-v" type="number" min="0" max="20000" step="0.5" inputmode="decimal" value="${esc(g.hours || "")}" placeholder="0" aria-label="Total hours played"><span>hours in total</span></div>
      <p class="note">This sets your total, for example from the game's own stats or your console. To add time you just played, use +30 min, +1 h, +2 h or the timer.</p>
      <div class="mfoot"><button class="btn" type="button" data-mclose>Cancel</button><div class="r"><button class="btn primary" type="submit">Save hours</button></div></div></form>`, () => {});
    const f = $("#hr-form"), inp = $("#hr-v"); setTimeout(() => { inp.focus(); inp.select(); }, 30);
    f.addEventListener("submit", e => { e.preventDefault(); const v = inp.value.trim(); const n = v === "" ? "" : Math.max(0, Math.min(20000, Math.round(Number(v) * 10) / 10)); if (v !== "" && isNaN(n)) return; closeModal(); saveGame({ ...g, hours: n }, n === "" ? `Cleared the hours for ${g.title}` : `${g.title}: ${fmtH(n)} played`); });
  }
  // optional session timer: keeps counting even if the app is closed, logs the time when stopped
  function startTimer(id){
    const t = settings.timer; if (t && t.id !== id) stopTimer(null);
    settings.timer = { id, start: Date.now() }; applySettings(); renderDeck(); buddy.react("timer");
    toast("Timer started. It keeps counting even if you close the app.");
  }
  function stopTimer(btn){
    const t = settings.timer; if (!t) return;
    settings.timer = null; applySettings();
    const h = Math.max(1 / 60, (Date.now() - t.start) / 36e5);
    logSession(t.id, h, btn, t.start);
  }
  setInterval(() => document.querySelectorAll(".tclock").forEach(el => { const s = Math.max(0, Math.floor((Date.now() - +el.dataset.start) / 1000)); el.textContent = `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }), 1000);
  function logSession(id, h, btn, startTs){
    const g = games.find(x => x.id === id); if (!g) return;
    const d = todayISO(), sessions = (g.sessions || []).map(s => ({ ...s }));
    const same = sessions.find(s => s.d === d);
    const hr = startTs ? new Date(startTs).getHours() : null, night = hr != null && (hr >= 23 || hr < 5); // only timed sessions can prove a late night
    h = Math.round(h * 100) / 100; // keep minutes: 40 min is 0.67 h
    if (same) { same.h = Math.round((same.h + h) * 100) / 100; if (night) same.n = true; } else sessions.push(night ? { d, h, n: true } : { d, h });
    if (btn && !reduceMotion) { const r = btn.getBoundingClientRect(); const f = document.createElement("div"); f.className = "plus"; f.textContent = `+${h * 10} XP`; f.style.left = (r.left + r.width / 2 - 24) + "px"; f.style.top = (r.top - 6) + "px"; document.body.append(f); setTimeout(() => f.remove(), 1000); }
    saveGame({ ...g, sessions, hours: Math.round(((Number(g.hours) || 0) + h) * 100) / 100, started: g.started || d }, `Logged ${fmtH(h)} on ${g.title}`);
  }
  function achieve(title, sub){
    if (reduceMotion) { toast(`${title}. ${sub}`); return; }
    document.querySelectorAll(".ach").forEach(x => x.remove());
    const a = document.createElement("div"); a.className = "ach"; a.setAttribute("role", "status");
    a.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 6h20v10a10 10 0 0 1-20 0z" fill="#F2BE45"/><path d="M14 9H7v4a7 7 0 0 0 7 7M34 9h7v4a7 7 0 0 1-7 7" fill="none" stroke="#F2BE45" stroke-width="3"/><path d="M21 26h6v8h-6z" fill="#D99A12"/><path d="M15 36h18v6H15z" fill="#F2BE45"/><path d="M19 9h3v9h-3z" fill="#fff" opacity=".6"/></svg><div><div class="px">Achievement unlocked</div><b>${esc(title)}</b><span>${esc(sub)}</span></div>`;
    document.body.append(a); setTimeout(() => a.remove(), 4400);
  }
  function levelUp(L){
    setTimeout(() => buddy.react("level", { n: L }), 1500);
    if (reduceMotion) { toast(`Level up! You're now level ${L}.`); return; }
    const o = document.createElement("div"); o.className = "lvup"; o.setAttribute("role", "status");
    o.innerHTML = `<div><span class="px">Level up</span><b>LV ${L}</b></div>`; document.body.append(o); setTimeout(() => o.remove(), 2100);
  }
  function markBeaten(id){
    const g = games.find(x => x.id === id); if (!g) return;
    const out = { ...g, status: "finished", finished: todayISO(), progress: 100 };
    saveGame(out);
    const y = String(new Date().getFullYear()), done = games.filter(x => x.status === "finished" && (x.finished || "").startsWith(y)).length;
    if (done === Math.max(1, +settings.goal || 12)) achieve(`${y} goal reached`, `${done} games finished this year`);
    else achieve(`Cleared ${g.title}`, `+300 XP · ${done} finished in ${y}`);
    // let the game fly to the Finished shelf before the window opens
    setTimeout(() => openEditor(out, false, "Cleared! Rate it while it's fresh."), Date.now() - lastFlight < 400 ? 1250 : 0);
  }

