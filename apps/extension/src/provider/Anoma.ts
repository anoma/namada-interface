import { Anoma as IAnoma, Chain, DerivedAccount, SignedTx } from "@anoma/types";
import { Ports, MessageRequester } from "router";

import {
  GetChainMsg,
  GetChainsMsg,
  SuggestChainMsg,
  EncodeBondingMsg,
  EncodeIbcTransferMsg,
  EncodeInitAccountMsg,
  EncodeTransferMsg,
  QueryAccountsMsg,
  SignTxMsg,
  EncodeRevealPkMsg,
  SubmitBondMsg,
} from "./messages";

export class Anoma implements IAnoma {
  constructor(
    private readonly _version: string,
    protected readonly requester?: MessageRequester
  ) {}

  public async connect(chainId: string): Promise<void> {
    // TODO: Implement this
    console.info("connect", chainId);
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

  public async encodeBonding(txMsg: string): Promise<string | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new EncodeBondingMsg(txMsg)
    );
  }

  public async submitBond(props: {
    txMsg1: string;
    txMsg2: string;
  }): Promise<void> {
    const { txMsg1, txMsg2 } = props;
    return await this.requester?.sendMessage(
      Ports.Background,
      new SubmitBondMsg(txMsg1, txMsg2)
    );
  }

  public async encodeTransfer(txMsg: string): Promise<string | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new EncodeTransferMsg(txMsg)
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
