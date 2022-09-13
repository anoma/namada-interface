#!/bin/sh

SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)

wasm-pack build $SCRIPT_DIR/../lib --target web --out-dir $SCRIPT_DIR/../src/shared
