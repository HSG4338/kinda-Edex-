@echo off
setlocal EnableDelayedExpansion
title eDEX - Portable Build System
color 0A

echo.
echo  ============================================================
echo   eDEX - PORTABLE BUILD SYSTEM
echo   No Visual Studio. No admin. No Node.js left behind.
echo  ============================================================
echo.
echo  This script will:
echo    1. Download portable Node.js (no installer, no admin)
echo    2. Install npm dependencies
echo    3. Build eDEX into a standalone .exe
echo    4. DELETE Node.js, node_modules, and build artifacts
echo    5. Leave only: release\eDEX-Setup.exe
echo.
echo  Requirements:
echo    - Internet connection (~120MB download)
echo    - PowerShell (built into Windows 7+)
echo    - NO Visual Studio required
echo.
pause

:: ── Config ────────────────────────────────────────────────
set "WORK_DIR=%~dp0"
set "NODE_DIR=%WORK_DIR%_node_portable"
set "NODE_VERSION=20.11.1"
set "NODE_ZIP=node-v%NODE_VERSION%-win-x64.zip"
set "NODE_URL=https://nodejs.org/dist/v%NODE_VERSION%/%NODE_ZIP%"
set "NODE_BIN=%NODE_DIR%\node-v%NODE_VERSION%-win-x64"
set "NODE_EXE=%NODE_BIN%\node.exe"
set "NPM_CMD=%NODE_BIN%\npm.cmd"

:: ── Check existing release ────────────────────────────────
if exist "%WORK_DIR%release\" (
    echo  [INFO] A release\ folder already exists.
    set /p REBUILD="  Type YES to rebuild, anything else to exit: "
    if /i "!REBUILD!" neq "YES" (
        echo  Exiting. Your existing build is untouched.
        pause
        exit /b 0
    )
    rmdir /s /q "%WORK_DIR%release"
)

:: ── Check PowerShell ─────────────────────────────────────
powershell -Command "exit 0" >nul 2>&1
if %errorlevel% neq 0 (
    echo  [FAIL] PowerShell not available. Cannot download Node.js.
    pause
    exit /b 1
)

:: ── Step 1: Download Node.js ─────────────────────────────
echo.
echo  [1/4] Downloading portable Node.js v%NODE_VERSION%...

if not exist "%NODE_DIR%" mkdir "%NODE_DIR%"

powershell -Command ^
    "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; " ^
    "Write-Host '  Connecting...' -NoNewline; " ^
    "Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%NODE_DIR%\%NODE_ZIP%' -UseBasicParsing; " ^
    "Write-Host ' Done.'"

if not exist "%NODE_DIR%\%NODE_ZIP%" (
    echo  [FAIL] Download failed. Check your internet connection.
    call :cleanup_node
    pause
    exit /b 1
)

:: ── Step 2: Extract Node.js ──────────────────────────────
echo.
echo  [2/4] Extracting Node.js...

powershell -Command ^
    "Expand-Archive -Path '%NODE_DIR%\%NODE_ZIP%' -DestinationPath '%NODE_DIR%' -Force"

if not exist "%NODE_EXE%" (
    echo  [FAIL] Extraction failed.
    call :cleanup_node
    pause
    exit /b 1
)

del /f /q "%NODE_DIR%\%NODE_ZIP%"
set "PATH=%NODE_BIN%;%PATH%"
echo  [OK] Node.js v%NODE_VERSION% ready

:: ── Step 3: npm install ──────────────────────────────────
echo.
echo  [3/4] Installing npm dependencies...
echo        (Electron is ~80MB — this takes a minute)
echo.

cd /d "%WORK_DIR%"
call "%NPM_CMD%" install

if %errorlevel% neq 0 (
    echo.
    echo  [FAIL] npm install failed. Check internet connection.
    call :cleanup_all
    pause
    exit /b 1
)
echo.
echo  [OK] Dependencies installed

:: ── Step 4: Build ────────────────────────────────────────
echo.
echo  [4/4] Building eDEX standalone executable...
echo        (Packages into release\)
echo.

call "%NPM_CMD%" run package

if %errorlevel% neq 0 (
    echo.
    echo  [FAIL] Build failed. See output above.
    call :cleanup_all
    pause
    exit /b 1
)

if not exist "%WORK_DIR%release\" (
    echo  [FAIL] release\ folder missing after build.
    call :cleanup_all
    pause
    exit /b 1
)

:: ── Cleanup ───────────────────────────────────────────────
echo.
echo  Cleaning up — removing Node.js and build files...
call :cleanup_all
echo  [OK] All build tools removed. No trace left.

:: ── Done ─────────────────────────────────────────────────
echo.
color 0A
echo  ============================================================
echo   BUILD COMPLETE
echo  ============================================================
echo.
echo  Your standalone eDEX executable is ready:
echo.
echo    %WORK_DIR%release\
echo.
echo  Files in release\:
for %%f in ("%WORK_DIR%release\*") do echo    %%~nxf
echo.
echo  Double-click the .exe — no Node.js, no VS, nothing else needed.
echo.
explorer "%WORK_DIR%release"
pause
exit /b 0

:: ── Subroutines ──────────────────────────────────────────

:cleanup_node
if exist "%NODE_DIR%" (
    echo  Removing portable Node.js...
    rmdir /s /q "%NODE_DIR%" 2>nul
    timeout /t 1 /nobreak >nul
    rmdir /s /q "%NODE_DIR%" 2>nul
)
goto :eof

:cleanup_all
call :cleanup_node
if exist "%WORK_DIR%node_modules" (
    echo  Removing node_modules...
    rmdir /s /q "%WORK_DIR%node_modules" 2>nul
)
if exist "%WORK_DIR%dist" (
    echo  Removing dist\...
    rmdir /s /q "%WORK_DIR%dist" 2>nul
)
goto :eof
