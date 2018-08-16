#!/bin/bash
DIR="$(dirname "$(readlink "$0" || readlink -f "$0")")"
APPEND="./_assets/bin/append.sh"
NOTE="etc"
cd "$DIR"
cd ../../
$APPEND $NOTE "$@"
