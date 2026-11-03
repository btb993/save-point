# Save Point Launcher
# Opens games you connected in Save Point and tells the app how long you played.
# It only ever starts .exe files you picked yourself in a file window; links from websites cannot add new ones.
param([string]$Uri = '')

$ErrorActionPreference = 'Stop'
$App    = 'https://btb993.github.io/save-point/'
$Ver    = 2   # Save Point shows an update hint when the launcher is older than the app expects
$Dir    = Join-Path $env:LOCALAPPDATA 'SavePoint'
$Config = Join-Path $Dir 'games.json'
$Log    = Join-Path $Dir 'launcher.log'
New-Item -ItemType Directory -Force -Path $Dir | Out-Null
Add-Type -AssemblyName System.Windows.Forms

function Note([string]$text) { Add-Content -Path $Log -Value ("{0:u}  {1}" -f (Get-Date).ToUniversalTime(), $text) }
function Say([string]$text, [string]$icon = 'Information') {
  [void][System.Windows.Forms.MessageBox]::Show($text, 'Save Point Launcher', 'OK', $icon)
}
function Load-Games {
  $h = @{}
  if (Test-Path $Config) {
    $o = Get-Content $Config -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($p in $o.PSObject.Properties) { $h[$p.Name] = @{ exe = [string]$p.Value.exe; title = [string]$p.Value.title } }
  }
  return $h
}
function Save-Games($h) { ($h | ConvertTo-Json -Depth 4) | Set-Content -Path $Config -Encoding UTF8 }
function Now { [DateTimeOffset]::UtcNow.ToUnixTimeSeconds() }

# Open Save Point in the browser you installed it from (Brave, Chrome or Edge) as an app window,
# so the session lands in the same library as your installed app. Falls back to the default browser.
function Find-Browser([string]$b) {
  $names = @{ brave = 'brave.exe'; chrome = 'chrome.exe'; edge = 'msedge.exe' }
  if (-not $names.ContainsKey($b)) { return $null }
  $exe = $names[$b]
  foreach ($root in 'HKCU:', 'HKLM:') {
    try { $p = (Get-ItemProperty -Path "$root\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\$exe" -ErrorAction Stop).'(default)'; if ($p -and (Test-Path $p)) { return $p } } catch { }
  }
  $guess = @{
    brave  = @("$env:ProgramFiles\BraveSoftware\Brave-Browser\Application\brave.exe", "${env:ProgramFiles(x86)}\BraveSoftware\Brave-Browser\Application\brave.exe", "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\Application\brave.exe")
    chrome = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe")
    edge   = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe")
  }
  foreach ($g in $guess[$b]) { if ($g -and (Test-Path $g)) { return $g } }
  return $null
}
function Open-App([string]$url, [string]$b) {
  $exe = Find-Browser $b
  if ($exe) { Start-Process -FilePath $exe -ArgumentList "--app=$url"; Note "opened $b app window" }
  else { Start-Process $url }
}

