SAVE POINT: phone + PC game log with sync
==========================================

What's in this folder
  index.html             the app
  manifest.webmanifest   makes it installable on phones and computers
  sw.js                  lets it open offline and remembers covers
  *.png                  the app icons

1) PUT THE APP ONLINE with GitHub Pages (about 3 minutes)
  a. On https://github.com click "+" (top right) > New repository.
     Name it: save-point   Leave it Public. Click "Create repository".
  b. Click "uploading an existing file". Drag in EVERYTHING from this
     folder. Click "Commit changes".
  c. Open Settings > Pages. Source: Deploy from a branch, Branch: main,
     folder: / (root). Save.
  d. After a minute the app lives at:
        https://btb993.github.io/save-point/
     It sits next to your Book Nook (btb993.github.io/reading-ledger/),
     so the two share one login on each device.

2) TURN ON SYNC (one time, about 2 minutes)
  Save Point uses the same free Supabase project as your Book Nook.
  a. Open the app and click "Sync". If you're signed in to the Book
     Nook in that browser, you're already signed in here too.
     Otherwise sign in with your Book Nook email and password.
  b. The first time, it asks you to add a table for games:
     press "Copy the database setup", open the Supabase SQL editor
     with the button, paste, press Run, then "Check again".
     This only adds a new table. Your books are not touched.

3) PUT IT ON YOUR PHONE
  Open https://btb993.github.io/save-point/ on the phone, sign in, then:
    iPhone:  Safari > Share > Add to Home Screen
    Android: Chrome > ⋮ menu > Install app

4) BRING YOUR GAMES ACROSS
  - From the version inside Claude: "Save a backup" there, then
    "Load a backup" here.
  - From Steam: "Import from Steam" (paste your Steam games page), then
    "Fill missing details" in the Library to add genres, studios, covers
    and Metacritic scores.

WHAT'S INSIDE (v3.66)
  - Spine logos keep their original colours.

WHAT'S INSIDE (v3.65)
  - Launcher v2: sessions reach the open app window, Steam games logged automatically, better close detection.

WHAT'S INSIDE (v3.64)
  - Compact friends list with Activity and Chats tabs; recommend a game from its window.

WHAT'S INSIDE (v3.63)
  - My top 10; add friends' games straight to Finished without losing your place.

WHAT'S INSIDE (v3.62)
  - Instant Jog your memory (weekly list file, data/jog.json, built by tools/build-jog.mjs); mouse wheel scrolls sideways lists.

WHAT'S INSIDE (v3.61)
  - Recommendations match the era of games you play.

WHAT'S INSIDE (v3.60)
  - One chat per friend with game topics; faster Discover and Jog your memory; smoother app.

WHAT'S INSIDE (v3.59)
  - Cobweb outline fix on glass shelves.

WHAT'S INSIDE (v3.58)
  - Show or hide the Abandoned shelf from Customize.

WHAT'S INSIDE (v3.57)
  - Search filters: console, release years and order.

WHAT'S INSIDE (v3.56)
  - Richer room themes: more detail, light and small animations in every theme.

WHAT'S INSIDE (v3.55)
  - Room themes for every app theme, a fuller year in review with estimated hours, full backups, faster start.

WHAT'S INSIDE (v3.54)
  - New Sci-fi theme: deep space banner, starship HUD panels, cyan glow.

WHAT'S INSIDE (v3.53)
  - Emoji and game stickers in chat; compare shelves with friends; richer Cozy, Modern and Retro themes.

WHAT'S INSIDE (v3.52)
  - Year view only counts games you actually played; cleaner typo search.

WHAT'S INSIDE (v3.51)
  - Search: Show more results (up to 30); exact friend ratings.

WHAT'S INSIDE (v3.50)
  - Notifications bell with conversations, replies and reactions
    (re-run supabase/notes.sql once), chat about a friend's game.
  - Subtle tonight dice; rug styles, floor plant, one Edit button in the
    room; free-standing themed trinkets; typo-tolerant search with
    series; better Popular / Coming soon / recommendations; folded Top
    100; living Cyberpunk banner.

WHAT'S INSIDE (v3.49)
  - What should I play tonight? (time + mood picker).
  - Wishlist prices and sale alerts (CheapShark).
  - Discover: Play together list with "ask a friend".
  - Public profile page (?p=yourtag) and a share image. Needs
    supabase/public.sql run once (Settings > Public profile shows how).
  - Room: shelf trinkets in the bookcase, buddy moods.
  - Code is now in src/ (built into index.html by tools/build.mjs) with
    automatic checks: see src/README.md.

WHAT'S INSIDE (v3.48)
  - Compact Settings in four groups with small theme swatches.

