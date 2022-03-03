import WalletFileManager from "./WalletFile";
import {
  KeyPair,
  KeyPairType,
  StorageValue,
  StorageValueUnencrypted,
} from "./KeyPair";

// keys to be used in TOML file
const key1 = "test-key-1";
const key2 = "test-key-2";
const key3 = "test-key-2";

const unencryptedPublicKey =
  "95b922ce1f3b69b60dd8949867be8694703509ef8a20ec83e436aa08a22edda4";
const unencryptedSecretKey =
  "f9e3191d096de7449f03fbfd03031f6b7ec23f1a048a53cbdb545c115a3b293e";
const encryptedPublicKey =
  "07730bb7916108406471722f19dab5474d6b59282f4f2c4741fabca4574374b9";
const encryptedSecretKey =
  "4273203d533f2195bb3a8f9ee83b0f9fe4329676c7459c3f3faf9529bb9162b1";

const STORAGE_VALUE: StorageValueUnencrypted = `unencrypted:20000000${unencryptedSecretKey}20000000${unencryptedPublicKey}`;

// these are what the wallet file contains
const TOML_STRING_UNENCRYPTED = `
[keys]
${key1} = "unencrypted:20000000${unencryptedSecretKey}2000000095b922ce1f3b69b60dd8949867be8694703509ef8a20ec83e436aa08a22edda4"
${key2} = "unencrypted:20000000f9e3191d096de7449f03fbfd03031f6b7ec23f1a048a53cbdb545c115a3b293e20000000${unencryptedPublicKey}"
`;

// and one with a encrypted key pair
// the password for the below key-3 is "aaa"
const TOML_STRING_ENCRYPTED = `
[keys]
${key1} = "unencrypted:20000000${unencryptedSecretKey}2000000095b922ce1f3b69b60dd8949867be8694703509ef8a20ec83e436aa08a22edda4"
${key3} = "encrypted:ec5d6c48eb2e27423533f56d4fcea010d6711055fda0f3bd146b555e88ef4bf5e3ec447bab58537e55c2ff87aa9e5e08cf41db3f472d55fa766fa48bf122004e6ab4421142329055989bdf51bd2307a2fe24f0babea4bceb90eee91347188e3b6f0f23d1e3fff690f10ebd1c593d2167c773baf2967b60fde51c71cae64c6b3c"
`;

test("WalletFile should be able to be initialized from toml string", () => {
  const walletFileManager = new WalletFileManager(TOML_STRING_UNENCRYPTED);

  const keyNamesFromFileManager = Object.getOwnPropertyNames(
    walletFileManager.keys
  );

  expect(keyNamesFromFileManager.length).toEqual(2);
  expect(keyNamesFromFileManager[0]).toEqual(key1);
  expect(keyNamesFromFileManager[1]).toEqual(key2);
});

test("WalletFile should be able to be initialized with an empty toml string", () => {
  const emptyTomlFile = "";
  const walletFileManager = new WalletFileManager(emptyTomlFile);
  const keyNamesFromFileManager = Object.getOwnPropertyNames(
    walletFileManager.keys
  );

  expect(keyNamesFromFileManager.length).toEqual(0);
});

test("should be able to add KeyPairs and generate a storage file", () => {
  const emptyTomlFile = "";
  const walletFileManager = new WalletFileManager(emptyTomlFile);

  // initialized with an empty string
  expect(walletFileManager.generateStorageFile()).toEqual("");

  const storageValue: StorageValue = {
    value: STORAGE_VALUE,
    keyPairType: KeyPairType.Raw,
  };

  // add a KeyPair
  const keyPairToAdd = KeyPair.fromStorageValue(storageValue, KeyPairType.Raw);
  const aliasToUse = "alias1";
  walletFileManager.setKeyPairByAlias(aliasToUse, keyPairToAdd);
  const generatedStorageFile = walletFileManager.generateStorageFile();
  const expectedTomlFile = `[keys]
${aliasToUse} = "unencrypted:20000000${unencryptedSecretKey}2000000095b922ce1f3b69b60dd8949867be8694703509ef8a20ec83e436aa08a22edda4"`;
  expect(generatedStorageFile.trim()).toEqual(expectedTomlFile.trim());
});

