export type Protocol = "http" | "https" | "ws" | "wss";

const {
  REACT_APP_LOCAL,
  REACT_APP_LOCAL_LEDGER_ADDRESS,
  REACT_APP_LOCAL_CHAIN_PORT,
  REACT_APP_LOCAL_CHAIN_ID,
  // TODO: Potentially add another variable to run in "development" mode
  // from Netlify. For now, it will always default to the devnet if not
  // running a local ledger via `yarn dev:local`
} = process.env;

const DEFAULT_PORT = 26657;

type IbcDestination = {
  id: string;
  alias: string;
  portId: string;
};

type Chain = {
  id: string;
  network: {
    url: string;
    port: number;
    protocol: Protocol;
    wsProtocol: Protocol;
  };
  ibc: IbcDestination[];
};

const ChainConfig: Chain = {
  // TODO: Load this from an environment config
  id: REACT_APP_LOCAL_CHAIN_ID || "anoma-test.fd58c789bc11e6c6392",
  network: {
    url: REACT_APP_LOCAL_LEDGER_ADDRESS || "127.0.0.1",
    port: REACT_APP_LOCAL_CHAIN_PORT
      ? parseInt(REACT_APP_LOCAL_CHAIN_PORT)
      : DEFAULT_PORT,
    protocol: REACT_APP_LOCAL ? "http" : "https",
    wsProtocol: REACT_APP_LOCAL ? "ws" : "wss",
  },
  // TODO: Load these from an environment config
  ibc: [
    {
      id: "anoma-test.5aa9a964bf8925d4e44",
      alias: "Namada - Local",
      portId: "transfer",
    },
  ],
};

export default ChainConfig;
