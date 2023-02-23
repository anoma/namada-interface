import { Anoma as IAnoma, Chain, DerivedAccount, SignedTx } from "@anoma/types";
import { Ports, MessageRequester } from "router";

import {
  ConnectExtensionMsg,
  GetChainMsg,
  GetChainsMsg,
  SuggestChainMsg,
  EncodeIbcTransferMsg,
  EncodeInitAccountMsg,
  QueryAccountsMsg,
  SignTxMsg,
  EncodeRevealPkMsg,
  SubmitBondMsg,
  SubmitUnbondMsg,
  SubmitTransferMsg,
} from "./messages";

export class Anoma implements IAnoma {
  constructor(
    private readonly _version: string,
    protected readonly requester?: MessageRequester
  ) {}

  public async connect(chainId: string): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new ConnectExtensionMsg(chainId)
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

  public async suggestChain(chain: Chain): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new SuggestChainMsg(chain)
    );
  }

  public async signTx(props: {
    signer: string;
    txMsg: string;
    txData: string;
  }): Promise<SignedTx | undefined> {
    const { signer, txMsg, txData } = props;
    return await this.requester?.sendMessage(
      Ports.Background,
      new SignTxMsg(signer, txMsg, txData)
    );
  }

  public async submitBond(txMsg: string): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new SubmitBondMsg(txMsg)
    );
  }

  public async submitUnbond(txMsg: string): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new SubmitUnbondMsg(txMsg)
    );
  }

  public async submitTransfer(txMsg: string): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new SubmitTransferMsg(txMsg)
    );
  }

  public async encodeIbcTransfer(txMsg: string): Promise<string | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new EncodeIbcTransferMsg(txMsg)
    );
  }

  public async encodeInitAccount(props: {
    txMsg: string;
    address: string;
  }): Promise<string | undefined> {
    const { txMsg, address } = props;
    return await this.requester?.sendMessage(
      Ports.Background,
      new EncodeInitAccountMsg(txMsg, address)
    );
  }

  public async encodeRevealPk(props: {
    signer: string;
  }): Promise<string | undefined> {
    const { signer } = props;
    return await this.requester?.sendMessage(
      Ports.Background,
      new EncodeRevealPkMsg(signer)
    );
  }

  public version(): string {
    return this._version;
  }
}
