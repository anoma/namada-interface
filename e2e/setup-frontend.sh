#!/bin/bash -x
CHAIN_ID="dev-test.000000000000000000000"

ext_mode=""
interface_mode=""

if [ "$1" = "--watch" ]
then
    ext_mode="$1"
    interface_mode="$1 &"
fi

# Run the extension
cd ../apps/extension && \
    yarn clean:chrome && \
    export NODE_ENV=development; \
    export TARGET=chrome; \
    export REACT_APP_NAMADA_CHAIN_ID=${CHAIN_ID}; \
    export REACT_APP_NAMADA_URL=http://127.0.0.1:27657 && \
    npx webpack $ext_mode &

# Run the interface
cd ../namada-interface && \
    export NODE_ENV=development; \
    export REACT_APP_LOCAL=true; \
    export REACT_APP_NAMADA_CHAIN_ID=${CHAIN_ID}; \
    export REACT_APP_NAMADA_URL=http://127.0.0.1:27657 && \
    npx webpack $interface_mode

cd ../../e2e

npx http-server -p 8080 -c-1 ../apps/namada-interface/build

# Sleep indefinitely/ TODO: check if needed as http-server is running
while :; do sleep 86400; done

# Kill all processes on exit
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT
