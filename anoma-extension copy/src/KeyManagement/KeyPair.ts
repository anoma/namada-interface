import { Keypair as WasmKeypair } from "./lib/anoma_wasm.js";
import { Mnemonic } from "./Mnemonic";

const ENCRYPTED_KEY_PREFIX = "encrypted:";
const UNENCRYPTED_KEY_PREFIX = "unencrypted:";
const UNENCRYPTED_KEYS_PREFIX = "20000000";

/**
 * This is the KeyPair entry in the wallet. Unlikely there is
 * a use case for unencrypted, but it is just for debugging and
 * compatibility with the CLI
 */
export enum KeyPairType {
  Encrypted,
  Raw,
}

type KeyPairAsJsValue = {
  public: Uint8Array;
  secret: Uint8Array;
};

type StorageValueEncrypted = `encrypted:${string}`;
type StorageValueUnencrypted = `unencrypted:${string}`;
export type StorageValue =
  | {
      value: StorageValueEncrypted;
      keyPairType: KeyPairType.Encrypted;
    }
  | {
      value: StorageValueUnencrypted;
      keyPairType: KeyPairType.Raw;
    };

export class KeyPair {
  keyPairType: KeyPairType;
  private storageValue: StorageValue;

  private keyPairPointer: WasmKeypair;

  private encryptedKeyPair: Uint8Array;

  static fromMnemonic = (
    mnemonic: Mnemonic,
    keyPairType: KeyPairType = KeyPairType.Raw,
    password?: string
  ): KeyPair => {
    const self = new KeyPair();

    const keyPairPointer = WasmKeypair.from_mnemonic(mnemonic.value, 1);
    self.keyPairPointer = keyPairPointer;
    self.keyPairType = keyPairType;
    console.log("AAA");
    WasmKeypair.from_js_value_to_pointer(keyPairPointer);

    // the KeyPair is to be persisted either Encrypted or Raw (unencrypted)
    if (keyPairType === KeyPairType.Raw) {
      const keyPairAsHex = self.toKeyPairHexString();
      const storageValue: StorageValue = {
        value: `unencrypted:${keyPairAsHex}`,
        keyPairType: keyPairType,
      };
      self.storageValue = storageValue;
    } else {
      const keyPairEncryptedAsHex = self.encryptWithPassword(password);
      self.storageValue.keyPairType = keyPairType;
      self.storageValue.value = `encrypted:${keyPairEncryptedAsHex}`;
      self.encryptedKeyPair = Buffer.from(keyPairEncryptedAsHex);
    }
    return self;
  };

  static fromStorageValue(
    storageValue: StorageValue,
    keyPairType: KeyPairType.Raw
  );

  static fromStorageValue(
    storageValue: StorageValue,
    keyPairType: KeyPairType.Encrypted,
    password: string
  );

  static fromStorageValue(
    storageValue: StorageValue,
    keyPairType: KeyPairType,
    password?: string
  ) {
    console.log("##### 2");
    console.log("##### 3");
    console.log(storageValue.keyPairType);
    const self = new KeyPair();
    self.keyPairType = keyPairType;

    // the KeyPair is to be persisted either Encrypted or Raw (unencrypted)
    if (storageValue.keyPairType === KeyPairType.Raw) {
      const keyPairPointer = self.unencryptedStorageValueToKeyPair(
        storageValue.value
      );
      self.keyPairPointer = keyPairPointer;
    } else {
      const keyPairPointer = self.encryptedStorageValueToKeyPair(
        storageValue.value,
        password
      );
      self.keyPairPointer = keyPairPointer;
    }
    console.log("##### 4");
    console.log(self);
    return self;
  }

  getStorageValue = (): StorageValue => {
    return this.storageValue;
  };

  private unencryptedStorageValueToKeyPair = (
    storageValueUnencrypted: StorageValueUnencrypted
  ) => {
    // remove prefix
    const valueWithStrippedPrefix = storageValueUnencrypted.substring(
      UNENCRYPTED_KEYS_PREFIX.length
    );

    // split to public and secret keys
    const [_, secretKeyAsHex, publicKeyAsHex] = valueWithStrippedPrefix.split(
      UNENCRYPTED_KEYS_PREFIX
    );

    console.log("publicKeyAsHex");
    // console.log(storageValueUnencrypted);
    // console.log(secretKeyAsHex);
    // console.log(publicKeyAsHex);
    // console.log(publicKeyAsHex.length);
    console.log("## publicKeyAsHex");
    // construct the type that reflects KeyPair type in js world

    const keyPairAsJsValue: KeyPairAsJsValue = {
      public: Buffer.from(publicKeyAsHex),
      secret: Buffer.from(secretKeyAsHex),
    };

    const publicKeyObject = {};
    const secretKeyObject = {};

    Buffer.from(publicKeyAsHex).map(
      (value, index) => (publicKeyObject[`${index}`] = value)
    );

    Buffer.from(secretKeyAsHex).map(
      (value, index) => (secretKeyObject[`${index}`] = value)
    );

    const keyPairAsJsValue2 = {
      secret: secretKeyObject,
      public: publicKeyObject,
    };

    // console.log(keyPairAsJsValue);
    console.log("##### 5.4");

    // use conversion in wasm
    try {
      const keyPairPointer =
        WasmKeypair.from_js_value_to_pointer(keyPairAsJsValue);
      const aaa = new WasmKeypair();

      console.log(keyPairPointer);
      console.log("##### 5.5");
      return keyPairPointer;
    } catch (error) {
      console.log("##### 5.6");
      console.log(error);
    }
  };

  private encryptedStorageValueToKeyPair = (
    storageValueUnencrypted: StorageValueEncrypted,
    password: string
  ) => {
    // remove prefix
    const valueWithStrippedPrefix = storageValueUnencrypted.substring(
      ENCRYPTED_KEY_PREFIX.length
    );

    // construct the type that reflects KeyPair type in js world
    const encryptedKeyPairAsByteArray = Buffer.from(valueWithStrippedPrefix);
    const aaa = WasmKeypair.decrypt_with_password(
      encryptedKeyPairAsByteArray,
      "aaa"
    );

    return aaa;
  };

  private toKeyPairHexString = (): string => {
    // retrieve js value from the wasm pointer
    const keyPairAsJsValue = this.keyPairPointer.from_pointer_to_js_value();

    // turn them to hex
    const publicKeyAsHex = Buffer.from(keyPairAsJsValue.public).toString("hex");
    const secretKeyAsHex = Buffer.from(keyPairAsJsValue.secret).toString("hex");

    // add prefixes and generate the merged value
    const publicKeyHexWithPrefix = `${UNENCRYPTED_KEYS_PREFIX}${publicKeyAsHex}`;
    const secretKeyHexWithPrefix = `${UNENCRYPTED_KEYS_PREFIX}${secretKeyAsHex}`;
    return `${publicKeyHexWithPrefix}${secretKeyHexWithPrefix}`;
  };

  private encryptWithPassword = (password: string): string => {
    // retrieve the by array of the encrypted KeyPair
    this.encryptedKeyPair = this.keyPairPointer.encrypt_with_password(password);

    // encode to hex string for persisting in the client
    const encryptedKeyPairAsHex = Buffer.from(this.encryptedKeyPair).toString(
      "hex"
    );
    return encryptedKeyPairAsHex;
  };
}
