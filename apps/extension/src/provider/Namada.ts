import {
  BalancesProps,
  Chain,
  DerivedAccount,
  Namada as INamada,
  SignArbitraryProps,
  SignatureResponse,
  TxMsgProps,
  VerifyArbitraryProps,
} from "@namada/types";
import { MessageRequester, Ports } from "router";

import {
  ApproveConnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveTxMsg,
  CheckDurabilityMsg,
  FetchAndStoreMaspParamsMsg,
  GetChainMsg,
  HasMaspParamsMsg,
  QueryAccountsMsg,
  QueryBalancesMsg,
  QueryDefaultAccountMsg,
  VerifyArbitraryMsg,
} from "./messages";

export class Namada implements INamada {
  constructor(
    private readonly _version: string,
    protected readonly requester?: MessageRequester
  ) { }

  public async connect(): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveConnectInterfaceMsg()
    );
  }

  public async accounts(
    // TODO: This argument should be removed in the future!
    _chainId?: string
  ): Promise<DerivedAccount[] | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new QueryAccountsMsg()
    );
  }

  public async defaultAccount(
    // TODO: This argument should be removed in the future!
    _chainId?: string
  ): Promise<DerivedAccount | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new QueryDefaultAccountMsg()
    );
  }

  public async sign(
    props: SignArbitraryProps
  ): Promise<SignatureResponse | undefined> {
    const { signer, data } = props;
    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveSignArbitraryMsg(signer, data)
    );
  }

  public async verify(props: VerifyArbitraryProps): Promise<void> {
    const { publicKey, hash, signature } = props;
    return await this.requester?.sendMessage(
      Ports.Background,
      new VerifyArbitraryMsg(publicKey, hash, signature)
    );
  }

  public async fetchAndStoreMaspParams(): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new FetchAndStoreMaspParamsMsg()
    );
  }

  public async getChain(): Promise<Chain | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new GetChainMsg()
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
    props: BalancesProps
  ): Promise<{ token: string; amount: string }[] | undefined> {
    const { owner, tokens } = props;
    return await this.requester?.sendMessage(
      Ports.Background,
      new QueryBalancesMsg(owner, tokens)
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
