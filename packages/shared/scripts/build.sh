#!/bin/sh

SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)

cd $SCRIPT_DIR/../lib; cargo build --target wasm32-unknown-unknown --release
wasm-bindgen --out-dir=$SCRIPT_DIR/../src/shared --target=web --omit-default-module-path target/wasm32-unknown-unknown/release/shared.wasm
