import { PhraseSize } from "@anoma/crypto";
import { KVStore } from "@anoma/storage";
import { KeyRing } from "./keyring";
import { KeyRingStatus } from "./types";

const keyRing = new KeyRing();

export class KeyRingService {
  constructor(protected readonly kvStore: KVStore) {
    this.kvStore = kvStore;
  }

  init() {
    console.debug("KeyStoreService initialized");
  }

  async lock(): Promise<{ status: KeyRingStatus }> {
    await keyRing.lock();
    return { status: keyRing.status };
  }

  async unlock(password: string): Promise<{ status: KeyRingStatus }> {
    if (!password) {
      throw new Error("A password is required to unlock keystore!");
    }
    await keyRing.unlock(password);
    return { status: keyRing.status };
  }

  async checkPassword(password: string): Promise<boolean> {
    return await keyRing.checkPassword(password);
  }

  async generateMnemonic(size?: PhraseSize): Promise<string[]> {
    return await keyRing.generateMnemonic(size);
  }
}
