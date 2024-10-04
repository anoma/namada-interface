import { initMulticore } from "@heliax/namada-sdk/inline-init";

import { getSdk } from "@heliax/namada-sdk/web";
import { Account, ShieldingTransferMsgValue } from "@namada/types";
import BigNumber from "bignumber.js";
import { buildTx2, EncodedTxData } from "lib/build";
import { ChainSettings } from "types";

export type ShieldPayload = {
  account: Account;
  gasConfig: {
    gasLimit: number;
    gasPrice: number;
  };
  shieldingProps: ShieldingTransferMsgValue[];
  rpcUrl: string;
  token: string;
  chain: ChainSettings;
};

export type Shield = {
  type: "shield";
  payload: ShieldPayload;
};

export type ShieldMessageType = Shield;

export type EncodedShieldTransferEvent = {
  type: "encoded-shield-transfer";
  payload: EncodedTxData<ShieldingTransferMsgValue>;
};

export type ShieldEvent = EncodedShieldTransferEvent;

self.onmessage = async (e: MessageEvent<Shield>) => {
  const { type, payload } = e.data;

  switch (type) {
    case "shield": {
      const { cryptoMemory } = await initMulticore();
      await shield(cryptoMemory, payload);
      break;
    }

    default:
      throw new Error(`Unknown message type: ${type}`);
  }
};

async function shield(
  cryptoMemory: WebAssembly.Memory,
  payload: ShieldPayload
): Promise<void> {
  console.log("payload", payload);
  const { rpcUrl, token, account, gasConfig, chain, shieldingProps } = payload;
  const www = {
    target: shieldingProps[0].target,
    data: [
      {
        ...shieldingProps[0].data[0],
        amount: new BigNumber(shieldingProps[0].data[0].amount),
      },
    ],
  };

  const sdk = getSdk(
    cryptoMemory,
    rpcUrl,
    "",
    "",
    // Not really used, but required by the SDK, as long as it's valid address it's fine
    token
  );
  console.log("sdk", sdk);

  await sdk.masp.loadMaspParams("");
  const encodedTxData = await buildTx2<ShieldingTransferMsgValue>(
    sdk,
    account,
    // TODO: focking prototype xddd
    {
      gasLimit: BigNumber(gasConfig.gasLimit),
      gasPrice: BigNumber(gasConfig.gasPrice),
    },
    chain,
    [www],
    sdk.tx.buildShieldingTransfer
  );

  const event: EncodedShieldTransferEvent = {
    type: "encoded-shield-transfer",
    payload: encodedTxData,
  };

  postMessage(event);
}
