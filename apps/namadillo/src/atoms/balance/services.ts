import * as Comlink from "comlink";
import { EventEmitter } from "events";

import { Balance } from "@namada/sdk/web";
import { getSdkInstance } from "utils/sdk";
import {
  Events,
  ProgressBarFinished,
  ProgressBarIncremented,
  ProgressBarStarted,
  Worker as ShieldedSyncWorkerApi,
} from "workers/ShieldedSyncWorker";
import ShieldedSyncWorker from "workers/ShieldedSyncWorker?worker";

const sqsOsmosisApi = "https://sqs.osmosis.zone";

// ref: https://sqs.osmosis.zone/swagger/index.html#/default/get_tokens_prices
export const fetchCoinPrices = async (
  assetBaseList: string[]
): Promise<Record<string, { [usdcAddress: string]: string }>> =>
  assetBaseList.length ?
    fetch(
      `${sqsOsmosisApi}/tokens/prices?base=${assetBaseList.sort((a, b) => a.localeCompare(b)).join(",")}`
    ).then((res) => res.json())
  : [];

export type ShieldedSyncEventMap = Record<
  string,
  (ProgressBarStarted | ProgressBarIncremented | ProgressBarFinished)[]
>;

export function shieldedSync(
  rpcUrl: string,
  maspIndexerUrl: string,
  token: string,
  viewingKeys: string[]
): EventEmitter<ShieldedSyncEventMap> {
  const worker = new ShieldedSyncWorker();
  const shieldedSyncWorker = Comlink.wrap<ShieldedSyncWorkerApi>(worker);
  const emitter = new EventEmitter<ShieldedSyncEventMap>();

  worker.onmessage = (event: MessageEvent<Events>) => {
    emitter.emit(event.data.type, event.data);
  };

  (async () => {
    await shieldedSyncWorker.init({
      type: "init",
      payload: { rpcUrl, maspIndexerUrl, token },
    });

    await shieldedSyncWorker.sync({
      type: "sync",
      payload: { vks: viewingKeys },
    });

    worker.terminate();
  })();

  return emitter;
}

export const fetchShieldedBalance = async (
  viewingKey: string,
  addresses: string[]
): Promise<Balance> => {
  // TODO mock shielded balance
  // return await mockShieldedBalance(viewingKey);

  const sdk = await getSdkInstance();
  return await sdk.rpc.queryBalance(viewingKey, addresses);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockShieldedBalance = async (viewingKey: string): Promise<Balance> => {
  await new Promise((r) => setTimeout(() => r(0), 500));
  getSdkInstance().then((sdk) => sdk.rpc.shieldedSync([viewingKey]));
  return [
    ["tnam1qy440ynh9fwrx8aewjvvmu38zxqgukgc259fzp6h", "37"], // nam
    ["tnam1p5nnjnasjtfwen2kzg78fumwfs0eycqpecuc2jwz", "1"], // uatom
  ];
};
