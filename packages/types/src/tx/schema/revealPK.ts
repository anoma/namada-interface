import { Schema } from "borsh";
import { SchemaObject } from "@anoma/utils";

import { RevealPKProps } from "../types";
import { TxMsgSchema, TxMsgValue } from "./tx";

export class RevealPKMsgValue {
  tx: TxMsgValue;
  public_key: string;

  constructor(
    properties: RevealPKProps | SchemaObject<typeof RevealPKMsgSchema>
  ) {
    this.tx =
      properties.tx instanceof TxMsgValue
        ? properties.tx
        : new TxMsgValue(properties.tx);

    this.public_key =
      "publicKey" in properties ? properties.publicKey : properties.public_key;
  }
}

export const RevealPKMsgSchema = [
  RevealPKMsgValue,
  {
    kind: "struct",
    fields: [
      ["tx", TxMsgValue],
      ["public_key", "string"],
    ],
  },
] as const; // needed for SchemaObject to deduce types correctly

export const SubmitRevealPKMsgSchema = new Map([
  RevealPKMsgSchema as [unknown, unknown],
  TxMsgSchema as [unknown, unknown],
]) as Schema;
