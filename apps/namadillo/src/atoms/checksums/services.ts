import { Namada } from "@namada/integrations";
import { WasmHash } from "@namada/types";
import { getSdkInstance } from "hooks";

export const fetchWasmHashes = async (
  chainId: string,
  integration: Namada
): Promise<WasmHash[]> => {
  const wasmHashes = await integration.getTxWasmHashes(chainId);
  const sdk = await getSdkInstance();
  if (!wasmHashes) {
    const { rpc } = sdk;
    const hashes = await rpc.queryWasmHashes();
    await integration.addTxWasmHashes(chainId, hashes);
    return hashes;
  }
  return wasmHashes;
};
