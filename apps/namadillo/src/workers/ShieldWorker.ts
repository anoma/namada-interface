import { Configuration, DefaultApi } from "@namada/indexer-client";
import { initMulticore } from "@namada/sdk/inline-init";
import { getSdk, Sdk } from "@namada/sdk/web";
import { ShieldingTransferMsgValue, TxResponseMsgValue } from "@namada/types";
import * as Comlink from "comlink";
import { buildTx, EncodedTxData } from "lib/query";
import {
  Broadcast,
  BroadcastDone,
  Init,
  InitDone,
  Shield,
  ShieldDone,
} from "./ShieldMessages";
import { registerBNTransferHandler } from "./utils";

export class Worker {
  private sdk: Sdk | undefined;

  async init(m: Init): Promise<InitDone> {
    const { cryptoMemory } = await initMulticore();
    this.sdk = newSdk(cryptoMemory, m.payload);
    return { type: "init-done", payload: null };
  }

  async shield(m: Shield): Promise<ShieldDone> {
    if (!this.sdk) {
      throw new Error("SDK is not initialized");
    }
    return {
      type: "shield-done",
      payload: await shield(this.sdk, m.payload),
    };
  }

  async broadcast(m: Broadcast): Promise<BroadcastDone> {
    if (!this.sdk) {
      throw new Error("SDK is not initialized");
    }

    const res = await broadcast(this.sdk, m.payload);

    return { type: "broadcast-done", payload: res };
  }
}

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
): Promise<TxResponseMsgValue[]> {
  const { encodedTx, signedTxs } = payload;

  const result: TxResponseMsgValue[] = [];

  for await (const signedTx of signedTxs) {
    for await (const _ of encodedTx.txs) {
      const response = await sdk.rpc.broadcastTx(
        signedTx,
        encodedTx.wrapperTxProps
      );
      result.push(response);
    }
  }
  return result;
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

registerTransferHandlers();
Comlink.expose(new Worker());
