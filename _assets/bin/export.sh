#!/bin/bash
DIR=$1
MD="$DIR/index.md"
DOCX="$DIR/index.docx"
EPUB="$DIR/index.epub"
PDF="$DIR/index.pdf"
pandoc -f markdown+hard_line_breaks+autolink_bare_uris+smart+emoji -t docx -o "$DOCX" "$MD"
pandoc -f markdown+hard_line_breaks+autolink_bare_uris+smart+emoji -t epub -o "$EPUB" "$MD"
pandoc --pdf-engine=xelatex -V include-before="\frenchspacing" -V documentclass=extarticle -V papersize=A4 -V fontsize=14pt -V colorlinks=true -V microtypeoptions="expansion=false" -f markdown+hard_line_breaks+autolink_bare_uris+smart+emoji -t latex -o "$PDF" "$MD"
xdg-open "$DIR"
