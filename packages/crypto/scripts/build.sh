#!/bin/sh

SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)

path=""
profile=""

if [ "$1" = "" ]
then
    echo "Building \"crypto\" for web in dev mode."
    profile="--dev"
    path="debug"
elif [ "$1" = "--release" ]
then
    echo "Building \"crypto\" for web in release mode."
    profile="--release"
    path="release"
else
    echo "Unsupported build mode \"$1\""
    exit 1
fi

rm -rf dist && mkdir dist && mkdir dist/crypto

wasm-pack build $SCRIPT_DIR/../lib $profile --target web --out-dir $SCRIPT_DIR/../src/crypto
