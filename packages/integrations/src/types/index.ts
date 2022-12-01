import { Network, Protocol } from "@anoma/rpc";

export type IBCConfigItem = {
  chainId: string;
  alias: string;
};

export type NetworkConfig = Network & {
  wsProtocol: Protocol;
};
