#!/bin/bash -x

NAMADA_DIR=".namada"
CHECKSUMS="${NAMADA_DIR}/checksums.json"
WASM=""
S3="https://namada-wasm-master.s3.eu-west-1.amazonaws.com"

mkdir "${NAMADA_DIR}/wasm"

while read -r line; 
do
    if [[ $line == *"wasm"* ]]; then
        WASM=$(echo "$line" | sed -E "s/\".+\":\s\"//g" | sed -E "s/\".*//g");
        curl "${S3}/${WASM}" --output "${NAMADA_DIR}/wasm/${WASM}"
    fi

done < "$CHECKSUMS"
