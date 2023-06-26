import { Schema } from "borsh";
import { SchemaObject } from "@anoma/utils";

import { InitAccountProps } from "../types";

export class AccountMsgValue {
  vp_code: Uint8Array;

  constructor(properties: InitAccountProps | SchemaObject<typeof accountMsgSchemaEntry>) {
    this.vp_code = 'vpCode' in properties ?
      properties.vpCode :
      properties.vp_code;
  }
}

const accountMsgSchemaEntry = [
  AccountMsgValue,
  {
    kind: "struct",
    fields: [["vp_code", ["u8"]]],
  },
] as const; // needed for SchemaObject to deduce types correctly

export const AccountMsgSchema = new Map([
  accountMsgSchemaEntry as [unknown, unknown]
]) as Schema;
