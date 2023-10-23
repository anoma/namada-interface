NAMADA_DIR=".namada"
NAMADA_BASE_DIR=".namada/basedir"

"${NAMADA_DIR}/namada" --base-dir ${NAMADA_BASE_DIR} client init-proposal --data-path proposal.json --node tcp://127.0.0.1:27657
