import * as Comlink from "comlink";
import { EventEmitter } from "events";

import { Balance, SdkEvents } from "@namada/sdk/web";
import { getSdkInstance } from "utils/sdk";
import {
  Events,
  ProgressBarFinished,
  ProgressBarIncremented,
  ProgressBarStarted,
  Worker as ShieldedSyncWorkerApi,
} from "workers/ShieldedSyncWorker";
import ShieldedSyncWorker from "workers/ShieldedSyncWorker?worker";
// TODO: move to @namada/types?
import { DefaultApi } from "@namada/indexer-client";
import { DatedViewingKey } from "@namada/types";

export type ShieldedSyncEventMap = {
  [SdkEvents.ProgressBarStarted]: ProgressBarStarted[];
  [SdkEvents.ProgressBarIncremented]: ProgressBarIncremented[];
  [SdkEvents.ProgressBarFinished]: ProgressBarFinished[];
};

export type ShieldedSyncEmitter = EventEmitter<ShieldedSyncEventMap>;

let shieldedSyncEmitter: ShieldedSyncEmitter | undefined;

export function shieldedSync(
  rpcUrl: string,
  maspIndexerUrl: string,
  token: string,
  viewingKeys: DatedViewingKey[],
  chainId: string
): EventEmitter<ShieldedSyncEventMap> {
  // Only one sync process at a time
  if (shieldedSyncEmitter) {
    return shieldedSyncEmitter;
  }

  const worker = new ShieldedSyncWorker();
  const shieldedSyncWorker = Comlink.wrap<ShieldedSyncWorkerApi>(worker);
  shieldedSyncEmitter = new EventEmitter<ShieldedSyncEventMap>();

  worker.onmessage = (event: MessageEvent<Events>) => {
    if (!shieldedSyncEmitter) {
      return;
    }
    if (event.data.type === SdkEvents.ProgressBarStarted) {
      shieldedSyncEmitter.emit(event.data.type, event.data);
    }
    if (event.data.type === SdkEvents.ProgressBarIncremented) {
      shieldedSyncEmitter.emit(event.data.type, event.data);
    }
    if (event.data.type === SdkEvents.ProgressBarFinished) {
      shieldedSyncEmitter.emit(event.data.type, event.data);
    }
  };

  (async () => {
    try {
      await shieldedSyncWorker.init({
        type: "init",
        payload: { rpcUrl, maspIndexerUrl, token },
      });
      await shieldedSyncWorker.sync({
        type: "sync",
        payload: { vks: viewingKeys, chainId },
      });
    } finally {
      worker.terminate();
      shieldedSyncEmitter = undefined;
    }
  })();

  return shieldedSyncEmitter;
}

export const fetchShieldedBalance = async (
  viewingKey: DatedViewingKey,
  addresses: string[],
  chainId: string
): Promise<Balance> => {
  const sdk = await getSdkInstance();
  return await sdk.rpc.queryBalance(viewingKey.key, addresses, chainId);
};

export const fetchBlockHeightByTimestamp = async (
  api: DefaultApi,
  timestamp: number
): Promise<number> => {
  const response = await api.apiV1BlockTimestampValueGet(timestamp);

  return Number(response.data.height);
};
