#!/bin/sh

SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)
PACKAGES_PATH="../../../packages"

cd "${SCRIPT_DIR}/${PACKAGES_PATH}/crypto" && yarn wasm:build:node:dev
cd "${SCRIPT_DIR}/${PACKAGES_PATH}/shared" && yarn wasm:build:node:dev
