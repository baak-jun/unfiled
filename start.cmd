@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22 or later from https://nodejs.org then try again.
  pause
  exit /b 1
)
echo Open the Local URL printed below in your browser.
echo Keep this window open while playing. Press Ctrl+C to stop.
node --env-file-if-exists=.env server.mjs
pause
