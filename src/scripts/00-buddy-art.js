/* ===== Co-op Buddies art: Pip (gouache), Vexa (cel), Rook (pulp), B.I.T. (arcade) ===== */
// Pip redesign — three concepts in the gouache storybook style.
// Canvas 240×260, ground ≈ y 244. PipArt.draw(concept "a"|"b"|"c", expression "neutral"|"happy"|"surprised").
(function (root) {
  "use strict";
  const sh = (d, fill, line, lw, extra = "") => `<path d="${d}" fill="${fill}"${line ? ` stroke="${line}" stroke-width="${lw}" stroke-linejoin="round" stroke-linecap="round"` : ""} ${extra}/>`;
  const ln = (d, c, w, extra = "") => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const el = (cx, cy, rx, ry, fill, line, lw, extra = "") => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${line ? ` stroke="${line}" stroke-width="${lw}"` : ""} ${extra}/>`;
  const sparkle = (x, y, s, c) => `<path d="M${x} ${y - s}Q${x + s * .15} ${y - s * .15} ${x + s} ${y}Q${x + s * .15} ${y + s * .15} ${x} ${y + s}Q${x - s * .15} ${y + s * .15} ${x - s} ${y}Q${x - s * .15} ${y - s * .15} ${x} ${y - s}Z" fill="${c}"/>`;
  const C = { fur: "#E0682C", furS: "#A8411B", furL: "#FFAE6C", cream: "#FFF6E6", creamS: "#EBD3AE", dark: "#3C1D14", darkL: "#6E3B28", belly: "#7A3A1E",
    scarf: "#1FB3A4", scarfS: "#0E766D", scarfL: "#8FF0E2", lea: "#93602F", leaS: "#5E3819", wood: "#EDC184", woodS: "#B17D45", gold: "#EDBB45",
    line: "#3A170B", eye: "#F2A132", eyeD: "#B8670F", eyeL: "#FFE19A", mouth: "#5A1810", tongue: "#F27C84", blush: "#FF7E7A", map: "#FFF1D2" };
  const L = C.line, W = 3;
  const S = (d, fill, extra = "") => sh(d, fill, L, W, extra);
  const LB = (d, w, fill) => ln(d, L, w + W * 2) + ln(d, fill, w);
  let uid = 0;

  const DEFS = `
  <filter id="pipPaint" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.07 0.22" numOctaves="3" seed="4" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1" result="g"/>
    <feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1="0.46" k2="0.81" k3="0" k4="-0.015" result="p"/>
    <feComposite in="p" in2="SourceGraphic" operator="in"/>
  </filter>
  <filter id="pipWobble" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" seed="9" result="t"/>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="2.3" xChannelSelector="R" yChannelSelector="G"/>
  </filter>`;

  // ---------- fluffy tail helper: tufts along the outer edge ----------
  // soft fluffy bumps along the tail's outer edge (drawn behind the tail so only the round tops show)
  // fur flicks: two tiny painted strokes poking out of the tail's outline
  const tuft = () => "";
  function stripedTail(d, stripes, tipD, tufts) {
    const id = "pt" + (++uid);
    return tufts + `<clipPath id="${id}"><path d="${d}"/></clipPath>${sh(d, C.fur)}<g clip-path="url(#${id})">
      ${stripes.map(s => ln(s, C.furS, 13)).join("")}${tipD ? sh(tipD, C.darkL) : ""}</g>${S(d, "none")}`;
  }

  // ---------- the face, built once and tuned per concept ----------
  // Drawn around (0,0) in a 112 × 94 head; v = concept settings
  const boots = (x1, x2, y) => S(`M${x1 - 14} ${y + 2}C${x1 - 16} ${y - 8} ${x1 - 8} ${y - 12} ${x1} ${y - 12}C${x1 + 10} ${y - 12} ${x1 + 13} ${y - 6} ${x1 + 12} ${y + 2}C${x1 + 4} ${y + 6} ${x1 - 8} ${y + 6} ${x1 - 14} ${y + 2}Z`, C.lea)
    + S(`M${x2 + 14} ${y + 2}C${x2 + 16} ${y - 8} ${x2 + 8} ${y - 12} ${x2} ${y - 12}C${x2 - 10} ${y - 12} ${x2 - 13} ${y - 6} ${x2 - 12} ${y + 2}C${x2 - 4} ${y + 6} ${x2 + 8} ${y + 6} ${x2 + 14} ${y + 2}Z`, C.lea)
    + ln(`M${x1 - 10} ${y - 6}C${x1 - 4} ${y - 9} ${x1 + 4} ${y - 9} ${x1 + 8} ${y - 6}M${x2 - 8} ${y - 6}C${x2 - 4} ${y - 9} ${x2 + 4} ${y - 9} ${x2 + 10} ${y - 6}`, C.wood, 1.8, 'opacity=".8"');
  const paw = (x, y, r = 6.8) => el(x, y, r, r * .92, C.dark, L, W) + el(x - r * .3, y - r * .35, r * .3, r * .22, C.darkL, "", 0, 'opacity=".9"');
  const sword = (gx, gy, ang, len = 56) => `<g transform="rotate(${ang} ${gx} ${gy})">${S(`M${gx - 4.5} ${gy - 10}V${gy - 10 - len}Q${gx} ${gy - 18 - len} ${gx + 4.5} ${gy - 10 - len}V${gy - 10}Z`, C.wood)}
    ${ln(`M${gx} ${gy - 14}V${gy - 8 - len}`, C.woodS, 1.6, 'opacity=".7"')}${S(`M${gx - 11} ${gy - 13}h22v6h-22z`, C.lea)}${S(`M${gx - 3.5} ${gy - 7}h7v14h-7z`, C.leaS)}${el(gx, gy + 10, 3.6, 3.6, C.gold, L, 1.6)}</g>`;
  const satchelBag = (x, y, w, h) => S(`M${x} ${y + 8}C${x} ${y + 2} ${x + 4} ${y} ${x + 10} ${y}H${x + w - 10}C${x + w - 4} ${y} ${x + w} ${y + 2} ${x + w} ${y + 8}L${x + w - 2} ${y + h - 6}C${x + w - 3} ${y + h - 1} ${x + w - 7} ${y + h} ${x + w - 12} ${y + h}H${x + 12}C${x + 7} ${y + h} ${x + 3} ${y + h - 1} ${x + 2} ${y + h - 6}Z`, C.lea)
    + S(`M${x} ${y + 8}C${x} ${y + 2} ${x + 4} ${y} ${x + 10} ${y}H${x + w - 10}C${x + w - 4} ${y} ${x + w} ${y + 2} ${x + w} ${y + 8}L${x + w - 1} ${y + h * .42}C${x + w * .7} ${y + h * .55} ${x + w * .3} ${y + h * .55} ${x + 1} ${y + h * .42}Z`, C.leaS)
    + el(x + w / 2, y + h * .48, 3.4, 3.4, C.gold, L, 1.5);
  const mapRoll = (x, y, a) => `<g transform="rotate(${a} ${x} ${y})">${S(`M${x - 4} ${y}v-16h8v16z`, C.map)}${ln(`M${x - 4} ${y - 10}h8`, "#C2453B", 1.8)}</g>`;
  const shadow = (cx, rx) => el(cx, 247, rx, 7, "#3A170B", "", 0, 'opacity=".16"');
  const paint = inner => `<g filter="url(#pipWobble)"><g filter="url(#pipPaint)">${inner}</g></g>`;
  const fxFor = (e, x, y) => e === "happy" ? sparkle(x, y, 7, "#FFE07A") + sparkle(x + 16, y + 22, 4, C.scarfL) + sparkle(240 - x - 10, y + 6, 5, "#FFE07A")
    : e === "surprised" ? `<g stroke="#F6B73C" stroke-width="3" stroke-linecap="round"><path d="M${x} ${y}l4 -12M${x + 14} ${y + 6}l10 -7M${x - 12} ${y + 2}l-3 -12"/></g>` : "";

  // ======================= HYBRID — A's face and body, C's curl, B's confidence =======================
  const heart = (x, y, s, c) => `<path d="M${x} ${y + s * .9}C${x - s * 1.4} ${y - s * .1} ${x - s * .9} ${y - s * 1.2} ${x} ${y - s * .45}C${x + s * .9} ${y - s * 1.2} ${x + s * 1.4} ${y - s * .1} ${x} ${y + s * .9}Z" fill="${c}"/>`;
  function face2(e) {
    const surpr = e === "surprised", happy = e === "happy", sad = e === "sad", aff = e === "affectionate", det = e === "determined", fru = e === "frustrated", thk = e === "thinking", slp = e === "sleepy";
    const earRot = { sad: 22, surprised: -10, happy: -4, affectionate: 8, determined: -8, frustrated: 12, thinking: 4, sleepy: 26 }[e] || 0;
    const ear = side => `<g transform="translate(${side * 37} -37) rotate(${side * earRot})">${S("M-18 8C-21 -14 -12 -33 0 -35C12 -33 21 -14 18 8Z", C.fur)}
      ${sh("M-13 4C-15 -12 -8 -26 0 -28C8 -26 15 -12 13 4Z", C.cream)}${sh("M-8 3C-9 -8 -4 -18 0 -19C4 -18 9 -8 8 3Z", C.darkL)}
      ${ln("M-6 2l2 -7M0 3v-8M6 2l-2 -7", C.cream, 2.2, 'opacity=".9"')}${ln(`M${side * -14} -14q${side * 3} -10 ${side * 10} -16`, C.furL, 2, 'opacity=".6"')}</g>`;
    const browY = { surprised: -5, determined: 2, frustrated: 3, sleepy: 2 }[e] || 0;
    const browR = sad ? 18 : det ? -16 : fru ? -22 : 0;
    const head = `<g transform="scale(1.02)">
      ${S("M-52 2C-62 4 -68 12 -64 20C-60 19 -58 22 -62 28C-54 30 -47 26 -44 18Z", C.fur)}${S("M52 2C62 4 68 12 64 20C60 19 58 22 62 28C54 30 47 26 44 18Z", C.fur)}
      ${S("M-56 4C-58 -29 -32 -49 0 -49C32 -49 58 -29 56 4C55 30 30 46 0 46C-30 46 -55 30 -56 4Z", C.fur)}
      ${sh("M56 4C55 30 30 46 0 46C24 40 44 26 50 -6Z", C.furS, "", 0, 'opacity=".5"')}
      ${sh("M-48 -10C-46 -32 -28 -45 -6 -47C-26 -40 -38 -28 -42 -8Z", C.furL, "", 0, 'opacity=".6"')}
      ${ln("M-22 -40q6 -5 13 -3M2 -43q7 -3 13 1M-38 -27q3 -6 10 -8M20 -38q6 0 11 4", C.furL, 2, 'opacity=".75"')}${ln("M38 24q-6 6 -14 9M46 10q-2 6 -6 10", C.furS, 2.2, 'opacity=".6"')}
      ${sh("M-47 12C-51 -2 -41 -8 -31 3C-25 11 -15 10 -9 7C-4 5 4 5 9 7C15 10 25 11 31 3C41 -8 51 -2 47 12C43 32 23 45 0 45C-23 45 -43 32 -47 12Z", C.cream)}
      ${sh("M40 26C32 38 18 45 0 45C16 40 30 32 38 20Z", C.creamS, "", 0, 'opacity=".6"')}
      
      ${el(0, 21, 16.5, 11.5, C.cream)}${sh("M-15 25C-8 33.5 8 33.5 15 25C8 29 -8 29 -15 25Z", C.creamS, "", 0, 'opacity=".85"')}${el(-5, 14, 6, 2.6, "#fff", "", 0, 'opacity=".7"')}
      ${el(-23, -24 + browY, 8.5, 4.6, C.cream, "", 0, `transform="rotate(${-10 + browR} -23 ${-24 + browY})"`)}${el(23, -25 + browY - (e === "neutral" || thk ? (thk ? 5 : 2) : 0), 8.5, 4.6, C.cream, "", 0, `transform="rotate(${(e === "neutral" ? 4 : 10) - browR} 23 ${-25 + browY})"`)}
      ${ln("M-15 13C-18 22 -17 30 -11 37", C.furS, 5.5)}${ln("M15 13C18 22 17 30 11 37", C.furS, 5.5)}</g>`;
    const eye = x => {
      const side = x < 0 ? -1 : 1, y = 2, rx = 12.5 * (surpr ? 1.08 : 1), ry = 14.5 * (surpr ? 1.12 : 1), pr = surpr ? .4 : .6;
      const dx = aff ? 2.5 : thk ? -3 : 0, dy = sad ? 2.5 : thk ? 3 : 0;
      if (slp) return ln(`M${x - rx} ${y + 3}C${x - rx * .4} ${y + 9} ${x + rx * .4} ${y + 9} ${x + rx} ${y + 3}`, L, 3.4) + ln(`M${x + side * rx} ${y + 3}l${side * 3} 3`, L, 2);
      let s = el(x, y, rx + 2, ry + 2, L) + el(x, y, rx, ry, C.eye)
        + sh(`M${x - rx} ${y}C${x - rx} ${y - ry * 1.05} ${x + rx} ${y - ry * 1.05} ${x + rx} ${y}C${x + rx * .6} ${y - ry * .45} ${x - rx * .6} ${y - ry * .45} ${x - rx} ${y}Z`, C.eyeD, "", 0, 'opacity=".3"')
        + el(x, y + ry * .55, rx * .62, ry * .3, C.eyeL, "", 0, 'opacity=".75"') + el(x, y, rx * .82, ry * .84, "none", C.eyeD, 1.2, 'opacity=".35"')
        + el(x + 1 + dx, y + 1.5 + dy, rx * pr * 1.04, ry * pr, "#1C0B06");
      s += aff ? heart(x - rx * .28 + dx * .4, y - ry * .3, rx * .3, "#fff") + el(x + rx * .38, y + ry * .36, rx * .14, rx * .14, "#fff")
        : el(x - rx * .3 + dx * .4, y - ry * .34 + dy * .3, rx * .36, ry * .3, "#fff") + el(x + rx * .38, y + ry * .36, rx * .15, rx * .15, "#fff");
      if (sad) { const out = y - ry * .25, inn = y - ry * .95, xo = x + side * (rx + 4), xi = x - side * (rx + 4);
        s += sh(`M${xo} ${y - ry - 6}L${xi} ${y - ry - 6}L${xi} ${inn}L${xo} ${out}Z`, C.fur) + ln(`M${x + side * (rx + 1)} ${out + .5}L${x - side * (rx + 1)} ${inn + 1}`, L, 2.6)
          + el(x + rx * .2, y + ry * .62, rx * .5, 2.2, "#BFE8FF", "", 0, 'opacity=".9"'); }
      if (det || fru) { const out = y - ry * .9, inn = y - ry * (fru ? .22 : .38), xo = x + side * (rx + 4), xi = x - side * (rx + 4);
        s += sh(`M${xo} ${y - ry - 6}L${xi} ${y - ry - 6}L${xi} ${inn}L${xo} ${out}Z`, C.fur) + ln(`M${x + side * (rx + 1)} ${out + .5}L${x - side * (rx + 1)} ${inn + 1}`, L, 2.8); }
      if (thk) s += sh(`M${x - rx - 3} ${y - ry - 5}H${x + rx + 3}V${y - ry * .5}H${x - rx - 3}Z`, C.fur) + ln(`M${x - rx} ${y - ry * .5 + 1}H${x + rx}`, L, 2.6);
      if (happy || aff) s += sh(`M${x - rx - 3} ${y + ry * .72}C${x - rx * .4} ${y + ry * .3} ${x + rx * .4} ${y + ry * .3} ${x + rx + 3} ${y + ry * .72}V${y + ry + 4}H${x - rx - 3}Z`, C.cream)
        + ln(`M${x - rx + 1} ${y + ry * .7}C${x - rx * .4} ${y + ry * .34} ${x + rx * .4} ${y + ry * .34} ${x + rx - 1} ${y + ry * .7}`, L, 2.4) + sparkle(x + rx * .25, y - ry * .05, rx * .22, "#fff");
      return s;
    };
    const nose = S("M-7 15C-7 10 7 10 7 15C7 18.5 3.5 21 0 21C-3.5 21 -7 18.5 -7 15Z", "#2A120C") + el(-2.4, 13.4, 2.4, 1.3, "#fff", "", 0, 'opacity=".6"');
    const my = 21;
    const mouth = {
      neutral: ln(`M0 ${my}V${my + 3}M-8 ${my + 4}C-5 ${my + 8} -1 ${my + 7} 0 ${my + 3}C1 ${my + 7} 6 ${my + 7.5} 9.5 ${my + 2}`, L, 2.4) + ln(`M11 ${my + 1}l2 -1.4`, L, 1.6),
      happy: S(`M-12 ${my + 2}C-9 ${my + 17} 9 ${my + 17} 12 ${my + 2}C4 ${my + 5} -4 ${my + 5} -12 ${my + 2}Z`, C.mouth) + sh(`M-6 ${my + 11}C-3 ${my + 15} 3 ${my + 15} 6 ${my + 11}C2 ${my + 8} -2 ${my + 8} -6 ${my + 11}Z`, C.tongue),
      surprised: S(`M-5 ${my + 7}C-5 ${my + 2} 5 ${my + 2} 5 ${my + 7}C5 ${my + 13} -5 ${my + 13} -5 ${my + 7}Z`, C.mouth) + el(0, my + 10, 3, 1.8, C.tongue),
      sad: ln(`M0 ${my}V${my + 3}M-7 ${my + 8}C-4 ${my + 4} 4 ${my + 4} 7 ${my + 8}`, L, 2.4),
      affectionate: ln(`M0 ${my}V${my + 3}M-8 ${my + 4}C-5 ${my + 8} -1 ${my + 7} 0 ${my + 3}C1 ${my + 7} 5 ${my + 8} 8 ${my + 4}`, L, 2.4),
      determined: ln(`M0 ${my}V${my + 3}M-8 ${my + 5}C-3 ${my + 8} 4 ${my + 8} 10 ${my + 3}`, L, 2.6) + sh(`M4 ${my + 6.4}l1.6 3.4 1.8-3.8z`, "#fff", L, .9),
      frustrated: S(`M-6 ${my + 9}C-6 ${my + 5} 6 ${my + 5} 6 ${my + 9}C3 ${my + 7} -3 ${my + 7} -6 ${my + 9}Z`, C.mouth) + ln(`M0 ${my}V${my + 4}`, L, 2.2),
      thinking: ln(`M0 ${my}V${my + 3}M-2 ${my + 6}C2 ${my + 4} 6 ${my + 5} 9 ${my + 6}`, L, 2.4),
      sleepy: S(`M-3 ${my + 7}C-3 ${my + 4} 3 ${my + 4} 3 ${my + 7}C3 ${my + 10} -3 ${my + 10} -3 ${my + 7}Z`, C.mouth) + ln(`M0 ${my}V${my + 3}`, L, 2)
    }[e];
    const bo = happy || aff || fru ? .7 : sad ? .3 : .45;
    const cheekR = fru ? 1.35 : 1;
    const blush = (fru ? ln("M-46 10l-6 -2M-46 16l-7 1M46 10l6 -2M46 16l7 1", L, 1.8, 'opacity=".7"') : "") + el(-37, 19, 8.5 * cheekR, 4.6 * cheekR, C.blush, "", 0, `opacity="${bo}"`) + el(37, 19, 8.5 * cheekR, 4.6 * cheekR, C.blush, "", 0, `opacity="${bo}"`)
      + (aff ? ln("M-41 17l3 -3M-36 18l3 -3M35 18l3 -3M40 17l3 -3", "#E4545A", 1.6, 'opacity=".7"') : "");
    return ear(-1) + ear(1) + head + eye(-23) + eye(23) + nose + mouth + blush;
  }
  function H(e = "neutral") {
    const sad = e === "sad", aff = e === "affectionate", det = e === "determined", fru = e === "frustrated", thk = e === "thinking", slp = e === "sleepy";
    // C's curl, mirrored to his left and scaled down to balance the body
    const spiral = "M108 208C80 232 24 222 16 182C10 148 32 124 58 126C80 128 90 148 84 166C80 178 66 182 58 174";
    const tail = `<g transform="translate(100 212) scale(.84) translate(-108 -208)">${ln(spiral, L, 31)}${ln(spiral, C.fur, 25)}
      ${ln(spiral, C.furS, 25, 'stroke-dasharray="11 15" stroke-dashoffset="4"')}${ln("M84 166C80 178 66 182 58 174", C.darkL, 17)}
      ${ln("M92 224C60 230 22 212 18 176", C.furL, 3.4, 'opacity=".5"')}${ln("M36 140C46 130 58 128 66 130", C.furL, 2.6, 'opacity=".55"')}
      ${ln("M40 210q-6 -2 -10 -6M22 190q-3 -5 -4 -10M24 152q2 -6 6 -9", C.furS, 2, 'opacity=".55"')}</g>`;
    const boot = (x, flip, rot) => `<g transform="rotate(${rot} ${x} 236)">${S(`M${x - 14 * flip} 238C${x - 16 * flip} 228 ${x - 8 * flip} 224 ${x} 224C${x + 10 * flip} 224 ${x + 13 * flip} 230 ${x + 12 * flip} 238C${x + 4 * flip} 242 ${x - 8 * flip} 242 ${x - 14 * flip} 238Z`, C.lea)}
      ${S(`M${x - 11} 226C${x - 6} 221 ${x + 6} 221 ${x + 10} 226L${x + 10} 230C${x + 4} 227 ${x - 6} 227 ${x - 11} 230Z`, C.wood)}${ln(`M${x - 12 * flip} 239C${x - 4 * flip} 241 ${x + 6 * flip} 241 ${x + 11 * flip} 238`, C.leaS, 2.4)}</g>`;
    const legs = LB("M107 212L103 228", 15, C.dark) + LB("M133 212L138 228", 15, C.dark) + ln("M104 214L102 224", C.darkL, 2.4, 'opacity=".7"') + boot(101, 1, -6) + boot(139, -1, 4);
    const body = S("M85 186C83 160 100 144 120 144C140 144 157 160 155 186C155 210 140 222 120 222C100 222 85 210 85 186Z", C.fur)
      + sh("M155 186C155 210 140 222 120 222C138 214 148 200 149 178Z", C.furS, "", 0, 'opacity=".45"') + sh("M90 182C90 164 100 152 112 148C102 158 96 168 96 184Z", C.furL, "", 0, 'opacity=".45"')
      + sh("M108 160C105 176 108 198 120 204C132 198 135 176 132 160C126 156 114 156 108 160Z", C.belly) + ln("M114 172q6 3 12 0M114 184q6 3 12 0", "#9A4E28", 2, 'opacity=".6"')
      + S("M89 170C91 156 101 148 112 146L110 194C100 195 92 190 90 182Z", C.lea) + S("M151 170C149 156 139 148 128 146L130 194C140 195 148 190 150 182Z", C.lea)
      + sh("M139 152C146 158 150 168 150 182C148 188 144 192 140 194L136 160Z", C.leaS, "", 0, 'opacity=".7"')
      + ln("M110 148L108 192M130 148L132 192", "#C99560", 1.8, 'opacity=".9"') + ln("M93 186C98 190 104 192 109 192M131 192C137 192 143 190 147 186", "#D9A870", 1.3, 'stroke-dasharray="2.4 2.8"')
      + S("M134 170h12v9h-12z", C.leaS) + ln("M134 173.5h12", "#C99560", 1.2)
      + S("M110 148L103 158L113 156Z", C.leaS) + S("M130 148L137 158L127 156Z", C.leaS)
      + S("M87 192C104 200 136 200 153 192L152 199C136 207 104 207 88 199Z", "#4A2810") + S("M115 195.5h10v9h-10z", C.gold) + `<rect x="118" y="198.5" width="4" height="3" fill="#4A2810"/>`;
    const strap = LB("M98 150L148 188", 4.4, C.leaS) + ln("M100 150L148 186", "#B07A42", 1.2, 'opacity=".8"');
    const bag = mapRoll(138, 184, -12) + mapRoll(146, 182, 10)
      + S("M128 192C128 186 132 183 138 183H158C164 183 167 186 167 192L165 212C164 217 161 219 156 219H140C135 219 131 217 130 212Z", C.lea)
      + sh("M164 192L163 212C162 216 160 218 156 219C160 214 161 204 161 192Z", C.leaS, "", 0, 'opacity=".7"')
      + S("M128 192C128 186 132 183 138 183H158C164 183 167 186 167 192L166 200C156 205 140 205 129 200Z", C.leaS)
      + ln("M131 197C140 201 156 201 164 197", "#C99560", 1.2, 'stroke-dasharray="2.2 2.6"') + S("M145 199h6v11h-6z", "#4A2810") + S("M144 205h8v6h-8z", C.gold)
      + ln("M132 186C140 184 156 184 162 186", "#C99560", 1.6, 'opacity=".7"');
    const scarf = S("M98 160C92 170 90 184 94 196C100 192 104 186 104 178C104 172 104 166 102 162Z", C.scarfS) + ln("M94 196l-1 5M98 194l1 5M102 190l2 4", C.scarfS, 2)
      + S("M95 160C84 166 78 178 78 190C84 190 90 184 92 176Z", C.scarf) + ln("M78 190l-2 5M82 189l0 5M86 186l2 4", C.scarf, 2) + ln("M90 168C86 174 84 180 83 186", C.scarfS, 1.6, 'opacity=".7"')
      + S("M90 144C104 156 136 156 150 144C154 151 152 159 145 162C130 168 110 168 95 162C88 159 86 151 90 144Z", C.scarf)
      + ln("M95 152C110 160 130 160 145 152", C.scarfS, 2.4, 'opacity=".6"') + ln("M97 147C112 153 128 153 143 147", C.scarfL, 2, 'opacity=".8"')
      + el(96, 158, 8, 7, C.scarf, L, W) + ln("M92 156q4 4 8 1", C.scarfS, 1.6);
    const mapHeld = S("M98 168L142 164L145 194L100 198Z", C.map) + sh("M100 170L140 166L142 172L101 176Z", "#E9D4A8", "", 0, 'opacity=".7"')
      + ln("M106 190q8 -8 16 -4t14 -10", "#B0453A", 1.8, 'stroke-dasharray="3 2.6"') + ln("M112 184l4 4m0-4l-4 4", "#B0453A", 2)
      + `<g transform="rotate(180 132 186)"><path d="M132 180l3 8-3-2-3 2z" fill="#3A2A1A"/><text x="129.5" y="179" font-size="6" font-weight="700" fill="#3A2A1A" font-family="Georgia,serif">N</text></g>`;
    const armL = thk ? LB("M92 158C88 170 92 180 100 182", 11, C.dark) + paw(101, 182)
      : slp ? LB("M92 160C88 172 92 184 100 190", 11, C.dark) + paw(101, 191)
      : aff ? LB("M93 158C88 170 98 178 110 176", 11, C.dark) + paw(112, 175)
      : LB("M92 158C82 166 82 180 90 188", 11, C.dark) + ln("M89 162C84 168 84 176 87 182", C.darkL, 2.4, 'opacity=".7"') + paw(91, 189);
    const swordAng = sad ? 168 : det ? 10 : 30;
    const swordG = `<g transform="rotate(${swordAng} 150 172)">${S("M146 162V122Q150 113 154 122V162Z", C.wood)}${ln("M150 158V124M148 150v-10", C.woodS, 1.4, 'opacity=".7"')}${S("M154 132l-3 2 3 2z", C.woodS)}
      ${S("M140 159h20v6h-20z", C.woodS)}${S("M146.5 165h7v13h-7z", C.leaS)}${ln("M146.5 168l7 2M146.5 172l7 2M146.5 176l7 2", "#B07A42", 1.1)}${el(150, 181, 3.4, 3.4, C.gold, L, 1.5)}</g>`;
    const armR = thk ? LB("M148 158C152 170 148 178 142 180", 11, C.dark) + paw(141, 180)
      : slp ? LB("M148 160C152 172 148 184 140 190", 11, C.dark) + paw(139, 191)
      : fru ? LB("M148 160C160 168 160 184 154 190", 11, C.dark) + paw(153, 191)
      : aff ? LB("M147 158C152 170 142 178 130 176", 11, C.dark) + paw(128, 175)
      : LB("M147 160C157 166 157 174 151 174", 11, C.dark) + ln("M150 162C155 166 155 170 153 172", C.darkL, 2.4, 'opacity=".7"') + paw(150, 172);
    const head = `<g transform="translate(120 ${sad ? 96 : slp ? 98 : 92}) rotate(${{ sad: 4, affectionate: 8, sleepy: 12, thinking: 6, determined: -2, frustrated: -1 }[e] ?? -5})">${face2(e)}</g>`;
    const fx = e === "happy" ? sparkle(194, 40, 7, "#FFE07A") + sparkle(210, 64, 4, C.scarfL) + sparkle(40, 44, 5, "#FFE07A")
      : e === "surprised" ? `<g stroke="#F6B73C" stroke-width="3" stroke-linecap="round"><path d="M188 42l4 -12M200 50l10 -7M176 40l-3 -12"/></g>`
      : aff ? heart(186, 46, 7, "#FF7E96") + heart(202, 70, 4.5, "#FFA3B5") + heart(52, 52, 4, "#FF7E96")
      : det ? sparkle(196, 44, 7, "#FFE07A") + sparkle(46, 60, 5, C.scarfL)
      : fru ? `<g stroke="#E2453C" stroke-width="3" stroke-linecap="round" fill="none"><path d="M182 36q6 0 6 -6M198 36q-6 0 -6 -6M182 44q6 0 6 6M198 44q-6 0 -6 6"/></g>`
      : thk ? `<g fill="#fff" stroke="${L}" stroke-width="2"><circle cx="180" cy="52" r="3"/><circle cx="190" cy="42" r="4.5"/><text x="198" y="34" font-size="20" font-weight="800" fill="#7A5BD0" stroke="none" font-family="Georgia,serif">?</text></g>`
      : slp ? `<g fill="#7A5BD0" font-family="Georgia,serif" font-weight="700"><text x="170" y="52" font-size="18">z</text><text x="184" y="38" font-size="13">z</text><text x="194" y="26" font-size="9">z</text></g>` : "";
    const body2 = sad || slp ? `<g transform="translate(0 ${slp ? 5 : 3})">` : "<g>";
    return shadow(116, 70) + paint(`<g transform="rotate(-2 120 240)">${tail + legs + body2 + body + strap + bag + scarf + (aff || fru || thk || slp ? "" : swordG) + armL + (thk ? mapHeld : "") + "</g>" + head + armR}</g>`) + fx;
  }

  root.PipArt = { DEFS, draw: e => H(e), FACE: "52 22 136 132" };
})(window);

// Save Point Co-op Buddies — approved designs, nine expressions each.
// Vexa: couture cel · Rook: pulp cover · B.I.T.: polished arcade. (Pip lives in pip.js.)
// Canvas 240×260, ground ≈ y 244. Expressions: neutral happy sad surprised affectionate determined frustrated thinking sleepy.
(function (root) {
  "use strict";
  const sh = (d, fill, line, lw, join = "round", extra = "") =>
    `<path d="${d}" fill="${fill}"${line ? ` stroke="${line}" stroke-width="${lw}" stroke-linejoin="${join}" stroke-linecap="round"` : ""} ${extra}/>`;
  const ln = (d, c, w, extra = "") => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const limb = (d, w, fill, line, lw) => ln(d, line, w + lw * 2) + ln(d, fill, w);
  const el = (cx, cy, rx, ry, fill, line, lw, extra = "") => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${line ? ` stroke="${line}" stroke-width="${lw}"` : ""} ${extra}/>`;
  const sparkle = (x, y, s, c) => `<path d="M${x} ${y - s}Q${x + s * .15} ${y - s * .15} ${x + s} ${y}Q${x + s * .15} ${y + s * .15} ${x} ${y + s}Q${x - s * .15} ${y + s * .15} ${x - s} ${y}Q${x - s * .15} ${y - s * .15} ${x} ${y - s}Z" fill="${c}"/>`;
  const PX = (x, y, map, s, c) => map.map((row, j) => [...row].map((ch, i) => ch === "#" ? `<rect x="${x + i * s}" y="${y + j * s}" width="${s + .05}" height="${s + .05}" fill="${c}"/>` : "").join("")).join("");
  const zzz = (x, y, c, font = "'Chakra Petch',system-ui,sans-serif") => `<g fill="${c}" font-family="${font}" font-weight="700"><text x="${x}" y="${y}" font-size="18">Z</text><text x="${x + 14}" y="${y - 14}" font-size="13">z</text><text x="${x + 24}" y="${y - 26}" font-size="9">z</text></g>`;
  const tearDrop = (x, y, c = "#9FDCFF", o = "#2B5A86") => `<path d="M${x} ${y}c-3 5-4 8-4 10a4 4 0 0 0 8 0c0-2-1-5-4-10z" fill="${c}" stroke="${o}" stroke-width="1.4"/>`;
  let uid = 0;

  const DEFS = `
  <pattern id="vexScan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.3" fill="#000" opacity=".22"/></pattern>
  <pattern id="rookDotsBig" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(20)"><circle cx="3.5" cy="3.5" r="2" fill="#1A1020" opacity=".5"/></pattern>
  <pattern id="rookDotsRed" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="3" cy="3" r="1.8" fill="#E3322C" opacity=".55"/></pattern>
  <pattern id="bitScan" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="1" fill="#fff" opacity=".06"/></pattern>
  <filter id="bitGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <radialGradient id="bitShine" cx=".32" cy=".26" r=".75"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#FBF5E8"/><stop offset="1" stop-color="#E4D9C1"/></radialGradient>`;

  // =====================================================================
  // VEXA — couture cel
  // =====================================================================
  function vexa(e = "neutral") {
    const C = { fur: "#1C1929", furS: "#0B0912", rim: "#A788FF", muz: "#2C2840", earIn: "#7B4DFF", fr: "#8E52FF", frS: "#5A22C9", frL: "#D2B4FF",
      jk: "#F5F3FC", jkS: "#BEB6DE", lin: "#22E3F2", top: "#14121E", sk: "#2C2545", skS: "#17121F", pleat: "#8E52FF",
      sock: "#F5F3FC", sockS: "#BEB6DE", boot: "#1C1929", bootS: "#0B0912", sole: "#22E3F2", metal: "#CDD1DF", metalS: "#8C92A8",
      eye: "#B86BFF", eyeS: "#6A22D0", neon: "#22E3F2", neon2: "#FF3FA4", line: "#07060C", dim: "#3E6A78" };
    const L = C.line, W = 2.1, id = "vx" + (++uid);
    const S = (d, fill, extra = "") => sh(d, fill, L, W, "miter", 'stroke-miterlimit="6" ' + extra);
    const F = (d, fill, extra = "") => sh(d, fill, "", 0, "miter", extra);
    const is = k => e === k;
    const droop = is("affectionate") || is("sad") || is("sleepy");
    // tail
    const tailD = droop ? "M136 186L168 202L186 190L178 168L196 152L212 160"
      : is("frustrated") ? "M136 186L174 192L186 164L210 158L202 132L228 116"
      : "M136 186L172 198L194 176L184 148L206 126L222 134";
    const tail = ln(tailD, L, 14, 'stroke-linejoin="miter" stroke-linecap="butt"') + ln(tailD, C.fur, 9.6, 'stroke-linejoin="miter" stroke-linecap="butt"')
      + (droop ? "" : is("frustrated") ? ln("M214 104l8 -6M220 112l10 -2M206 100l2 -9", L, 2) : S("M186 156l10 -4 4 9 -10 4z", C.metal) + F("M190 157l4 -1.6 1.6 3.6 -4 1.6z", C.neon))
      + (droop ? PX(212, 152, ["#.", ".#"], 4, C.neon) : is("frustrated") ? "" : PX(222, 124, [".#", "#.", ".#"], 4, C.neon) + `<rect x="232" y="118" width="3" height="3" fill="${C.neon2}"/>`);
    const legs = S("M106 184L112 186L108 232L100 232Z", C.sock) + S("M128 184L136 182L144 206L138 232L130 232L134 208Z", C.sock)
      + F("M110 186L112 186L108 232L104 232Z", C.sockS) + F("M136 184L144 206L138 232L134 232L138 206Z", C.sockS) + ln("M101 210L111 210M133 210L143 208", C.pleat, 2.4);
    const boots = S("M92 220L112 218L115 236L113 246L90 246L89 236Z", C.boot) + F("M106 219L112 218L115 236L113 246L106 246Z", C.bootS) + ln("M92 226h20", C.neon, 1.4)
      + S("M126 230L146 228L151 236L149 246L125 246L124 238Z", C.boot) + F("M140 229L146 228L151 236L149 246L140 246Z", C.bootS) + F("M90 242H113V246H90ZM125 242H149V246H125Z", is("sleepy") ? C.dim : C.sole);
    const skirt = S("M100 166L146 162L166 210L148 198L139 212L127 199L114 212L104 198L92 206Z", C.sk) + F("M127 164L146 162L166 210L148 198L139 212L127 199Z", C.skS)
      + ln("M114 168L114 212M127 166L127 199M139 165L139 212", C.pleat, 1.4) + ln("M92 206L104 198L114 212L127 199L139 212L148 198L166 210", C.neon, 1.6);
    const torso = S("M106 124L134 122L144 166L100 168Z", C.top) + F("M120 123L134 122L144 166L124 167Z", C.furS, 'opacity=".6"') + S("M110 124L120 140L130 123Z", C.fur) + ln("M106 126L102 140", C.neon2, 2.2);
    const belt = S("M97 160L149 156L151 166L98 170Z", C.metal) + F("M128 158L149 156L151 166L128 168Z", C.metalS) + [104, 116, 128, 140].map(x => F(`M${x} 162h6v3h-6z`, is("sleepy") ? C.dim : C.neon)).join("");
    const jacket = S("M102 132L86 138L80 164L98 166L104 148L110 136Z", C.jk) + F("M90 138L86 138L80 164L88 165Z", C.jkS)
      + S("M130 116L148 122L158 162L140 166L136 144L126 126Z", C.jk) + F("M138 120L148 122L158 162L148 164Z", C.jkS) + ln("M96 140L92 162M138 130L148 160", C.lin, 1.5)
      + S("M142 76L166 102L156 126L118 134L130 108Z", C.jk) + F("M142 76L130 108L118 134L134 116Z", C.lin) + F("M160 96L166 102L156 126L144 128Z", C.jkS)
      + ln("M152 96L158 104M149 102L155 110", C.metalS, 1.4) + F("M98 160h10v8h-10z", C.neon2) + `<text x="99.5" y="166.6" font-size="6" font-weight="900" fill="#fff" font-family="ui-monospace,monospace">V</text>`;
    const handOnHip = S("M100 132L80 146L72 166L84 172L92 152L104 140Z", C.jk) + F("M80 148L72 166L80 169Z", C.jkS)
      + S("M70 160L88 156L98 172L82 178Z", C.lin) + S("M94 166C98 162 106 164 106 170C106 176 98 178 94 174Z", C.top) + ln("M98 168h6M98 172h5", C.fur, 2.6);
    const raised = S("M144 120L170 108L184 120L156 138Z", C.jk) + F("M160 130L184 120L170 108L174 116Z", C.jkS)
      + S("M168 116L184 118L182 98L168 98Z", C.jk) + F("M176 118L184 118L182 98L176 98Z", C.jkS) + S("M166 98L184 98L184 92L166 92Z", C.lin)
      + S("M164 93C162 85 167 80 174 80C181 80 186 85 184 93Z", C.top) + el(166.5, 80, 2.6, 4.2, C.fur, L, W, 'transform="rotate(-20 166.5 80)"') + el(173, 76.5, 2.6, 4.4, C.fur, L, W) + el(179.5, 78, 2.6, 4.2, C.fur, L, W, 'transform="rotate(18 179.5 78)"')
      + S("M165 100h20v5h-20z", C.metal) + F("M170 101h6v3h-6z", C.neon);
    const toFace = S("M144 120L164 124L166 140L148 140Z", C.jk) + S("M156 130L170 136L160 110L150 112Z", C.jk) + F("M162 134L170 136L164 120Z", C.jkS) + S("M148 108C146 100 152 96 158 98C164 100 164 108 160 112Z", C.top);
    const armDown = S("M144 120L160 126L166 156L150 158Z", C.jk) + F("M156 125L160 126L166 156L159 157Z", C.jkS) + S("M149 152L167 150L168 158L150 160Z", C.lin)
      + S("M151 160C150 170 164 171 166 162Z", C.top) + S("M149 146h17v5h-17z", C.metal) + F("M154 147h6v3h-6z", is("sleepy") ? C.dim : C.neon);
    const crossed = S("M102 132L84 142L84 158L134 154L138 144L106 146Z", C.jk) + F("M84 150L84 158L134 154L134 150Z", C.jkS) + S("M132 142L142 140L144 154L134 156Z", C.top)
      + S("M142 120L158 128L160 150L110 160L104 150L140 144Z", C.jk) + F("M150 124L158 128L160 150L152 152Z", C.jkS) + S("M104 148L112 146L114 160L106 162Z", C.lin)
      + S("M96 148C92 144 96 140 102 142L104 150Z", C.top);
    let armL = handOnHip, armR = raised;
    if (is("frustrated")) { armL = ""; armR = crossed; }
    else if (is("affectionate")) armR = toFace;
    else if (droop) armR = armDown;
    const holoFrame = (d, extra) => sh(d, C.neon, C.neon, 1.4, "miter", 'fill-opacity=".14"') + extra;
    const beam = F("M170 72L180 74L222 56L208 42Z", C.neon, 'opacity=".16"');
    const txt = (t, x, y, c = C.neon, s = 19) => `<text x="0" y="0" font-size="${s}" font-weight="900" fill="${c}" font-family="ui-monospace,Menlo,monospace" transform="translate(${x} ${y}) skewY(-9)">${t}</text>`;
    const holo = {
      neutral: beam + holoFrame("M196 24L232 18L232 52L196 58Z", ln("M202 32l20 -3M202 39l24 -4M202 46l14 -2", C.neon, 1.8) + F("M224 44l5-1v6l-5 1z", C.neon2)),
      happy: beam + holoFrame("M196 24L232 18L232 52L196 58Z", txt("GG", 201, 46)),
      affectionate: holoFrame("M176 30L212 24L212 58L176 64Z", txt("!?", 182, 52)),
      surprised: beam + holoFrame("M196 24L232 18L232 52L196 58Z", txt("ERR", 199, 45, C.neon2, 14)),
      determined: beam + holoFrame("M196 24L232 18L232 52L196 58Z", `<circle cx="214" cy="38" r="9" fill="none" stroke="${C.neon}" stroke-width="1.6"/>` + ln("M214 24v8M214 44v8M200 38h8M220 38h8", C.neon, 1.6) + el(214, 38, 2, 2, C.neon2)),
      thinking: beam + holoFrame("M196 24L232 18L232 52L196 58Z", ln("M202 32l20 -3M202 39l24 -4M202 46l14 -2", C.neon, 1.8))
        + holoFrame("M30 52L62 48L62 74L30 78Z", ln("M36 68l6 -6 6 4 8 -8", C.neon2, 1.8)) + holoFrame("M24 98L52 94L52 114L24 118Z", txt("0x1F", 27, 110, C.neon, 8)),
      sad: "", frustrated: "", sleepy: ""
    }[e];
    // head
    const earRot = { affectionate: 22, sad: 28, sleepy: 32, surprised: -8, frustrated: 10 }[e] || 0;
    const earL = `<g transform="rotate(${-earRot} 100 58)">${S("M92 66L72 10L114 50Z", C.fur)}${F("M94 58L80 22L106 50Z", C.earIn)}${ln("M74 16L92 64", C.rim, 1.4)}</g>`;
    const earR = `<g transform="rotate(${earRot} 140 56)">${S("M128 48L170 8L152 66Z", C.fur)}${F("M134 48L163 18L150 58Z", C.earIn)}
      <circle cx="160" cy="34" r="3.6" fill="none" stroke="${C.metal}" stroke-width="2"/><circle cx="157" cy="43" r="3" fill="none" stroke="${C.metal}" stroke-width="2"/><circle cx="155" cy="51" r="2.6" fill="none" stroke="${C.metal}" stroke-width="2"/>${F("M165 36l3 3-3 3-3-3z", is("sleepy") ? C.dim : C.neon)}</g>`;
    const head = S("M86 82C86 62 100 46 120 46C140 46 156 62 156 82C156 94 148 102 134 108L120 113L106 108C94 102 86 94 86 82Z", C.fur)
      + S("M88 88L70 96L89 98L77 109L97 103Z", C.fur) + S("M154 88L172 93L154 98L166 109L146 103Z", C.fur)
      + F("M156 82C156 94 148 102 134 108L120 113L128 102C142 96 150 86 152 70Z", C.furS)
      + ln("M88 76C90 62 98 52 110 48", C.rim, 1.6) + el(120, 100, 13, 7.5, C.muz) + ln("M148 58L155 64M150 54L156 59M146 63L153 69", is("sleepy") ? C.dim : C.neon, 1.6);
    const look = { affectionate: [-3, 3], sad: [-3, 4], thinking: [3, -3], determined: [1, 0] }[e] || [0, 0];
    const roundPupil = is("surprised");
    const almondR = "M124 86C126 76 138 72 151 76C149 86 142 93 132 93C128 93 125 90 124 86Z";
    const almondL = "M93 80C102 76 112 78 117 86C115 92 109 95 103 94C97 93 93 88 93 80Z";
    const iris = (cx, cy, clip, lidY) => `<g clip-path="url(#${clip})">${el(cx + look[0], cy + look[1], 8, 9, C.eye)}${F(`M${cx - 14} ${cy - 16}H${cx + 14}V${cy - 2}C${cx + 6} ${cy - 6} ${cx - 6} ${cy - 6} ${cx - 14} ${cy - 2}Z`, C.eyeS)}
      ${roundPupil ? el(cx + look[0], cy + look[1], 2.6, 2.6, "#12041F") : el(cx + 1 + look[0], cy + 1 + look[1], 1.8, 6.4, "#12041F")}${F(`M${cx - 5 + look[0]} ${cy - 5 + look[1]}l4 2-4 2-2-2z`, "#fff")}${el(cx + 5 + look[0], cy + 4 + look[1], 1.3, 1.3, C.neon)}
      ${is("sad") ? el(cx + look[0] + 2, cy + 5, 3, 1.6, "#fff", "", 0, 'opacity=".8"') : ""}
      ${lidY ? F(`M${cx - 16} ${cy - 16}H${cx + 16}V${lidY}L${cx - 16} ${lidY + 2}Z`, C.fur) + ln(`M${cx - 13} ${lidY + 1.6}L${cx + 15} ${lidY}`, L, 2.6) : ""}</g>`;
    const rEye = lidY => `<clipPath id="${id}r"><path d="${almondR}"/></clipPath>` + S(almondR, "#F4F0FF") + iris(137, 84, id + "r", lidY)
      + ln("M121 85C125 74 140 69 153 74L161 68", L, 3.4, 'stroke-linejoin="miter"') + ln("M132 93C138 94 144 91 148 86", L, 1.2);
    const lEye = lidY => `<clipPath id="${id}l"><path d="${almondL}"/></clipPath>` + S(almondL, "#F4F0FF") + iris(106, 86, id + "l", lidY) + ln("M119 85C114 76 102 73 91 77L84 73", L, 3.4, 'stroke-linejoin="miter"');
    const eyes = {
      neutral: lEye(0) + rEye(80),
      happy: ln("M92 88Q104 76 117 86", L, 3.6) + ln("M92 88l-6 3", L, 2.4) + rEye(0),
      affectionate: lEye(79) + rEye(77),
      sad: lEye(0) + rEye(0),
      surprised: lEye(0) + rEye(0),
      determined: lEye(81) + rEye(79),
      frustrated: lEye(82) + rEye(80),
      thinking: lEye(0) + rEye(0),
      sleepy: ln("M93 86Q105 92 117 86", L, 3) + ln("M93 86l-6 2", L, 2) + ln("M124 85Q137 92 150 82", L, 3) + ln("M150 82l7 -3", L, 2)
    }[e];
    const hair = S("M152 60C146 46 124 40 106 48C92 54 86 68 88 86L90 110L96 92L100 104L105 76L113 84L117 64L126 70L131 56L141 60Z", C.fr)
      + F("M131 56L141 60L152 60C148 52 140 46 130 44Z", C.frS) + F("M96 92L100 104L105 76L101 70Z", C.frS)
      + S("M110 48L112 26L120 36L126 14L130 44Z", C.fr) + F("M120 36L126 14L130 44L124 46Z", C.frS)
      + ln("M95 62C101 54 111 50 121 49", C.frL, 2.2) + ln("M91 88L94 70", C.frL, 1.4, 'opacity=".8"')
      + PX(88, 112, ["#.", ".#", "#."], 3, C.fr) + PX(98, 108, ["#", ".", "#"], 3, is("sleepy") ? C.dim : C.neon);
    const visor = ln("M158 58L156 68", C.metal, 2) + sh("M139 70L162 66L158 90L141 92Z", is("sleepy") ? C.dim : C.neon, is("sleepy") ? C.dim : C.neon, 1.3, "miter", 'fill-opacity=".1"') + ln("M154 70h5M155 75h4M152 86l4 -1", is("sleepy") ? C.dim : C.neon, 1.2);
    const brows = ln({ neutral: "M128 62L151 56", happy: "M128 66L152 63", affectionate: "M130 66L150 70", sad: "M130 61L150 68", surprised: "M128 57L152 52",
      determined: "M128 70L151 63", frustrated: "M127 72L151 62", thinking: "M128 59L151 58", sleepy: "M130 68L150 70" }[e], L, is("frustrated") ? 3.2 : 2.6);
    const mouth = {
      neutral: ln("M112 104C116 106 120 106 122 104C127 108 133 106 137 99", L, 2.1) + F("M125 105.5l1.6 3.6 1.8-3.8z", "#fff"),
      happy: S("M110 102C116 112 130 112 138 100C130 104 118 104 110 102Z", "#3A0F2E") + F("M114 103l2 4 2-3.6zM132 102.4l2 4 2-4.6z", "#fff") + sh("M122 106C124 112 130 112 130 106Z", "#FF6FB5", L, 1.2),
      affectionate: ln("M113 104Q116 101 119 104T125 104T131 103", L, 2),
      sad: ln("M113 106Q120 100 127 105", L, 2.1),
      surprised: S("M116 104C116 99 124 99 124 104C124 110 116 110 116 104Z", "#3A0F2E"),
      determined: ln("M112 104L132 101", L, 2.3) + F("M126 102l1.6 3.6 1.8-3.9z", "#fff"),
      frustrated: ln("M112 106L118 102L124 106L130 102L135 105", L, 2.2),
      thinking: ln("M116 104L129 102", L, 2.1),
      sleepy: S("M118 104C118 101 123 101 123 104C123 107 118 107 118 104Z", "#3A0F2E", 'stroke-width="1.4"')
    }[e];
    const nose = F("M117 97h6l-3 3.5z", "#E58BD8");
    const whisk = ln("M74 100l14 -3M76 106l13 -1M166 99l-14 -2M164 106l-13 -1", C.metal, 1, 'opacity=".7"');
    const fx = {
      neutral: [[60, 120, C.neon], [66, 112, C.neon2], [212, 92, C.neon], [56, 58, C.neon], [202, 108, C.neon2]].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="4" height="4" fill="${c}"/>`).join(""),
      happy: PX(52, 56, ["#.#", ".#.", "#.#"], 4, C.neon) + PX(198, 90, [".#.", "###", ".#."], 4, C.neon2) + PX(62, 120, ["#"], 4, C.neon),
      affectionate: ln("M100 98l4 -4M104 99l4 -4M108 100l4 -4M134 97l4 -4M138 98l4 -4M142 99l4 -4", C.neon2, 1.6) + PX(64, 60, ["#.#", ".#."], 3, C.neon) + PX(170, 82, ["#", ".", "#"], 3, C.neon2),
      sad: tearDrop(132, 96) + PX(60, 120, ["#"], 3, C.dim),
      surprised: `<rect x="80" y="64" width="40" height="4" fill="${C.neon}" opacity=".8"/><rect x="118" y="92" width="34" height="3" fill="${C.neon2}" opacity=".8"/><rect x="70" y="100" width="20" height="3" fill="${C.neon2}" opacity=".7"/>` + ln("M156 30l6 -8M166 38l9 -3M146 26l-1 -9", C.neon, 2.4),
      determined: sparkle(60, 70, 6, C.neon) + PX(52, 100, ["#"], 4, C.neon2),
      frustrated: `<g stroke="${C.neon2}" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M54 52q5 0 5 -5M68 52q-5 0 -5 -5M54 60q5 0 5 5M68 60q-5 0 -5 5"/></g>` + PX(170, 74, ["#.#", ".#.", "#.#"], 3, C.neon2),
      thinking: PX(64, 128, ["#"], 3, C.neon) + PX(196, 98, [".#", "#."], 3, C.neon2),
      sleepy: zzz(150, 40, "#C77DFF")
    }[e];
    const headTilt = { sleepy: 8, sad: 5, thinking: -4, surprised: -2 }[e] || 0;
    const headG = `<g transform="rotate(${headTilt} 120 112)">${earL + earR + head + whisk + eyes + nose + mouth + hair + visor + brows}</g>`;
    return el(122, 247, 52, 6.5, "#000", "", 0, 'opacity=".22"') + tail + legs + boots + skirt + torso + belt + jacket + armL + headG + armR + holo + fx;
  }

  // =====================================================================
  // ROOK — pulp cover
  // =====================================================================
  function rook(e = "neutral") {
    const C = { sc: "#2F5BC0", scS: "#1B2F78", scL: "#7FA2F2", bel: "#F6E2A6", belS: "#D2A85A", cape: "#E3322C", capeS: "#8E1A1E", lin: "#5A1414",
      gold: "#F7B934", goldS: "#C0781A", metal: "#5A607A", metalS: "#2E3248", wing: "#5440A8", wingS: "#2A2066", horn: "#F7EBCB", hornS: "#CBA66A",
      eye: "#FFD23A", eyeS: "#E08A10", wood: "#9C5E2E", woodS: "#5A3214", ruby: "#E8323A", ink: "#16101A", dots: "url(#rookDotsBig)", blush: "#FF5A6E" };
    const K = C.ink, W = 3.8;
    const is = k => e === k;
    function art(ink) {
      const S = (d, fill, extra = "") => ink ? sh(d, fill, K, W, "round", extra) : sh(d, fill, "", 0, "round", extra);
      const F = (d, fill, extra = "") => sh(d, fill, "", 0, "round", extra);
      const shade = (d, fill) => F(d, fill) + (ink ? F(d, C.dots) : "");
      const black = d => ink ? F(d, K) : "";
      const LB = (d, w, fill) => ink ? limb(d, w, fill, K, W) : ln(d, fill, w + W);
      const inkL = (d, w = 2.4) => ink ? ln(d, K, w) : "";
      const fist = (x, y) => S(`M${x - 9} ${y}a9 8.5 0 1 0 18 0a9 8.5 0 1 0 -18 0`, C.sc);
      const wl = { happy: -16, affectionate: 22, sad: 26, sleepy: 34, determined: -12, surprised: -8, frustrated: 6 }[e] || 0;
      const wings = `<g transform="rotate(${wl} 102 132)">${S("M106 128C86 96 52 72 12 70L34 92L4 102L36 114L14 132L52 130L40 150L92 142Z", C.wing)}
        ${shade("M92 142L40 150L52 130L14 132L36 114L70 120C80 128 88 136 92 142Z", C.wingS)}${inkL("M100 130L16 72M98 132L8 102M96 136L18 130M94 140L42 148", 2)}</g>`
        + `<g transform="rotate(${-wl} 156 130)">${S("M152 126C172 94 204 70 238 68L218 90L240 100L212 112L232 130L196 128L206 146L160 140Z", C.wing)}
        ${shade("M160 140L206 146L196 128L232 130L212 112L182 118C172 126 164 134 160 140Z", C.wingS)}${inkL("M156 128L234 70M158 130L236 100M160 134L228 130M162 138L204 144", 2)}</g>`;
      const cape = S("M110 122C64 120 22 154 6 214C22 202 36 206 42 218C52 204 66 206 72 218C82 204 96 204 102 212L118 130Z", C.cape)
        + shade("M110 122C84 140 68 174 64 214C70 206 72 212 72 218C82 204 96 204 102 212L118 130Z", C.capeS) + black("M90 140C74 162 64 186 60 206L66 208C70 186 78 164 92 144Z")
        + ln("M6 214C22 202 36 206 42 218C52 204 66 206 72 218C82 204 96 204 102 212", C.gold, 4.2) + inkL("M4 218C22 206 36 210 42 222C52 208 66 210 72 222C82 208 96 208 102 216", 1.6);
      const tailD = is("sleepy") ? "M150 200C176 214 196 210 200 196C202 188 196 182 188 184" : is("sad") ? "M150 200C178 214 200 212 210 200C216 194 222 196 226 200" : "M150 198C180 212 206 202 210 178C212 164 220 156 228 158";
      const tipAt = is("sleepy") ? "M182 178L196 176L190 192L184 186Z" : is("sad") ? "M222 194L238 198L228 212L222 204Z" : "M222 146L238 154L226 170L219 158Z";
      const tail = LB(tailD, 14, C.sc) + S(tipAt, C.wing);
      const chest = S("M82 212H178V246H82Z", C.wood) + shade("M150 212H178V246H150Z", C.woodS)
        + S("M78 214C78 202 92 198 130 198C168 198 182 202 182 214Z", C.wood) + shade("M150 199C168 199 182 203 182 214H150Z", C.woodS)
        + S("M98 198H110V246H98ZM150 198H162V246H150Z", C.gold) + S("M124 220H136V232H124Z", C.gold) + black("M128.5 224h3v5h-3z")
        + [[70, 242], [62, 238], [190, 242], [198, 238], [76, 236]].map(([x, y]) => el(x, y, 6.5, 3.6, C.gold, ink ? K : "", 1.8)).join("");
      const stomp = is("frustrated");
      const legs = LB("M112 188C108 196 104 202 102 206", 16, C.sc) + S("M86 210C84 200 96 196 108 198C118 200 120 208 116 212L88 212Z", C.sc)
        + (stomp ? LB("M148 188C156 190 162 188 166 182", 16, C.sc) + S("M158 186C154 178 160 170 170 170C182 170 186 178 182 186Z", C.sc) + inkL("M152 196l-4 6M162 198l0 7M172 196l4 6", 2.2)
          : LB("M148 188C152 196 156 202 158 206", 16, C.sc) + S("M144 212C140 208 142 200 152 198C164 196 176 200 174 210L172 212Z", C.sc))
        + F(`M88 212l3 6 3-6zM96 212l3 6 3-6zM104 212l3 6 3-6z${stomp ? "" : "M152 212l3 6 3-6zM160 212l3 6 3-6zM168 212l3 6 3-6z"}`, C.horn);
      const body = S("M98 152C96 126 110 114 130 114C152 114 166 128 164 154C164 180 152 200 130 202C110 202 98 180 98 152Z", C.sc)
        + shade("M164 154C164 180 152 200 130 202C146 192 156 174 156 152C156 138 152 128 146 122C158 128 164 140 164 154Z", C.scS)
        + S("M110 132C120 120 142 120 152 132L148 188C140 196 122 196 116 188Z", C.bel) + shade("M142 126L152 132L148 188C144 192 140 194 136 195Z", C.belS)
        + inkL("M113 146H150M114 160H149M115 174H148", 2) + (ink ? ln("M106 140C107 130 112 124 119 120", C.scL, 3) : "");
      const harness = LB("M108 126L156 184", 7, C.metal) + S("M120 150a11 11 0 1 0 22 0a11 11 0 1 0 -22 0", C.gold) + S("M126 150a5 5 0 1 0 10 0a5 5 0 1 0 -10 0", C.ruby);
      const paul = S("M96 132C94 116 108 106 122 112C120 126 112 134 98 140Z", C.metal) + S("M98 120L78 102L106 114Z", C.horn)
        + S("M164 132C166 116 152 106 138 112C140 126 148 134 162 140Z", C.metal) + S("M162 120L182 102L154 114Z", C.horn)
        + shade("M164 132C166 122 160 114 152 110C156 120 158 130 162 140Z", C.metalS) + ln("M98 132C98 122 104 115 115 113", C.gold, 2.6);
      const scepter = (dx = 0, dy = 0, rot = 0) => `<g transform="translate(${dx} ${dy}) rotate(${rot} 176 108)">${S("M171 36h10l-1 112h-8Z", C.gold)}${shade("M177 36h4l-1 112h-3Z", C.goldS)}
        ${S("M164 38l3 -12 6 7 4 -10 4 10 6 -7 3 12Z", C.gold)}${S("M170.5 22a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0", C.ruby)}</g>`;
      const trophy = S("M118 160h20v4c0 9-4 14-10 14s-10-5-10-14z", C.gold) + S("M124 178h8v6h-8z", C.gold) + S("M120 184h16v5h-16z", C.gold) + inkL("M118 164c-6 0-6 8 0 8M138 164c6 0 6 8 0 8", 2);
      let armL, armR;
      if (is("affectionate")) { armL = LB("M104 138C94 130 100 112 108 104", 12, C.sc) + fist(109, 100); armR = LB("M156 134C170 140 176 150 170 162", 12, C.sc) + fist(171, 164); }
      else if (is("thinking")) { armL = LB("M104 138C112 162 140 166 152 152", 12, C.sc) + fist(152, 150); armR = LB("M156 136C148 162 120 166 108 154", 12, C.sc) + fist(108, 152); }
      else if (is("sleepy")) { armL = trophy + LB("M104 140C104 160 112 170 120 170", 12, C.sc) + fist(120, 170); armR = LB("M156 138C156 160 148 170 138 170", 12, C.sc) + fist(138, 170); }
      else if (is("frustrated")) { armL = LB("M104 138C94 150 92 164 96 176", 12, C.sc) + fist(96, 178); armR = LB("M156 136C166 150 168 164 164 176", 12, C.sc) + fist(164, 178); }
      else if (is("sad")) { armL = LB("M104 138C96 150 96 164 102 174", 12, C.sc) + fist(102, 176); armR = scepter(-14, 64, 40) + LB("M156 136C162 150 162 162 158 172", 12, C.sc) + fist(158, 174); }
      else {
        armL = LB("M104 138C90 146 88 158 98 168", 12, C.sc) + fist(101, 168) + inkL("M96 165h10M96 170h9", 1.6);
        const sy = is("happy") ? -16 : 0;
        armR = is("determined") ? scepter(-10, 10, 32) + LB("M156 134C166 130 172 124 176 116", 12, C.sc) + fist(176, 114)
          : scepter(0, sy) + LB(`M156 134C168 132 176 ${122 + sy} 176 ${108 + sy}`, 12, C.sc) + fist(176.5, 104 + sy) + inkL(`M169 ${100 + sy}h14M169 ${106 + sy}h14`, 1.6);
      }
      const hornTilt = is("surprised") ? -12 : is("sad") ? 6 : 0;
      const horns = `<g transform="rotate(${hornTilt} 130 70)">${S("M100 58C86 30 60 16 34 22C20 27 18 44 28 50C32 37 48 33 62 41C78 50 88 62 92 72Z", C.horn)}${shade("M92 72C88 62 78 48 58 38C68 50 76 62 82 76Z", C.hornS)}${inkL("M48 22l-1 9M62 28l-4 8M76 38l-5 7", 2.2)}
        ${S("M160 58C174 30 200 16 226 22C240 27 242 44 232 50C228 37 212 33 198 41C182 50 172 62 168 72Z", C.horn)}${shade("M168 72C172 62 182 48 198 41C190 52 184 62 178 76Z", C.hornS)}${inkL("M212 22l1 9M198 28l4 8M184 38l5 7", 2.2)}</g>`;
      const tilt = { neutral: -7, happy: -4, affectionate: 6, sad: 8, surprised: -2, determined: -3, frustrated: 2, thinking: -4, sleepy: 14 }[e];
      const eyeBase = () => el(112, 82, 13, 13.5, C.eye, ink ? K : "", W) + el(148, 82, 13, 13.5, C.eye, ink ? K : "", W)
        + F("M99 82C99 74 105 69 112 69C119 69 125 74 125 82C120 78 104 78 99 82Z", C.eyeS) + F("M135 82C135 74 141 69 148 69C155 69 161 74 161 82C156 78 140 78 135 82Z", C.eyeS);
      const lids = (yl, yr) => S(`M97 66H127V${yl}C118 ${yl - 4} 106 ${yl - 4} 97 ${yl}Z`, C.sc) + S(`M133 66H163V${yr}C154 ${yr - 4} 142 ${yr - 4} 133 ${yr}Z`, C.sc);
      const slit = (dx = 0, dy = 0) => ink ? el(113 + dx, 85 + dy, 3, 7.5, K) + el(149 + dx, 85 + dy, 3, 7.5, K) + el(108 + dx * .4, 78, 2.8, 2.8, "#fff") + el(144 + dx * .4, 78, 2.8, 2.8, "#fff") : "";
      const dot = (r = 3.4) => ink ? el(112, 82, r, r, K) + el(148, 82, r, r, K) + el(108, 77, 3, 3, "#fff") + el(144, 77, 3, 3, "#fff") : "";
      const face = {
        neutral: eyeBase() + slit(2, 1) + lids(80, 80) + black("M94 62L128 72L126 79L96 72Z") + black("M134 66L166 56L166 64L136 74Z")
          + S("M112 106C122 112 140 110 154 98C152 108 144 114 134 115C124 116 116 112 112 106Z", C.lin) + F("M142 106.5l3 6 3-6.6z", "#fff") + inkL("M108 104C110 106 112 107 114 107", 2.6),
        happy: eyeBase() + dot() + black("M92 58L128 72L126 78L94 66Z") + black("M168 58L132 72L134 78L166 66Z")
          + S("M106 100C112 124 148 124 156 98C140 104 122 104 106 100Z", C.lin) + F("M110 101l3 6 3-5.4zM146 100l3 6 3-6.4z", "#fff") + F("M118 112C126 120 140 118 146 110C138 108 126 108 118 112Z", "#FF7A8A"),
        affectionate: (ink ? ln("M100 84L112 78L124 84M136 84L148 78L160 84", K, 4) : "") + black("M96 70L124 66L124 72L98 76Z") + black("M164 70L136 66L136 72L162 76Z")
          + el(104, 94, 11, 5, C.blush, "", 0, 'opacity=".85"') + el(156, 94, 11, 5, C.blush, "", 0, 'opacity=".85"') + inkL("M98 92l4 4M104 91l4 4M150 91l4 4M156 92l4 4", 1.8) + inkL("M118 108Q122 104 126 108T134 108T142 108", 2.6),
        sad: eyeBase() + slit(0, 3) + (ink ? el(108, 90, 5, 2.4, "#fff", "", 0, 'opacity=".8"') + el(144, 90, 5, 2.4, "#fff", "", 0, 'opacity=".8"') : "")
          + black("M96 74L124 62L126 68L98 80Z") + black("M164 74L136 62L134 68L162 80Z") + inkL("M116 110Q122 105 128 110T140 110", 2.6),
        surprised: eyeBase() + dot(2.6) + black("M96 58L124 54L124 60L98 64Z") + black("M164 58L136 54L136 60L162 64Z") + S("M122 108a8 9 0 1 0 16 0a8 9 0 1 0 -16 0", C.lin),
        determined: eyeBase() + slit() + lids(78, 78) + black("M92 64L128 74L126 80L94 70Z") + black("M168 64L132 74L134 80L166 70Z")
          + S("M110 102H150V112H110Z", "#fff") + inkL("M117 102v10M124 102v10M131 102v10M138 102v10M145 102v10M110 107H150", 1.4),
        frustrated: eyeBase() + slit() + S("M97 66H127V82L97 74Z", C.sc) + S("M163 66H133V82L163 74Z", C.sc) + black("M92 60L128 76L126 82L94 66Z") + black("M168 60L132 76L134 82L166 66Z")
          + S("M112 104L118 110L124 104L130 110L136 104L142 110L148 104V112H112Z", "#fff"),
        thinking: eyeBase() + slit(5, 1) + lids(81, 81) + black("M96 66H126V72H96Z") + black("M134 66H164V72H134Z") + inkL("M116 108H144", 2.8),
        sleepy: (ink ? ln("M100 82Q112 90 124 82M136 82Q148 90 160 82", K, 3.6) : "") + black("M98 70L124 70L124 75L98 75Z") + black("M136 70L162 70L162 75L136 75Z")
          + S("M125 108a5 5.5 0 1 0 10 0a5 5.5 0 1 0 -10 0", C.lin)
      }[e];
      const head = `<g transform="rotate(${tilt} 130 112)">${horns}${S("M114 44L120 22L128 38L137 20L145 42Z", C.wing)}
        ${S("M90 88L66 80L84 94L66 106L92 100Z", C.wing)}${S("M170 88L194 80L176 94L194 106L168 100Z", C.wing)}
        ${S("M88 80C86 54 106 38 130 38C154 38 174 54 172 80C172 96 162 106 150 110L110 110C98 106 88 96 88 80Z", C.sc)}
        ${shade("M172 80C172 96 162 106 150 110L140 110C156 100 164 88 164 72C164 60 160 52 154 46C166 54 172 66 172 80Z", C.scS)}
        ${ink ? ln("M98 64C100 54 108 46 118 43", C.scL, 3.2) : ""}
        ${S("M104 96C104 86 156 86 156 96C156 110 144 119 130 119C116 119 104 110 104 96Z", C.sc)}${shade("M156 96C156 110 144 119 130 119C142 112 148 104 148 92Z", C.scS)}
        ${inkL("M121 95l3 2M139 95l-3 2", 2.6)}${face}</g>`;
      const bodyG = `<g transform="translate(0 ${is("sleepy") ? 6 : 0})">${body + harness + paul}</g>`;
      return wings + cape + tail + chest + legs + bodyG + armL + `<g transform="translate(0 ${is("sleepy") ? 8 : is("sad") ? 4 : 0})">${head}</g>` + armR;
    }
    const burst = `<path d="${Array.from({ length: 18 }, (_, i) => { const a = i / 18 * Math.PI * 2, r = i % 2 ? 78 : 118; return (i ? "L" : "M") + (128 + Math.cos(a) * r).toFixed(1) + " " + (120 + Math.sin(a) * r * .95).toFixed(1); }).join("")}Z" fill="${e === "sad" || e === "sleepy" ? "#E9DDBA" : "#FFE27A"}" stroke="${K}" stroke-width="3"/>`
      + `<path d="${Array.from({ length: 18 }, (_, i) => { const a = i / 18 * Math.PI * 2 + .17, r = i % 2 ? 58 : 92; return (i ? "L" : "M") + (128 + Math.cos(a) * r).toFixed(1) + " " + (120 + Math.sin(a) * r * .95).toFixed(1); }).join("")}Z" fill="${e === "sad" || e === "sleepy" ? "#9AA6D6" : "#F4573A"}"/>`;
    const puff = (pts) => `<g fill="#EFEAF2" stroke="${K}" stroke-width="2">${pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>`;
    const fx = {
      neutral: puff([[96, 112, 4.5], [86, 108, 6], [76, 102, 4]]),
      happy: `<g transform="rotate(-4 130 112)"><path d="M118 116C100 134 72 140 44 128C62 126 66 118 64 110C78 120 92 116 102 106C100 116 108 118 118 112Z" fill="#FFB13B" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M112 116C98 128 82 130 66 124C78 120 84 116 86 112C94 118 104 114 110 110Z" fill="#FFF0A0"/></g>`,
      affectionate: puff([[172, 62, 6], [182, 54, 8], [194, 50, 5]]),
      sad: puff([[150, 108, 4], [158, 102, 5.5]]) + tearDrop(104, 98) + tearDrop(152, 98),
      surprised: sparkle(150, 104, 9, "#FFD24A") + sparkle(162, 96, 5, "#FF8A3D") + `<g stroke="${K}" stroke-width="3" stroke-linecap="round"><path d="M82 30l-6 -10M100 22l-2 -11M164 22l2 -11M182 30l6 -10"/></g>`,
      determined: sparkle(44, 94, 7, "#FFE27A") + sparkle(208, 166, 5, "#FFE27A"),
      frustrated: puff([[104, 110, 5], [94, 104, 7], [158, 110, 5], [168, 104, 7]]) + `<g stroke="#E3322C" stroke-width="3.4" stroke-linecap="round" fill="none"><path d="M180 40q6 0 6 -6M196 40q-6 0 -6 -6M180 48q6 0 6 6M196 48q-6 0 -6 6"/></g>`,
      thinking: `<g fill="#9AA6D6" stroke="${K}" stroke-width="2"><circle cx="180" cy="66" r="3.5"/><circle cx="190" cy="56" r="5"/><circle cx="204" cy="44" r="7"/></g>`,
      sleepy: zzz(166, 50, "#16101A")
    }[e];
    return burst + el(130, 248, 76, 6, "#000", "", 0, 'opacity=".25"') + `<g transform="translate(-3.5 2.5)" opacity=".75" style="mix-blend-mode:multiply">${art(false)}</g>` + art(true) + fx;
  }

  // =====================================================================
  // B.I.T. — polished arcade
  // =====================================================================
  function bit(e = "neutral") {
    const C = { sh: "url(#bitShine)", shS: "#D8CCB2", shD: "#B8AA8C", pan: "#CDBDF5", panS: "#9A85DA", teal: "#2FC4B5", tealS: "#1C8E84", scr: "#0C1828", scr2: "#13263D",
      pix: "#6FF7FF", pixD: "#3A9DB8", metal: "#A3ACC4", metalS: "#606A84", line: "#2B3150", gold: "#FFCC48", pink: "#FF7EB6", flame: "#7DF3FF", orange: "#FF9A3C", tape: "#F2E3BF" };
    const L = C.line, W = 2.6;
    const S = (d, fill, extra = "") => sh(d, fill, L, W, "round", extra);
    const F = (d, fill, extra = "") => sh(d, fill, "", 0, "round", extra);
    const is = k => e === k;
    const dim = is("sad") || is("sleepy");
    const P = dim ? C.pixD : C.pix;
    const tilt = { thinking: -10, surprised: -6, frustrated: 4, sad: 3, sleepy: 6 }[e] || 0;
    const drop = { sad: 8, sleepy: 18, happy: -4, determined: -3 }[e] || 0;
    const flameMap = is("determined") ? [".########.", "..######..", "...####...", "....##...."] : is("sleepy") ? ["..####..", "...##..."] : is("frustrated") ? ["..#.#...", ".#.##.#.", "...#...."] : ["..####..", ".######.", "..####..", "...##..."];
    const thr = S("M102 186H138L132 202H108Z", C.metal) + F("M126 186H138L132 202H124Z", C.metalS) + S("M100 186L90 198L104 196Z", C.pan) + S("M140 186L150 198L136 196Z", C.pan)
      + `<g class="b-thrust" opacity="${is("sleepy") ? .5 : 1}">${PX(is("determined") ? 105 : 108, 204, flameMap, 3, C.flame)}</g>`;
    const mitten = (x, y) => S(`M${x - 6} ${y + 2}C${x - 6} ${y - 4} ${x + 2} ${y - 6} ${x + 6} ${y - 2}L${x + 8} ${y + 6}C${x + 4} ${y + 10} ${x - 2} ${y + 10} ${x - 6} ${y + 6}Z`, C.sh);
    const rPose = is("affectionate") ? ["M182 140L198 134", [199, 133], "M199 133L210 122", [212, 118]] : ["M182 140L196 154", [197, 155], "M197 155L194 172", [194, 176]];
    const armR = limb(rPose[0], 6, C.metal, L, W) + el(...rPose[1], 5, 5, C.pan, L, W) + limb(rPose[2], 6, C.metal, L, W) + mitten(...rPose[3]);
    const lPoses = {
      happy: ["M58 132L40 116", [39, 115], "M39 115L30 94", [28, 90]],
      surprised: ["M58 132L38 120", [37, 119], "M37 119L24 104", [22, 100]],
      affectionate: ["M58 134L40 134", [39, 134], "M39 134L28 122", [26, 118]],
      determined: ["M58 132L44 112", [43, 111], "M43 111L58 92", [62, 88]],
      thinking: ["M58 134L42 140", [41, 141], "M41 141L50 124", [52, 118]],
      sad: ["M58 138L44 152", [43, 153], "M43 153L40 170", [40, 176]],
      sleepy: ["M58 140L46 156", [45, 157], "M45 157L44 172", [44, 178]],
      frustrated: ["M58 136L40 148", [39, 149], "M39 149L28 164", [26, 168]],
      neutral: ["M58 134L42 144", [41, 145], "M41 145L34 160", [32, 166]]
    };
    const lp = lPoses[e];
    const claw = (x, y) => S(`M${x - 8} ${y + 4}L${x - 10} ${y - 8}L${x - 4} ${y - 4}L${x} ${y - 12}L${x + 4} ${y - 4}L${x + 10} ${y - 8}L${x + 8} ${y + 4}Z`, C.teal) + F(`M${x + 2} ${y - 4}L${x + 10} ${y - 8}L${x + 8} ${y + 4}H${x + 2}Z`, C.tealS);
    const armL = limb(lp[0], 9, C.teal, L, W) + ln(lp[0], C.tealS, 2, 'opacity=".6"') + el(...lp[1], 6, 6, C.metal, L, W) + el(...lp[1], 2, 2, C.metalS) + limb(lp[2], 8, C.teal, L, W) + claw(...lp[3]);
    const shoulders = S("M46 122C44 112 52 106 58 110L62 146C54 148 48 140 46 132Z", C.pan) + F("M46 132C48 140 54 148 62 146L60 132Z", C.panS)
      + S("M194 122C196 112 188 106 182 110L178 146C186 148 192 140 194 132Z", C.pan) + F("M194 132C192 140 186 148 178 146L180 132Z", C.panS) + ln("M182 120h8M181 126h9", L, 1.6);
    const shell = S("M120 62C164 62 188 96 188 132C188 168 160 192 120 192C80 192 52 168 52 132C52 96 76 62 120 62Z", C.sh)
      + F("M188 132C188 168 160 192 120 192C150 184 172 164 176 132C178 112 172 92 160 78C178 90 188 110 188 132Z", C.shS)
      + ln("M60 104C80 92 160 92 180 104", L, 1.8) + ln("M58 160C80 176 160 176 182 160", L, 1.8)
      + S("M64 166C84 182 156 182 176 166L172 176C152 190 88 190 68 176Z", C.teal) + F("M150 182C160 180 168 178 172 176L176 166C168 172 160 176 150 178Z", C.tealS)
      + el(84, 80, 16, 8, "#fff", "", 0, 'opacity=".75" transform="rotate(-24 84 80)"')
      + S("M56 112L74 108L76 134L58 138Z", "#E8DCC0") + [[59, 113], [71, 110], [60, 134], [73, 131]].map(([x, y]) => el(x, y, 1.6, 1.6, C.shD, L, 1)).join("")
      + ln("M54 120l6 0M54 126l6 0M54 132l6 0", L, 1.2) + ln("M64 118l8 -1", "#fff", 1.6, 'opacity=".6"')
      + el(170, 110, 2.4, 2.4, C.shD, L, 1.2) + el(170, 154, 2.4, 2.4, C.shD, L, 1.2) + el(150, 182, 2.2, 2.2, "none", L, 1, 'stroke-dasharray="1.4 1.4"')
      + S("M160 78l3 6 6.5.6-5 4.4 1.6 6.4-6.1-3.4-6.1 3.4 1.6-6.4-5-4.4 6.5-.6z", C.pink, 'transform="rotate(12 160 86)"');
    const scr = "M78 104C78 98 82 96 88 96H152C158 96 162 98 162 104V146C162 152 158 156 152 156H88C82 156 78 152 78 146Z";
    const round = [".###.", "#####", "#####", "#####", ".###."];
    const faces = {
      neutral: PX(88, 110, round, 4.4, P) + PX(92.4, 114.4, ["#"], 4.4, "#E8FFFF") + PX(130, 110, round, 4.4, P) + PX(134.4, 114.4, ["#"], 4.4, "#E8FFFF") + PX(111, 140, ["#....#", ".####."], 3, P),
      happy: PX(88, 114, [".###.", "#...#", "....."], 4, P) + PX(128, 114, [".###.", "#...#", "....."], 4, P) + PX(104, 134, ["#......#", ".######.", "..####.."], 4, P) + PX(84, 132, ["##"], 4, C.pink) + PX(148, 132, ["##"], 4, C.pink),
      sad: PX(88, 114, ["....#", "..###", ".####", "#####"], 4, P) + PX(128, 114, ["#....", "###..", "####.", "#####"], 4, P) + PX(106, 140, ["#..#..#", ".#..#.."], 4, P) + PX(96, 132, ["#", "#"], 3, "#9FDCFF"),
      surprised: PX(86, 106, [".###.", "#...#", "#.#.#", "#...#", ".###."], 5, P) + PX(130, 106, [".###.", "#...#", "#.#.#", "#...#", ".###."], 5, P) + PX(114, 140, [".##.", "#..#", ".##."], 3, P),
      affectionate: PX(86, 110, [".#.#.", "#####", "#####", ".###.", "..#.."], 5, C.pink) + PX(128, 110, [".#.#.", "#####", "#####", ".###.", "..#.."], 5, C.pink)
        + PX(110, 142, ["#....#", ".####."], 3, P) + PX(82, 136, ["#.#"], 3, C.pink) + PX(150, 136, ["#.#"], 3, C.pink),
      determined: PX(88, 116, ["#....", "###..", "#####"], 4, P) + PX(128, 116, ["....#", "..###", "#####"], 4, P) + PX(108, 140, ["######"], 4, P),
      frustrated: PX(88, 112, ["####.", "....#", ".##.#", ".#..#", ".####"], 4, P) + PX(128, 112, [".####", "#....", "#.##.", "#..#.", "####."], 4, P)
        + PX(100, 138, ["#.#.#.#.#.", ".#.#.#.#.#"], 4, P) + `<rect x="82" y="128" width="76" height="3" fill="${C.pink}" opacity=".7"/><rect x="82" y="108" width="40" height="2" fill="${C.pix}" opacity=".6"/>`,
      thinking: `<g class="b-load" style="transform-origin:120px 124px;transform-box:view-box">${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<rect x="${(118 + Math.cos(a) * 14).toFixed(1)}" y="${(122 + Math.sin(a) * 14).toFixed(1)}" width="5" height="5" fill="${P}" opacity="${(.2 + i * .1).toFixed(2)}"/>`; }).join("")}</g>`
        + `<text x="86" y="108" font-size="8" fill="${P}" opacity=".6" font-family="ui-monospace,monospace">01</text><text x="142" y="150" font-size="8" fill="${P}" opacity=".6" font-family="ui-monospace,monospace">10</text>`,
      sleepy: PX(88, 124, ["#####"], 4, P) + PX(128, 124, ["#####"], 4, P) + PX(114, 140, [".#.", "#.#", ".#."], 3, P) + PX(144, 104, ["###", "..#", ".#.", "###"], 2.5, P)
    };
    const face = S(scr, C.scr) + F("M84 100H156V106H84Z", C.scr2) + `<g class="b-face" filter="url(#bitGlow)" opacity="${dim ? .75 : 1}">${faces[e]}</g>` + F(scr, "url(#bitScan)") + ln("M86 102C92 100 100 100 106 100", "#fff", 2.4, 'opacity=".2"');
    const chest = el(120, 168, 6, 6, dim ? "#6E5A9E" : "#B48CFF", L, 2) + el(118, 166, 2, 2, "#fff", "", 0, `opacity="${dim ? .4 : 1}"`) + F("M138 166h4v4h-4zM144 166h4v4h-4zM150 166h4v4h-4z", is("frustrated") ? C.orange : dim ? C.pixD : C.pix);
    const antAng = { surprised: -16, frustrated: 14, sad: 30, sleepy: 38, thinking: -6, determined: -10 }[e] || 0;
    const antenna = `<g transform="rotate(${antAng} 120 62)">${limb("M120 62L118 46L132 34", 3.2, C.metal, L, 2)}${S("M114 46h8v5h-8z", C.tape, 'transform="rotate(-8 118 48)"')}${ln("M115 48.5h6", "#C9B48A", 1)}
      ${el(120, 62, 7, 4, C.pan, L, 2)}${S("M136 18l4 9 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z", dim ? "#C9A84A" : C.gold, 'class="b-star" transform="rotate(14 136 29)"')}</g>`;
    const fx = {
      neutral: "",
      happy: `<g filter="url(#bitGlow)">${PX(196, 66, [".#.#.", "#####", "#####", ".###.", "..#.."], 3, C.pink)}${PX(28, 150, ["#.#", ".#.", "#.#"], 3, C.pix)}${PX(206, 120, ["##", "##"], 3, C.gold)}</g>`,
      surprised: `<g filter="url(#bitGlow)">${PX(196, 64, ["###", "..#", ".#.", "...", ".#."], 4, C.gold)}${PX(210, 108, ["#"], 3, C.pix)}</g>`,
      affectionate: `<g class="b-hud" filter="url(#bitGlow)" opacity=".85">${PX(106, 16, [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."], 4, C.pink)}</g>`,
      determined: `<g filter="url(#bitGlow)">${PX(204, 96, ["#"], 3, C.gold)}${PX(196, 150, ["#.", ".#"], 3, C.pix)}</g>` + ln("M100 226l-4 8M120 230v9M140 226l4 8", C.flame, 2.4, 'opacity=".8"'),
      frustrated: `<g filter="url(#bitGlow)">${PX(150, 22, ["#..#", ".##.", "#..#"], 3, C.gold)}${PX(196, 70, ["..#..", ".###.", ".#.#.", "#####"], 4, C.orange)}</g>`
        + `<g fill="#E6E8EF" stroke="${L}" stroke-width="1.6"><circle cx="60" cy="74" r="5"/><circle cx="52" cy="68" r="6.5"/><circle cx="44" cy="62" r="4"/></g>`,
      thinking: `<g filter="url(#bitGlow)">${PX(196, 70, ["#.#", "...", "#.#"], 3, C.pix)}<text x="200" y="104" font-size="10" fill="${C.pix}" font-family="ui-monospace,monospace">10</text></g>`,
      sad: "",
      sleepy: zzz(154, 52, "#7DD8FF")
    }[e];
    return el(120, 246, is("sleepy") ? 50 : 40, 6, "#000", "", 0, `opacity="${is("sleepy") ? .26 : .18}"`)
      + `<g transform="translate(0 ${drop})"><g class="b-float"><g transform="rotate(${tilt} 120 130)">${thr}${armR}${armL}${antenna}${shoulders}${shell}${face}${chest}</g></g>${fx}</g>`;
  }

  root.BuddyArt = { DEFS, vexa, rook, bit, FACE: { vexa: "62 4 120 120", rook: "20 4 220 150", bit: "40 14 160 168" } };
})(window);

