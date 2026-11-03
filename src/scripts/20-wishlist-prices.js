  // ================= wishlist prices (CheapShark: PC store deals, US dollars) =================
  // Asked directly from your browser; if that's ever blocked, the optional "playtime" helper on your Supabase does it.
  const CS_STORES = { 1: "Steam", 2: "GamersGate", 3: "GreenManGaming", 7: "GOG", 8: "EA app", 11: "Humble", 13: "Ubisoft", 15: "Fanatical", 21: "WinGameStore", 23: "GameBillet", 25: "Epic", 27: "Gamesplanet", 28: "Gamesload", 29: "2Game", 30: "IndieGala", 31: "Blizzard", 33: "DLGamer", 34: "Noctre", 35: "DreamGame" };
  const PRICE = { busy: false };
  const money = v => v == null || isNaN(v) ? "" : "$" + Number(v).toFixed(2);
  async function csGet(path){
    try { const r = await fetch("https://www.cheapshark.com/api/1.0/" + path); if (r.ok) return r.json(); } catch {}
    if (settings.estState !== "ready") throw new Error("blocked");
    const c = sync.cfg; let tok = ""; try { tok = (await sync.client?.auth.getSession())?.data?.session?.access_token || ""; } catch {}
    const r = await fetch(`${c.url}/functions/v1/playtime`, { method: "POST", headers: { apikey: c.key, Authorization: `Bearer ${tok}`, "Content-Type": "application/json" }, body: JSON.stringify({ prices: path }) });
    if (!r.ok) throw new Error("helper " + r.status); return (await r.json()).data;
  }
  async function priceOf(g){
    let gid = g.price?.gid || "";
    if (!gid) {
      const hits = await csGet(g.steamAppId ? `games?steamAppID=${encodeURIComponent(g.steamAppId)}` : `games?title=${encodeURIComponent(g.title)}&limit=8&exact=0`);
      const want = norm(g.title), best = (hits || []).find(h => g.steamAppId && String(h.steamAppID) === String(g.steamAppId)) || (hits || []).find(h => norm(h.external) === want) || (!g.steamAppId && (hits || []).length === 1 ? hits[0] : null);
      if (!best) return { none: true, at: todayISO() }; gid = best.gameID;
    }
    const d = await csGet(`games?id=${encodeURIComponent(gid)}`), deals = (d?.deals || []).map(x => ({ s: +x.storeID, p: +x.price, r: +x.retailPrice, id: x.dealID })).filter(x => isFinite(x.p)).sort((a, b) => a.p - b.p);
    if (!deals.length) return { none: true, gid, at: todayISO() };
    const b = deals[0], cut = b.r > 0 ? Math.round((1 - b.p / b.r) * 100) : 0;
    return { gid, p: b.p, r: b.r, cut, store: CS_STORES[b.s] || "a store", deal: b.id, low: d?.cheapestPriceEver?.price != null ? +d.cheapestPriceEver.price : null, at: todayISO() };
  }
  async function refreshPrices(force){
    if (PRICE.busy || !navigator.onLine) return; PRICE.busy = true;
    const due = games.filter(g => g.status === "wishlist" && !(releaseInfo(g.release).days > 0) && (force || !g.price || g.price.at !== todayISO())).slice(0, 25), sales = [];
    try {
      for (const g of due) {
        let pr; try { pr = await priceOf(g); } catch (e) { if (e.message === "blocked") { settings.priceBlocked = true; applySettings(); break; } continue; }
        const cur = games.find(x => x.id === g.id); if (!cur) continue;
        const wasSale = (cur.price?.cut || 0) >= 20; cur.price = pr; cur.updatedAt = Date.now();
        if (!pr.none && pr.cut >= 20 && !wasSale) sales.push(cur);
        await new Promise(r => setTimeout(r, 350));
      }
      if (due.length) { settings.priceBlocked = false; applySettings(); saveLocal(); try { sync.schedule(); } catch {} if (tab === "wishlist") renderWishlist(); }
      if (sales.length) toast(sales.length === 1 ? `On sale: ${sales[0].title} is ${sales[0].price.cut}% off (${money(sales[0].price.p)} at ${sales[0].price.store})` : `${sales.length} wishlist games are on sale!`);
    } finally { PRICE.busy = false; }
    priceBadge();
  }
  function priceBadge(){ const n = games.filter(g => g.status === "wishlist" && (g.price?.cut || 0) >= 20).length; document.querySelectorAll('[data-nav=wishlist], #tab-wishlist').forEach(b => { let i = b.querySelector(".nbadge.sale"); if (!n) { i?.remove(); return; } if (!i) { i = document.createElement("i"); i.className = "nbadge sale"; b.append(i); } i.textContent = "%"; i.title = `${n} on sale`; }); }
  const priceTag = g => { const P = g.price; if (!P || P.none) return ""; const atLow = P.low != null && P.p <= P.low + .01;
    return `<a class="ptag${P.cut >= 20 ? " sale" : ""}" href="https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(P.deal)}" target="_blank" rel="noopener" title="Cheapest PC price right now, at ${esc(P.store)}${P.low != null ? `. Lowest ever: ${money(P.low)}` : ""}"><b>${money(P.p)}</b>${P.cut >= 5 ? `<s>${money(P.r)}</s><i>−${P.cut}%</i>` : ""}<small>${esc(P.store)}${atLow ? " · lowest ever!" : ""}</small></a>`; };
  setTimeout(() => refreshPrices(), 20000);
  function renderWishlist(){
    const el = $("#view-wishlist"); setTimeout(() => refreshPrices(), 600);
    const list = games.filter(g => g.status === "wishlist").map(g => ({ g, i: releaseInfo(g.release) })).sort((a, b) => a.i.sort.localeCompare(b.i.sort));
    if (!list.length) { el.innerHTML = `<div class="empty"><h3>Your wishlist is empty</h3><div>Wishlist games you're waiting for and they show up on your release radar with a countdown.</div><button class="btn primary" type="button" data-goto="discover">See what's coming soon</button></div>`; return; }
    const out = list.filter(x => x.i.days != null && x.i.days < 0 || x.i.label === "Out now");
    const up = list.filter(x => !out.includes(x));
    const dated = up.filter(x => x.i.days != null && x.i.days >= 0 && x.i.days <= 365);
    const next = dated[0];
    const blips = dated.map(({ g, i }) => { const r = 8 + Math.min(1, i.days / 365) * 40, a = hashNum(g.title, 360) * Math.PI / 180;
      return `<button class="blip${i.days <= 30 ? " near" : ""}" type="button" data-open="${esc(g.id)}" style="left:${(50 + r * Math.cos(a)).toFixed(1)}%;top:${(50 + r * Math.sin(a)).toFixed(1)}%" title="${esc(g.title)} · ${esc(i.label)}" aria-label="${esc(g.title)}, ${esc(i.label)}"></button>`; }).join("");
    const row = ({ g, i }) => `<div class="wrow">${boxHTML(g, "button", `type="button" data-open="${esc(g.id)}" aria-label="Open ${esc(g.title)}" style="border:0;padding:0;cursor:pointer;--c:${caseColor(g)};--pc:${pcVar(mainPlat(g))}"`)}
      <div class="meta"><div class="t">${esc(g.title)}</div><div class="a">${esc(g.developer || "")}</div>
        <div class="facts">${priceTag(g)}${runBadge(g)}${g.release ? `<span>${esc(fmtDate(g.release))}</span>` : ""}${(g.platforms || []).slice(0, 4).map(p => `<span class="plat" style="--pc:${pcVar(p)}">${esc(p)}</span>`).join("")}</div></div>
      <div class="wcount">${i.days != null && i.days > 0 ? `<b>${i.days}</b><span>day${i.days === 1 ? "" : "s"}</span>` : `<span class="wlabel${i.label.startsWith("Out") ? " out" : ""}">${esc(i.label)}</span>`}</div>
      <div class="wact">${i.label.startsWith("Out") ? `<button class="btn primary small" type="button" data-move="playing" data-id="${esc(g.id)}">Start playing</button><button class="btn small" type="button" data-move="backlog" data-id="${esc(g.id)}">To backlog</button>` : `<button class="btn small" type="button" data-open="${esc(g.id)}">Details</button>`}</div></div>`;
    const pcSet = myPC().gpu || myPC().cpu, unchecked = list.filter(x => !x.g.reqs).map(x => x.g);
    el.innerHTML = `<div class="runbar"><span>${pcSet ? `<b>Can I run it?</b> ${list.filter(x => verdict(x.g.reqs)?.lvl).length} of ${list.length} checked against your PC.` : "<b>Can I run it?</b> Add your PC to see which wishlist games it can handle."}</span>${pcSet ? `${unchecked.length ? `<button class="btn small primary" type="button" data-runall>Check ${unchecked.length} game${unchecked.length === 1 ? "" : "s"}</button>` : ""}<button class="btn small" type="button" data-mypc>My PC</button>` : `<button class="btn small primary" type="button" data-mypc>Add my PC</button>`}</div><div class="radarwrap">
        <div class="radar" aria-hidden="false" aria-label="Release radar"><i class="ring r1"></i><i class="ring r2"></i><i class="ring r3"></i><i class="sweep"></i><i class="me"></i>${blips}</div>
        <div class="radarinfo"><span class="px">Release radar</span>
          ${next ? `<div class="nexttitle">Next up</div><h2>${esc(next.g.title)}</h2><div class="bigcount">${next.i.days === 0 ? "Out today!" : `<b>${next.i.days}</b> day${next.i.days === 1 ? "" : "s"} to go`}</div><div class="note">${esc(fmtDate(next.g.release))}</div>` : `<h2>${up.length} on the way</h2><div class="note">No exact dates within a year yet.</div>`}
          <div class="note">Rings are 4, 8 and 12 months out. The closer a dot is to the centre, the sooner the game arrives.</div></div></div>
      ${out.length ? `<section class="dsec"><h2>Out now</h2><div class="wlist">${out.map(row).join("")}</div></section>` : ""}
      ${up.length ? `<section class="dsec"><h2>Coming up</h2><div class="wlist">${up.map(row).join("")}</div></section>` : ""}
      <div class="note" style="margin-top:14px">Find more in <button class="linkbtn" type="button" data-goto="discover">Discover → Coming soon</button>.</div>`;
  }

