import { initMulticore } from "@namada/sdk/inline-init";
import { getSdk, Sdk, SdkEvents } from "@namada/sdk/web";
import * as Comlink from "comlink";
import { Init, InitDone, Sync, SyncDone } from "./ShieldedSyncMessages";

export type ProgressBarStarted = {
  type: SdkEvents.ProgressBarStarted;
  name: string;
};
export type ProgressBarIncremented = {
  type: SdkEvents.ProgressBarIncremented;
  name: string;
  current: number;
  total: number;
};

export type ProgressBarFinished = {
  type: SdkEvents.ProgressBarFinished;
  name: string;
};
export type Events =
  | ProgressBarStarted
  | ProgressBarIncremented
  | ProgressBarFinished;

export class Worker {
  private sdk: Sdk | undefined;

  async init(m: Init): Promise<InitDone> {
    const { cryptoMemory } = await initMulticore();
    this.sdk = newSdk(cryptoMemory, m.payload);

    // TODO: this can be reduced to one event listener
    addEventListener(SdkEvents.ProgressBarStarted, (e) => {
      const event = e as CustomEvent<string>;
      const payload = JSON.parse(event.detail);
      postMessage({ ...payload, type: SdkEvents.ProgressBarStarted });
    });

    addEventListener(SdkEvents.ProgressBarIncremented, (e) => {
      const event = e as CustomEvent<string>;
      const payload = JSON.parse(event.detail);
      postMessage({ ...payload, type: SdkEvents.ProgressBarIncremented });
    });

    addEventListener(SdkEvents.ProgressBarFinished, (e) => {
      const event = e as CustomEvent<string>;
      const payload = JSON.parse(event.detail);
      postMessage({ ...payload, type: SdkEvents.ProgressBarFinished });
    });

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
