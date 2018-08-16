@echo off
pushd .
cd /D "%~dp0"
sh todo.sh %*
popd
