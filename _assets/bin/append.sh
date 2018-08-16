#!/bin/bash
FILE=$1
FILE="$FILE/index.md"
shift
TASK=""
if [ $# -eq 0 ]; then
    read TASK
    TASK=" $TASK"
else
    for arg in "$@"; do
        arg="${arg%\"}"
        arg="${arg#\"}"
        TASK+=" $arg"
    done
fi
TASK="-  $TASK"
echo "$TASK" >> $FILE
git --no-pager diff -U0
git commit -a -m "Edited offline"
