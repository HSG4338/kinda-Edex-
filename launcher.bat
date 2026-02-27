@echo off
setlocal EnableDelayedExpansion
title eDEX - Launcher
color 0A

echo.
echo  ============================================
echo   eDEX CYBER TERMINAL ENVIRONMENT
echo  ============================================
echo.

:: ── Check for a built release first ──────────
if exist "%~dp0release\" (
    echo  A built release was found.
    echo.
    echo  [1] Launch from release\ (no Node needed)
    echo  [2] Dev mode (needs Node.js installed)
    echo  [3] Exit
    echo.
    set /p CHOICE="  Enter choice (1-3): "
    if "!CHOICE!"=="1" goto :launch_release
    if "!CHOICE!"=="2" goto :dev
    goto :exit
)

:: ── No release ────────────────────────────────
echo  No built release found yet.
echo.
echo  [1] Run BUILD-AND-CLEANUP.bat (builds a standalone .exe)
echo  [2] Dev mode (needs Node.js installed separately)
echo  [3] Exit
echo.
set /p CHOICE="  Enter choice (1-3): "
if "!CHOICE!"=="1" (
    call "%~dp0BUILD-AND-CLEANUP.bat"
    goto :done
)
if "!CHOICE!"=="2" goto :dev
goto :exit

:: ── Launch from release ───────────────────────
:launch_release
echo.
echo  Launching eDEX...
for %%f in ("%~dp0release\*.exe") do (
    start "" "%%f"
    goto :done
)
echo  [FAIL] No .exe found in release\
echo         Run BUILD-AND-CLEANUP.bat first.
pause
goto :done

:: ── Dev mode ─────────────────────────────────
:dev
if not exist "%~dp0node_modules\" (
    echo  [ERROR] node_modules missing.
    echo          npm install first, or use BUILD-AND-CLEANUP.bat.
    pause
    goto :done
)
echo.
echo  Starting in dev mode (hot reload)...
call npm run dev
goto :done

:exit
echo  Exiting.

:done
pause
