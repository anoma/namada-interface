import {
  Keplr as IKeplr,
  Key,
  Window as KeplrWindow,
} from "@keplr-wallet/types";
import { AccountData, coin, coins } from "@cosmjs/proto-signing";
import {
  StargateClient,
  SigningStargateClient,
  SigningStargateClientOptions,
} from "@cosmjs/stargate";
import { Coin } from "@cosmjs/launchpad";
import Long from "long";

import { Account, Chain, CosmosTokens, TokenBalance } from "@anoma/types";
import { shortenAddress } from "@anoma/utils";
import { BridgeProps, Integration } from "./types/Integration";

const KEPLR_NOT_FOUND = "Keplr extension not found!";

type OfflineSigner = ReturnType<IKeplr["getOfflineSigner"]>;

export type KeplrBalance = Coin;

export const defaultSigningClientOptions: SigningStargateClientOptions = {
  broadcastPollIntervalMs: 300,
  broadcastTimeoutMs: 8_000,
};

class Keplr implements Integration<Account, OfflineSigner> {
  private _keplr: IKeplr | undefined;
  private _offlineSigner: OfflineSigner | undefined;
  /**
   * Pass a chain config into constructor to instantiate, and optionally
   * override keplr instance for testing
   * @param chain
   */
  constructor(public readonly chain: Chain) {}

  private init(): void {
    if (!this._keplr) {
      this._keplr = (<KeplrWindow>window)?.keplr;
    }
  }

  /**
   * Get Keplr extension
   * @returns {IKeplr | undefined}
   */
  public get instance(): IKeplr | undefined {
    return this._keplr;
  }

  /**
   * Get offline signer for current chain
   * @returns {OfflineSigner}
   */
  public signer(): OfflineSigner {
    if (this._offlineSigner) {
      return this._offlineSigner;
    }

    if (this._keplr) {
      const { chainId } = this.chain;
      this._offlineSigner = this._keplr.getOfflineSigner(chainId);
      return this._offlineSigner;
    }
    throw new Error(KEPLR_NOT_FOUND);
  }

  /**
   * Determine if keplr extension exists
   * @returns {boolean}
   */
  public detect(): boolean {
    this.init();
    return !!this._keplr;
  }

  /**
   * Enable connection to Keplr for current chain
   * @returns {Promise<boolean>}
   */
  public async connect(): Promise<void> {
    if (this._keplr) {
      const { chainId } = this.chain;

      return await this._keplr.enable(chainId);
    }
    return Promise.reject(KEPLR_NOT_FOUND);
  }

  /**
   * Get key from Keplr for current chain
   * @returns {Promise<boolean>}
   */
  public async getKey(): Promise<Key> {
    if (this._keplr) {
      const { chainId } = this.chain;
      return await this._keplr.getKey(chainId);
    }
    return Promise.reject(KEPLR_NOT_FOUND);
  }

  /**
   * Get accounts from offline signer
   * @returns {Promise<readonly AccountData[]>}
   */
  public async accounts(): Promise<readonly Account[] | undefined> {
    if (this._keplr) {
      const client = this.signer();
      const accounts = await client?.getAccounts();

      return accounts?.map(
        (account: AccountData): Account => ({
          alias: shortenAddress(account.address, 16),
          chainId: this.chain.chainId,
          address: account.address,
          isShielded: false,
        })
      );
    }
    return Promise.reject(KEPLR_NOT_FOUND);
  }

  public async submitBridgeTransfer(props: BridgeProps): Promise<void> {
    if (props.ibcProps) {
      const {
        source,
        receiver,
        token,
        amount,
        portId = "transfer",
        channelId,
      } = props.ibcProps;

      const client = await SigningStargateClient.connectWithSigner(
        this.chain.rpc,
        this.signer(),
        defaultSigningClientOptions
      );

      const fee = {
        amount: coins(2000, "ucosm"),
        gas: "222000",
      };

      const response = await client.sendIbcTokens(
        source,
        receiver,
        coin(amount, CosmosTokens[token]),
        portId,
        channelId,
        {
          revisionHeight: Long.fromNumber(123),
          revisionNumber: Long.fromNumber(456),
        },
        Math.floor(Date.now() / 1000) + 60,
        fee,
        "IBC Transfer Keplr<->Namada"
      );

      if (response.code !== 0) {
        return Promise.reject("Transaction failed!");
      }

      return;
    }

    return Promise.reject("Invalid bridge props!");
  }

  public async queryBalances(owner: string): Promise<TokenBalance[]> {
    const client = await StargateClient.connect(this.chain.rpc);

    // Query balance for ATOM:
    return ((await client.getAllBalances(owner)) || []).map((coin: Coin) => ({
      token: CosmosTokens[coin.denom] || "ATOM",
      amount: parseInt(coin.amount),
    }));
  }
}

export default Keplr;
