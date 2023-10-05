import { SupportedTx } from "@namada/types";

export type ApprovedOriginsStore = string[];

export type TxStore = { txType: SupportedTx, txMsg: string, specificMsg: string };
