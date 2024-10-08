import { Configuration, DefaultApi } from "@anomaorg/namada-indexer-client";
import { initMulticore } from "@heliax/namada-sdk/inline-init";
import * as Comlink from "comlink";

import { getSdk, Sdk } from "@heliax/namada-sdk/web";
import { ShieldingTransferMsgValue } from "@namada/types";
import { buildTx, EncodedTxData } from "lib/query";
import {
  Broadcast,
  BroadcastDone,
  Init,
  Shield,
  ShieldDone,
} from "./ShieldMessages";
import { registerBNTransferHandler } from "./utils";

// TODO: replace with Class
const worker = {
  sdk: undefined as Sdk | undefined,
  async init(m: Init) {
    const { cryptoMemory } = await initMulticore();
    this.sdk = newSdk(cryptoMemory, m.payload);
    return { type: "init-done", payload: null };
  },
  async shield(m: Shield): Promise<ShieldDone> {
    if (!this.sdk) {
      throw new Error("SDK is not initialized");
    }
    return {
      type: "shield-done",
      payload: await shield(this.sdk, m.payload),
    };
  },
  async broadcast(m: Broadcast): Promise<BroadcastDone> {
    if (!this.sdk) {
      throw new Error("SDK is not initialized");
    }
    await broadcast(this.sdk, m.payload);
    return { type: "broadcast-done", payload: null };
  },
};

async function shield(
  sdk: Sdk,
  payload: Shield["payload"]
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
async function broadcast(
  sdk: Sdk,
  payload: Broadcast["payload"]
): Promise<void> {
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

function newSdk(
  cryptoMemory: WebAssembly.Memory,
  payload: Init["payload"]
): Sdk {
  const { rpcUrl, token } = payload;
  return getSdk(cryptoMemory, rpcUrl, "", "", token);
}

export const registerTransferHandlers = (): void => {
  registerBNTransferHandler<ShieldDone>("shield-done");
  registerBNTransferHandler<Shield>("shield");
  registerBNTransferHandler<Broadcast>("broadcast");
};

export type ShieldWorkerApi = typeof worker;

registerTransferHandlers();
Comlink.expose(worker);
