import { parse, stringify } from "@iarna/toml";
import {
  KeyPair,
  KeyPairType,
  StorageValueEncrypted,
  StorageValueUnencrypted,
} from "./KeyPair";

type WalletFile = {
  keys?: Record<string, StorageValueEncrypted | StorageValueUnencrypted>;
};

export class WalletFileManager {
  keys: Record<string, KeyPair>;

  constructor(
    tomlString: string,
    promptForPassword?: (keyPairAlias: string) => string
  ) {
    this.keys = {};
    const parsed: WalletFile = parse(tomlString);
    if (!("keys" in parsed)) {
      return;
    }

    Object.getOwnPropertyNames(parsed.keys).forEach((key) => {
      try {
        const keysAsStorageValue = KeyPair.storageValueStringToStorageValue(
          parsed.keys[key]
        );
        let keyPair;

        // based on whether we have an encrypted key pair we call one of the 2 signatures
        if (keysAsStorageValue.keyPairType === KeyPairType.Encrypted) {
          const password = promptForPassword(key);
          keyPair = KeyPair.fromStorageValue(
            keysAsStorageValue,
            keysAsStorageValue.keyPairType,
            password
          );
        } else {
          keyPair = KeyPair.fromStorageValue(
            keysAsStorageValue,
            keysAsStorageValue.keyPairType
          );
        }

        this.keys[key] = keyPair;
      } catch (error) {
        throw error;
      }
    });
  }

  setKeyPairByAlias = (
    alias: string,
    keyPair: KeyPair,
    force?: boolean
  ): Record<string, KeyPair> => {
    if (!force && alias in this.keys) {
      throw new Error("key exists already");
    }
    this.keys[alias] = keyPair;
    return this.keys;
  };

  getKeyPairByAlias = (alias: string): KeyPair => {
    try {
      return this.keys[alias];
    } catch (error) {
      throw error;
    }
  };

  private generateWalletFileKeys = ():
    | { [key: string]: StorageValueEncrypted | StorageValueUnencrypted }
    | undefined => {
    const keyPairs = {};
    const keys = Object.getOwnPropertyNames(this.keys);
    if (keys.length === 0) {
      return undefined;
    }
    keys.forEach((key) => {
      const keyPair = this.keys[key];
      keyPairs[key] = keyPair.getStorageValue().value;
    });
    return keyPairs;
  };

  generateStorageFile = (): string => {
    const fileContent = this.generateWalletFileKeys();
    const toml = stringify({ keys: fileContent });
    return toml.trim();
  };
}
