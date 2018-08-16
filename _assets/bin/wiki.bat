@echo off
cd /D "%~dp0"
cd ..\..
git status
sh _assets\bin\wiki.sh %*
