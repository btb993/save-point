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

WHAT'S INSIDE (v2.5)
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
