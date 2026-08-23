@echo off
chcp 65001 >nul
title Local preview - Mivdak Tanach
cd /d "%~dp0"
echo Opening the local copy of the site...
start "" "%~dp0index.html"
