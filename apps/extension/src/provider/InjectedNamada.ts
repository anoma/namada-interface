import {
  AccountType,
  Chain,
  DerivedAccount,
  Namada as INamada,
  Signer as ISigner,
} from "@namada/types";
import { InjectedProxy } from "./InjectedProxy";
import { Signer } from "./Signer";

export class InjectedNamada implements INamada {
  constructor(private readonly _version: string) { }

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

  public async balances(
    owner: string
  ): Promise<{ token: string; amount: string }[]> {
    return await InjectedProxy.requestMethod<
      string,
      { token: string; amount: string }[]
    >("balances", owner);
  }

  public getSigner(chainId: string): ISigner | undefined {
    return new Signer(chainId, this);
  }

  public async submitBond(props: {
    txMsg: string;
    type: AccountType;
    publicKey?: string;
  }): Promise<void> {
    const { txMsg, type, publicKey } = props;
    return await InjectedProxy.requestMethod<
      { txMsg: string; type: AccountType; publicKey?: string },
      void
    >("submitBond", {
      txMsg,
      type,
      publicKey,
    });
  }

  public async submitUnbond(txMsg: string): Promise<void> {
    return await InjectedProxy.requestMethod<string, void>(
      "submitUnbond",
      txMsg
    );
  }

  public async submitTransfer(props: {
    txMsg: string;
    type: AccountType;
  }): Promise<void> {
    const { txMsg, type } = props;
    return await InjectedProxy.requestMethod<
      { txMsg: string; type: AccountType },
      void
    >("submitTransfer", {
      txMsg,
      type,
    });
  }

  public async submitIbcTransfer(txMsg: string): Promise<void> {
    return await InjectedProxy.requestMethod<string, void>(
      "submitIbcTransfer",
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

  public version(): string {
    return this._version;
  }
}
