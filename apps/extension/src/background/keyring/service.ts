import { ChainInfo as Chain } from "@keplr-wallet/types";
import { KVStore } from "@anoma/storage";
import { KeyRing, KeyRingStatus } from "./keyring";

const keyRing = new KeyRing();

export class KeyRingService {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly defaultChains: Chain[]
  ) {
    this.kvStore = kvStore;
  }

  init() {
    console.debug("ChainsService initialized");
  }

  async lock(): Promise<{ status: KeyRingStatus }> {
    // TODO
    return { status: keyRing.status };
  }

  async unlock(password: string): Promise<{ status: KeyRingStatus }> {
    // TODO
    if (!password) {
      throw new Error("A password is required to unlock keystore!");
    }
    return { status: keyRing.status };
  }

  async checkPassword(password: string): Promise<boolean> {
    // TODO
    return !!password;
  }
}
