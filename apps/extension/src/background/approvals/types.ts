import { SupportedTx } from "@namada/sdk/web";

export type ApprovedOriginsStore = string[];

export type TxStore = {
  txType: SupportedTx;
  txMsg: string;
  specificMsg: string;
};
