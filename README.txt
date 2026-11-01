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

WHAT'S INSIDE (v3.25)
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
  - Five themes in Settings: Retro, Modern, Fantasy, Cozy and Cyberpunk
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
