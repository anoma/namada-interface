import * as Comlink from "comlink";

import { Balance, SdkEvents } from "@namada/sdk/web";
import { getDefaultStore } from "jotai";
import { getSdkInstance } from "utils/sdk";
import { Worker as ShieldedSyncWorkerApi } from "workers/ShieldedSyncWorker";
import ShieldedSyncWorker from "workers/ShieldedSyncWorker?worker";
// TODO: circular dependency
import { shieldedSyncProgressAtom } from "./atoms";

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

export const shieldedSync = async (
  rpcUrl: string,
  maspIndexerUrl: string,
  token: string,
  viewingKeys: string[]
): Promise<void> => {
  const worker = new ShieldedSyncWorker();
  const shieldedSyncWorker = Comlink.wrap<ShieldedSyncWorkerApi>(worker);

  worker.onmessage = (event) => {
    const store = getDefaultStore();
    const { data } = event;

    if (SdkEvents.ProgressBarStarted === data.type) {
      store.set(shieldedSyncProgressAtom(data.payload.name), {
        status: "loading",
        current: 0,
        total: 0,
      });
    } else if (SdkEvents.ProgressBarIncremented === data.type) {
      const { name, current, total } = data.payload;

      store.set(shieldedSyncProgressAtom(name), {
        status: "loading",
        current,
        total,
      });
    } else if (SdkEvents.ProgressBarFinished === data.type) {
      store.set(shieldedSyncProgressAtom(data.payload.name), {
        status: "success",
        current: 0,
        total: 0,
      });
    }
  };

  await shieldedSyncWorker.init({
    type: "init",
    payload: {
      rpcUrl,
      maspIndexerUrl,
      token,
    },
  });

  await shieldedSyncWorker.sync({
    type: "sync",
    payload: {
      vks: viewingKeys,
    },
  });

  worker.terminate();
};

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
