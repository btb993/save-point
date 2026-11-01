@echo off
reg delete "HKCU\Software\Classes\savepoint" /f >nul 2>nul
rmdir /S /Q "%LOCALAPPDATA%\SavePoint" 2>nul
echo Save Point Launcher has been removed. Your games and play history in Save Point are untouched.
pause
