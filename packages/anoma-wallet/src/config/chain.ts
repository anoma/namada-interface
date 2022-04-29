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

type Chain = {
  id: string;
  name: string;
  network: {
    url: string;
    port: number;
    protocol: Protocol;
    wsProtocol: Protocol;
  };
};

const ChainConfig: Record<string, Chain> = {};

if (REACT_APP_LOCAL) {
  ChainConfig.default = {
    id: REACT_APP_LOCAL_CHAIN_ID,
    name: "Namada - Local",
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
  ChainConfig.default = {
    id: "anoma-devnet-3.5.64c17effa6be4",
    name: "Namada - UI/UX Devnet",
    network: {
      url: "testnet-ux.anoma-euw1.heliax.dev",
      port: 443,
      protocol: "https",
      wsProtocol: "wss",
    },
  };
}

export default ChainConfig;
