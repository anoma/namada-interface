import {
  Anoma as IAnoma,
  Chain,
  DerivedAccount,
  SignedTx,
  Signer as ISigner,
} from "@anoma/types";
import { InjectedProxy } from "./InjectedProxy";
import { Signer } from "./Signer";

export class InjectedAnoma implements IAnoma {
  constructor(private readonly _version: string) {}

  public async connect(chainId: string): Promise<void> {
    return await InjectedProxy.requestMethod<string, void>("connect", chainId);
  }

  public async chain(chainId: string): Promise<Chain | undefined> {
    return InjectedProxy.requestMethod<string, Chain>("chain", chainId);
  }

  public async chains(): Promise<Chain[]> {
    return await InjectedProxy.requestMethod<void, Chain[]>(
      "chains",
      undefined
    );
  }

  public async suggestChain(chain: Chain): Promise<void> {
    await InjectedProxy.requestMethod<Chain, void>("suggestChain", chain);
  }

  public async accounts(chainId: string): Promise<DerivedAccount[]> {
    return await InjectedProxy.requestMethod<string, DerivedAccount[]>(
      "accounts",
      chainId
    );
  }

  public getSigner(chainId: string): ISigner | undefined {
    return new Signer(chainId, this);
  }

  public async signTx(props: {
    signer: string;
    txMsg: string;
    txData: string;
  }): Promise<SignedTx> {
    return await InjectedProxy.requestMethod<
      { signer: string; txMsg: string; txData: string },
      SignedTx
    >("signTx", props);
  }

  public async encodeBonding(txMsg: string): Promise<string | undefined> {
    return await InjectedProxy.requestMethod<string, string>(
      "encodeBonding",
      txMsg
    );
  }

  public async submitBond(txMsg: string): Promise<void> {
    return await InjectedProxy.requestMethod<string, void>("submitBond", txMsg);
  }

  public async submitTransfer(txMsg: string): Promise<void> {
    return await InjectedProxy.requestMethod<string, void>(
      "submitTransfer",
      txMsg
    );
  }

  public async encodeIbcTransfer(txMsg: string): Promise<string | undefined> {
    return await InjectedProxy.requestMethod<string, string>(
      "encodeIbcTransfer",
      txMsg
    );
  }

  public async encodeInitAccount(props: {
    txMsg: string;
    address: string;
  }): Promise<string | undefined> {
    return await InjectedProxy.requestMethod<
      { txMsg: string; address: string },
      string
    >("encodeInitAccount", props);
  }

  public async encodeRevealPk(props: {
    signer: string;
  }): Promise<string | undefined> {
    return await InjectedProxy.requestMethod<{ signer: string }, string>(
      "encodeRevealPk",
      props
    );
  }

  public version(): string {
    return this._version;
  }
}
