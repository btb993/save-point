  // ================= co-op buddies: Pip, Vexa, Rook and B.I.T. =================
  const BUDDIES = {
    pip: { name: "Pip", kind: "Red panda", role: "The Quest Gremlin", c: "#E0682C",
      blurb: "An enthusiastic little explorer in clothes a size too big. Every game is a new world to him, and every small win counts as a victory.",
      likes: ["Adventure", "Exploration", "Fantasy", "Charming discoveries"] },
    vexa: { name: "Vexa", kind: "Black cat", role: "The Glitch Witch", c: "#8E52FF",
      blurb: "A brilliant hacker who loves seeing how a game's systems really work. She teases you a little, and she's quietly the most loyal one here.",
      likes: ["Strategy", "Puzzles", "Roguelikes", "Clever mechanics"] },
    rook: { name: "Rook", kind: "Mini dragon", role: "The Last Boss", c: "#D41F3D",
      blurb: "A tiny self-proclaimed dark overlord. He treats every boss as a worthy rival and every trophy as treasure for his hoard.",
      likes: ["Tough games", "Combat", "Boss fights", "Achievements"] },
    bit: { name: "B.I.T.", kind: "Floating robot", role: "Buddy Integration Technician", c: "#2FC4B5",
      blurb: "A little helper robot whose original mission was cancelled. Its new mission: make sure its favourite human has fun.",
      likes: ["Cozy games", "Indie gems", "Creative games", "Uplifting stories"] }
  };
  const OLD_BUDDY = { slime: ["pip", "Gloop"], bot: ["bit", "Bolt"], dragon: ["rook", "Ember"] };
  const MOODS = ["neutral", "happy", "sad", "surprised", "affectionate", "determined", "frustrated", "thinking", "sleepy"];
  // Each line can be a list; one is picked at random so buddies don't repeat themselves.
  const LINES = {
    hello: { pip: ["A NEW QUEST?! I packed snacks! I think!", "YOU'RE BACK! I saved you a spot on the map!"], vexa: ["A fresh system to dissect. How delightful.", "Oh, you're here. I definitely wasn't waiting."], rook: ["YOU HAVE RETURNED! I WAS NOT WORRIED!", "BEHOLD! Your loyal overlord stands ready."], bit: ["Beep! Mission updated: make sure my favourite human has fun.", "Oh! You're here! My favourite notification!"] },
    empty: { pip: "Our map is blank! Let's add the games you've played.", vexa: "Zero entries. Try Discover, then the Top 100. Efficient.", rook: "AN EMPTY HOARD?! Let us fill it with conquests!", bit: "Library: empty. Suggestion: Discover has a Top 100 list!" },
    playing: { pip: ["Back to {t}? I'll grab the map!", "{t} again! What's around the next corner?"], vexa: ["{t}: {h} logged. Let's see what else it's hiding.", "Resuming {t}. I've been thinking about its systems."], rook: ["{t}! Our campaign continues!", "{h} into {t}. It shall fall before us."], bit: ["{t} is waiting! Shall I keep count?", "Mission {t}: {h} logged so far. Great work!"] },
    streak: { pip: "{n} days in a row! That's a real adventure!", vexa: "{n}-day streak. Consistent. I approve.", rook: "{n} DAYS OF UNBROKEN CONQUEST!", bit: "Streak: {n} days! My circuits are glowing!" },
    release: { pip: "{t} comes out in {d} days! New lands!", vexa: "{t} in {d} days. I've already started theorycrafting.", rook: "{d} days until {t}. Prepare the war room!", bit: "Countdown: {t} arrives in {d} days! Beep!" },
    backlog: { pip: "{n} games waiting in the backlog! Want me to pick a path?", vexa: "{n} unplayed titles. Shall I choose one at random?", rook: "{n} kingdoms await. Shall fate choose the next?", bit: "{n} games in the queue! I can pick one for you!" },
    goal: { pip: "{n} of {g} games cleared this year! Onward!", vexa: "{n}/{g} this year. {p}%. Not bad at all.", rook: "{n} of {g} have fallen this year. The rest will follow!", bit: "Yearly goal: {n} of {g}! Happiness levels increasing!" },
    trophy: { pip: "Just {n} more for the “{t}” trophy!", vexa: "“{t}”: {n} to go. Easy.", rook: "“{t}” is nearly ours. {n} remain!", bit: "Only {n} more for “{t}”! We can do it!" },
    sleepy: { pip: "*yawn* Oh! Welcome back! I kept your spot warm.", vexa: "...rebooting. Oh, it's you. Good.", rook: "*snort* I WAS GUARDING THE HOARD. Not sleeping.", bit: "Low-power mode... oh! You're back! Waking up!" },
    late: { pip: "It's late... one more level, then sleep?", vexa: "Night sessions. My favourite kind.", rook: "Night raids are the best raids.", bit: "Friendly reminder: rest and stretching are compatible with heroism!" },
    soul: { pip: "Your Player Soul says {t}! I knew it!", vexa: "Profile analysis: {t}. Accurate.", rook: "{t}. A title worthy of a final boss.", bit: "Your Player Soul is {t}! That's lovely!" },
    idle: {
      pip: ["Is that a secret passage? No, it's a bookshelf.", "I found a shiny rock. It's for you.", "If we get lost, that's still exploring!", "My tail is bigger than my sword. That's fine."],
      vexa: ["I patched three bugs while you were away. Two were mine.", "Every system has a weakness. Even bosses.", "Need a strategy? I have nine.", "Don't tell anyone, but I like having you around."],
      rook: ["When I am tall, I shall be a FINAL BOSS.", "My scepter is ceremonial. And terrifying.", "Treasure? Did someone say treasure?", "I fear nothing. Except running out of trophies."],
      bit: ["Running diagnostics... you're doing great!", "Beep. That was a friendly beep.", "I picked up a mysterious signal. It was a pixel duck. I love it.", "Did you drink some water? Heroes need water."] },
    pet: { pip: ["Hehe! That tickles!", "*happy tail wiggle*"], vexa: ["...okay, maybe one more.", "Don't make it weird. ...Again."], rook: ["*happy rumble* THIS NEVER HAPPENED.", "A DRAGON DOES NOT PURR. *purrs*"], bit: ["Affection received! Storing in long-term memory.", "Um... I think I found my favourite person."] },
    log: { pip: ["+{h}! What a trip!", "+{h} of adventure!"], vexa: ["+{h}. Efficient.", "Session logged: {h}."], rook: ["+{h} OF GLORY!", "+{h}! The campaign advances!"], bit: ["Session logged: {h}! Great work!", "+{h}! Mission progress saved!"] },
    clear: { pip: ["WE DID IT! {t} is cleared!", "{t}: done! THAT WAS AMAZING!"], vexa: ["{t} cleared. Excellent execution.", "{t}: solved. I'm almost impressed."], rook: ["{t} HAS FALLEN! LET THE WORLD TREMBLE!", "VICTORY OVER {t}!"], bit: ["MISSION COMPLETE! {t}! I'm so proud of us!", "{t} complete! My circuits feel proud!"] },
    played: { pip: "Ooh, you've played {t}! Rate it?", vexa: "{t}, logged. What did you think?", rook: "{t}! A worthy conquest.", bit: "{t} added to your history! Beep!" },
    wish: { pip: "{t} on the wishlist! I'll watch the horizon.", vexa: "{t}, tracking it on the radar.", rook: "{t}... I want it for the hoard too.", bit: "Tracking {t} on the release radar!" },
    level: { pip: "Level {n}! We're getting so strong!", vexa: "Level {n}. Stats look good.", rook: "LEVEL {n}! FEAR US!", bit: "Level {n}! Upgrade installed!" },
    gotTrophy: { pip: "TREASURE! Oh, it's a trophy. EVEN BETTER! {t}!", vexa: "Trophy unlocked: {t}. Obviously.", rook: "{t}! ANOTHER TROPHY FOR MY MAGNIFICENT HOARD!", bit: "Trophy confirmed: {t}! Happiness levels increasing!" },
    timer: { pip: "Timer's on! Let's go!", vexa: "Clock's running. Make it count.", rook: "THE BATTLE CLOCK BEGINS!", bit: "Session timer engaged! I'll keep count!" },
    // ----- bond (Phase 5) -----
    bond2: { pip: ["You know what? You're my favourite adventuring partner.", "I drew you on the map. You're the little star."], vexa: ["I've decided you're... acceptable company. High praise.", "I wrote you a tiny program. It just says 'hi'."], rook: ["You may call me Rook. Only YOU may call me Rook.", "I have added you to my hoard. As a friend. Not a treasure. Well, both."], bit: ["My memory has a folder just for you now!", "Mission log: today was nice because you were here."] },
    bond4: { pip: ["Wherever we go next, I'm coming too. Obviously!", "Best. Team. Ever."], vexa: ["Don't tell anyone, but I'd follow you into any dungeon.", "Every system has a weakness. Mine's apparently you."], rook: ["WHEN I RULE THE WORLD, YOU SHALL BE MY CO-RULER!", "I am not crying. Dragons sweat from the eyes."], bit: ["I wasn't programmed to have a favourite person. But I think I found one.", "If I had a heart module, it would be beeping right now."] },
    bondUp: { pip: ["We're {l} now! Let's celebrate with snacks!"], vexa: ["{l}. Fine. I'm a little happy about it."], rook: ["WE ARE NOW {L}! LET THE WORLD KNOW!"], bit: ["Bond upgraded: {l}! My lights are all on!"] },
    // ----- game-tracking reactions (Phase 4) -----
    added: { pip: ["{t} is on the map now!", "Ooh, {t}! I'll draw it on the map."], vexa: ["{t}, catalogued.", "{t}. Interesting choice. Filed."], rook: ["{t} JOINS THE HOARD!", "Another treasure: {t}!"], bit: ["{t} added to the library! Beep!", "New entry: {t}! Organising shelves..."] },
    start: { pip: ["A NEW QUEST?! {t}! I packed snacks! I think!", "{t}! Let's see what's over the first hill!"], vexa: ["{t}. A fresh system to dissect. How delightful.", "Starting {t}. Let's find out how it really works."], rook: ["{t}! ANOTHER KINGDOM TO CONQUER!", "THE CAMPAIGN FOR {t} BEGINS!"], bit: ["Beep! New adventure detected: {t}! Preparing emotional support protocols!", "Mission started: {t}! I'm so excited!"] },
    resume: { pip: ["Back to {t}! I remember the way!", "{t} again! I kept the map folded just right."], vexa: ["Resuming {t}. I kept notes.", "Back in {t}. I knew you'd return."], rook: ["THE SIEGE OF {t} RESUMES!", "{t}! We return, stronger than before!"], bit: ["Welcome back to {t}! Save file located!", "Resuming {t}! I kept everything warm!"] },
    pause: { pip: ["{t} can wait for us. Adventures keep!", "Bookmarking {t}. It'll be right here."], vexa: ["{t} on hold. Sensible.", "Pausing {t}. Its secrets will keep."], rook: ["{t} MAY REST. For now.", "A STRATEGIC PAUSE on {t}. Brilliant."], bit: ["{t} saved for later! No rush at all!", "Pausing {t}. It'll wait patiently. Like me!"] },
    dropped: { pip: ["Not every path is worth following. On to the next adventure!", "{t} wasn't our road. Lots more out there!"], vexa: ["{t}, dropped. A sensible allocation of your time. I approve.", "Not every system deserves our attention. Moving on."], rook: ["A TACTICAL RETREAT from {t}! Nothing more!", "{t} is unworthy of us. ONWARD!"], bit: ["Mission archived. That's okay! We can choose another!", "{t} archived. Your time is precious. Good call!"] },
    rateHigh: { pip: ["{s} stars for {t}! What a trip!", "{t}: {s} stars! I knew it was special!"], vexa: ["{s} stars for {t}. Agreed.", "{t}, {s} stars. Your taste checks out."], rook: ["{s} STARS! {t} WAS A WORTHY FOE!", "{t} EARNS {s} STARS OF GLORY!"], bit: ["{s} stars for {t}! Saving that in my happy memories!", "Rating stored: {t}, {s} stars! Nice!"] },
    rateLow: { pip: ["{s} stars. Not every land is for us, and that's okay!", "Noted! Now we know what we like."], vexa: ["{s} stars. Useful data.", "Not every game clicks. Logged."], rook: ["{s} STARS. Even overlords have standards.", "NOTED. We know our tastes."], bit: ["Rating saved! Knowing what you like helps me help you!", "{s} stars, noted! Every opinion counts!"] },
    favorite: { pip: ["A NEW FAVOURITE! {t} goes on the special shelf!", "{t} is the best?! I'm so happy for you!"], vexa: ["{t}, five stars. Fine. I'll admit it's brilliant.", "A new favourite. I'll study why."], rook: ["{t}: THE CROWN JEWEL OF THE HOARD!", "FIVE STARS! {t} SHALL BE LEGEND!"], bit: ["New favourite detected: {t}! My heart lights are on!", "{t} is a favourite! I'm so glad you found it!"] },
    hundred: { pip: ["WE EXPLORED EVERYTHING IN {t}?! EVEN THE SECRET STUFF?!", "100% of {t}! Every corner of the map!"], vexa: ["Every variable explored in {t}. Now that's satisfying.", "100% of {t}. Flawless."], rook: ["ABSOLUTE DOMINION OVER {t}! WE ARE UNSTOPPABLE!", "{t}: 100% CONQUERED!"], bit: ["ALL OBJECTIVES COMPLETE in {t}! I think my circuits are feeling proud!", "100%! {t} is fully complete!"] },
    hoursGame: { pip: ["{n} hours in {t}! That's a big adventure!", "{t} hit {n} hours! We know every path!"], vexa: ["{n} hours in {t}. You've really learned it.", "{t}: {n} hours. Mastery is forming."], rook: ["{n} HOURS OF WAR IN {t}!", "{t}: {n} HOURS! A LEGENDARY CAMPAIGN!"], bit: ["{n} hours in {t}! What a journey!", "Milestone: {t} reached {n} hours!"] },
    hoursTotal: { pip: ["{n} hours of adventures in total! Wow!", "{n} hours together! Best team ever!"], vexa: ["{n} hours logged overall. Impressive dataset.", "{n} hours total. Not bad, player."], rook: ["{n} HOURS OF CONQUEST! THE WORLD TREMBLES!", "{n} HOURS! OUR LEGEND GROWS!"], bit: ["Total playtime: {n} hours! Celebrating!", "{n} hours of fun recorded! Yay!"] },
    collection: { pip: ["{n} games on our map! It's getting huge!", "{n} games! That's so many worlds!"], vexa: ["Library size: {n}. A respectable archive.", "{n} games. I'll need a bigger index."], rook: ["{n} GAMES IN THE HOARD! MAGNIFICENT!", "THE HOARD REACHES {n}!"], bit: ["Collection milestone: {n} games! Beep beep!", "{n} games in the library! I'm organising them all!"] },
    finishedCount: { pip: ["{n} games cleared! We're real heroes now!", "That's {n} cleared! Wow!"], vexa: ["{n} games finished. Consistent execution.", "{n} cleared. I'm almost impressed. Almost."], rook: ["{n} KINGDOMS HAVE FALLEN BEFORE US!", "{n} VICTORIES! BOW BEFORE THE HOARD!"], bit: ["{n} missions complete! I'm so proud of us!", "Milestone: {n} games finished!"] },
    longSession: { pip: ["{h} in one go! Snack break?", "What a long adventure! Stretch those paws!"], vexa: ["{h} session. Deep focus. Hydrate, though.", "Long run. Your brain needs water too."], rook: ["{h} OF BATTLE! Even warriors rest.", "A MIGHTY {h} CAMPAIGN! Rest, champion."], bit: ["Friendly reminder: hydration and stretching are compatible with heroism!", "{h} logged! Maybe a water break?"] },
    welcome: { pip: ["YOU'RE BACK! I saved you a spot on the map!", "There you are! I've got a new map ready!"], vexa: ["Oh, you're back. I definitely wasn't checking.", "Welcome back. Everything's exactly where you left it."], rook: ["YOU HAVE RETURNED! I WAS NOT WORRIED!", "THE HERO RETURNS! The hoard is safe."], bit: ["Oh! You're here! My favourite notification!", "Welcome back! I kept everything safe for you!"] },
    imported: { pip: ["{n} games joined the map at once! Whoa!", "{n} new worlds! Where do we start?"], vexa: ["{n} games imported. Efficient.", "Bulk import: {n}. I love good data."], rook: ["{n} TREASURES SEIZED IN ONE RAID!", "THE HOARD SWELLS BY {n}!"], bit: ["Import complete: {n} games! Organising now!", "{n} new games! My shelves are so happy!"] }
  };
  const LINE_MOOD = { bond2: "affectionate", bond4: "affectionate", bondUp: "affectionate", added: "happy", start: "determined", resume: "happy", pause: "neutral", dropped: "thinking", rateHigh: "happy", rateLow: "thinking", favorite: "affectionate", hundred: "surprised", hoursGame: "determined", hoursTotal: "happy", collection: "surprised", finishedCount: "happy", longSession: "sleepy", welcome: "happy", imported: "surprised", hello: "happy", empty: "thinking", playing: "determined", streak: "happy", release: "surprised", backlog: "thinking", goal: "determined", trophy: "determined",
    sleepy: "sleepy", late: "sleepy", soul: "thinking", idle: "neutral", pet: "affectionate", log: "happy", clear: "happy", played: "happy", wish: "affectionate", level: "happy", gotTrophy: "surprised", timer: "determined" };
  function playerLevel(){
    const hours = games.reduce((s, g) => s + (Number(g.hours) || 0), 0), fin = games.filter(g => g.status === "finished").length;
    const xp = Math.round(hours * 10 + fin * 300); let L = 1; while (125 * L * (L + 1) <= xp) L++; return L;
  }
  // backdrops: each buddy's own little world
  const BWORLD = {
    pip: `<linearGradient id="W1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC98F"/><stop offset=".55" stop-color="#FFE9C9"/><stop offset="1" stop-color="#F7F0DC"/></linearGradient><rect width="240" height="300" fill="url(#W1)"/><circle cx="186" cy="58" r="28" fill="#FFF3D6" opacity=".9"/><path d="M-10 200C40 172 90 176 130 194C170 210 210 190 260 174V300H-10Z" fill="#8CCFAE"/><path d="M-10 228C50 208 120 218 170 230C200 238 230 232 260 224V300H-10Z" fill="#5BB394"/><path d="M-10 248C60 240 140 246 260 244V300H-10Z" fill="#EBD09A"/>`,
    vexa: `<linearGradient id="W1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9E4FA"/><stop offset=".62" stop-color="#C9BFF0"/><stop offset="1" stop-color="#A99AE6"/></linearGradient><rect width="240" height="300" fill="url(#W1)"/><path fill="#B3A6EA" d="M0 196V120h22v-20h14v40h18V90h26v106zM150 196V100h20V70h16v30h20v-14h34v110z"/><path d="M-20 150L260 90V100L-20 160Z" fill="#22E3F2" opacity=".35"/><rect y="194" width="240" height="2" fill="#FF3FA4"/>`,
    rook: `<rect width="240" height="300" fill="#F2E6C8"/><rect width="240" height="300" fill="url(#rookDotsBig)" opacity=".18"/>`,
    bit: `<radialGradient id="W1" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#25306A"/><stop offset="1" stop-color="#0B0F26"/></radialGradient><rect width="240" height="300" fill="url(#W1)"/><g fill="#CFE9FF"><rect x="20" y="30" width="4" height="4"/><rect x="64" y="70" width="3" height="3"/><rect x="210" y="40" width="4" height="4"/><rect x="180" y="120" width="3" height="3"/><rect x="30" y="150" width="4" height="4"/><rect x="96" y="24" width="3" height="3"/></g><rect y="256" width="240" height="44" fill="#141A40"/><rect y="256" width="240" height="3" fill="#6FF7FF" opacity=".6"/>`
  };
  let bwid = 0;
  const NIGHT = `<rect width="240" height="300" fill="#0C1238" opacity=".58"/><circle cx="194" cy="48" r="15" fill="#FFF3C4"/><circle cx="201" cy="43" r="13" fill="#25306A" opacity=".9"/><g fill="#FFF8D6"><rect x="30" y="34" width="3" height="3"/><rect x="74" y="20" width="2" height="2"/><rect x="120" y="44" width="3" height="3"/><rect x="156" y="16" width="2" height="2"/><rect x="214" y="96" width="2" height="2"/><rect x="52" y="86" width="2" height="2"/></g>`;
  const bworld = (t, vb = "0 0 240 260", night) => { const k = "bw" + (++bwid); return `<svg class="bworld" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${BWORLD[t].replace(/W1/g, k)}${night ? NIGHT : ""}</svg>`; };
  // ----- bond (Phase 5): one bond per buddy, earned through ordinary tracking, never lost -----
  const BOND_LEVELS = [[0, "New Teammate"], [60, "Party Member"], [200, "Trusted Ally"], [500, "Legendary Duo"], [1000, "Unbreakable Co-op"]];
  const BOND_XP = { added: 2, wish: 2, played: 6, start: 10, resume: 4, pause: 2, log: 4, longSession: 6, clear: 25, dropped: 3, rateHigh: 3, rateLow: 3, favorite: 8, hundred: 30,
    hoursGame: 10, hoursTotal: 15, collection: 15, finishedCount: 20, imported: 10, gotTrophy: 10, welcome: 5 };
  const BOND_ONCE = new Set(["added", "wish", "played", "start", "clear", "dropped", "favorite", "hundred"]); // counted once per game, so status toggling can't farm bond
  const BOND_DAILY_CAP = 120;
  // rewards: a registry future wardrobe items (hats, scarves, held items, B.I.T. faceplates) can join
  const REWARDS = [
    { lvl: 2, id: "lines", kind: "dialogue", name: "Friendship lines", desc: "New things to say that only good friends hear." },
    { lvl: 3, id: "night", slot: "bg", name: "Night world", desc: "A moonlit version of your buddy's home backdrop." },
    { lvl: 4, id: "sparkle", slot: "fx", name: "Sparkle aura", desc: "A soft glow and twinkling stars around your buddy." },
    { lvl: 4, id: "lines2", kind: "dialogue", name: "Legendary lines", desc: "Even closer, sillier and sweeter lines." },
    { lvl: 5, id: "gold", slot: "frame", name: "Golden frame", desc: "A gold frame for your buddy's portrait." },
    { lvl: 5, id: "trick", kind: "animation", name: "Signature trick", desc: "Double-tap your buddy for a special spin." }
  ];
  const BFACE = { pip: PipArt.FACE, vexa: BuddyArt.FACE.vexa, rook: "40 8 180 128", bit: BuddyArt.FACE.bit };
  function buddySVG(type, mood = "neutral", opts = {}){
    if (!BUDDIES[type]) type = "pip";
    if (!MOODS.includes(mood)) mood = "neutral";
    const art = type === "pip" ? PipArt.draw(mood) : BuddyArt[type](mood);
    return `<svg class="cbx ${type}${opts.face ? " face" : ""}${opts.cls ? " " + opts.cls : ""}" viewBox="${opts.face ? BFACE[type] : "0 0 240 260"}" preserveAspectRatio="xMidYMid meet" ${opts.label ? `role="img" aria-label="${esc(opts.label)}"` : 'aria-hidden="true"'}>${art}</svg>`;
  }
  const buddyMotion = () => settings.buddyMotion || (reduceMotion ? "still" : "full");
  // where the buddy lives: a card under Now playing, a slim bar there, or only the little companion at your side
  const BUDDY_PLACES = [["home", "Card on Library"], ["bar", "Slim bar"], ["side", "Only by my side"]];
  const buddyPlace = () => BUDDY_PLACES.some(x => x[0] === settings.buddyPlace) ? settings.buddyPlace : "side"; // floats by your side unless you seat it on the page
  const placePick = () => `<div class="seg" role="group" aria-label="Where your buddy sits">${BUDDY_PLACES.map(([k, v]) => `<button type="button" data-bplace="${k}" aria-pressed="${buddyPlace() === k}">${v}</button>`).join("")}</div>`;
  const buddy = (() => {
    let last = "", bubbleTimer = null, tapAt = 0, temp = null, tempTimer = null, dockSeen = false;
    const B = () => settings.buddy && BUDDIES[settings.buddy.type] ? settings.buddy : null;
    const fill = (txt, v) => String(txt).replace(/\{(\w)\}/g, (_, k) => v[k] ?? "");
    const line = (key, type, v = {}) => { let l = LINES[key]?.[type]; if (Array.isArray(l)) { const pool = l.filter(x => fill(x, v) !== last); l = (pool.length ? pool : l)[Math.floor(Math.random() * (pool.length || l.length))]; } return fill(l || "", v); };
    function lastActivity(){ let m = ""; games.forEach(g => { const lp = lastPlayed(g); if (lp > m) m = lp; if ((g.finished || "").length === 10 && g.finished > m) m = g.finished; const a = String(g.added || "").slice(0, 10); if (a > m) m = a; }); return m; }
    function baseMood(){ const la = lastActivity(); if (!games.length || !la) return "neutral"; const d = Math.round((new Date(todayISO()) - new Date(la)) / 864e5); return d >= 7 ? "sleepy" : "neutral"; }
    const mood = () => temp || baseMood();
    const today = () => todayISO();
    function bondOf(t){ settings.bond = settings.bond || {}; const b = settings.bond[t] || (settings.bond[t] = { xp: 0, seen: [], day: "", dayXp: 0, m: {}, since: today() }); b.m = b.m || {}; b.seen = b.seen || []; return b; }
    const bondLevel = xp => { let L = 1; BOND_LEVELS.forEach(([min], i) => { if (xp >= min) L = i + 1; }); return L; };
    function bondInfo(t){ const b = bondOf(t), L = bondLevel(b.xp), next = BOND_LEVELS[L]; return { b, L, name: BOND_LEVELS[L - 1][1], next: next ? next[1] : null, lo: BOND_LEVELS[L - 1][0], hi: next ? next[0] : null }; }
    function unlocked(t, id){ const r = REWARDS.find(x => x.id === id); return r && bondInfo(t).L >= r.lvl; }
    function deco(t){ const w = (settings.wardrobe || {})[t] || {}; return { night: w.bg === "night" && unlocked(t, "night"), sparkle: w.fx === "sparkle" && unlocked(t, "sparkle"), gold: w.frame === "gold" && unlocked(t, "gold") }; }
    const decoCls = t => { const d = deco(t); return `${d.sparkle ? " fx-sparkle" : ""}${d.gold ? " frame-gold" : ""}`; };
    const aura = t => deco(t).sparkle ? `<span class="baura" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>` : "";
    function grant(keys, gid){
      const cur = B(); if (!cur) return; const t = cur.type, b = bondOf(t), d = today();
      if (b.day !== d) { b.day = d; b.dayXp = 0; }
      const L0 = bondLevel(b.xp); let add = 0;
      for (const k of keys) {
        const xp = BOND_XP[k]; if (!xp) continue;
        if (BOND_ONCE.has(k) && gid) { const key = k + ":" + gid; if (b.seen.includes(key)) continue; b.seen.push(key); if (b.seen.length > 1500) b.seen.splice(0, b.seen.length - 1500); }
        add += xp;
        const mk = { start: "started", clear: "cleared", played: "cleared", log: "sessions", longSession: "sessions", gotTrophy: "trophies", favorite: "favourites", hundred: "hundred" }[k];
        if (mk) b.m[mk] = (b.m[mk] || 0) + 1;
      }
      add = Math.max(0, Math.min(add, BOND_DAILY_CAP - b.dayXp)); if (!add) { applySettings(); return; }
      b.xp += add; b.dayXp += add; applySettings();
      const L1 = bondLevel(b.xp);
      if (L1 > L0) {
        const nm = BOND_LEVELS[L1 - 1][1], got = REWARDS.filter(r => r.lvl === L1);
        settings.wardrobe = settings.wardrobe || {}; const w = settings.wardrobe[t] = settings.wardrobe[t] || {};
        got.forEach(r => { if (r.slot) w[r.slot] = r.id; }); applySettings();
        setTimeout(() => { const ln = line("bondUp", t, { l: nm, L: nm.toUpperCase() }); last = ln; say(ln, ["profile", "See bond"], "affectionate"); hop("jump"); confetti(); hearts(); render();
          achieve(`Bond level up: ${nm}`, `${cur.name} and you${got.length ? " · New: " + got.map(r => r.name).join(", ") : ""}`); }, 4600);
      }
      paintBond();
    }
    function paintBond(){ const el = $("#bdock .bbond"); const b = B(); if (!el || !b) return; const i = bondInfo(b.type); el.outerHTML = bondChip(i); }
    const bondChip = i => `<span class="bbond" title="Bond: ${i.name}"><span class="px">♥ ${i.name}</span><span class="bbar"><span style="width:${i.hi ? Math.round((i.b.xp - i.lo) / (i.hi - i.lo) * 100) : 100}%"></span></span></span>`;
    const dockOn = () => tab === "library" && dockSeen && !$("#bdock").hidden;
    function paint(){
      const b = B(); if (!b || settings.buddyHidden) return;
      const m = mood();
      $("#buddy-btn").innerHTML = buddySVG(b.type, m);
      const p = $("#bdock .bport .fig"); if (p) p.innerHTML = buddySVG(b.type, m);
    }
    function render(){
      document.documentElement.dataset.bmotion = buddyMotion();
      const b = B(), el = $("#buddy");
      renderDock();
      if (!b || settings.buddyHidden) { el.hidden = true; return; }
      el.hidden = false;
      el.classList.toggle("away", dockOn());
      $("#buddy-btn").setAttribute("aria-label", `Talk to ${b.name}, your co-op buddy`);
      $("#buddy-btn").classList.toggle("fx-sparkle", deco(b.type).sparkle);
      paint();
    }
    function renderDock(){
      const d = $("#bdock"), b = B();
      if (b && (settings.buddyHidden || buddyPlace() === "side")) { d.hidden = true; d.innerHTML = ""; return; }
      d.hidden = false;
      if (!b) {
        d.innerHTML = `<div class="bdock-in invite"><div class="bcrew">${Object.keys(BUDDIES).map(k => `<span class="mini" style="--bc:${BUDDIES[k].c}">${bworld(k)}<span class="fig">${buddySVG(k, "neutral")}</span></span>`).join("")}</div>
          <div class="bdtxt"><span class="px">Co-op buddy</span><b>Pick a gaming companion</b><p>Pip, Vexa, Rook or B.I.T. will keep you company and cheer on every session, clear and trophy.</p><div class="chips"><button class="btn primary small" type="button" data-buddypick>Meet the crew</button></div></div></div>`;
        return;
      }
      const T = BUDDIES[b.type];
      d.style.setProperty("--bc", T.c);
      if (buddyPlace() === "bar") { d.innerHTML = `<div class="bdock-in bar"><button class="bport${decoCls(b.type)}" type="button" data-buddytalk aria-label="Talk to ${esc(b.name)}">${bworld(b.type, undefined, deco(b.type).night)}<span class="fig">${buddySVG(b.type, mood())}</span></button>
        <div class="bdtxt"><b>${esc(b.name)}</b><p class="bsay" id="bdock-say" role="status">${esc(dockLine())}</p></div><span class="chips"><button class="btn small primary" type="button" data-buddytalk>Talk</button><button class="btn small" type="button" data-buddyfloat aria-label="Float by my side" title="Float by my side">↘</button></span></div>`; return; }
      d.innerHTML = `<div class="bdock-in"><button class="bport${decoCls(b.type)}" type="button" data-buddytalk aria-label="Talk to ${esc(b.name)}">${bworld(b.type, undefined, deco(b.type).night)}${aura(b.type)}<span class="fig">${buddySVG(b.type, mood())}</span></button>
        <div class="bdtxt"><span class="px">Co-op buddy · ${esc(T.kind)}</span><b>${esc(b.name)}</b>${bondChip(bondInfo(b.type))}<p class="bsay" id="bdock-say" role="status">${esc(dockLine())}</p>
        <div class="chips"><button class="btn small primary" type="button" data-buddytalk>Talk</button><button class="btn small" type="button" data-buddyprofile>Profile</button><button class="btn small" type="button" data-buddyfloat>Float by my side</button></div>
        <div class="bask dockask">${ASKS.map(([k, n]) => `<button type="button" data-bact="ask:${k}">${n}</button>`).join("")}</div></div></div>`;
    }
    let dockText = "";
    function dockLine(){ return dockText || line(baseMood() === "sleepy" ? "sleepy" : "hello", B().type); }
    function say(text, action, m){
      const b = B(); if (!b || settings.buddyHidden) return;
      if (m) setTemp(m);
      if (dockOn()) {
        dockText = text; const s = $("#bdock-say");
        if (s) { s.innerHTML = `${esc(text)}${action ? ` <button class="btn small primary" type="button" data-bact="${action[0]}">${esc(action[1])}</button>` : ""}`; s.classList.remove("pop"); void s.offsetWidth; s.classList.add("pop"); }
        return;
      }
      const bb = $("#bubble"); clearTimeout(bubbleTimer);
      bb.innerHTML = `<button type="button" class="bclose" data-bact="close" aria-label="Close chat">×</button><b>${esc(b.name)}</b><span>${esc(text)}</span>${action ? `<button class="btn small primary" type="button" data-bact="${esc(action[0])}">${esc(action[1])}</button>` : ""}
        <span class="bask"><small>Ask ${esc(b.name)}</small>${ASKS.map(([k, n]) => `<button type="button" data-bact="ask:${k}">${n}</button>`).join("")}</span>
        <span class="bmenu"><button type="button" data-bact="dock">Sit on my main page</button><button type="button" data-bact="profile">Profile</button></span>`;
      bb.hidden = false; bb.classList.remove("pop"); void bb.offsetWidth; bb.classList.add("pop");
      bubbleTimer = setTimeout(() => { bb.hidden = true; }, action ? 14000 : 10000);
    }
    function setTemp(m){ temp = m; paint(); clearTimeout(tempTimer); tempTimer = setTimeout(() => { temp = null; paint(); }, 5000); }
    function hop(cls = "jump"){ if (buddyMotion() !== "full") return; [$("#buddy-btn"), $("#bdock .bport")].forEach(el => { if (!el) return; el.classList.remove("jump", "wiggle", "trick"); void el.offsetWidth; el.classList.add(cls); }); }
    function hearts(){ if (buddyMotion() !== "full") return; const src = dockOn() ? $("#bdock .bport") : $("#buddy-btn"); if (!src) return; const r = src.getBoundingClientRect(); for (let i = 0; i < 4; i++) { const h = document.createElement("i"); h.className = "bheart"; h.textContent = "♥"; h.style.left = (r.left + r.width / 2 - 8 + (i - 1.5) * 12) + "px"; h.style.top = (r.top + 10) + "px"; h.style.animationDelay = (i * .12) + "s"; document.body.append(h); setTimeout(() => h.remove(), 1600); } }
    // ---------- things you can ask, in each buddy's own voice ----------
    const ASKS = [["next", "What should I play?"], ["year", "How am I doing?"], ["fact", "Fun fact"], ["tip", "Teach me a trick"]];
    const VOICE = {
      pip: { pre: ["Ooh! ", "Guess what? ", "Hey hey! ", ""], post: ["!", "! What an adventure!", "! I'll draw it on the map!"] },
      vexa: { pre: ["Analysis: ", "Observation: ", "Data point: ", ""], post: [".", ". Interesting.", ". Noted."] },
      rook: { pre: ["HEAR ME! ", "BEHOLD! ", "KNOW THIS: ", ""], post: ["!", "! GLORIOUS!", "! The hoard grows!"] },
      bit: { pre: ["Beep! ", "Report: ", "Fun fact processed! ", ""], post: ["!", "! Beep boop!", "! My lights are blinking happily!"] }
    };
    const rnd = a => a[Math.floor(Math.random() * a.length)];
    const voice = (txt, T) => { const v = VOICE[T] || VOICE.bit; return rnd(v.pre) + txt.replace(/[.!]$/, "") + rnd(v.post); };
    const TIPS = ["Tap the hours under Now playing to type in your total", "Press and hold a game on a shelf to drag it onto another shelf", "Customize, then Decorate and sign, lets you hang a sign with your name", "In a game's Play tab you can connect its .exe or a store link, and the ▶ Play button times your session", "The You tab has a year wrap-up story. Try it at the end of the year", "PC games can read playtime from their save folder in the game's Play tab", "Arrange your shelves by console, decade or game type from the Arrange menu", "Add friends by gamer tag in the Friends tab and peek at their shelves", "Sign in under Sync and your phone and PC share one library", "Double-tap me for a pet. I like those", "Tap any trinket in your room and press × to remove it, or drag it somewhere new", "Rate games with half stars by tapping the left half of a star"];
    function facts(){
      const P = games.filter(g => !UNPLAYED.has(g.status)), H = games.reduce((s, g) => s + (Number(g.hours) || 0), 0), out = [];
      if (H >= 24) out.push(`You've played ${Math.round(H).toLocaleString()} hours in total. That's ${Math.round(H / 24)} whole days`);
      const most = [...games].filter(g => Number(g.hours)).sort((a, c) => c.hours - a.hours)[0]; if (most) out.push(`Your most played game is ${most.title}, at ${fmtH(most.hours)}`);
      const gen = new Map(); P.forEach(g => (g.genres || []).slice(0, 2).forEach(x => gen.set(x, (gen.get(x) || 0) + 1))); const tg = [...gen].sort((a, c) => c[1] - a[1])[0]; if (tg && tg[1] >= 3) out.push(`Your favourite genre is ${tg[0]}, with ${tg[1]} games played`);
      const old = P.filter(g => g.year).sort((a, c) => a.year - c.year)[0]; if (old) out.push(`The oldest game you've played is ${old.title}, from ${old.year}`);
      const rated = P.filter(g => g.rating); if (rated.length >= 5) out.push(`Your average rating is ${(rated.reduce((s, g) => s + g.rating, 0) / rated.length).toFixed(1)} stars across ${rated.length} games`);
      const last = games.filter(g => g.status === "finished" && /^\d{4}-\d{2}-\d{2}$/.test(g.finished || "")).sort((a, c) => c.finished.localeCompare(a.finished))[0]; if (last) out.push(`The last game you cleared was ${last.title}, ${relDay(last.finished)}`);
      const back = games.filter(g => g.status === "backlog"), bl = back.reduce((s, g) => s + (Number(g.length) || 0), 0); if (back.length >= 3) out.push(`${back.length} games wait in your backlog${bl ? `, about ${Math.round(bl)} hours of story` : ""}`);
      try { const V = soulData(); if (V.dna[0]) out.push(`${V.dna[0].pct}% of your Gamer DNA is ${V.dna[0].short}`); } catch {}
      const plat = new Map(); P.forEach(g => { const p = mainPlat(g); if (p) plat.set(p, (plat.get(p) || 0) + 1); }); const tp = [...plat].sort((a, c) => c[1] - a[1])[0]; if (tp && tp[1] >= 3) out.push(`You play most on ${tp[0]}: ${tp[1]} games`);
      return out;
    }
    function nextPick(){
      const pool = games.filter(g => g.status === "backlog" || (g.status === "playing" && lastPlayed(g) && (Date.now() - new Date(lastPlayed(g))) > 14 * 864e5));
      if (!pool.length) return null;
      let dna = {}; try { soulData().dna.forEach(x => dna[x.k] = x.pct); } catch {}
      const scored = pool.map(g => { const T = topGene(g), L = Number(g.length) || 0; return { g, T, L, s: (T ? dna[T.k] || 0 : 0) + (L && L <= 15 ? 8 : 0) + (g.status === "playing" ? 6 : 0) + Math.random() * 6 }; }).sort((a, c) => c.s - a.s)[0];
      const why = scored.g.status === "playing" ? `you started it and haven't been back in a while` : scored.T && dna[scored.T.k] ? `it's a ${scored.T.short} game, and that's ${dna[scored.T.k]}% of your DNA` : scored.L ? `it's only about ${scored.L} hours long` : `it's been waiting in your backlog`;
      return { g: scored.g, why };
    }
    function ask(k){
      const b = B(); if (!b) return; const T = b.type;
      if (k === "next") { const p = nextPick(); if (!p) return say(voice("Your backlog is empty. Discover has ideas", T), ["discover", "Open Discover"], "thinking"); return say(voice(`Try ${p.g.title}: ${p.why}`, T), ["open:" + p.g.id, "Open it"], "determined"); }
      if (k === "year") {
        const y = String(new Date().getFullYear()), m = todayISO().slice(0, 7), fin = games.filter(g => g.status === "finished" && (g.finished || "").startsWith(y)).length, goal = Math.max(1, +settings.goal || 12);
        const mh = games.reduce((s, g) => s + (g.sessions || []).filter(x => x.d.startsWith(m)).reduce((a, x) => a + x.h, 0), 0), sk = streak();
        return say(voice(`${fin} of ${goal} games cleared this year${mh ? `, ${fmtH(mh)} played this month` : ""}${sk >= 2 ? `, and a ${sk}-day streak` : ""}`, T), ["review:" + y, "See my year"], fin >= goal ? "happy" : "determined");
      }
      if (k === "fact") { const f = facts(); return say(voice(f.length ? rnd(f) : "Add a few games and I'll dig up facts about your library", T), null, "happy"); }
      if (k === "tip") return say(voice(`Tip: ${rnd(TIPS)}`, T), null, "thinking");
    }
    // the buddy sometimes speaks up on its own (Quiet / Sometimes / Chatty in its profile)
    const CHAT = { quiet: 0, some: 4 * 6e4, chatty: 100000 };
    let lastAmbient = Date.now(), ambientCount = 0;
    setInterval(() => {
      const b = B(), every = CHAT[settings.buddyChat || "some"]; if (!b || !every || settings.buddyHidden || document.hidden || root.innerHTML || !$("#bubble").hidden || document.querySelector(".tour,.story,.art-scrim,.save-scrim")) return;
      if (Date.now() - lastAmbient < every || ambientCount >= (settings.buddyChat === "chatty" ? 20 : 8)) return;
      lastAmbient = Date.now(); ambientCount++;
      const r = Math.random(), T = b.type;
      if (r < .35) { const f = facts(); if (f.length) return say(voice(rnd(f), T), null, "happy"); }
      if (r < .55) return say(voice(`Tip: ${rnd(TIPS)}`, T), null, "thinking");
      if (r < .7) { const p = nextPick(); if (p) return say(voice(`Feel like ${p.g.title}? ${p.why[0].toUpperCase() + p.why.slice(1)}`, T), ["open:" + p.g.id, "Open it"], "determined"); }
      talk();
    }, 15000);
    function talk(){
      const b = B(); if (!b) return; const T = b.type, opts = [];
      const add = (key, v = {}, action) => opts.push([line(key, T, v), action, LINE_MOOD[key]]);
      if (!games.length) add("empty", {}, ["discover", "Open Discover"]);
      else {
        if (baseMood() === "sleepy") add("sleepy");
        const hr = new Date().getHours(); if (hr < 5) add("late");
        const pl = games.filter(g => g.status === "playing").sort((a, c) => lastPlayed(c).localeCompare(lastPlayed(a)))[0]; if (pl) add("playing", { t: pl.title, h: fmtH(pl.hours) });
        const sk = streak(); if (sk >= 2) add("streak", { n: sk });
        const rel = games.filter(g => g.status === "wishlist").map(g => ({ g, i: releaseInfo(g.release) })).filter(x => x.i.days != null && x.i.days > 0 && x.i.days <= 60).sort((a, c) => a.i.days - c.i.days)[0];
        if (rel) add("release", { t: rel.g.title, d: rel.i.days });
        const back = games.filter(g => g.status === "backlog").length; if (back >= 3) add("backlog", { n: back }, ["roulette", "Pick for me"]);
        const y = String(new Date().getFullYear()), goal = Math.max(1, +settings.goal || 12), done = games.filter(g => g.status === "finished" && (g.finished || "").startsWith(y)).length;
        add("goal", { n: done, g: goal, p: Math.round(done / goal * 100) });
        const near = trophyList().filter(t => !t.done && t.need - t.have <= Math.max(1, Math.ceil(t.need * .25))).sort((a, c) => (a.need - a.have) / a.need - (c.need - c.have) / c.need)[0];
        if (near) add("trophy", { t: near.name, n: (near.need - near.have).toLocaleString() }, ["trophies", "See trophies"]);
        const soul = playerSoul(); if (soul) add("soul", { t: soul.top.name }, ["stats", "See my soul"]);
        add("idle"); add("idle");
        const BL = bondInfo(T).L; if (BL >= 2) add("bond2"); if (BL >= 4) { add("bond4"); add("bond4"); }
      }
      const pool = opts.filter(o => o[0] !== last); const pick = (pool.length ? pool : opts)[Math.floor(Math.random() * (pool.length || opts.length))];
      last = pick[0]; say(pick[0], pick[1], pick[2]); hop("wiggle");
    }
    const FX = { clear: "confetti", hundred: "confetti", collection: "confetti", finishedCount: "confetti", level: "confetti", gotTrophy: "confetti", favorite: "hearts", wish: "hearts", pet: "hearts", welcome: "hearts",
      pause: "wiggle", dropped: "wiggle", rateLow: "wiggle", empty: "wiggle" };
    function confetti(){
      if (buddyMotion() !== "full") return; const src = dockOn() ? $("#bdock .bport") : $("#buddy-btn"); if (!src) return;
      const r = src.getBoundingClientRect(), cols = [BUDDIES[B().type].c, "#FFD24A", "#6FF7FF", "#FF7EB6", "#fff"];
      for (let i = 0; i < 18; i++) { const c = document.createElement("i"); c.className = "bconf"; c.style.left = (r.left + r.width / 2) + "px"; c.style.top = (r.top + r.height * .35) + "px";
        c.style.background = cols[i % cols.length]; c.style.setProperty("--x", (Math.random() * 160 - 80).toFixed(0) + "px"); c.style.setProperty("--y", (-40 - Math.random() * 90).toFixed(0) + "px"); c.style.setProperty("--r", (Math.random() * 540 - 270).toFixed(0) + "deg");
        c.style.animationDelay = (Math.random() * .12).toFixed(2) + "s"; document.body.append(c); setTimeout(() => c.remove(), 1500); }
    }
    function react(kind, v = {}, delay){ const b = B(); if (!b || !LINES[kind]) return; if (kind === "gotTrophy" || kind === "imported" || kind === "welcome") grant([kind]); setTimeout(() => { const t = line(kind, b.type, v); last = t; say(t, null, LINE_MOOD[kind]);
      const fx = FX[kind]; if (fx === "wiggle") hop("wiggle"); else { hop("jump"); if (fx === "confetti") confetti(); if (fx === "hearts") hearts(); } }, delay ?? (kind === "log" ? 300 : 1200)); }
    // Phase 4: look at what changed in a save and pick the single most meaningful reaction
    const crossed = (a, b, marks) => { let hit = 0; for (const m of marks) if (a < m && b >= m) hit = m; return hit; };
    const PRIORITY = ["hundred", "clear", "favorite", "collection", "finishedCount", "hoursTotal", "hoursGame", "dropped", "pause", "start", "resume", "longSession", "log", "rateHigh", "rateLow", "wish", "played", "added"];
    function event(prev, g, before, after){
      if (!B() || !g) return;
      const t = g.title, ev = {};
      const st = g.status, pst = prev?.status;
      if (!prev) {
        if (st === "wishlist") ev.wish = { t }; else if (st === "playing") ev.start = { t }; else if (st === "finished") ev.played = { t }; else ev.added = { t };
      } else if (st !== pst) {
        if (st === "finished") ev.clear = { t };
        else if (st === "playing") ev[(Number(prev.hours) > 0 || (prev.sessions || []).length || pst === "dropped" || pst === "finished") ? "resume" : "start"] = { t };
        else if (st === "backlog" && pst === "playing") ev.pause = { t };
        else if (st === "dropped") ev.dropped = { t };
        else if (st === "wishlist") ev.wish = { t };
      }
      const r0 = Number(prev?.rating) || 0, r1 = Number(g.rating) || 0;
      if (r1 && r1 !== r0) { if (r1 >= 5 && r0 < 5) ev.favorite = { t }; else if (r1 >= 3.5) ev.rateHigh = { t, s: r1 }; else ev.rateLow = { t, s: r1 }; }
      const p0 = Number(prev?.progress) || 0, p1 = Number(g.progress) || 0;
      if (prev && p0 < 100 && p1 >= 100 && !(st === "finished" && pst !== "finished")) ev.hundred = { t }; // finishing a game sets 100% too; that counts as a clear
      const h0 = Number(prev?.hours) || 0, h1 = Number(g.hours) || 0;
      if (prev && h1 > h0) {
        const dh = Math.round((h1 - h0) * 10) / 10;
        ev[dh >= 3 ? "longSession" : "log"] = { h: fmtH(dh), t };
        const hm = crossed(h0, h1, [10, 25, 50, 100, 200, 500, 1000]); if (hm) ev.hoursGame = { t, n: hm };
      }
      const tm = crossed(before.hours, after.hours, [50, 100, 250, 500, 1000, 2500, 5000]); if (tm) ev.hoursTotal = { n: tm };
      const cm = crossed(before.owned, after.owned, [10, 25, 50, 100, 250, 500, 1000]); if (cm) ev.collection = { n: cm };
      const fm = crossed(before.fin, after.fin, [5, 10, 25, 50, 100, 250]); if (fm) ev.finishedCount = { n: fm };
      const keys = Object.keys(ev); if (keys.length) grant(keys, g.id);
      const k = PRIORITY.find(x => ev[x]); if (!k) return;
      // adding a game (to any shelf) is routine: a little hop, no speech bubble. Milestones still get a line.
      if (!prev && ["added", "wish", "played", "start"].includes(k)) { setTimeout(() => hop("wiggle"), 600); return; }
      react(k, ev[k], k === "log" || k === "longSession" ? 300 : 600);
    }
    // returning after a break: never a guilt trip, just a happy hello
    function welcomeBack(){
      const today = todayISO(), seen = settings.lastSeen;
      settings.lastSeen = today; applySettings();
      if (!B() || !seen) return;
      const days = Math.round((new Date(today) - new Date(seen)) / 864e5);
      if (days >= 5) { setTemp("sleepy"); setTimeout(() => react("welcome", {}, 0), 1400); }
    }
    function pet(){ const b = B(); if (!b) return; say(line("pet", b.type), null, "affectionate"); hearts();
      if (unlocked(b.type, "trick") && buddyMotion() === "full") hop("trick"); else hop("jump"); }
    $("#buddy-btn").addEventListener("click", () => {
      const now = Date.now();
      if (!$("#bubble").hidden && now - tapAt > 380) { $("#bubble").hidden = true; tapAt = 0; return; } // tap again to close the chat
      if (now - tapAt < 380) { tapAt = 0; pet(); return; }
      tapAt = now; setTimeout(() => { if (tapAt === now) talk(); }, 390);
    });
    $("#bubble").addEventListener("click", e => {
      const a = e.target.closest("[data-bact]"); $("#bubble").hidden = true; if (!a) return;
      const k = a.dataset.bact; if (k === "close") return; if (k.startsWith("ask:")) return setTimeout(() => ask(k.slice(4)), 60); if (k.startsWith("review:")) return openReview(+k.slice(7)); if (k.startsWith("open:")) { const g = games.find(x => x.id === k.slice(5)); if (g) openEditor(g, false); return; }
      if (k === "roulette") openRoulette(); else if (k === "profile") openPicker(B()?.type); else if (k === "dock") seat("home"); else showTab(k);
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#bubble").hidden) $("#bubble").hidden = true; });
    // move the buddy between your side and the main page
    function seat(place){
      settings.buddyPlace = place; settings.buddyHidden = false; applySettings(); dockText = ""; render(); renderTrophies?.();
      if (place !== "side") { showTab("library"); requestAnimationFrame(() => $("#bdock").scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" })); toast(`${B()?.name || "Your buddy"} now sits on your main page, after Now playing. Tap “Float by my side” to send it back.`); }
      else toast(`${B()?.name || "Your buddy"} floats by your side again. Tap it any time to talk.`);
    }
    // the dock: shown on the Library page; the floating buddy steps aside while it's on screen
    if ("IntersectionObserver" in window) new IntersectionObserver(es => { dockSeen = es[0].isIntersecting; const b = B(); if (b && !settings.buddyHidden) $("#buddy").classList.toggle("away", dockOn()); if (dockSeen) $("#bubble").hidden = true; }).observe($("#bdock"));
    $("#bdock").addEventListener("click", e => {
      if (e.target.closest("[data-buddyfloat]")) { seat("side"); return; }
      const a = e.target.closest("[data-bact]"); if (a) { dockText = ""; const k = a.dataset.bact; if (k.startsWith("ask:")) return ask(k.slice(4)); if (k.startsWith("review:")) return openReview(+k.slice(7)); if (k.startsWith("open:")) { const g = games.find(x => x.id === k.slice(5)); if (g) openEditor(g, false); return; } if (k === "roulette") openRoulette(); else if (k === "profile") openPicker(B()?.type); else showTab(k); return; }
      if (e.target.closest(".bport")) { e.stopPropagation(); const now = Date.now(); if (now - tapAt < 380) { tapAt = 0; pet(); return; } tapAt = now; setTimeout(() => { if (tapAt === now) talk(); }, 390); }
    }, true);
    // profile and picker: one window that lets you meet all four
    function openPicker(focus, intro){
      const cur = B();
      let pick = focus && BUDDIES[focus] ? focus : cur?.type || "pip", preview = "neutral", typed = null;
      const nameFor = k => cur && cur.type === k ? cur.name : BUDDIES[k].name;
      const html = () => { const T = BUDDIES[pick], active = cur && cur.type === pick;
        return `<div class="modal wide bprof" role="dialog" aria-modal="true" aria-labelledby="bp-t" style="--bc:${T.c}">
        <div class="reshead"><div><span class="px">${intro || (cur ? "Your co-op crew" : "Player 2 has joined")}</span><h2 id="bp-t">${cur ? "Co-op buddies" : "Choose your co-op buddy"}</h2></div><button class="btn small" type="button" data-mclose>${cur ? "Close" : "Later"}</button></div>
        <div class="bcrewpick" role="tablist" aria-label="Buddies">${Object.entries(BUDDIES).map(([k, b]) => `<button type="button" role="tab" class="bchip${pick === k ? " on" : ""}" data-bpick="${k}" aria-selected="${pick === k}" style="--bc:${b.c}"><span class="mini">${bworld(k)}<span class="fig">${buddySVG(k, "neutral", { face: true })}</span></span><span><b>${esc(nameFor(k))}</b><small>${b.kind}</small></span>${cur && cur.type === k ? `<i class="px">Active</i>` : ""}</button>`).join("")}</div>
        <div class="bprofile">
          <div class="bstagebig${decoCls(pick)}">${bworld(pick, undefined, deco(pick).night)}${aura(pick)}<span class="fig">${buddySVG(pick, preview, { label: `${T.name}, ${preview}` })}</span></div>
          <div class="bpinfo">
            <div><span class="px" style="color:var(--bc)">${T.kind} · ${T.role}</span><h3>${esc(nameFor(pick))}</h3></div>
            <p>${T.blurb}</p>
            <div><span class="px">Loves</span><div class="blikes">${T.likes.map(l => `<span>${l}</span>`).join("")}</div></div>
            <div><span class="px">Moods · tap to try</span><div class="bmoods">${MOODS.map(m => `<button type="button" class="bmood${m === preview ? " on" : ""}" data-bmood="${m}" aria-pressed="${m === preview}" title="${m}"><span class="fig">${buddySVG(pick, m, { face: true })}</span><small>${m}</small></button>`).join("")}</div></div>
            ${bondPanel(pick)}
            <label class="field"><span class="px">Name</span><input id="bp-name" maxlength="20" value="${esc(typed ?? nameFor(pick))}"></label>
            <div class="chips">${active ? `<button class="btn primary" type="button" id="bp-save">Save name</button><button class="btn" type="button" id="bp-hide">${settings.buddyHidden ? "Show on screen" : "Hide from screen"}</button>` : `<button class="btn primary" type="button" id="bp-go">Team up with ${esc(T.name)}</button>`}</div>
            ${active ? `<div><span class="px">Where ${esc(cur.name)} sits</span>${placePick()}</div><div><span class="px">How often ${esc(cur.name)} speaks up</span><div class="seg" role="group">${[["quiet", "Only when I tap"], ["some", "Sometimes"], ["chatty", "Chatty"]].map(([k, v]) => `<button type="button" data-bchat="${k}" aria-pressed="${(settings.buddyChat || "some") === k}">${v}</button>`).join("")}</div></div>` : ""}
            <div><span class="px">Buddy animation</span><div class="seg" role="group" aria-label="Buddy animation">${[["full", "Full"], ["gentle", "Gentle"], ["still", "Still"]].map(([k, v]) => `<button type="button" data-bmot="${k}" aria-pressed="${buddyMotion() === k}">${v}</button>`).join("")}</div>
              <div class="note">Gentle keeps a slow idle without hops or hearts. Still turns all buddy motion off.${reduceMotion ? " Your device asks for reduced motion, so Still is the default." : ""}</div></div>
          </div></div></div>`; };
      const redraw = () => { $("#scrim").innerHTML = html(); };
      const keep = () => { const i = $("#bp-name"); if (i) typed = i.value; };
      openModal(html(), e => {
        const c = e.target.closest("[data-bpick]"); if (c) { if (c.dataset.bpick !== pick) typed = null; pick = c.dataset.bpick; preview = "neutral"; redraw(); return; }
        const m = e.target.closest("[data-bmood]"); if (m) { keep(); preview = m.dataset.bmood; redraw(); return; }
        const eq = e.target.closest("button[data-equip]"); if (eq) { keep(); const [slot, id] = eq.dataset.equip.split(":"); settings.wardrobe = settings.wardrobe || {}; const w = settings.wardrobe[pick] = settings.wardrobe[pick] || {}; w[slot] = w[slot] === id ? "" : id; applySettings(); render(); redraw(); return; }
        const mo = e.target.closest("button[data-bmot]"); if (mo) { keep(); settings.buddyMotion = mo.dataset.bmot; applySettings(); render(); redraw(); return; }
        const bpl = e.target.closest("button[data-bplace]"); if (bpl) { keep(); settings.buddyPlace = bpl.dataset.bplace; settings.buddyHidden = false; applySettings(); render(); redraw(); return; }
        const bch = e.target.closest("button[data-bchat]"); if (bch) { keep(); settings.buddyChat = bch.dataset.bchat; applySettings(); redraw(); return; }
        if (e.target.id === "bp-hide") { settings.buddyHidden = !settings.buddyHidden; applySettings(); render(); redraw(); return; }
        if (e.target.id === "bp-save") { const nm = ($("#bp-name").value.trim() || BUDDIES[pick].name).slice(0, 20); settings.buddy.name = nm; applySettings(); render(); toast(`Saved. Your buddy is ${nm}.`); redraw(); return; }
        if (e.target.id === "bp-go") {
          const typed = $("#bp-name").value.trim();
          const nm = (typed || BUDDIES[pick].name).slice(0, 20);
          settings.buddy = { type: pick, name: nm }; settings.buddyAsked = true; settings.buddyHidden = false; applySettings(); closeModal(); dockText = ""; render();
          setTimeout(() => { say(`${line("hello", pick)} Tap me anytime, double-tap to pet me.`, null, "happy"); hop("jump"); hearts(); }, 300);
          if (tab === "trophies") renderTrophies();
        }
      });
      settings.buddyAsked = true; applySettings();
    }
    function bondPanel(t){
      const i = bondInfo(t), m = i.b.m, w = (settings.wardrobe || {})[t] || {};
      const pct = i.hi ? Math.round((i.b.xp - i.lo) / (i.hi - i.lo) * 100) : 100;
      const moments = [["started", "games started"], ["cleared", "games cleared"], ["sessions", "sessions"], ["trophies", "trophies"]].filter(([k]) => m[k]).map(([k, v]) => `<span><b>${m[k]}</b> ${v}</span>`).join("");
      return `<div class="bondbox"><div class="bondtop"><span class="px">Bond · level ${i.L} of 5</span><b>♥ ${i.name}</b></div>
        <div class="bbar big" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Bond progress"><span style="width:${pct}%"></span></div>
        <div class="note">${i.next ? `${(i.hi - i.b.xp).toLocaleString()} bond to ${i.next}.` : "The highest bond there is."} Bond grows when you track games together: starting, logging sessions, finishing, rating, trophies. It never goes down, and breaks are fine.</div>
        ${moments ? `<div class="bmoments">${moments}</div>` : ""}
        <ul class="brewards">${REWARDS.map(r => { const ok = i.L >= r.lvl, on = r.slot && w[r.slot] === r.id;
          return `<li class="${ok ? "ok" : "locked"}"><span class="bri">${ok ? "♥" : "○"}</span><span class="brt"><b>${r.name}</b><small>${ok ? r.desc : `Unlocks at ${BOND_LEVELS[r.lvl - 1][1]}`}</small></span>${ok && r.slot ? `<button type="button" class="btn small${on ? " primary" : ""}" data-equip="${r.slot}:${r.id}" aria-pressed="${on}">${on ? "On" : "Off"}</button>` : ""}</li>`; }).join("")}</ul></div>`;
    }
    function card(){
      const b = B();
      if (!b) return `<div class="buddycard"><div class="bstage">${buddySVG("pip", "neutral")}</div><div><span class="px">Co-op buddy</span><h3>No buddy yet</h3><div class="note">Pick Pip, Vexa, Rook or B.I.T. to keep you company.</div><button class="btn primary small" type="button" data-buddypick>Meet the crew</button></div></div>`;
      const T = BUDDIES[b.type];
      return `<div class="buddycard${buddyPlace() !== "home" ? " slim" : ""}" style="--bc:${T.c}"><div class="bstage big${decoCls(b.type)}">${bworld(b.type, undefined, deco(b.type).night)}${aura(b.type)}<span class="fig">${buddySVG(b.type, mood())}</span></div><div class="bmeta"><span class="px">Your co-op buddy · ${esc(T.kind)}</span><h3>${esc(b.name)}</h3>${bondChip(bondInfo(b.type))}
        <div class="note">${esc(T.blurb)}</div>
        <div class="chips"><button class="btn small primary" type="button" data-buddytalk>Talk</button><button class="btn small" type="button" data-buddyprofile>Profile</button><button class="btn small" type="button" data-buddyhide>${settings.buddyHidden ? "Show" : "Hide"}</button></div></div></div>`;
    }
    // one-time move from the first three buddies to the new crew; the buddy's custom name is kept
    function migrate(){
      const b = settings.buddy; if (!b || BUDDIES[b.type]) return false;
      const m = OLD_BUDDY[b.type]; if (!m) { settings.buddy = null; applySettings(); return false; }
      settings.buddy = { type: m[0], name: b.name && b.name !== m[1] ? b.name : BUDDIES[m[0]].name };
      applySettings(); return true;
    }
    return { render, say, react, talk, openPicker, card, migrate, event, welcomeBack, profile: () => openPicker(B()?.type) };
  })();

  $("#cb-defs").innerHTML = PipArt.DEFS + BuddyArt.DEFS;

