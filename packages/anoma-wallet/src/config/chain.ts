import { Network } from "./rpc";

export type Protocol = "http" | "https" | "ws" | "wss";

const {
  // Default local ledger config
  REACT_APP_LEDGER_URL,
  REACT_APP_LEDGER_PORT,
  REACT_APP_CHAIN_ID,
  REACT_APP_FAUCET,
  // Alternatively, specify a local IBC chain:
  // IBC - CHAIN A
  REACT_APP_CHAIN_A_ALIAS,
  REACT_APP_CHAIN_A_ID,
  REACT_APP_CHAIN_A_URL,
  REACT_APP_CHAIN_A_PORT,
  REACT_APP_CHAIN_A_FAUCET,
  REACT_APP_CHAIN_A_PORT_ID,
  // IBC - CHAIN B
  REACT_APP_CHAIN_B_ALIAS,
  REACT_APP_CHAIN_B_ID,
  REACT_APP_CHAIN_B_URL,
  REACT_APP_CHAIN_B_PORT,
  REACT_APP_CHAIN_B_FAUCET,
  REACT_APP_CHAIN_B_PORT_ID,
} = process.env;

export type NetworkConfig = Network & {
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

const DEFAULT_URL = "127.0.0.1";
const DEFAULT_CHAIN_ALIAS = "Namada";
const DEFAULT_IBC_PORT = "transfer";

/**
 * Remove any comments ("#") or quotes
 * @param url
 * @returns {string}
 */
const stripInvalidCharacters = (url = ""): string => {
  // Ignore comments and quotes
  return url.split("#")[0].replace(/\"|\'/, "");
};

/**
 * Remove any characters after whitespace from env value
 * @param value
 * @returns {string}
 */
const sanitize = (value = " "): string => {
  return stripInvalidCharacters(value).split(" ")[0];
};

/**
 * Return URL with no prefixed protocol
 * @param url
 * @returns {string}
 */
const getUrl = (url = ""): string => {
  return sanitize(url).replace(/^https?\:\/\//, "");
};

/**
 * Get the protocol from a URL or return default
 * @param url
 * @returns {Protocol}
 */
const getUrlProtocol = (url?: string): Protocol => {
  const prefix = sanitize(url).split(":")[0];

  if (prefix === "https") {
    return "https";
  }

  return "http";
};

// Default chain
const chainId = sanitize(REACT_APP_CHAIN_ID);
const url = getUrl(sanitize(REACT_APP_LEDGER_URL));
const protocol = getUrlProtocol(REACT_APP_LEDGER_URL);
const wsProtocol: Protocol = protocol === "https" ? "wss" : "ws";
const faucet = sanitize(REACT_APP_FAUCET);
const port = parseInt(sanitize(REACT_APP_LEDGER_PORT)) || undefined;

// IBC Chain A
const chainAId = sanitize(REACT_APP_CHAIN_A_ID);
const chainAAlias =
  stripInvalidCharacters(REACT_APP_CHAIN_A_ALIAS) || "IBC - 1";
const chainAUrl = getUrl(REACT_APP_CHAIN_A_URL) || DEFAULT_URL;
const chainAPort = parseInt(sanitize(REACT_APP_CHAIN_A_PORT)) || undefined;
const chainAProtocol = getUrlProtocol(REACT_APP_CHAIN_A_URL);
const chainAWsProtocol: Protocol = chainAProtocol === "https" ? "wss" : "ws";
const chainAPortId = sanitize(REACT_APP_CHAIN_A_PORT_ID) || DEFAULT_IBC_PORT;
const chainAFaucet = sanitize(REACT_APP_CHAIN_A_FAUCET) || undefined;

// IBC Chain B
const chainBId = sanitize(REACT_APP_CHAIN_B_ID);
const chainBAlias =
  stripInvalidCharacters(REACT_APP_CHAIN_B_ALIAS) || "IBC - 1";
const chainBUrl = getUrl(REACT_APP_CHAIN_B_URL) || DEFAULT_URL;
const chainBPort = parseInt(sanitize(REACT_APP_CHAIN_B_PORT)) || undefined;
const chainBProtocol = getUrlProtocol(REACT_APP_CHAIN_B_URL);
const chainBWsProtocol: Protocol = chainBProtocol === "https" ? "wss" : "ws";
const chainBPortId = sanitize(REACT_APP_CHAIN_B_PORT_ID) || DEFAULT_IBC_PORT;
const chainBFaucet = sanitize(REACT_APP_CHAIN_B_FAUCET) || undefined;

export const defaultChainId =
  chainId || chainAId || "anoma-test.fd58c789bc11e6c6392";

const chains: Chain[] = [];

if (chainAId) {
  chains.push({
    id: chainAId,
    alias: chainAAlias,
    accountIndex: 0,
    faucet: chainAFaucet,
    portId: chainAPortId,
    network: {
      url: chainAUrl,
      port: chainAPort,
      protocol: chainAProtocol,
      wsProtocol: chainAWsProtocol,
    },
    ibc: chainBId ? [chainBId] : undefined,
  });

  if (chainBId) {
    chains.push({
      id: chainBId,
      alias: chainBAlias,
      accountIndex: 999,
      faucet: chainBFaucet,
      portId: chainBPortId,
      network: {
        url: chainBUrl,
        port: chainBPort,
        protocol: chainBProtocol,
        wsProtocol: chainBWsProtocol,
      },
      ibc: [chainAId],
    });
  }
} else {
  // If no IBC chains specified in .env, you MUST have a default chain config specified for Namada!
  chains.push({
    id: chainId || defaultChainId,
    alias: DEFAULT_CHAIN_ALIAS,
    accountIndex: 0,
    faucet,
    network: {
      url: url || DEFAULT_URL,
      port,
      protocol,
      wsProtocol,
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
console.log({ ChainConfig });
export default ChainConfig;
