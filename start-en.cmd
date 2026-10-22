@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22.9 or later from https://nodejs.org then try again.
  pause
  exit /b 1
)
echo UNFILED - Interview Room 04
echo English: http://127.0.0.1:4173/en/
echo Korean:  http://127.0.0.1:4173/
echo If you changed PORT, use that port instead of 4173.
echo Keep this window open while playing. Press Ctrl+C to stop.
node --env-file-if-exists=.env server.mjs
pause
