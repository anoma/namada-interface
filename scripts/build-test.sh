#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)

cd $SCRIPT_DIR/../packages/wasm && yarn wasm:build:node
