import { initMulticore } from "@namada/sdk/inline-init";
import { getSdk, Sdk, SdkEvents } from "@namada/sdk/web";
import * as Comlink from "comlink";
import { Init, InitDone, Sync, SyncDone } from "./ShieldedSyncMessages";

export type Events =
  | { type: SdkEvents.ProgressBarStarted; payload: { name: string } }
  | {
      type: SdkEvents.ProgressBarIncremented;
      payload: { name: string; current: number; total: number };
    }
  | { type: SdkEvents.ProgressBarFinished; payload: { name: string } };

export class Worker {
  private sdk: Sdk | undefined;

  async init(m: Init): Promise<InitDone> {
    const { cryptoMemory } = await initMulticore();
    this.sdk = newSdk(cryptoMemory, m.payload);

    addEventListener(SdkEvents.ProgressBarStarted, (data) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = JSON.parse((data as any).detail);
      postMessage({ type: SdkEvents.ProgressBarStarted, payload });
    });

    addEventListener(SdkEvents.ProgressBarIncremented, (data) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = JSON.parse((data as any).detail);
      postMessage({ type: SdkEvents.ProgressBarIncremented, payload });
    });

    addEventListener(SdkEvents.ProgressBarFinished, (data) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = JSON.parse((data as any).detail);
      postMessage({ type: SdkEvents.ProgressBarFinished, payload });
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
