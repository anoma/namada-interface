import { Keypair as WasmKeypair } from "./lib/anoma_wasm.js";
import { Mnemonic } from "./Mnemonic";

const ENCRYPTED_KEY_PREFIX = "encrypted:";
const UNENCRYPTED_KEYS_PREFIX = "20000000";

// this is the string that represents unencrypted KeyPair
// format is this:
// unencrypted:20000000secretKey20000000publicKey
type UnencryptedStorageValueKeyWithPrefix =
  `${typeof UNENCRYPTED_KEYS_PREFIX}${string}`;

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
  secret: Uint8Array;
  public: Uint8Array;
};

export type StorageValueEncrypted = `encrypted:${string}`;
export type StorageValueUnencrypted = `unencrypted:${string}`;
export type StorageValue =
  | {
      value: StorageValueEncrypted;
      keyPairType: KeyPairType.Encrypted;
    }
  | {
      value: StorageValueUnencrypted;
      keyPairType: KeyPairType.Raw;
    };

/**
 * This is wrapping a KeyPair living in rust code and that is referred here as
 * keyPairPointer: WasmKeypair This is the pointer to the struct in wasm.
 * This has a counterpart in js side called KeyPairAsJsValue
 *
 * This is the KeyPair containing public and secret keys. It can be constructed from an existing keypair that is being stored as a string. This value is called StorageValue and it can be stored encrypted or unencryted. We can also construct a new KeyPair from a mnemonic.
 *
 * Constructing KeyPair
 * Mnemonic -> KeyPair
 * StorageValue (encrypted) -> KeyPair
 * StorageValue (unencrypted) -> KeyPair
 *
 * Deriving values from KeyPair
 * KeyPair -> Mnemonic
 * KeyPair -> PublicKey
 * KeyPair -> SecretKey
 */
export class KeyPair {
  // indicates whether the KeyPair os encrypted or not
  keyPairType: KeyPairType;

  // this is the value that is being stored in the wallet file
  // unencrypted:20000000f9e3191...
  // encrypted:ec5d6c48eb2e27423...
  private storageValue: StorageValue;

  // This is the pointer to the wasm KeyPair
  private keyPairPointer: WasmKeypair;

  // byte array representation of the encrypted KeyPair (redundant here?)
  private encryptedKeyPair: Uint8Array;

  // Constructs a KeyPair from mnemonic
  // if password
  static fromMnemonic(mnemonic: Mnemonic, password: string): KeyPair;

  static fromMnemonic(mnemonic: Mnemonic): KeyPair;

  static fromMnemonic(mnemonic: Mnemonic, password?: string): KeyPair {
    const self = new KeyPair();
    const keyPairPointer = WasmKeypair.from_mnemonic(mnemonic.value, 1);

    self.keyPairPointer = keyPairPointer;
    self.keyPairType = password ? KeyPairType.Encrypted : KeyPairType.Raw;

    if (self.keyPairType === KeyPairType.Raw) {
      const keyPairAsHex = self.toKeyPairHexString();
      const storageValue: StorageValue = {
        value: `unencrypted:${keyPairAsHex}`,
        keyPairType: self.keyPairType,
      };
      self.storageValue = storageValue;
    } else {
      const keyPairEncryptedAsHex = self.encryptWithPassword(password);
      const storageValue: StorageValue = {
        keyPairType: self.keyPairType,
        value: `encrypted:${keyPairEncryptedAsHex}`,
      };
      self.storageValue = storageValue;
      self.encryptedKeyPair = Buffer.from(keyPairEncryptedAsHex);
    }
    return self;
  }

  // constructor for an unencrypted storage value
  static fromStorageValue(
    storageValue: StorageValue,
    keyPairType: KeyPairType.Raw
  );

  // constructor for a KeyPair from a encrypted storage value
  static fromStorageValue(
    storageValue: StorageValue,
    keyPairType: KeyPairType.Encrypted,
    password: string
  );

  // TODO: remove the KeyPairType from here and derive from the string
  static fromStorageValue(
    storageValue: StorageValue,
    keyPairType: KeyPairType,
    password?: string
  ): KeyPair {
    const self = new KeyPair();
    self.keyPairType = keyPairType;
    self.storageValue = storageValue;
    // the KeyPair is to be persisted either Encrypted or Raw (unencrypted)
    try {
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
    } catch (error) {
      throw new Error(error);
    }
  }

