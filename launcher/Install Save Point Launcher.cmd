@echo off
rem Installs Save Point Launcher for your Windows user only (no admin needed).
set "DEST=%LOCALAPPDATA%\SavePoint"
if not exist "%DEST%" mkdir "%DEST%"
copy /Y "%~dp0SavePointLauncher.ps1" "%DEST%\SavePointLauncher.ps1" >nul || goto fail
reg add "HKCU\Software\Classes\savepoint" /ve /d "URL:Save Point Launcher" /f >nul || goto fail
reg add "HKCU\Software\Classes\savepoint" /v "URL Protocol" /d "" /f >nul || goto fail
reg add "HKCU\Software\Classes\savepoint\shell\open\command" /ve /d "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"%DEST%\SavePointLauncher.ps1\" \"%%1\"" /f >nul || goto fail
echo.
echo  Save Point Launcher is installed.
echo  Go back to Save Point, open a game and choose "Connect .exe".
echo.
pause
exit /b 0
:fail
echo Something went wrong while installing. Nothing else was changed.
pause
exit /b 1
