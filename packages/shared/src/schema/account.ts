export class AccountMsgValue {
  secret: String;
  vp_code: Uint8Array;

  constructor(properties: { secret: string; vp_code: Uint8Array }) {
    this.secret = properties.secret;
    this.vp_code = properties.vp_code;
  }
}

export const AccountMsgSchema = new Map([
  [
    AccountMsgValue,
    {
      kind: "struct",
      fields: [
        ["secret", "string"],
        ["vp_code", []],
      ],
    },
  ],
]);
