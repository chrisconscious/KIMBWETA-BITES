@echo off
REM Kill all postgres processes
taskkill /f /im postgres.exe 2>nul
taskkill /f /im pg_ctl.exe 2>nul
timeout /t 3 /nobreak >nul

REM Remove stale PID file
del "C:\Program Files\PostgreSQL\18\data\postmaster.pid" /f /q 2>nul
del "C:\Program Files\PostgreSQL\18\data\postmaster.opts" /f /q 2>nul

REM Start PostgreSQL
"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" start -D "C:\Program Files\PostgreSQL\18\data" -w -t 15
if %errorlevel% neq 0 (
    echo.
    echo Failed to start PostgreSQL. Trying alternative method...
    "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" start -D "C:\Program Files\PostgreSQL\18\data" -o "-c dynamic_shared_memory_type=windows" -w -t 15
)
echo.
echo PostgreSQL status:
"C:\Program Files\PostgreSQL\18\bin\pg_isready.exe"
pause
