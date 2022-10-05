export class AccountMsgValue {
  vp_code: Uint8Array;

  constructor(properties: { vp_code: Uint8Array }) {
    this.vp_code = properties.vp_code;
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
