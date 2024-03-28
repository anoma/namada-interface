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
import { makeBip44Path } from "./utils";

const { coinType } = chains.namada.bip44;

export type AddressAndPublicKey = { address: string; publicKey: string };
export type LedgerStatus = {
  version: ResponseVersion;
  info: ResponseAppInfo;
};

/**
 * Initialize USB transport
 * @async
 * @returns Transport object
 */
export const initLedgerUSBTransport = async (): Promise<Transport> => {
  return await TransportUSB.create();
};

/**
 * Initialize HID transport
 * @async
 * @returns Transport object
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
   * @param namadaApp - Inititalized NamadaApp class from Zondax package
   */
  private constructor(public readonly namadaApp: NamadaApp) {}

  /**
   * Initialize and return Ledger class instance with initialized Transport
   * @async
   * @param [transport] Ledger transport
   * @returns Ledger class instance
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
   * @returns Version and info of NamadaApp
   */
  public async status(): Promise<LedgerStatus> {
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
   * @param [path] Bip44 path for deriving key
   * @returns Address and public key
   */
  public async getAddressAndPublicKey(
    path: string = DEFAULT_LEDGER_BIP44_PATH
  ): Promise<AddressAndPublicKey> {
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
   * @param [path] Bip44 path for deriving key
   * @returns Address and public key
   */
  public async showAddressAndPublicKey(
    path: string = DEFAULT_LEDGER_BIP44_PATH
  ): Promise<AddressAndPublicKey> {
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
      throw new Error(`Connect Ledger rejected by user: ${e}`);
    }
  }

  /**
   * Sign tx bytes with the key associated with the provided (or default) path.
   * Throw exception if app is not initialized.
   * @async
   * @param tx - tx data blob to sign
   * @param [path] Bip44 path for signing account
   * @returns Response signature
   */
  public async sign(
    tx: Uint8Array,
    path: string = DEFAULT_LEDGER_BIP44_PATH
  ): Promise<ResponseSign> {
    const buffer = Buffer.from(tx);

    return await this.namadaApp.sign(path, buffer);
  }

  /**
   * Query status to determine if device has thrown an error.
   * Throw exception if app is not initialized.
   * @async
   * @returns Error message if error is found
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
   * Throw exception if app is not initialized.
   * @async
   * @returns void
   */
  public async closeTransport(): Promise<void> {
    return await this.namadaApp.transport.close();
  }
}
