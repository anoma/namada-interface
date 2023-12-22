#!/bin/bash -x
CHAIN_ID="localnet.000000000000000000000"

# Run the extension
export NODE_ENV=development; \
    export TARGET=chrome; \
    export NAMADA_INTERFACE_MASP_PARAMS_PATH=http://localhost:8080/assets/; \
    export NAMADA_INTERFACE_NAMADA_CHAIN_ID=${CHAIN_ID}; \
    export NAMADA_INTERFACE_NAMADA_URL=http://localhost:27657 && \
    yarn workspace @namada/extension run watch &

# Run the interface
export NODE_ENV=development; \
    export NAMADA_INTERFACE_LOCAL=true; \
    export NAMADA_INTERFACE_MASP_PARAMS_PATH=http://localhost:8080/assets/; \
    export NAMADA_INTERFACE_NAMADA_CHAIN_ID=${CHAIN_ID}; \
    export NAMADA_INTERFACE_NAMADA_URL=http://localhost:27657 && \
    yarn workspace @namada/namada-interface run watch &

npx http-server -p 8080 -c-1 ../apps/namada-interface/build

# Sleep indefinitely
while :; do sleep 86400; done

# Kill all processes on exit
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT
