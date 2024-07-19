import { Namada } from "@namada/integrations";
import { WasmHash } from "@namada/types";
import { getSdkInstance } from "hooks";

export const fetchWasmHashes = async (
  chainId: string,
  integration: Namada
): Promise<WasmHash[]> => {
  const wasmHashes = await integration.getTxWasmHashes(chainId);
  if (!wasmHashes || wasmHashes.length === 0) {
    const { rpc } = await getSdkInstance();
    const hashes = await rpc.queryWasmHashes();
    if (hashes && hashes.length > 0) {
      await integration.addTxWasmHashes(chainId, hashes);
    }
    return hashes;
  }
  return wasmHashes;
};
