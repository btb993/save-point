  // ================= your top 10 =================
  // A list you make yourself: your ten favourite games, in your own order. Kept with your shelves (so it syncs),
  // shown on the You page and to your friends.
  const top10 = () => (nook.best || []).map(id => games.find(g => g.id === id)).filter(Boolean).slice(0, 10);
  function saveTop10(list){ nook.best = list.map(g => g.id).slice(0, 10); saveNook(false); }
  function top10HTML(){
    const L = top10();
    const slot = (g, i) => g ? `<li class="t10" style="--i:${i}"><span class="t10n">${i + 1}</span><button class="t10box" type="button" data-open="${esc(g.id)}" aria-label="Open ${esc(g.title)}">${boxHTML(g)}</button><div class="t10t"><b>${esc(g.title)}</b>${g.rating ? `<span class="stars">${stars(g.rating)}</span>` : ""}</div></li>`
      : `<li class="t10 empty"><span class="t10n">${i + 1}</span><button class="t10box add" type="button" data-t10edit aria-label="Add a game at number ${i + 1}">＋</button></li>`;
    return `<div class="t10wrap"><div class="reshead"><div><h3>My top 10</h3><p class="note">${L.length ? "Your favourites, in your order. Friends see it on your shelves." : "Pick your ten favourite games and put them in order."}</p></div><button class="btn small${L.length ? "" : " primary"}" type="button" data-t10edit>${L.length ? "Edit" : "Make my top 10"}</button></div>
      <ol class="t10list">${Array.from({ length: 10 }, (_, i) => slot(L[i], i)).join("")}</ol></div>`;
  }
  let t10Input = null;
  document.addEventListener("input", e => { if (e.target.id === "t10-q") t10Input?.(e.target.value); });
  function openTop10(){
    let L = top10(), q = "";
    const cand = () => { const have = new Set(L.map(g => g.id)), n = norm(q);
      return games.filter(g => !have.has(g.id) && g.status !== "wishlist" && (!n || norm(g.title).includes(n)))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.status === "finished") - (a.status === "finished") || (Number(b.hours) || 0) - (Number(a.hours) || 0)).slice(0, 40); };
    const listHTML = () => L.length ? L.map((g, i) => `<li class="t10e"><span class="t10n">${i + 1}</span><span class="t10et">${esc(g.title)}${g.rating ? ` <small class="stars">${stars(g.rating)}</small>` : ""}</span>
        <span class="t10ea"><button type="button" class="btn small" data-t10up="${i}" aria-label="Move ${esc(g.title)} up" ${i ? "" : "disabled"}>▲</button><button type="button" class="btn small" data-t10down="${i}" aria-label="Move ${esc(g.title)} down" ${i < L.length - 1 ? "" : "disabled"}>▼</button><button type="button" class="btn small" data-t10rm="${i}" aria-label="Remove ${esc(g.title)}">✕</button></span></li>`).join("")
      : `<li class="note">No games yet. Pick some below, or fill it from your ratings.</li>`;
    const pickHTML = () => cand().map(g => `<button type="button" class="t10pick" data-t10add="${esc(g.id)}">${boxHTML(g)}<span><b>${esc(g.title)}</b><small>${g.rating ? stars(g.rating) : esc(STATUS[g.status] || "")}</small></span></button>`).join("") || `<p class="note">No games match.</p>`;
    const html = () => `<div class="modal wide t10modal" role="dialog" aria-modal="true" aria-labelledby="t10-h"><div class="reshead"><div><span class="px">You</span><h2 id="t10-h">My top 10</h2></div><button class="btn small primary" type="button" data-mclose>Done</button></div>
      <ol class="t10elist" id="t10-list">${listHTML()}</ol>
      ${L.length < 10 ? `<div class="t10fill"><button class="btn small" type="button" data-t10fill>Fill the rest from my ratings</button>${L.length ? `<button class="linkbtn" type="button" data-t10clear>Clear the list</button>` : ""}</div>
      <input type="search" class="filterq" id="t10-q" placeholder="Find one of your games…" value="${esc(q)}" aria-label="Find one of your games"><div class="t10picks" id="t10-picks">${pickHTML()}</div>` : `<p class="note">That's ten. Remove one to add another.${L.length ? ` <button class="linkbtn" type="button" data-t10clear>Clear the list</button>` : ""}</p>`}</div>`;
    const redraw = keepFocus => { saveTop10(L); const sc = $("#scrim"); sc.innerHTML = html(); if (keepFocus) { const i = $("#t10-q"); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } } if (tab === "stats") { const w = document.querySelector("#view-stats .t10wrap"); if (w) w.outerHTML = top10HTML(); } };
    openModal(html(), e => {
      const t = e.target;
      const a = t.closest("[data-t10add]"); if (a) { const g = games.find(x => x.id === a.dataset.t10add); if (g && L.length < 10) L.push(g); return redraw(); }
      const up = t.closest("[data-t10up]"); if (up) { const i = +up.dataset.t10up; [L[i - 1], L[i]] = [L[i], L[i - 1]]; return redraw(); }
      const dn = t.closest("[data-t10down]"); if (dn) { const i = +dn.dataset.t10down; [L[i + 1], L[i]] = [L[i], L[i + 1]]; return redraw(); }
      const rm = t.closest("[data-t10rm]"); if (rm) { L.splice(+rm.dataset.t10rm, 1); return redraw(); }
      if (t.closest("[data-t10fill]")) { const have = new Set(L.map(g => g.id)); L = [...L, ...games.filter(g => !have.has(g.id) && g.rating && g.status !== "wishlist").sort((a, b) => b.rating - a.rating || (Number(b.hours) || 0) - (Number(a.hours) || 0))].slice(0, 10); if (L.length < 10) toast("Rate more games to fill every spot."); return redraw(); }
      if (t.closest("[data-t10clear]")) { L = []; return redraw(); }
    });
    t10Input = v => { q = v; const box = $("#t10-picks"); if (box) box.innerHTML = pickHTML(); };
    setTimeout(() => $("#t10-q")?.focus(), 50);
  }
  document.addEventListener("click", e => { if (e.target.closest("[data-t10edit]")) openTop10(); });
