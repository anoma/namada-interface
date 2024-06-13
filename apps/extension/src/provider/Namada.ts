import { toBase64 } from "@cosmjs/encoding";
import { TxType } from "@heliax/namada-sdk/web";
import {
  Chain,
  DerivedAccount,
  Namada as INamada,
  SignArbitraryProps,
  SignArbitraryResponse,
  SignBatchProps,
  SignProps,
  VerifyArbitraryProps,
} from "@namada/types";
import { MessageRequester, Ports } from "router";

import {
  ApproveConnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveSignBatchTxMsg,
  ApproveSignTxMsg,
  CheckDurabilityMsg,
  GetChainMsg,
  IsConnectionApprovedMsg,
  QueryAccountsMsg,
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

  public async isConnected(): Promise<boolean> {
    if (!this.requester) {
      throw new Error("no requester");
    }

    return await this.requester.sendMessage(
      Ports.Background,
      new IsConnectionApprovedMsg()
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

  public async sign(props: SignProps): Promise<Uint8Array | undefined> {
    const {
      txType,
      signer,
      tx: { txBytes, signingDataBytes },
      wrapperTxMsg,
    } = props;
    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveSignTxMsg(
        txType as TxType,
        {
          txBytes: toBase64(txBytes),
          signingDataBytes: toBase64(signingDataBytes),
        },
        signer,
        toBase64(wrapperTxMsg)
      )
    );
  }

  public async signBatch(
    props: SignBatchProps
  ): Promise<Uint8Array | undefined> {
    const { txType, batchTx, signer, wrapperTxMsg } = props;

    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveSignBatchTxMsg(
        txType as TxType,
        {
          txBytes: toBase64(batchTx.txBytes),
          signingDataBytes:
            batchTx.signingDataBytes ?
              toBase64(batchTx.signingDataBytes)
              : undefined,
        },
        signer,
        toBase64(wrapperTxMsg)
      )
    );
  }

  public async signArbitrary(
    props: SignArbitraryProps
  ): Promise<SignArbitraryResponse | undefined> {
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

  public async getChain(): Promise<Chain | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new GetChainMsg()
    );
  }

  public async checkDurability(): Promise<boolean | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new CheckDurabilityMsg()
    );
  }

  public version(): string {
    return this._version;
  }
}
