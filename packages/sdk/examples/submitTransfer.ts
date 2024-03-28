import BigNumber from "bignumber.js";

import { getSdk } from "indexNode";
import initSync from "../src/initNode";

export const submitTransfer = async (
  nodeUrl: string,
  nativeToken: string,
  tx: {
    chainId: string;
    publicKey: string;
  },
  transfer: {
    source: string;
    target: string;
    amount: BigNumber;
  },
  signingKey: string
): Promise<void> => {
  const { chainId, publicKey } = tx;
  const { source, target, amount } = transfer;

  const txMsgValue = {
    token: nativeToken,
    feeAmount: BigNumber(5),
    gasLimit: BigNumber(20_000),
    chainId,
    publicKey,
  };
  const transferMsgValue = {
    source,
    target,
    token: nativeToken,
    amount,
    nativeToken,
  };

  try {
    const { cryptoMemory } = initSync();
    const sdk = await getSdk(cryptoMemory, nodeUrl, nativeToken);

    console.log("Revealing public key...");
    await sdk.tx.revealPk(signingKey, txMsgValue);

    console.log("Building transfer transaction...");
    const encodedTx = await sdk.tx.buildTransfer(txMsgValue, transferMsgValue);

    console.log("Signing transaction...");
    const signedTx = await sdk.tx.signTx(encodedTx, signingKey);

    console.log("Broadcasting transaction...");
    await sdk.rpc.broadcastTx(signedTx);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
  }
};
