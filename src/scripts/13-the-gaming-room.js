  // ================= the gaming room =================
  // Your nook as one scene, drawn to rough real-world proportions (about 2.4 units per cm): a bookcase with your real
  // shelves in the room style you picked, a desk, your PC on the floor beside it, a chair and a TV corner with your consoles.
  // The setup panel sits next to the room, so every change shows straight away. Nothing is downloaded.
  const ROOM_CONSOLES = [
    ["ps5", "PlayStation 5", "home"], ["ps4", "PlayStation 4", "home"], ["ps3", "PlayStation 3", "home"], ["ps2", "PlayStation 2", "home"], ["ps1", "PlayStation", "home"],
    ["xsx", "Xbox Series X", "home"], ["xss", "Xbox Series S", "home"], ["xone", "Xbox One", "home"], ["x360", "Xbox 360", "home"],
    ["switch2", "Switch 2", "home"], ["switch", "Switch", "home"], ["wiiu", "Wii U", "home"], ["wii", "Wii", "home"], ["gc", "GameCube", "home"], ["n64", "Nintendo 64", "home"], ["snes", "SNES", "home"], ["nes", "NES", "home"], ["md", "Mega Drive", "home"],
    ["deck", "Steam Deck", "hand"], ["ally", "ROG Ally", "hand"], ["lite", "Switch Lite", "hand"], ["3ds", "3DS", "hand"], ["ds", "Nintendo DS", "hand"], ["vita", "PS Vita", "hand"], ["psp", "PSP", "hand"], ["gba", "Game Boy Advance", "hand"], ["gb", "Game Boy", "hand"],
    ["quest3", "Meta Quest 3", "vr"], ["quest2", "Meta Quest 2", "vr"], ["psvr2", "PlayStation VR2", "vr"], ["index", "Valve Index", "vr"], ["pico4", "Pico 4", "vr"], ["avp", "Apple Vision Pro", "vr"]
  ];
  const ROOM_LIGHTS = [["rgb", "Rainbow"], ["#FF3B6B", "Red"], ["#FF7A3B", "Orange"], ["#FFC24A", "Gold"], ["#3BFFB0", "Mint"], ["#3BC8FF", "Ice blue"], ["#5B6CFF", "Blue"], ["#B04CF0", "Purple"], ["#FF6FD8", "Pink"], ["#FFFFFF", "White"]];
  const ROOM_FX = [["wave", "Wave"], ["breathe", "Breathe"], ["steady", "Steady"], ["off", "Off"]];
  const ROOM_CASES = [["tower", "Glass tower", "#15131C"], ["white", "White glass", "#ECEAF2"], ["fish", "Panoramic", "#1C1A24"], ["mini", "Small form", "#2A2638"], ["retro", "Retro beige", "#D9CDB0"]];
  const ROOM_DESKS = [["walnut", "Walnut", "#7A4E2C", "#4E3019"], ["oak", "Oak", "#C9A06E", "#9C774A"], ["white", "White", "#ECE9F1", "#C6C1D0"], ["black", "Black", "#2C2A32", "#17161B"], ["pink", "Pastel pink", "#F2B8C8", "#C98CA0"]];
  const ROOM_DESK_STYLES = [["legs", "Classic"], ["drawers", "With drawers"], ["frame", "Metal frame"]];
  const ROOM_CHAIRS = [["racer", "Racing chair"], ["office", "Office chair"], ["bean", "Bean bag"]];
  const ROOM_CHAIR_COLS = ["#B04CF0", "#E0453B", "#2F5BD3", "#2E8A3E", "#F08A4B", "#F2C230", "#FF6FD8", "#2A2830", "#ECEAF2"];
  const ROOM_MONS = [["one", "One"], ["two", "Two"], ["wide", "Ultrawide"]];
  const ROOM_WALLS = [["auto", "Room style", ""], ["#2E2246", "Night violet", "#2E2246"], ["#1F3150", "Deep blue", "#1F3150"], ["#24382E", "Forest", "#24382E"], ["#4A2430", "Wine", "#4A2430"], ["#1A1A1F", "Black", "#1A1A1F"], ["#E8DCCB", "Cream", "#E8DCCB"], ["#CFE3EE", "Sky", "#CFE3EE"]];
  const ROOM_RUGS = ["auto", "#3B2A5A", "#2A3350", "#E8A87C", "#2E8A62", "#B04CF0", "#C0394E", "#ECEAF2"];
  const ROOM_SCREENS = [["auto", "What I'm playing"], ["save", "Save Point"], ["off", "Screen off"]];
  const ROOM_POSTERS = [["sign", "My sign"], ["heart", "Save Point"], ["game", "Favourite game"], ["pixel", "Pixel sunset"], ["none", "No poster"]];
  const ROOM_BUDDY = [["bean", "Bean bag by the TV"], ["shelf", "On the wall shelf"], ["desk", "On the desk"], ["off", "Not in the room"]];
  const roomSet = () => { const s = nook.setup || {}, pick = (v, list, d) => list.some(x => (Array.isArray(x) ? x[0] : x) === v) ? v : d;
    return { pc: s.pc !== false, case: pick(s.case, ROOM_CASES, "tower"), light: pick(s.light, ROOM_LIGHTS, "rgb"), fx: pick(s.fx, ROOM_FX, "wave"), desk: pick(s.desk, ROOM_DESKS, "walnut"), deskStyle: pick(s.deskStyle, ROOM_DESK_STYLES, "legs"),
      chair: pick(s.chair, ROOM_CHAIRS, "racer"), chairCol: pick(s.chairCol, ROOM_CHAIR_COLS, "#B04CF0"), mons: pick(s.mons === 2 ? "two" : s.mons, ROOM_MONS, "one"), wall: pick(s.wall, ROOM_WALLS, "auto"), rug: pick(s.rug, ROOM_RUGS, "auto"), screen: s.screen === "save" || s.screen === "off" ? s.screen : "auto",
      plant: s.plant !== false, lamp: s.lamp !== false, speakers: !!s.speakers, poster: pick(s.poster, ROOM_POSTERS, "sign"), buddy: pick(s.buddy === "rug" ? "bean" : s.buddy, ROOM_BUDDY, "bean"), consoles: Array.isArray(s.consoles) ? s.consoles.filter(id => ROOM_CONSOLES.some(c => c[0] === id)) : [] }; };
  const roomOn = () => true; // the room is always one tap away; only which view opens first is a choice
  // an <image> in the room that fails tries the next picture in its list (Steam's newer games use different addresses)
  window.rmImgErr = el => { const l = (el.dataset.fb || "").split("|").filter(Boolean); if (!l.length) { el.remove(); return; } el.setAttribute("href", l.shift()); el.dataset.fb = l.join("|"); };
  const rmImg = (list, attrs) => list.length ? `<image href="${esc(list[0])}" data-fb="${esc(list.slice(1).join("|"))}" onerror="rmImgErr(this)" ${attrs}/>` : "";
  let roomOpen = settings.roomDefault !== "room"; // true: the full shelves show; the room is one tap away
  const ROOM_SCENE = {
    cozy: { w1: "#2E2246", w2: "#1B1430", f1: "#4A3324", f2: "#2A1A10", fr: "#5A3820", in: "#2D1C0F", bd: "#A86F3C", ink: "#E8DDF5", rug: "#3B2A5A", base: "#3A2616" },
    loft: { w1: "#F7EFE0", w2: "#E8D7BC", f1: "#D9B98E", f2: "#B8946A", fr: "#C49E6E", in: "#E8D2B0", bd: "#D2AE7E", ink: "#4A3A28", rug: "#E8A87C", base: "#F2E6D2" },
    case: { w1: "#1C2436", w2: "#111624", f1: "#262A36", f2: "#14161E", fr: "#9AA3B5", in: "#0E1220", bd: "#C9CED8", ink: "#E3E8F5", rug: "#2A3350", base: "#2A3040" },
    cyber: { w1: "#160A33", w2: "#0A0518", f1: "#140B2C", f2: "#07040F", fr: "#2B1660", in: "#0B0620", bd: "#00E5FF", ink: "#E8F7FF", rug: "#2A1060", base: "#2B1660" },
    rack: { w1: "#1E2430", w2: "#141821", f1: "#1D212C", f2: "#10131A", fr: "#3A4152", in: "#121620", bd: "#6B7484", ink: "#DDE3EE", rug: "#283044", base: "#2A3040" }
  };
  const lightFill = L => L === "rgb" ? "url(#rmRGB)" : L;
  const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16), c = [n >> 16, n >> 8 & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)))); return "#" + c.map(v => v.toString(16).padStart(2, "0")).join(""); };
  const isLight = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * .3 + (n >> 8 & 255) * .59 + (n & 255) * .11) > 150; };
  // the PC, about 46 cm tall: drawn with its glass side towards you
  function roomPC(S, x, y, labels){
    const C = ROOM_CASES.find(c => c[0] === S.case) || ROOM_CASES[0], on = S.fx !== "off", L = on ? lightFill(S.light) : "#3A3550", pc = myPC();
    const mini = S.case === "mini", w = mini ? 80 : 112, h = mini ? 88 : 118, X = x + (112 - w) / 2, Y = y - h, white = S.case === "white", body = C[2];
    const inner = white ? "#E4E1EB" : S.case === "retro" ? "#C8BB9C" : "#0B0A12", board = white ? "#CFCBD8" : "#17151F", glow = S.light === "rgb" ? "#B04CF0" : S.light;
    const fan = (fx, fy, r) => `<g><circle cx="${fx}" cy="${fy}" r="${r}" fill="${white ? "#D6D2DE" : "#121019"}"/><circle cx="${fx}" cy="${fy}" r="${r - 1}" fill="none" stroke="${L}" stroke-width="1.4" class="rm-light" opacity=".9"/>${[0, 90, 180, 270].map(d => `<path d="M${fx} ${fy} q${r * .55} -${r * .25} ${r * .7} ${r * .25}" fill="${white ? "#BDB8C8" : "#2A2734"}" transform="rotate(${d} ${fx} ${fy})"/>`).join("")}<circle cx="${fx}" cy="${fy}" r="${r * .28}" fill="${white ? "#EEE" : "#24212E"}"/></g>`;
    let g = `<g class="rm-pc" data-room="pc" role="button" tabindex="0" aria-label="Your PC${[pc.gpu, pc.cpu].some(Boolean) ? ": " + esc([pc.gpu, pc.cpu, pc.ram && pc.ram + " GB RAM"].filter(Boolean).join(", ")) : ""}. Tap to see how well it runs your games">`;
    g += `<ellipse cx="${X + w / 2}" cy="${y + 2}" rx="${w * .62}" ry="6" fill="#000" opacity=".35"/>`;
    if (on) g += `<ellipse class="rm-glow" cx="${X + w / 2}" cy="${Y + h * .55}" rx="${w * .9}" ry="${h * .65}" fill="${glow}" opacity=".16" filter="url(#rmBlur)"/>`;
    if (S.case === "retro") {
      g += `<rect x="${X}" y="${Y}" width="${w}" height="${h}" rx="4" fill="${body}" stroke="#A89A7A" stroke-width="2"/><rect x="${X + 10}" y="${Y + 10}" width="${w - 20}" height="14" rx="1.5" fill="#BEB192"/><rect x="${X + 10}" y="${Y + 30}" width="${w - 20}" height="14" rx="1.5" fill="#BEB192"/><rect x="${X + 16}" y="${Y + 15}" width="28" height="3" fill="#6E6450"/>
        <rect x="${X + 10}" y="${Y + h - 18}" width="8" height="4" fill="${on ? L : "#3a3"}" class="rm-light"/><circle cx="${X + w - 16}" cy="${Y + h - 16}" r="6" fill="#BEB192" stroke="#8E8268"/>${[0, 1, 2, 3].map(i => `<rect x="${X + 30}" y="${Y + 58 + i * 7}" width="${w - 40}" height="2" fill="#B5A884"/>`).join("")}`;
    } else {
      const fish = S.case === "fish";
      g += `<rect x="${X}" y="${Y}" width="${w}" height="${h}" rx="5" fill="${body}" stroke="${white ? "#BDB8C8" : "#2E2A3E"}" stroke-width="2"/><rect x="${X + 6}" y="${y - 3}" width="10" height="4" rx="1" fill="#000" opacity=".5"/><rect x="${X + w - 16}" y="${y - 3}" width="10" height="4" rx="1" fill="#000" opacity=".5"/>`;
      const ix = X + 5, iy = Y + 5, iw = w - (fish ? 10 : 24), ih = h - 12;
      g += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="3" fill="${inner}"/>`;
      g += `<rect x="${ix + 5}" y="${iy + 5}" width="${iw * .66}" height="${ih * .58}" rx="2" fill="${board}"/><rect x="${ix + 9}" y="${iy + 9}" width="${iw * .2}" height="3" fill="#000" opacity=".25"/>`; // motherboard
      const px = ix + 10 + iw * .12, py = iy + 12 + ih * .1, ps = mini ? 14 : 18;
      g += `<rect x="${px}" y="${py}" width="${ps}" height="${ps}" rx="4" fill="${white ? "#F4F2F8" : "#1F1C2A"}" stroke="${white ? "#C9C5D2" : "#34304A"}"/><circle cx="${px + ps / 2}" cy="${py + ps / 2}" r="${ps * .3}" fill="${L}" class="rm-light" opacity=".95"/>`; // AIO pump
      g += [0, 1].map(i => `<rect x="${px + ps + 8 + i * 6}" y="${iy + 8}" width="4" height="${ih * .32}" rx="1" fill="${white ? "#F4F2F8" : "#2A2638"}"/><rect x="${px + ps + 8 + i * 6}" y="${iy + 8}" width="4" height="4" rx="1" fill="${L}" class="rm-light"/>`).join(""); // RAM
      const gy = iy + ih * .6, gh = mini ? 13 : 16;
      g += `<rect x="${ix + 4}" y="${gy}" width="${iw * .8}" height="${gh}" rx="2" fill="${white ? "#F4F2F8" : "#25222F"}" stroke="${white ? "#C9C5D2" : "#3A364C"}" stroke-width=".8"/><rect x="${ix + 8}" y="${gy + gh - 4}" width="${iw * .8 - 8}" height="1.5" fill="${L}" class="rm-light"/><text x="${ix + 10}" y="${gy + gh * .62}" font-size="${mini ? 4.5 : 5.5}" font-weight="900" fill="${white ? "#8A8698" : "#8E8AA4"}" letter-spacing=".5">${esc(((pc.gpu || "GEFORCE").match(/rtx|gtx|rx|arc/i)?.[0] || "GPU").toUpperCase())}</text>`; // GPU
      g += `<rect x="${ix}" y="${iy + ih - 20}" width="${iw}" height="20" rx="2" fill="${white ? "#D6D2DE" : "#14121B"}"/><rect x="${ix + 6}" y="${iy + ih - 13}" width="${iw * .35}" height="2" rx="1" fill="#fff" opacity=".12"/>`; // PSU shroud
      if (fish) g += fan(ix + iw * .25, iy + ih - 10, 7) + fan(ix + iw * .5, iy + ih - 10, 7) + fan(ix + iw * .75, iy + ih - 10, 7);
      else { g += `<rect x="${X + w - 18}" y="${Y + 4}" width="14" height="${h - 12}" rx="3" fill="${white ? "#DCD8E4" : "#121019"}"/>`; [0, 1, 2].slice(0, mini ? 2 : 3).forEach(i => g += fan(X + w - 11, Y + 20 + i * 33, 6)); }
      g += `<rect x="${X + w - (fish ? 3 : 3)}" y="${Y + 8}" width="1.6" height="${h - 20}" rx=".8" fill="${L}" class="rm-light" opacity="${on ? .9 : 0}"/>`;
      g += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="3" fill="url(#rmGlass)"/><path d="M${ix + 8} ${iy + 2} l${iw * .34} 0 l-${iw * .26} ${ih - 4} h-${iw * .1}z" fill="#fff" opacity=".045"/>`;
    }
    g += `</g>`;
    if (labels) {
      const tags = [pc.gpu, pc.cpu, pc.ram ? `${pc.ram} GB RAM` : ""].filter(Boolean), col = S.light === "rgb" ? "#FFD27A" : S.light;
      tags.forEach((t0, i) => { const t = t0.length > 18 ? t0.slice(0, 17) + "…" : t0, tw = 16 + t.length * 6.4, lx = X + w / 2 - tw / 2, ly = Y - 30 - (tags.length - 1 - i) * 24;
        g += `<g class="rm-lbl"><rect x="${lx}" y="${ly}" width="${tw}" height="19" rx="9.5" fill="#15102E" fill-opacity=".9" stroke="${col}" stroke-opacity=".7"/><text x="${lx + tw / 2}" y="${ly + 13}" fill="#fff" font-size="10.5" font-weight="700" text-anchor="middle">${esc(t)}</text></g>`; });
      if (tags.length) g += `<line class="rm-lbl" x1="${X + w / 2}" y1="${Y - 11}" x2="${X + w / 2}" y2="${Y}" stroke="${col}" stroke-width="1.2" stroke-opacity=".6"/>`;
    }
    return g;
  }
  // consoles at real-ish size, each sitting on a baseline at (x, y)
  function roomConsole(id, x, y){
    const R = (a, b, w, h, f, r = 2, xtra = "") => `<rect x="${x + a}" y="${y - b - h}" width="${w}" height="${h}" rx="${r}" fill="${f}" ${xtra}/>`;
    switch (id) {
      case "ps5": return `<path d="M${x} ${y} q5 -60 12 -66 h18 q8 5 9 66z" fill="#F2F2F5"/>${R(12, 0, 17, 62, "#15151A", 0)}<rect x="${x + 13}" y="${y - 58}" width="2" height="54" fill="#3B6FE0" opacity=".7"/>`;
      case "ps4": return R(0, 0, 66, 12, "#1A1A20", 2) + R(4, 5, 58, 1.5, "#3BC8FF", 1);
      case "ps3": return R(0, 0, 62, 14, "#111", 6) + R(6, 6, 50, 1.5, "#444", 1);
      case "ps2": return R(0, 0, 62, 12, "#1E1E26", 2) + R(46, 3, 9, 3, "#3B6FE0", 1);
      case "ps1": return R(0, 0, 56, 12, "#B8B8B8", 3) + `<circle cx="${x + 18}" cy="${y - 8}" r="5" fill="#999"/>`;
      case "xsx": return R(0, 0, 30, 60, "#121214", 3) + `<circle cx="${x + 15}" cy="${y - 54}" r="8" fill="#1F1F22" stroke="#2E8A3E" stroke-width="2"/>`;
      case "xss": return R(0, 0, 22, 52, "#EDEDF0", 3) + `<circle cx="${x + 11}" cy="${y - 41}" r="6" fill="#111"/>`;
      case "xone": return R(0, 0, 68, 12, "#16161A", 2) + R(0, 0, 26, 12, "#2A2A30", 2);
      case "x360": return R(0, 0, 60, 13, "#EEE", 5) + `<circle cx="${x + 51}" cy="${y - 6}" r="3" fill="#3BAA4B"/>`;
      case "switch": case "switch2": return R(0, 0, 44, 28, "#2A2A2E", 3) + R(-4, 8, 8, 24, id === "switch2" ? "#3A3A40" : "#E0453B", 3) + R(40, 8, 8, 24, id === "switch2" ? "#3A3A40" : "#3BA0E0", 3) + R(4, 8, 36, 20, "#111", 1.5);
      case "wiiu": return R(0, 0, 52, 13, "#F2F2F5", 5);
      case "wii": return R(0, 0, 13, 46, "#F4F4F6", 3) + R(3, 38, 7, 1.5, "#3BC8FF", 1);
      case "gc": return R(0, 0, 36, 32, "#5B4FA8", 5) + `<circle cx="${x + 18}" cy="${y - 21}" r="8" fill="#4A3F90"/>`;
      case "n64": return `<path d="M${x} ${y} h64 l-5 -14 h-19 l-3 -8 h-10 l-3 8 h-19z" fill="#3A3A42"/>`;
      case "snes": return R(0, 0, 58, 14, "#C9C9CF", 3) + R(10, 14, 36, 5, "#8E8AA8", 2) + R(4, 4, 6, 3, "#6B5BD0", 1) + R(12, 4, 6, 3, "#A79DE0", 1);
      case "nes": return R(0, 0, 60, 16, "#C7C7C7", 1) + R(0, 0, 60, 6, "#3A3A3A", 0);
      case "md": return R(0, 0, 56, 13, "#16161A", 6) + `<circle cx="${x + 28}" cy="${y - 10}" r="8" fill="#222" stroke="#C0394E"/>`;
      case "deck": return R(0, 0, 50, 5, "#1C1C22", 3) + R(14, 1, 22, 3, "#5BC8FF", 1);
      case "ally": return R(0, 0, 46, 5, "#ECECF0", 3) + R(12, 1, 22, 3, "#5BC8FF", 1);
      case "lite": return R(0, 0, 36, 5, "#F2C230", 3) + R(10, 1, 16, 3, "#111", 1);
      case "3ds": case "ds": return R(0, 0, 26, 7, id === "3ds" ? "#3B6FE0" : "#2A2A2E", 3);
      case "vita": case "psp": return R(0, 0, 38, 5, "#15151A", 3) + R(10, 1, 18, 3, "#3B6FE0", 1);
      case "gba": return R(0, 0, 32, 6, "#5B4FA8", 3) + R(10, 1, 12, 4, "#9FD08A", 1);
      case "gb": return R(0, 0, 18, 28, "#C9C9C0", 3) + R(3, 15, 12, 9, "#8BAC0F", 1);
      default: return R(0, 0, 44, 12, "#333", 3);
    }
  }
  // the bookcase: your shelves in miniature, built like the room style you picked
  function roomCase(P){
    const vis = (nook.view && nook.view !== "shelves" ? virtualShelves() : nook.shelves.filter(s => !s.hidden)).slice(0, 5), rows = Math.max(3, vis.length);
    const x = 40, y = 150, w = 300, h = 430, rh = (h - 30) / rows, spineSt = nook.spines || "art", tint = (FINISHES.find(f => f[0] === (nook.finish || "natural")) || FINISHES[0])[2], sc = nook.scene;
    let imgLeft = 150;
    let g = `<g class="rm-case" data-room="shelves" role="button" tabindex="0" aria-label="Open your shelves"><ellipse cx="${x + w / 2}" cy="${y + h + 2}" rx="${w * .55}" ry="7" fill="#000" opacity=".35"/>`;
    if (sc === "cyber") g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${P.in}" stroke="#00E5FF" stroke-width="2.5" filter="url(#rmNeon)"/>`;
    else if (sc === "case") g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#2A3040" stroke="#C9CED8" stroke-width="5"/><rect x="${x + 9}" y="${y + 9}" width="${w - 18}" height="${h - 18}" fill="${P.in}"/><rect x="${x + 9}" y="${y + 9}" width="${w - 18}" height="4" fill="#E8F1FF" opacity=".7"/>`;
    else if (sc === "rack") g += `<rect x="${x + 4}" y="${y}" width="8" height="${h}" rx="3" fill="#7A8396"/><rect x="${x + w - 12}" y="${y}" width="8" height="${h}" rx="3" fill="#7A8396"/><rect x="${x + 14}" y="${y}" width="${w - 28}" height="${h}" fill="${P.in}" opacity=".75"/>`;
    else g += `<rect x="${x - 6}" y="${y - 10}" width="${w + 12}" height="14" rx="3" fill="${shade(P.fr, .12)}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${P.fr}"/><rect x="${x + 10}" y="${y + 8}" width="${w - 20}" height="${h - 18}" fill="${P.in}"/><rect x="${x + 10}" y="${y + 8}" width="${w - 20}" height="${h - 18}" fill="url(#rmBoards)" opacity="${sc === "loft" ? .5 : .9}"/><rect x="${x + 10}" y="${y + 8}" width="${w - 20}" height="${h - 18}" fill="url(#rmShade)"/>`;
    if (tint) g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${tint}" opacity=".75"/>`;
    for (let r = 0; r < rows; r++) {
      const sh = vis[r], by = y + 12 + rh * (r + 1) - 6, full = sh ? shelfGames(sh) : [], list = full.slice(0, 60);
      let sx = x + 18; const lim = x + w - 18;
      // even, uniform cases, drawn like your real shelves: Cover art spines show the art darkened, the others a solid colour,
      // and the logo always keeps its own colours
      const sh2 = Math.min(rh - 18, rh * .78), sw = 13, dusty = sh && sh.kind === "status" && sh.status === "dropped";
      // trinkets on this shelf: the ones you dropped between games sit there, the rest stand at the end
      const tks = sh && sh.kind !== "virtual" ? decoOf(sh).filter(id => TRINKET.has(id) && id !== "lights" && TRINKET.get(id)[2] !== "wall") : [], at = sh?.decoAt || {}, shown = new Set(list.map(gm => gm.id));
      const rmTk = id => { const T = TRINKET.get(id), th = Math.min(sh2 * .82, T[4] * .55), tw = T[3] * th / T[4]; if (sx + tw > lim) return; g += `<svg x="${sx}" y="${by - th}" width="${tw}" height="${th}" viewBox="0 0 ${T[3]} ${T[4]}" aria-hidden="true">${T[5]}</svg>`; sx += tw + 2; };
      if (dusty) g += `<g filter="url(#rmDust)">`;
      tks.filter(id => at[id] === "").forEach(rmTk);
      list.forEach(gm => {
        if (sx + sw > lim) return;
        const fam = platFamily(mainPlat(gm)), art = spineSt === "art", body = spineSt === "dark" ? "#141519" : spineSt === "light" ? "#ECE8E0" : `var(--c${hashNum(norm(gm.title), 8) + 1})`;
        const pics = imgLeft-- > 0, logo = pics ? logoChain(gm) : [], cov = pics && art ? coverChain(gm) : [], cx = sx + sw / 2, cy = by - sh2 / 2 + 3, lw = sh2 - 16, lh = sw - 3;
        g += `<rect x="${sx}" y="${by - sh2}" width="${sw}" height="${sh2}" rx="1.2" style="fill:${body}"/>`;
        if (cov.length) g += rmImg(cov, `x="${sx}" y="${by - sh2 + 6}" width="${sw}" height="${sh2 - 6}" preserveAspectRatio="xMidYMid slice" filter="url(#rmDim)"`);
        g += `<rect x="${sx}" y="${by - sh2}" width="${sw}" height="6" rx="1" style="fill:var(--p-${fam})"/><rect x="${sx}" y="${by - sh2 + 6}" width="${sw}" height=".8" fill="#000" opacity=".35"/>`;
        if (logo.length) g += rmImg(logo, `x="${-lw / 2}" y="${-lh / 2}" width="${lw}" height="${lh}" preserveAspectRatio="xMidYMid meet" transform="translate(${cx} ${cy}) rotate(-90)"`);
        else g += `<rect x="${cx - 1.2}" y="${cy - sh2 * .28}" width="2.4" height="${sh2 * .56}" rx="1.2" fill="${spineSt === "light" ? "#000" : "#fff"}" opacity=".18"/>`;
        g += `<rect x="${sx}" y="${by - sh2}" width="${sw}" height="${sh2}" rx="1.2" fill="url(#rmSpine)"/>` + (sc === "cyber" ? `<rect x="${sx}" y="${by - sh2}" width="${sw}" height="${sh2}" rx="1.2" fill="none" stroke="#00E5FF" stroke-opacity=".28"/>` : "");
        sx += sw + 1;
        tks.filter(id => at[id] === gm.id).forEach(rmTk);
      });
      tks.filter(id => !Object.hasOwn(at, id) || (at[id] !== "" && !shown.has(at[id]))).forEach(id => { sx = Math.max(sx, lim - 70); rmTk(id); });
      if (dusty) g += `</g><g opacity=".55" stroke="#E8E4F0" stroke-width=".7" fill="none"><path d="M${x + 12} ${by - rh + 18} q18 4 30 22 M${x + 12} ${by - rh + 18} q8 14 4 34 M${x + 12} ${by - rh + 18} l28 26 M${x + 22} ${by - rh + 20} q-4 8 -8 9 M${x + 30} ${by - rh + 24} q-8 10 -16 12 M${x + 36} ${by - rh + 32} q-10 8 -22 8"/><path d="M${x + w - 12} ${by - rh + 18} q-18 4 -30 22 M${x + w - 12} ${by - rh + 18} l-24 24 M${x + w - 22} ${by - rh + 20} q4 8 8 9 M${x + w - 30} ${by - rh + 26} q8 9 16 10"/><line x1="${x + w - 50}" y1="${by - rh + 18}" x2="${x + w - 50}" y2="${by - rh + 46}"/></g><circle cx="${x + w - 50}" cy="${by - rh + 49}" r="3" fill="#2A2630"/>`;
      if (list.length) g += `<rect x="${x + 14}" y="${by - 4}" width="${w - 28}" height="4" fill="#000" opacity=".25"/>`;
      if (!list.length) for (let k = 0; k < 4; k++) g += `<rect x="${x + 22 + k * 13}" y="${by - 50}" width="11" height="50" rx="1.5" fill="#fff" opacity=".06"/>`;
      if (sc === "cyber") g += `<rect x="${x + 6}" y="${by}" width="${w - 12}" height="4" rx="2" fill="#00E5FF" filter="url(#rmNeon)"/>`;
      else if (sc === "case") g += `<rect x="${x + 9}" y="${by}" width="${w - 18}" height="6" fill="#C9CED8" opacity=".55"/><rect x="${x + 9}" y="${by - rh + 20}" width="${w - 18}" height="2" style="fill:${sh ? (sh.kind === "virtual" ? sh.color : shelfColor(sh, r)) : "#9AA3B5"}" opacity=".7"/>`;
      else if (sc === "rack") g += `<rect x="${x + 4}" y="${by}" width="${w - 8}" height="6" rx="2" fill="#7A8396"/><rect x="${x + 14}" y="${by + 6}" width="${w - 28}" height="2" style="fill:${sh ? (sh.kind === "virtual" ? sh.color : shelfColor(sh, r)) : "#9AA3B5"}"/>`;
      else g += `<rect x="${x + 4}" y="${by}" width="${w - 8}" height="11" fill="${P.bd}"/><rect x="${x + 4}" y="${by}" width="${w - 8}" height="2" fill="#fff" opacity=".28"/><rect x="${x + 4}" y="${by + 9}" width="${w - 8}" height="2" fill="#000" opacity=".25"/>`;
      if (sh) { const nm = `${sh.name}`.slice(0, 16), pw = 22 + nm.length * 6 + 14, px = x + 14, py = by + (sc === "cyber" ? 6 : sc === "case" || sc === "rack" ? 8 : 1.5), neon = sc === "cyber" || sc === "case", col = sh.kind === "virtual" ? sh.color : shelfColor(sh, r);
        g += neon ? `<rect x="${px}" y="${py}" width="${pw}" height="14" rx="7" fill="#0B0A18" stroke="${col}" stroke-width="1.3"/><text x="${px + 8}" y="${py + 10.5}" fill="#fff" font-size="9" font-weight="800">${esc(nm)} <tspan fill="${col}">${full.length}</tspan></text>`
          : sc === "rack" ? "" : `<rect x="${px}" y="${py}" width="${pw}" height="8.5" rx="1.5" fill="${sc === "loft" ? "#FFF8EA" : "#E2BC62"}" stroke="${sc === "loft" ? "#C49E6E" : "#8A6A22"}" stroke-width=".7"/><text x="${px + 6}" y="${py + 7}" fill="${sc === "loft" ? "#4A3A28" : "#3A2A0E"}" font-size="7" font-weight="800">${esc(nm)} ${full.length}</text>`; }
    }
    if (sc === "case") g += `<rect x="${x + 9}" y="${y + 9}" width="${w - 18}" height="${h - 18}" fill="url(#rmGlass)"/>`;
    return g + `</g>`;
  }
  // what's on the monitor: the game you're playing (or played last), shown wide with its art blurred behind it
  function roomScreenGame(){
    const pl = games.filter(g => g.status === "playing").sort((a, b) => lastPlayed(b).localeCompare(lastPlayed(a)))[0]
      || games.filter(g => !UNPLAYED.has(g.status)).sort((a, b) => (lastPlayed(b) || b.finished || "").localeCompare(lastPlayed(a) || a.finished || ""))[0];
    if (!pl) return null;
    const wide = pl.steamAppId ? steamHeader(pl.steamAppId) : "", tall = coverChain(pl).filter(u => u !== wide);
    return { g: pl, wide, tall: tall[0] || "", more: tall.slice(1), now: pl.status === "playing" };
  }
  function roomMonitor(S, x, y, w, h, main, G){
    const id = "rmScr" + (main ? "A" : "B") + Math.round(x);
    let s = `<clipPath id="${id}"><rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" rx="2"/></clipPath>`;
    if (S.fx !== "off") s += `<rect x="${x - 10}" y="${y - 8}" width="${w + 20}" height="${h + 16}" rx="20" fill="${S.light === "rgb" ? "#5BC8FF" : S.light}" opacity=".22" filter="url(#rmBlur)" class="rm-light"/>`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#0E0E12"/><rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" rx="2" fill="${S.screen === "off" ? "#06060A" : "#152040"}"/>`;
    if (S.screen === "off") s += `<path d="M${x + 10} ${y + 8} l${w * .3} 0 l-${w * .2} ${h - 16} h-${w * .08}z" fill="#fff" opacity=".04"/>`;
    else if (main && S.screen === "auto" && G && (G.wide || G.tall)) {
      // the cover sits centred over a blurred copy of itself; Steam's wide art goes on top when the game has it
      const covers = [G.tall, ...(G.more || [])].filter(Boolean);
      if (covers.length) s += rmImg(covers, `x="${x - 20}" y="${y - 40}" width="${w + 40}" height="${h + 80}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})" filter="url(#rmSoft)" opacity=".6"`) + rmImg(covers, `x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" preserveAspectRatio="xMidYMid meet" clip-path="url(#${id})"`);
      if (G.wide) s += rmImg([G.wide], `x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"`);
      s += `<rect x="${x + 5}" y="${y + h - 21}" width="${w - 10}" height="16" fill="rgba(0,0,0,.55)" clip-path="url(#${id})"/><circle cx="${x + 13}" cy="${y + h - 13}" r="3" fill="${G.now ? "#3BFF8A" : "#9AA3B5"}"/><text x="${x + 20}" y="${y + h - 9.5}" fill="#fff" font-size="9.5" font-weight="700">${esc(G.g.title.slice(0, Math.floor((w - 70) / 5.4)))}</text>${G.now && launchKind(G.g) ? `<rect x="${x + w - 44}" y="${y + h - 19}" width="36" height="12" rx="6" fill="#3BFF8A"/><text x="${x + w - 26}" y="${y + h - 10}" fill="#0A2A14" font-size="8" font-weight="900" text-anchor="middle">▶ PLAY</text>` : ""}`;
    } else if (main && S.screen === "auto" && G) s += `<text x="${x + w / 2}" y="${y + h / 2 + 4}" fill="#fff" font-size="13" font-weight="800" text-anchor="middle">${esc(G.g.title.slice(0, 22))}</text>`;
    else { const cw = (w - 30) / 4; s += [0, 1, 2, 3].map(i => `<rect x="${x + 10 + i * (cw + 3)}" y="${y + 12}" width="${cw}" height="${h * .5}" rx="2" fill="${["#C0394E", "#3B60B0", "#2F8A72", "#8E5AA8"][i]}"/>`).join("") + `<rect x="${x + 10}" y="${y + h * .5 + 18}" width="${w * .5}" height="5" rx="2.5" fill="#5BC08A"/>`; }
    s += `<rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${(h - 10) * .45}" fill="#fff" opacity=".03"/>`;
    return s;
  }
  function roomChair(S, x, floor){
    const c = S.chairCol, d = shade(c, -.35), l = shade(c, .25), base = "#1C1A22";
    if (S.chair === "bean") return `<g class="rm-chair" data-room="desk"><ellipse cx="${x + 60}" cy="${floor - 2}" rx="70" ry="9" fill="#000" opacity=".3"/><path d="M${x} ${floor - 4} q-6 -62 40 -78 q40 -14 70 18 q24 28 14 60 z" fill="${c}"/><path d="M${x + 22} ${floor - 30} q20 -26 60 -18" stroke="${d}" stroke-width="5" fill="none" opacity=".6"/><path d="M${x + 18} ${floor - 70} q20 -14 50 -12" stroke="${l}" stroke-width="6" fill="none" opacity=".5"/></g>`;
    const seatY = floor - 100, top = S.chair === "office" ? floor - 214 : floor - 226;
    let s = `<g class="rm-chair" data-room="desk"><ellipse cx="${x + 70}" cy="${floor - 1}" rx="78" ry="8" fill="#000" opacity=".35"/>`;
    s += `<path d="M${x + 6} ${floor - 6} l64 -18 64 18" stroke="${base}" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="${x + 6}" cy="${floor - 4}" r="5" fill="#111"/><circle cx="${x + 134}" cy="${floor - 4}" r="5" fill="#111"/><circle cx="${x + 70}" cy="${floor - 4}" r="5" fill="#111"/>`;
    s += `<rect x="${x + 64}" y="${seatY + 20}" width="12" height="${floor - seatY - 42}" fill="#2A2830"/><rect x="${x + 60}" y="${seatY + 18}" width="20" height="14" rx="3" fill="${base}"/>`;
    if (S.chair === "office") s += `<rect x="${x + 22}" y="${top}" width="96" height="${seatY - top - 4}" rx="30" fill="${base}"/><rect x="${x + 28}" y="${top + 6}" width="84" height="${seatY - top - 16}" rx="26" fill="${c}" opacity=".9"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<line x1="${x + 34 + i * 12}" y1="${top + 12}" x2="${x + 34 + i * 12}" y2="${seatY - 14}" stroke="${d}" stroke-opacity=".45"/>`).join("")}`;
    else s += `<path d="M${x + 20} ${seatY} l-6 -${seatY - top - 50} q4 -50 56 -50 q52 0 56 50 l-6 ${seatY - top - 50}z" fill="${c}"/><path d="M${x + 34} ${seatY - 6} l-4 -${seatY - top - 64} q4 -36 40 -36 q36 0 40 36 l-4 ${seatY - top - 64}z" fill="${d}"/><path d="M${x + 52} ${top + 30} h36 v20 h-36z" fill="${l}" opacity=".85" rx="4"/><path d="M${x + 14} ${top + 50} q-2 -22 14 -34 M${x + 126} ${top + 50} q2 -22 -14 -34" stroke="${l}" stroke-width="5" fill="none"/>`;
    s += `<rect x="${x + 10}" y="${seatY}" width="120" height="22" rx="9" fill="${S.chair === "office" ? base : c}"/><rect x="${x + 16}" y="${seatY + 2}" width="108" height="6" rx="3" fill="#fff" opacity=".14"/>`;
    s += `<rect x="${x + 2}" y="${seatY - 28}" width="10" height="34" rx="3" fill="${base}"/><rect x="${x + 128}" y="${seatY - 28}" width="10" height="34" rx="3" fill="${base}"/><rect x="${x - 4}" y="${seatY - 32}" width="22" height="7" rx="3" fill="#2A2830"/><rect x="${x + 122}" y="${seatY - 32}" width="22" height="7" rx="3" fill="#2A2830"/>`;
    return s + `</g>`;
  }
  function roomSVG(){
    const S = roomSet(), sc = ROOM_SCENE[nook.scene] ? nook.scene : "cozy", P0 = ROOM_SCENE[sc], D = ROOM_DESKS.find(d => d[0] === S.desk) || ROOM_DESKS[0];
    const P = { ...P0 }; if (S.wall !== "auto") { P.w1 = shade(S.wall, .08); P.w2 = shade(S.wall, -.25); P.ink = isLight(S.wall) ? "#3A2E22" : "#EDE6F7"; }
    const rug = S.rug === "auto" ? P.rug : S.rug, L = lightFill(S.light), on = S.fx !== "off", lightWall = isLight(P.w1);
    const cons = S.consoles.map(id => ROOM_CONSOLES.find(c => c[0] === id)), home = cons.filter(c => c[2] === "home"), hand = cons.filter(c => c[2] === "hand");
    const G = roomScreenGame(), tv = home.length > 0 || hand.length > 1 || !S.pc, W = tv ? 1420 : 1080, F = 580, deskTop = 396, sign = nook.sign?.text || "";
    let s = `<svg class="rm-svg fx-${S.fx}${S.light === "rgb" ? " rgb" : ""}" viewBox="0 0 ${W} 720" role="group" aria-label="Your gaming room" preserveAspectRatio="xMidYMid meet" font-family="Inter,system-ui,sans-serif">
      <defs><linearGradient id="rmWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.w1}"/><stop offset="1" stop-color="${P.w2}"/></linearGradient>
      <linearGradient id="rmFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.f1}"/><stop offset="1" stop-color="${P.f2}"/></linearGradient>
      <linearGradient id="rmDesk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(D[2], .12)}"/><stop offset=".3" stop-color="${D[2]}"/><stop offset="1" stop-color="${D[3]}"/></linearGradient>
      <linearGradient id="rmRGB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF3B8A"/><stop offset=".35" stop-color="#B04CF0"/><stop offset=".7" stop-color="#3BC8FF"/><stop offset="1" stop-color="#3BFFB0"/></linearGradient>
      <linearGradient id="rmGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(170,210,255,.16)"/><stop offset=".5" stop-color="rgba(170,210,255,.02)"/><stop offset="1" stop-color="rgba(170,210,255,.1)"/></linearGradient>
      <linearGradient id="rmShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(0,0,0,.35)"/><stop offset=".3" stop-color="rgba(0,0,0,0)"/></linearGradient>
      <linearGradient id="rmSpine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgba(255,255,255,.18)"/><stop offset=".25" stop-color="rgba(255,255,255,0)"/><stop offset=".8" stop-color="rgba(0,0,0,.05)"/><stop offset="1" stop-color="rgba(0,0,0,.35)"/></linearGradient>
      <filter id="rmDust"><feColorMatrix type="saturate" values=".35"/><feComponentTransfer><feFuncR type="linear" slope=".85" intercept=".04"/><feFuncG type="linear" slope=".85" intercept=".04"/><feFuncB type="linear" slope=".85" intercept=".05"/></feComponentTransfer></filter><filter id="rmDim"><feGaussianBlur stdDeviation=".8"/><feColorMatrix values=".5 0 0 0 0  0 .5 0 0 0  0 0 .5 0 0  0 0 0 1 0"/></filter><filter id="rmWhite"><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .92 0"/></filter><filter id="rmInk"><feColorMatrix values="0 0 0 0 .08  0 0 0 0 .08  0 0 0 0 .1  0 0 0 .9 0"/></filter>
      <radialGradient id="rmVig" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(0,0,0,${lightWall ? .12 : .35})"/></radialGradient>
      <pattern id="rmPaper" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="1" height="44" fill="${lightWall ? "rgba(120,90,60,.12)" : "rgba(255,255,255,.035)"}"/><circle cx="22" cy="22" r="1.4" fill="${lightWall ? "rgba(120,90,60,.12)" : "rgba(255,255,255,.05)"}"/></pattern>
      <pattern id="rmBoards" width="56" height="10" patternUnits="userSpaceOnUse"><rect width="1.5" height="10" fill="rgba(0,0,0,.35)"/><rect x="21" width="1" height="10" fill="rgba(255,220,170,.05)"/></pattern>
      <pattern id="rmPlanks" width="140" height="22" patternUnits="userSpaceOnUse"><rect width="140" height="1.5" fill="rgba(0,0,0,.18)"/><rect x="${70}" y="11" width="1.5" height="11" fill="rgba(0,0,0,.14)"/><rect y="11" width="140" height="1.2" fill="rgba(0,0,0,.12)"/><rect x="20" width="1.5" height="11" fill="rgba(0,0,0,.14)"/></pattern>
      <filter id="rmBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter><filter id="rmSoft"><feGaussianBlur stdDeviation="6"/></filter><filter id="rmNeon" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <rect width="${W}" height="${F}" fill="url(#rmWall)"/>`;
    if (sc === "cyber" && S.wall === "auto") for (let i = 0; i < W; i += 60) s += `<line x1="${i}" y1="0" x2="${i}" y2="${F}" stroke="#B04CF0" stroke-opacity=".08"/>`;
    else s += `<rect width="${W}" height="${F}" fill="url(#rmPaper)" opacity="${lightWall ? .5 : .8}"/>`;
    if (sc === "loft") s += `<path d="M420 0 h150 l-220 ${F} h-150z" fill="#fff" opacity=".18"/><path d="M630 0 h60 l-200 ${F} h-60z" fill="#fff" opacity=".13"/>`;
    // window, wall shelf and poster
    const day = sc === "loft" || (S.wall !== "auto" && isLight(S.wall));
    s += `<g aria-hidden="true"><rect x="410" y="70" width="190" height="140" rx="5" fill="${day ? "#BFE3FF" : "#0E1A3A"}" stroke="${day ? "#C49E6E" : "#4A3A6A"}" stroke-width="7"/>${day ? `<circle cx="560" cy="104" r="16" fill="#FFE08A"/><path d="M414 196 q40 -28 76 -6 t84 -12 l26 16 v8 h-186z" fill="#9CD08A"/>` : `<circle cx="560" cy="104" r="14" fill="#F6E7B0" opacity=".9"/><path d="M414 184 l36 -26 28 18 36 -36 54 44 32 -16 v34 h-186z" fill="#1E2B55"/>`}<line x1="505" y1="70" x2="505" y2="210" stroke="${day ? "#C49E6E" : "#4A3A6A"}" stroke-width="5"/><rect x="400" y="208" width="210" height="8" rx="2" fill="${day ? "#C49E6E" : "#3A2E52"}"/></g>`;
    s += roomPoster(S, 670, 62, 120, 160, sign);
    s += `<g aria-hidden="true"><rect x="820" y="180" width="150" height="8" rx="2" fill="${D[2]}"/><rect x="826" y="188" width="6" height="10" fill="${D[3]}"/><rect x="958" y="188" width="6" height="10" fill="${D[3]}"/>${trophyMini(842, 180)}<rect x="880" y="160" width="14" height="20" rx="2" fill="#3B60B0"/><rect x="896" y="164" width="12" height="16" rx="2" fill="#C0394E"/><circle cx="938" cy="168" r="11" fill="#F2BE45" stroke="#C99A2E" stroke-width="2"/><text x="938" y="172" font-size="10" font-weight="900" text-anchor="middle" fill="#7A5A10">★</text></g>`;
    // string lights
    const cols = sc === "cyber" ? ["#FF3BD0", "#3BE8FF", "#B04CF0"] : sc === "case" ? ["#DDEBFF", "#9FC8FF", "#FFFFFF"] : ["#FFD27A", "#FF9E7A", "#FFE9B0"];
    s += `<path d="M0 26 Q${W / 4} 60 ${W / 2} 28 T${W} 30" fill="none" stroke="${lightWall ? "#8A7A64" : "#3A3050"}" stroke-width="1.6"/>`;
    for (let i = 0, x = 26; x < W; x += 56, i++) { const yy = 26 + Math.sin(x / W * Math.PI * 2) * 15 + 7; s += `<circle cx="${x}" cy="${yy.toFixed(0)}" r="4" fill="${cols[i % 3]}"/><circle cx="${x}" cy="${yy.toFixed(0)}" r="10" fill="${cols[i % 3]}" opacity=".18"/>`; }
    // floor: skirting board, planks, rug
    s += `<rect y="${F}" width="${W}" height="${720 - F}" fill="url(#rmFloor)"/><rect y="${F}" width="${W}" height="${720 - F}" fill="url(#rmPlanks)" opacity="${sc === "cyber" ? .4 : .8}"/><rect y="${F - 8}" width="${W}" height="10" fill="${P.base}"/><rect y="${F - 8}" width="${W}" height="2" fill="#fff" opacity=".12"/>
      <ellipse cx="640" cy="652" rx="300" ry="44" fill="${rug}" opacity=".9"/><ellipse cx="640" cy="652" rx="272" ry="34" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="3" stroke-dasharray="10 8"/>`;
    s += roomCase(P);
    // desk: 175 cm wide, 75 cm high
    const dx = 430, dw = 420, dX2 = dx + dw;
    s += `<g class="rm-desk" data-room="desk" role="button" tabindex="0" aria-label="Desk and lights"><ellipse cx="${dx + dw / 2}" cy="${F + 2}" rx="${dw * .55}" ry="9" fill="#000" opacity=".3"/>`;
    if (S.deskStyle === "frame") s += `<path d="M${dx + 18} ${F} l14 -${F - deskTop - 14} M${dx + 46} ${F} l-14 -${F - deskTop - 14} M${dX2 - 18} ${F} l-14 -${F - deskTop - 14} M${dX2 - 46} ${F} l14 -${F - deskTop - 14}" stroke="#2A2830" stroke-width="7" stroke-linecap="round"/><rect x="${dx + 30}" y="${F - 70}" width="${dw - 60}" height="5" fill="#2A2830"/>`;
    else s += `<rect x="${dx + 14}" y="${deskTop + 14}" width="14" height="${F - deskTop - 14}" fill="${D[3]}"/><rect x="${dX2 - 28}" y="${deskTop + 14}" width="14" height="${F - deskTop - 14}" fill="${D[3]}"/>`;
    if (S.deskStyle === "drawers") s += `<rect x="${dX2 - 112}" y="${deskTop + 14}" width="98" height="${F - deskTop - 14}" rx="2" fill="${D[2]}"/>${[0, 1, 2].map(i => `<rect x="${dX2 - 106}" y="${deskTop + 22 + i * 54}" width="86" height="46" rx="2" fill="${shade(D[2], -.08)}"/><rect x="${dX2 - 74}" y="${deskTop + 40 + i * 54}" width="22" height="4" rx="2" fill="${shade(D[3], -.3)}"/>`).join("")}`;
    s += `<rect x="${dx}" y="${deskTop}" width="${dw}" height="16" rx="3" fill="url(#rmDesk)"/><rect x="${dx}" y="${deskTop}" width="${dw}" height="2" rx="1" fill="#fff" opacity=".25"/>`;
    if (on) s += `<rect x="${dx + 8}" y="${deskTop + 16}" width="${dw - 16}" height="2.5" fill="${L}" class="rm-light"/><rect x="${dx + 8}" y="${deskTop + 16}" width="${dw - 16}" height="22" fill="${L}" opacity=".3" filter="url(#rmBlur)" class="rm-light"/>`;
    // monitors: 27" is about 150 x 88 here
    const mons = S.mons === "wide" ? [[505, 244, 270, 104, true]] : S.mons === "two" ? [[452, 246, 184, 104, true], [644, 252, 172, 98, false]] : [[542, 236, 196, 112, true]];
    mons.forEach(([mx, my, mw, mh, main]) => { const nx = mx + mw / 2;
      s += `<rect x="${nx - 4}" y="${my + mh}" width="8" height="${deskTop - my - mh}" fill="#1E1E24"/><rect x="${nx - 24}" y="${deskTop - 4}" width="48" height="4" rx="2" fill="#1E1E24"/>`;
      s += main ? `<g class="rm-screen" data-room="screen" role="button" tabindex="0" aria-label="${G ? (G.now && launchKind(G.g) ? "Play " : "Open ") + esc(G.g.title) : "Your monitor"}">${roomMonitor(S, mx, my, mw, mh, true, G)}</g>` : roomMonitor(S, mx, my, mw, mh, false, G); });
    // keyboard, mouse, headphones, speakers, plant, lamp, a handheld
    s += `<rect x="${590}" y="${deskTop - 7}" width="100" height="7" rx="2" fill="#1A1A20"/>${on ? `<rect x="592" y="${deskTop - 7}" width="96" height="1.6" fill="${L}" class="rm-light"/>` : ""}<rect x="560" y="${deskTop - 2}" width="160" height="2" rx="1" fill="#000" opacity=".3"/><ellipse cx="712" cy="${deskTop - 3}" rx="8" ry="4" fill="#1A1A20"/>`;
    s += `<g><rect x="${dx + 26}" y="${deskTop - 46}" width="4" height="44" fill="#2A2830"/><rect x="${dx + 16}" y="${deskTop - 3}" width="24" height="3" rx="1.5" fill="#2A2830"/><path d="M${dx + 14} ${deskTop - 22} q0 -34 14 -34 q14 0 14 34" fill="none" stroke="#1E1E24" stroke-width="5"/><rect x="${dx + 9}" y="${deskTop - 30}" width="10" height="16" rx="4" fill="${S.chairCol}"/><rect x="${dx + 37}" y="${deskTop - 30}" width="10" height="16" rx="4" fill="${S.chairCol}"/></g>`;
    if (S.speakers && S.mons !== "two") [S.mons === "wide" ? 478 : 510, S.mons === "wide" ? 780 : 746].forEach(sx => s += `<rect x="${sx}" y="${deskTop - 44}" width="22" height="44" rx="3" fill="#1A1A20"/><circle cx="${sx + 11}" cy="${deskTop - 30}" r="5" fill="#2E2E36"/><circle cx="${sx + 11}" cy="${deskTop - 13}" r="7" fill="#2E2E36"/>`);
    if (S.plant && S.mons !== "two" && S.buddy !== "desk") s += `<rect x="${dX2 - 52}" y="${deskTop - 20}" width="20" height="20" rx="2" fill="#C66B3D"/><path d="M${dX2 - 42} ${deskTop - 20} q-12 -20 -3 -27 M${dX2 - 42} ${deskTop - 20} q3 -24 12 -26 M${dX2 - 42} ${deskTop - 20} q-2 -16 -15 -14" stroke="#4FAF7A" stroke-width="4" fill="none"/>`;
    if (S.lamp && S.mons !== "two" && S.buddy !== "desk") s += `<path d="M${dX2 - 84} ${deskTop} l8 -48 24 -8" fill="none" stroke="#3A3A42" stroke-width="4"/><rect x="${dX2 - 92}" y="${deskTop - 3}" width="18" height="3" rx="1.5" fill="#3A3A42"/><path d="M${dX2 - 54} ${deskTop - 61} l20 -5 3 17z" fill="#F2BE45"/><path d="M${dX2 - 42} ${deskTop - 46} l46 46 h-56z" fill="#FFD27A" opacity=".12"/>`;
    if (hand[0]) s += roomConsole(hand[0][0], 492, deskTop);
    s += `</g>`;
    // the chair, pulled out a little to the left
    s += roomChair(S, 570, F + 14);
    // PC on the floor beside the desk, about 46 cm tall
    if (S.pc && (myPC().gpu || myPC().cpu || nook.setup)) s += roomPC(S, 880, F, true);
    else if (S.pc) s += `<g class="rm-pc rm-ghost" data-room="pc" role="button" tabindex="0" aria-label="Add your PC"><rect x="880" y="${F - 116}" width="112" height="116" rx="6" fill="none" stroke="${P.ink}" stroke-opacity=".4" stroke-width="2.5" stroke-dasharray="8 6"/><text x="936" y="${F - 52}" fill="${P.ink}" font-size="13" font-weight="800" text-anchor="middle" opacity=".75">＋ Add PC</text></g>`;
    const vr = cons.filter(c => c[2] === "vr");
    if (vr.length) s += `<g class="rm-vr" data-room="consoles" role="button" tabindex="0" aria-label="Your VR headsets">${vr.slice(0, 2).map((c, k) => roomVR(c[0], 996 + k * 0 - (vr.length > 1 && !k ? 0 : 0) + k * 0, 210 + k * 64)).join("")}</g>`;
    // TV corner: a 50" TV on a low media unit with your consoles
    if (tv) {
      const tx = 1040, tw2 = 360, sTop = F - 104;
      s += `<g class="rm-tv" data-room="consoles" role="button" tabindex="0" aria-label="Your consoles"><ellipse cx="${tx + tw2 / 2}" cy="${F + 2}" rx="${tw2 * .55}" ry="8" fill="#000" opacity=".3"/>`;
      const ty = sTop - 150, tvx = tx + tw2 / 2 - 125;
      if (on) s += `<rect x="${tvx - 14}" y="${ty - 12}" width="278" height="166" rx="24" fill="${S.light === "rgb" ? "#5BC8FF" : S.light}" opacity=".18" filter="url(#rmBlur)" class="rm-light"/>`;
      s += `<rect x="${tvx}" y="${ty}" width="250" height="144" rx="4" fill="#0B0B10"/><rect x="${tvx + 4}" y="${ty + 4}" width="242" height="136" fill="#1B2D55"/><clipPath id="rmTVc"><rect x="${tvx + 4}" y="${ty + 4}" width="242" height="136"/></clipPath>`;
      const tg = !S.pc && G ? G : null;
      if (tg && (tg.wide || tg.tall)) s += rmImg([tg.wide, tg.tall, ...(tg.more || [])].filter(Boolean), `x="${tvx + 4}" y="${ty + 4}" width="242" height="136" preserveAspectRatio="xMidYMid slice" clip-path="url(#rmTVc)"`);
      else s += `<path d="M${tvx + 4} ${ty + 140} l60 -50 40 30 54 -48 56 46 32 -14 v36z" fill="#2E8A62" opacity=".85"/><circle cx="${tvx + 196}" cy="${ty + 34}" r="12" fill="#FFD27A"/>`;
      s += `<rect x="${tvx + 4}" y="${ty + 4}" width="242" height="60" fill="#fff" opacity=".03"/><rect x="${tvx + 40}" y="${ty + 144}" width="8" height="${sTop - ty - 144}" fill="#15151A"/><rect x="${tvx + 202}" y="${ty + 144}" width="8" height="${sTop - ty - 144}" fill="#15151A"/>`;
      // media unit with three open compartments
      s += `<rect x="${tx}" y="${sTop}" width="${tw2}" height="12" rx="3" fill="${shade(D[2], .08)}"/><rect x="${tx + 6}" y="${sTop + 12}" width="${tw2 - 12}" height="${F - sTop - 20}" fill="${D[3]}"/><rect x="${tx}" y="${F - 10}" width="${tw2}" height="8" rx="2" fill="${D[2]}"/>`;
      const cw = (tw2 - 12) / 3; [1, 2].forEach(i => s += `<rect x="${tx + 6 + cw * i - 2}" y="${sTop + 12}" width="4" height="${F - sTop - 20}" fill="${D[2]}"/>`);
      [0, 1, 2].forEach(i => s += `<rect x="${tx + 8 + cw * i}" y="${sTop + 14}" width="${cw - 6}" height="${F - sTop - 26}" fill="#000" opacity=".28"/>`);
      const width = id => ({ ps5: 39, xsx: 30, xss: 22, wii: 13, gc: 36, gb: 18 })[id] || 62;
      home.slice(0, 3).forEach((c, i) => s += roomConsole(c[0], tx + 6 + cw * i + (cw - width(c[0])) / 2, F - 12));
      // more consoles and handhelds sit on top of the unit beside the TV
      const top = [...home.slice(3), ...hand.slice(1)].slice(0, 2);
      top.forEach((c, i) => s += roomConsole(c[0], i ? tvx + 256 : tx + 6, sTop));
      // a soundbar, and a controller resting on the unit
      s += `<rect x="${tvx + 40}" y="${sTop - 9}" width="170" height="9" rx="4" fill="#15151A"/><rect x="${tvx + 46}" y="${sTop - 6}" width="158" height="3" rx="1.5" fill="#2A2A32"/>`;
      s += `<path d="M${tx + tw2 - 64} ${sTop - 1} q4 -9 20 -9 q16 0 20 9 q3 6 -4 6 h-32 q-7 0 -4 -6z" fill="#ECEAF2" stroke="#9A96A8" stroke-width=".8"/>`;
      if (!cons.length) s += `<text x="${tx + tw2 / 2}" y="${F - 40}" fill="${P.ink}" font-size="14" font-weight="800" text-anchor="middle" opacity=".75">＋ Add your consoles</text>`;
      s += `</g>`;
      cons.filter(c => c[2] !== "vr").slice(0, 6).forEach((c, i) => { const lx = tx + 4 + (i % 3) * 120, ly = F + 18 + Math.floor(i / 3) * 26; s += `<g class="rm-lbl"><rect x="${lx}" y="${ly}" width="114" height="21" rx="10.5" fill="#15102E" fill-opacity=".9" stroke="#fff" stroke-opacity=".5"/><text x="${lx + 57}" y="${ly + 14.5}" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">${esc(c[1])}</text></g>`; });
    }
    s += roomBuddy(S, F, deskTop, dX2, tv);
    s += `<rect width="${W}" height="720" fill="url(#rmVig)" pointer-events="none"/>`;
    s += `<g class="rm-hint" aria-hidden="true"><rect x="100" y="114" width="180" height="24" rx="12" fill="#FFD27A"/><text x="190" y="130.5" font-size="12" font-weight="800" fill="#3A2412" text-anchor="middle">Tap to open your shelves</text></g></svg>`;
    return s;
  }
  function roomPoster(S, x, y, w, h, sign){
    if (S.poster === "none") return "";
    const frame = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${S.poster === "sign" ? "#FF5C8A" : "#1B1446"}"/>`, ix = x + 6, iy = y + 6, iw = w - 12, ih = h - 12;
    let in_ = "";
    if (S.poster === "game") {
      const fav = games.filter(g => coverChain(g)[0]).sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.hours || 0) - (a.hours || 0))[0];
      in_ = fav ? `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#111"/>${rmImg(coverChain(fav), `x="${ix}" y="${iy}" width="${iw}" height="${ih}" preserveAspectRatio="xMidYMid slice"`)}` : `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#222"/>`;
      return `<g class="rm-poster" data-room="walls" role="button" tabindex="0" aria-label="Poster${fav ? ": " + esc(fav.title) : ""}"><rect x="${x - 2}" y="${y - 2}" width="${w + 4}" height="${h + 4}" rx="3" fill="#E9E2D0"/>${in_}<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="url(#rmGlass)"/></g>`;
    }
    if (S.poster === "pixel") {
      const bands = ["#2B1660", "#5A2A86", "#B04C9A", "#F07A5A", "#FFC24A"];
      in_ = bands.map((c, i) => `<rect x="${ix}" y="${iy + i * ih * .12}" width="${iw}" height="${ih * .12 + 1}" fill="${c}"/>`).join("") + `<rect x="${ix + iw / 2 - 18}" y="${iy + ih * .44}" width="36" height="18" fill="#FFE08A"/><rect x="${ix + iw / 2 - 12}" y="${iy + ih * .38}" width="24" height="8" fill="#FFE08A"/>`
        + `<path d="M${ix} ${iy + ih} V${iy + ih * .62} h12 v-8 h10 v8 h14 v-14 h12 v14 h16 v-6 h14 v6 h12 v-10 h14 V${iy + ih}z" fill="#1B1446"/><rect x="${ix}" y="${iy + ih * .82}" width="${iw}" height="${ih * .18}" fill="#0E0A24"/>`;
    } else if (S.poster === "heart") {
      in_ = `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#1B1446"/><g transform="translate(${ix + iw / 2 - 30} ${iy + 26}) scale(3)"><path d="M3 0h4v1h1v1h1V1h1V0h4v1h1v1h1v5h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1H9v1H8v-1H7v-1H6v-1H5V9H4V8H3V7H2V2h1V1z" fill="#3B3456"/><path d="M3 0h4v1h1v1h1v12H8v-1H7v-1H6v-1H5V9H4V8H3V7H2V2h1V1z" fill="#FF5C8A"/></g><rect x="${ix + 14}" y="${iy + ih - 38}" width="${iw - 28}" height="7" rx="3.5" fill="#3B3456"/><rect x="${ix + 14}" y="${iy + ih - 38}" width="${(iw - 28) * .6}" height="7" rx="3.5" fill="#3BFF8A"/><text x="${ix + iw / 2}" y="${iy + ih - 12}" fill="#fff" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="1">SAVE POINT</text>`;
    } else {
      // your sign's words, wrapped over up to four lines so the whole thing fits
      const words = String(sign || "Save Point").split(/\s+/).filter(Boolean), lines = []; let cur = "";
      words.forEach(wd => { if ((cur + " " + wd).trim().length > 11 && cur) { lines.push(cur); cur = wd; } else cur = (cur + " " + wd).trim(); }); if (cur) lines.push(cur);
      const L4 = lines.slice(0, 4), fs = Math.min(18, Math.floor((iw - 10) / Math.max(...L4.map(l => l.length), 4) * 1.7)), lh = fs * 1.25, y0 = iy + ih / 2 - (L4.length - 1) * lh / 2 + fs * .35;
      in_ = `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#1B1446"/><path d="M${ix + iw / 2 - 9} ${iy + 14} h-5 v5 h-5 v5 h5 v5 h5 v5 h10 v-5 h5 v-5 h5 v-5 h-5 v-5 h-5 v5 h-5z" fill="#FF5C8A"/>`
        + L4.map((l, k) => `<text x="${ix + iw / 2}" y="${y0 + k * lh + 10}" fill="#fff" font-size="${fs}" font-weight="900" text-anchor="middle" style="paint-order:stroke" stroke="#FF5C8A" stroke-width=".6">${esc(l)}</text>`).join("");
    }
    return `<g class="rm-poster" data-room="walls" role="button" tabindex="0" aria-label="Poster">${frame}${in_}<rect x="${ix}" y="${iy}" width="${iw}" height="${ih * .4}" fill="#fff" opacity=".04"/></g>`;
  }
  // your co-op buddy hangs out in the room too
  // how your buddy feels in the room: sleepy late at night, happy after you finish something, fired up while you're mid-game
  function roomBuddyMood(){
    const h = new Date().getHours(), now = Date.now();
    if (h >= 23 || h < 6) return "sleepy";
    if (games.some(g => g.status === "finished" && g.finished && g.finished.length === 10 && now - new Date(g.finished) < 3 * 864e5)) return "happy";
    if (games.some(g => g.status === "playing" && lastPlayed(g) === todayISO())) return "determined";
    if (!games.some(g => g.status === "playing")) return "thinking";
    return "affectionate";
  }
  function roomBuddy(S, F, deskTop, dX2, tv){
    const b = settings.buddy; if (!b?.type || S.buddy === "off" || settings.buddyHidden) return "";
    const mood = roomBuddyMood(), fx = (bx, top) => mood === "sleepy" ? `<g class="rm-zzz" font-weight="900" fill="#CFC8F0">${[0, 1, 2].map(i => `<text x="${bx + 22 + i * 8}" y="${top + 10 - i * 10}" font-size="${10 + i * 3}" style="animation-delay:${i * .6}s">z</text>`).join("")}</g>` : mood === "happy" ? `<g class="rm-yay">${[[-26, 4, "#FFD27A"], [28, -2, "#FF7EB6"], [-14, -12, "#7AE0FF"], [20, -18, "#3BFF8A"]].map(([dx, dy, c], i) => `<path d="M${bx + dx} ${top + dy} l2 4 4 1 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -1z" fill="${c}" style="animation-delay:${i * .3}s"/>`).join("")}</g>` : "";
    const C = BUDDIES[b.type]?.c || "#B04CF0";
    if (S.buddy === "bean") {
      // a bean bag facing the TV, your buddy curled up in it with a controller
      const bx = tv ? 985 : 1010, by = F + (tv ? 84 : 74), bag = shade(C, -.15);
      let g = `<g class="rm-buddy" data-room="buddy" role="button" tabindex="0" aria-label="Talk to ${esc(b.name || "your buddy")}"><ellipse cx="${bx}" cy="${by}" rx="66" ry="9" fill="#000" opacity=".3"/>
        <path d="M${bx - 60} ${by - 3} q-8 -52 34 -66 q44 -12 76 14 q22 22 10 52 z" fill="${bag}"/><path d="M${bx - 44} ${by - 22} q30 -22 84 -10" stroke="${shade(bag, -.3)}" stroke-width="5" fill="none" opacity=".5"/><path d="M${bx - 40} ${by - 56} q24 -14 56 -8" stroke="${shade(bag, .3)}" stroke-width="6" fill="none" opacity=".45"/>`;
      let art = buddySVG(b.type, mood, { label: `${b.name || "Your buddy"} (${mood})` }); const sz = 74, h = sz * 260 / 240;
      g += art.replace("<svg ", `<svg x="${bx - sz / 2 + 4}" y="${by - 26 - h}" width="${sz}" height="${h}" `) + fx(bx, by - 26 - h + 14);
      g += `<path d="M${bx - 10} ${by - 34} q4 -8 15 -8 q11 0 15 8 q2 4 -3 4 h-24 q-5 0 -3 -4z" fill="#ECEAF2" stroke="#9A96A8" stroke-width=".8"/><circle cx="${bx + 13}" cy="${by - 37}" r="1.6" fill="#3B6FE0"/>`;
      return g + `</g>`;
    }
    const spot = { shelf: [912, 180, 44], desk: [dX2 - 50, deskTop, 46] }[S.buddy];
    const [bx, by, sz] = spot, hgt = sz * 260 / 240;
    let art = buddySVG(b.type, mood, { label: `${b.name || "Your buddy"} (${mood})` }); art = art.replace("<svg ", `<svg x="${bx - sz / 2}" y="${by - hgt}" width="${sz}" height="${hgt}" `);
    return `<g class="rm-buddy" data-room="buddy" role="button" tabindex="0" aria-label="Talk to ${esc(b.name || "your buddy")}"><ellipse cx="${bx}" cy="${by - 1}" rx="${sz * .34}" ry="${sz * .06}" fill="#000" opacity=".3"/>${art}${fx(bx - 10, by - hgt + 8)}</g>`;
  }
  // VR headsets hang on wall hooks
  function roomVR(id, x, y){
    const P = { quest3: ["#F2F2F5", "#1A1A20", "#D9D9DE"], quest2: ["#F2F2F5", "#1A1A20", "#CFCFD6"], psvr2: ["#F4F4F6", "#15151A", "#3B6FE0"], index: ["#1C1C22", "#2E2E36", "#E0453B"], pico4: ["#F2F2F5", "#2A2A30", "#DDD"], avp: ["#C9CCD4", "#0E1424", "#8FA6C9"] }[id] || ["#ddd", "#222", "#aaa"];
    return `<g><rect x="${x + 22}" y="${y - 6}" width="6" height="8" rx="1.5" fill="#6B6F7A"/><path d="M${x + 2} ${y + 18} q23 -26 46 0" fill="none" stroke="${P[1]}" stroke-width="3.5"/>
      <rect x="${x}" y="${y + 14}" width="50" height="26" rx="10" fill="${P[0]}"/><rect x="${x + 3}" y="${y + 17}" width="44" height="13" rx="6" fill="${id === "avp" ? "url(#rmGlass)" : P[1]}" opacity="${id === "avp" ? 1 : .92}"/>${id === "avp" ? `<rect x="${x + 3}" y="${y + 17}" width="44" height="13" rx="6" fill="${P[1]}" opacity=".8"/>` : ""}<circle cx="${x + 12}" cy="${y + 34}" r="1.6" fill="${P[2]}"/><circle cx="${x + 38}" cy="${y + 34}" r="1.6" fill="${P[2]}"/><rect x="${x + 6}" y="${y + 18}" width="18" height="3" rx="1.5" fill="#fff" opacity=".18"/></g>`;
  }
  function trophyMini(x, y){ return `<path d="M${x} ${y - 20} h16 v6 a8 8 0 0 1 -16 0z" fill="#F2BE45"/><rect x="${x + 5}" y="${y - 7}" width="6" height="4" fill="#C99A2E"/><rect x="${x + 2}" y="${y - 3}" width="12" height="3" rx="1" fill="#C99A2E"/>`; }
  let roomEditing = null; // which setup tab is open next to the room
  function renderRoom(){
    const el = $("#room"), rack = $(".rack"); if (!el || !rack) return;
    const show = roomOn() && (!roomOpen || roomEditing);
    el.hidden = !show; rack.classList.toggle("rm-closed", show);
    const rb = $("#nook-roomback"); if (rb) rb.hidden = !roomOn();
    el.classList.toggle("rm-editing", !!roomEditing);
    if (show) el.querySelector(".rm-stage").innerHTML = roomSVG();
    const pan = el.querySelector(".rm-panel"); if (pan) { pan.hidden = !roomEditing; if (roomEditing && !pan.contains(document.activeElement)) pan.innerHTML = setupHTML(); }
    roomFit();
  }
  // on wide screens the setup panel is as tall as the picture of the room
  function roomFit(){ const el = $("#room"), pan = el?.querySelector(".rm-panel"), st = el?.querySelector(".rm-stage"); if (!pan || !st) return; requestAnimationFrame(() => { pan.style.maxHeight = ""; }); }
  addEventListener("resize", () => { if (roomEditing) roomFit(); });
  function openRoomShelves(){
    const el = $("#room"), rack = $(".rack"); if (!el) return; roomEditing = null;
    if (reduceMotion || settings.motion === "off") { roomOpen = true; renderRoom(); rack.scrollIntoView({ block: "start" }); return; }
    el.classList.add("rm-zoom");
    setTimeout(() => { roomOpen = true; el.classList.remove("rm-zoom"); renderRoom(); rack.classList.add("rm-in"); rack.scrollIntoView({ block: "start", behavior: "smooth" }); setTimeout(() => rack.classList.remove("rm-in"), 600); }, 420);
  }
  function showRoom(){ roomOpen = false; renderRoom(); const el = $("#room"); el.classList.add("rm-enter"); setTimeout(() => el.classList.remove("rm-enter"), 600); el.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" }); }
  // the setup panel sits beside the room (below it on phones), so changes show at once
  let suPC = null;
  // how well your PC runs the games you've checked (PCGamingWiki specs), for the PC tab
  function pcRunSummary(){
    const pcG = games.filter(g => g.status !== "wishlist" && (platFamily(mainPlat(g)) === "pc" || g.steamAppId || g.reqs));
    const done = pcG.filter(g => g.reqs && !g.reqs.none), counts = LEVELS.map(L => [L, done.filter(g => verdict(g.reqs)?.lvl === L[0]).length]), n = counts.reduce((a, c) => a + c[1], 0), todo = pcG.filter(g => !g.reqs);
    const best = counts.slice().reverse().find(c => c[1]);
    return `<div class="su-run"><div class="su-runh"><b>${n ? `${best ? esc(best[0][1].replace(" settings", "")) : ""}` : "Not checked yet"}</b><small>${n ? `Most of your ${n} checked game${n === 1 ? "" : "s"} run at ${esc((counts.slice().sort((a, b) => b[1] - a[1])[0][0][1]).toLowerCase())}` : "See how well your PC runs your games"}</small></div>
      ${n ? `<div class="su-runbar">${counts.filter(c => c[1]).map(([L, c]) => `<i style="flex:${c};background:${L[2]}" title="${L[1]}: ${c}"></i>`).join("")}</div><div class="su-runleg">${counts.filter(c => c[1]).reverse().map(([L, c]) => `<span><i style="background:${L[2]}"></i>${L[1].replace(" settings", "")} <b>${c}</b></span>`).join("")}</div>` : ""}
      ${todo.length ? `<button class="btn small" type="button" data-sucheck>Check ${Math.min(25, todo.length)} more game${todo.length === 1 ? "" : "s"}</button>` : ""}</div>`;
  }
  function setupHTML(){
    const S = roomSet(), t = roomEditing, pc = suPC || (suPC = { ...myPC() });
    const chips = (k, list, cur) => `<div class="su-chips">${list.map(([v, n, c]) => `<button type="button" class="su-chip" data-su="${k}" data-v="${v}" aria-pressed="${cur === v}">${c ? `<i style="background:${c}"></i>` : ""}${n}</button>`).join("")}</div>`;
    const dots = (k, list, cur) => `<div class="su-cols">${list.map(v => { const [val, name] = Array.isArray(v) ? v : [v, v]; return `<button type="button" class="su-col" data-su="${k}" data-v="${val}" aria-pressed="${cur === val}" title="${esc(name)}" aria-label="${esc(name)}" style="background:${val === "rgb" ? "conic-gradient(#FF3B8A,#B04CF0,#3BC8FF,#3BFFB0,#FF3B8A)" : val === "auto" ? "repeating-linear-gradient(45deg,#bbb 0 4px,#fff 4px 8px)" : val}"></button>`; }).join("")}</div>`;
    const seg = (k, list, cur) => `<div class="seg su-seg">${list.map(([v, n]) => `<button type="button" data-su="${k}" data-v="${v}" aria-pressed="${cur === v}">${n}</button>`).join("")}</div>`;
    const row = (label, body) => `<div class="su-row"><span class="px">${label}</span>${body}</div>`;
    const TABS = [["pc", "🖥", "PC"], ["lights", "💡", "Lights"], ["desk", "🪑", "Desk"], ["walls", "🖼", "Walls"], ["consoles", "🎮", "Consoles"], ["more", "⚙", "More"]];
    let body = "";
    if (t === "pc") body = `<label class="check"><input type="checkbox" id="su-haspc" ${S.pc ? "checked" : ""}> I have a gaming PC</label>` + (S.pc ? pcRunSummary()
      + `<div class="su-two"><label class="field"><span class="px">Graphics card</span><input id="su-gpu" value="${esc(pc.gpu || "")}" placeholder="RTX 4070"></label><label class="field"><span class="px">Processor</span><input id="su-cpu" value="${esc(pc.cpu || "")}" placeholder="Ryzen 7 7800X3D"></label></div>
        <div class="su-two"><label class="field"><span class="px">RAM (GB)</span><input id="su-ram" type="number" min="1" max="1024" inputmode="numeric" value="${esc(pc.ram || "")}" placeholder="16"></label><label class="field"><span class="px">Storage</span><input id="su-sto" value="${esc(pc.storage || "")}" placeholder="2 TB SSD"></label></div><p class="note" id="su-check"></p>`
      + row("Case", chips("case", ROOM_CASES, S.case)) : `<p class="note">The TV corner takes the spotlight.</p>`);
    else if (t === "lights") body = row("Colour", dots("light", ROOM_LIGHTS, S.light)) + row("Effect", seg("fx", ROOM_FX, S.fx)) + `<p class="note">Lights the PC, desk strip, keyboard and the glow behind your screens.</p>`;
    else if (t === "desk") body = row("Wood", chips("desk", ROOM_DESKS, S.desk)) + row("Style", seg("deskStyle", ROOM_DESK_STYLES, S.deskStyle)) + row("Monitors", seg("mons", ROOM_MONS, S.mons)) + row("On the screen", seg("screen", ROOM_SCREENS, S.screen))
      + row("Chair", seg("chair", ROOM_CHAIRS, S.chair)) + row("Chair colour", dots("chairCol", ROOM_CHAIR_COLS, S.chairCol))
      + row("On the desk", `<div class="su-chips">${[["plant", "Plant"], ["lamp", "Lamp"], ["speakers", "Speakers"]].map(([k, n]) => `<button type="button" class="su-chip" data-sutog="${k}" aria-pressed="${!!S[k]}">${n}</button>`).join("")}</div>`);
    else if (t === "walls") body = row("Wall colour", chips("wall", ROOM_WALLS, S.wall)) + row("Poster", seg("poster", ROOM_POSTERS, S.poster)) + (S.poster === "sign" ? `<p class="note">The poster shows your sign's words. Change them under Customize → Decorate and sign.</p>` : "") + row("Rug", dots("rug", ROOM_RUGS, S.rug));
    else if (t === "consoles") body = `${["home", "hand", "vr"].map(k => row(k === "home" ? "Home consoles" : k === "hand" ? "Handhelds" : "VR headsets", `<div class="su-chips">${ROOM_CONSOLES.filter(c => c[2] === k).map(([id, n]) => `<button type="button" class="su-chip" data-sucon="${id}" aria-pressed="${S.consoles.includes(id)}">${n}</button>`).join("")}</div>`)).join("")}`;
    else body = row("Your buddy", settings.buddy ? seg("buddy", ROOM_BUDDY, S.buddy) : `<button class="btn small" type="button" data-subuddy>Meet the crew</button>`)
      + row("When I open Save Point, show", `<div class="seg su-seg">${[["shelves", "My shelves"], ["room", "The room"]].map(([k, n]) => `<button type="button" data-roomdef="${k}" aria-pressed="${(settings.roomDefault || "shelves") === k}">${n}</button>`).join("")}</div>`)
      + `<p class="note">The bookcase, floor and string lights follow your shelf room (Customize → Room). Tap the poster, PC, screen, TV or your buddy to jump to their settings.</p>`;
    return `<div class="su-head"><div class="su-tabs2" role="tablist">${TABS.map(([k, ic, n]) => `<button type="button" role="tab" data-sutab="${k}" aria-selected="${t === k}"><i aria-hidden="true">${ic}</i>${n}</button>`).join("")}</div><div class="su-foot"><button class="btn small primary" type="button" data-sudone>Done</button></div></div><div class="su-body">${body}</div>`;
  }
  function openSetup(tab = "pc"){
    tab = { room: "walls", walls: "walls" }[tab] || (["pc", "lights", "desk", "consoles", "more"].includes(tab) ? tab : "pc");
    if (!roomOn()) { settings.room = true; applySettings(); }
    suPC = { ...myPC() }; roomEditing = tab; roomOpen = false; renderRoom();
    const pan = $("#room .rm-panel"); pan.innerHTML = setupHTML(); suCheck();
    if (innerWidth < 900) $("#room").scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
  }
  function suSave(patch){ nook.setup = { ...(nook.setup || {}), ...roomSet(), ...patch }; saveNook(false); const st = $("#room .rm-stage"); if (st) st.innerHTML = roomSVG(); }
  function suCheck(){ const c = $("#su-check"); if (!c) return; const g = gpuScore($("#su-gpu").value), p = cpuScore($("#su-cpu").value); c.textContent = [$("#su-gpu").value ? (g ? "Graphics card recognised ✓" : "Graphics card not recognised yet: try the model, like “RTX 3060”") : "", $("#su-cpu").value ? (p ? "Processor recognised ✓" : "Processor not recognised: try e.g. “Ryzen 7 5800X”") : ""].filter(Boolean).join(" · "); }
  function suPanelRedraw(){ const pan = $("#room .rm-panel"); if (pan) { pan.innerHTML = setupHTML(); suCheck(); } }
  $("#room").addEventListener("click", e => {
    const tb = e.target.closest("[data-sutab]"); if (tb) { roomEditing = tb.dataset.sutab; suPanelRedraw(); return; }
    if (e.target.closest("[data-sudone]")) { roomEditing = null; suPC = null; renderRoom(); render(); return; }
    const b = e.target.closest("[data-su]"); if (b) { const k = b.dataset.su; suSave({ [k]: b.dataset.v }); suPanelRedraw(); return; }
    const tg = e.target.closest("[data-sutog]"); if (tg) { const k = tg.dataset.sutog; suSave({ [k]: !roomSet()[k] }); suPanelRedraw(); return; }
    const cn = e.target.closest("[data-sucon]"); if (cn) { const id = cn.dataset.sucon, S = roomSet(); suSave({ consoles: S.consoles.includes(id) ? S.consoles.filter(x => x !== id) : [...S.consoles, id] }); suPanelRedraw(); return; }
    const df = e.target.closest("[data-roomdef]"); if (df) { settings.roomDefault = df.dataset.roomdef; applySettings(); suPanelRedraw(); toast(df.dataset.roomdef === "room" ? "Save Point will open on your room" : "Save Point will open on your shelves"); return; }
    const ck = e.target.closest("[data-sucheck]"); if (ck) { const list = games.filter(g => g.status !== "wishlist" && (platFamily(mainPlat(g)) === "pc" || g.steamAppId) && !g.reqs).slice(0, 25); ck.disabled = true; checkMany(list, ck).then(() => { suPanelRedraw(); }); return; }
    if (e.target.closest("[data-subuddy]")) { buddy.openPicker(); return; }
    const t = e.target.closest("[data-room],[data-roomgo]"); if (!t) return;
    const k = t.dataset.room || t.dataset.roomgo;
    if (k === "shelves") return openRoomShelves();
    if (k === "buddy") { try { buddy.talk(); } catch {} return; }
    if (k === "screen") { const G = roomScreenGame(); if (!G) return openSetup("desk"); if (G.now && launchKind(G.g)) playGame(G.g.id); else openEditor(G.g); return; }
    openSetup(k);
  });
  $("#room").addEventListener("change", e => {
    if (e.target.id === "su-haspc") { suSave({ pc: e.target.checked }); suPanelRedraw(); }
    else if (e.target.id === "su-roomon") { settings.room = e.target.checked; applySettings(); if (!settings.room) { roomEditing = null; roomOpen = true; } renderRoom(); }
  });
  $("#room").addEventListener("input", e => {
    if (!/^su-(gpu|cpu|ram|sto)$/.test(e.target.id)) return;
    suPC = { ...suPC, gpu: $("#su-gpu").value.trim().slice(0, 60), cpu: $("#su-cpu").value.trim().slice(0, 60), ram: Number($("#su-ram").value) || "", storage: $("#su-sto").value.trim().slice(0, 30) };
    nook.pc = { ...myPC(), ...suPC }; suCheck(); clearTimeout(suSave._t); suSave._t = setTimeout(() => suSave({}), 250);
  });
  $("#room").addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.closest("svg [data-room]")) { e.preventDefault(); e.target.closest("[data-room]").dispatchEvent(new MouseEvent("click", { bubbles: true })); } });
  $("#nook-roomback").addEventListener("click", showRoom);

  // ---------- shelf options ----------
  function openShelf(id){
    const isNew = !id, src = id ? shelfById(id) : null; if (id && !src) return;
    const d = src ? JSON.parse(JSON.stringify(src)) : { id: "c" + Date.now().toString(36), name: "", kind: "custom", sort: "manual", order: [], ids: [], rule: null, mat: "auto", plate: "auto", color: "", hidden: false };
    let q = "", sure = false; const custom = d.kind === "custom";
    const ruleOn = () => !!(d.rule && (d.rule.plat || d.rule.genre || d.rule.min || d.rule.status));
    const pick = () => { const ids = new Set(d.ids); return games.filter(g => !q || norm(g.title).includes(norm(q))).sort((a, b) => (ids.has(b.id) - ids.has(a.id)) || (a.title || "").localeCompare(b.title || "")).slice(0, 80)
      .map(g => `<button type="button" class="nomrow${ids.has(g.id) ? " on" : ""}" data-shg="${esc(g.id)}" aria-pressed="${ids.has(g.id)}"><span>${esc(g.title)}</span><small>${ids.has(g.id) ? "On this shelf ✓" : STATUS[g.status] || ""}</small></button>`).join("") || `<p class="note">No games match.</p>`; };
    const seg = (key, opts, cur) => `<div class="seg">${opts.map(([k, n]) => `<button type="button" data-sh="${key}" data-v="${k}" aria-pressed="${cur === k}">${n}</button>`).join("")}</div>`;
    const R = d.rule || {};
    const html = () => `<div class="modal shelfmod" role="dialog" aria-modal="true" aria-labelledby="sh-t"><div class="reshead"><div><span class="px">${isNew ? "New shelf" : custom ? "Your shelf" : "Status shelf"}</span><h2 id="sh-t">${esc(d.name || "Untitled shelf")}</h2></div><button class="btn small" type="button" data-mclose>Close</button></div>
      <label class="field"><span class="px">Shelf name</span><input id="sh-name" maxlength="32" value="${esc(d.name)}" placeholder="${custom ? "e.g. Favourites, Horror nights, PS5" : esc(STATUS[d.status])}"></label>
      ${!custom ? `<p class="note">This shelf always holds your ${esc(STATUS[d.status].toLowerCase())} games. When a game's status changes it moves here by itself.</p>` : ""}
      <div class="field"><span class="px">Sort games by</span><select id="sh-sort">${SHELF_SORTS.filter(([k]) => custom ? k !== "auto" : true).map(([k, n]) => `<option value="${k}"${d.sort === k ? " selected" : ""}>${n}${k === "auto" && !custom ? ` (${SHELF_SORTS.find(x => x[0] === STATUS_SHELF[d.status][1])[1].toLowerCase()})` : ""}</option>`).join("")}</select>
        ${!isNew ? `<small class="muted">To arrange by hand, just drag games on the shelf.</small>` : ""}</div>
      <div class="field"><span class="px">Shelf material</span>${seg("mat", MATS, d.mat)}</div>
      <div class="field"><span class="px">Name plate</span>${seg("plate", PLATES, d.plate)}</div>
      ${!isNew ? `<div class="field"><span class="px">Trinkets</span><button class="btn small" type="button" data-shdeco style="align-self:start">Decorate this shelf (${decoOf(d).length})</button></div>` : ""}
      <div class="field"><span class="px">Accent colour</span><div class="swatches"><button type="button" class="sw auto" data-sh="color" data-v="" aria-pressed="${!d.color}" aria-label="Default colour">A</button>${SHELF_COLORS.map(c => `<button type="button" class="sw" data-sh="color" data-v="${c}" aria-pressed="${d.color === c}" style="--sw:${c}" aria-label="Colour ${c}"></button>`).join("")}</div></div>
      ${custom ? `<details class="more" ${ruleOn() ? "open" : ""}><summary>Fill this shelf automatically <span class="muted">optional</span></summary>
        <div class="fields">
          <label class="field"><span class="px">Platform</span><select id="sh-plat"><option value="">Any</option>${Object.entries(PLAT_NAMES).filter(([k]) => k !== "ot").map(([k, n]) => `<option value="${k}"${R.plat === k ? " selected" : ""}>${n}</option>`).join("")}</select></label>
          <label class="field"><span class="px">Status</span><select id="sh-status"><option value="">Any owned game</option>${Object.entries(STATUS).map(([k, n]) => `<option value="${k}"${R.status === k ? " selected" : ""}>${n}</option>`).join("")}</select></label>
          <label class="field"><span class="px">Genre or series contains</span><input id="sh-genre" maxlength="40" value="${esc(R.genre || "")}" placeholder="e.g. horror, soulslike, Zelda"></label>
          <label class="field"><span class="px">Your rating at least</span><select id="sh-min"><option value="0">Any</option>${[3, 4, 4.5, 5].map(v => `<option value="${v}"${+R.min === v ? " selected" : ""}>${v} stars</option>`).join("")}</select></label>
        </div><p class="note">Matching games appear on this shelf by themselves, on top of any you add by hand.</p></details>
        <div class="field"><span class="px" id="sh-cnt">Games on this shelf (${d.ids.length} added by hand)</span><input id="sh-q" type="search" placeholder="Find a game in your library" value="${esc(q)}"><div class="nomlist" id="sh-games">${pick()}</div></div>` : ""}
      <div class="mfoot">${!isNew ? `<button class="btn small" type="button" data-shhide>${d.hidden ? "Show this shelf" : "Hide this shelf"}</button>` : ""}${custom && !isNew ? `<button class="btn danger small" type="button" data-shdel>${sure ? "Tap again to delete" : "Delete shelf"}</button>` : ""}<div class="r"><button class="btn primary" type="button" data-shsave>${isNew ? "Build shelf" : "Save"}</button></div></div></div>`;
    const grab = () => {
      const v = s => document.querySelector(s)?.value ?? "";
      d.name = v("#sh-name").trim().slice(0, 32); d.sort = v("#sh-sort") || d.sort;
      if (custom) { const r = { plat: v("#sh-plat"), status: v("#sh-status"), genre: v("#sh-genre").trim(), min: +v("#sh-min") || 0 }; d.rule = r.plat || r.status || r.genre || r.min ? r : null; Object.assign(R, r); }
    };
    const redraw = () => { grab(); const st = $("#scrim").scrollTop; $("#scrim").innerHTML = html(); $("#scrim").scrollTop = st; };
    openModal(html(), e => {
      const t = e.target;
      const o = t.closest("[data-sh]"); if (o) { grab(); d[o.dataset.sh] = o.dataset.v; redraw(); return; }
      const gb = t.closest("[data-shg]"); if (gb) { const gid = gb.dataset.shg; d.ids = d.ids.includes(gid) ? d.ids.filter(x => x !== gid) : [...d.ids, gid]; grab(); $("#sh-games").innerHTML = pick(); $("#sh-cnt").textContent = `Games on this shelf (${d.ids.length} added by hand)`; return; }
      if (t.closest("[data-shhide]")) { d.hidden = !d.hidden; redraw(); return; }
      if (t.closest("[data-shdel]")) { if (!sure) { sure = true; redraw(); return; } nook.shelves = nook.shelves.filter(s => s.id !== d.id); saveNook(); closeModal(); toast(`Shelf "${d.name || "Untitled"}" removed. Your games are untouched.`); return; }
      const save = () => { grab(); if (!d.name) d.name = custom ? "My shelf" : STATUS[d.status]; const S = nook.shelves, i = S.findIndex(s => s.id === d.id); if (i >= 0) S[i] = d; else { const at = S.findIndex(s => s.hidden); S.splice(at < 0 ? S.length : at, 0, d); } saveNook(); };
      if (t.closest("[data-shdeco]")) { save(); closeModal(); openDecor(d.id); return; }
      if (t.closest("[data-sharr]")) { save(); arranging = true; closeModal(); renderRack(); document.querySelector(`.shelf[data-shelf="${CSS.escape(d.id)}"]`)?.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" }); return; }
      if (t.closest("[data-shsave]")) { save(); closeModal(); toast(isNew ? `Built the "${d.name}" shelf` : "Shelf saved"); if (isNew) document.querySelector(`.shelf[data-shelf="${CSS.escape(d.id)}"]`)?.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" }); }
    }, null);
    root.oninput = e => { if (e.target.id === "sh-q") { q = e.target.value; $("#sh-games").innerHTML = pick(); } else if (e.target.id === "sh-name") { d.name = e.target.value; $("#sh-t").textContent = d.name || "Untitled shelf"; } };
    modalClose = () => { root.oninput = null; };
    if (isNew) setTimeout(() => $("#sh-name")?.focus(), 50);
  }
  function openNookManager(){
    const html = () => `<div class="modal shelfmod" role="dialog" aria-modal="true" aria-labelledby="nm-t"><div class="reshead"><div><span class="px">Your gamer's nook</span><h2 id="nm-t">Arrange shelves</h2></div><button class="btn small" type="button" data-mclose>Done</button></div>
      <div class="field"><span class="px">Room style</span><div class="scenepick">${SCENES.map(([k, n, d]) => `<button type="button" class="scn scn-${k}" data-nm-scene="${k}" aria-pressed="${nook.scene === k}"><span class="scnart" aria-hidden="true"><i></i><i></i><i></i></span><b>${n}</b><small>${d}</small></button>`).join("")}</div></div>
      <div class="field"><span class="px">Shelves, top to bottom</span><ol class="shelflist">${nook.shelves.map((s, i) => `<li class="${s.hidden ? "off" : ""}" style="--sc:${shelfColor(s, i)}"><i class="dot"></i><span><b>${esc(s.name)}</b><small>${s.kind === "status" ? "Status shelf" : s.rule ? "Smart shelf" : "Your shelf"} · ${shelfGames(s).length} games${s.hidden ? " · hidden" : ""}</small></span>
        <button type="button" class="ib" data-nm-up="${i}" aria-label="Move ${esc(s.name)} up" ${i ? "" : "disabled"}>↑</button><button type="button" class="ib" data-nm-down="${i}" aria-label="Move ${esc(s.name)} down" ${i < nook.shelves.length - 1 ? "" : "disabled"}>↓</button>
        <button type="button" class="ib" data-nm-vis="${i}" aria-pressed="${!s.hidden}" aria-label="${s.hidden ? "Show" : "Hide"} ${esc(s.name)}">${s.hidden ? "Show" : "Hide"}</button><button type="button" class="ib" data-nm-edit="${esc(s.id)}">Edit</button></li>`).join("")}</ol></div>
      <div class="mfoot"><button class="btn small" type="button" data-nm-new>+ New shelf</button><div class="r"><button class="btn primary" type="button" data-mclose>Done</button></div></div></div>`;
    const redraw = () => { const st = $("#scrim").scrollTop; $("#scrim").innerHTML = html(); $("#scrim").scrollTop = st; };
    openModal(html(), e => {
      const t = e.target, S = nook.shelves;
      const sc = t.closest("[data-nm-scene]"); if (sc) { nook.scene = sc.dataset.nmScene; saveNook(); redraw(); return; }
      const up = t.closest("[data-nm-up]"); if (up) { const i = +up.dataset.nmUp; [S[i - 1], S[i]] = [S[i], S[i - 1]]; saveNook(); redraw(); return; }
      const dn = t.closest("[data-nm-down]"); if (dn) { const i = +dn.dataset.nmDown; [S[i + 1], S[i]] = [S[i], S[i + 1]]; saveNook(); redraw(); return; }
      const vs = t.closest("[data-nm-vis]"); if (vs) { const s = S[+vs.dataset.nmVis]; s.hidden = !s.hidden; saveNook(); redraw(); return; }
      const ed = t.closest("[data-nm-edit]"); if (ed) { closeModal(); openShelf(ed.dataset.nmEdit); return; }
      if (t.closest("[data-nm-new]")) { closeModal(); openShelf(null); }
    });
  }
  let rackVisible = true;
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.target.classList.contains("hero")) en.target.classList.toggle("still", !en.isIntersecting); else rackVisible = en.isIntersecting; }));
    io.observe($(".hero")); io.observe($(".rack"));
  }
  function startSparks(){
    const cv = $("#sparks"); if (!cv || reduceMotion) return;
    const ctx = cv.getContext("2d"); let W = 0, H = 0;
    const resize = () => { const dpr = window.devicePixelRatio || 1; W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); addEventListener("resize", resize);
    const ps = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), s: 1 + Math.round(Math.random() * 2), vy: -(.00004 + Math.random() * .00012), k: Math.random(), p: Math.random() * 6.28 }));
    let last = performance.now(), cols = [];
    const readCols = () => { const cs = getComputedStyle(document.documentElement); cols = [cs.getPropertyValue("--lamp").trim(), cs.getPropertyValue("--lamp2").trim(), "255,216,107"]; };
    readCols(); new MutationObserver(readCols).observe(document.documentElement, { attributes: true, attributeFilter: ["data-lamp"] });
    const tick = t => {
      const dt = Math.min(50, t - last); last = t;
      if (!document.hidden && cv.clientWidth && rackVisible && settings.motion !== "off") {
        if (cv.clientWidth !== W || cv.clientHeight !== H) resize();
        ctx.clearRect(0, 0, W, H);
        for (const p of ps) {
          p.y += p.vy * dt; p.p += dt * .003;
          if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
          const a = .15 + .5 * (0.5 + 0.5 * Math.sin(p.p));
          ctx.fillStyle = `rgba(${cols[p.k < .45 ? 0 : p.k < .85 ? 1 : 2]},${a})`;
          ctx.fillRect(Math.round(p.x * W), Math.round(p.y * H), p.s * 2, p.s * 2);
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

