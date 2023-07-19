import {
  NamadaApp,
  ResponseAppInfo,
  ResponseSign,
  ResponseVersion,
} from "@zondax/ledger-namada";
import TransportUSB from "@ledgerhq/hw-transport-webusb";
import TransportHID from "@ledgerhq/hw-transport-webhid";
import Transport from "@ledgerhq/hw-transport";

import { defaultChainId, chains } from "@namada/chains";

const namadaChain = chains[defaultChainId];
const bip44CoinType = namadaChain.bip44.coinType;

export const initLedgerUSBTransport = async (): Promise<Transport> => {
  return await TransportHID.create();
};

export const initLedgerHIDTransport = async (): Promise<Transport> => {
  return await TransportUSB.create();
};

export const DEFAULT_LEDGER_BIP44_PATH = `m/44'/${bip44CoinType}'/0'/0/0`;

export class Ledger {
  public version: ResponseVersion | undefined;
  public info: ResponseAppInfo | undefined;

  constructor(public readonly namadaApp: NamadaApp | undefined = undefined) {}

  /**
   * Returns an initialized Ledger class instance with initialized Transport
   */
  static async init(transport?: Transport): Promise<Ledger> {
    const initializedTransport = transport ?? (await initLedgerUSBTransport());

    const namadaApp = new NamadaApp(initializedTransport);
    const ledger = new Ledger(namadaApp);

    ledger.version = await namadaApp.getVersion();
    ledger.info = await namadaApp.getAppInfo();

    return ledger;
  }

  /**
   * Return status and version info of initialized NamadaApp
   */
  public status(): {
    appName: string;
    appVersion: string;
    errorMessage: string;
    returnCode: number;
    deviceLocked: boolean;
    major: number;
    minor: number;
    patch: number;
    targetId: string;
    testMode: boolean;
  } {
    if (!this.version || !this.info) {
      throw new Error("NamadaApp is not initialized!");
    }

    const { appName, appVersion, errorMessage, returnCode } = this.info;
    const {
      major,
      minor,
      patch,
      targetId,
      deviceLocked = false,
      testMode,
    } = this.version;

    return {
      appName,
      appVersion,
      errorMessage,
      returnCode,
      deviceLocked,
      major,
      minor,
      patch,
      targetId,
      testMode,
    };
  }

  /**
   * Get public key associated with optional path, otherwise, use default path
   */
  public async getPublicKey(bip44Path?: string): Promise<string> {
    if (!this.namadaApp) {
      throw new Error("NamadaApp is not initialized!");
    }

    const path = bip44Path || DEFAULT_LEDGER_BIP44_PATH;
    const { publicKey } = await this.namadaApp.getAddressAndPubKey(path);

    return publicKey.toString("hex");
  }

  /**
   * Sign tx bytes with the key associated with provided (or default) path
   */
  public async sign(tx: ArrayBuffer, bip44Path: string): Promise<ResponseSign> {
    if (!this.namadaApp) {
      throw new Error("NamadaApp is not initialized!");
    }

    const path = bip44Path || DEFAULT_LEDGER_BIP44_PATH;

    return await this.namadaApp.sign(path, Buffer.from(tx));
  }
}
