import BN from "bn.js";

export class TokenAmount {
  micro: BN;
  constructor(properties: { micro: BN }) {
    this.micro = new BN(properties.micro, 64);
  }
}

export const schemaAmount = new Map([
  [
    TokenAmount,
    {
      kind: "struct",
      fields: [["micro", "u64"]],
    },
  ],
]);
