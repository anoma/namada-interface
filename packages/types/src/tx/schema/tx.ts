import BN from "bn.js";
import { TxProps } from "../types";

export class TxMsgValue {
  token: string;
  fee_amount: BN;
  gas_limit: BN;
  chain_id: string;

  constructor(properties: TxProps) {
    this.token = properties.token;
    this.fee_amount = new BN(properties.feeAmount, 64);
    this.gas_limit = new BN(properties.gasLimit, 64);
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
