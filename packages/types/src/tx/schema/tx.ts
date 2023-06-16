import BN from "bn.js";
import { TxProps } from "../types";

export class TxMsgValue {
  token: string;
  fee_amount: BN;
  gas_limit: BN;
  chain_id: string;

  constructor(properties: TxProps) {
    this.token = properties.token;
    this.fee_amount = new BN(properties.feeAmount.toString());
    this.gas_limit = new BN(properties.gasLimit.toString());
    this.chain_id = properties.chainId;
  }
}

export const TxMsgSchema: [unknown, unknown] = [
  TxMsgValue,
  {
    kind: "struct",
    fields: [
      ["token", "string"],
      ["fee_amount", "u64"],
      ["gas_limit", "u64"],
      ["chain_id", "string"],
    ],
  },
];
