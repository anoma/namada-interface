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

  const wrapperTxMsgValue = {
    token: nativeToken,
    feeAmount: BigNumber(5),
    gasLimit: BigNumber(20_000),
    chainId,
    publicKey,
  };
  const transparentTransferMsgValue = {
    source,
    target,
    token: nativeToken,
    amount,
    nativeToken,
  };

  try {
    const { cryptoMemory } = initSync();
    const sdk = getSdk(cryptoMemory, nodeUrl, "storage path", nativeToken);

    console.log("Building transfer transaction...");
    const encodedTx = await sdk.tx.buildTransparentTransfer(wrapperTxMsgValue, {
      data: [transparentTransferMsgValue],
    });

    console.log("Signing transaction...");
    const signedTx = await sdk.signing.sign(encodedTx.tx, signingKey);

    console.log("Broadcasting transaction...");
    await sdk.rpc.broadcastTx({
      wrapperTxMsg: encodedTx.wrapperTxMsg,
      tx: signedTx,
    });
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
  }
};
