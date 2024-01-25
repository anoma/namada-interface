import { Coin } from "@cosmjs/launchpad";
import { AccountData, coin, coins } from "@cosmjs/proto-signing";
import {
  SigningStargateClient,
  SigningStargateClientOptions,
  StargateClient,
} from "@cosmjs/stargate";
import {
  Keplr as IKeplr,
  Window as KeplrWindow,
  Key,
} from "@keplr-wallet/types";
// import Long from "long";
import BigNumber from "bignumber.js";

import {
  Account,
  AccountType,
  Chain,
  CosmosMinDenom,
  CosmosTokenType,
  TokenBalance,
  TokenType,
  minDenomByToken,
  tokenByMinDenom,
} from "@namada/types";
import { shortenAddress } from "@namada/utils";
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
  constructor(public readonly chain: Chain) { }

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

  public async getChain(): Promise<Chain> {
    return this.chain;
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
          type: AccountType.PrivateKey,
          isShielded: false,
          chainKey: this.chain.id,
        })
      );
    }
    return Promise.reject(KEPLR_NOT_FOUND);
  }

  /**
   * Submit IBC transfer tx to a Cosmos-based chain, using the offline signer from Keplr
   * @returns {Promise<void>}
   */
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
      const { feeAmount } = props.txProps;

      const minDenom = minDenomByToken(token.symbol as CosmosTokenType);
      const client = await SigningStargateClient.connectWithSigner(
        this.chain.rpc,
        this.signer(),
        defaultSigningClientOptions
      ).catch((e) => Promise.reject(e));

      const fee = {
        amount: coins(feeAmount.toString(), minDenom),
        gas: "222000",
      };

      const response = await client
        .sendIbcTokens(
          source,
          receiver,
          coin(amount.toString(), minDenom),
          portId,
          channelId,
          // TODO: Should we enable timeout height versus timestamp?
          // {
          //   revisionHeight: Long.fromNumber(0),
          //   revisionNumber: Long.fromNumber(0),
          // },
          undefined, // timeout height
          Math.floor(Date.now() / 1000) + 60, // timeout timestamp
          fee,
          `${this.chain.alias} (${this.chain.chainId})->Namada`
        )
        .catch((e) => Promise.reject(e));

      if (response.code !== 0) {
        console.error("Transaction failed:", { response });
        return Promise.reject(
          `Transaction failed with code ${response.code}! Message: ${response.rawLog}`
        );
      }

      return;
    }

    return Promise.reject("Invalid bridge props!");
  }

  public async queryBalances(owner: string): Promise<TokenBalance[]> {
    const client = await StargateClient.connect(this.chain.rpc);
    const balances = (await client.getAllBalances(owner)) || [];

    // TODO: Remove filter once we can handle IBC tokens properly
    return balances
      .filter((balance) => balance.denom === "uatom")
      .map((coin: Coin) => {
        const token = tokenByMinDenom(
          coin.denom as CosmosMinDenom
        ) as TokenType;
        const amount = new BigNumber(coin.amount);
        return {
          token,
          amount: (coin.denom === "uatom"
            ? amount.dividedBy(1_000_000)
            : amount
          ).toString(),
        };
      });
  }
}

export default Keplr;
