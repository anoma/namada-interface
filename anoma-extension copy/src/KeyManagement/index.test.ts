import { Mnemonic, MnemonicLength } from ".";
import { KeyPair, KeyPairType, StorageValue } from "./KeyPair";

test("mnemonic should have correct length", () => {
  const mnemonic1 = new Mnemonic(MnemonicLength.Twelve);
  expect(mnemonic1.value.split(" ")).toHaveLength(12);

  const mnemonic2 = new Mnemonic(MnemonicLength.TwentyFour);
  expect(mnemonic2.value.split(" ")).toHaveLength(24);
});

test("key pair should be able to be generated from mnemonic", () => {
  const mnemonic1 = new Mnemonic(MnemonicLength.Twelve);
  const keyPair1 = KeyPair.fromMnemonic(mnemonic1);
  expect(mnemonic1.value.split(" ")).toHaveLength(12);
});

test("key pair should be able to be generated from mnemonic with encryption", () => {
  const mnemonic1 = new Mnemonic(MnemonicLength.Twelve);
  const keyPair1 = KeyPair.fromMnemonic(mnemonic1, KeyPairType.Raw);
});

test("key pair should be able to be generated from storage value", () => {
  const storageValue: StorageValue = {
    value:
      "unencrypted:20000000f9e3191d096de7449f03fbfd03031f6b7ec23f1a048a53cbdb545c115a3b293e2000000095b922ce1f3b69b60dd8949867be8694703509ef8a20ec83e436aa08a22edda4",
    keyPairType: KeyPairType.Raw,
  };
  const keyPair1 = KeyPair.fromStorageValue(storageValue, KeyPairType.Raw);
  expect(true).toBeTruthy();
});

test("key pair should be able to be generated from encrypted storage value", () => {
  const storageValue: StorageValue = {
    value:
      "encrypted:ec5d6c48eb2e27423533f56d4fcea010d6711055fda0f3bd146b555e88ef4bf5e3ec447bab58537e55c2ff87aa9e5e08cf41db3f472d55fa766fa48bf122004e6ab4421142329055989bdf51bd2307a2fe24f0babea4bceb90eee91347188e3b6f0f23d1e3fff690f10ebd1c593d2167c773baf2967b60fde51c71cae64c6b3c",
    keyPairType: KeyPairType.Encrypted,
  };

  const password = "aaa";

  const keyPair1 = KeyPair.fromStorageValue(
    storageValue,
    KeyPairType.Encrypted,
    password
  );
  console.log(JSON.stringify(keyPair1));
  expect(true).toBeTruthy();
});
