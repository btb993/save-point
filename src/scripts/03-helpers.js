  // ================= helpers =================
  function hashNum(s, mod){ let h = 7; for (const c of String(s)) h = (h * 33 + c.charCodeAt(0)) >>> 0; return h % mod; }
  const caseColor = g => "var(--c" + (hashNum(norm(g.title), 8) + 1) + ")";
  function platFamily(p){
    const s = String(p || "").toLowerCase();
    if (/playstation|ps\s?\d|ps vita|psp/.test(s)) return "ps";
    if (/xbox/.test(s)) return "xb";
    if (/switch|nintendo|wii|3ds|\bds\b|game ?boy|gamecube|n64/.test(s)) return "ns";
    if (/pc|windows|steam|mac|linux|deck|epic|gog/.test(s)) return "pc";
    if (/ios|android|mobile|iphone|ipad/.test(s)) return "mo";
    return "ot";
  }
  const PLAT_NAMES = { ps: "PlayStation", xb: "Xbox", ns: "Nintendo", pc: "PC", mo: "Mobile", ot: "Other" };
  function shortPlat(p){
    const s = String(p || "").trim(); if (!s) return "";
    const m = s.match(/(?:playstation|ps)\s*(\d)/i); if (m) return "PS" + m[1];
    if (/xbox series/i.test(s)) return "XSX"; if (/xbox one/i.test(s)) return "XB1"; if (/xbox 360/i.test(s)) return "X360";
    if (/switch 2/i.test(s)) return "NS2"; if (/switch/i.test(s)) return "SWITCH";
    if (/steam deck/i.test(s)) return "DECK"; if (/steam/i.test(s)) return "STEAM"; if (/^pc$|windows/i.test(s)) return "PC";
    return s.slice(0, 6).toUpperCase();
  }
  const pcVar = p => `var(--p-${platFamily(p)})`;
  const mainPlat = g => g.platform || (g.platforms || [])[0] || "";
  const steamImg = (id, f) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${encodeURIComponent(id)}/${f}`;
  const steamCover = id => steamImg(id, "library_600x900_2x.jpg");
  // wide banner art: if it's missing, fall back to the blurred cover, then to the case colour
  const steamHeader = id => steamImg(id, "header.jpg");
  const uniq = a => [...new Set(a.filter(Boolean))];
  // every picture is a list of sources tried in order: your own image, the one you picked, Steam, Wikipedia
  const coverChain = g => g.coverPick === "none" && !g.cover ? [] : uniq([g.cover, g.coverPick, g.steamAppId && steamCover(g.steamAppId), g.coverUrl, g.steamAppId && steamHeader(g.steamAppId)]);
  const logoChain = g => g.logoPick === "none" ? [] : uniq([g.logoPick, g.steamAppId && steamImg(g.steamAppId, "logo.png"), g.logoUrl]);
  const coverSrc = g => coverChain(g)[0] || "";
  // a broken picture tries the next source, then disappears so the generated art shows
  window.spCoverErr = img => { const l = (img.dataset.fb || "").split("|").filter(Boolean); if (l.length) { img.src = l.shift(); img.dataset.fb = l.join("|"); } else img.remove(); };
  // black logos would vanish on dark spines, so they are shown in white
  // logos arrive with lots of empty transparent space (Steam's are 640×360 canvases), which makes them tiny on a spine.
  // We trim that space off and check how dark the logo is, so it can be shown in white on dark spines.
  const logoCache = new Map();
  function applyLogo(img, r){
    // square or stacked logos turn into a tiny smudge on a narrow spine, so the spine shows the title instead
    const sp = img.closest(".spine"); if (sp) sp.classList.toggle("tall-logo", !!r.ar && r.ar < 1.2); // only near-square logos give way to the title
    img.dataset.trimmed = "1"; img.classList.remove("pad"); img.classList.toggle("inv", !!r.dark); img.classList.toggle("lift", !!r.lift); img.classList.toggle("knock", !!r.knock); img.classList.toggle("screen", !!r.screen); if (r.url && img.src !== r.url) img.src = r.url; }
  // some image hosts don't let the page read pixels; this public image proxy adds the permission so the logo can still be trimmed and checked
  const corsProxy = u => `https://wsrv.nl/?url=${encodeURIComponent(u)}&w=640&output=png`;
  window.spLogoOk = (img, sel) => {
    img.closest(sel)?.classList.add("haslogo");
    if (img.dataset.trimmed) return;
    const src = img.currentSrc || img.src;
    img.classList.toggle("inv", /black|dark/i.test(decodeURIComponent(src)));
    // until (or unless) trimming works, Steam's padded 16:9 logo canvases are shown filling the spine's length
    if (img.naturalWidth && Math.abs(img.naturalWidth / img.naturalHeight - 16 / 9) < .05) img.classList.add("pad");
    // uploaded logos (data: links) are trimmed too, so they fill the spine
    const hit = logoCache.get(src); if (hit) { if (hit.then) hit.then(r => r && applyLogo(img, r)); else applyLogo(img, hit); return; }
    const job = new Promise(res => {
      const p = new Image(); p.crossOrigin = "anonymous"; p.referrerPolicy = "no-referrer";
      p.onload = () => {
        try {
          const sc = Math.min(1, 640 / p.naturalWidth), W = Math.max(1, Math.round(p.naturalWidth * sc)), H = Math.max(1, Math.round(p.naturalHeight * sc));
          const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(p, 0, 0, W, H);
          const d = x.getImageData(0, 0, W, H).data; let x0 = W, y0 = H, x1 = -1, y1 = -1, lum = 0, n = 0;
          for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) { const k = (y * W + i) * 4, a = d[k + 3]; if (a > 24) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y; if (a > 128) { lum += (.2126 * d[k] + .7152 * d[k + 1] + .0722 * d[k + 2]) / 255; n++; } } }
          if (x1 < 0) return res(null);
          // a logo on a solid box has solid corners; a tightly cropped logo just touches the edges, so check the corners instead
          const cornerA = [[0, 0], [W - 1, 0], [0, H - 1], [W - 1, H - 1]].map(([cx, cy]) => d[(cy * W + cx) * 4 + 3]), opaqueBox = cornerA.every(a => a > 200);
          const pad = 2, cw = x1 - x0 + 1 + pad * 2, ch = y1 - y0 + 1 + pad * 2;
          const o = document.createElement("canvas"); o.width = cw; o.height = ch; o.getContext("2d").drawImage(c, x0 - pad, y0 - pad, cw, ch, 0, 0, cw, ch);
          const L = n ? lum / n : .5;
          // logos on a solid box: a light box is knocked out (dark ink turns white), a dark box blends into the spine
          if (opaqueBox) return res({ url: "", knock: L > .55, screen: L < .35, ar: W / H });
          res({ url: o.toDataURL("image/png"), dark: L < .28, lift: L >= .28 && L < .42, ar: cw / ch });
        } catch { res(null); }
      };
      let viaProxy = false;
      p.onerror = () => { if (viaProxy || src.startsWith("data:")) return res(null); viaProxy = true; p.src = corsProxy(src); };
      p.src = src.startsWith("data:") ? src : src + (src.includes("?") ? "&" : "?") + "sp=trim";
    });
    logoCache.set(src, job);
    job.then(r => { if (r) { logoCache.set(src, r); applyLogo(img, r); } else logoCache.delete(src); });
  };
  window.spHeroErr = img => { img.closest(".np,.mban")?.classList.add("blur"); spCoverErr(img); };
  const chainImg = (list, attrs = "", err = "spCoverErr") => list.length ? `<img src="${esc(list[0])}" data-fb="${esc(list.slice(1).join("|"))}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="${err}(this)" ${attrs}>` : "";
  const imgTag = (g, cls = "cv") => chainImg(coverChain(g), `class="${cls}"`);
  function emblem(g){
    const shapes = [
      `<circle cx="50" cy="50" r="40" fill="none" stroke="#fff" stroke-width="8"/><circle cx="50" cy="50" r="16" fill="#fff"/>`,
      `<path d="M50 6 94 84H6z" fill="none" stroke="#fff" stroke-width="8"/>`,
      `<rect x="14" y="14" width="72" height="72" fill="none" stroke="#fff" stroke-width="8" transform="rotate(45 50 50)"/>`,
      `<path d="M10 50h80M50 10v80" stroke="#fff" stroke-width="14"/>`
    ];
    return `<svg class="emb" viewBox="0 0 100 100" aria-hidden="true">${shapes[hashNum(g.title || "x", 4)]}</svg>`;
  }
  function boxHTML(g, tag = "div", attrs = ""){
    const p = mainPlat(g);
    return `<${tag} class="box" ${attrs} style="--c:${caseColor(g)};--pc:${pcVar(p)}"><div class="band">${esc(shortPlat(p) || "GAME")}</div><div class="art">${emblem(g)}<span class="bt">${esc(g.title)}</span><span class="bd">${esc(g.developer || "")}</span></div>${imgTag(g)}</${tag}>`;
  }
  // ratings go in half stars: 0.5 to 5
  const stars = n => { n = Math.round((n || 0) * 2) / 2; if (!n) return ""; const f = Math.floor(n), h = n % 1 ? 1 : 0; return "★".repeat(f) + (h ? `<i class="hst">★</i>` : "") + `<i class="emp">${"☆".repeat(5 - f - h)}</i>`; };
  const starText = n => n ? `${String(n).replace(".5", "½")}★` : "";
  function starsInput(v, attr){
    v = Number(v) || 0;
    return `<div class="starpick" role="group" aria-label="Rating">${[1,2,3,4,5].map(n => `<span class="sp${v >= n ? " full" : v >= n - .5 ? " half" : ""}"><button type="button" ${attr} data-v="${n - .5}" aria-label="${n - .5} stars"></button><button type="button" ${attr} data-v="${n}" aria-label="${n} star${n > 1 ? "s" : ""}"></button></span>`).join("")}<span class="rv">${v ? String(v).replace(".5", "½") : ""}</span></div>`;
  }
  const mcNum = g => { const n = Number(g.metacritic); return n > 0 && n <= 100 ? Math.round(n) : null; };
  function mcBadge(g){
    const n = mcNum(g); if (!n) return "";
    const col = n >= 75 ? "var(--good)" : n >= 50 ? "var(--star)" : "var(--hot)";
    return `<span class="mc"><b style="--mcc:${col}">${n}</b>${esc(g.criticBy || "Metacritic")}</span>`;
  }
  // dates can be exact ("2026-09-14"), a month ("2026-09"), a year ("2026") or unknown ("")
  const precOf = v => !v ? "none" : v.length === 4 ? "year" : v.length === 7 ? "month" : "day";
  function dateField(d, key, label){
    const v = d[key] || "", pr = precOf(v);
    const input = pr === "day" ? `<input id="f-${key}" type="date" value="${esc(v)}" aria-label="${label} date">`
      : pr === "month" ? `<input id="f-${key}" type="month" value="${esc(v)}" placeholder="YYYY-MM" aria-label="${label} month">`
      : pr === "year" ? `<input id="f-${key}" type="number" inputmode="numeric" min="1970" max="2100" value="${esc(v)}" aria-label="${label} year">`
      : `<span class="dnote">No date</span>`;
    return `<div class="field"><span class="px">${label}</span><div class="datepick"><select id="p-${key}" data-prec="${key}" aria-label="How precise is the ${label.toLowerCase()} date">${[["day","Exact day"],["month","Month"],["year","Year only"],["none","Not sure"]].map(([k, t]) => `<option value="${k}" ${k === pr ? "selected" : ""}>${t}</option>`).join("")}</select>${input}</div></div>`;
  }
  function fmtDate(iso){ if (!iso) return ""; if (/^\d{4}$/.test(iso)) return iso; if (/^\d{4}-\d{2}$/.test(iso)) return `${MONTHS[+iso.slice(5) - 1]} ${iso.slice(0, 4)}`; const d = new Date(iso + "T00:00:00"); return isNaN(d) ? iso : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; }
  function relDay(iso){ if (!iso) return ""; if (iso.length < 10) return fmtDate(iso); const n = Math.round((new Date(todayISO()) - new Date(iso)) / 864e5); return n <= 0 ? "today" : n === 1 ? "yesterday" : n < 14 ? `${n} days ago` : fmtDate(iso); }
  const lastPlayed = g => (g.sessions || []).reduce((m, s) => s.d > m ? s.d : m, "") || g.started || "";
  const newId = () => "g" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  function toast(msg){ document.querySelectorAll(".toast").forEach(t => t.remove()); const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg; document.body.append(t); setTimeout(() => t.remove(), 3200); }
  const findSame = r => games.find(g => (r.steamAppId && g.steamAppId && String(g.steamAppId) === String(r.steamAppId)) || norm(g.title) === norm(r.title));
  const progressOf = g => {
    if (g.status === "finished") return 100;
    if (Number(g.progress) > 0) return Math.min(100, Number(g.progress));
    const L = Number(g.length), H = Number(g.hours) || 0;
    return L > 0 ? Math.min(99, Math.round(H / L * 100)) : 0;
  };
  function playDays(){ const m = new Map(); games.forEach(g => (g.sessions || []).forEach(s => m.set(s.d, (m.get(s.d) || 0) + s.h))); return m; }
  function streak(){
    const days = playDays(); let n = 0; const d = new Date();
    if (!days.has(isoOf(d))) d.setDate(d.getDate() - 1);
    while (days.has(isoOf(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

