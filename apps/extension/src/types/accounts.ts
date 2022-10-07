export type Bip44Path = {
  account: number;
  change: number;
  index?: number;
};

export enum AccountType {
  Mnemonic = "mnemonic",
  PrivateKey = "private-key",
}
