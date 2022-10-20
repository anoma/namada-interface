import { InitAccountProps } from "../types";

export class AccountMsgValue {
  vp_code: Uint8Array;

  constructor(properties: InitAccountProps) {
    this.vp_code = properties.vpCode;
  }
}

export const AccountMsgSchema = new Map([
  [
    AccountMsgValue,
    {
      kind: "struct",
      fields: [["vp_code", []]],
    },
  ],
]);
