  // ================= the nook: shelves you can name, sort and style =================
  // Shelf definitions live in their own store and sync alongside the games. Games are never changed by moving shelves around.
  const LS_NOOK = "save-point-nook", NOOK_VIEWS_OK = ["shelves", "console", "decade", "arch", "az"];
  const SCENES = [["cozy", "Cozy room", "Wooden shelves on a lamp-lit wall"], ["loft", "Sunny loft", "Light oak on a bright, sunlit wall"], ["case", "Display case", "A lit glass cabinet for your collection"], ["cyber", "Cyberspace", "Neon grid and hologram shelves"], ["rack", "Classic rack", "The original arcade rack"]];
  const FINISHES = [["natural", "Natural", ""], ["walnut", "Walnut", "rgba(45,22,8,.5)"], ["ebony", "Ebony", "rgba(10,9,14,.72)"], ["white", "White", "rgba(244,240,232,.7)"], ["sakura", "Sakura", "rgba(255,140,185,.36)"], ["mint", "Mint", "rgba(110,220,185,.34)"], ["ocean", "Ocean", "rgba(70,130,235,.38)"], ["gold", "Gold", "rgba(235,185,60,.36)"]];
  const MATS = [["auto", "Room default"], ["wood", "Wood"], ["metal", "Metal"], ["neon", "Neon"], ["glass", "Glass"]];
  const PLATES = [["auto", "Room default"], ["brass", "Brass plate"], ["pixel", "Pixel sign"], ["neon", "Neon sign"], ["tag", "Paper tag"]];
  const SHELF_SORTS = [["auto", "Shelf default"], ["recent", "Last played"], ["finished", "Date finished"], ["added", "Date added"], ["title", "Name A to Z"], ["rating", "Your rating"], ["hours", "Hours played"], ["platform", "Platform"], ["type", "Game type"], ["year", "Release year"], ["manual", "My own order"]];
  const STATUS_SHELF = { playing: ["Now", "recent", "#F08A4B"], finished: ["Cleared", "finished", "#5BC08A"], backlog: ["Queue", "added", "#7A8CFF"], wishlist: ["Someday", "added", "#F07FB0"], dropped: ["Gathering dust", "recent", "#9AA3B5"] };
  const SHELF_COLORS = ["#E8A33D", "#5BC08A", "#5B8DEF", "#E0605A", "#B07CF0", "#3CC6D8", "#F07FB0", "#C9CED8"];
  const SCENE_MAT = { cozy: "wood", loft: "wood", case: "glass", cyber: "neon", rack: "" }, SCENE_PLATE = { cozy: "brass", loft: "tag", case: "neon", cyber: "neon", rack: "pixel" };
  const hexRgb = h => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ""); if (!m) return ""; const n = parseInt(m[1], 16); return `${n >> 16 & 255},${n >> 8 & 255},${n & 255}`; };
  const baseShelf = (id, o = {}) => ({ id, name: id === "dropped" ? "Abandoned" : STATUS[id] || "Shelf", kind: "status", status: id, sort: "auto", order: [], mat: "auto", plate: "auto", color: "", hidden: id === "wishlist" || id === "dropped", ...o, kind: "status", status: id, ...(id === "dropped" && (!o.name || o.name === "Dropped") ? { name: "Abandoned" } : {}) });
  function loadNook(){
    const n = lsGet(LS_NOOK, null) || {};
    const shelves = (Array.isArray(n.shelves) ? n.shelves : []).filter(x => x && x.id && (x.kind === "custom" || STATUS_SHELF[x.id]));
    Object.keys(STATUS_SHELF).forEach((k, i) => { if (!shelves.some(x => x.id === k)) shelves.splice(k === "wishlist" || k === "dropped" ? shelves.length : Math.min(i, shelves.length), 0, baseShelf(k)); });
    return { v: 1, updatedAt: +n.updatedAt || 0, scene: SCENES.some(x => x[0] === n.scene) ? n.scene : "cozy", ...(Array.isArray(n.top) ? { top: n.top } : {}), view: NOOK_VIEWS_OK.includes(n.view) ? n.view : "shelves", ...(n.pc && typeof n.pc === "object" ? { pc: n.pc } : {}), ...(n.setup && typeof n.setup === "object" ? { setup: n.setup } : {}), logoColor: !!n.logoColor, dropAuto: !!n.dropAuto, ...(Array.isArray(n.together) ? { together: n.together.filter(x => x && typeof x.t === "string").slice(0, 120) } : {}), spines: ["art", "dark", "light", "color"].includes(n.spines) ? n.spines : "art", finish: n.finish || "natural", sortAll: n.sortAll || "each", ...(n.sign && typeof n.sign === "object" ? { sign: n.sign } : {}), ...(n.place && typeof n.place === "object" ? { place: n.place } : {}), ...(Array.isArray(n.wall) ? { wall: n.wall } : {}),
      shelves: shelves.map(x => x.kind === "custom" ? { sort: "manual", order: [], ids: [], rule: null, mat: "auto", plate: "auto", color: "", hidden: false, ...x } : baseShelf(x.id, x)) };
  }
  let nook = loadNook();
  function saveNook(redraw = true){ nook.updatedAt = Date.now(); lsSet(LS_NOOK, nook); if (redraw) renderRack(); try { sync.schedule(); pushShelves(); } catch {} }
  const shelfById = id => nook.shelves.find(s => s.id === id);
  function ruleMatch(r, g){
    if (!r || !(r.plat || r.genre || r.min || r.status)) return false;
    if (r.status ? g.status !== r.status : g.status === "wishlist") return false;
    if (r.plat && ![mainPlat(g), ...(g.platform ? [] : g.platforms || [])].some(p => platFamily(p) === r.plat)) return false;
    if (r.genre && !norm((g.genres || []).join(" ") + " " + (g.series || "")).includes(norm(r.genre))) return false;
    if (r.min && !((+g.rating || 0) >= r.min)) return false;
    return true;
  }
  const SORTERS = {
    recent: (a, b) => lastPlayed(b).localeCompare(lastPlayed(a)),
    finished: (a, b) => (b.finished || "").localeCompare(a.finished || ""),
    added: (a, b) => (b.added || "").localeCompare(a.added || ""),
    title: (a, b) => (a.title || "").localeCompare(b.title || ""),
    rating: (a, b) => (b.rating || 0) - (a.rating || 0) || (a.title || "").localeCompare(b.title || ""),
    hours: (a, b) => (Number(b.hours) || 0) - (Number(a.hours) || 0),
    platform: (a, b) => (shortPlat(mainPlat(a)) || "~").localeCompare(shortPlat(mainPlat(b)) || "~") || (a.title || "").localeCompare(b.title || ""),
    year: (a, b) => (Number(b.year) || 0) - (Number(a.year) || 0),
    type: (a, b) => typeIdx(a) - typeIdx(b) || (a.title || "").localeCompare(b.title || "")
  };
  const typeIdx = g => { const T = topGene(g); return T ? AIDX[T.k] : 99; };
  // sorted by game type: a small tag starts each group on the shelf
  const typeGroups = list => { let last = null; return list.slice(0, 150).map(g => { const T = topGene(g), k = T ? T.k : "none", tag = k !== last ? `<span class="sgrp" role="presentation" style="--gc:${T ? T.c : "#9AA3B5"}" title="${esc(T ? T.genre : "Type not known yet")}"><i>${T ? T.g : "?"}</i><b>${esc(T ? T.tag || T.genre : "Other")}</b></span>` : ""; last = k; return tag + spine(g); }).join(""); };
  const sortKey = sh => sh.sort !== "auto" ? sh.sort : sh.kind === "status" ? STATUS_SHELF[sh.status][1] : "manual";
  function shelfGames(sh){
    if (sh.kind === "virtual") return [...sh.list].sort(SORTERS[sh.sort] || SORTERS.title);
    const ids = new Set(sh.ids || []);
    const list = sh.kind === "status" ? games.filter(g => g.status === sh.status) : games.filter(g => ids.has(g.id) || ruleMatch(sh.rule, g));
    const k = sortKey(sh);
    if (k !== "manual") return list.sort(SORTERS[k] || SORTERS.added);
    const pos = new Map([...(sh.order || []), ...(sh.ids || [])].map((id, i) => [id, i]).reverse());
    return list.sort((a, b) => (pos.has(a.id) ? pos.get(a.id) : -1) - (pos.has(b.id) ? pos.get(b.id) : -1) || SORTERS.added(a, b));
  }
  const shelfColor = (sh, i) => sh.color || (sh.kind === "status" ? STATUS_SHELF[sh.status][2] : SHELF_COLORS[i % SHELF_COLORS.length]);

  // ---------- arrange the whole nook by console, decade, archetype or letter ----------
  const NOOK_VIEWS = [["shelves", "My shelves"], ["console", "Console"], ["decade", "Release decade"], ["arch", "Game type"], ["az", "A to Z"]];
  const SORT_ALL = [["each", "Each shelf its own"], ["title", "Name A to Z"], ["platform", "Console"], ["added", "Date added"], ["finished", "Date finished"], ["recent", "Last played"], ["type", "Game type"], ["year", "Release year"], ["rating", "Your rating"], ["hours", "Hours played"]];
  const FAM_COLOR = { ps: "#3B6FE0", xb: "#3BAA4B", ns: "#E0453B", pc: "#9AA3B5", mo: "#B07CF0", ot: "#C9CED8" }, FAM_ORDER = ["pc", "ps", "xb", "ns", "mo", "ot"];
  const sortAllOf = () => { const ks = new Set(nook.shelves.map(sortKey)); return nook.sortAll && nook.sortAll !== "each" && ks.size === 1 && ks.has(nook.sortAll) ? nook.sortAll : "each"; };
  function virtualShelves(){
    const view = nook.view, sort = sortAllOf() === "each" ? "title" : sortAllOf(), G = new Map();
    const put = (key, name, kicker, color, ord, g) => { if (!G.has(key)) G.set(key, { id: "v:" + key, name, kicker, color, ord, kind: "virtual", sort, list: [], mat: "auto", plate: "auto" }); G.get(key).list.push(g); };
    const letters = [["#–C", /^[^a-z]|^[a-c]/], ["D–G", /^[d-g]/], ["H–L", /^[h-l]/], ["M–P", /^[m-p]/], ["Q–T", /^[q-t]/], ["U–Z", /^[u-z]/]];
    games.filter(g => g.status !== "wishlist").forEach(g => {
      if (view === "console") { const p = mainPlat(g), f = platFamily(p), sp = shortPlat(p); put(sp || "none", p ? (sp === "PC" ? "PC" : p) : "No console set", PLAT_NAMES[f] || "Console", FAM_COLOR[f] || "#C9CED8", `${FAM_ORDER.indexOf(f)}${sp ? (9999 - (parseInt(sp.replace(/\D/g, "")) || 0)) : "~"}${sp}`, g); }
      else if (view === "decade") { const y = Number(g.year); y ? put("d" + Math.floor(y / 10) * 10, `${Math.floor(y / 10) * 10}s`, "Released in the", SHELF_COLORS[Math.floor(y / 10) % SHELF_COLORS.length], String(3000 - y).padStart(4, "0").slice(0, 3), g) : put("dnone", "Unknown year", "Release year", "#9AA3B5", "~", g); }
      else if (view === "arch") { const T = topGene(g); T ? put("a" + T.k, T.genre, "Game type", T.c, String(AIDX[T.k]).padStart(2, "0"), g) : put("anone", "Not sorted yet", "Game type", "#9AA3B5", "~", g); }
      else { const t = norm(g.title).replace(/^the/, ""), L = letters.find(([, re]) => re.test(t)) || letters[0]; put("l" + L[0], L[0], "Letters", SHELF_COLORS[letters.indexOf(L) % SHELF_COLORS.length], String(letters.indexOf(L)), g); }
    });
    return [...G.values()].sort((a, b) => (a.ord > b.ord) - (a.ord < b.ord));
  }

  // ---------- spines ----------
  function splitTitle(t){ const m = String(t || "").match(/^(.{3,}?)(?::|\s[-–—]\s)\s*(.+)$/); return m ? [m[1].trim(), m[2].trim()] : [String(t || ""), ""]; }
  function spine(g){
    const p = mainPlat(g), logos = logoChain(g), covers = coverChain(g);
    const [main, sub] = splitTitle(g.title), L = main.length, fs = L <= 9 ? "fs-xl" : L <= 15 ? "fs-l" : L <= 22 ? "fs-m" : "fs-s";
    if (!logos.length) logoHunt.want(g.id);
    return `<button class="spine${g.logoPick && g.logoPick !== "none" ? " chosen" : ""}" type="button" data-open="${esc(g.id)}" title="${esc(g.title)}${p ? " · " + esc(p) : ""}${g.rating ? " · " + starText(g.rating) : ""}" aria-label="${esc(g.title)}" style="--c:${caseColor(g)};--pc:${pcVar(p)}"><i class="band">${esc(shortPlat(p) || "GAME")}</i>${covers.length ? `<i class="sbg">${chainImg(covers)}</i>` : ""}${logos.length ? `<i class="slogo">${chainImg(logos, `data-gid="${esc(g.id)}" onload="spLogoOk(this, '.spine')"`, "spLogoErr")}</i>` : ""}<span class="stt ${fs}"><b>${esc(main)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</span>${g.status === "playing" ? `<i class="pip"></i>` : g.status === "finished" && g.rating ? `<i class="cr">${"★".repeat(Math.floor(g.rating))}${g.rating % 1 ? "½" : ""}</i>` : ""}</button>`;
  }
  // when every logo source fails, the title shows instead and we look for a logo on Wikipedia in the background
  window.spLogoErr = img => {
    const l = (img.dataset.fb || "").split("|").filter(Boolean);
    if (l.length) { img.src = l.shift(); img.dataset.fb = l.join("|"); return; }
    const id = img.dataset.gid; img.closest(".spine")?.classList.remove("haslogo"); img.closest(".slogo")?.remove();
    if (id) logoHunt.want(id, true);
  };
  const logoHunt = (() => {
    const q = new Set(), tried = new Set(); let busy = false, done = 0;
    const want = (id, broken) => {
      if (tried.has(id)) return; const g = games.find(x => x.id === id);
      if (!g || g.logoPick === "none" || (!broken && logoChain(g).length)) return;
      if (g.logoHunt && Date.now() - new Date(g.logoHunt) < 21 * 864e5) return;
      q.add(id); setTimeout(kick, 2500);
    };
    async function kick(){
      if (busy || !q.size || !navigator.onLine || done >= 40 || document.hidden) return; busy = true;
      try {
        while (q.size && done < 40) {
          const id = q.values().next().value; q.delete(id); tried.add(id); done++;
          const g = games.find(x => x.id === id); if (!g) continue;
          const old = new Set(logoChain(g)); let r = null;
          try { r = await findArt(g); } catch {}
          const cur = games.find(x => x.id === id); if (!cur) continue;
          // only keep a logo that actually loads
          const loads = u => new Promise(res => { const i = new Image(); const t = setTimeout(() => res(false), 7000); i.onload = () => { clearTimeout(t); res(i.naturalWidth > 20); }; i.onerror = () => { clearTimeout(t); res(false); }; i.referrerPolicy = "no-referrer"; i.src = u; });
          let best = null; for (const l of (r?.logos || []).filter(l => !old.has(l.url)).slice(0, 6)) { if (await loads(l.url)) { best = l; break; } }
          const out = { ...cur, logoHunt: todayISO(), updatedAt: Date.now() };
          if (best) out.logoUrl = best.url;
          if (r?.found?.steamAppId && !cur.steamAppId) out.steamAppId = r.found.steamAppId;
          if (r?.found?.wikidata && !cur.wikidata) out.wikidata = r.found.wikidata;
          games[games.findIndex(x => x.id === id)] = out; saveLocal(); try { sync.schedule(); } catch {}
          if (best || out.steamAppId !== cur.steamAppId) renderRack();
          await new Promise(res => setTimeout(res, 1800));
        }
      } finally { busy = false; }
    }
    return { want };
  })();

  // ---------- trinkets: original drawings, no real brands ----------
  // [id, name, group, width, height, svg body]
  const TRINKETS = [
    ["tower", "Tower console", "console", 40, 92, `<path d="M8 4h24l4 6v76a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10z" fill="#2B2F3A"/><path d="M8 4h24l4 6H4z" fill="#3B4150"/><rect x="17" y="12" width="6" height="70" rx="3" fill="#121419"/><rect x="18.5" y="14" width="3" height="66" rx="1.5" fill="#3CC6D8"/><circle cx="12" cy="80" r="2" fill="#3CC6D8"/><rect x="2" y="86" width="36" height="5" rx="2" fill="#16181F"/>`],
    ["box", "Box console", "console", 72, 58, `<rect x="2" y="8" width="68" height="46" rx="6" fill="#262A34"/><rect x="2" y="8" width="68" height="10" rx="5" fill="#323845"/>${[0,1,2,3,4,5,6].map(i => `<circle cx="${14 + i * 7}" cy="13" r="1.6" fill="#11131A"/>`).join("")}<circle cx="60" cy="38" r="5" fill="#11131A"/><circle cx="60" cy="38" r="2.6" fill="#F08A4B"/><rect x="10" y="34" width="30" height="4" rx="2" fill="#11131A"/><rect x="6" y="52" width="60" height="4" rx="2" fill="#15171E"/>`],
    ["cartcon", "Cartridge console", "console", 90, 52, `<rect x="16" y="2" width="34" height="22" rx="2" fill="#C8463F"/><rect x="21" y="6" width="24" height="11" rx="1" fill="#F6E7C8"/><path d="M4 22h82v22a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6z" fill="#B9B4AC"/><rect x="4" y="22" width="82" height="6" fill="#D4D0C8"/><rect x="12" y="24" width="42" height="3" rx="1.5" fill="#57534C"/><rect x="62" y="33" width="9" height="5" rx="1" fill="#E0605A"/><rect x="74" y="33" width="7" height="5" rx="1" fill="#57534C"/><rect x="12" y="38" width="6" height="6" rx="1" fill="#57534C"/><rect x="22" y="38" width="6" height="6" rx="1" fill="#57534C"/>`],
    ["hybrid", "Hybrid handheld", "console", 100, 62, `<path d="M18 32h64l6 28H12z" fill="#22252E"/><rect x="40" y="46" width="20" height="3" rx="1.5" fill="#3CC6D8"/><rect x="4" y="4" width="18" height="40" rx="9" fill="#9B6CF2"/><rect x="78" y="4" width="18" height="40" rx="9" fill="#9BE15D"/><rect x="20" y="4" width="60" height="40" fill="#1B1D24"/><rect x="24" y="8" width="52" height="32" rx="2" fill="#2E5E8E"/><path d="M24 30l12-10 9 7 10-9 21 14v8H24z" fill="#5BC08A" opacity=".75"/><circle cx="13" cy="15" r="3" fill="#2B1F45"/><circle cx="87" cy="30" r="3" fill="#2E4A1A"/><circle cx="87" cy="14" r="1.8" fill="#2E4A1A"/><circle cx="91" cy="18" r="1.8" fill="#2E4A1A"/>`],
    ["handheld", "Classic handheld", "console", 42, 66, `<path d="M3 4a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v52c0 5-4 9-12 9H6a3 3 0 0 1-3-3z" fill="#C9C6BE"/><rect x="7" y="6" width="28" height="24" rx="2" fill="#4A4F5C"/><rect x="11" y="9" width="20" height="17" fill="#9DBB5A"/><path d="M14 22h3v-3h3v3h3v3h-9z" fill="#4E6B2A"/><path d="M11 39h4v-4h4v4h4v4h-4v4h-4v-4h-4z" fill="#3A3D45" transform="translate(-2 0)"/><circle cx="30" cy="44" r="3.4" fill="#B0306E"/><circle cx="36" cy="38" r="3.4" fill="#B0306E"/><rect x="16" y="55" width="6" height="2" rx="1" fill="#8B877F" transform="rotate(-25 19 56)"/><rect x="23" y="55" width="6" height="2" rx="1" fill="#8B877F" transform="rotate(-25 26 56)"/>`],
    ["arcade", "Mini arcade cabinet", "console", 50, 96, `<path d="M6 2h38v18l-6 4v28l8 6v36H4V58l8-6V24l-6-4z" fill="#5B3CC4"/><rect x="8" y="5" width="34" height="11" rx="2" fill="#F2BE45"/><rect x="12" y="8" width="26" height="5" rx="1" fill="#C0392B"/><rect x="13" y="25" width="24" height="24" rx="2" fill="#0F1630"/><path d="M17 42l5-7 4 4 5-8 4 11z" fill="#3CC6D8"/><path d="M10 54h30l4 6H6z" fill="#3E2890"/><circle cx="17" cy="56" r="2.4" fill="#E0605A"/><rect x="16.2" y="53" width="1.6" height="4" fill="#222"/><circle cx="27" cy="57" r="1.8" fill="#F2BE45"/><circle cx="33" cy="57" r="1.8" fill="#3CC6D8"/><rect x="8" y="66" width="34" height="3" fill="#3E2890"/><rect x="12" y="76" width="26" height="12" rx="1" fill="#3E2890"/>`],
    ["pad", "Controller", "console", 72, 36, `<path d="M15 6h42c9 0 13 7 13 15s-3 13-9 13c-6 0-8-6-14-6H25c-6 0-8 6-14 6-6 0-9-5-9-13S6 6 15 6z" fill="#E7E3EA"/><path d="M15 13h4v4h4v4h-4v4h-4v-4h-4v-4h4z" fill="#3A3540"/><circle cx="51" cy="15" r="3.2" fill="#E0605A"/><circle cx="58" cy="21" r="3.2" fill="#5B8DEF"/><rect x="31" y="17" width="5" height="2.5" rx="1.2" fill="#9A93A3"/><rect x="38" y="17" width="5" height="2.5" rx="1.2" fill="#9A93A3"/>`],
    ["stick", "Arcade stick", "console", 78, 50, `<path d="M4 30h70l-4 18H8z" fill="#1F2230"/><rect x="4" y="26" width="70" height="8" rx="3" fill="#2E3245"/><rect x="18" y="12" width="3" height="18" fill="#9AA3B5"/><circle cx="19.5" cy="11" r="7" fill="#E0605A"/><circle cx="17" cy="9" r="2" fill="#fff" opacity=".5"/>${[[40, 26, "#F2BE45"], [50, 24, "#5BC08A"], [60, 26, "#5B8DEF"], [42, 31, "#B07CF0"], [52, 29, "#F07FB0"], [62, 31, "#3CC6D8"]].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2.4" fill="${c}"/>`).join("")}`],
    ["crt", "Retro TV", "console", 92, 74, `<rect x="4" y="6" width="84" height="60" rx="10" fill="#3A3540"/><rect x="12" y="13" width="56" height="44" rx="7" fill="#0E1A2C"/><rect x="12" y="13" width="56" height="44" rx="7" fill="#3CC6D8" opacity=".14"/><path d="M33 30h4v-4h6v4h4v-4h6v4h4v8h-4v4h-4v4h-4v4h-6v-4h-4v-4h-4v-4h-4v-8h4z" fill="#F07FB0" transform="translate(-3 -4)"/>${[16, 20, 24, 28, 32, 36, 40, 44, 48, 52].map(y => `<rect x="12" y="${y}" width="56" height="1" fill="#000" opacity=".18"/>`).join("")}<path d="M15 16h22l-6 10H15z" fill="#fff" opacity=".12"/><circle cx="78" cy="22" r="4" fill="#6A6372"/><circle cx="78" cy="34" r="4" fill="#6A6372"/><rect x="73" y="46" width="10" height="3" rx="1.5" fill="#6A6372"/><rect x="26" y="66" width="40" height="6" rx="2" fill="#2A2630"/>`],
    ["pc", "Gaming PC", "console", 52, 90, `<rect x="4" y="2" width="44" height="84" rx="4" fill="#1A1C24"/><rect x="8" y="6" width="36" height="76" rx="2" fill="#0C0D12"/><rect x="8" y="6" width="36" height="76" rx="2" fill="#B07CF0" opacity=".12"/>${[22, 46, 70].map((y, i) => `<circle cx="26" cy="${y}" r="9" fill="none" stroke="${["#F07FB0", "#B07CF0", "#3CC6D8"][i]}" stroke-width="2.5"/><circle cx="26" cy="${y}" r="2.4" fill="#2A2D38"/>`).join("")}<rect x="6" y="86" width="8" height="3" fill="#111"/><rect x="38" y="86" width="8" height="3" fill="#111"/>`],
    ["vr", "VR headset", "console", 70, 40, `<path d="M6 12c0-5 4-8 9-8h40c5 0 9 3 9 8v14c0 5-4 8-9 8H42l-4-6h-6l-4 6H15c-5 0-9-3-9-8z" fill="#ECEBF2"/><path d="M10 14c0-3 2-5 5-5h40c3 0 5 2 5 5v10c0 3-2 5-5 5H15c-3 0-5-2-5-5z" fill="#20232E"/><path d="M14 13h18" stroke="#3CC6D8" stroke-width="2" stroke-linecap="round" opacity=".7"/><rect x="0" y="16" width="6" height="8" rx="2" fill="#9AA3B5"/><rect x="64" y="16" width="6" height="8" rx="2" fill="#9AA3B5"/>`],
    ["headset", "Headset", "console", 54, 52, `<path d="M8 32V26a19 19 0 0 1 38 0v6" fill="none" stroke="#2E3245" stroke-width="5"/><rect x="2" y="28" width="14" height="22" rx="6" fill="#E0605A"/><rect x="38" y="28" width="14" height="22" rx="6" fill="#E0605A"/><rect x="5" y="32" width="8" height="14" rx="4" fill="#9E3A34"/><rect x="41" y="32" width="8" height="14" rx="4" fill="#9E3A34"/>`],
    ["trophy", "Trophy", "collect", 44, 60, `<path d="M10 4h24v14a12 12 0 0 1-24 0z" fill="#F2BE45"/><path d="M10 8H3v4a8 8 0 0 0 8 8M34 8h7v4a8 8 0 0 1-8 8" fill="none" stroke="#F2BE45" stroke-width="3"/><rect x="19" y="29" width="6" height="12" fill="#D99A12"/><rect x="9" y="41" width="26" height="6" rx="1" fill="#F2BE45"/><rect x="6" y="47" width="32" height="11" rx="2" fill="#4A3426"/><rect x="13" y="50" width="18" height="5" rx="1" fill="#E8C27A"/><rect x="15" y="7" width="3" height="12" rx="1.5" fill="#fff" opacity=".55"/>`],
    ["carts", "Cartridge stack", "collect", 56, 44, `<rect x="4" y="30" width="48" height="13" rx="2" fill="#5B8DEF"/><rect x="10" y="33" width="30" height="7" rx="1" fill="#DCE6FF"/><rect x="2" y="17" width="48" height="13" rx="2" fill="#E0605A"/><rect x="8" y="20" width="30" height="7" rx="1" fill="#FFE1DE"/><rect x="6" y="4" width="48" height="13" rx="2" fill="#5BC08A"/><rect x="12" y="7" width="30" height="7" rx="1" fill="#E0FFEC"/>`],
    ["cases", "Game case stack", "collect", 60, 40, `${[["#2B5FB8", 0], ["#1F7A4F", 9], ["#B8322B", 18], ["#2B2F3A", 27]].map(([c, y], i) => `<rect x="${4 + (i % 2) * 4}" y="${4 + y}" width="50" height="8" rx="1.5" fill="${c}"/><rect x="${6 + (i % 2) * 4}" y="${5.5 + y}" width="8" height="5" fill="#fff" opacity=".85"/>`).join("")}`],
    ["knight", "Knight figure", "collect", 36, 72, `<ellipse cx="18" cy="68" rx="15" ry="3.5" fill="#2A2D38"/><rect x="5" y="62" width="26" height="7" rx="2" fill="#3A3F4E"/><rect x="11" y="40" width="5" height="22" rx="2" fill="#7F8798"/><rect x="20" y="40" width="5" height="22" rx="2" fill="#7F8798"/><path d="M8 22h20l2 20H6z" fill="#A9B1C2"/><path d="M8 22h20l-10 10z" fill="#C04A43"/><circle cx="18" cy="14" r="9" fill="#A9B1C2"/><rect x="12" y="12" width="12" height="3" rx="1" fill="#2A2D38"/><path d="M18 2c3 2 4 4 3 7h-6c-1-3 0-5 3-7z" fill="#C04A43"/><rect x="29" y="12" width="3" height="34" fill="#DDE3EE"/><rect x="26" y="40" width="9" height="3" fill="#8A6420"/>`],
    ["slime", "Slime plush", "collect", 52, 40, `<path d="M4 36c0-16 9-30 22-30s22 14 22 30z" fill="#5BC08A"/><path d="M10 30c0-10 6-18 14-20" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/><ellipse cx="19" cy="24" rx="3" ry="4" fill="#123"/><ellipse cx="33" cy="24" rx="3" ry="4" fill="#123"/><path d="M22 30q4 3 8 0" fill="none" stroke="#123" stroke-width="2" stroke-linecap="round"/><ellipse cx="26" cy="37" rx="22" ry="3" fill="#3E9C6C"/>`],
    ["potion", "Health potion", "collect", 32, 52, `<rect x="12" y="2" width="8" height="6" rx="1" fill="#A07040"/><rect x="11" y="7" width="10" height="9" fill="#CFE3F2" opacity=".8"/><path d="M11 15c-7 4-9 10-9 18a14 14 0 0 0 28 0c0-8-2-14-9-18z" fill="#CFE3F2" opacity=".5"/><path d="M4 32a12 12 0 0 0 24 0c0-3-1-5-2-7H6c-1 2-2 4-2 7z" fill="#E0405A"/><circle cx="11" cy="31" r="2.5" fill="#fff" opacity=".6"/>`],
    ["mana", "Mana potion", "collect", 32, 52, `<rect x="12" y="2" width="8" height="6" rx="1" fill="#A07040"/><rect x="11" y="7" width="10" height="9" fill="#CFE3F2" opacity=".8"/><path d="M11 15c-7 4-9 10-9 18a14 14 0 0 0 28 0c0-8-2-14-9-18z" fill="#CFE3F2" opacity=".5"/><path d="M4 32a12 12 0 0 0 24 0c0-3-1-5-2-7H6c-1 2-2 4-2 7z" fill="#4A7BF0"/><circle cx="11" cy="31" r="2.5" fill="#fff" opacity=".6"/>`],
    ["d20", "D20 die", "collect", 36, 36, `<path d="M18 2 33 10v16L18 34 3 26V10z" fill="#9B6CF2"/><path d="M18 2 33 10 18 14 3 10z" fill="#B796F7"/><path d="M3 10l15 4v20L3 26z" fill="#7A4FD6"/><path d="M18 14l15-4v16L18 34z" fill="#8A5CE6"/><text x="18" y="27" text-anchor="middle" font-size="9" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">20</text>`],
    ["coins", "Coin stack", "collect", 44, 36, `${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${16 + (i % 2)}" cy="${30 - i * 5}" rx="12" ry="4" fill="#D99A12"/><ellipse cx="${16 + (i % 2)}" cy="${28 - i * 5}" rx="12" ry="4" fill="#F2BE45"/>`).join("")}<ellipse cx="34" cy="30" rx="8" ry="3" fill="#D99A12"/><ellipse cx="34" cy="28" rx="8" ry="3" fill="#F2BE45"/>`],
    ["heart", "Pixel heart", "collect", 36, 32, `<path d="M4 4h10v4h8V4h10v4h4v12h-4v4h-4v4h-4v4h-4v-4h-4v-4H8v-4H4V8H0V4h4z" fill="#E0405A" transform="translate(0 -2)"/><rect x="6" y="6" width="4" height="4" fill="#fff" opacity=".7"/>`],
    ["sword", "Sword on stand", "collect", 34, 92, `<rect x="3" y="80" width="28" height="10" rx="2" fill="#4A3426"/><rect x="8" y="74" width="18" height="7" rx="1" fill="#6B4A32"/><path d="M14 74V18l3-12 3 12v56z" fill="#DDE3EE"/><path d="M17 6v68" stroke="#AEB6C6" stroke-width="1"/><rect x="5" y="16" width="24" height="4" rx="2" fill="#8A6420"/><rect x="15" y="4" width="4" height="12" fill="#3CC6D8" opacity="0"/><circle cx="17" cy="18" r="2.5" fill="#3CC6D8"/>`],
    ["mushroom", "Glow mushroom", "cozy", 40, 44, `<rect x="15" y="22" width="10" height="20" rx="4" fill="#F3ECDC"/><path d="M2 24C2 12 10 4 20 4s18 8 18 20z" fill="#3CC6D8"/><circle cx="12" cy="15" r="3" fill="#D8FBFF"/><circle cx="24" cy="10" r="2.5" fill="#D8FBFF"/><circle cx="30" cy="18" r="2.2" fill="#D8FBFF"/>`],
    ["lamp", "Desk lamp", "cozy", 70, 86, `<defs><linearGradient id="tkCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE7A8" stop-opacity=".55"/><stop offset="1" stop-color="#FFE7A8" stop-opacity="0"/></linearGradient></defs><path d="M46 40 L70 86 H24z" fill="url(#tkCone)"/><ellipse cx="22" cy="83" rx="18" ry="3.5" fill="#2A1C12"/><rect x="8" y="76" width="28" height="7" rx="3" fill="#3B3F4A"/><path d="M22 77 30 44 52 30" fill="none" stroke="#4A505E" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="44" r="4" fill="#5A6172"/><path d="M42 14 66 30 56 46 36 30z" fill="#E8A33D"/><ellipse cx="46" cy="40" rx="6" ry="4" fill="#FFF3C4" transform="rotate(35 46 40)"/>`],
    ["plant", "House plant", "cozy", 60, 82, `<path d="M30 50C26 34 12 30 6 34c8 2 16 8 22 18M30 50c2-18 14-28 24-26-8 4-16 12-20 28M30 52C28 30 30 14 36 6c0 12-2 30-4 46M30 52C22 40 18 22 22 12c4 12 6 26 8 40" fill="#5BC08A"/><path d="M30 50C26 34 12 30 6 34c8 2 16 8 22 18" fill="#3E9C6C"/><path d="M14 52h32l-4 28H18z" fill="#C46A3E"/><rect x="12" y="49" width="36" height="7" rx="2" fill="#D9824F"/>`],
    ["cactus", "Tiny cactus", "cozy", 34, 56, `<path d="M13 40V12a4 4 0 0 1 8 0v28z" fill="#4FAF7A"/><path d="M13 28H8a3 3 0 0 1-3-3v-7a2.5 2.5 0 0 1 5 0v5h3zM21 22h4v-5a2.5 2.5 0 0 1 5 0v6a3 3 0 0 1-3 3h-6z" fill="#4FAF7A"/><circle cx="17" cy="9" r="2.5" fill="#F07FB0"/><path d="M6 38h22l-3 16H9z" fill="#E8A33D"/><rect x="4" y="36" width="26" height="5" rx="2" fill="#F2BE45"/>`],
    ["lava", "Lava lamp", "cozy", 28, 74, `<path d="M8 8h12l6 48H2z" fill="#5A2A6E" opacity=".55"/><ellipse cx="14" cy="22" rx="4" ry="6" fill="#F08A4B"/><ellipse cx="11" cy="40" rx="5" ry="7" fill="#F07FB0"/><ellipse cx="18" cy="50" rx="4" ry="3" fill="#F08A4B"/><path d="M8 2h12l1 6H7z" fill="#9AA3B5"/><path d="M2 56h24l-4 16H6z" fill="#9AA3B5"/>`],
    ["cube", "Light cube", "cozy", 40, 42, `<path d="M20 2 38 11v20L20 40 2 31V11z" fill="#B07CF0" opacity=".85"/><path d="M20 2 38 11 20 20 2 11z" fill="#E3CCFF"/><path d="M20 20v20L2 31V11z" fill="#8A5CE6"/><path d="M20 20 38 11v20L20 40z" fill="#A06CF0"/>`],
    ["books", "Strategy guides", "cozy", 52, 60, `${[["#C04A43", 4, 54], ["#2B5FB8", 12, 48], ["#E8A33D", 20, 56], ["#1F7A4F", 28, 50]].map(([c, x, h]) => `<rect x="${x}" y="${58 - h}" width="8" height="${h}" rx="1" fill="${c}"/><rect x="${x + 1.5}" y="${62 - h}" width="5" height="2" fill="#fff" opacity=".7"/>`).join("")}<rect x="36" y="20" width="8" height="40" rx="1" fill="#7A4FD6" transform="rotate(14 40 58)"/>`],
    ["crystal", "Heart container", "collect", 40, 64, `<ellipse cx="20" cy="61" rx="15" ry="3.5" fill="#2A2D38"/><rect x="6" y="48" width="28" height="11" rx="2" fill="#4A4060"/><rect x="6" y="48" width="28" height="3" rx="1.5" fill="#6A5E86"/><g transform="translate(3 6)" shape-rendering="crispEdges"><path d="M4 0h8v2h2v2h2V2h2V0h8v2h2v2h2v10h-2v2h-2v2h-2v2h-2v2h-2v2h-2v2h-2v-2h-2v-2H8v-2H6v-2H4v-2H2v-2H0V4h2V2h2z" fill="#3B3456"/><path d="M4 0h8v2h2v2h2v24h-2v-2h-2v-2H8v-2H6v-2H4v-2H2v-2H0V4h2V2h2z" fill="#FF5C8A"/><path d="M4 4h4v2H6v2H4z" fill="#fff" opacity=".75"/></g><rect x="9" y="52" width="22" height="3" rx="1" fill="#3B3456"/><rect x="9" y="52" width="14" height="3" rx="1" fill="#3BFF8A"/>`],

    ["cat", "Sleepy cat", "cozy", 64, 40, `<ellipse cx="32" cy="34" rx="28" ry="6" fill="#000" opacity=".25"/><path d="M8 34c0-14 10-22 24-22s26 6 26 18c0 4-3 6-8 6H12c-3 0-4-1-4-2z" fill="#E8A35A"/><path d="M14 18 12 6l9 7M30 13l3-10 5 11" fill="#E8A35A"/><path d="M14 18 13 9l6 5" fill="#F7C9A1"/><path d="M16 24q3 2 6 0M26 24q3 2 6 0" stroke="#5A3A1A" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M38 20q6 4 14 2M40 26q6 3 14 4" stroke="#C47E3A" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M56 30c6 0 7-8 2-10" stroke="#E8A35A" stroke-width="5" fill="none" stroke-linecap="round"/>`],
    ["candle", "Candle", "cozy", 26, 56, `<ellipse cx="13" cy="10" rx="4" ry="8" fill="#FFD86B" opacity=".35"/><path d="M13 3c3 4 3 8 0 10-3-2-3-6 0-10z" fill="#FFB347"/><path d="M13 7c1.5 2 1.5 4 0 5-1.5-1-1.5-3 0-5z" fill="#FFF3C4"/><rect x="12.4" y="12" width="1.2" height="4" fill="#333"/><rect x="5" y="16" width="16" height="34" rx="3" fill="#F3ECDC"/><path d="M5 20c3 3 5-2 8 1s5-1 8 0" fill="none" stroke="#E3D9C2" stroke-width="2"/><rect x="2" y="48" width="22" height="6" rx="2" fill="#B9A27A"/>`],
    ["speaker", "Speaker", "console", 40, 66, `<rect x="4" y="2" width="32" height="62" rx="5" fill="#23262F"/><circle cx="20" cy="18" r="8" fill="#14161C"/><circle cx="20" cy="18" r="4" fill="#3A3F4C"/><circle cx="20" cy="44" r="13" fill="#14161C"/><circle cx="20" cy="44" r="7" fill="#3A3F4C"/><circle cx="20" cy="44" r="2.5" fill="#5BC08A"/>`],
    ["globe", "Snow globe", "collect", 46, 56, `<rect x="8" y="42" width="30" height="12" rx="3" fill="#6B4A32"/><rect x="11" y="45" width="24" height="3" rx="1" fill="#E8C27A"/><circle cx="23" cy="24" r="20" fill="#BFE6FF" opacity=".45"/><path d="M8 34h30c-2 6-8 9-15 9S10 40 8 34z" fill="#F3F7FF"/><path d="M18 34 23 20l5 14z" fill="#3E9C6C"/><path d="M20 28 23 22l3 6z" fill="#5BC08A"/>${[[14, 14], [30, 12], [26, 26], [16, 24], [33, 22], [22, 10]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#fff"/>`).join("")}<path d="M10 16a14 14 0 0 1 8-8" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/>`],
    // wall decor
    ["lights", "String lights", "wall", 0, 0, ""],
    ["neon", "Neon GG sign", "wall", 120, 54, `<rect x="2" y="2" width="116" height="50" rx="12" fill="none" stroke="#F07FB0" stroke-width="3"/><text x="60" y="38" text-anchor="middle" font-size="30" font-weight="900" fill="none" stroke="#FFE4F1" stroke-width="2.4" font-family="system-ui,sans-serif" letter-spacing="4">GG</text>`],
    ["neonheart", "Neon heart", "wall", 64, 56, `<path d="M32 50C10 36 4 26 4 17A12 12 0 0 1 32 11a12 12 0 0 1 28 6c0 9-6 19-28 33z" fill="none" stroke="#FF5C8A" stroke-width="3.5" stroke-linejoin="round"/>`],
    ["player1", "Player 1 pennant", "wall", 116, 48, `<path d="M4 4h108L60 44z" fill="#5B8DEF"/><path d="M4 4h108" stroke="#2A3F78" stroke-width="3"/><text x="58" y="20" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" font-family="system-ui,sans-serif" letter-spacing="1.5">PLAYER 1</text>`],
    ["poster", "Pixel poster", "wall", 70, 92, `<rect x="2" y="2" width="66" height="88" rx="2" fill="#F3ECDC"/><rect x="7" y="7" width="56" height="70" fill="#22305A"/><circle cx="46" cy="22" r="6" fill="#F2BE45"/><path d="M7 60l14-18 10 10 12-16 20 24v17H7z" fill="#5BC08A"/><path d="M7 66l10-8 10 6 14-10 22 12v11H7z" fill="#3E9C6C"/><rect x="15" y="80" width="40" height="4" rx="1" fill="#22305A" opacity=".6"/>`],
    ["map", "World map", "wall", 96, 70, `<rect x="2" y="2" width="92" height="66" rx="2" fill="#E9D9B4"/><rect x="2" y="2" width="92" height="66" rx="2" fill="none" stroke="#8A6420" stroke-width="3"/><path d="M12 20c6-6 14-4 18 2s-2 12 4 16-6 12-14 8-12-18-8-26zM50 14c8-2 16 2 20 8s-4 10 2 16 4 14-8 14-14-10-16-18 2-18 2-20z" fill="#B9C98A"/><path d="M30 46l10-4 12 6 10-6" fill="none" stroke="#C04A43" stroke-width="2" stroke-dasharray="3 3"/><path d="M62 42l4 4m0-4-4 4" stroke="#C04A43" stroke-width="2.4"/>`],
    ["clock", "Wall clock", "wall", 54, 54, `<circle cx="27" cy="27" r="24" fill="#F3ECDC" stroke="#3A3540" stroke-width="4"/>${[0, 1, 2, 3].map(i => `<rect x="25.5" y="6" width="3" height="5" fill="#3A3540" transform="rotate(${i * 90} 27 27)"/>`).join("")}<path d="M27 27V13M27 27l9 5" stroke="#3A3540" stroke-width="3" stroke-linecap="round"/><circle cx="27" cy="27" r="2.5" fill="#E0605A"/>`],
    ["window", "Night window", "wall", 92, 80, `<rect x="2" y="2" width="88" height="76" rx="3" fill="#6B4A32"/><rect x="8" y="8" width="76" height="64" fill="#162047"/><circle cx="64" cy="24" r="8" fill="#F6E7B0"/><circle cx="68" cy="21" r="7" fill="#162047"/>${[[18, 18], [30, 30], [44, 14], [22, 44], [52, 40], [76, 50]].map(([x, y]) => `<rect x="${x}" y="${y}" width="2" height="2" fill="#fff"/>`).join("")}<path d="M8 60l14-10 12 6 16-12 14 8 20-10v30H8z" fill="#0D1430"/><rect x="44.5" y="8" width="3" height="64" fill="#6B4A32"/><rect x="8" y="38.5" width="76" height="3" fill="#6B4A32"/>`],
    ["controllerwall", "Controller rack", "wall", 100, 54, `<rect x="2" y="40" width="96" height="6" rx="2" fill="#6B4A32"/>${[[6, "#E7E3EA"], [52, "#2B2F3A"]].map(([x, c]) => `<g transform="translate(${x} 10)"><path d="M10 4h22c6 0 9 5 9 10s-2 9-6 9c-4 0-5-4-9-4h-10c-4 0-5 4-9 4-4 0-6-3-6-9s3-10 9-10z" fill="${c}"/><circle cx="31" cy="11" r="2" fill="#E0605A"/><path d="M9 9h3v3h3v3h-3v3H9v-3H6v-3h3z" fill="${c === "#2B2F3A" ? "#9AA3B5" : "#3A3540"}"/></g>`).join("")}`]
  ];
  const TRINKET = new Map(TRINKETS.map(t => [t[0], t]));
  const TK_GROUPS = [["console", "Consoles and gear"], ["collect", "Collectibles"], ["cozy", "Plants and lights"], ["wall", "On the wall"]];
  const DECO_DEFAULT = { top: ["lamp", "carts", "crt", "pad", "trophy", "plant"], wall: ["lights", "neon", "poster", "clock"], playing: ["hybrid"], finished: ["knight"], backlog: ["potion", "mana"] };
  const DECO_MAX = { top: 9, wall: 5, shelf: 3 };
  function trinket(id){
    const t = TRINKET.get(id); if (!t) return "";
    if (id === "lights") return `<span class="tk tk-lights" title="${t[1]}"></span>`;
    const flat = /^(neon|neonheart)$/.test(id); // neon glows, so it keeps its flat look
    return `<span class="tk tk-${id}" title="${t[1]}"><svg viewBox="0 0 ${t[3]} ${t[4]}" width="${t[3]}" height="${t[4]}" aria-hidden="true">${flat ? t[5] : `<g filter="url(#tkShade)">${t[5]}</g>`}</svg></span>`;
  }
  const decoOf = sh => Array.isArray(sh.deco) ? sh.deco : (DECO_DEFAULT[sh.id] || []);
  const topDeco = () => Array.isArray(nook.top) ? nook.top : DECO_DEFAULT.top;
  const wallDeco = () => Array.isArray(nook.wall) ? nook.wall : DECO_DEFAULT.wall;
  function openDecor(target){
    let tgt = target || "top";
    const vis = () => nook.shelves.filter(s => !s.hidden);
    const listOf = () => tgt === "top" ? topDeco() : tgt === "wall" ? wallDeco() : decoOf(shelfById(tgt) || {});
    const setList = l => { if (tgt === "top") nook.top = l; else if (tgt === "wall") nook.wall = l; else { const s = shelfById(tgt); if (s) s.deco = l; } saveNook(); };
    const max = () => tgt === "top" ? DECO_MAX.top : tgt === "wall" ? DECO_MAX.wall : DECO_MAX.shelf;
    const signPane = () => { const S = signOf();
      return `<div class="signprev scn-${nook.scene}" id="dc-prev">${signHTML(S) || `<span class="note" style="color:#C9CFE0">No sign</span>`}</div>
      <div class="field"><span class="px">Style</span><div class="seg">${SIGN_STYLES.map(([k, n]) => `<button type="button" data-sgs="${k}" aria-pressed="${S.style === k}">${n}</button>`).join("")}</div></div>
      <label class="field"><span class="px">What your sign says</span><input id="dc-sign" maxlength="40" value="${esc(nook.sign?.text || "")}" placeholder="Your name or anything you like, e.g. Bojanov kutak"></label>
      <div class="field"><span class="px">Colour</span><div class="swatches"><button type="button" class="sw auto" data-sgc="" aria-pressed="${!S.color}" aria-label="Style default">A</button>${SIGN_COLORS.map(c => `<button type="button" class="sw" data-sgc="${c}" aria-pressed="${S.color === c}" style="--sw:${c}" aria-label="Colour ${c}"></button>`).join("")}</div></div>
      <p class="note">The sign is optional and starts off. Pick a style and it becomes the title above your shelves.</p>`; };
    const html = () => { if (tgt === "sign") return `<div class="modal wide decomod" role="dialog" aria-modal="true" aria-labelledby="dc-t"><div class="reshead"><div><span class="px">Your gamer's nook</span><h2 id="dc-t">Decorate</h2></div><button class="btn small" type="button" data-mclose>Done</button></div>
      <div class="decotabs" role="group" aria-label="Where to decorate"><button type="button" data-dctgt="sign" aria-pressed="true">Sign</button><button type="button" data-dctgt="top" aria-pressed="false">Top shelf</button><button type="button" data-dctgt="wall" aria-pressed="false">Wall</button>${vis().map(s => `<button type="button" data-dctgt="${esc(s.id)}" aria-pressed="false">${esc(s.name)}</button>`).join("")}</div>
      ${signPane()}<div class="mfoot"><div class="r"><button class="btn primary" type="button" data-mclose>Done</button></div></div></div>`;
      const cur = listOf();
      return `<div class="modal wide decomod" role="dialog" aria-modal="true" aria-labelledby="dc-t"><div class="reshead"><div><span class="px">Your gamer's nook</span><h2 id="dc-t">Decorate</h2></div><button class="btn small" type="button" data-mclose>Done</button></div>
      <div class="decotabs" role="group" aria-label="Where to decorate"><button type="button" data-dctgt="sign" aria-pressed="${tgt === "sign"}">Sign</button><button type="button" data-dctgt="top" aria-pressed="${tgt === "top"}">Top shelf</button><button type="button" data-dctgt="wall" aria-pressed="${tgt === "wall"}">Wall</button>${vis().map(s => `<button type="button" data-dctgt="${esc(s.id)}" aria-pressed="${tgt === s.id}">${esc(s.name)}</button>`).join("")}</div>
      <p class="note">${tgt === "top" ? "Things that stand on the shelf above your games." : tgt === "wall" ? "Things that hang on the wall behind the shelves. Shown in the Cozy room and Display case." : "Trinkets standing at the end of this shelf, next to the games."} Tap to add or remove, up to ${max()}. ${cur.length} chosen.</p>
      ${TK_GROUPS.filter(([g]) => tgt === "wall" ? g === "wall" : g !== "wall").map(([g, gn]) => `<div class="px" style="margin-top:6px">${gn}</div><div class="tkgrid">${TRINKETS.filter(t => t[2] === g).map(t => { const i = cur.indexOf(t[0]); return `<button type="button" class="tkpick${i >= 0 ? " on" : ""}" data-tk="${t[0]}" aria-pressed="${i >= 0}"><span class="tkart">${trinket(t[0])}</span><span>${t[1]}</span>${i >= 0 ? `<i>${i + 1}</i>` : ""}</button>`; }).join("")}</div>`).join("")}
      <div class="mfoot"><button class="btn small" type="button" data-dcclear>Clear</button><button class="btn small" type="button" data-dcreset>Default</button><div class="r"><button class="btn primary" type="button" data-mclose>Done</button></div></div></div>`; };
    const redraw = () => { const st = $("#scrim").scrollTop; $("#scrim").innerHTML = html(); $("#scrim").scrollTop = st; };
    openModal(html(), e => {
      const t = e.target;
      const tg = t.closest("[data-dctgt]"); if (tg) { tgt = tg.dataset.dctgt; redraw(); return; }
      const sg = t.closest("[data-sgs]"); if (sg) { nook.sign = { ...(nook.sign || {}), style: sg.dataset.sgs }; saveNook(); redraw(); return; }
      const sc = t.closest("[data-sgc]"); if (sc) { nook.sign = { ...(nook.sign || {}), color: sc.dataset.sgc }; saveNook(); redraw(); return; }
      const tk = t.closest("[data-tk]"); if (tk) { const id = tk.dataset.tk, cur = [...listOf()], i = cur.indexOf(id);
        if (i >= 0) cur.splice(i, 1); else { if (cur.length >= max()) { toast(`That spot holds up to ${max()}. Remove one first.`); return; } cur.push(id); }
        setList(cur); redraw(); return; }
      if (t.closest("[data-dcclear]")) { setList([]); redraw(); return; }
      if (t.closest("[data-dcreset]")) { if (tgt === "top") delete nook.top; else if (tgt === "wall") delete nook.wall; else { const s = shelfById(tgt); if (s) delete s.deco; } saveNook(); redraw(); }
    });
    root.oninput = e => { if (e.target.id !== "dc-sign") return; nook.sign = { ...(nook.sign || {}), text: e.target.value.slice(0, 40) }; clearTimeout(root._sgt); root._sgt = setTimeout(() => saveNook(), 300); const pv = $("#dc-prev"); if (pv) pv.innerHTML = signHTML() || ""; };
    modalClose = () => { root.oninput = null; };
  }

  // ---------- the room band: your sign, wall decor and the top shelf, placed wherever you like ----------
  const SIGN_STYLES = [["none", "No sign"], ["neon", "Neon"], ["wood", "Wooden plaque"], ["pixel", "Pixel marquee"], ["brass", "Brass plate"], ["chalk", "Chalkboard"]];
  const SIGN_DEF = { cozy: ["wood", "The Game Nook"], loft: ["chalk", "My Game Loft"], case: ["neon", "Hall of Games"], cyber: ["neon", "SAVE://POINT"], rack: ["pixel", "Save Point"] };
  const SIGN_COLORS = ["#FF5C8A", "#3CC6D8", "#B07CF0", "#F2BE45", "#5BC08A", "#F08A4B", "#FFFFFF"];
  // the sign is optional: off until you pick a style
  const signOf = () => { const S = nook.sign || {}, d = SIGN_DEF[nook.scene] || SIGN_DEF.cozy; return { text: (S.text || d[1]).slice(0, 40), style: S.style || "none", color: S.color || "" }; };
  const signHTML = (S = signOf()) => S.style === "none" ? "" : `<span class="rsign rs-${S.style}"${S.color ? ` style="--sgc:${S.color}"` : ""}>${esc(S.text)}</span>`;
  let editRoom = false;
  function bandItems(){
    const S = signOf(), wall = wallDeco().filter(id => id !== "lights" && TRINKET.get(id)?.[2] === "wall"), top = topDeco().filter(id => TRINKET.get(id) && TRINKET.get(id)[2] !== "wall");
    const items = [], P = nook.place || {};
    // default spots: sign in the middle of the wall, wall decor around it, top-shelf things spread along the shelf
    // the sign sits in the title spot above the room, so the wall is free for decorations
    const wallX = wall.map((_, i) => 6 + (i + 1) / (wall.length + 1) * 90);
    wall.forEach((id, i) => items.push({ key: "w:" + id, html: trinket(id), def: [Math.max(6, Math.min(94, wallX[i])), 58] }));
    top.forEach((id, i) => items.push({ key: "t:" + id, html: trinket(id), def: [(i + .5) / top.length * 100, 100] }));
    return items.map(it => ({ ...it, pos: Array.isArray(P[it.key]) ? P[it.key] : it.def }));
  }
  // string lights: a wire that hangs in loops between pins, with a glowing bulb every so often
  const LIGHT_COLORS = { cozy: ["#FFC86B", "#FFE3A3", "#FF9E7A", "#FFD27F"], loft: ["#FFE9B8", "#FFF4D6", "#FFD9A0"], case: ["#BFE6FF", "#FFFFFF", "#9FD4FF"], cyber: ["#00F0FF", "#FF2BD6", "#9D5CFF", "#00FFA3"], rack: ["#FFD86B", "#F07FB0"] };
  function drawLights(band, on){
    band.querySelector(".strlights")?.remove(); if (!on) return;
    const W = Math.max(300, band.clientWidth || 1000), loops = Math.max(2, Math.round(W / 300)), seg = W / loops, sag = 15, top = 4;
    const y = x => top + sag * Math.sin(Math.PI * ((x % seg) / seg));
    let d = `M0 ${top}`; for (let x = 4; x <= W; x += 4) d += ` L${x} ${y(x).toFixed(1)}`;
    const cols = LIGHT_COLORS[nook.scene] || LIGHT_COLORS.cozy, step = 42, bulbs = [];
    for (let x = step / 2, i = 0; x < W; x += step, i++) { const a = Math.atan2(y(x + 1) - y(x - 1), 2) * 180 / Math.PI; bulbs.push(`<i class="bulb" style="left:${x.toFixed(0)}px;top:${y(x).toFixed(1)}px;--bc:${cols[i % cols.length]};--rot:${a.toFixed(0)}deg;--d:${(i * 0.37 % 3).toFixed(2)}s"></i>`); }
    const pins = Array.from({ length: loops + 1 }, (_, k) => `<i class="lpin" style="left:${(k * seg).toFixed(0)}px"></i>`).join("");
    band.insertAdjacentHTML("afterbegin", `<div class="strlights" aria-hidden="true"><svg width="${W}" height="${top + sag + 4}" viewBox="0 0 ${W} ${top + sag + 4}"><path d="${d}" fill="none" stroke="#2B2530" stroke-width="1.6"/></svg>${pins}${bulbs.join("")}</div>`);
  }
  let lightsT = null; addEventListener("resize", () => { clearTimeout(lightsT); lightsT = setTimeout(() => { const b = $("#nook-band"); if (b) drawLights(b, b.classList.contains("lit")); }, 200); });
  function renderBand(){
    const band = $("#nook-band"), inn = $("#band-in"); if (!band) return;
    const lit = wallDeco().includes("lights");
    band.classList.toggle("lit", lit); band.classList.toggle("editing", editRoom); $(".rack").classList.toggle("editroom", editRoom);
    // only touch the wall when something on it changed: logging a session or rating a game redraws the shelves, not the lights and sign
    const itemsHTML = bandItems().map(it => `<div class="bi${it.key === "sign" ? " bsign" : ""}" data-bk="${esc(it.key)}" style="left:${it.pos[0]}%;top:${it.pos[1]}%" title="Drag to move, tap to remove">${it.html}</div>`).join(""), sh = signHTML();
    const sig = [lit, nook.scene, itemsHTML, sh].join("\u0001");
    if (sig === renderBand._sig && band.querySelector(".strlights") === (lit ? band.querySelector(".strlights") : null)) { $("#nook-edit").setAttribute("aria-pressed", String(editRoom)); $("#nook-edithint").hidden = !editRoom; markSel(); return; }
    renderBand._sig = sig;
    drawLights(band, lit);
    inn.innerHTML = itemsHTML;
    $("#nook-head").innerHTML = sh ? `<span class="bi bsign headsign" data-bk="sign" title="Tap to remove">${sh}</span>` : ""; // your sign is the room's title; without one the spot stays empty
    $("#nook-edit").setAttribute("aria-pressed", String(editRoom)); $("#nook-edithint").hidden = !editRoom;
    markSel();
    // keep everything inside the wall on narrow screens
    requestAnimationFrame(() => { const W = inn.clientWidth; if (!W) return; inn.querySelectorAll(".bi").forEach(el => { const half = el.offsetWidth / 2, x = parseFloat(el.style.left) / 100 * W; if (x - half < 0) el.style.left = half + "px"; else if (x + half > W) el.style.left = (W - half) + "px"; }); });
  }
  // tap a decoration to select it (an × appears to remove it); drag it to move it. No menu needed.
  let selDeco = "";
  function removeDeco(key){
    const [kind, rest] = key === "sign" ? ["sign", ""] : [key.slice(0, 1), key.slice(2)];
    let name = "Sign";
    if (kind === "sign") nook.sign = { ...(nook.sign || {}), style: "none" };
    else if (kind === "w") { nook.wall = wallDeco().filter(x => x !== rest); name = TRINKET.get(rest)?.[1]; }
    else if (kind === "t") { nook.top = topDeco().filter(x => x !== rest); name = TRINKET.get(rest)?.[1]; }
    else if (kind === "s") { const [sid, id] = rest.split("|"), sh = shelfById(sid); if (sh) { sh.deco = decoOf(sh).filter(x => x !== id); if (sh.decoAt) delete sh.decoAt[id]; if (sh.decoX) delete sh.decoX[id]; } name = TRINKET.get(id)?.[1]; }
    if (nook.place) delete nook.place[key];
    selDeco = ""; saveNook(); toast(`${name || "Decoration"} removed. Add things back from Customize → Decorate and sign.`);
  }
  function markSel(){
    document.querySelectorAll(".nook .decosel").forEach(el => { el.classList.remove("decosel"); el.querySelector(".bix")?.remove(); });
    if (!selDeco) return; const el = document.querySelector(`.nook [data-bk="${CSS.escape(selDeco)}"]`); if (!el) { selDeco = ""; return; }
    el.classList.add("decosel"); el.insertAdjacentHTML("beforeend", `<button type="button" class="bix" data-birm="${esc(selDeco)}" aria-label="Remove">×</button>`);
  }
  (function decoPointer(){
    const rack = $(".rack"); let dr = null;
    rack.addEventListener("pointerdown", e => {
      if (e.button > 0) return; const rm = e.target.closest("[data-birm]"); if (rm) return;
      const el = e.target.closest(".nook [data-bk]"); if (!el) return;
      e.preventDefault();
      const inBand = !!el.closest("#band-in"), host = inBand ? $("#band-in") : null;
      dr = { el, inBand, sx: e.clientX, sy: e.clientY, moved: false, pid: e.pointerId };
      if (inBand) { const r = el.getBoundingClientRect(); Object.assign(dr, { ox: e.clientX - (r.left + r.width / 2), oy: e.clientY - r.bottom, h: r.height, R: host.getBoundingClientRect() }); }
      el.setPointerCapture?.(e.pointerId);
    });
    const canFly = key => /^[ts]:/.test(key);
    const stripAt = (x, y) => { const el = document.elementFromPoint(x, y)?.closest(".shelf[data-shelf]"); return el && el.dataset.kind !== "virtual" ? el : null; };
    const spotIn = (shelfEl, x) => { const sp = [...shelfEl.querySelectorAll(".spines .spine[data-open]")]; let after = "", ref = null;
      for (const s2 of sp) { const r = s2.getBoundingClientRect(); if (r.left + r.width / 2 < x) { after = s2.dataset.open; ref = s2; } else break; } return { after, ref, first: sp[0] || null }; };
    const caret = (shelfEl, spot) => { document.querySelector(".decocaret")?.remove(); if (!shelfEl) return; const c = document.createElement("i"); c.className = "decocaret"; const strip = shelfEl.querySelector(".spines");
      if (spot.ref) spot.ref.after(c); else if (spot.first) spot.first.before(c); else strip.prepend(c); };
    rack.addEventListener("pointermove", e => {
      if (!dr || e.pointerId !== dr.pid) return;
      if (!dr.moved && Math.hypot(e.clientX - dr.sx, e.clientY - dr.sy) < 5) return;
      if (!dr.inBand && !canFly(dr.el.dataset.bk)) return;
      dr.moved = true; dr.el.classList.add("dragging");
      const R = dr.R, inside = dr.inBand && e.clientX >= R.left && e.clientX <= R.right && e.clientY >= R.top - 10 && e.clientY <= R.bottom + 6;
      if (dr.inBand && (inside || !canFly(dr.el.dataset.bk))) {
        if (dr.fly) { dr.fly.remove(); dr.fly = null; dr.el.style.opacity = ""; caret(null); }
        const x = Math.max(3, Math.min(97, (e.clientX - dr.ox - R.left) / R.width * 100)), y = Math.max(Math.min(100, dr.h / R.height * 100), Math.min(100, (e.clientY - dr.oy - R.top) / R.height * 100));
        dr.el.style.left = x + "%"; dr.el.style.top = y + "%"; dr.x = x; dr.y = y; return;
      }
      // flying: a copy follows your finger, and a marker shows where it will land
      if (!dr.fly) { const r = dr.el.getBoundingClientRect(); dr.fly = dr.el.cloneNode(true); dr.fly.classList.add("decofly"); dr.fly.querySelector(".bix")?.remove(); Object.assign(dr.fly.style, { width: r.width + "px", height: r.height + "px", left: "0", top: "0" }); document.body.append(dr.fly); dr.el.style.opacity = ".3"; dr.fw = r.width; dr.fh = r.height; }
      dr.fly.style.transform = `translate(${e.clientX - dr.fw / 2}px, ${e.clientY - dr.fh + 6}px)`;
      const sh = stripAt(e.clientX, e.clientY); if (sh) { const R2 = sh.querySelector(".slot").getBoundingClientRect(); dr.tgt = { el: sh, pct: Math.max(2, Math.min(98, (e.clientX - R2.left) / R2.width * 100)) }; } else dr.tgt = null;
      document.querySelectorAll(".shelf.decohover").forEach(x => x !== sh && x.classList.remove("decohover")); sh?.classList.add("decohover");
      const B = $("#band-in").getBoundingClientRect(); dr.toBand = !sh && e.clientY >= B.top && e.clientY <= B.bottom && e.clientX >= B.left && e.clientX <= B.right ? { x: Math.max(3, Math.min(97, (e.clientX - B.left) / B.width * 100)), y: Math.max(20, Math.min(100, (e.clientY - B.top + dr.fh / 2) / B.height * 100)) } : null;
    });
    const end = e => {
      if (!dr || e.pointerId !== dr.pid) return; const d0 = dr, { el, moved, x, y } = dr; dr = null; el.classList.remove("dragging");
      if (d0.fly) { d0.fly.remove(); el.style.opacity = ""; caret(null); document.querySelectorAll(".shelf.decohover").forEach(x => x.classList.remove("decohover"));
        const key = el.dataset.bk, kind = key[0], [sid0, id] = kind === "t" ? ["", key.slice(2)] : key.slice(2).split("|");
        const from = kind === "s" ? shelfById(sid0) : null, takeOut = () => { if (kind === "t") nook.top = topDeco().filter(t => t !== id); else if (from) { from.deco = decoOf(from).filter(t => t !== id); if (from.decoAt) delete from.decoAt[id]; if (from.decoX) delete from.decoX[id]; } if (nook.place) delete nook.place[key]; };
        if (e.type !== "pointercancel" && d0.tgt) { const T = shelfById(d0.tgt.el.dataset.shelf); if (T) { takeOut(); T.deco = [...decoOf(T).filter(t => t !== id), id]; T.decoX = { ...(T.decoX || {}), [id]: Math.round(d0.tgt.pct * 10) / 10 }; if (T.decoAt) delete T.decoAt[id]; selDeco = ""; saveNook(); toast(`${TRINKET.get(id)?.[1] || "Trinket"} moved to ${T.name}`); return; } }
        if (e.type !== "pointercancel" && d0.toBand && kind === "s") { takeOut(); nook.top = [...topDeco().filter(t => t !== id), id]; nook.place = { ...(nook.place || {}), ["t:" + id]: [Math.round(d0.toBand.x * 10) / 10, Math.round(d0.toBand.y * 10) / 10] }; selDeco = ""; saveNook(); return; }
        renderRack(); return;
      }
      if (moved && x != null) { nook.place = { ...(nook.place || {}), [el.dataset.bk]: [Math.round(x * 10) / 10, Math.round(y * 10) / 10] }; saveNook(false); selDeco = el.dataset.bk; markSel(); return; }
      if (e.type === "pointercancel") return;
      selDeco = selDeco === el.dataset.bk ? "" : el.dataset.bk; markSel();
    };
    rack.addEventListener("pointerup", end); rack.addEventListener("pointercancel", end);
    rack.addEventListener("click", e => { const rm = e.target.closest("[data-birm]"); if (rm) { e.stopPropagation(); removeDeco(rm.dataset.birm); } }, true);
    document.addEventListener("pointerdown", e => { if (selDeco && !e.target.closest(".nook [data-bk]")) { selDeco = ""; markSel(); } });
  })();

  // ---------- shelves ----------
  let lastShelfOf = new Map(), lastFlight = 0, arranging = false;
  // spine looks: cover art, or one solid colour where every logo is turned into a clean white or black silhouette
  const SPINE_STYLES = [["art", "Cover art"], ["dark", "Black"], ["light", "White"], ["color", "Colour"]];
  function shelfHTML(sh, i, seen){
    const list = shelfGames(sh), n = list.length, col = sh.kind === "virtual" ? sh.color : shelfColor(sh, i);
    if (sh.kind === "status") list.forEach(g => seen.set(g.id, sh.id));
    const mat = sh.mat !== "auto" ? sh.mat : SCENE_MAT[nook.scene], plate = sh.plate !== "auto" ? sh.plate : SCENE_PLATE[nook.scene];
    const kicker = sh.kind === "virtual" ? sh.kicker : sh.kind === "status" ? STATUS_SHELF[sh.status][0] : sh.rule ? "Smart shelf" : "My shelf";
    const empty = sh.kind === "status" ? { playing: "Open a game and mark it Playing.", finished: "Games you beat land here.", backlog: "Games you still mean to play wait here.", wishlist: "Games you'd like to own wait here.", dropped: "Games you set aside rest here." }[sh.status] : sh.rule ? "No games match this shelf's rules yet." : "Empty for now. Use the shelf options to add games.";
    const spin = sh.status === "backlog" && n >= 2 ? `<button class="spin" type="button" data-spin>Pick for me</button>` : "";
    const opt = sh.kind === "virtual" ? "" : `<button class="shelfopt" type="button" data-shelfopt="${esc(sh.id)}" aria-label="${esc(sh.name)} shelf options" title="Shelf options">⋯</button>`;
    const deco0 = (sh.kind === "virtual" ? [] : decoOf(sh)).filter(id => TRINKET.has(id) && id !== "lights" && TRINKET.get(id)[2] !== "wall");
    // trinkets you dropped between games sit right there; the rest stand at the end of the shelf
    // free trinkets stand exactly where you dropped them (decoX, % along the shelf), in front of the games
    const fx = sh.decoX || {}, free = deco0.filter(id => Object.hasOwn(fx, id));
    const at = sh.decoAt || {}, inl = deco0.filter(id => !Object.hasOwn(fx, id) && Object.hasOwn(at, id)), deco = deco0.filter(id => !Object.hasOwn(fx, id) && !Object.hasOwn(at, id));
    const freeHTML = free.map(id => `<span class="sdi free" data-bk="s:${esc(sh.id)}|${esc(id)}" style="left:${Math.max(0, Math.min(100, +fx[id] || 0))}%" title="${esc(TRINKET.get(id)[1])}: drag to move, tap to remove">${trinket(id)}</span>`).join("");
    const tk = id => `<span class="sdi inl" data-bk="s:${esc(sh.id)}|${esc(id)}" title="${esc(TRINKET.get(id)[1])}: drag to move, tap to remove">${trinket(id)}</span>`;
    const withTrinkets = html => { if (!inl.length) return html; const ids = new Set(list.slice(0, 150).map(g => g.id)), lead = inl.filter(id => at[id] === "").map(tk).join(""), tail = inl.filter(id => at[id] !== "" && !ids.has(at[id])).map(tk).join("");
      return lead + html.replace(/(<button class="spine[^"]*" type="button" data-open="([^"]+)"[\s\S]*?<\/button>)/g, (m, all, gid) => all + inl.filter(id => at[id] === gid).map(tk).join("")) + tail; };
    return `<div class="row shelf ${sh.kind === "status" ? sh.status : sh.kind}${mat ? " m-" + mat : ""} p-${plate}" data-shelf="${esc(sh.id)}" data-kind="${sh.kind}" style="--sc:${col};--rl:${hexRgb(col)}">
      <div class="rowlabel"><span class="px">${esc(kicker)}</span><b>${esc(sh.name)}</b><span class="n">${n}</span><span class="rowact">${spin}${opt}</span></div>
      <div class="slot"><div class="spines" role="list" aria-label="${esc(sh.name)}, ${n} game${n === 1 ? "" : "s"}">${n ? withTrinkets(sortKey(sh) === "type" ? typeGroups(list) : list.slice(0, 150).map(spine).join(""))
        : Array.from({ length: 5 }, (_, j) => `<div class="spine ghost" style="--c:var(--c${(j + i) % 8 + 1})"></div>`).join("") + `<div class="emptyrow">${arranging ? "Drop a game here" : empty}</div>`}</div>${freeHTML}${deco.length ? `<div class="sdeco">${deco.map(id => `<span class="sdi" data-bk="s:${esc(sh.id)}|${esc(id)}" title="${esc(TRINKET.get(id)[1])}: tap to remove">${trinket(id)}</span>`).join("")}</div>` : ""}</div>
      <div class="plank"><span class="plate"><b>${esc(sh.name)}</b><i>${n}</i></span><span class="rowact">${spin}${opt}</span></div>
    </div>`;
  }
  function renderRack(){
    const host = $("#shelves"), rack = $(".rack"); if (!host) return;
    // the Abandoned shelf appears by itself the first time a game ends up there (hide it again any time)
    if (!nook.dropAuto && games.some(g => g.status === "dropped")) { const ds = nook.shelves.find(x => x.kind === "status" && x.status === "dropped"); if (ds) ds.hidden = false; nook.dropAuto = true; saveNook(false); setTimeout(() => toast("A dusty new shelf appeared: Abandoned. Hide or rename it from its ⋯ menu."), 800); }
    try { renderRoom(); } catch {}
    rack.dataset.scene = nook.scene; rack.classList.toggle("arranging", arranging);
    rack.dataset.spines = nook.spines || "art"; rack.dataset.finish = nook.finish || "natural"; rack.dataset.logos = nook.logoColor ? "color" : "mono";

    rack.style.setProperty("--tint", (FINISHES.find(f => f[0] === (nook.finish || "natural")) || FINISHES[0])[2] || "transparent");
    $("#nook-finish").innerHTML = FINISHES.map(([k, n, c]) => `<button type="button" class="fin" data-finish="${k}" aria-pressed="${(nook.finish || "natural") === k}" title="${n}" aria-label="${n} shelves" style="--fc:${c || "#A86F3C"}"></button>`).join("");
    $("#nook-spines").innerHTML = SPINE_STYLES.map(([k, n]) => `<button type="button" class="sps sps-${k}" data-spines="${k}" aria-pressed="${(nook.spines || "art") === k}" title="${n}"><i></i><span>${n}</span></button>`).join("");
    $("#nook-move").setAttribute("aria-pressed", String(arranging)); $("#nook-move").innerHTML = arranging ? "<i>✓</i>Done moving" : "<i>⇄</i>Move games";
    $("#nook-hint").hidden = !arranging;
    renderBand();
    { const ds = nook.shelves.find(x => x.kind === "status" && x.status === "dropped"), ab = $("#nook-abrow"); if (ab) { ab.hidden = !ds; if (ds) $("#nook-ab").innerHTML = [["on", "Show"], ["off", "Hide"]].map(([k, n]) => `<button type="button" data-nookab="${k}" aria-pressed="${(k === "on") === !ds.hidden}">${n}</button>`).join(""); } }
    $("#nook-scene").innerHTML = SCENES.map(([k, n]) => `<button type="button" data-setscene="${k}" aria-pressed="${nook.scene === k}">${n}</button>`).join("");
    // remember where each spine sat, so a game that changes status can fly to its new shelf
    const canFly = !reduceMotion && settings.motion !== "off" && tab === "library" && rackVisible && lastShelfOf.size && !arranging;
    const before = new Map();
    if (canFly) host.querySelectorAll('.shelf[data-kind="status"] .spine[data-open]').forEach(el => { const r = el.getBoundingClientRect(); if (r.width && r.bottom > 0 && r.top < innerHeight) before.set(el.dataset.open, { r, html: el.outerHTML }); });
    const virt = nook.view && nook.view !== "shelves", vis = virt ? virtualShelves() : nook.shelves.filter(s => !s.hidden), now = new Map();
    rack.classList.toggle("virtual", !!virt); if (virt && arranging) arranging = false;
    $("#nook-view").innerHTML = NOOK_VIEWS.map(([k, n]) => `<option value="${k}"${(nook.view || "shelves") === k ? " selected" : ""}>${n}</option>`).join("");
    $("#nook-sortall").innerHTML = SORT_ALL.map(([k, n]) => `<option value="${k}"${(virt ? (sortAllOf() === "each" ? "title" : sortAllOf()) : sortAllOf()) === k ? " selected" : ""}>${n}</option>`).join("");
    host.innerHTML = vis.length ? vis.map((sh, i) => shelfHTML(sh, virt ? i : nook.shelves.indexOf(sh), now)).join("") : `<div class="emptyrow">Every shelf is hidden. Use “Arrange shelves” to bring them back.</div>`;
    try { markSel(); } catch {}
    if (canFly) for (const [id, sid] of now) { const was = lastShelfOf.get(id); if (was && was !== sid && before.has(id)) fly(id, sid, before.get(id)); }
    lastShelfOf = now;
    const c = s => games.filter(g => g.status === s).length, h = games.reduce((s, g) => s + (Number(g.hours) || 0), 0);
    $("#subline").textContent = games.length ? `${c("finished")} finished · ${c("playing")} in progress · ${c("backlog")} in the backlog · ${Math.round(h).toLocaleString()} hours logged` : "Every game you're playing, have beaten, and still mean to get to.";
  }
  function fly(id, sid, from){
    const el = document.querySelector(`#shelves .shelf[data-shelf="${CSS.escape(sid)}"] .spine[data-open="${CSS.escape(id)}"]`); if (!el) return;
    const strip = el.parentElement; strip.scrollLeft = Math.max(0, el.offsetLeft - strip.clientWidth / 2 + el.offsetWidth / 2);
    const to = el.getBoundingClientRect(); if (!to.width || to.top > innerHeight || to.bottom < 0) return;
    const ghost = document.createElement("div"); ghost.className = "spine-fly"; ghost.setAttribute("aria-hidden", "true"); ghost.innerHTML = from.html;
    Object.assign(ghost.style, { left: from.r.left + "px", top: from.r.top + "px", width: from.r.width + "px", height: from.r.height + "px" });
    document.body.append(ghost); el.style.visibility = "hidden"; lastFlight = Date.now();
    const dx = to.left - from.r.left, dy = to.top - from.r.top;
    const a = ghost.animate([{ transform: "translate(0,0)" }, { transform: `translate(${dx * .45}px,${dy * .45 - 70}px) rotate(-12deg) scale(1.15)`, offset: .45 }, { transform: `translate(${dx}px,${dy}px)` }], { duration: 1050, easing: "cubic-bezier(.5,0,.3,1)" });
    const land = () => { ghost.remove(); el.style.visibility = ""; el.classList.add("landed"); setTimeout(() => el.classList.remove("landed"), 1700); };
    a.onfinish = land; a.oncancel = land;
  }
  function saveOrder(sid, ids, redraw){ const sh = shelfById(sid); if (!sh) return; sh.order = ids; sh.sort = "manual"; saveNook(redraw); }
  // Move games: drag a spine within a shelf or onto another one. Dropping on a status shelf changes the game's status.
  function moveGame(id, from, to, order){
    const F = shelfById(from), T = shelfById(to), g = games.find(x => x.id === id); if (!T || !g) return renderRack();
    const wasAuto = sortKey(T) !== "manual", note = wasAuto ? `. ${T.name} now keeps your own order` : "";
    if (from === to) { saveOrder(to, order, true); if (wasAuto) toast(`${T.name} now keeps your own order. Change it any time in the shelf's ⋯ menu.`); return; }
    if (F?.kind === "custom") F.ids = (F.ids || []).filter(x => x !== id);
    if (T.kind === "custom" && !(T.ids || []).includes(id)) T.ids = [...(T.ids || []), id];
    T.order = order; T.sort = "manual"; saveNook(false);
    const stays = F?.kind === "custom" && F.rule && ruleMatch(F.rule, g);
    if (T.kind === "status" && g.status !== T.status) {
      const out = { ...g, status: T.status };
      if (T.status === "finished") { out.finished = g.finished || todayISO(); out.progress = 100; }
      if (T.status === "playing") out.started = g.started || todayISO();
      saveGame(out, `${g.title} moved to ${T.name}${stays ? `. It still matches the rules of ${F.name}` : note}`);
      return;
    }
    renderRack(); toast(`${g.title} ${T.kind === "custom" ? "added to" : "moved to"} ${T.name}${stays ? `. It still matches the rules of ${F.name}` : note}`);
  }
  const stripIds = (strip, ph, id) => [...strip.children].map(c => c === ph ? id : c.matches(".spine[data-open]") && c.style.display !== "none" ? c.dataset.open : null).filter(Boolean);
  (function arrangeInit(){
    const host = $("#shelves"); let drag = null, raf = 0;
    const place = (x, y) => {
      const el = document.elementFromPoint(x, y), strip = el?.closest(".shelf")?.querySelector(".spines"); if (!strip) return;
      host.querySelectorAll(".droptarget").forEach(s => s.classList.remove("droptarget")); strip.closest(".shelf").classList.add("droptarget");
      const r = strip.getBoundingClientRect(); if (x < r.left + 40) strip.scrollLeft -= 12; else if (x > r.right - 40) strip.scrollLeft += 12;
      const sibs = [...strip.querySelectorAll(".spine[data-open]")].filter(c => c !== drag.sp);
      const next = sibs.find(c => { const b = c.getBoundingClientRect(); return x < b.left + b.width / 2; });
      if (next) { if (drag.ph.nextElementSibling !== next) strip.insertBefore(drag.ph, next); }
      else { const tail = strip.querySelector(".spine.ghost, .emptyrow"); if (tail) { if (drag.ph.nextElementSibling !== tail) strip.insertBefore(drag.ph, tail); } else if (strip.lastElementChild !== drag.ph) strip.append(drag.ph); }
    };
    const move = e => {
      if (!drag || e.pointerId !== drag.pid) return; e.preventDefault();
      drag.fl.style.transform = `translate(${e.clientX - drag.dx}px,${e.clientY - drag.dy}px) rotate(-4deg) scale(1.06)`;
      if (e.clientY < 60) scrollBy(0, -10); else if (e.clientY > innerHeight - 60) scrollBy(0, 10);
      cancelAnimationFrame(raf); raf = requestAnimationFrame(() => drag && place(e.clientX, e.clientY));
    };
    const up = e => {
      if (!drag || e.pointerId !== drag.pid) return;
      removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
      const { sp, ph, fl, from, id } = drag; drag = null; cancelAnimationFrame(raf); quiet = Date.now(); document.body.classList.remove("dragging-game");
      host.querySelectorAll(".droptarget").forEach(s => s.classList.remove("droptarget"));
      const strip = ph.parentElement, to = strip?.closest(".shelf")?.dataset.shelf, order = strip ? stripIds(strip, ph, id) : [];
      fl.remove(); ph.remove(); sp.style.display = "";
      if (e.type === "pointercancel" || !to) { renderRack(); return; }
      moveGame(id, from, to, order);
    };
    // pick a game up straight off the shelf: drag it with the mouse, or press and hold it on a touch screen
    let pend = null, quiet = 0;
    const clearPend = () => { if (!pend) return; clearTimeout(pend.timer); pend.sp.classList.remove("pressing"); pend = null; removeEventListener("pointermove", pmove); removeEventListener("pointerup", clearPend); removeEventListener("pointercancel", clearPend); };
    const pmove = e => {
      if (!pend || e.pointerId !== pend.pid) return;
      const d = Math.hypot(e.clientX - pend.x, e.clientY - pend.y);
      if (pend.mouse) { if (d > 6) { const p = pend; clearPend(); start(p.sp, p, e); } }
      else if (d > 10) clearPend(); // the finger is scrolling, not picking up
    };
    host.addEventListener("pointerdown", e => {
      if (e.button > 0 || drag) return;
      const sp = e.target.closest(".spine[data-open]"); if (!sp || sp.closest('.shelf[data-kind="virtual"]')) return;
      if (arranging) { e.preventDefault(); start(sp, e, e); return; }
      const mouse = e.pointerType === "mouse";
      pend = { sp, x: e.clientX, y: e.clientY, pid: e.pointerId, mouse };
      if (!mouse) { sp.classList.add("pressing"); pend.timer = setTimeout(() => { if (!pend) return; const p = pend; clearPend(); try { navigator.vibrate?.(12); } catch {} start(p.sp, p, p); }, 420); }
      addEventListener("pointermove", pmove); addEventListener("pointerup", clearPend); addEventListener("pointercancel", clearPend);
    });
    host.addEventListener("contextmenu", e => { if (pend || drag) e.preventDefault(); });
    host.addEventListener("dragstart", e => { if (e.target.closest?.(".spine")) e.preventDefault(); });
    document.addEventListener("touchmove", e => { if (drag) e.preventDefault(); }, { passive: false });
    function start(sp, origin, at){
      const r = sp.getBoundingClientRect(), ph = document.createElement("div"), fl = sp.cloneNode(true);
      ph.className = "spine-ph"; ph.style.cssText = `width:${r.width}px;height:${r.height}px`; sp.after(ph);
      fl.classList.add("spine-drag"); fl.style.cssText = `width:${r.width}px;height:${r.height}px;transform:translate(${r.left}px,${r.top}px) rotate(-4deg) scale(1.06)`; document.body.append(fl);
      sp.style.display = "none";
      drag = { sp, ph, fl, pid: origin.pid ?? origin.pointerId, dx: origin.x ?? origin.clientX, dy: origin.y ?? origin.clientY, from: sp.closest(".shelf").dataset.shelf, id: sp.dataset.open };
      drag.dx -= r.left; drag.dy -= r.top; document.body.classList.add("dragging-game");
      addEventListener("pointermove", move, { passive: false }); addEventListener("pointerup", up); addEventListener("pointercancel", up);
      move({ pointerId: drag.pid, clientX: at.clientX ?? at.x, clientY: at.clientY ?? at.y, preventDefault(){} });
    }
    host.addEventListener("click", e => { if ((arranging || Date.now() - quiet < 450) && e.target.closest(".spine")) { e.stopPropagation(); e.preventDefault(); } }, true);
    host.addEventListener("keydown", e => {
      if (!arranging && !e.altKey) return; const sp = e.target.closest(".spine[data-open]"); if (!sp || !/^Arrow(Left|Right|Up|Down)$/.test(e.key)) return; // keyboard: Alt + arrow keys move the focused game
      e.preventDefault(); const s = sp.parentElement, from = sp.closest(".shelf").dataset.shelf, id = sp.dataset.open;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (e.key === "ArrowLeft" && sp.previousElementSibling?.matches(".spine[data-open]")) s.insertBefore(sp, sp.previousElementSibling);
        else if (e.key === "ArrowRight" && sp.nextElementSibling?.matches(".spine[data-open]")) s.insertBefore(sp.nextElementSibling, sp);
        sp.focus(); saveOrder(from, [...s.querySelectorAll(".spine[data-open]")].map(x => x.dataset.open), false); return;
      }
      const vis = nook.shelves.filter(x => !x.hidden), i = vis.findIndex(x => x.id === from), T = vis[i + (e.key === "ArrowUp" ? -1 : 1)]; if (!T) return;
      moveGame(id, from, T.id, [id, ...shelfGames(T).map(g => g.id).filter(x => x !== id)]);
      setTimeout(() => document.querySelector(`.shelf[data-shelf="${CSS.escape(T.id)}"] .spine[data-open="${CSS.escape(id)}"]`)?.focus(), 30);
    });
  })();
  $(".rack").addEventListener("change", e => {
    if (e.target.id === "nook-view") { nook.view = e.target.value; saveNook(); return; }
    if (e.target.id === "nook-logocol") { nook.logoColor = e.target.checked; saveNook(); return; }
    if (e.target.id === "nook-sortall") { const k = e.target.value; nook.sortAll = k; if (k !== "each") nook.shelves.forEach(sh => sh.sort = k); saveNook(); toast(k === "each" ? "Each shelf keeps its own order. Change one from its ⋯ menu." : `All shelves sorted by ${SORT_ALL.find(x => x[0] === k)[1].toLowerCase()}.`); }
  });
  const closeMenu = () => { const m = $("#nook-menu"); if (m && !m.hidden) { m.hidden = true; $("[data-nookmenu]").setAttribute("aria-expanded", "false"); } };
  document.addEventListener("click", e => { if (!e.target.closest(".nmenuwrap")) closeMenu(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });
  $(".rack").addEventListener("click", e => {
    const t = e.target;
    if (t.closest("[data-nookmenu]")) { const m = $("#nook-menu"); m.hidden = !m.hidden; t.closest("[data-nookmenu]").setAttribute("aria-expanded", String(!m.hidden)); return; }
    if (t.closest(".nmlist button")) closeMenu();
    const abt = t.closest("button[data-nookab]"); if (abt) { const ds = nook.shelves.find(x => x.kind === "status" && x.status === "dropped"); if (ds) { ds.hidden = abt.dataset.nookab === "off"; nook.dropAuto = true; saveNook(); try { renderRoom(); } catch {} toast(ds.hidden ? "Abandoned shelf hidden. Show it again from Customize." : "Abandoned shelf is back"); } return; }
    const sc = t.closest("button[data-setscene]"); if (sc) { nook.scene = sc.dataset.setscene; saveNook(); return; }
    const sp = t.closest("button[data-spines]"); if (sp) { nook.spines = sp.dataset.spines; saveNook(); return; }
    const fi = t.closest("button[data-finish]"); if (fi) { nook.finish = fi.dataset.finish; saveNook(); return; }
    if (t.closest("[data-spin]")) return openRoulette();
    if (t.closest("[data-nooknew]")) return openShelf(null);
    if (t.closest("[data-nookmanage]")) return openNookManager();
    if (t.closest("[data-nookmove]")) { arranging = !arranging; renderRack(); if (!arranging) toast("Shelves saved"); return; }
    if (t.closest("[data-nookdeco]")) return openDecor(editRoom ? "wall" : "top");
    if (t.closest("[data-nookedit]")) { editRoom = !editRoom; if (editRoom && nook.scene === "rack") { nook.scene = "cozy"; saveNook(); } renderBand(); if (editRoom) $("#nook-band").scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" }); else toast("Room saved"); return; }
    if (t.closest("[data-bandreset]")) { delete nook.place; saveNook(); return; }
    const so = t.closest("[data-shelfopt]"); if (so) return openShelf(so.dataset.shelfopt);
  });

