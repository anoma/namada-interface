import { SupportedTx } from "@heliax/namada-sdk/web";
import { SupportedTxProps, TxMsgProps } from "@namada/types";

export type ApprovedOriginsStore = string[];

export type PendingTx = SupportedTxProps;
export type TxStore = TxMsgProps & {
  // Override "any" from @namada/types
  txType: SupportedTx;
};

// TODO: Remove this! We should return all details to approvals for the "data" inspection feature
export type PendingTxDetails = {
  amount: string;
  tokenAddress: string;
  source?: string;
  target?: string;
  publicKey?: string;
  validator?: string;
};