  // turns a storage value string to StorageValue object
  // "unencrypted:20000000f9e3191d096... -> StorageValue
  // "encrypted:ec5d6c48eb2e27423533f... -> StorageValue
  static storageValueStringToStorageValue = (
    storageValueString: string
  ): StorageValue => {
    let storageValue: StorageValue;
    if (storageValueString.startsWith("unencrypted:")) {
      storageValue = {
        value: storageValueString as StorageValueUnencrypted,
        keyPairType: KeyPairType.Raw,
      };
    } else if (storageValueString.startsWith("encrypted:")) {
      storageValue = {
        value: storageValueString as StorageValueEncrypted,
        keyPairType: KeyPairType.Encrypted,
      };
    }
    return storageValue;
  };

  getStorageValue = (): StorageValue => {
    return this.storageValue;
  };

  getPublicKeyAsHex = (password?: string) => {
    const keyPairAsJsValue: KeyPairAsJsValue =
      this.keyPairPointer.from_pointer_to_js_value();

    return toHex(keyPairAsJsValue.public);
  };

  getSecretKeyAsHex = (password?: string) => {
    const keyPairAsJsValue: KeyPairAsJsValue =
      this.keyPairPointer.from_pointer_to_js_value();

    return toHex(keyPairAsJsValue.secret);
  };

  // packing the process of turning a string containing a KeyPair to WasmKeypair
  private unencryptedStorageValueToKeyPair = (
    storageValueUnencrypted: StorageValueUnencrypted
  ): WasmKeypair => {
    // remove prefix
    const valueWithStrippedPrefix = storageValueUnencrypted.substring(
      UNENCRYPTED_KEYS_PREFIX.length
    );

    // split to public and secret keys
    const [_, secretKeyAsHex, publicKeyAsHex] = valueWithStrippedPrefix.split(
      UNENCRYPTED_KEYS_PREFIX
    );

    const publicKeyAsByteArray: Uint8Array = fromHex(publicKeyAsHex);
    const secretKeyAsByteArray: Uint8Array = fromHex(secretKeyAsHex);

    const keyPairAsJsValue: KeyPairAsJsValue = {
      secret: secretKeyAsByteArray,
      public: publicKeyAsByteArray,
    };

    // use conversion in wasm
    try {
      const keyPairPointer =
        WasmKeypair.from_js_value_to_pointer(keyPairAsJsValue);
      return keyPairPointer;
    } catch (error) {
      throw error;
    }
  };

  // packing the process of turning a string containing an unencrypted
  // KeyPair to WasmKeypair
  private encryptedStorageValueToKeyPair = (
    storageValueUnencrypted: StorageValueEncrypted,
    password: string
  ): WasmKeypair => {
    // remove prefix
    const valueWithStrippedPrefix = storageValueUnencrypted.substring(
      ENCRYPTED_KEY_PREFIX.length
    );

    // construct the type that reflects KeyPair type in js world
    const encryptedKeyPairAsByteArray = fromHex(valueWithStrippedPrefix);
    try {
      const unencryptedKeyPair = WasmKeypair.decrypt_with_password(
        encryptedKeyPairAsByteArray,
        password
      );

      if (typeof unencryptedKeyPair === "undefined") {
        throw new Error("could not decrypt the key pair with given password");
      }
      return unencryptedKeyPair;
    } catch (error) {
      throw error;
    }
  };

  // getter for self as KeyPair string, this is only for unencrypted
  private toKeyPairHexString = ():
    | `${UnencryptedStorageValueKeyWithPrefix}${UnencryptedStorageValueKeyWithPrefix}`
    | undefined => {
    // guard for running this for encrypted
    if (this.keyPairType === KeyPairType.Encrypted) return undefined;
    const keyPairAsJsValue: KeyPairAsJsValue =
      this.keyPairPointer.from_pointer_to_js_value();
    const publicKeyAsHex = toHex(keyPairAsJsValue.public);
    const secretKeyAsHex = toHex(keyPairAsJsValue.secret);

    // add prefixes and generate the merged value
    const publicKeyHexWithPrefix: UnencryptedStorageValueKeyWithPrefix = `${UNENCRYPTED_KEYS_PREFIX}${publicKeyAsHex}`;
    const secretKeyHexWithPrefix: UnencryptedStorageValueKeyWithPrefix = `${UNENCRYPTED_KEYS_PREFIX}${secretKeyAsHex}`;
    return `${publicKeyHexWithPrefix}${secretKeyHexWithPrefix}`;
  };

  // turns self to encrypted hex string
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

// utils for encodeing/decoding hex
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
