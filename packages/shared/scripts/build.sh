#!/bin/sh

SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)

features=""
path=""
profile=""

if [ "$1" = "" ]
then
    echo "Building \"shared\" in dev mode."
    profile="--dev"
    features="--features dev,parallel"
    path="debug"
elif [ "$1" = "--release" ]
then
    echo "Building \"shared\" in release mode."
    profile="--release"
    features="--features parallel"
    path="release"
else
    echo "Unsupported build mode \"$1\""
    exit 1
fi

RUSTFLAGS='-C target-feature=+atomics,+bulk-memory,+mutable-globals' wasm-pack build $SCRIPT_DIR/../lib $profile --target web --out-dir $SCRIPT_DIR/../src/shared -- $features -Z build-std=panic_abort,std
