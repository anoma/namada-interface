import { Anoma as IAnoma, Chain, DerivedAccount, SignedTx } from "@anoma/types";
import { Ports, MessageRequester } from "router";
import { GetChainMsg, GetChainsMsg, SuggestChainMsg } from "background/chains";
import {
  EncodeIbcTransferMsg,
  EncodeInitAccountMsg,
  EncodeTransferMsg,
  QueryAccountsMsg,
  SignTxMsg,
} from "background/keyring";

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
    txMsg: Uint8Array;
    txData: Uint8Array;
  }): Promise<SignedTx | undefined> {
    const { signer, txMsg, txData } = props;
    return await this.requester?.sendMessage(
      Ports.Background,
      new SignTxMsg(signer, txMsg, txData)
    );
  }

  public async encodeTransfer(
    txMsg: Uint8Array
  ): Promise<Uint8Array | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new EncodeTransferMsg(txMsg)
    );
  }

  public async encodeIbcTransfer(
    txMsg: Uint8Array
  ): Promise<Uint8Array | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new EncodeIbcTransferMsg(txMsg)
    );
  }

  public async encodeInitAccount(
    txMsg: Uint8Array
  ): Promise<Uint8Array | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new EncodeInitAccountMsg(txMsg)
    );
  }

  public version(): string {
    return this._version;
  }
}
