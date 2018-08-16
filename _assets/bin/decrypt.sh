#!/bin/bash

EDITOR="emacs -nw"
if [ "$1" = "--gui" ]; then
    EDITOR="emacs"
    shift
fi

DIR=$1
ENCRYPTED="$DIR/index.md.asc"
DECRYPTED="$DIR/index.md"

gpg "$ENCRYPTED"
$EDITOR "$DECRYPTED"
gpg -a -c --yes "$DECRYPTED"

cat "$ENCRYPTED" "$ENCRYPTED" "$ENCRYPTED" "$ENCRYPTED" > "$DECRYPTED"
cp -f "$ENCRYPTED" "$DECRYPTED"
rm -f "$DECRYPTED"
