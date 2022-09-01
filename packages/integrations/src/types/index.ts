import { Network, Protocol } from "@anoma/rpc";

export type IBCConfigItem = {
  chainId: string;
  alias: string;
};

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
  ibc?: IBCConfigItem[];
};
