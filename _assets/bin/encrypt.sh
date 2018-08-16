#!/bin/sh
DIR=$1
ENCRYPTED="${DIR%%/}/index.md.asc"
DECRYPTED="${DIR%%/}/index.md"
METADATA="${DIR%%/}/.index.yml"
sed -n '1,/---/p' "$DECRYPTED" > "$METADATA"
gpg -a -c --yes "$DECRYPTED"
rm -f "$DECRYPTED"
git add "$ENCRYPTED"
git add "$METADATA"
