  // ================= reading save files =================
  // Everything happens on this device; files are never uploaded.
  // Play days come from when each save file was last written. Playtime is only taken from a value the game itself
  // stored, and you always confirm which value (and unit) is right before anything changes.
  const PT_NAME = /^(?:total_?)?(?:play_?(?:ed)?_?time|time_?played|played_?time|game_?time|total_?time|play_?time_?(?:seconds|secs|minutes|mins|ms)?|seconds_?played|milliseconds_?played|minutes_?played)(?:_?(?:seconds|secs|minutes|mins|ms|total))?$/i;
  const unitOf = (name, type) => /timespan/i.test(type) ? "ticks" : /milli|_?ms$/i.test(name) ? "ms" : /minute|mins/i.test(name) ? "min" : /hour/i.test(name) ? "h" : "";
  const toHours = (v, u) => ({ ticks: v / 36e9, ms: v / 36e5, s: v / 3600, min: v / 60, h: v }[u]);
  function readGVAS(buf, file){
    const out = [], b = new Uint8Array(buf), dv = new DataView(buf), n = b.length;
    if (n < 8 || String.fromCharCode(...b.slice(0, 4)) !== "GVAS") return out;
    const str = at => { if (at + 4 > n) return null; const len = dv.getInt32(at, true); if (len <= 0 || len > 128 || at + 4 + len > n) return null; let s = ""; for (let i = 0; i < len - 1; i++) { const c = b[at + 4 + i]; if (c < 32 || c > 126) return null; s += String.fromCharCode(c); } return { s, end: at + 4 + len }; };
    for (let i = 0; i < n - 12 && out.length < 12; i++) {
      // look for a length-prefixed ASCII property name that sounds like play time
      const len = b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24); if (len < 6 || len > 40) continue;
      const nm = str(i); if (!nm || !PT_NAME.test(nm.s.replace(/[^A-Za-z_]/g, ""))) continue;
      const ty = str(nm.end); if (!ty) continue;
      let p = ty.end + 8; // skip the 64-bit size
      try {
        let v = null, type = ty.s;
        if (type === "FloatProperty") v = dv.getFloat32(p + 1, true);
        else if (type === "DoubleProperty") v = dv.getFloat64(p + 1, true);
        else if (type === "IntProperty" || type === "UInt32Property") v = type === "IntProperty" ? dv.getInt32(p + 1, true) : dv.getUint32(p + 1, true);
        else if (type === "Int64Property" || type === "UInt64Property") v = Number(dv.getBigInt64(p + 1, true));
        else if (type === "StructProperty") { const sn = str(p); if (sn && /Timespan/i.test(sn.s)) { v = Number(dv.getBigInt64(sn.end + 17, true)); type = "Timespan"; } }
        if (v != null && isFinite(v) && v > 0) out.push({ file, field: nm.s, raw: v, unit: unitOf(nm.s, type), how: "Unreal Engine save" });
      } catch {}
      i = nm.end - 1;
    }
    return out;
  }
  function readTextSave(buf, file){
    const out = [], text = new TextDecoder("latin1").decode(new Uint8Array(buf, 0, Math.min(buf.byteLength, 6e6)));
    if (/[\x00-\x08\x0E-\x1F]/.test(text.slice(0, 2000))) return out; // binary, not text
    const re = /["'<\s,{;]?((?:total_?)?(?:play_?(?:ed)?_?time|time_?played|played_?time|seconds_?played|milliseconds_?played|minutes_?played)(?:_?(?:seconds|secs|minutes|mins|ms))?)["'>\s]*[:=>]\s*["']?([0-9]+(?:\.[0-9]+)?)/gi;
    let m; while ((m = re.exec(text)) && out.length < 12) { const v = parseFloat(m[2]); if (v > 0) out.push({ file, field: m[1], raw: v, unit: unitOf(m[1], ""), how: "text save" }); }
    // Stardew Valley keeps it in milliseconds, Celeste in ticks
    const sd = text.match(/<millisecondsPlayed>(\d+)<\/millisecondsPlayed>/); if (sd) out.push({ file, field: "millisecondsPlayed", raw: +sd[1], unit: "ms", how: "Stardew Valley save" });
    const ce = /<SaveData\b/.test(text) && text.match(/<Time>(\d+)<\/Time>/); if (ce) out.push({ file, field: "Time", raw: +ce[1], unit: "ticks", how: "Celeste save" });
    return out;
  }
  // every reading of a value we can't be sure about: offer the units that give a believable number of hours
  function candidates(found){
    const seen = new Set(), list = [];
    found.forEach(f => {
      const units = f.unit ? [f.unit] : ["s", "min", "ms"];
      units.forEach(u => { const h = toHours(f.raw, u); if (!(h >= .2 && h <= 20000)) return; const k = `${f.field}|${Math.round(h * 10)}`; if (seen.has(k)) return; seen.add(k); list.push({ ...f, u, h: Math.round(h * 10) / 10, sure: !!f.unit }); });
    });
    return list.sort((a, b) => b.sure - a.sure || b.h - a.h).slice(0, 8);
  }
  async function scanSaves(files){
    const days = new Map(), found = []; let read = 0, skipped = 0;
    for (const f of [...files].slice(0, 600)) {
      if (/\.(png|jpe?g|bmp|dds|tga|mp4|webm|log|dmp|lnk|exe|dll)$/i.test(f.name)) { skipped++; continue; }
      if (f.lastModified) { const d = isoOf(new Date(f.lastModified)); days.set(d, (days.get(d) || 0) + 1); }
      if (f.size > 40e6 || read > 250e6) continue;
      try { const buf = await f.arrayBuffer(); read += buf.byteLength; found.push(...readGVAS(buf, f.webkitRelativePath || f.name), ...readTextSave(buf, f.webkitRelativePath || f.name)); } catch {}
    }
    const list = [...days.keys()].sort();
    return { days: list, files: files.length - skipped, cands: candidates(found) };
  }
  function openSaveImport(d, onApply){
    document.querySelector(".save-scrim")?.remove();
    const el = document.createElement("div"); el.className = "scrim save-scrim";
    let res = null, pick = -1, useDays = true, busy = false;
    const draw = () => {
      const R = res;
      el.innerHTML = `<div class="modal wide savemod" role="dialog" aria-modal="true" aria-labelledby="sv-t"><div class="reshead"><div><span class="px">${esc(d.title)}</span><h2 id="sv-t">Read your save files</h2></div><button class="btn small" type="button" data-svx>Cancel</button></div>
        ${!R ? `<p>Pick the game's save folder. Save Point reads it here on your device; nothing is uploaded.</p>
          <div class="chips"><label class="btn primary">Choose save folder<input type="file" id="sv-dir" webkitdirectory multiple hidden></label><label class="btn">Choose files<input type="file" id="sv-files" multiple hidden></label></div>
          ${busy ? `<p class="status"><span class="dots">Reading save files</span></p>` : ""}
          <details class="more"><summary>Where are my saves?</summary><ul class="svwhere"><li><b>Steam Cloud games:</b> <code>C:\\Program Files (x86)\\Steam\\userdata\\&lt;your id&gt;\\&lt;game number&gt;</code></li><li><b>Unreal Engine games</b> (Lies of P, Hogwarts Legacy, Expedition 33): <code>%LOCALAPPDATA%\\&lt;game&gt;\\Saved\\SaveGames</code></li><li><b>Many others:</b> <code>Documents\\My Games</code>, <code>Saved Games</code> in your user folder, or <code>%APPDATA%</code></li><li>Type the path into the folder window's address bar to jump there. <code>%LOCALAPPDATA%</code> and <code>%APPDATA%</code> work there too.</li></ul>
          <p class="note">Console saves (Switch, PlayStation) can't be read, and some PC games encrypt their saves. You'll still get play days from the file dates.</p></details>`
        : `<div class="svgrid">
            <div class="svbox"><span class="px">Play days</span>${R.days.length ? `<b>${R.days.length} day${R.days.length === 1 ? "" : "s"}</b><small>from ${fmtDate(R.days[0])} to ${fmtDate(R.days[R.days.length - 1])}, from when ${R.files} file${R.files === 1 ? " was" : "s were"} last saved</small>
              <label class="check"><input type="checkbox" id="sv-days" ${useDays ? "checked" : ""}> Add these to the game as play days</label><p class="note">Games overwrite old saves, so older days can be missing. Play days show on your activity map but don't add hours.</p>` : `<small>The files had no dates.</small>`}</div>
            <div class="svbox"><span class="px">Total playtime</span>${R.cands.length ? `<p class="note">Found inside the save. Pick the one that looks right${R.cands.some(c => !c.sure) ? ". Some saves don't say if the number is seconds or minutes, so both are shown" : ""}.</p>
              <div class="svcands">${R.cands.map((c, i) => `<label class="svc${pick === i ? " on" : ""}"><input type="radio" name="sv-c" value="${i}" ${pick === i ? "checked" : ""}><b>${fmtH(c.h)}</b><small>${esc(c.field)} = ${Math.round(c.raw).toLocaleString()} ${{ s: "seconds", min: "minutes", ms: "milliseconds", ticks: "ticks", h: "hours" }[c.u]}${c.sure ? "" : " (guess)"} · ${esc(c.how)}</small><small class="svf">${esc(c.file)}</small></label>`).join("")}
              <label class="svc${pick === -1 ? " on" : ""}"><input type="radio" name="sv-c" value="-1" ${pick === -1 ? "checked" : ""}><b>Keep ${d.hours ? fmtH(d.hours) : "hours as they are"}</b><small>Don't change the hours</small></label></div>`
              : `<p class="note">No playtime value found. The game may encrypt its saves or not store playtime. Your hours stay as they are.</p>`}</div></div>
          <div class="mfoot"><button class="btn small" type="button" data-svagain>Choose another folder</button><div class="r"><button class="btn primary" type="button" data-svok>Use this</button></div></div>`}
      </div>`;
    };
    const run = async files => { if (!files?.length) return; busy = true; draw(); res = await scanSaves(files); busy = false; pick = res.cands.findIndex(c => c.sure); draw(); };
    el.addEventListener("change", e => {
      if (e.target.id === "sv-dir" || e.target.id === "sv-files") run(e.target.files);
      if (e.target.name === "sv-c") { pick = +e.target.value; draw(); }
      if (e.target.id === "sv-days") useDays = e.target.checked;
    });
    el.addEventListener("click", e => {
      if (e.target === el || e.target.closest("[data-svx]")) { el.remove(); return; }
      if (e.target.closest("[data-svagain]")) { res = null; draw(); return; }
      if (e.target.closest("[data-svok]")) {
        const c = res.cands[pick], out = {};
        if (c) { out.hours = c.h; out.hoursFrom = { field: c.field, file: c.file, at: todayISO() }; }
        if (useDays && res.days.length) { out.saveDays = [...new Set([...(d.saveDays || []), ...res.days])].sort().slice(-730); if (!d.started) out.started = res.days[0]; }
        out.saveImport = { at: todayISO(), files: res.files };
        el.remove(); onApply(out);
      }
    });
    draw(); document.body.append(el);
  }

