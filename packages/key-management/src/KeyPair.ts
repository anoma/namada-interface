import { AnomaClient, Keypair as WasmKeypair } from "@anoma-apps/anoma-lib";
import { toHex, fromHex } from "@cosmjs/encoding";
import { Buffer } from "buffer";
import { Mnemonic } from "./Mnemonic";

const ENCRYPTED_KEY_PREFIX = "encrypted:";
const UNENCRYPTED_KEYS_PREFIX = "20000000";

// this is the string that represents unencrypted KeyPair
// format is this:
// unencrypted:20000000secretKey20000000publicKey
type UnencryptedStorageKey = `${typeof UNENCRYPTED_KEYS_PREFIX}${string}`;

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
 * This is the KeyPair containing public and secret keys. It can be constructed
 * from an existing keypair that is being stored as a string. This value is called
 * StorageValue and it can be stored encrypted or unencryted. We can also construct
 * a new KeyPair from a mnemonic.
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
  // eslint-disable-next-line max-len
  // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#strict-class-initialization
  // using this as we init with factory and not with a constructor
  // doing this for all fields
  keyPairType!: KeyPairType;

  // this is the value that is being stored in the wallet file
  // unencrypted:20000000f9e3191...
  // encrypted:ec5d6c48eb2e27423...
  private storageValue!: StorageValue;

  // This is the pointer to the wasm KeyPair
  private keyPairPointer!: WasmKeypair;

  // byte array representation of the encrypted KeyPair (redundant here?)
  private encryptedKeyPair!: Uint8Array;

  // Constructs a KeyPair from mnemonic
  // if password
  static fromMnemonic(mnemonic: Mnemonic, password: string): Promise<KeyPair>;

  static fromMnemonic(mnemonic: Mnemonic): Promise<KeyPair>;

  static async fromMnemonic(
    mnemonic: Mnemonic,
    password?: string
  ): Promise<KeyPair> {
    const self = new KeyPair();
    const { keypair } = await new AnomaClient().init();
    const keyPairPointer = keypair.from_mnemonic(mnemonic.value, 1);

    self.keyPairPointer = keyPairPointer;
    self.keyPairType = password ? KeyPairType.Encrypted : KeyPairType.Raw;

    if (self.keyPairType === KeyPairType.Raw) {
      const keyPairAsHex = self.toKeyPairHexString();
      const storageValue: StorageValue = {
        value: `unencrypted:${keyPairAsHex}`,
        keyPairType: self.keyPairType,
      };
      self.storageValue = storageValue;
    } else if (password) {
      // note we have actually figured out that we have a password here,
      // this is just to satisfy ts
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

  // factory for an unencrypted storage value
  static fromStorageValue(
    storageValue: StorageValue,
    keyPairType: KeyPairType.Raw
  ): Promise<KeyPair>;

  // factory for a KeyPair from a encrypted storage value
  static fromStorageValue(
    storageValue: StorageValue,
    keyPairType: KeyPairType.Encrypted,
    password: string
  ): Promise<KeyPair>;

  // TODO: remove the KeyPairType, it's redundant, instead derive
  // the info from the storage value string
  static async fromStorageValue(
    storageValue: StorageValue,
    keyPairType: KeyPairType,
    password?: string
  ): Promise<KeyPair> {
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
      } else if (password) {
        const keyPairPointer = self.encryptedStorageValueToKeyPair(
          storageValue.value,
          password
        );
        self.keyPairPointer = keyPairPointer;
      }
      return self;
    } catch (error) {
      const errorAsString = String(error) || "unknown error";
      throw new Error(errorAsString);
    }
  }

  // turns a storage value string to StorageValue object
  // "unencrypted:20000000f9e3191d096... -> StorageValue
  // "encrypted:ec5d6c48eb2e27423533f... -> StorageValue
  static storageValueStringToStorageValue = (
    storageValueString: string
  ): StorageValue | undefined => {
    let storageValue: StorageValue;
    if (storageValueString.startsWith("unencrypted:")) {
      storageValue = {
        value: storageValueString as StorageValueUnencrypted,
        keyPairType: KeyPairType.Raw,
      };
      return storageValue;
    } else if (storageValueString.startsWith("encrypted:")) {
      storageValue = {
        value: storageValueString as StorageValueEncrypted,
        keyPairType: KeyPairType.Encrypted,
      };
      return storageValue;
    }
  };

  getStorageValue = (): StorageValue => {
    return this.storageValue;
  };

  getPublicKeyAsHex = (): string => {
    const keyPairAsJsValue: KeyPairAsJsValue =
      this.keyPairPointer.from_pointer_to_js_value();

    return toHex(keyPairAsJsValue.public);
  };

  getSecretKeyAsHex = (): string => {
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
    const [, secretKeyAsHex, publicKeyAsHex] = valueWithStrippedPrefix.split(
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
    | `${UnencryptedStorageKey}${UnencryptedStorageKey}`
    | undefined => {
    // guard for running this for encrypted
    if (this.keyPairType === KeyPairType.Encrypted) return undefined;
    const keyPairAsJsValue: KeyPairAsJsValue =
      this.keyPairPointer.from_pointer_to_js_value();
    const publicKeyAsHex = toHex(keyPairAsJsValue.public);
    const secretKeyAsHex = toHex(keyPairAsJsValue.secret);

    // add prefixes and generate the merged value
    // eslint-disable-next-line max-len
    const publicKeyPrefixed: UnencryptedStorageKey = `${UNENCRYPTED_KEYS_PREFIX}${publicKeyAsHex}`;
    // eslint-disable-next-line max-len
    const secretKeyPrefixed: UnencryptedStorageKey = `${UNENCRYPTED_KEYS_PREFIX}${secretKeyAsHex}`;
    return `${publicKeyPrefixed}${secretKeyPrefixed}`;
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
