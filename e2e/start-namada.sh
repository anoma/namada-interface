#!/bin/bash -x

NAMADA_DIR=".namada"
NAMADA_BASE_DIR=".namada/basedir"

CONFIG="${NAMADA_BASE_DIR}/global-config.toml"

# Read CHAIN_ID from global-config.toml
while read -r line; 
do
    CHAIN_ID=$(echo "$line" | sed "s/default_chain_id = \"//g" | sed "s/\"//");

done < "$CONFIG"

# Start the chain
"${NAMADA_DIR}/namadan" --chain-id ${CHAIN_ID} --base-dir ${NAMADA_BASE_DIR}/validator ledger
