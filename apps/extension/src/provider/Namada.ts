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

import { toEncodedTx } from "utils";
import {
  ApproveConnectInterfaceMsg,
  ApproveDisconnectInterfaceMsg,
  ApproveSignArbitraryMsg,
  ApproveSignTxMsg,
  ApproveUpdateDefaultAccountMsg,
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
  ) {}

  public async connect(chainId: string): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveConnectInterfaceMsg(chainId)
    );
  }

  public async disconnect(chainId: string): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveDisconnectInterfaceMsg(location.origin, chainId)
    );
  }

  public async isConnected(chainId: string): Promise<boolean> {
    if (!this.requester) {
      throw new Error("no requester");
    }

    return await this.requester.sendMessage(
      Ports.Background,
      new IsConnectionApprovedMsg(chainId)
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

  public async updateDefaultAccount(address: string): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveUpdateDefaultAccountMsg(address)
    );
  }

  public async sign(props: SignProps): Promise<Uint8Array[] | undefined> {
    const { signer, txs, checksums } = props;
    return await this.requester?.sendMessage(
      Ports.Background,
      new ApproveSignTxMsg(
        // Encode all transactions for use with postMessage
        txs.map((txProps) => toEncodedTx(txProps)),
        signer,
        checksums
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
