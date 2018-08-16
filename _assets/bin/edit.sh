#!/bin/sh
EDITOR=emacs
$EDITOR "$@/index.md"
git --no-pager status
git --no-pager diff
git commit -a -m "Edited offline"
