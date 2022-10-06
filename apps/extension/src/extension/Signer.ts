export type SignedTx = {
  hash: string;
  bytes: Uint8Array;
};

export interface ISigner<T> {
  accounts: () => Promise<T[]>;
  sign(): Promise<SignedTx>;
}

export class Signer<T> implements ISigner<T> {
  public async accounts(): Promise<T[]> {
    return [] as T[];
  }

  public async sign(): Promise<SignedTx> {
    return {
      hash: "",
      bytes: new Uint8Array([]),
    };
  }
}
