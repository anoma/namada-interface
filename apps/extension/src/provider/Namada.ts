import { Namada as INamada, DerivedAccount, TxMsgProps } from "@namada/types";
import { Ports, MessageRequester } from "router";

import {
  ApproveTxMsg,
  ApproveConnectInterfaceMsg,
  QueryAccountsMsg,
  FetchAndStoreMaspParamsMsg,
  HasMaspParamsMsg,
  CheckDurabilityMsg,
  QueryBalancesMsg,
  QueryDefaultAccountMsg,
} from "./messages";

export class Namada implements INamada {
  constructor(
    private readonly _version: string,
    protected readonly requester?: MessageRequester
  ) {}

  public async connect(_chainId?: string): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveConnectInterfaceMsg()
    );
  }

  public async accounts(): Promise<DerivedAccount[] | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new QueryAccountsMsg()
    );
  }

  public async defaultAccount(): Promise<DerivedAccount | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new QueryDefaultAccountMsg()
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

  public async submitTx(props: TxMsgProps): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveTxMsg(props.txType, props.specificMsg, props.txMsg, props.type)
    );
  }

  public version(): string {
    return this._version;
  }
}
