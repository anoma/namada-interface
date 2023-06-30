#!/bin/sh

SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)
PACKAGES_PATH="../../../packages"

suffix=""

if [ "$1" != "--release" ]
then
    suffix=":dev"
fi

cd "${SCRIPT_DIR}/${PACKAGES_PATH}/crypto" && yarn wasm:build$suffix
cd "${SCRIPT_DIR}/${PACKAGES_PATH}/shared" && yarn wasm:build$suffix
