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

  const wrapperTxProps = {
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
    const sdk = getSdk(cryptoMemory, nodeUrl, "", "storage path", nativeToken);

    const encodedTx = await sdk.tx.buildTransparentTransfer(wrapperTxProps, {
      data: [transparentTransferMsgValue],
    });

    const signedTx = await sdk.signing.sign(encodedTx, signingKey);

    await sdk.rpc
      .broadcastTx(signedTx)
      .then((txReponse) => console.log(txReponse));
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
  }
};
