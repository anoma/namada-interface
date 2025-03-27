import {
  GenDisposableSignerResponse,
  Signer as ISigner,
  Namada,
  SignArbitraryResponse,
  TxProps,
} from "@namada/types";

export class Signer implements ISigner {
  constructor(private readonly _namada: Namada) {}

  public async sign(
    tx: TxProps | TxProps[],
    signer: string,
    checksums?: Record<string, string>
  ): Promise<Uint8Array[] | undefined> {
    const txs = tx instanceof Array ? tx : [tx];
    return await this._namada.sign({
      signer,
      txs,
      checksums,
    });
  }

  public async signArbitrary(
    signer: string,
    data: string
  ): Promise<SignArbitraryResponse | undefined> {
    return await this._namada.signArbitrary({ signer, data });
  }

  public async verify(
    publicKey: string,
    hash: string,
    signature: string
  ): Promise<void> {
    return await this._namada.verify({ publicKey, hash, signature });
  }

  public async genDisposableKeypair(): Promise<
    GenDisposableSignerResponse | undefined
  > {
    return await this._namada.genDisposableKeypair();
  }

  public async persistDisposableKeypair(address: string): Promise<void> {
    return await this._namada.persistDisposableKeypair({ address });
  }

  public async clearDisposableKeypair(address: string): Promise<void> {
    return await this._namada.clearDisposableKeypair({ address });
  }
}
