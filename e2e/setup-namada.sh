#!/bin/bash -x

VERSION="v0.22.0"
CURRENT_VERSION=""
NAMADA_DIR=".namada"
NAMADA_BASE_DIR=".namada/basedir"
OS="Linux"

if [[ $OSTYPE == "darwin"* ]]; then
    OS="Darwin"
fi

# Read current version
CURRENT_VERSION_PATH="${NAMADA_DIR}/.version"
if test -f "$CURRENT_VERSION_PATH"; then
    while read -r line; 
    do
        CURRENT_VERSION=$line

    done < "$CURRENT_VERSION_PATH"
fi

if [ "$CURRENT_VERSION" != "$VERSION" ]; then
    # Download Namada binaries
    FILENAME="namada-${VERSION}-${OS}-x86_64.tar.gz"
    curl --location --remote-header-name --remote-name  https://github.com/anoma/namada/releases/download/${VERSION}/${FILENAME}
    mkdir $NAMADA_DIR
    tar -xzf ${FILENAME} --directory $NAMADA_DIR --strip-components 1
    rm -rf ${FILENAME}

    # Download wasm checksums
    curl --location --remote-header-name --remote-name https://raw.githubusercontent.com/anoma/namada/${VERSION}/wasm/checksums.json
    mv checksums.json "${NAMADA_DIR}/checksums.json"

    # Download wasms
    CHECKSUMS="${NAMADA_DIR}/checksums.json"
    WASM=""
    S3="https://namada-wasm-master.s3.eu-west-1.amazonaws.com"

    rm -rf "${NAMADA_DIR}/wasm"
    mkdir "${NAMADA_DIR}/wasm"

    while read -r line; 
    do
        WASM=$(echo "$line" | sed -E "s/\".+\":[[:space:]]\"//g" | sed -E "s/\".*//g");
        curl "${S3}/${WASM}" --output "${NAMADA_DIR}/wasm/${WASM}"

    done < "$CHECKSUMS"

    # Save version
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

# Copy wasms
cp -f ${NAMADA_DIR}/wasm/*.wasm ${NAMADA_BASE_DIR}/${CHAIN_ID}/setup/validator-0/.namada/${CHAIN_ID}/wasm/
cp -f ${NAMADA_DIR}/wasm/*.wasm ${NAMADA_BASE_DIR}/${CHAIN_ID}/wasm/

echo "Replacing CHAIN_ID: $CHAIN_ID"
# Override envs - so we do not have to rebuild extension and app
if [[ $OS == "Darwin" ]]; then
    LC_ALL=C find ../apps/extension/build/chrome -type f -name "*.js" -exec sed -i "" -E "s/dev-test\..{21}/$CHAIN_ID/g" {} +
    LC_ALL=C find ../apps/namada-interface/build -type f -name "*.js" -exec sed -i "" -E "s/dev-test\..{21}/$CHAIN_ID/g" {} +
else
    find ../apps/extension/build/chrome -type f -name "*.js" -exec sed -i -E "s/dev-test\..{21}/$CHAIN_ID/g" {} +
    find ../apps/namada-interface/build -type f -name "*.js" -exec sed -i -E "s/dev-test\..{21}/$CHAIN_ID/g" {} +
fi
