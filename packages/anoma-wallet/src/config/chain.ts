export type Protocol = "http" | "https" | "ws" | "wss";

const {
  REACT_APP_LOCAL,
  REACT_APP_LOCAL_CHAIN_ID = "",
  REACT_APP_LOCAL_CHAIN_PORT,
  // TODO: Potentially add another variable to run in "development" mode
  // from Netlify. For now, it will always default to the devnet if not
  // running a local ledger via `yarn dev:local`
} = process.env;

const DEFAULT_PORT = 26657;
const DEFAULT_CHAIN_ID = "anoma-devnet-3.5.64c17effa6be4";

type Chain = {
  id: string;
  name: string;
  default?: boolean;
  ibcPortId: string;
  network: {
    url: string;
    port: number;
    protocol: Protocol;
    wsProtocol: Protocol;
  };
};

const ChainConfig: Record<string, Chain> = {};

if (REACT_APP_LOCAL) {
  ChainConfig[REACT_APP_LOCAL_CHAIN_ID] = {
    id: REACT_APP_LOCAL_CHAIN_ID,
    name: "Namada - Local",
    default: true,
    ibcPortId: "transfer",
    network: {
      url: "localhost",
      port: REACT_APP_LOCAL_CHAIN_PORT
        ? parseInt(REACT_APP_LOCAL_CHAIN_PORT)
        : DEFAULT_PORT,
      protocol: "http",
      wsProtocol: "ws",
    },
  };
} else {
  ChainConfig[DEFAULT_CHAIN_ID] = {
    id: DEFAULT_CHAIN_ID,
    name: "Namada - UI/UX Devnet",
    default: true,
    ibcPortId: "transfer",
    network: {
      url: "testnet-ux.anoma-euw1.heliax.dev",
      port: 443,
      protocol: "https",
      wsProtocol: "wss",
    },
  };
}

export default ChainConfig;
