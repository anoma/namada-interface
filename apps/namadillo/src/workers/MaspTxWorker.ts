import { Configuration, DefaultApi } from "@namada/indexer-client";
import { initMulticore } from "@namada/sdk/inline-init";
import { getSdk, Sdk } from "@namada/sdk/web";
import {
  ShieldedTransferMsgValue,
  ShieldingTransferMsgValue,
  TxResponseMsgValue,
  UnshieldingTransferMsgValue,
} from "@namada/types";
import * as Comlink from "comlink";
import { buildTx, EncodedTxData } from "lib/query";
import {
  Broadcast,
  BroadcastDone,
  Init,
  InitDone,
  Shield,
  ShieldDone,
  ShieldedTransfer,
  ShieldedTransferDone,
  Unshield,
  UnshieldDone,
} from "./MaspTxMessages";
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

  async unshield(m: Unshield): Promise<UnshieldDone> {
    if (!this.sdk) {
      throw new Error("SDK is not initialized");
    }
    return {
      type: "unshield-done",
      payload: await unshield(this.sdk, m.payload),
    };
  }

  async shieldedTransfer(m: ShieldedTransfer): Promise<ShieldedTransferDone> {
    if (!this.sdk) {
      throw new Error("SDK is not initialized");
    }
    return {
      type: "shielded-transfer-done",
      payload: await shieldedTransfer(this.sdk, m.payload),
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

async function unshield(
  sdk: Sdk,
  payload: Unshield["payload"]
): Promise<EncodedTxData<UnshieldingTransferMsgValue>> {
  const { account, gasConfig, chain, unshieldingProps, vks } = payload;

  await sdk.rpc.shieldedSync(vks);
  await sdk.masp.loadMaspParams("");

  const encodedTxData = await buildTx<UnshieldingTransferMsgValue>(
    sdk,
    account,
    gasConfig,
    chain,
    unshieldingProps,
    sdk.tx.buildUnshieldingTransfer,
    true
  );

  return encodedTxData;
}

async function shieldedTransfer(
  sdk: Sdk,
  payload: ShieldedTransfer["payload"]
): Promise<EncodedTxData<ShieldedTransferMsgValue>> {
  const { account, gasConfig, chain, shieldingProps, vks } = payload;

  await sdk.rpc.shieldedSync(vks);
  await sdk.masp.loadMaspParams("");

  const encodedTxData = await buildTx<ShieldedTransferMsgValue>(
    sdk,
    account,
    gasConfig,
    chain,
    shieldingProps,
    sdk.tx.buildShieldedTransfer,
    true
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
  const { rpcUrl, token, maspIndexerUrl } = payload;
  return getSdk(cryptoMemory, rpcUrl, maspIndexerUrl, "", token);
}

export const registerTransferHandlers = (): void => {
  registerBNTransferHandler<ShieldDone>("shield-done");
  registerBNTransferHandler<Shield>("shield");
  registerBNTransferHandler<ShieldedTransferDone>("shielded-transfer-done");
  registerBNTransferHandler<ShieldedTransfer>("shielded-transfer");
  registerBNTransferHandler<UnshieldDone>("unshield-done");
  registerBNTransferHandler<Unshield>("unshield");
  registerBNTransferHandler<Broadcast>("broadcast");
};

registerTransferHandlers();
Comlink.expose(new Worker());
