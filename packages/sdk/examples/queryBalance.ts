import initSync from "../src/initSync";

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
    const sdk = initSync(nodeUrl, nativeToken);
    const [[t, a]] = await sdk.rpc.queryBalance(owner, [token]);
    console.log(`Balance for ${owner} - Token: ${t} - Amount: ${a}`);
  } catch (error) {
    console.error("Error:", error);
  }
};
