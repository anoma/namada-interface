#!/bin/sh

SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)

features=""
path=""

if [ "$1" = "" ]
then
    echo "Building \"shared\" in dev mode."
    features="--features dev"
    path="debug"
elif [ "$1" = "--release" ]
then
    echo "Building \"shared\" in release mode."
    path="release"
else
    echo "Unsupported build mode \"$1\""
    exit 1
fi

cd $SCRIPT_DIR/../lib; cargo build --target wasm32-unknown-unknown ${1} $features
wasm-bindgen --out-dir=$SCRIPT_DIR/../src/shared --target=web --omit-default-module-path target/wasm32-unknown-unknown/$path/shared.wasm
