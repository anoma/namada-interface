import BigNumber from "bignumber.js";

import {
  Account,
  TxResponseMsgValue,
  UnshieldingTransferMsgValue,
} from "@namada/types";
import { EncodedTxData } from "lib/query";
import { ChainSettings } from "types";
import { WebWorkerMessage } from "./utils";

type InitPayload = {
  rpcUrl: string;
  token: string;
};

export type Init = WebWorkerMessage<"init", InitPayload>;
export type InitDone = WebWorkerMessage<"init-done", null>;

type UnshieldPayload = {
  account: Account;
  gasConfig: {
    gasLimit: BigNumber;
    gasPrice: BigNumber;
  };
  unshieldingProps: UnshieldingTransferMsgValue[];
  chain: ChainSettings;
  indexerUrl: string;
};
export type Unshield = WebWorkerMessage<"unshield", UnshieldPayload>;
export type UnshieldDone = WebWorkerMessage<
  "unshield-done",
  EncodedTxData<UnshieldingTransferMsgValue>
>;

type BroadcastPayload = {
  encodedTx: EncodedTxData<UnshieldingTransferMsgValue>;
  signedTxs: Uint8Array[];
};
export type Broadcast = WebWorkerMessage<"broadcast", BroadcastPayload>;
export type BroadcastDone = WebWorkerMessage<
  "broadcast-done",
  TxResponseMsgValue[]
>;

export type UnshieldMessageIn = Unshield | Broadcast | Init;
export type UnshieldMessageOut = UnshieldDone | BroadcastDone | InitDone;
