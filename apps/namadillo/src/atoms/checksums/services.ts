import { WasmHash } from "@namada/types";
import { getSdkInstance } from "hooks";

export const fetchWasmHashes = async (): Promise<WasmHash[]> => {
  const sdk = await getSdkInstance();
  const { rpc } = sdk;
  const hashes = await rpc.queryWasmHashes();
  return hashes;
};
