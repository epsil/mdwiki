#!/bin/bash
DIR=$(cd `dirname $0` && pwd)
cd "$DIR"
cd ../../
if [ $# -ne 0 ]; then
    npm run $@
fi
