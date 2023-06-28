#!/bin/sh

SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)

path=""

if [ "$1" = "" ]
then
    echo "Building \"crypto\" in dev mode."
    path="debug"
elif [ "$1" = "--release" ]
then
    echo "Building \"crypto\" in release mode."
    path="release"
else
    echo "Unsupported build mode \"$1\""
    exit 1
fi

cd $SCRIPT_DIR/../lib; cargo build --target wasm32-unknown-unknown ${1} $features
wasm-bindgen --out-dir=$SCRIPT_DIR/../src/crypto --target=web --omit-default-module-path target/wasm32-unknown-unknown/$path/crypto.wasm
