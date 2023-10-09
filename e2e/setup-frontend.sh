#!/bin/bash -x
CHAIN_ID="dev-test.000000000000000000000"

# Run the extension
cd ../apps/extension && \
    yarn clean:chrome && \
    export NODE_ENV=development; \
    export TARGET=chrome; \
    export MASP_PARAMS_PATH=http://localhost:8080/assets/; \
    export REACT_APP_NAMADA_CHAIN_ID=${CHAIN_ID}; \
    export REACT_APP_NAMADA_URL=http://localhost:27657 && \
    npx webpack --watch &

# Run the interface
cd ../namada-interface && \
    export NODE_ENV=development; \
    export REACT_APP_LOCAL=true; \
    export MASP_PARAMS_PATH=http://localhost:8080/assets/; \
    export REACT_APP_NAMADA_CHAIN_ID=${CHAIN_ID}; \
    export REACT_APP_NAMADA_URL=http://localhost:27657 && \
    npx webpack --watch &

cd ../../e2e

npx http-server -p 8080 -c-1 ../apps/namada-interface/build

# Sleep indefinitely
while :; do sleep 86400; done

# Kill all processes on exit
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT
