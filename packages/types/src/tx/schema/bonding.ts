import BN from "bn.js";
import { BondingProps } from "../types";

export class BondingMsgValue {
  source: string;
  validator: string;
  amount: BN;

  constructor(properties: BondingProps) {
    this.source = properties.source;
    this.validator = properties.validator;
    this.amount = new BN(properties.amount, 64);
  }
}

export const BondingMsgSchema = new Map([
  [
    BondingMsgValue,
    {
      kind: "struct",
      fields: [
        ["source", "string"],
        ["validator", "string"],
        ["amount", "u64"],
      ],
    },
  ],
]);
