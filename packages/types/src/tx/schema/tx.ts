import BN from "bn.js";
import { TxProps } from "../types";
import { SchemaObject } from "@anoma/utils";

export class TxMsgValue {
  token: string;
  fee_amount: BN;
  gas_limit: BN;
  chain_id: string;

  constructor(properties: TxProps | SchemaObject<typeof TxMsgSchema>) {
    this.token = properties.token;
    this.fee_amount = 'feeAmount' in properties ?
      new BN(properties.feeAmount.toString()) :
      properties.fee_amount;
    this.gas_limit = 'gasLimit' in properties ?
      new BN(properties.gasLimit.toString()) :
      properties.gas_limit;
    this.chain_id = 'chainId' in properties ?
      properties.chainId :
      properties.chain_id;
  }
}

export const TxMsgSchema = [
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
] as const; // needed for SchemaObject to deduce types correctly
