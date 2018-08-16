@echo off
pushd .
cd /D "%~dp0"
sh note.sh %*
popd
