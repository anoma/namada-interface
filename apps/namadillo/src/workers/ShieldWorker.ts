import { Configuration, DefaultApi } from "@anomaorg/namada-indexer-client";
import { initMulticore } from "@heliax/namada-sdk/inline-init";

import { getSdk } from "@heliax/namada-sdk/web";
import { Account, ShieldingTransferMsgValue } from "@namada/types";
import BigNumber from "bignumber.js";
import { buildTx, EncodedTxData } from "lib/query";
import { ChainSettings } from "types";

export type ShieldPayload = {
  account: Account;
  gasConfig: {
    gasLimit: BigNumber;
    gasPrice: BigNumber;
  };
  shieldingProps: ShieldingTransferMsgValue[];
  rpcUrl: string;
  indexerUrl: string;
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
  const {
    rpcUrl,
    indexerUrl,
    token,
    account,
    gasConfig,
    chain,
    shieldingProps,
  } = payload;

  const configuration = new Configuration({ basePath: indexerUrl });
  const api = new DefaultApi(configuration);
  const publicKeyRevealed = (
    await api.apiV1RevealedPublicKeyAddressGet(account.address)
  ).data.publicKey;

  const sdk = getSdk(
    cryptoMemory,
    rpcUrl,
    "",
    "",
    // Not really used, but required by the SDK, as long as it's valid address it's fine
    token
  );

  await sdk.masp.loadMaspParams("");
  const encodedTxData = await buildTx<ShieldingTransferMsgValue>(
    sdk,
    account,
    gasConfig,
    chain,
    shieldingProps,
    sdk.tx.buildShieldingTransfer,
    Boolean(publicKeyRevealed)
  );

  const event: EncodedShieldTransferEvent = {
    type: "encoded-shield-transfer",
    payload: encodedTxData,
  };

  postMessage(event);
}
