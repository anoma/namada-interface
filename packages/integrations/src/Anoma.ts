import {
  Account,
  Anoma as IAnoma,
  Chain,
  IbcTransferProps,
  Signer,
  WindowWithAnoma,
} from "@anoma/types";

import { Integration } from "./types/Integration";

export default class Anoma
  implements Integration<Account, Signer, IbcTransferProps>
{
  private _anoma: WindowWithAnoma["anoma"] | undefined;

  constructor(public readonly chain: Chain) {}

  public get instance(): IAnoma | undefined {
    return this._anoma;
  }

  private _init(): void {
    if (!this._anoma) {
      this._anoma = (<WindowWithAnoma>window)?.anoma;
    }
  }

  public detect(): boolean {
    this._init();
    return !!this._anoma;
  }

  public async connect(): Promise<void> {
    this._init();
    await this._anoma?.connect(this.chain.chainId);
  }

  public async accounts(): Promise<readonly Account[] | undefined> {
    const signer = this._anoma?.getSigner(this.chain.chainId);
    return await signer?.accounts();
  }

  public signer(): Signer | undefined {
    return this._anoma?.getSigner(this.chain.chainId);
  }

  public async submitBridgeTransfer({
    sender,
    receiver,
    sourcePort,
    sourceChannel,
    amount,
  }: IbcTransferProps): Promise<void> {
    // TODO: Call method in Anoma extension
    console.log("Anoma.submitBridgeTransfer", {
      sender,
      receiver,
      sourcePort,
      sourceChannel,
      amount,
    });
    return;
  }
}
