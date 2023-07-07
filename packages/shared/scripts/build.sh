#!/bin/sh

SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)

features=""
path=""
profile=""

if [ "$1" = "" ]
then
    echo "Building \"shared\" in dev mode."
    profile="--dev"
    features="--features dev"
    path="debug"
elif [ "$1" = "--release" ]
then
    echo "Building \"shared\" in release mode."
    profile="--release"
    path="release"
else
    echo "Unsupported build mode \"$1\""
    exit 1
fi

wasm-pack build $SCRIPT_DIR/../lib $profile --target web --out-dir $SCRIPT_DIR/../src/shared -- $features