WHAT'S INSIDE (v3.47)
  - Banner emblem is now the Health Bar Heart (bar = XP to next level);
    Heart container trinket; a richer Fantasy theme.

WHAT'S INSIDE (v3.46)
  - Drag trinkets from the top shelf onto any shelf, even between games,
    and back again.

WHAT'S INSIDE (v3.45)
  - Fantasy theme keeps platform colours on case labels; gold is an
    option in Settings.

WHAT'S INSIDE (v3.44)
  - Abandoned shelf that appears with your first dropped game (cobwebs).
  - Friends: game details (rating, feelings, dates), recommend / skip,
    "how was it?" with answers, cheers, activity, taste match. Needs
    supabase/notes.sql run once (the Friends tab shows how).

WHAT'S INSIDE (v3.43)
  - Black, White and Colour spines keep logos in their own colours, like
    Cover art spines; the room's bookcase matches your shelves.

WHAT'S INSIDE (v3.42)
  - Room setup under the room in columns (no scrolling); room always
    available; monitor cover fallbacks; uniform logo spines in the
    bookcase; VR headsets; buddy bean bag by the TV; soundbar.

WHAT'S INSIDE (v3.41)
  - Room setup in six compact tabs; chair tucked in under a raised
    monitor; tap the monitor to play; poster choices; buddy in the room;
    cleaner PC with a "how well it runs your games" summary; cover-art
    spines in the bookcase.
  - Fixed the game window's Can I run it? and How to launch sections
    sliding under the footer buttons.

WHAT'S INSIDE (v3.40)
  - Opens on your shelves by default; "Room view" shows the room, and
    you can choose which comes first (Room tab in the setup).
  - Room redrawn to real proportions, with the setup panel beside it so
    changes show live. More cases, lights, desks, chairs, monitors,
    wall colours and rugs.

WHAT'S INSIDE (v3.39)
  - Gaming room on top of the Library: bookcase (your shelves in your
    room style, tap to open them), desk with the game you're playing on
    the monitor, your PC with its parts labelled, and a TV corner with
    your consoles. Set it up under My PC, Consoles and Desk & lights.
  - Spines: "Keep logos in full colour" for Black, White and Colour.

WHAT'S INSIDE (v3.38)
  - The co-op buddy no longer pops up a speech bubble each time you add
    a game; it wiggles instead. Milestones still get a line.

WHAT'S INSIDE (v3.37)
  - Recommendations: one bigger lookup (up to 200 games) is kept for a
    few days; the daily picks and Shuffle are drawn from it on your
    device, so they're instant. The old list stays up while a new one
    loads, genre matching only uses your top games (much faster), and
    covers load in parallel.
  - Adding a game from the recommendations no longer reshuffles the rest.
  - Update log in the app: Settings > What's new, plus a small note
    after each update.

WHAT'S INSIDE (v3.36)
  - Recommendations change every day, and a Shuffle button deals a new
    set any time. Each day a different mix of your liked games drives
    the list (the ones you touched most recently always count).
  - Games you already have are left out before ranking, so the list
    has room for many more new suggestions (up to 160 looked at).
  - Strong matches still usually come first, but the order is a
    weighted draw, not a fixed list. At most three picks come from the
    same game of yours, two from one series, three from one studio.
  - Suggestions you've been shown several days in a row without
    picking them slowly make room for others.

WHAT'S INSIDE (v3.34)
  - Friend alerts: a friend request or an accepted request pops up
    wherever you are in the app (with Accept right there), and a red
    badge on Friends shows waiting requests. Checked every minute and
    whenever you come back to the app.
  - Save Point reloads itself when a new version is out (or tells you,
    if a window is open), so old versions don't hang around.

WHAT'S INSIDE (v3.33)
  - Cozy room and Sunny loft: the blocky, tiled wood texture is gone.
    Shelf backs are now smooth vertical boards with fine grain, planks
    have clean long grain, and the cozy shelves get a warm lamp glow.
  - The drifting pixels are fainter on wooden rooms, so they no longer
    look like dust.

WHAT'S INSIDE (v3.32)
  - Fixed: shelf options, decorations, trinkets, Move games and the
    backlog picker stopped responding to clicks on the shelves.

WHAT'S INSIDE (v3.31)
  - Creating an account asks for the invite code, because the Supabase
    project shared with the Book Nook only accepts new accounts that
    have it. Wrong codes get a clear message.

