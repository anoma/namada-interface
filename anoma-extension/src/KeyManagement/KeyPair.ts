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

    // const secretArray: Uint8Array = new Uint8Array([
    //   2, 221, 52, 91, 141, 28, 5, 74, 253, 5, 118, 239, 176, 126, 105, 109, 240,
    //   74, 177, 190, 11, 9, 9, 143, 222, 96, 51, 54, 198, 234, 50, 214,
    // ]);
    // const publicArray: Uint8Array = new Uint8Array([
    //   162, 202, 5, 36, 79, 95, 70, 154, 184, 128, 140, 189, 195, 31, 248, 54,
    //   143, 235, 115, 43, 134, 207, 233, 163, 113, 225, 38, 209, 193, 169, 90,
    //   51,
    // ]);

    // WasmKeypair.from_js_value_to_pointer({
    //   secret: secretArray,
    //   public: publicArray,
    // });
    // WasmKeypair.from_js_value_to_pointer(
    //   keyPairPointer.from_pointer_to_js_value()
    // );

    console.log(keyPairPointer.from_pointer_to_js_value());
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

    // const publicKeyAsByteArray: Uint8Array = new Uint8Array(
    //   Buffer.from(publicKeyAsHex)
    // );
    // const secretKeyAsByteArray: Uint8Array = new Uint8Array(
    //   Buffer.from(secretKeyAsHex)
    // );

    const publicKeyAsByteArray: Uint8Array = fromHex(publicKeyAsHex);
    const secretKeyAsByteArray: Uint8Array = fromHex(secretKeyAsHex);

    const keyPairAsJsValue: KeyPairAsJsValue = {
      public: publicKeyAsByteArray,
      secret: secretKeyAsByteArray,
    };

    // use conversion in wasm
    try {
      const keyPairPointer =
        WasmKeypair.from_js_value_to_pointer(keyPairAsJsValue);
      return keyPairPointer;
    } catch (error) {}
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
    const encryptedKeyPairAsByteArray = fromHex(valueWithStrippedPrefix);
    const unencryptedKeyPair = WasmKeypair.decrypt_with_password(
      encryptedKeyPairAsByteArray,
      password
    );

    return unencryptedKeyPair;
  };

  private toKeyPairHexString = (): string => {
    // retrieve js value from the wasm pointer
    const keyPairAsJsValue = this.keyPairPointer.from_pointer_to_js_value();

    // turn them to hex
    // const publicKeyAsHex = Buffer.from(keyPairAsJsValue.public).toString("hex");
    // const secretKeyAsHex = Buffer.from(keyPairAsJsValue.secret).toString("hex");

    const publicKeyAsHex = toHex(keyPairAsJsValue.public);
    const secretKeyAsHex = toHex(keyPairAsJsValue.secret);

    const hex1 = toHex(keyPairAsJsValue.public);
    const againU8Array = fromHex(hex1);

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

const HEX_STRINGS = "0123456789abcdef";
const MAP_HEX = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  a: 10,
  b: 11,
  c: 12,
  d: 13,
  e: 14,
  f: 15,
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
};

// Fast Uint8Array to hex
function toHex(bytes) {
  return Array.from(bytes || [])
    .map((b: any) => HEX_STRINGS[b >> 4] + HEX_STRINGS[b & 15])
    .join("");
}

// Mimics Buffer.from(x, 'hex') logic
// Stops on first non-hex string and returns
// https://github.com/nodejs/node/blob/v14.18.1/src/string_bytes.cc#L246-L261
function fromHex(hexString) {
  const bytes = new Uint8Array(Math.floor((hexString || "").length / 2));
  let i;
  for (i = 0; i < bytes.length; i++) {
    const a = MAP_HEX[hexString[i * 2]];
    const b = MAP_HEX[hexString[i * 2 + 1]];
    if (a === undefined || b === undefined) {
      break;
    }
    bytes[i] = (a << 4) | b;
  }
  return i === bytes.length ? bytes : bytes.slice(0, i);
}
