import Transport from "@ledgerhq/hw-transport";
import TransportHID from "@ledgerhq/hw-transport-webhid";
import TransportUSB from "@ledgerhq/hw-transport-webusb";
import { chains } from "@namada/chains";
import {
  LedgerError,
  NamadaApp,
  NamadaKeys,
  ResponseAppInfo,
  ResponseProofGenKey,
  ResponseSign,
  ResponseVersion,
  ResponseViewKey,
} from "@zondax/ledger-namada";
import { makeBip44Path, makeSaplingPath } from "./utils";

const { coinType } = chains.namada.bip44;

export type LedgerAddressAndPublicKey = { address: string; publicKey: string };
export type LedgerShieldedKeys = {
  xfvk: Uint8Array;
  // Proof Generation Key
  pgk: {
    ak: Uint8Array;
    nsk: Uint8Array;
  };
};

export type LedgerStatus = {
  version: ResponseVersion;
  info: ResponseAppInfo;
};

export type Bparams = {
  spend: {
    rcv: Uint8Array;
    alpha: Uint8Array;
  };
  output: {
    rcv: Uint8Array;
    rcm: Uint8Array;
  };
  convert: {
    rcv: Uint8Array;
  };
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

export const DEFAULT_LEDGER_ZIP32_PATH = makeSaplingPath(coinType, {
  account: 0,
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
  ): Promise<LedgerAddressAndPublicKey> {
    const { address, pubkey } = await this.namadaApp.getAddressAndPubKey(path);

    return {
      // Return address as bech32-encoded string
      address: address.toString(),
      // Return public key as bech32-encoded string
      publicKey: pubkey.toString(),
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
  ): Promise<LedgerAddressAndPublicKey> {
    try {
      const { address, pubkey } =
        await this.namadaApp.showAddressAndPubKey(path);

      return {
        // Return address as bech32-encoded string
        address: address.toString(),
        // Return public key as bech32-encoded string
        publicKey: pubkey.toString(),
      };
    } catch (e) {
      throw new Error(`Connect Ledger rejected by user: ${e}`);
    }
  }

  /**
   * Get Bparams for masp transactions
   * @async
   * @returns bparams
   */
  public async getBparams(): Promise<Bparams[]> {
    const results: Bparams[] = [];

    // TODO: not sure why ledger sometimes returns errors, so we try to get 15 valid responses
    while (results.length < 15) {
      const spend_response = await this.namadaApp.getSpendRandomness();
      const output_response = await this.namadaApp.getOutputRandomness();
      const convert_response = await this.namadaApp.getConvertRandomness();
      if (
        spend_response.returnCode !== LedgerError.NoErrors ||
        output_response.returnCode !== LedgerError.NoErrors ||
        convert_response.returnCode !== LedgerError.NoErrors
      ) {
        continue;
      }

      results.push({
        spend: {
          rcv: spend_response.rcv,
          alpha: spend_response.alpha,
        },
        output: {
          rcv: output_response.rcv,
          rcm: output_response.rcm,
        },
        convert: {
          rcv: convert_response.rcv,
        },
      });
    }

    return results;
  }

  /**
   * Prompt user to get viewing and proof gen key associated with optional path, otherwise, use default path.
   * Throw exception if app is not initialized.
   * @async
   * @param [path] Bip44 path for deriving key
   * @param [promptUser] boolean to determine whether to display on Ledger device and require approval
   * @returns ShieldedKeys
   */
  public async getShieldedKeys(
    path: string = DEFAULT_LEDGER_ZIP32_PATH,
    promptUser = true
  ): Promise<LedgerShieldedKeys> {
    try {
      const { xfvk }: ResponseViewKey = await this.namadaApp.retrieveKeys(
        path,
        NamadaKeys.ViewKey,
        promptUser
      );

      if (!xfvk) {
        throw new Error(`Could not retrieve Viewing Key`);
      }

      const { ak, nsk }: ResponseProofGenKey =
        await this.namadaApp.retrieveKeys(
          path,
          NamadaKeys.ProofGenerationKey,
          promptUser
        );
      if (!ak || !nsk) {
        throw new Error(`Could not retrieve Proof Generation Key`);
      }

      return {
        xfvk: new Uint8Array(xfvk),
        pgk: {
          ak: new Uint8Array(ak),
          nsk: new Uint8Array(nsk),
        },
      };
    } catch (e) {
      console.error(e);
      throw new Error(`Could not retrieve shielded keys: ${e}`);
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
