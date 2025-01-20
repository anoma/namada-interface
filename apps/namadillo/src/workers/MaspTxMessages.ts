import {
  Account,
  ShieldedTransferMsgValue,
  ShieldingTransferMsgValue,
  TxResponseMsgValue,
  UnshieldingTransferMsgValue,
} from "@namada/types";
import { EncodedTxData, TransactionPair } from "lib/query";
import { ChainSettings, GasConfig } from "types";
import { WebWorkerMessage } from "./utils";

type InitPayload = {
  rpcUrl: string;
  maspIndexerUrl: string;
  token: string;
};

export type Init = WebWorkerMessage<"init", InitPayload>;
export type InitDone = WebWorkerMessage<"init-done", null>;

type ShieldPayload = {
  account: Account;
  gasConfig: GasConfig;
  props: ShieldingTransferMsgValue[];
  chain: ChainSettings;
  publicKeyRevealed: boolean;
  memo?: string;
};
export type Shield = WebWorkerMessage<"shield", ShieldPayload>;
export type ShieldDone = WebWorkerMessage<
  "shield-done",
  EncodedTxData<ShieldingTransferMsgValue>
>;

type UnshieldPayload = {
  account: Account;
  gasConfig: GasConfig;
  props: UnshieldingTransferMsgValue[];
  chain: ChainSettings;
  memo?: string;
};
export type Unshield = WebWorkerMessage<"unshield", UnshieldPayload>;
export type UnshieldDone = WebWorkerMessage<
  "unshield-done",
  EncodedTxData<UnshieldingTransferMsgValue>
>;

type ShieldedTransferPayload = {
  account: Account;
  gasConfig: GasConfig;
  props: ShieldedTransferMsgValue[];
  chain: ChainSettings;
  memo?: string;
};
export type ShieldedTransfer = WebWorkerMessage<
  "shielded-transfer",
  ShieldedTransferPayload
>;
export type ShieldedTransferDone = WebWorkerMessage<
  "shielded-transfer-done",
  EncodedTxData<ShieldedTransferMsgValue>
>;

type BroadcastPayload = TransactionPair<unknown>;

export type Broadcast = WebWorkerMessage<"broadcast", BroadcastPayload>;
export type BroadcastDone = WebWorkerMessage<
  "broadcast-done",
  TxResponseMsgValue[]
>;

export type ShieldMessageIn = Shield | ShieldedTransfer | Broadcast | Init;
export type ShieldMessageOut =
  | ShieldDone
  | ShieldedTransferDone
  | BroadcastDone
  | InitDone;
