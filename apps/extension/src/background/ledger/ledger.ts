import {
  NamadaApp,
  ResponseAppInfo,
  ResponseVersion,
} from "@zondax/ledger-namada";
import TransportUSB from "@ledgerhq/hw-transport-webusb";
import TransportHID from "@ledgerhq/hw-transport-webhid";

import { defaultChainId, chains } from "@anoma/chains";
import Transport from "@ledgerhq/hw-transport";

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

  static async init(): Promise<Ledger> {
    const transportHID = await initLedgerHIDTransport();

    const namadaApp = new NamadaApp(transportHID);
    const ledger = new Ledger(namadaApp);

    ledger.version = await namadaApp.getVersion();
    ledger.info = await namadaApp.getAppInfo();

    return ledger;
  }

  public async getPublicKey(bip44Path?: string): Promise<string> {
    const path = bip44Path || DEFAULT_LEDGER_BIP44_PATH;
    const pk = await this.namadaApp?.getAddressAndPubKey(path);

    if (pk && pk.publicKey) {
      return pk.publicKey.toString();
    }

    return Promise.reject(`No public key found for ${this.info?.appName}!`);
  }
}
