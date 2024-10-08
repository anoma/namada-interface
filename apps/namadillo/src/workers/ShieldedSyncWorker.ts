import { initMulticore } from "@heliaxdev/namada-sdk/inline-init";
import { getSdk, Sdk } from "@heliaxdev/namada-sdk/web";
import * as Comlink from "comlink";
import { Init, InitDone, Sync, SyncDone } from "./ShieldedSyncMessages";

export class Worker {
  private sdk: Sdk | undefined;

  async init(m: Init): Promise<InitDone> {
    const { cryptoMemory } = await initMulticore();
    this.sdk = newSdk(cryptoMemory, m.payload);
    return { type: "init-done", payload: null };
  }

  async sync(m: Sync): Promise<SyncDone> {
    if (!this.sdk) {
      throw new Error("SDK is not initialized");
    }

    await shieldedSync(this.sdk, m.payload);
    return { type: "sync-done", payload: null };
  }
}

function newSdk(
  cryptoMemory: WebAssembly.Memory,
  payload: Init["payload"]
): Sdk {
  const { rpcUrl, token, maspIndexerUrl } = payload;
  return getSdk(cryptoMemory, rpcUrl, maspIndexerUrl || "", "", token);
}

async function shieldedSync(sdk: Sdk, payload: Sync["payload"]): Promise<void> {
  await sdk.rpc.shieldedSync(payload.vks);
}

Comlink.expose(new Worker());
