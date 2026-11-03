  // ================= can I run it? =================
  // Your PC (saved with your shelves, so your phone knows it too) against each game's minimum and recommended specs from PCGamingWiki.
  // Hardware is compared with a built-in performance ranking, so "RTX 5070 Ti" beats "GTX 1060" without matching names.
  const GPU_TABLE = [
    // NVIDIA (RTX 4090 = 100)
    [/rtx\s*5090/, 125], [/rtx\s*5080/, 82], [/rtx\s*5070\s*ti/, 74], [/rtx\s*5070/, 60], [/rtx\s*5060\s*ti/, 47], [/rtx\s*5060/, 40], [/rtx\s*5050/, 32],
    [/rtx\s*4090/, 100], [/rtx\s*4080\s*super/, 75], [/rtx\s*4080/, 73], [/rtx\s*4070\s*ti\s*super/, 65], [/rtx\s*4070\s*ti/, 60], [/rtx\s*4070\s*super/, 57], [/rtx\s*4070/, 50], [/rtx\s*4060\s*ti/, 41], [/rtx\s*4060/, 34], [/rtx\s*4050/, 28],
    [/rtx\s*3090\s*ti/, 63], [/rtx\s*3090/, 59], [/rtx\s*3080\s*ti/, 57], [/rtx\s*3080/, 52], [/rtx\s*3070\s*ti/, 45], [/rtx\s*3070/, 42], [/rtx\s*3060\s*ti/, 37], [/rtx\s*3060/, 30], [/rtx\s*3050/, 21],
    [/rtx\s*2080\s*ti/, 41], [/rtx\s*2080\s*super/, 36], [/rtx\s*2080/, 34], [/rtx\s*2070\s*super/, 32], [/rtx\s*2070/, 29], [/rtx\s*2060\s*super/, 27], [/rtx\s*2060/, 24],
    [/gtx\s*1660\s*(ti|super)/, 20], [/gtx\s*1660/, 18], [/gtx\s*1650\s*super/, 15], [/gtx\s*1650/, 13], [/titan\s*xp?\b/, 30],
    [/gtx\s*1080\s*ti/, 31], [/gtx\s*1080/, 25], [/gtx\s*1070\s*ti/, 23], [/gtx\s*1070/, 21], [/gtx\s*1060/, 16], [/gtx\s*1050\s*ti/, 10], [/gtx\s*1050/, 8], [/gt\s*1030/, 4],
    [/gtx\s*980\s*ti/, 18], [/gtx\s*980/, 14], [/gtx\s*970/, 12], [/gtx\s*960/, 8], [/gtx\s*950/, 7], [/gtx\s*780\s*ti/, 10], [/gtx\s*780/, 9], [/gtx\s*770/, 7], [/gtx\s*760/, 6], [/gtx\s*750\s*ti/, 5], [/gtx\s*750/, 4.5], [/gtx\s*680/, 6.5], [/gtx\s*670/, 6], [/gtx\s*660/, 5], [/gtx\s*650/, 3], [/gtx\s*(560|570|580)/, 4], [/gtx\s*(460|470|480)/, 3], [/gt\s*7[1-4]0/, 1.5], [/9800\s*gt|8800/, 1.2],
    // AMD
    [/rx\s*9070\s*xt/, 75], [/rx\s*9070/, 66], [/rx\s*9060\s*xt/, 42], [/rx\s*7900\s*xtx/, 80], [/rx\s*7900\s*xt/, 70], [/rx\s*7900\s*gre/, 61], [/rx\s*7800\s*xt/, 55], [/rx\s*7700\s*xt/, 47], [/rx\s*7600\s*xt/, 33], [/rx\s*7600/, 31],
    [/rx\s*6950\s*xt/, 61], [/rx\s*6900\s*xt/, 58], [/rx\s*6800\s*xt/, 54], [/rx\s*6800/, 47], [/rx\s*6750\s*xt/, 40], [/rx\s*6700\s*xt/, 38], [/rx\s*6700/, 34], [/rx\s*6650\s*xt/, 31], [/rx\s*6600\s*xt/, 30], [/rx\s*6600/, 26], [/rx\s*6500\s*xt/, 11], [/rx\s*6400/, 9],
    [/rx\s*5700\s*xt/, 28], [/rx\s*5700/, 25], [/rx\s*5600\s*xt/, 21], [/rx\s*5500\s*xt/, 14], [/radeon\s*vii/, 27], [/vega\s*64/, 22], [/vega\s*56/, 20],
    [/rx\s*590/, 15], [/rx\s*580/, 14], [/rx\s*570/, 13], [/rx\s*480/, 14], [/rx\s*470/, 12], [/rx\s*560/, 7], [/rx\s*460/, 6], [/rx\s*550/, 4],
    [/r9\s*fury/, 16], [/r9\s*390/, 13], [/r9\s*380/, 10], [/r9\s*290/, 12], [/r9\s*280/, 9], [/r9\s*270/, 7], [/r7\s*370/, 6], [/r7\s*(260|360)/, 5], [/hd\s*79[57]0/, 9], [/hd\s*78[57]0/, 7], [/hd\s*77[57]0/, 4.5], [/hd\s*69[57]0/, 5], [/hd\s*68[57]0/, 4], [/hd\s*58[57]0/, 3], [/hd\s*(48|57)[57]0/, 2],
    // Intel and handhelds
    [/arc\s*b580/, 36], [/arc\s*b570/, 31], [/arc\s*a770/, 30], [/arc\s*a750/, 28], [/arc\s*a580/, 24], [/arc\s*a380/, 10], [/iris\s*xe/, 4], [/(uhd|hd)\s*graphics/, 2], [/steam\s*deck|van\s*gogh/, 8], [/radeon\s*7[68]0m/, 14]
  ];
  const gpuScore = s => { s = String(s || "").toLowerCase().replace(/geforce|nvidia|amd|radeon(?!\s*vii|\s*7[68]0m)|graphics card|®|™/g, " "); const hit = GPU_TABLE.find(([re]) => re.test(s)); return hit ? hit[1] : null; };
  function cpuScore(s){
    s = String(s || "").toLowerCase();
    if (/core\s*ultra\s*[579]/.test(s)) return /ultra\s*9/.test(s) ? 82 : /ultra\s*7/.test(s) ? 79 : 72;
    let m = s.match(/\bi([3579])[\s-]*(\d{4,5})/);
    if (m) { const n = m[2], gen = n.length === 5 ? +n.slice(0, 2) : +n[0], G = { 2: 20, 3: 23, 4: 27, 5: 29, 6: 33, 7: 35, 8: 42, 9: 45, 10: 50, 11: 56, 12: 68, 13: 75, 14: 77 }[gen] || 30, T = { 3: .65, 5: .8, 7: .92, 9: 1 }[m[1]]; return Math.round(G * T); }
    m = s.match(/ryzen\s*([3579])\s*(?:pro\s*)?(\d{4})/);
    if (m) { const gen = +m[2][0], G = { 1: 35, 2: 40, 3: 50, 4: 52, 5: 66, 7: 76, 8: 74, 9: 82 }[gen] || 45, T = { 3: .7, 5: .85, 7: .95, 9: 1 }[m[1]]; return Math.round(G * T * (/x3d/.test(s) ? 1.12 : 1)); }
    if (/fx[\s-]*(8|9)\d{3}/.test(s)) return 22; if (/fx[\s-]*6\d{3}/.test(s)) return 18; if (/fx[\s-]*4\d{3}/.test(s)) return 14;
    if (/phenom|athlon\s*ii/.test(s)) return 12; if (/core\s*2\s*quad|q[69]\d{3}/.test(s)) return 10; if (/core\s*2\s*duo|e[68]\d{3}/.test(s)) return 7;
    if (/xeon\s*e[35]-\d{4}/.test(s)) return 28; if (/steam\s*deck/.test(s)) return 30;
    return null;
  }
  const gbOf = s => { const m = String(s || "").match(/(\d+(?:\.\d+)?)\s*(gb|mb)/i); return m ? (+m[1]) / (/mb/i.test(m[2]) ? 1024 : 1) : null; };
  const myPC = () => nook.pc || {};
  function detectPC(){
    const out = {};
    try { const c = document.createElement("canvas").getContext("webgl"), d = c.getExtension("WEBGL_debug_renderer_info"), r = d ? c.getParameter(d.UNMASKED_RENDERER_WEBGL) : "";
      const m = String(r).match(/(GeForce [^(,]*?|Radeon [^(,]*?|Arc [^(,]*?|Iris[^(,]*?|UHD Graphics[^(,]*?)(\s*\(0x|\s*Direct3D|,|$)/i); if (m) out.gpu = m[1].trim(); } catch {}
    if (navigator.deviceMemory && navigator.deviceMemory > 8) out.ram = navigator.deviceMemory; // browsers often cap this at 8, so only trust bigger numbers
    if (navigator.hardwareConcurrency) out.threads = navigator.hardwareConcurrency;
    return out;
  }
  // PCGamingWiki: the "System requirements" box on each game's page
  const PCGW = "https://www.pcgamingwiki.com/w/api.php";
  async function pcgw(params){ const u = new URL(PCGW); Object.entries({ ...params, format: "json", origin: "*" }).forEach(([k, v]) => u.searchParams.set(k, v)); const r = await fetch(u); if (!r.ok) throw new Error("pcgw " + r.status); return r.json(); }
  const clean = v => String(v || "").replace(/<ref[\s\S]*?(<\/ref>|\/>)/g, "").replace(/\{\{[^{}]*\}\}/g, "").replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1").replace(/<[^>]+>/g, "").replace(/'''?/g, "").replace(/\s+/g, " ").trim();
  function parseReqs(wt){
    const blocks = [...String(wt).matchAll(/\{\{System requirements([\s\S]*?)\n\}\}/g)].map(m => m[1]);
    const win = blocks.find(b => /OSfamily\s*=\s*Windows/i.test(b)) || blocks[0]; if (!win) return null;
    const f = {}; win.split(/\n\|/).forEach(l => { const m = l.match(/^\s*([A-Za-z0-9]+)\s*=\s*([\s\S]*)$/); if (m) f[m[1]] = clean(m[2]); });
    const side = p => ({ cpu: [f[p + "CPU"], f[p + "CPU2"], f[p + "CPU3"]].filter(Boolean), gpu: [f[p + "GPU"], f[p + "GPU2"], f[p + "GPU3"]].filter(Boolean), ram: gbOf(f[p + "RAM"]), vram: gbOf(f[p + "VRAM"]), disk: gbOf(f[p + "HD"]) });
    const min = side("min"), rec = side("rec");
    return min.gpu.length || min.cpu.length || min.ram ? { min, rec: rec.gpu.length || rec.cpu.length || rec.ram ? rec : null } : null;
  }
  async function fetchReqs(g){
    const tryPage = async t => { const j = await pcgw({ action: "parse", page: t, prop: "wikitext", redirects: 1 }); return j.parse ? { title: j.parse.title, req: parseReqs(j.parse.wikitext?.["*"] || "") } : null; };
    let hit = null; try { hit = await tryPage(g.title); } catch {}
    if (!hit?.req) { const s = await pcgw({ action: "query", list: "search", srsearch: g.title, srlimit: 3 }); for (const r of s.query?.search || []) { try { const h = await tryPage(r.title); if (h?.req) { hit = h; break; } } catch {} } }
    return hit?.req ? { ...hit.req, page: hit.title, at: todayISO() } : { none: true, at: todayISO() };
  }
  const avg = a => { const v = a.filter(x => x != null); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
  const LEVELS = [["no", "Below minimum", "#E0405A"], ["low", "Low settings", "#F08A4B"], ["med", "Medium settings", "#E8B83D"], ["high", "High settings", "#5BC08A"], ["ultra", "Ultra settings", "#3CC6D8"]];
  function verdict(R){
    if (!R || R.none) return null;
    const pc = myPC(), G = gpuScore(pc.gpu), C = cpuScore(pc.cpu), M = Number(pc.ram) || null;
    if (!G && !C && !M) return { lvl: null, why: "Add your PC first." };
    const part = (mine, min, rec) => { if (mine == null || min == null) return null; if (mine < min * .85) return 0; if (rec == null) return mine >= min * 2 ? 3 : mine >= min * 1.3 ? 2 : 1;
      if (mine < rec * .9) return mine >= (min + rec) / 2 ? 2 : 1; return mine >= rec * 1.45 ? 4 : 3; };
    const g = part(G, avg(R.min.gpu.map(gpuScore)), R.rec ? avg(R.rec.gpu.map(gpuScore)) : null), c = part(C, avg(R.min.cpu.map(cpuScore)), R.rec ? avg(R.rec.cpu.map(cpuScore)) : null), m = part(M, R.min.ram, R.rec?.ram);
    const parts = [["graphics card", g], ["processor", c], ["memory", m]].filter(([, v]) => v != null);
    if (!parts.length) return { lvl: null, why: "Couldn't compare: the game's or your hardware isn't in the ranking yet." };
    const lo = Math.min(...parts.map(p => p[1])), by = parts.filter(p => p[1] === lo).map(p => p[0]);
    return { lvl: LEVELS[lo][0], name: LEVELS[lo][1], c: LEVELS[lo][2], why: parts.length > 1 && parts.some(p => p[1] > lo) ? `Held back by your ${by.join(" and ")}.` : "", guess: !g || (!c && R.min.cpu.length) };
  }
  const runBadge = g => { const v = verdict(g.reqs); return v?.lvl ? `<span class="runbadge" style="--rc:${v.c}">${v.name}</span>` : ""; };
  function runField(d){
    if (!games.some(x => x.id === d.id)) return "";
    const R = d.reqs, v = verdict(R), pc = myPC(), has = pc.gpu || pc.cpu || pc.ram;
    const row = (n, mn, rc, mine) => `<tr><th>${n}</th><td>${esc(mn || "–")}</td><td>${esc(rc || "–")}</td><td>${esc(mine || "–")}</td></tr>`;
    return `<div class="field runfield"><span class="px">Can I run it?</span>
      ${!has ? `<div class="launchrow"><span>Add your PC once and every game gets a verdict.</span><button class="btn small primary" type="button" data-mypc>Add my PC</button></div>`
      : !R ? `<div class="launchrow"><span>Compare with this game's system requirements.</span><button class="btn small primary" type="button" data-runcheck>Check my PC</button></div>`
      : R.none ? `<div class="launchrow"><span>No requirements found on PCGamingWiki.</span><button class="btn small" type="button" data-runcheck>Try again</button></div>`
      : `<div class="runres">${v?.lvl ? `<b class="runbig" style="--rc:${v.c}">${v.name}</b>` : `<b>${esc(v?.why || "")}</b>`}${v?.lvl && v.why ? `<small>${esc(v.why)}</small>` : ""}</div>
        <table class="runtab"><thead><tr><th></th><th>Minimum</th><th>Recommended</th><th>Your PC</th></tr></thead><tbody>
        ${row("Graphics", R.min.gpu.join(" / "), R.rec?.gpu.join(" / "), pc.gpu)}${row("Processor", R.min.cpu.join(" / "), R.rec?.cpu.join(" / "), pc.cpu || (pc.threads ? pc.threads + " threads" : ""))}${row("Memory", R.min.ram ? R.min.ram + " GB" : "", R.rec?.ram ? R.rec.ram + " GB" : "", pc.ram ? pc.ram + " GB" : "")}</tbody></table>
        <small class="muted">An estimate from the game's minimum and recommended specs on <a href="https://www.pcgamingwiki.com/wiki/${encodeURIComponent(String(R.page || "").replace(/ /g, "_"))}" target="_blank" rel="noopener">PCGamingWiki ↗</a>, not a measured frame rate.${v?.guess ? " Add your processor in My PC for a fuller check." : ""} <button class="linkbtn" type="button" data-runcheck>Refresh</button> · <button class="linkbtn" type="button" data-mypc>My PC</button></small>`}</div>`;
  }
  function openMyPC(after){
    const pc = { ...myPC() }, det = detectPC();
    openModal(`<form class="modal pcmod" role="dialog" aria-modal="true" aria-labelledby="pc-t" id="pc-form"><span class="px">Can I run it?</span><h2 id="pc-t">My PC</h2>
      <p class="note">Saved with your shelves, so your phone knows your PC too.${det.gpu ? ` This device reports a <b>${esc(det.gpu)}</b>${det.threads ? ` and ${det.threads} processor threads` : ""}.` : ""}</p>
      <label class="field"><span class="px">Graphics card</span><input id="pc-gpu" value="${esc(pc.gpu || det.gpu || "")}" placeholder="e.g. RTX 4070, RX 6700 XT" list="pc-gpus"></label>
      <label class="field"><span class="px">Processor</span><input id="pc-cpu" value="${esc(pc.cpu || "")}" placeholder="e.g. Ryzen 5 5600X, Core i7-12700K"><small class="muted">Browsers can't read the processor's name. Windows: Settings → System → About.</small></label>
      <label class="field"><span class="px">Memory (RAM, GB)</span><input id="pc-ram" type="number" min="1" max="1024" inputmode="numeric" value="${esc(pc.ram || det.ram || "")}" placeholder="16"></label>
      <p class="note" id="pc-check"></p>
      <div class="mfoot">${det.gpu ? `<button class="btn small" type="button" data-pcdetect>Use what this device reports</button>` : ""}<div class="r"><button class="btn" type="button" data-mclose>Cancel</button><button class="btn primary" type="submit">Save</button></div></div></form>`, e => {
      if (e.target.closest("[data-pcdetect]")) { if (det.gpu) $("#pc-gpu").value = det.gpu; if (det.ram) $("#pc-ram").value = det.ram; chk(); }
    });
    const chk = () => { const g = gpuScore($("#pc-gpu").value), c = cpuScore($("#pc-cpu").value); $("#pc-check").textContent = [$("#pc-gpu").value ? (g ? "Graphics card recognised ✓" : "Graphics card not recognised yet, try the model name like “RTX 3060”") : "", $("#pc-cpu").value ? (c ? "Processor recognised ✓" : "Processor not recognised, try e.g. “Ryzen 7 5800X” or “i5-12400F”") : ""].filter(Boolean).join(" · "); };
    root.oninput = chk; modalClose = () => { root.oninput = null; }; chk();
    $("#pc-form").addEventListener("submit", e => { e.preventDefault(); nook.pc = { gpu: $("#pc-gpu").value.trim().slice(0, 60), cpu: $("#pc-cpu").value.trim().slice(0, 60), ram: Number($("#pc-ram").value) || "", threads: det.threads || nook.pc?.threads || "" }; saveNook(false); closeModal(); toast("Saved your PC"); render(); after?.(); });
  }
  async function checkRun(id, quiet){
    const g = games.find(x => x.id === id); if (!g) return null;
    try { const reqs = await fetchReqs(g); const cur = games.find(x => x.id === id); if (!cur) return null; saveGame({ ...cur, reqs }, quiet ? "" : reqs.none ? `No requirements found for ${g.title}` : `${g.title}: ${verdict(reqs)?.name || "requirements loaded"}`); return reqs; }
    catch { if (!quiet) toast(navigator.onLine ? "Couldn't reach PCGamingWiki right now." : "You're offline."); return null; }
  }
  async function checkMany(list, btn){
    let n = 0; for (const g of list) { n++; if (btn) btn.textContent = `Checking ${n} of ${list.length}…`; await checkRun(g.id, true); await new Promise(r => setTimeout(r, 600)); }
    toast(`Checked ${list.length} game${list.length === 1 ? "" : "s"} against your PC`); render();
  }
