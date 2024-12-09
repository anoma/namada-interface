import BigNumber from "bignumber.js";

import {
  Account,
  ShieldedTransferMsgValue,
  ShieldingTransferMsgValue,
  TxResponseMsgValue,
  UnshieldingTransferMsgValue,
} from "@namada/types";
import { EncodedTxData } from "lib/query";
import { ChainSettings } from "types";
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
  gasConfig: {
    gasLimit: BigNumber;
    gasPrice: BigNumber;
  };
  shieldingProps: ShieldingTransferMsgValue[];
  chain: ChainSettings;
  indexerUrl: string;
};
export type Shield = WebWorkerMessage<"shield", ShieldPayload>;
export type ShieldDone = WebWorkerMessage<
  "shield-done",
  EncodedTxData<ShieldingTransferMsgValue>
>;

type UnshieldPayload = {
  account: Account;
  gasConfig: {
    gasLimit: BigNumber;
    gasPrice: BigNumber;
  };
  unshieldingProps: UnshieldingTransferMsgValue[];
  chain: ChainSettings;
  indexerUrl: string;
  vks: string[];
};
export type Unshield = WebWorkerMessage<"unshield", UnshieldPayload>;
export type UnshieldDone = WebWorkerMessage<
  "unshield-done",
  EncodedTxData<UnshieldingTransferMsgValue>
>;

type ShieldedTransferPayload = {
  account: Account;
  gasConfig: {
    gasLimit: BigNumber;
    gasPrice: BigNumber;
  };
  shieldingProps: ShieldedTransferMsgValue[];
  chain: ChainSettings;
  vks: string[];
};
export type ShieldedTransfer = WebWorkerMessage<
  "shielded-transfer",
  ShieldedTransferPayload
>;
export type ShieldedTransferDone = WebWorkerMessage<
  "shielded-transfer-done",
  EncodedTxData<ShieldedTransferMsgValue>
>;

type BroadcastPayload = {
  encodedTx: EncodedTxData<unknown>;
  signedTxs: Uint8Array[];
};
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
