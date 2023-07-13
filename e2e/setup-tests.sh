#!/bin/bash -x

VERSION="v0.19.0"
CURRENT_VERSION=""
NAMADA_DIR=".namada"
NAMADA_BASE_DIR=".namada/basedir"

# Read current version
CURRENT_VERSION_PATH="${NAMADA_DIR}/.version"
while read -r line; 
do
    CURRENT_VERSION=$line

done < "$CURRENT_VERSION_PATH"

if [ "$CURRENT_VERSION" != "$VERSION" ]; then
    # Download Namada binaries
    FILENAME="namada-${VERSION}-Linux-x86_64.tar.gz"
    curl --location --remote-header-name --remote-name  https://github.com/anoma/namada/releases/download/${VERSION}/${FILENAME}
    mkdir $NAMADA_DIR
    tar -xzf ${FILENAME} --directory $NAMADA_DIR --strip-components 1
    rm -rf ${FILENAME}

    # Download wasm checksums
    curl --location --remote-header-name --remote-name https://raw.githubusercontent.com/anoma/namada/${VERSION}/wasm/checksums.json
    mv checksums.json "${NAMADA_DIR}/checksums.json"

    echo "${VERSION}" > "${NAMADA_DIR}/.version"
fi

# Clear the basedir
rm -rf $NAMADA_BASE_DIR

"${NAMADA_DIR}/namadac" --base-dir $NAMADA_BASE_DIR utils init-network \
    --chain-prefix dev-test \
    --wasm-checksums-path "${NAMADA_DIR}/checksums.json" \
    --genesis-path genesis.toml \
    --dont-archive \
    --unsafe-dont-encrypt

CONFIG="${NAMADA_BASE_DIR}/global-config.toml"
CHAIN_ID=""

# Read CHAIN_ID from global-config.toml
while read -r line; 
do
    CHAIN_ID=$(echo "$line" | sed "s/default_chain_id = \"//g" | sed "s/\"//");

done < "$CONFIG"

# Run the extension
cd ../apps/extension && \
    yarn clean:chrome && \
    export NODE_ENV=development; \
    export TARGET=chrome; \
    export REACT_APP_NAMADA_CHAIN_ID=${CHAIN_ID}; \
    export REACT_APP_NAMADA_URL=http://127.0.0.1:27657 && \
    npx webpack --watch &

# Run the interface
cd ../namada-interface && \
    export NODE_ENV=development; \
    export REACT_APP_LOCAL=true; \
    export REACT_APP_NAMADA_CHAIN_ID=${CHAIN_ID}; \
    export REACT_APP_NAMADA_URL=http://127.0.0.1:27657 && \
    npx webpack-dev-server &

# Start the chain
cd ../../e2e
"${NAMADA_DIR}/namadan"  --chain-id ${CHAIN_ID} --base-dir ${NAMADA_BASE_DIR}/${CHAIN_ID}/setup/validator-0/.namada ledger >/dev/null &

"${NAMADA_DIR}/namadaw"  --base-dir ${NAMADA_BASE_DIR} address gen --alias my-account --unsafe-dont-encrypt

sleep 10
"${NAMADA_DIR}/namadac" --base-dir ${NAMADA_BASE_DIR} transfer \
  --source faucet \
  --target atest1d9khqw36xccyydp3xpznjvzrx3zrq3fexep5y33nxverqdz9xcc5ydeexgm52djrxvuyxsjr44hd2f \
  --token NAM \
  --amount 1000 --node tcp://127.0.0.1:27657 --signer my-account

"${NAMADA_DIR}/namadac" --base-dir ${NAMADA_BASE_DIR} transfer \
  --source faucet \
  --target atest1d9khqw368qury3phx3prsvp4gezrssenxqmyxwpn8qmrqvpsg4znjdjp8ycry3p3g4p5vd6x66dnmw \
  --token NAM \
  --amount 1000 --node tcp://127.0.0.1:27657 --signer my-account

# Sleep indefinitely
while :; do sleep 86400; done

# Kill all processes on exit
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT
