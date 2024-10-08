import { Chain } from "@chain-registry/types";

export const getRandomRpcAddress = (chain: Chain): string => {
  const availableRpcs = chain.apis?.rpc;
  if (!availableRpcs) {
    throw new Error("There are no available RPCs for " + chain.chain_name);
  }

  const randomRpc =
    availableRpcs[Math.floor(Math.random() * availableRpcs.length)];

  return randomRpc.address;
};