WHAT'S INSIDE (v3.30)
  - Playtime function: better name matching on IGDB (exact name first,
    then "Title: Subtitle"), only signed-in players can use it, it only
    answers the Save Point site, and input is checked. Re-paste it.
  - Games looked up before IGDB/RAWG were connected get looked up again.
    "Look up my games now" does the whole library (up to 300 games).
  - When IGDB's "main story" comes from a rushed player, the estimate
    uses "main + extras" instead.
  - Security: friends' shared data is cleaned before it's shown, and a
    Content Security Policy blocks scripts from unknown sites.

WHAT'S INSIDE (v3.29)
  - Typical playtimes can also use RAWG (free key, RAWG_KEY secret):
    an average playtime for almost every game on any platform.
  - App icon files renamed so browsers and Windows fetch the new
    Health Bar Heart instead of a cached old icon.

WHAT'S INSIDE (v3.28)
  - Typical playtimes (optional): a small "playtime" function on your
    Supabase project looks up IGDB time-to-beat (main story / extras /
    100%) and SteamSpy playtime. Set it up from Settings > Typical
    playtimes. The code is in supabase/playtime/index.ts.
    Finished games with no hours count in your stats as estimates
    (shown with ~, can be turned off), the game window shows the
    numbers, and "Use as my hours" copies one in if you want it.
    Empty "Hours to beat" fields get filled from IGDB.
  - Discover: adding a game no longer jumps the list back to the start.

WHAT'S INSIDE (v3.27)
  - New app icon: the Health Bar Heart.
  - Discover: "Jog your memory" lists to find games you forgot to add,
    by release year, by console, more from your series and more from
    your studios.
  - Recommendations also follow sequels and prequels, similar worlds
    and themes, and rank games higher when several of yours point to
    them.
  - Shelves can be sorted by Game type: one shelf, grouped, with a
    small tag starting each group.
  - Game types now have plain genre names (Soulslike, RPG, Open world,
    Roguelike...). Archetypes like "Pilgrim" show their genre too.
  - Your year: the status shows as quiet text under each game instead
    of coloured circles on the cover.

