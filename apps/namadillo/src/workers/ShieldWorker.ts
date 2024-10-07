import { Configuration, DefaultApi } from "@anomaorg/namada-indexer-client";
import { initMulticore } from "@heliax/namada-sdk/inline-init";

import { getSdk, Sdk } from "@heliax/namada-sdk/web";
import { Account, ShieldingTransferMsgValue } from "@namada/types";
import BigNumber from "bignumber.js";
import { buildTx, EncodedTxData } from "lib/query";
import registerPromiseWorker from "promise-worker/register";
import { ChainSettings } from "types";

export type InitPayload = {
  rpcUrl: string;
  token: string;
};

export type ShieldPayload = {
  account: Account;
  gasConfig: {
    gasLimit: BigNumber;
    gasPrice: BigNumber;
  };
  shieldingProps: ShieldingTransferMsgValue[];
  chain: ChainSettings;
  indexerUrl: string;
};

export type BroadcastPayload = {
  encodedTx: EncodedTxData<ShieldingTransferMsgValue>;
  signedTxs: Uint8Array[];
};

export type Init = {
  type: "init";
  payload: InitPayload;
};

export type Shield = {
  type: "shield";
  payload: ShieldPayload;
};

export type Broadcast = {
  type: "broadcast";
  payload: BroadcastPayload;
};

export type ShieldMessageType = Shield | Broadcast | Init;

let sdk: Sdk | undefined;

registerPromiseWorker(async (m: ShieldMessageType) => {
  const { type, payload } = m;

  switch (type) {
    case "init": {
      const { cryptoMemory } = await initMulticore();
      sdk = newSdk(cryptoMemory, payload);
      break;
    }
    case "shield": {
      if (!sdk) {
        throw new Error("SDK is not initialized");
      }
      return await shield(sdk, payload);
    }
    case "broadcast": {
      if (!sdk) {
        throw new Error("SDK is not initialized");
      }
      await broadcast(sdk, payload);
      break;
    }

    default:
      throw new Error(`Unknown message type: ${type}`);
  }
});

async function shield(
  sdk: Sdk,
  payload: ShieldPayload
): Promise<EncodedTxData<ShieldingTransferMsgValue>> {
  const { indexerUrl, account, gasConfig, chain, shieldingProps } = payload;

  const configuration = new Configuration({ basePath: indexerUrl });
  const api = new DefaultApi(configuration);
  const publicKeyRevealed = (
    await api.apiV1RevealedPublicKeyAddressGet(account.address)
  ).data.publicKey;

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

  return encodedTxData;
}

// TODO: We will probably move this to the separate worker
async function broadcast(sdk: Sdk, payload: BroadcastPayload): Promise<void> {
  const { encodedTx, signedTxs } = payload;

  signedTxs.forEach(async (signedTx) => {
    encodedTx.txs.forEach(async () => {
      const _response = await sdk.rpc.broadcastTx(
        signedTx,
        encodedTx.wrapperTxProps
      );
    });
  });
}

function newSdk(cryptoMemory: WebAssembly.Memory, payload: InitPayload): Sdk {
  const { rpcUrl, token } = payload;
  return getSdk(cryptoMemory, rpcUrl, "", "", token);
}
