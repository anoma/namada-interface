#!/bin/sh

SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)

wasm-pack build $SCRIPT_DIR/../lib --dev --target nodejs --out-dir $SCRIPT_DIR/../src/crypto
