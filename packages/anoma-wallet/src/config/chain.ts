export type Protocol = "http" | "https" | "ws" | "wss";

const {} = process.env;

const {
  // Default local ledger config
  REACT_APP_LOCAL_LEDGER_URL,
  REACT_APP_LOCAL_LEDGER_PORT,
  REACT_APP_LOCAL_CHAIN_ID,
  REACT_APP_LOCAL_FAUCET,
  REACT_APP_LOCAL_LEDGER_PROTOCOL,
  REACT_APP_LOCAL_LEDGER_WS_PROTOCOL,
  // Alternatively, specify a local IBC chain:
  // IBC - CHAIN A
  REACT_APP_CHAIN_A_ALIAS,
  REACT_APP_CHAIN_A_ID,
  REACT_APP_CHAIN_A_URL,
  REACT_APP_CHAIN_A_PORT,
  REACT_APP_CHAIN_A_FAUCET,
  REACT_APP_CHAIN_A_PORT_ID,
  REACT_APP_CHAIN_A_PROTOCOL,
  REACT_APP_CHAIN_A_WS_PROTOCOL,
  // IBC - CHAIN B
  REACT_APP_CHAIN_B_ALIAS,
  REACT_APP_CHAIN_B_ID,
  REACT_APP_CHAIN_B_URL,
  REACT_APP_CHAIN_B_PORT,
  REACT_APP_CHAIN_B_FAUCET,
  REACT_APP_CHAIN_B_PORT_ID,
  REACT_APP_CHAIN_B_PROTOCOL,
  REACT_APP_CHAIN_B_WS_PROTOCOL,
} = process.env;

export type NetworkConfig = {
  url: string;
  port: number;
  protocol: Protocol;
  wsProtocol: Protocol;
};

export type Chain = {
  id: string;
  alias: string;
  accountIndex: number;
  network: NetworkConfig;
  faucet?: string;
  portId?: string;
  ibc?: string[];
};

export const defaultChainId =
  REACT_APP_LOCAL_CHAIN_ID ||
  REACT_APP_CHAIN_A_ID ||
  "anoma-test.fd58c789bc11e6c6392";

const DEFAULT_URL = "127.0.0.1";
const DEFAULT_PORT = 26657;
const DEFAULT_CHAIN_ALIAS = "Namada";
const DEFAULT_IBC_PORT = "transfer";

const DEFAULT_CHAIN_A_PORT = 27657;
const DEFAULT_CHAIN_B_PORT = 28657;

const chains: Chain[] = [];

if (REACT_APP_CHAIN_A_ID) {
  chains.push({
    id: REACT_APP_CHAIN_A_ID,
    alias: REACT_APP_CHAIN_A_ALIAS || "IBC - 1",
    accountIndex: 998,
    faucet: REACT_APP_CHAIN_A_FAUCET,
    portId: REACT_APP_CHAIN_A_PORT_ID || DEFAULT_IBC_PORT,
    network: {
      url: REACT_APP_CHAIN_A_URL || DEFAULT_URL,
      port: REACT_APP_CHAIN_A_PORT
        ? parseInt(REACT_APP_CHAIN_A_PORT)
        : DEFAULT_CHAIN_A_PORT,
      protocol:
        REACT_APP_CHAIN_A_PROTOCOL === "https"
          ? REACT_APP_CHAIN_A_PROTOCOL
          : "http",
      wsProtocol:
        REACT_APP_CHAIN_A_WS_PROTOCOL === "wss"
          ? REACT_APP_CHAIN_A_WS_PROTOCOL
          : "ws",
    },
    ibc: REACT_APP_CHAIN_B_ID ? [REACT_APP_CHAIN_B_ID] : undefined,
  });

  if (REACT_APP_CHAIN_B_ID) {
    chains.push({
      id: REACT_APP_CHAIN_B_ID,
      alias: REACT_APP_CHAIN_B_ALIAS || "IBC - 2",
      accountIndex: 999,
      faucet: REACT_APP_CHAIN_B_FAUCET,
      portId: REACT_APP_CHAIN_B_PORT_ID || DEFAULT_IBC_PORT,
      network: {
        url: REACT_APP_CHAIN_B_URL || DEFAULT_URL,
        port: REACT_APP_CHAIN_B_PORT
          ? parseInt(REACT_APP_CHAIN_B_PORT)
          : DEFAULT_CHAIN_B_PORT,
        protocol:
          REACT_APP_CHAIN_B_PROTOCOL === "https"
            ? REACT_APP_CHAIN_B_PROTOCOL
            : "http",
        wsProtocol:
          REACT_APP_CHAIN_B_WS_PROTOCOL === "wss"
            ? REACT_APP_CHAIN_B_WS_PROTOCOL
            : "ws",
      },
      ibc: [REACT_APP_CHAIN_A_ID],
    });
  }
} else {
  // If no IBC chains specified in .env, you MUST have a default chain config specified for Namada!
  chains.push({
    id: defaultChainId,
    alias: DEFAULT_CHAIN_ALIAS,
    accountIndex: 0,
    faucet: REACT_APP_LOCAL_FAUCET,
    network: {
      url: REACT_APP_LOCAL_LEDGER_URL || DEFAULT_URL,
      port: REACT_APP_LOCAL_LEDGER_PORT
        ? parseInt(REACT_APP_LOCAL_LEDGER_PORT)
        : DEFAULT_PORT,
      protocol:
        REACT_APP_LOCAL_LEDGER_PROTOCOL === "https"
          ? REACT_APP_LOCAL_LEDGER_PROTOCOL
          : "http",
      wsProtocol:
        REACT_APP_LOCAL_LEDGER_WS_PROTOCOL === "wss"
          ? REACT_APP_LOCAL_LEDGER_WS_PROTOCOL
          : "ws",
    },
  });
}

/**
 * TODO: Load ChainConfig from JSON.
 * This set-up only supports up to 2 chains (with IBC enabled), loaded from .env
 */
const ChainConfig = chains.reduce(
  (config: Record<string, Chain>, chain: Chain) => {
    const chainId = chain.id;
    config[chainId] = chain;
    return config;
  },
  {}
);

export default ChainConfig;
