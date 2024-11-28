import { Coin } from "@cosmjs/launchpad";
import { coin, coins } from "@cosmjs/proto-signing";
import {
  QueryClient,
  SigningStargateClient,
  SigningStargateClientOptions,
  StargateClient,
  setupIbcExtension,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
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
  CosmosTokenType,
  CosmosTokens,
  TokenBalances,
  tokenByMinDenom,
} from "@namada/types";
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
      // TODO: get accounts for multiple chains
      const chainIds = [this.chain.chainId];

      const keysSettled = await Promise.allSettled(
        chainIds.map(async (chainId) => {
          const key = await this._keplr!.getKey(chainId);
          return { chainId, key };
        })
      );
      // getKey rejects Promise for unknown chains, so filter rejected promises
      const accounts = keysSettled.reduce<{ chainId: string; key: Key }[]>(
        (acc, current) => {
          if (current.status === "fulfilled") {
            return [...acc, current.value];
          } else {
            return acc;
          }
        },
        []
      );

      return accounts.map(({ chainId, key }) => ({
        alias: key.name,
        chainId: chainId,
        address: key.bech32Address,
        type: AccountType.PrivateKey,
        isShielded: false,
        chainKey: this.chain.id,
      }));
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
        amountInBaseDenom,
        portId = "transfer",
        channelId,
      } = props.ibcProps;
      const { feeAmount } = props.txProps;

      // TODO: shouldn't need to cast here
      const minDenom = CosmosTokens[token as CosmosTokenType].minDenom;
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
          coin(amountInBaseDenom.toString(), minDenom),
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

  public async queryBalances(
    owner: string
  ): Promise<TokenBalances<CosmosTokenType>> {
    const client = await StargateClient.connect(this.chain.rpc);
    const queryResult = (await client.getAllBalances(owner)) || [];

    const balances: TokenBalances<CosmosTokenType> = {};

    await Promise.all(
      queryResult.map(async (coin: Coin) => {
        let denom = coin.denom;
        if (denom.startsWith("ibc/")) {
          denom = await this.ibcAddressToDenom(denom);
        }

        const token = tokenByMinDenom(denom);
        if (typeof token === "undefined") {
          return; // ignore unknown tokens
        }

        const amountInMinDenom = new BigNumber(coin.amount);
        if (amountInMinDenom.isNaN()) {
          throw new Error("invalid amount string received");
        }
        const decimals = CosmosTokens[token].decimals;
        const amount = amountInMinDenom.dividedBy(10 ** decimals);

        if (token in balances) {
          throw new Error("duplicate entries in balances");
        }
        balances[token] = amount;
      })
    );

    return balances;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async sync(): Promise<void> {}

  private async ibcAddressToDenom(address: string): Promise<string> {
    const tmClient = await Tendermint34Client.connect(this.chain.rpc);
    const queryClient = new QueryClient(tmClient);
    const ibcExtension = setupIbcExtension(queryClient);

    const ibcHash = address.replace("ibc/", "");
    const { denomTrace } = await ibcExtension.ibc.transfer.denomTrace(ibcHash);
    const baseDenom = denomTrace?.baseDenom;

    if (typeof baseDenom === "undefined") {
      throw new Error("couldn't get denom from ibc address");
    }

    return baseDenom;
  }
}

export default Keplr;
