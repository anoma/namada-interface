import { chains } from "@namada/chains";
import {
  Account,
  AccountType,
  Signer as ISigner,
  Namada,
  SignArbitraryResponse,
  TxProps,
} from "@namada/types";

export class Signer implements ISigner {
  constructor(private readonly _namada: Namada) { }

  public async accounts(): Promise<Account[] | undefined> {
    return (await this._namada.accounts())?.map(
      ({ alias, address, type, publicKey, owner, pseudoExtendedKey }) => ({
        alias,
        address,
        viewingKey: owner,
        chainId: chains.namada.chainId,
        type,
        publicKey,
        isShielded: type === AccountType.ShieldedKeys,
        pseudoExtendedKey,
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
}
