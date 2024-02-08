#!/bin/bash -x

VERSION="v0.31.1"
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

    #  Download masp params
    curl --location --remote-header-name --remote-name https://github.com/anoma/masp-mpc/releases/download/namada-trusted-setup/masp-output.params 
    curl --location --remote-header-name --remote-name https://github.com/anoma/masp-mpc/releases/download/namada-trusted-setup/masp-convert.params 
    curl --location --remote-header-name --remote-name https://github.com/anoma/masp-mpc/releases/download/namada-trusted-setup/masp-spend.params
    mv masp-*.params "${NAMADA_DIR}"

    # Download wasms
    CHECKSUMS="${NAMADA_DIR}/checksums.json"
    WASM=""
    ARTIFACTS_URL="https://artifacts.heliax.click/namada-wasm"

    rm -rf "${NAMADA_DIR}/wasm"
    mkdir "${NAMADA_DIR}/wasm"

    while read -r line; 
    do
        WASM=$(echo "$line" | sed -E "s/\".+\":[[:space:]]\"//g" | sed -E "s/\".*//g");
        curl "${ARTIFACTS_URL}/${WASM}" --output "${NAMADA_DIR}/wasm/${WASM}"

    done < "$CHECKSUMS"

    # Save version
    echo "${VERSION}" > "${NAMADA_DIR}/.version"
fi

# Clear the basedir
rm -rf $NAMADA_BASE_DIR

CHAIN_PREFIX="localnet"

"${NAMADA_DIR}/namadac" --base-dir $NAMADA_BASE_DIR utils init-network \
    --chain-prefix $CHAIN_PREFIX \
    --genesis-time "2023-01-01T00:00:00Z" \
    --templates-path genesis/localnet \
    --wasm-checksums-path "${NAMADA_DIR}/checksums.json"

CONFIG="${NAMADA_BASE_DIR}/global-config.toml"
CHAIN_ID=""

# Read CHAIN_ID from global-config.toml
while read -r line; 
do
    CHAIN_ID=$(echo "$line" | sed "s/default_chain_id = \"//g" | sed "s/\"//");

done < "$CONFIG"

NAMADA_NETWORK_CONFIGS_DIR=. "${NAMADA_DIR}/namadac" --base-dir "${NAMADA_BASE_DIR}/validator" utils join-network \
    --chain-id $CHAIN_ID \
    --genesis-validator validator-0 \
    --pre-genesis-path genesis/localnet/src/pre-genesis/validator-0 \
    --dont-prefetch-wasm

# Copy wasms
cp -f ${NAMADA_DIR}/wasm/*.wasm ${NAMADA_BASE_DIR}/validator/${CHAIN_ID}/wasm/
cp -f ${NAMADA_DIR}/wasm/*.wasm ${NAMADA_BASE_DIR}/${CHAIN_ID}/wasm/

echo "Replacing CHAIN_ID: $CHAIN_ID"
# Override envs - so we do not have to rebuild extension and app
if [[ $OS == "Darwin" ]]; then
    LC_ALL=C find ../apps/extension/build/chrome -type f -name "*.js" -exec sed -i "" -E "s/${CHAIN_PREFIX}\..{21}/$CHAIN_ID/g" {} +
    LC_ALL=C find ../apps/namada-interface/build -type f -name "*.js" -exec sed -i "" -E "s/${CHAIN_PREFIX}\..{21}/$CHAIN_ID/g" {} +
else
    find ../apps/extension/build/chrome -type f -name "*.js" -exec sed -i -E "s/${CHAIN_PREFIX}\..{21}/$CHAIN_ID/g" {} +
    find ../apps/namada-interface/build -type f -name "*.js" -exec sed -i -E "s/${CHAIN_PREFIX}\..{21}/$CHAIN_ID/g" {} +
fi

echo "Removing archive"
rm -f "${CHAIN_ID}.tar.gz"

echo "Fixing CORS"
find ${NAMADA_BASE_DIR} -type f -name "config.toml" -exec sed -i -E "s/cors_allowed_origins[[:space:]]=[[:space:]]\[\]/cors_allowed_origins = [\"*\"]/g" {} +

echo "Moving MASP params"
cp ${NAMADA_DIR}/masp-*.params ../apps/namada-interface/build/assets
