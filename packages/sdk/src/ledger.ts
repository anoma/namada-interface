import { toHex } from "@cosmjs/encoding";
import Transport from "@ledgerhq/hw-transport";
import TransportHID from "@ledgerhq/hw-transport-webhid";
import TransportUSB from "@ledgerhq/hw-transport-webusb";
import { chains } from "@namada/chains";
import {
  LedgerError,
  NamadaApp,
  ResponseAppInfo,
  ResponseSign,
  ResponseVersion,
} from "@zondax/ledger-namada";

import { makeBip44Path } from "@namada/utils";

const { coinType } = chains.namada.bip44;

export type AddressAndPublicKey = { address: string; publicKey: string };
export type LedgerStatus = {
  version: ResponseVersion;
  info: ResponseAppInfo;
};

/**
 * Initialize USB transport
 * @async
 * @returns {Transport}
 */
export const initLedgerUSBTransport = async (): Promise<Transport> => {
  return await TransportUSB.create();
};

/**
 * Initialize HID transport
 * @async
 * @returns {Transport}
 */
export const initLedgerHIDTransport = async (): Promise<Transport> => {
  return await TransportHID.create();
};

export const DEFAULT_LEDGER_BIP44_PATH = makeBip44Path(coinType, {
  account: 0,
  change: 0,
  index: 0,
});

/**
 * Functionality for interacting with NamadaApp for Ledger Hardware Wallets
 */
export class Ledger {
  /**
   * @param {NamadaApp} namadaApp - Inititalized NamadaApp class from Zondax package
   */
  constructor(public readonly namadaApp: NamadaApp) {}

  /**
   * Initialize and return Ledger class instance with initialized Transport
   * @async
   * @param {Transport} [transport] Ledger transport
   * @returns {Ledger}
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
   * Return status and version info of initialized NamadaApp.
   * Throw exception if app is not initialized.
   * @async
   * @returns {LedgerStatus}
   */
  public async status(): Promise<LedgerStatus> {
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
   * Throw exception if app is not initialized.
   * @async
   * @param {string} [bip44Path] Bip44 path for deriving key
   * @returns {AddressAndPublicKey}
   */
  public async getAddressAndPublicKey(
    bip44Path?: string
  ): Promise<AddressAndPublicKey> {
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

  /**
   * Prompt user to get address and public key associated with optional path, otherwise, use default path.
   * Throw exception if app is not initialized.
   * @async
   * @param {string} [bip44Path] Bip44 path for deriving key
   * @returns {AddressAndPublicKey}
   */
  public async showAddressAndPublicKey(
    bip44Path?: string
  ): Promise<AddressAndPublicKey> {
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
   * Sign tx bytes with the key associated with the provided (or default) path.
   * Throw exception if app is not initialized.
   * @async
   * @param {Uint8Array} tx - tx data blob to sign
   * @param {string} [bip44Path] Bip44 path for signing account
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
   * Query status to determine if device has thrown an error.
   * Throw exception if app is not initialized.
   * @async
   * @returns {string}
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
   * @async
   * @returns {void}
   */
  public async closeTransport(): Promise<void> {
    if (!this.namadaApp) {
      throw new Error("NamadaApp is not initialized!");
    }

    return await this.namadaApp.transport.close();
  }
}
