@echo off
setlocal
title Stitch and Bloom - Stop

echo ============================================================
echo   Stopping Stitch ^& Bloom
echo ============================================================
echo.

REM Kill cloudflared (the tunnel)
echo Stopping public tunnel...
taskkill /f /im cloudflared.exe >nul 2>&1
if %errorlevel% equ 0 ( echo   ^- Tunnel stopped ) else ( echo   ^- Tunnel was not running )

REM Kill anything listening on Express port 5000
echo Stopping Express server (port 5000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000 " ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)
echo   ^- Done

REM Kill anything listening on Vite port 5173
echo Stopping Vite dev server (port 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)
echo   ^- Done

REM Kill any leftover npm/node processes spawned by 'npm run dev'
REM (concurrently spawns nodemon + vite as children — these clean those up)
echo Cleaning up child processes...
taskkill /f /im nodemon.cmd >nul 2>&1

echo.
echo ============================================================
echo   All stopped. Site is offline.
echo ============================================================
echo.
timeout /t 3 /nobreak >nul
endlocal
