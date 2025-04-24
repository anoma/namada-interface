import Transport from "@ledgerhq/hw-transport";
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
import semver from "semver";
import { makeBip44Path, makeSaplingPath } from "./utils";

const { coinType } = chains.namada.bip44;

export type LedgerAddressAndPublicKey = { address: string; publicKey: string };
export type LedgerViewingKey = {
  xfvk: Uint8Array;
};
export type LedgerProofGenerationKey = {
  ak: Uint8Array;
  nsk: Uint8Array;
};

export type LedgerStatus = {
  version: ResponseVersion;
  info: ResponseAppInfo;
  deviceId?: string;
  deviceName?: string;
};

export const LEDGER_MIN_VERSION_ZIP32 = "3.0.0";
export const LEDGER_MASP_BLACKLISTED = "nanoS";

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
 * Returns a list of ledger devices
 * @async
 * @returns List of USB devices
 */
export const ledgerUSBList = async (): Promise<USBDevice[]> => {
  return await TransportUSB.list();
};

/**
 * Request ledger device - opens a popup to request the user to connect a ledger device
 * @async
 * @returns Transport object
 */
export const requestLedgerDevice = async (): Promise<TransportUSB> => {
  return await TransportUSB.request();
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
    const device = this.namadaApp.transport.deviceModel;

    return {
      version,
      info,
      deviceId: device?.id,
      deviceName: device?.productName,
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
    // We need to clean the randomness buffers before getting randomness
    // to ensure that the randomness is not reused
    await this.namadaApp.cleanRandomnessBuffers();
    const results: Bparams[] = [];
    let tries = 0;

    // This should not happen usually, but in case some of the responses are not valid, we will retry.
    // 15 is a maximum number of spend/output/convert description randomness parameters that can be
    // generated on the hardware wallet. This also means that ledger can sign maximum of 15 spend, output
    // and convert descriptions in one tx.
    while (results.length < 15) {
      tries++;
      if (tries === 20) {
        throw new Error("Could not get valid Bparams, too many tries");
      }

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
   * Prompt user to get viewing key associated with optional path, otherwise, use default path.
   * Throw exception if app is not initialized, zip32 is not supported, or key is not returned.
   * @async
   * @param [path] Zip32 path for deriving key
   * @param [promptUser] boolean to determine whether to display on Ledger device and require approval
   * @returns ShieldedKeys
   */
  public async getViewingKey(
    path: string = DEFAULT_LEDGER_ZIP32_PATH,
    promptUser = true
  ): Promise<LedgerViewingKey> {
    try {
      await this.validateZip32Support();

      const { xfvk }: ResponseViewKey = await this.namadaApp.retrieveKeys(
        path,
        NamadaKeys.ViewKey,
        promptUser
      );

      if (!xfvk) {
        throw new Error("Did not receive viewing key!");
      }

      return {
        xfvk: new Uint8Array(xfvk),
      };
    } catch (e) {
      throw new Error(`${e}`);
    }
  }

  /**
   * Prompt user to get proof generation key associated with optional path, otherwise, use default path.
   * Throw exception if app is not initialized, zip32 is not supported, or key is not returned.
   * @async
   * @param [path] Zip32 path for deriving key
   * @param [promptUser] boolean to determine whether to display on Ledger device and require approval
   * @returns ShieldedKeys
   */
  public async getProofGenerationKey(
    path: string = DEFAULT_LEDGER_ZIP32_PATH,
    promptUser = true
  ): Promise<LedgerProofGenerationKey> {
    try {
      await this.validateZip32Support();

      const { ak, nsk }: ResponseProofGenKey =
        await this.namadaApp.retrieveKeys(
          path,
          NamadaKeys.ProofGenerationKey,
          promptUser
        );

      if (!ak || !nsk) {
        throw new Error("Did not receive proof generation key!");
      }

      return {
        ak: new Uint8Array(ak),
        nsk: new Uint8Array(nsk),
      };
    } catch (e) {
      throw new Error(`${e}`);
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

  /**
   * Check if Zip32 is supported by the installed app's version.
   * Throws error if app is not initialized
   * @async
   * @returns boolean
   */
  public async isZip32Supported(): Promise<boolean> {
    const {
      info: { appVersion },
      deviceId,
    } = await this.status();
    const isSupportedVersion = !semver.lt(appVersion, LEDGER_MIN_VERSION_ZIP32);
    const isSupportedDevice = deviceId !== LEDGER_MASP_BLACKLISTED;

    return isSupportedVersion && isSupportedDevice;
  }

  /**
   * Validate the version against the minimum required version and
   * device type for Zip32 functionality.
   * Throw error if it is unsupported or app is not initialized.
   * @async
   * @returns void
   */
  private async validateZip32Support(): Promise<void> {
    if (!(await this.isZip32Supported())) {
      const {
        info: { appVersion },
        deviceId,
        deviceName,
      } = await this.status();

      if (deviceId === LEDGER_MASP_BLACKLISTED) {
        throw new Error(`This method is not supported on ${deviceName}!`);
      }

      throw new Error(
        `This method requires Zip32 and is unsupported in ${appVersion}! ` +
          `Please update to at least ${LEDGER_MIN_VERSION_ZIP32}!`
      );
    }
  }
}
