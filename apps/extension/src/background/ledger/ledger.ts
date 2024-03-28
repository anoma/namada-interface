import { toHex } from "@cosmjs/encoding";
import Transport from "@ledgerhq/hw-transport";
import TransportHID from "@ledgerhq/hw-transport-webhid";
import TransportUSB from "@ledgerhq/hw-transport-webusb";
import { chains } from "@namada/chains";
import { makeBip44Path } from "@namada/sdk/web";
import {
  LedgerError,
  NamadaApp,
  ResponseAppInfo,
  ResponseSign,
  ResponseVersion,
} from "@zondax/ledger-namada";

const { coinType } = chains.namada.bip44;

export const initLedgerUSBTransport = async (): Promise<Transport> => {
  return await TransportUSB.create();
};

export const initLedgerHIDTransport = async (): Promise<Transport> => {
  return await TransportHID.create();
};

export const DEFAULT_LEDGER_BIP44_PATH = makeBip44Path(coinType, {
  account: 0,
  change: 0,
  index: 0,
});

export class Ledger {
  constructor(public readonly namadaApp: NamadaApp | undefined = undefined) {}

  /**
   * Returns an initialized Ledger class instance with initialized Transport
   */
  static async init(transport?: Transport): Promise<Ledger> {
    const initializedTransport = transport ?? (await initLedgerUSBTransport());

    try {
      const namadaApp = new NamadaApp(initializedTransport);
      const ledger = new Ledger(namadaApp);
      return ledger;
    } catch (e) {
      throw new Error(`${e}`);
    }
  }

  /**
   * Return status and version info of initialized NamadaApp
   */
  public async status(): Promise<{
    version: ResponseVersion;
    info: ResponseAppInfo;
  }> {
    if (!this.namadaApp) {
      throw new Error("NamadaApp is not initialized!");
    }
    const version = await this.namadaApp.getVersion();
    const info = await this.namadaApp.getAppInfo();

    return {
      version,
      info,
    };
  }

  /**
   * Get address and public key associated with optional path, otherwise, use default path
   */
  public async getAddressAndPublicKey(
    bip44Path?: string
  ): Promise<{ address: string; publicKey: string }> {
    if (!this.namadaApp) {
      throw new Error("NamadaApp is not initialized!");
    }

    const path = bip44Path || DEFAULT_LEDGER_BIP44_PATH;
    const { address, publicKey } =
      await this.namadaApp.getAddressAndPubKey(path);

    return {
      // Return address as bech32-encoded string
      address: address.toString(),
      // Return public key as hex-encoded string
      publicKey: toHex(publicKey),
    };
  }

  public async showAddressAndPublicKey(
    bip44Path?: string
  ): Promise<{ address: string; publicKey: string }> {
    if (!this.namadaApp) {
      throw new Error("NamadaApp is not initialized!");
    }

    const path = bip44Path || DEFAULT_LEDGER_BIP44_PATH;

    try {
      const { address, publicKey } =
        await this.namadaApp.showAddressAndPubKey(path);

      return {
        // Return address as bech32-encoded string
        address: address.toString(),
        // Return public key as hex-encoded string
        publicKey: toHex(publicKey),
      };
    } catch (e) {
      throw new Error("Connect Ledger rejected by user");
    }
  }
  /**
   * Sign tx bytes with the key associated with provided (or default) path
   *
   * @async
   * @param {Uint8Array} tx - tx data blob to sign
   * @param {string} bip44Path (optional) - Bip44 path for signing account
   *
   * @returns {ResponseSign}
   */
  public async sign(tx: Uint8Array, bip44Path?: string): Promise<ResponseSign> {
    if (!this.namadaApp) {
      throw new Error("NamadaApp is not initialized!");
    }
    const buffer = Buffer.from(tx);
    const path = bip44Path || DEFAULT_LEDGER_BIP44_PATH;

    return await this.namadaApp.sign(path, buffer);
  }

  /**
   * Query status to determine if device has thrown an error
   */
  public async queryErrors(): Promise<string> {
    const {
      info: { returnCode, errorMessage },
    } = await this.status();

    if (returnCode !== LedgerError.NoErrors) {
      return errorMessage;
    }
    return "";
  }

  /**
   * Close the initialized transport, which may be needed if Ledger needs to be reinitialized due to error state
   */
  public async closeTransport(): Promise<void> {
    if (!this.namadaApp) {
      throw new Error("NamadaApp is not initialized!");
    }

    return await this.namadaApp.transport.close();
  }
}
