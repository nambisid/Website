@echo off
setlocal
title Stitch and Bloom - Launcher

cd /d "%~dp0"

echo ============================================================
echo   Stitch ^& Bloom - One-click launcher
echo ============================================================
echo.

REM ----- 0. Locate cloudflared (winget install path or system PATH) -----
set "CLOUDFLARED="
if exist "C:\Program Files (x86)\cloudflared\cloudflared.exe" set "CLOUDFLARED=C:\Program Files (x86)\cloudflared\cloudflared.exe"
if not defined CLOUDFLARED if exist "C:\Program Files\cloudflared\cloudflared.exe" set "CLOUDFLARED=C:\Program Files\cloudflared\cloudflared.exe"
if not defined CLOUDFLARED (
    where cloudflared >nul 2>&1 && set "CLOUDFLARED=cloudflared"
)
if not defined CLOUDFLARED (
    echo ERROR: cloudflared.exe not found.
    echo Install with: winget install --id Cloudflare.cloudflared
    pause
    exit /b 1
)

REM ----- 1. Clear old tunnel log so we can extract a fresh URL -----
set "LOGFILE=%USERPROFILE%\stitch-and-bloom-tunnel.log"
del /q "%LOGFILE%" 2>nul

REM ----- 2. Start the app (Express + Vite) in its own window -----
echo [1/3] Starting the app (server + client)...
start "Stitch and Bloom - App" cmd /k "cd /d %~dp0 && npm run dev"

REM ----- 3. Wait for Vite to be ready -----
echo [2/3] Waiting ~12 seconds for app to come up...
timeout /t 12 /nobreak >nul

REM ----- 4. Start the public tunnel in its own window, with logging -----
echo [3/3] Starting public tunnel...
start "Stitch and Bloom - Public Tunnel" cmd /k ""%CLOUDFLARED%" tunnel --url http://localhost:5173 --logfile ""%LOGFILE%"""

REM ----- 5. Wait for the tunnel URL to appear in the log -----
echo Waiting for public link to come online...
set "URL="
for /l %%i in (1,1,30) do (
    if not defined URL (
        timeout /t 1 /nobreak >nul
        for /f "usebackq delims=" %%u in (`powershell -NoProfile -Command "$m = Select-String -Path '%LOGFILE%' -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -ErrorAction SilentlyContinue ^| Select-Object -First 1; if ($m) { $m.Matches.Value }"`) do (
            set "URL=%%u"
        )
    )
)

echo.
echo ============================================================
if defined URL (
    echo  Your public link is LIVE:
    echo.
    echo    %URL%
    echo.
    echo  ^(copied to clipboard^)
    powershell -NoProfile -Command "Set-Clipboard -Value '%URL%'"
) else (
    echo  Tunnel did not produce a URL within 30 seconds.
    echo  Check the 'Public Tunnel' window for errors.
    echo  Log file: %LOGFILE%
)
echo ============================================================
echo.
echo  WHILE THE SITE IS RUNNING:
echo    - Keep both windows open ('App' and 'Public Tunnel')
echo    - Closing either window will take the site offline
echo    - Your laptop must stay awake
echo.
echo  TO STOP THE SITE:
echo    - Close both windows, or run stop.bat
echo.

pause
endlocal
