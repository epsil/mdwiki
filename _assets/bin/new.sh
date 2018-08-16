#!/bin/bash
NAME=$1
#TITLE="$(tr '[:lower:]' '[:upper:]' <<< ${NAME:0:1})${NAME:1}"
TITLE="$NAME"
TMP="TMP"
FOLDER="$TMP/$NAME"
FILE="$FOLDER/index.md"
HTML="$FOLDER/index.html"
SITEMAP="dump/sitemap"
EDITOR=emacs
DIR="$(dirname "$(readlink "$0" || readlink -f "$0")")"
cd "$DIR"
cd ../../
mkdir "$FOLDER"
touch "$FILE"
cp "$SITEMAP/index.html" "$FOLDER"
echo "---" >> "$FILE"
echo "title: $TITLE" >> "$FILE"
echo "---" >> "$FILE"
git add -f "$FOLDER"
git --no-pager diff
git commit -a -m "Edited offline"
$EDITOR "$FILE"
git --no-pager diff
git commit -a -m "Edited offline"
echo "Remember to run rebuild"
# open "$HTML"
