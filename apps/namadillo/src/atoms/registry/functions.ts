import { Chain } from "@chain-registry/types";
import { workingRpcAtoms } from "atoms/integrations";
import { getDefaultStore } from "jotai";

export const getRandomRpcAddress = (chain: Chain): string => {
  const availableRpcs = chain.apis?.rpc;
  if (!availableRpcs) {
    throw new Error("There are no available RPCs for " + chain.chain_name);
  }

  const randomRpc =
    availableRpcs[Math.floor(Math.random() * availableRpcs.length)];

  return randomRpc.address;
};

// eslint-disable-next-line

type QueryFn<T> = (rpc: string) => Promise<T>;

export const queryAndStoreRpc = async <T>(
  chain: Chain,
  queryFn: QueryFn<T>
): Promise<T> => {
  const { get, set } = getDefaultStore();
  const workingRpcs = get(workingRpcAtoms);
  const rpcAddress =
    chain.chain_id in workingRpcs ?
      workingRpcs[chain.chain_id]
    : getRandomRpcAddress(chain);

  try {
    const output = await queryFn(rpcAddress);
    set(workingRpcAtoms, {
      ...workingRpcs,
      [chain.chain_id]: rpcAddress,
    });
    return output;
  } catch (err) {
    if (chain.chain_id in workingRpcs) {
      delete workingRpcs[chain.chain_id];
      set(workingRpcAtoms, { ...workingRpcs });
    }
    throw err;
  }
};
