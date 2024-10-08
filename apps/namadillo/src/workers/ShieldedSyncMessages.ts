import { WebWorkerMessage } from "./utils";

type InitPayload = {
  rpcUrl: string;
  token: string;
  maspIndexerUrl?: string;
};
export type Init = WebWorkerMessage<"init", InitPayload>;
export type InitDone = WebWorkerMessage<"init-done", null>;

type ShiededSyncPayload = {
  vks: string[];
};
export type Sync = WebWorkerMessage<"sync", ShiededSyncPayload>;
export type SyncDone = WebWorkerMessage<"sync-done", null>;

export type ShieldMessageIn = Init | Sync;
export type ShieldMessageOut = InitDone | SyncDone;
