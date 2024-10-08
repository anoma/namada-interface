import BigNumber from "bignumber.js";

import { Account, ShieldingTransferMsgValue } from "@namada/types";
import { EncodedTxData } from "lib/query";
import { ChainSettings } from "types";
import { WebWorkerMessage } from "./utils";

type InitPayload = {
  rpcUrl: string;
  token: string;
};

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

type BroadcastPayload = {
  encodedTx: EncodedTxData<ShieldingTransferMsgValue>;
  signedTxs: Uint8Array[];
};

export type Init = WebWorkerMessage<"init", InitPayload>;
export type InitDone = WebWorkerMessage<"init-done", null>;

export type Shield = WebWorkerMessage<"shield", ShieldPayload>;
export type ShieldDone = WebWorkerMessage<
  "shield-done",
  EncodedTxData<ShieldingTransferMsgValue>
>;

export type Broadcast = WebWorkerMessage<"broadcast", BroadcastPayload>;
export type BroadcastDone = WebWorkerMessage<"broadcast-done", null>;

export type ShieldMessageIn = Shield | Broadcast | Init;
export type ShieldMessageOut = ShieldDone | BroadcastDone | InitDone;
