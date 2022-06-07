export type Protocol = "http" | "https" | "ws" | "wss";

const {
  REACT_APP_LOCAL,
  REACT_APP_LOCAL_LEDGER_ADDRESS,
  REACT_APP_LOCAL_CHAIN_PORT,
  REACT_APP_LOCAL_CHAIN_ID,
} = process.env;

const DEFAULT_PORT = 26657;

type IbcDestination = {
  id: string;
  alias: string;
  portId: string;
};

export type NetworkConfig = {
  url: string;
  port: number;
  protocol: Protocol;
  wsProtocol: Protocol;
};

export type Chain = {
  id: string;
  alias: string;
  network: NetworkConfig;
  ibc: IbcDestination[];
};

export const defaultChainId =
  REACT_APP_LOCAL_CHAIN_ID || "anoma-test.fd58c789bc11e6c6392";

/**
 * TODO: Load ChainConfig from JSON.
 * TODO: Only load local configs (REACT_APP_LOCAL_*) if running in "local" mode
 * The following config is to support all current features, and serve as a segue to
 * requesting network configurations by other means.
 */
const ChainConfig: Record<string, Chain> = {
  [defaultChainId]: {
    id: defaultChainId,
    alias: "Namada",
    network: {
      url: REACT_APP_LOCAL_LEDGER_ADDRESS || "127.0.0.1",
      port: REACT_APP_LOCAL_CHAIN_PORT
        ? parseInt(REACT_APP_LOCAL_CHAIN_PORT)
        : DEFAULT_PORT,
      protocol: REACT_APP_LOCAL ? "http" : "https",
      wsProtocol: REACT_APP_LOCAL ? "ws" : "wss",
    },
    ibc: [
      {
        id: "anoma-test.5aa9a964bf8925d4e44",
        alias: "Namada - Local",
        portId: "transfer",
      },
    ],
  },
  ["anoma-test.a3f2e831ac21178f5fb"]: {
    id: "anoma-test.a3f2e831ac21178f5fb",
    alias: "Anoma Testnet Local",
    network: {
      url: "10.7.1.159",
      port: 27657,
      protocol: "http",
      wsProtocol: "ws",
    },
    ibc: [
      {
        id: "anoma-test.db3b577a0da7edb19ac",
        alias: "Anoma Fractal Instance",
        portId: "transfer",
      },
    ],
  },
};

export default ChainConfig;
