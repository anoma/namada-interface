import { getSdk } from "indexNode";
import initSync from "../src/initNode";

/**
 *
 * @param nodeUrl
 * @param owner
 * @param nativeToken
 * @param token
 */
export const queryBalance = async (
  nodeUrl: string,
  nativeToken: string,
  owner: string,
  token: string
): Promise<void> => {
  try {
    const { cryptoMemory } = initSync();
    const sdk = await getSdk(cryptoMemory, nodeUrl, nativeToken);
    const [[t, a]] = await sdk.rpc.queryBalance(owner, [token]);
    console.log(`Balance for ${owner} - Token: ${t} - Amount: ${a}`);
  } catch (error) {
    console.error("Error:", error);
  }
};