test("Should be able to retrieve correct key pair from initialized unencrypted KeyPair", () => {
  const walletFileManager = new WalletFileManager(TOML_STRING_UNENCRYPTED);

  const secretKeyInKeyPair1 = walletFileManager.keys[key1].getSecretKeyAsHex();
  expect(secretKeyInKeyPair1).toEqual(unencryptedSecretKey);

  const publicKeyInKeyPair2 = walletFileManager.keys[key2].getPublicKeyAsHex();
  expect(publicKeyInKeyPair2).toEqual(unencryptedPublicKey);
});

test("Should be able to retrieve correct key pair from initialized encrypted KeyPair", () => {
  const promptForPasswordDefault = (keyPairAlias: string) => {
    return "aaa";
  };
  const walletFileManager = new WalletFileManager(
    TOML_STRING_ENCRYPTED,
    promptForPasswordDefault
  );

  const secretKeyInKeyPair2 = walletFileManager.keys[key3].getSecretKeyAsHex();
  expect(secretKeyInKeyPair2).toEqual(encryptedSecretKey);

  const publicKeyInKeyPair2 = walletFileManager.keys[key3].getPublicKeyAsHex();
  expect(publicKeyInKeyPair2).toEqual(encryptedPublicKey);
});

test("Should not be able to retrieve key pair from initialized encrypted KeyPair", () => {
  const promptForPasswordDefault = (keyPairAlias: string) => {
    return "wrong_password";
  };

  const runFailingCall = () => {
    const _walletFileManager = new WalletFileManager(
      TOML_STRING_ENCRYPTED,
      promptForPasswordDefault
    );
  };

  expect(runFailingCall).toThrowError(
    "Error: could not decrypt the key pair with given password"
  );
});

test("should not be able to overwrite a KeyPairs without explicitly enforcing it", () => {
  const emptyTomlFile = "";
  const walletFileManager = new WalletFileManager(emptyTomlFile);

  // initialized with an empty string
  expect(walletFileManager.generateStorageFile()).toEqual("");

  const storageValue: StorageValue = {
    value: STORAGE_VALUE,
    keyPairType: KeyPairType.Raw,
  };

  // add a KeyPair
  const keyPairToAdd = KeyPair.fromStorageValue(storageValue, KeyPairType.Raw);
  const aliasToUse = "alias1";
  walletFileManager.setKeyPairByAlias(aliasToUse, keyPairToAdd);

  // try to override a key
  const runFailingCall = () => {
    walletFileManager.setKeyPairByAlias(aliasToUse, keyPairToAdd);
  };

  expect(runFailingCall).toThrowError();
});

test("should be able to overwrite a KeyPairs when explicitly enforcing it", () => {
  const emptyTomlFile = "";
  const walletFileManager = new WalletFileManager(emptyTomlFile);

  // initialized with an empty string
  expect(walletFileManager.generateStorageFile()).toEqual("");

  const storageValue: StorageValue = {
    value: STORAGE_VALUE,
    keyPairType: KeyPairType.Raw,
  };

  const unencryptedSecretKey2 =
    "f9e3191d096de7449f03fbfd03031f6b7ec23f1a048a53cbdb545c115a3b293f";
  const storageValue2: StorageValue = {
    value: `unencrypted:20000000${unencryptedSecretKey2}20000000${unencryptedPublicKey}`,
    keyPairType: KeyPairType.Raw,
  };

  // The key pairs that we are going to set
  const keyPairToAdd = KeyPair.fromStorageValue(storageValue, KeyPairType.Raw);
  const keyPairToAdd2 = KeyPair.fromStorageValue(
    storageValue2,
    KeyPairType.Raw
  );

  const aliasToUse = "alias1";

  // set a KeyPair by alias
  walletFileManager.setKeyPairByAlias(aliasToUse, keyPairToAdd);

  // retrieve the KeyPair behind the alias
  const storageValueBeforeResetting = walletFileManager
    .getKeyPairByAlias(aliasToUse)
    .getStorageValue();

  // override a KeyPair by alias by using force true
  walletFileManager.setKeyPairByAlias(aliasToUse, keyPairToAdd2, true);

  // retrieve the KeyPair again behind the same alias as before
  const storageValueAfterResetting = walletFileManager
    .getKeyPairByAlias(aliasToUse)
    .getStorageValue();

  // assert that the value behind the alias has changed
  expect(JSON.stringify(storageValueBeforeResetting)).not.toEqual(
    JSON.stringify(storageValueAfterResetting)
  );

  // also assert that we only have one keyPair under keys
  expect(Object.getOwnPropertyNames(walletFileManager.keys).length).toEqual(1);
});
