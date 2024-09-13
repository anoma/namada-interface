#!/bin/sh

CONFIG_PATH="/usr/share/nginx/html/config.toml"

# if the config.toml file doesn't exist, we create it and we try to populate it from environemnt variables
# Otherwise we try to replace the settings from environemnt variables
if [ ! -f $CONFIG_PATH ]; then
    echo "Bootstrapping new configuration file at $CONFIG_PATH"
    touch $CONFIG_PATH
    if [[ -n $INDEXER_URL ]]; then
        echo "indexer_url = \"${INDEXER_URL}\"" >> $CONFIG_PATH
    fi
    if [[ -n $RPC_URL ]]; then
        echo "rpc_url = \"${RPC_URL}\"" >> $CONFIG_PATH
    fi
else
    echo "Using configuration file at $CONFIG_PATH"
    if [[ -n $INDEXER_URL ]]; then
        sed -r -i "s~#?indexer_url = .*~indexer_url = \"${INDEXER_URL}\"~g" $CONFIG_PATH
    fi
    if [[ -n $RPC_URL ]]; then
        sed -r -i "s~#?rpc_url = .*~rpc_url = \"${RPC_URL}\"~g" $CONFIG_PATH
    fi
    cat $CONFIG_PATH
fi