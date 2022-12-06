import {
  Keplr as IKeplr,
  Key,
  Window as KeplrWindow,
} from "@keplr-wallet/types";
import { AccountData } from "@cosmjs/proto-signing";
import { Chain } from "@anoma/types";
import { Integration } from "types/Integration";

const KEPLR_NOT_FOUND = "Keplr extension not found!";
const DEFAULT_FEATURES: string[] = [];
const IBC_FEATURE = "ibc-transfer";

type OfflineSigner = ReturnType<IKeplr["getOfflineSigner"]>;

class Keplr implements Integration<AccountData, OfflineSigner> {
  private _offlineSigner: OfflineSigner | undefined;
  private _features: string[] = [];
  /**
   * Pass a chain config into constructor to instantiate, and optionally
   * override keplr instance for testing
   * @param chain
   * @param _keplr
   */
  constructor(
    public readonly chain: Chain,
    private readonly _keplr = (<KeplrWindow>window)?.keplr
  ) {
    // If chain is ibc-enabled, add relevant feature:
    const { ibc } = chain;
    this._features.push(...DEFAULT_FEATURES);

    if (ibc) {
      this._features.push(IBC_FEATURE);
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
    return !!this._keplr;
  }

  /**
   * Enable connection to Keplr for current chain
   * @returns {Promise<boolean>}
   */
  public async connect(): Promise<void> {
    if (this._keplr) {
      const { chainId } = this.chain;

      await this._keplr.enable(chainId);
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
  public async accounts(): Promise<readonly AccountData[] | undefined> {
    // TODO: Update this to map values to Account type defined in @anoma/types
    if (this._keplr) {
      return await this._offlineSigner?.getAccounts();
    }
    return Promise.reject(KEPLR_NOT_FOUND);
  }
}

export default Keplr;
