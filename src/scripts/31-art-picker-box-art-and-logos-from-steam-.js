  // ================= art picker: box art and logos from Steam, Wikipedia and Wikidata =================
  const WIKI_LANGS = ["fr", "es", "it", "de", "pt", "pl", "ru", "ja", "ko", "zh"];
  const fileKey = n => String(n || "").replace(/^File:/i, "").replace(/_/g, " ").toLowerCase();
  async function findArt(g, signal){
    let wid = g.wikidata, wiki = g.wiki, appid = g.steamAppId;
    if (!wid) { try { const r = await lookupOne(g); if (r) { wid = r.wikidata; wiki = wiki || r.wiki; appid = appid || r.steamAppId; } } catch {} }
    const covers = [], logos = [], seen = new Set();
    const add = (list, url, src, key) => { const k = key ? fileKey(key) : url; if (!url || seen.has(k)) return; seen.add(k); list.push({ url, src }); };
    if (appid) { add(covers, steamCover(appid), "Steam"); add(covers, steamHeader(appid), "Steam banner"); add(logos, steamImg(appid, "logo.png"), "Steam"); add(logos, steamImg(appid, "logo_2x.png"), "Steam (large)"); add(logos, `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${encodeURIComponent(appid)}/logo.png`, "Steam store"); }
    let sites = {};
    if (wid) {
      try {
        const e = (await wd({ action: "wbgetentities", ids: wid, props: "claims|sitelinks" }, signal)).entities?.[wid] || {};
        claimStr(e, "P154").forEach(f => add(logos, commonsFile(f, 600), "Wikidata", f));
        // no logo of its own? the series logo (Uncharted, Assassin's Creed…) still reads well on a spine
        const ser = (e.claims?.P179 || []).map(c => c.mainsnak?.datavalue?.value?.id).filter(Boolean)[0];
        if (ser) { try { const se = (await wd({ action: "wbgetentities", ids: ser, props: "claims" }, signal)).entities?.[ser] || {}; claimStr(se, "P154").forEach(f => add(logos, commonsFile(f, 600), "Series logo", f)); } catch (e2) { if (e2.name === "AbortError") throw e2; } }
        claimStr(e, "P18").forEach(f => add(covers, commonsFile(f, 600), "Wikimedia", f));
        sites = e.sitelinks || {}; wiki = wiki || sites.enwiki?.title;
      } catch (e) { if (e.name === "AbortError") throw e; }
    }
    if (wiki) {
      try {
        const j = await wp("en", { action: "query", titles: wiki, prop: "pageimages|images", piprop: "thumbnail|name", pithumbsize: 600, pilicense: "any", imlimit: 50, redirects: 1 }, signal);
        const pg = Object.values(j.query?.pages || {})[0] || {};
        if (pg.thumbnail?.source) add(covers, pg.thumbnail.source, "Wikipedia", pg.pageimage);
        const files = (pg.images || []).map(i => i.title).filter(t => /cover|box|art|key|poster|logo|wordmark/i.test(t) && !/commons-logo|wiki\w*-logo|question_book|edit-clear|symbol|icon|award|photograph|\(cropped\)/i.test(t) && (!/\.svg$/i.test(t) || /logo|wordmark/i.test(t)));
        if (files.length) {
          const info = await wp("en", { action: "query", titles: files.slice(0, 20).join("|"), prop: "imageinfo", iiprop: "url", iiurlwidth: 600 }, signal);
          for (const f of Object.values(info.query?.pages || {})) { const ii = f.imageinfo?.[0]; if (ii) add(/logo|wordmark/i.test(f.title) ? logos : covers, ii.thumburl || ii.url, "Wikipedia", f.title); }
        }
      } catch (e) { if (e.name === "AbortError") throw e; }
    }
    await Promise.all(WIKI_LANGS.filter(l => sites[l + "wiki"]).map(async l => {
      try { const t = sites[l + "wiki"].title, c = await wikiCovers(l, [t], signal); if (c[t]) add(covers, c[t].url, `Wikipedia (${l.toUpperCase()})`, c[t].name); } catch {}
      // logo files used on other languages' articles
      try { const t = sites[l + "wiki"].title, j = await wp(l, { action: "query", titles: t, prop: "images", imlimit: 50, redirects: 1 }, signal);
        const files = (Object.values(j.query?.pages || {})[0]?.images || []).map(i => i.title).filter(x => /logo|wordmark|schriftzug|logotipo/i.test(x) && !/commons-logo|wiki\w*-logo|icon|flag|award/i.test(x)).slice(0, 4);
        if (files.length) { const info = await wp(l, { action: "query", titles: files.join("|"), prop: "imageinfo", iiprop: "url", iiurlwidth: 600 }, signal);
          for (const f of Object.values(info.query?.pages || {})) { const ii = f.imageinfo?.[0]; if (ii) add(logos, ii.thumburl || ii.url, `Wikipedia (${l.toUpperCase()})`, f.title); } } } catch {}
    }));
    // a search of Wikimedia Commons for "<title> logo"
    try {
      const u = new URL("https://commons.wikimedia.org/w/api.php"), q = String(g.title || "").replace(/[:™®]/g, " ").trim();
      Object.entries({ action: "query", generator: "search", gsrsearch: `${q} logo`, gsrnamespace: 6, gsrlimit: 10, prop: "imageinfo", iiprop: "url", iiurlwidth: 600, format: "json", origin: "*" }).forEach(([k, v]) => u.searchParams.set(k, v));
      const j = await (await fetch(u, { signal })).json(), words = norm(q).slice(0, 8);
      for (const f of Object.values(j.query?.pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0))) { const ii = f.imageinfo?.[0]; if (ii && /logo|wordmark/i.test(f.title) && norm(f.title).includes(words)) add(logos, ii.thumburl || ii.url, "Wikimedia Commons", f.title); }
    } catch (e) { if (e.name === "AbortError") throw e; }
    return { covers, logos, found: { wikidata: wid || "", wiki: wiki || "", steamAppId: appid || "" } };
  }
  function openArt(d, onPick){
    document.querySelector(".art-scrim")?.remove();
    const pick = { cover: d.cover || "", coverPick: d.coverPick || "", logoPick: d.logoPick || "" };
    const ctl = new AbortController();
    const el = document.createElement("div"); el.className = "scrim art-scrim";
    el.innerHTML = `<div class="modal wide" role="dialog" aria-modal="true" aria-labelledby="art-t"><div class="reshead"><h2 id="art-t">Choose art</h2><button class="btn small" type="button" data-artx>Cancel</button></div><div id="art-body"><div class="status"><span class="dots">Looking for box art and logos for “${esc(d.title)}”</span></div></div></div>`;
    document.body.append(el);
    let res = null;
    const curCover = () => pick.cover ? "upload" : pick.coverPick || coverChain(d)[0] || "none";
    const curLogo = () => pick.logoPick || logoChain(d)[0] || "none";
    const draw = () => {
      const cc = curCover(), cl = curLogo(), gen = { ...d, cover: "", coverPick: "none" };
      $("#art-body", el).innerHTML = `
        <div class="px" style="margin-bottom:8px">Box art</div>
        <div class="artgrid">${res.covers.map((c, i) => `<button type="button" class="arttile${c.url === cc ? " on" : ""}" data-cv="${i}" aria-label="Use box art from ${esc(c.src)}"><img src="${esc(c.url)}" alt="" referrerpolicy="no-referrer" loading="lazy" onerror="this.closest('.arttile').remove()"><span>${esc(c.src)}</span></button>`).join("")}
          ${d.cover ? `<button type="button" class="arttile${cc === "upload" ? " on" : ""}" data-cv="upload"><img src="${esc(d.cover)}" alt=""><span>Your image</span></button>` : ""}
          <button type="button" class="arttile gen${cc === "none" ? " on" : ""}" data-cv="none">${boxHTML(gen)}<span>Generated</span></button></div>
        <div class="px" style="margin:16px 0 8px">Logo on the spine and Now playing</div>
        <div class="artgrid logos">${res.logos.map((c, i) => `<button type="button" class="arttile${c.url === cl ? " on" : ""}" data-lg="${i}" aria-label="Use logo from ${esc(c.src)}"><img src="${esc(c.url)}" alt="" referrerpolicy="no-referrer" loading="lazy" onerror="this.closest('.arttile').remove()"><span>${esc(c.src)}</span></button>`).join("")}
          <button type="button" class="arttile plain${cl === "none" ? " on" : ""}" data-lg="none"><b>${esc(d.title)}</b><span>Title text</span></button>
          <label class="arttile upl" tabindex="0"><b>＋</b><span>Upload a logo</span><input type="file" id="lg-file" accept="image/png,image/webp,image/svg+xml,image/gif,image/jpeg" hidden></label></div>
        <div class="lgurl"><input id="lg-url" type="url" placeholder="Or paste a link to a logo image (https://…)" aria-label="Logo image link"><button class="btn small" type="button" data-lgurl>Use link</button></div>
        <p class="note" style="margin:4px 0 0">Tip: a logo with a see-through background (PNG or SVG) looks best on a spine.</p>
        ${!res.covers.length && !res.logos.length ? `<div class="note" style="margin-top:12px">No pictures found for this game yet. Very new games often get theirs on Wikipedia within days.</div>` : ""}
        <div class="mfoot" style="margin-top:16px"><span class="note">Not here? Drop or paste your own image in the game's window. <a href="https://www.google.com/search?tbm=isch&q=${encodeURIComponent(d.title + " box art")}" target="_blank" rel="noopener" style="color:var(--accent)">Search the web ↗</a> · <a href="https://www.google.com/search?tbm=isch&tbs=ic:trans&q=${encodeURIComponent(d.title + " logo png")}" target="_blank" rel="noopener" style="color:var(--accent)">Find a logo ↗</a></span><div class="r"><button class="btn primary" type="button" data-artok>Use these</button></div></div>`;
    };
    el.addEventListener("click", e => {
      const t = e.target;
      if (t === el || t.closest("[data-artx]")) { ctl.abort(); el.remove(); return; }
      if (!res) return;
      const cv = t.closest("[data-cv]");
      if (cv) { const v = cv.dataset.cv; if (v === "upload") { pick.cover = d.cover; pick.coverPick = ""; } else { pick.cover = ""; pick.coverPick = v === "none" ? "none" : res.covers[+v].url; } draw(); return; }
      if (t.closest("[data-lgurl]")) { const u = ($("#lg-url", el)?.value || "").trim(); if (!/^https:\/\/\S+$/i.test(u)) { toast("Paste a link that starts with https://"); return; } res.logos.unshift({ url: u, src: "Your link" }); pick.logoPick = u; draw(); return; }
      const lg = t.closest("[data-lg]");
      if (lg) { const v = lg.dataset.lg; pick.logoPick = v === "none" ? "none" : res.logos[+v].url; draw(); return; }
      if (t.closest("[data-artok]")) { el.remove(); if (!pick.logoPick) { const cl = curLogo(); if (cl && cl !== "none") pick.logoPick = cl; } onPick({ ...pick, ...Object.fromEntries(Object.entries(res.found).filter(([k, v]) => v && !d[k])), artChecked: true }); }
    });
    // your own logo file: shrunk to a sensible size, transparency kept
    el.addEventListener("change", async e => {
      if (e.target.id !== "lg-file" || !res) return; const f = e.target.files?.[0]; if (!f) return;
      try {
        const url = await new Promise((ok, no) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.onerror = no; fr.readAsDataURL(f); });
        const im = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = url; });
        const sc = Math.min(1, 640 / (im.naturalWidth || 640)), c = document.createElement("canvas"); c.width = Math.max(1, Math.round((im.naturalWidth || 640) * sc)); c.height = Math.max(1, Math.round((im.naturalHeight || 200) * sc));
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); const out = c.toDataURL("image/png");
        res.logos.unshift({ url: out, src: "Your logo" }); pick.logoPick = out; draw();
      } catch { toast("That image couldn't be read. Try a PNG."); }
    });
    findArt(d, ctl.signal).then(r => { res = r; if (el.isConnected) draw(); }).catch(e => { if (e.name !== "AbortError" && el.isConnected) $("#art-body", el).innerHTML = `<div class="status">${navigator.onLine ? "The picture search didn't answer. Try again in a moment." : "You're offline, so the picture search isn't available."}</div>`; });
  }

