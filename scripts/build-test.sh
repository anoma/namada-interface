#!/bin/sh

SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)

cd $SCRIPT_DIR/../packages/crypto && yarn wasm:build:node:dev
cd $SCRIPT_DIR/../packages/shared && yarn wasm:build:node:dev
