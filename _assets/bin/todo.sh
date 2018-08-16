#!/bin/bash
DIR=$(cd `dirname $0` && pwd)
DIR="$(dirname "$(readlink "$0" || readlink -f "$0")")"
APPEND="./_assets/bin/append.sh"
TODO="todo"
cd "$DIR"
cd ../../
$APPEND $TODO "$@"
