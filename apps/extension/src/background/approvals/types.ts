import { SupportedTx } from "@namada/shared";

export type ApprovedOriginsStore = string[];

export type TxStore = {
  txType: SupportedTx;
  txMsg: string;
  specificMsg: string;
};