WHAT'S INSIDE (v3.26)
  - New rooms: Sunny loft and Cyberspace. Shelf colours (walnut,
    ebony, white, sakura, mint, ocean, gold). String lights now hang
    from a wire with glowing bulbs coloured for each room.
  - Can I run it? Add your PC (Settings, a game's Play tab, or the
    Wishlist) and each game is compared with its PCGamingWiki minimum
    and recommended specs: Below minimum / Low / Medium / High / Ultra.
  - Search shows results as you type.
  - Archetypes and World Passport worlds now use each game's Wikidata
    setting, period and modes plus the start of its Wikipedia article.
    Re-read them from the Gamer DNA section.
  - The game window's buttons no longer cover the Soul options.
  - Quest log: load main quests, side quests and more from a game's
    IGN guide, tick them off, filter to what's left, add your own.
    Open it from Now playing or the game's Play tab.
  - Cozy room shelves form one wooden bookcase; the Display case has
    glass doors, chrome frame and a light strip; the Classic rack has
    steel rails. New trinkets: save crystal, sleepy cat, candle,
    speaker, snow globe. Lamp casts light; the TV has scanlines.
  - Logos always fit the spine (no stretching or cutting off).
  - Choose art: upload your own logo, or paste a link to one.
  - More logo sources: Steam large and store logos, series logos,
    logos from other languages' Wikipedia, and Wikimedia Commons.
    The background logo search only keeps logos that really load.
  - Spine styles (Customize → Spines): Cover art, Black, White or
    Colour. Black, White and Colour turn every logo into a clean
    silhouette so all of them are readable.
  - Co-op buddy: close its chat (× or tap it again), ask it things
    (what to play, how you're doing, fun facts, tips), and it speaks
    up now and then (Quiet / Sometimes / Chatty in its profile).
  - Recommendations refresh with every game, weigh recent and loved
    games most, push down games like ones you dropped or rated low,
    mix series and studios, and have a "Not for me" button. Your
    backlog moved below them.
  - Intro tour for new users: a welcome card and a spotlight guide
    through the app. Replay it from Settings.
  - The launcher reopens the browser the app is installed in.
  - Launcher sessions are logged automatically and to the minute.
  - Times under an hour show in minutes (40 min).
  - Tap a decoration to select it (× removes it); drag it to move it.
  - Wood grain, brushed metal and glass textures, shaded trinkets.
  - Tap the hours under Now playing to type in your total.
  - Shelf toolbar trimmed to Arrange and a Customize menu.
  - The room sign is optional (off until you pick a style), says
    whatever you like, and hangs top-left by default.
  - Friends has its own tab.
  - "Your year" on the You tab: every game you played in a year, with
    the year's numbers and the wrap-up story.
  - Game window split into tabs (Basics, Play, Details, Soul).
  - Room sign (neon, wood, pixel, brass, chalkboard) and Edit room to
    drag decorations and the sign anywhere. Compact shelf toolbar.
  - Half stars now show exactly half.
  - Friends (You tab): pick a gamer tag, add friends, see their shelves,
    stats and Gamer's Soul. Needs a one-time database step: run
    supabase/friends.sql in the Supabase SQL editor (the app walks you
    through it). Friends only see a copy without notes or sessions.
  - Read playtime from save files (game window): play days from save
    dates, and total playtime when the save stores it.
  - Shelves: arrange by console, release decade, game type or A to Z,
    and sort every shelf at once.
  - The co-op buddy floats by your side by default.
  - The You tab is split into clear sections with a quick jump bar.
  - Play button in Now playing. Steam games open in Steam and the timer
    runs until you come back. Other games: paste a store link, or use
    the Save Point Launcher for Windows (launcher folder) to connect a
    game's .exe; it starts the game and logs the session when you quit.
  - Pick a game straight off any shelf: drag it with the mouse, or
    press and hold it on a phone, then drop it anywhere on that shelf
    or another one. The spot you drop it in is kept.
  - Gamer DNA grows with every played game: a DNA helix with one rung
    per game, all 16 archetypes with 30-day trends, a log of every DNA
    shift and what caused it, "what your next game would do", and a
    note when a game shifts your DNA. Choose a game's archetypes
    yourself under "DNA, feelings, worlds and extras".
  - Choose where your buddy sits (Settings or the buddy's profile):
    a card under Now playing, a slim bar, or only by your side.
  - Move games: drag any game within a shelf or onto another shelf.
    Dropping on Playing, Finished or Backlog changes its status.
  - Decorate: consoles, collectibles, plants, lights and wall decor for
    the top shelf, the wall and the end of every shelf.
  - The gamer's nook: pick Cozy room, Display case or Classic rack.
    Make your own shelves (by hand or "fill automatically" by platform,
    genre, rating or status), sort each shelf, arrange games by
    dragging, and give each shelf a material, colour and name plate.
    Finished games fly from Playing to Finished. Shelves sync.
  - Clearer spines: logos are trimmed and recoloured to stay readable,
    missing logos are looked up in the background, and titles without
    a logo wrap onto two lines instead of being cut off.
  - The Gamer's Soul is grouped into 4 chapters: Who you are, How you
    play, Your journey and Trophy room.
  - The Gamer's Soul (You tab): 21 hybrid souls plus rare triple souls,
    soul depth stages, Gamer DNA that adds up to 100%, playstyle
    spectrums with evidence, alignment compass, emotional DNA, red and
    green flags, eras, World Passport, skill tree, soul achievements,
    habits, Inner NPC, Hall of Legends, and Soulmate via a soul code.
    Feelings, worlds, platinum and restarts are set per game under
    "Feelings, worlds and extras" in the game editor.
  - Library, Now playing, the game rack, Steam import
  - Discover: recommendations from your ratings, Popular right now,
    Coming soon and the Top 100 of all time, each with one-tap
    "Played", wishlist and backlog buttons
  - Wishlist with a release radar and countdowns
  - Trophies, and a year in review (You tab)
  - Player Soul and Gamer DNA, playstyle traits and deeper stats (You tab)
  - Co-op buddies: Pip the red panda, Vexa the black cat, Rook the mini
    dragon or B.I.T. the floating robot, each drawn in its own style with
    nine moods. Your buddy sits on the Library page, follows you around,
    and has a profile (tap Profile) where you can rename it, try its moods
    and set its animation to Full, Gentle or Still
  - Your buddy reacts to what you track: adding, wishlisting, starting,
    resuming, pausing, finishing or dropping a game, ratings, new
    favourites, 100% completion, trophies, playtime and collection
    milestones, long sessions and coming back after a break
  - A bond with each buddy, from New Teammate to Unbreakable Co-op. It
    grows from normal tracking, never goes down, and unlocks new lines,
    a night backdrop, a sparkle aura, a golden frame and a special trick
  - Six themes in Settings: Retro, Modern, Sci-fi, Fantasy, Cozy and Cyberpunk
  - Phone layout with a bottom tab bar
  - An optional session timer on Now playing
  - "Install app" button in the top bar on Chrome (PC and Android)

GOOD TO KNOW
  - Game details come from Wikidata (free, no key). Very new games can
    take a few days to show up there; add them as typed meanwhile.
  - "Hours to beat" isn't in any free database, so fill it in from the
    HowLongToBeat link on each game when you want backlog estimates.
  - Covers come from Steam. Any game can also get your own image
    (drop, paste or pick one in the game's window).
  - To update the app later, upload the new index.html to the same
    repository and it replaces the old one.
