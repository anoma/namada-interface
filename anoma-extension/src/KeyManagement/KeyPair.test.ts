import { Mnemonic, MnemonicLength } from ".";
import { KeyPair, KeyPairType, StorageValue } from "./KeyPair";

// unencrypted keys
const UNENCRYPTED_KEY_PAIR_SECRET_KEY =
  "f9e3191d096de7449f03fbfd03031f6b7ec23f1a048a53cbdb545c115a3b293e";
const UNENCRYPTED_KEY_PAIR_PUBLIC_KEY =
  "95b922ce1f3b69b60dd8949867be8694703509ef8a20ec83e436aa08a22edda4";

const WRONG_UNENCRYPTED_KEY_PAIR_SECRET_KEY =
  "xxxxxxxxxx6de7449f03fbfd03031f6b7ec23f1a048a53cbdb545c115a3b293e";

const STORAGE_VALUE_FOR_UNENCRYPTED_KEY_PAIR: `unencrypted:${string}` = `unencrypted:20000000${UNENCRYPTED_KEY_PAIR_SECRET_KEY}20000000${UNENCRYPTED_KEY_PAIR_PUBLIC_KEY}`;

const WRONG_STORAGE_VALUE_FOR_UNENCRYPTED_KEY_PAIR: `unencrypted:${string}` = `unencrypted:20000000${WRONG_UNENCRYPTED_KEY_PAIR_SECRET_KEY}20000000${UNENCRYPTED_KEY_PAIR_PUBLIC_KEY}`;

// encrypted keys
const ENCRYPTED_KEY_PAIR_SECRET_KEY =
  "4273203d533f2195bb3a8f9ee83b0f9fe4329676c7459c3f3faf9529bb9162b1";
const ENCRYPTED_KEY_PAIR_PUBLIC_KEY =
  "07730bb7916108406471722f19dab5474d6b59282f4f2c4741fabca4574374b9";

const STORAGE_VALUE_FOR_ENCRYPTED_KEY_PAIR =
  "encrypted:ec5d6c48eb2e27423533f56d4fcea010d6711055fda0f3bd146b555e88ef4bf5e3ec447bab58537e55c2ff87aa9e5e08cf41db3f472d55fa766fa48bf122004e6ab4421142329055989bdf51bd2307a2fe24f0babea4bceb90eee91347188e3b6f0f23d1e3fff690f10ebd1c593d2167c773baf2967b60fde51c71cae64c6b3c";

const PASSWORD = "aaa";
const WRONG_PASSWORD = "wrongPassword";

test("key pair should be able to be generated from mnemonic", () => {
  const mnemonic = new Mnemonic(MnemonicLength.Twelve);
  const keyPair = KeyPair.fromMnemonic(mnemonic);
  expect(keyPair.getStorageValue().keyPairType).toEqual(KeyPairType.Raw);
});

test("key pair should be able to be generated from mnemonic with encryption", () => {
  const mnemonic = new Mnemonic(MnemonicLength.Twelve);

  const keyPair = KeyPair.fromMnemonic(mnemonic, PASSWORD);
  expect(keyPair.getStorageValue().keyPairType).toEqual(KeyPairType.Encrypted);
});

test("key pair should be able to be generated from storage value", () => {
  const storageValue: StorageValue = {
    value: STORAGE_VALUE_FOR_UNENCRYPTED_KEY_PAIR,
    keyPairType: KeyPairType.Raw,
  };
  const keyPair = KeyPair.fromStorageValue(storageValue, KeyPairType.Raw);
  expect(keyPair.getStorageValue().keyPairType).toEqual(KeyPairType.Raw);
});

test("key pair should be able to be generated from encrypted storage value", () => {
  const storageValue: StorageValue = {
    value: STORAGE_VALUE_FOR_ENCRYPTED_KEY_PAIR,
    keyPairType: KeyPairType.Encrypted,
  };

  const keyPair = KeyPair.fromStorageValue(
    storageValue,
    KeyPairType.Encrypted,
    PASSWORD
  );
  expect(keyPair.getStorageValue().keyPairType).toEqual(KeyPairType.Encrypted);
});

test("key pair should not be able to be generated from encrypted storage value with a wrong password", () => {
  const storageValue: StorageValue = {
    value: STORAGE_VALUE_FOR_ENCRYPTED_KEY_PAIR,
    keyPairType: KeyPairType.Encrypted,
  };

  const runFailingCall = () => {
    const keyPair = KeyPair.fromStorageValue(
      storageValue,
      KeyPairType.Encrypted,
      WRONG_PASSWORD
    );
  };

  const expectedError =
    "Error: could not decrypt the key pair with given password";

  expect(runFailingCall).toThrowError(expectedError);
});

test("should be able to retrieve a public and secret keys from the unencrypted storage value", () => {
  const storageValue: StorageValue = {
    value: STORAGE_VALUE_FOR_UNENCRYPTED_KEY_PAIR,
    keyPairType: KeyPairType.Raw,
  };

  const keyPair = KeyPair.fromStorageValue(storageValue, KeyPairType.Raw);

  expect(keyPair.getSecretKeyAsHex()).toEqual(UNENCRYPTED_KEY_PAIR_SECRET_KEY);
  expect(keyPair.getPublicKeyAsHex()).toEqual(UNENCRYPTED_KEY_PAIR_PUBLIC_KEY);
});

test("should not be able to retrieve a public or secret keys from the faulty unencrypted storage value", () => {
  const storageValue: StorageValue = {
    value: WRONG_STORAGE_VALUE_FOR_UNENCRYPTED_KEY_PAIR,
    keyPairType: KeyPairType.Raw,
  };

  const runFailingCall = () => {
    KeyPair.fromStorageValue(storageValue, KeyPairType.Raw);
  };

  expect(runFailingCall).toThrowError("Error: signature error");
});

test("should be able to retrieve a public and secret keys from the encrypted KeyPair storage value", () => {
  const storageValue: StorageValue = {
    value: STORAGE_VALUE_FOR_ENCRYPTED_KEY_PAIR,
    keyPairType: KeyPairType.Encrypted,
  };

  const keyPair = KeyPair.fromStorageValue(
    storageValue,
    KeyPairType.Encrypted,
    PASSWORD
  );
  const secretKeyAsHex = keyPair.getSecretKeyAsHex();
  const publicKeyAsHex = keyPair.getPublicKeyAsHex();

  expect(secretKeyAsHex).toEqual(ENCRYPTED_KEY_PAIR_SECRET_KEY);
  expect(keyPair.getPublicKeyAsHex()).toEqual(ENCRYPTED_KEY_PAIR_PUBLIC_KEY);
});
