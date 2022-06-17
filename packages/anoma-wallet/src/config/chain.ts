export type Protocol = "http" | "https" | "ws" | "wss";

const {
  REACT_APP_LOCAL,
  REACT_APP_LOCAL_LEDGER_ADDRESS,
  REACT_APP_LOCAL_LEDGER_PORT,
  REACT_APP_LOCAL_CHAIN_ID,
  REACT_APP_LOCAL_FAUCET,
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
  accountIndex: number;
  faucet?: string;
  network: NetworkConfig;
  ibc: IbcDestination[];
};

export const defaultChainId =
  REACT_APP_LOCAL_CHAIN_ID || "anoma-test.fd58c789bc11e6c6392";

const DEFAULT_CHAIN_ALIAS = "Namada";
const CHAIN_A_ID = "anoma-test.7008ac9d0878f8a3396";
const CHAIN_B_ID = "anoma-test.60261c0596a7c9c2901";
const CHAIN_A_ALIAS = "Anoma Fractal Instance - A";
const CHAIN_B_ALIAS = "Anoma Fractal Instance - B";

const DEFAULT_IBC_PORT = "transfer";

/**
 * TODO: Fetch all IBC-enabled chains in ecosystem
 */
const ibcEnabledChains = [
  {
    id: defaultChainId,
    alias: DEFAULT_CHAIN_ALIAS,
    portId: DEFAULT_IBC_PORT,
  },
  {
    id: CHAIN_A_ID,
    alias: CHAIN_A_ALIAS,
    portId: DEFAULT_IBC_PORT,
  },
  {
    id: CHAIN_B_ID,
    alias: CHAIN_B_ALIAS,
    portId: DEFAULT_IBC_PORT,
  },
];

/**
 * TODO: Load ChainConfig from JSON.
 * TODO: Only load local configs (REACT_APP_LOCAL_*) if running in "local" mode
 * The following config is to support all current features, and serve as a segue to
 * requesting network configurations by other means.
 */
const ChainConfig: Record<string, Chain> = {
  /**
   * Default chain config
   */
  [defaultChainId]: {
    id: defaultChainId,
    alias: DEFAULT_CHAIN_ALIAS,
    accountIndex: 0,
    faucet: REACT_APP_LOCAL_FAUCET,
    network: {
      url: REACT_APP_LOCAL_LEDGER_ADDRESS || "127.0.0.1",
      port: REACT_APP_LOCAL_LEDGER_PORT
        ? parseInt(REACT_APP_LOCAL_LEDGER_PORT)
        : DEFAULT_PORT,
      protocol: REACT_APP_LOCAL ? "http" : "https",
      wsProtocol: REACT_APP_LOCAL ? "ws" : "wss",
    },
    ibc: ibcEnabledChains.filter((ibcChain) => ibcChain.id !== defaultChainId),
  },
  /**
   * Example instance config
   */
  [CHAIN_A_ID]: {
    id: CHAIN_A_ID,
    alias: CHAIN_A_ALIAS,
    accountIndex: 998,
    faucet:
      "atest1v4ehgw36geqnqdjzgvunzwfcgcu52vfsxpznwse5gcm5x3pjx4qnvsehxdry2v6pxg6nqw2ye0djfx",
    network: {
      url: "10.7.1.162",
      port: 27657,
      protocol: "http",
      wsProtocol: "ws",
    },
    ibc: ibcEnabledChains.filter((ibcChain) => ibcChain.id !== CHAIN_A_ID),
  },
  /**
   * Example instance config
   */
  [CHAIN_B_ID]: {
    id: CHAIN_B_ID,
    alias: CHAIN_B_ALIAS,
    accountIndex: 999,
    faucet:
      "atest1v4ehgw36x5uyg3pcx9ryxwf3gymnwvfhxqmnzwfexeqnvsjyxezrqs6xxy6n2sehg4q5xw2r5xdurj",
    network: {
      url: "10.7.1.162",
      port: 28657,
      protocol: "http",
      wsProtocol: "ws",
    },
    ibc: ibcEnabledChains.filter((ibcChain) => ibcChain.id !== CHAIN_B_ID),
  },
};

export default ChainConfig;
