SAVE POINT LAUNCHER (Windows)
=============================
Lets the Play button in Save Point open games you installed outside a
store, and logs each session automatically when you close the game.

Install
  1. Unzip this folder anywhere.
  2. Double-click "Install Save Point Launcher.cmd".
     (Windows may warn about a downloaded file: choose More info > Run anyway.)
  3. In Save Point, open a game, go to "How to launch", choose "My .exe"
     and press "Connect .exe". Pick the game's .exe in the window that opens.

Play
  Press Play on the game in Now playing. The game starts, and when you
  close it the session is logged in Save Point straight away.
  Steam games work too, with nothing to connect: Save Point asks Steam to
  start the game, and Steam reports in the registry when it closes.

What it does and doesn't do
  - Installs for your user only, in %LOCALAPPDATA%\SavePoint. No admin rights.
  - Only starts .exe files you picked yourself. Links from websites cannot add
    new programs.
  - Works out when you stopped playing by watching for programs running from
    the game's folder (or, for Steam games, Steam's own "running" flag),
    checking every 5 seconds. Sessions under a minute are ignored.
  - Updating: download it again from Save Point and run the installer again.
  - Sends nothing over the internet. The session reaches Save Point only
    through the page it opens in your browser.

Uninstall
  Double-click "Uninstall Save Point Launcher.cmd".