try {
  if ($Uri -notmatch '^savepoint://(link|play|unlink|steam)/([A-Za-z0-9_-]{1,64})/?(\?(.*))?$') {
    Say "This link isn't one Save Point Launcher understands." 'Warning'; exit 1
  }
  $action = $Matches[1]; $id = $Matches[2]; $query = [string]$Matches[4]
  $browser = ''
  if ($query -match '(^|&)b=(brave|chrome|edge)(&|$)') { $browser = $Matches[2] }
  $title = 'this game'
  if ($query -match '(^|&)t=([^&]*)') { $t = [uri]::UnescapeDataString($Matches[2].Replace('+', ' ')); if ($t.Trim()) { $title = $t.Substring(0, [Math]::Min(80, $t.Length)) } }
  $games = Load-Games

  if ($action -eq 'link') {
    $dlg = New-Object System.Windows.Forms.OpenFileDialog
    $dlg.Title = "Pick the .exe that starts $title"
    $dlg.Filter = 'Programs (*.exe)|*.exe'
    $dlg.CheckFileExists = $true
    $owner = New-Object System.Windows.Forms.Form -Property @{ TopMost = $true; ShowInTaskbar = $false }
    if ($dlg.ShowDialog($owner) -ne 'OK') { exit 0 }
    $exe = $dlg.FileName
    $name = [IO.Path]::GetFileName($exe)
    if ($name -match '^(steam|epicgameslauncher|galaxyclient|battle\.net|eadesktop|origin|ubisoftconnect|upc)\.exe$') {
      Say "$name is a store launcher, so it never closes and your sessions would never end. Pick the game's own .exe instead (it's usually in the game's install folder)." 'Warning'; exit 0
    }
    $games[$id] = @{ exe = $exe; title = $title }
    Save-Games $games
    Note "linked $id -> $exe"
    Open-App ($App + '?splinked=' + $id + '&v=' + $Ver + '&x=' + [uri]::EscapeDataString($name)) $browser
    exit 0
  }

  if ($action -eq 'unlink') {
    if ($games.ContainsKey($id)) { $games.Remove($id); Save-Games $games; Note "unlinked $id" }
    exit 0
  }

  function Report([int64]$start, [int64]$end) {
    Note "ended $id after $($end - $start) s"
    if ($end - $start -lt 60) { exit 0 }
    $nonce = -join ((1..10) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
    Open-App ($App + '?splog=' + $id + '&s=' + $start + '&e=' + $end + '&n=' + $nonce + '&v=' + $Ver) $browser
    exit 0
  }

  # a Steam game: Steam starts it, and Steam itself says in the registry while it's running
  # (HKCU\Software\Valve\Steam\Apps\<appid>, value Running), so no .exe needs connecting
  if ($action -eq 'steam') {
    if ($query -notmatch '(^|&)a=([0-9]{1,10})(&|$)') { Say "That Steam game has no app id." 'Warning'; exit 0 }
    $appid = $Matches[2]
    $key = "HKCU:\Software\Valve\Steam\Apps\$appid"
    function Steam-Running { try { return ((Get-ItemProperty -Path $key -Name Running -ErrorAction Stop).Running -eq 1) } catch { return $false } }
    Start-Process "steam://rungameid/$appid"
    Note "steam start $id ($appid)"
    $start = Now; $seen = $false; $last = $start; $misses = 0
    while ($true) {
      Start-Sleep -Seconds 5
      if (Steam-Running) { if (-not $seen) { $seen = $true; $start = Now }; $last = Now; $misses = 0 }
      elseif (-not $seen) { if ((Now) - $start -ge 600) { break } }   # Steam may update the game first: wait up to 10 minutes
      else { $misses++; if ($misses -ge 3) { break } }
      if ((Now) - $start -ge 16 * 3600) { break }
    }
    if (-not $seen) { Note "never saw steam $appid running"; Say "Save Point couldn't see $title start in Steam, so no session was logged." 'Warning'; exit 0 }
    Report $start $last
  }

  # play
  if (-not $games.ContainsKey($id)) { Say "$title isn't connected yet. In Save Point, open the game and choose Connect .exe." 'Warning'; exit 0 }
  $exe = $games[$id].exe
  if (-not (Test-Path $exe)) { Say "Couldn't find $exe. The game may have moved or been uninstalled. Connect it again in Save Point." 'Warning'; exit 0 }
  # the game's folder: games often keep the real program in bin\ or Binaries\Win64\, so look one or two levels up
  $dirPath = Split-Path -Parent $exe
  while ((Split-Path -Leaf $dirPath) -match '^(bin|bin64|binaries|win64|win32|x64|x86|game|retail)$' -and (Split-Path -Parent $dirPath).Length -gt 3) { $dirPath = Split-Path -Parent $dirPath }
  $folder = $dirPath.TrimEnd('\') + '\'
  # names of programs seen running from that folder: a game started "as administrator" hides its path, but not its name
  $names = @{ ([IO.Path]::GetFileNameWithoutExtension($exe)).ToLower() = $true }
  function Is-Running {
    $hit = $false
    foreach ($p in Get-Process -ErrorAction SilentlyContinue) {
      $path = $null; try { $path = $p.Path } catch { }
      if ($path -and $path.StartsWith($folder, [StringComparison]::OrdinalIgnoreCase)) { $names[$p.ProcessName.ToLower()] = $true; $hit = $true }
      elseif (-not $path -and $names.ContainsKey($p.ProcessName.ToLower())) { $hit = $true }
    }
    return $hit
  }

  $start = Now
  Start-Process -FilePath $exe -WorkingDirectory (Split-Path -Parent $exe)
  Note "started $id ($exe)"
  # wait for the game (or anything it starts from its own folder) to close
  $seen = $false; $last = $start; $misses = 0
  while ($true) {
    Start-Sleep -Seconds 5
    if (Is-Running) { $seen = $true; $last = Now; $misses = 0 }
    elseif (-not $seen) { if ((Now) - $start -ge 120) { break } }
    else { $misses++; if ($misses -ge 3) { break } }
    if ((Now) - $start -ge 16 * 3600) { break }
  }
  if (-not $seen) { Note "never saw $id running"; Say "Save Point couldn't see $title running, so no session was logged." 'Warning'; exit 0 }
  Report $start $last
} catch {
  Note "error: $($_.Exception.Message)"
  Say "Something went wrong: $($_.Exception.Message)" 'Error'
}
