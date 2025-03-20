#!/bin/sh

# If the config.toml file does not exist, create a new one and populate it with values from the environment variables.
# Otherwise, update its settings based on the environment variables.

CONFIG_PATH="/usr/share/nginx/html/config.toml"

if [ ! -f "$CONFIG_PATH" ]; then
    echo "No configuration file found at $CONFIG_PATH. Creating a new one and setting it up with environment variables."

    touch "$CONFIG_PATH"
    if [ -n "$INDEXER_URL" ]; then
        echo "indexer_url = \"${INDEXER_URL}\"" >> "$CONFIG_PATH"
    fi
    if [ -n "$RPC_URL" ]; then
        echo "rpc_url = \"${RPC_URL}\"" >> "$CONFIG_PATH"
    fi
    if [ -n "$MASP_INDEXER_URL" ]; then
        echo "masp_indexer_url = \"${MASP_INDEXER_URL}\"" >> "$CONFIG_PATH"
    fi
    if [ -n "$LOCALNET_ENABLED" ]; then
        echo "localnet_enabled  = \"${LOCALNET_ENABLED}\"" >> "$CONFIG_PATH"
    fi
else
    echo "Found an existing configuration file at $CONFIG_PATH. Updating it with the current environment variables."
    
    if [ -n "$INDEXER_URL" ]; then
        sed -r -i "s~#?indexer_url = .*~indexer_url = \"${INDEXER_URL}\"~g" "$CONFIG_PATH"
    fi
    if [ -n "$RPC_URL" ]; then
        sed -r -i "s~#?rpc_url = .*~rpc_url = \"${RPC_URL}\"~g" "$CONFIG_PATH"
    fi
    if [ -n "$MASP_INDEXER_URL" ]; then
        sed -r -i "s~#?masp_indexer_url = .*~masp_indexer_url = \"${MASP_INDEXER_URL}\"~g" "$CONFIG_PATH"
    fi
    if [ -n "$LOCALNET_ENABLED" ]; then
        sed -r -i "s~#?localnet_enabled = .*~localnet_enabled = \"${LOCALNET_ENABLED}\"~g" "$CONFIG_PATH"
    fi
fi

cat "$CONFIG_PATH"
