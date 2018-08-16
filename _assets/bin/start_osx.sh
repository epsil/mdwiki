#!/bin/bash
NODE="/usr/local/bin/node"
NPM="/usr/local/bin/npm"
PROGRAM="/usr/local/bin/http-server"
HTTPSERVER="$NODE $PROGRAM"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"
cd ..
# $HTTPSERVER . -p 8000
$NPM run server
