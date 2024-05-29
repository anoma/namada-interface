#!/bin/sh

SCRIPT_DIR=$(cd "$(dirname "$0")"; pwd -P)

node $SCRIPT_DIR/startProxies.js&

