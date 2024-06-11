import { chains } from "@namada/chains";
import { BuiltTx } from "@namada/shared";
import {
  Account,
  AccountType,
  Signer as ISigner,
  Namada,
  SignArbitraryResponse,
} from "@namada/types";

export class Signer implements ISigner {
  constructor(private readonly _namada: Namada) {}

  public async accounts(): Promise<Account[] | undefined> {
    return (await this._namada.accounts())?.map(
      ({ alias, address, type, publicKey }) => ({
        alias,
        address,
        chainId: chains.namada.chainId,
        type,
        publicKey,
        isShielded: type === AccountType.ShieldedKeys,
        chainKey: "namada",
      })
    );
  }

  public async defaultAccount(): Promise<Account | undefined> {
    const account = await this._namada.defaultAccount();

    if (account) {
      const { alias, address, type, publicKey } = account;

      return {
        alias,
        address,
        chainId: chains.namada.chainId,
        type,
        publicKey,
        isShielded: type === AccountType.ShieldedKeys,
        chainKey: "namada",
      };
    }
  }

  public async sign(
    txType: unknown,
    builtTx: unknown | unknown[],
    signer: string
  ): Promise<Uint8Array[] | undefined> {
    const unsignedTx: BuiltTx[] = (
      builtTx instanceof Array ? builtTx : [builtTx]) as BuiltTx[];
    return await this._namada.sign({
      txType,
      signer,
      tx: unsignedTx.map((builtTx) => {
        const txData = builtTx.tx_bytes();
        const signingData = builtTx.signing_data_bytes();
        return {
          txData,
          signingData,
        };
      }),
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
}
