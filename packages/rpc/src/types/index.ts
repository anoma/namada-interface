import { BroadcastTxSyncResponse } from "@cosmjs/tendermint-rpc";
import { JsonRpcSuccessResponse } from "@cosmjs/json-rpc";
import { SubscriptionEvent } from "@cosmjs/tendermint-rpc/build/rpcclients";

export type AbciResponse = {
  code?: number;
  codespace?: string;
  height?: string;
  index?: string;
  info?: string;
  key?: string;
  log?: string;
  proofOps?: string;
  value?: string;
};

export interface BroadcastSyncResponse extends JsonRpcSuccessResponse {
  result: BroadcastTxSyncResponse;
}

export type SubscriptionParams = {
  onBroadcast?: (response: BroadcastSyncResponse) => void;
  onNext?: (txEvent: SubscriptionEvent) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
};

export interface SubscriptionEvents extends SubscriptionEvent {
  events: NewBlockEvents;
}

export type Attribute = {
  index: boolean;
  key: string;
  value: string;
};

export type Event = {
  attributes: Attribute[];
  type: string;
};

export type NewBlockEvents = [Event, Event];

export type Events = Record<string, string>;

export type JsonCompatibleArray = (string | number | boolean)[];
export type JsonCompatibleDictionary = {
  [key: string]: string | JsonCompatibleArray;
};

// Ledger storage keys
export enum PathType {
  Value = "value",
  Prefix = "prefix",
  HasKey = "value",
}
