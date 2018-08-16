#!/bin/sh
COLOR="--color=auto"
if [ "$(uname)" = "windows32" ]; then
    COLOR=""
fi
grep -Ri $COLOR --exclude-dir="node_modules" --exclude-dir="_assets" --include="*.md" "$@" .
