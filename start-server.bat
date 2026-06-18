@echo off
cd /d "%~dp0backend"
echo Starting KIMBWETA BITES API...
echo Working directory: %CD%
echo.
node dist/server.js
pause
