@echo off
title eDEX - System Checkup
color 0B

echo.
echo  ============================================
echo   eDEX CYBER TERMINAL - SYSTEM CHECKUP
echo  ============================================
echo.

set PASS=0
set WARN=0
set FAIL=0

:: ── PowerShell ───────────────────────────────
echo [CHECK] PowerShell (needed to download Node.js)
powershell -Command "exit 0" >nul 2>&1
if %errorlevel% neq 0 (
    echo  [FAIL] PowerShell not found
    set /a FAIL+=1
) else (
    echo  [PASS] PowerShell available
    set /a PASS+=1
)

:: ── Internet ─────────────────────────────────
echo [CHECK] Internet connectivity
powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org' -UseBasicParsing -TimeoutSec 5 | Out-Null" >nul 2>&1
if %errorlevel% neq 0 (
    echo  [WARN] Cannot reach nodejs.org - BUILD-AND-CLEANUP.bat needs internet
    set /a WARN+=1
) else (
    echo  [PASS] Internet connection OK
    set /a PASS+=1
)

:: ── Node.js (optional - portable is fine) ────
echo [CHECK] Node.js (optional - script downloads its own)
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [INFO] Node.js not installed - that is fine
    echo         BUILD-AND-CLEANUP.bat will download portable Node.js
) else (
    for /f "tokens=*" %%v in ('node --version') do echo  [PASS] Node.js %%v already installed
    set /a PASS+=1
)

:: ── Disk space ───────────────────────────────
echo [CHECK] Disk space (need ~500MB free for build)
for /f "tokens=3" %%a in ('dir /-c "%WORK_DIR%" ^| findstr /i "bytes free"') do set FREE=%%a
if defined FREE (
    echo  [INFO] Free space check: %FREE% bytes
) else (
    echo  [INFO] Could not read disk space. Ensure ~500MB free.
)
set /a PASS+=1

:: ── Existing release ─────────────────────────
echo [CHECK] Existing release\
if exist "%~dp0release\" (
    echo  [INFO] release\ folder exists - already built
    echo         Run the .exe directly, or re-run BUILD-AND-CLEANUP.bat to rebuild
    set /a PASS+=1
) else (
    echo  [INFO] No release\ yet - run BUILD-AND-CLEANUP.bat to build
)

:: ── node_modules ─────────────────────────────
echo [CHECK] node_modules
if exist "%~dp0node_modules\" (
    echo  [INFO] node_modules exists - partial or complete install present
) else (
    echo  [INFO] node_modules not found - BUILD-AND-CLEANUP.bat will create and remove it
)

:: ── Summary ──────────────────────────────────
echo.
echo  ============================================
echo   CHECKUP SUMMARY
echo  ============================================
echo   PASSED  : %PASS%
echo   WARNINGS: %WARN%
echo   FAILED  : %FAIL%
echo  ============================================

if %FAIL% gtr 0 (
    color 0C
    echo.
    echo  ACTION REQUIRED before building.
) else if %WARN% gtr 0 (
    color 0E
    echo.
    echo  WARNINGS present - review above before building.
) else (
    color 0A
    echo.
    echo  ALL CLEAR - Run BUILD-AND-CLEANUP.bat to build eDEX.
)

echo.
pause
