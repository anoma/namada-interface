import BN from "bn.js";
import { TransferProps } from "../types";

export class TransferMsgValue {
  source: string;
  target: string;
  token: string;
  amount: BN;
  key?: string;
  shielded?: Uint8Array;

  constructor(properties: TransferProps) {
    this.source = properties.source;
    this.target = properties.target;
    this.token = properties.token;
    this.amount = new BN(properties.amount, 64);
    this.key = properties.key;
    this.shielded = properties.shielded;
  }
}

export const TransferMsgSchema = new Map([
  [
    TransferMsgValue,
    {
      kind: "struct",
      fields: [
        ["source", "string"],
        ["target", "string"],
        ["token", "string"],
        ["amount", "u64"],
        ["key", { kind: "option", type: "string" }],
        ["shielded", { kind: "option", type: [] }],
      ],
    },
  ],
]);
