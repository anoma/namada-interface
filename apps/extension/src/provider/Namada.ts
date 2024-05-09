import { EncodedTx } from "@heliax/namada-sdk/web";
import {
  Chain,
  DerivedAccount,
  Namada as INamada,
  SignArbitraryProps,
  SignArbitraryResponse,
  SignProps,
  VerifyArbitraryProps,
} from "@namada/types";
import { MessageRequester, Ports } from "router";

import {
  ApproveConnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveSignTxMsg,
  CheckDurabilityMsg,
  FetchAndStoreMaspParamsMsg,
  GetChainMsg,
  HasMaspParamsMsg,
  IsConnectionApprovedMsg,
  QueryAccountsMsg,
  QueryDefaultAccountMsg,
  ShieldedSyncMsg,
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

  public async sign(props: SignProps): Promise<Uint8Array | undefined> {
    const { accountType, signer, tx } = props;
    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveSignTxMsg(accountType, signer, tx as EncodedTx)
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

  public async shieldedSync(): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new ShieldedSyncMsg()
    );
  }

  public version(): string {
    return this._version;
  }
}
