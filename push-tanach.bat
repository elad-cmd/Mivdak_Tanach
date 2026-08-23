@echo off
chcp 65001 >nul
title Push Mivdak Tanach -> GitHub
cd /d "%~dp0"
set "LOG=%~dp0push-log.txt"
set "REPO=https://github.com/elad-cmd/Mivdak_Tanach.git"

echo === PUSH LOG === > "%LOG%"
echo FOLDER: %CD% >> "%LOG%"
echo. >> "%LOG%"

rem ---------- locate git ----------
set "GIT="
where git >nul 2>&1
if not errorlevel 1 set "GIT=git"
if exist "C:\Program Files\Git\cmd\git.exe" set "GIT=C:\Program Files\Git\cmd\git.exe"
if exist "C:\Program Files (x86)\Git\cmd\git.exe" set "GIT=C:\Program Files (x86)\Git\cmd\git.exe"
if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" set "GIT=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
for /d %%D in ("%LOCALAPPDATA%\GitHubDesktop\app-*") do if exist "%%D\resources\app\git\cmd\git.exe" set "GIT=%%D\resources\app\git\cmd\git.exe"
if exist "%LOCALAPPDATA%\GitHubDesktop\app\resources\app\git\cmd\git.exe" set "GIT=%LOCALAPPDATA%\GitHubDesktop\app\resources\app\git\cmd\git.exe"

if not defined GIT goto nogit

echo --- USING GIT: %GIT% --- >> "%LOG%"
"%GIT%" --version >> "%LOG%" 2>&1
echo. >> "%LOG%"

echo ============================================
echo   Pushing Mivdak Tanach to GitHub
echo   Using: %GIT%
echo ============================================
echo.

rem ---------- identity (only if missing) ----------
"%GIT%" config user.email >nul 2>&1
if errorlevel 1 "%GIT%" config user.email "elad362@gmail.com"
"%GIT%" config user.name >nul 2>&1
if errorlevel 1 "%GIT%" config user.name "Elad Schweitzer"

rem ---------- repo ----------
if not exist ".git" (
  echo -^> git init
  "%GIT%" init >> "%LOG%" 2>&1
  "%GIT%" branch -M main >> "%LOG%" 2>&1
)

"%GIT%" remote >nul 2>&1
"%GIT%" remote set-url origin "%REPO%" >nul 2>&1
if errorlevel 1 "%GIT%" remote add origin "%REPO%" >> "%LOG%" 2>&1

echo -^> Fetching remote...
echo --- fetch --- >> "%LOG%"
"%GIT%" fetch origin main >> "%LOG%" 2>&1
if errorlevel 1 goto fail

echo --- reset --soft to remote tip --- >> "%LOG%"
"%GIT%" reset --soft FETCH_HEAD >> "%LOG%" 2>&1

echo -^> Staging files...
echo --- add -A --- >> "%LOG%"
"%GIT%" add -A >> "%LOG%" 2>&1

echo --- status --- >> "%LOG%"
"%GIT%" status --short >> "%LOG%" 2>&1

"%GIT%" diff --cached --quiet
if not errorlevel 1 (
  echo.
  echo Nothing to upload - GitHub already matches the local folder.
  echo NOTHING TO COMMIT >> "%LOG%"
  goto done
)

echo -^> Committing...
echo --- commit --- >> "%LOG%"
"%GIT%" commit -m "Update site: new nav, new home page, tashpaz, ezrim + tochniot" >> "%LOG%" 2>&1

echo -^> Pushing (a GitHub sign-in window may pop up)...
echo --- push --- >> "%LOG%"
"%GIT%" push origin HEAD:main >> "%LOG%" 2>&1
if errorlevel 1 goto fail

:done
echo.
echo ==========================================
echo    DONE - uploaded to GitHub.
echo    Vercel rebuilds in about a minute:
echo    https://mivdak-tanach.vercel.app/
echo ==========================================
echo.
echo Log: %LOG%
pause
goto end

:fail
echo.
echo ==========================================
echo    FAILED - see the log below
echo ==========================================
echo.
type "%LOG%"
echo.
echo Tell Claude: "read push-log.txt"
pause
goto end

:nogit
echo --- GIT NOT FOUND --- >> "%LOG%"
echo --- PATH --- >> "%LOG%"
set PATH >> "%LOG%" 2>&1
echo.
echo ==========================================
echo    GIT NOT FOUND on this computer.
echo    Install it from:
echo    https://git-scm.com/download/win
echo ==========================================
echo.
pause

:end
