export type Protocol = "http" | "https" | "ws" | "wss";

const {
  REACT_APP_LOCAL,
  REACT_APP_LOCAL_CHAIN_ID = "",
  REACT_APP_LOCAL_CHAIN_PORT,
} = process.env;

// Localhost defaults
const DEFAULT_PORT = 26657;

type Chain = {
  id: string;
  name: string;
  url: string;
  port: number;
  protocol: Protocol;
  wsProtocol: Protocol;
};

const ChainConfig: Record<string, Chain> = {};

if (REACT_APP_LOCAL) {
  ChainConfig["Namada"] = {
    id: REACT_APP_LOCAL_CHAIN_ID,
    name: "Namada - Local",
    url: "localhost",
    port: REACT_APP_LOCAL_CHAIN_PORT
      ? parseInt(REACT_APP_LOCAL_CHAIN_PORT)
      : DEFAULT_PORT,
    protocol: "http",
    wsProtocol: "ws",
  };
} else {
  ChainConfig["Namada"] = {
    id: "anoma-devnet-3.5.64c17effa6be4",
    url: "testnet-ux.anoma-euw1.heliax.dev",
    name: "Namada - UI/UX Devnet",
    port: 443,
    protocol: "https",
    wsProtocol: "wss",
  };
}

export default ChainConfig;
