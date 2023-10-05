import {
  Namada as INamada,
  Chain,
  DerivedAccount,
  TxMsgProps,
} from "@namada/types";
import { Ports, MessageRequester } from "router";

import {
  ApproveTxMsg,
  ApproveConnectInterfaceMsg,
  GetChainMsg,
  GetChainsMsg,
  SuggestChainMsg,
  QueryAccountsMsg,
  FetchAndStoreMaspParamsMsg,
  HasMaspParamsMsg,
  CheckDurabilityMsg,
  QueryBalancesMsg,
} from "./messages";

export class Namada implements INamada {
  constructor(
    private readonly _version: string,
    protected readonly requester?: MessageRequester
  ) {}

  public async connect(chainId: string): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveConnectInterfaceMsg(chainId)
    );
  }

  public async chain(chainId: string): Promise<Chain | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new GetChainMsg(chainId)
    );
  }

  public async chains(): Promise<Chain[] | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new GetChainsMsg()
    );
  }

  public async accounts(
    chainId: string
  ): Promise<DerivedAccount[] | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new QueryAccountsMsg(chainId)
    );
  }

  public async fetchAndStoreMaspParams(): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new FetchAndStoreMaspParamsMsg()
    );
  }

  public async hasMaspParams(): Promise<boolean | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new HasMaspParamsMsg()
    );
  }

  public async checkDurability(): Promise<boolean | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new CheckDurabilityMsg()
    );
  }

  public async balances(
    owner: string
  ): Promise<{ token: string; amount: string }[] | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new QueryBalancesMsg(owner)
    );
  }

  public async suggestChain(chain: Chain): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new SuggestChainMsg(chain)
    );
  }

  public async submitTx(props: TxMsgProps): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveTxMsg(
        props.txType,
        props.specificMsg,
        props.txMsg,
        props.type
      )
    );
  }

  public version(): string {
    return this._version;
  }
}
