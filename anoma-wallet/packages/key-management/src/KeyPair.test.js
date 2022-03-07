"use strict";
exports.__esModule = true;
var Mnemonic_1 = require("./Mnemonic");
var KeyPair_1 = require("./KeyPair");
// unencrypted keys
var UNENCRYPTED_KEY_PAIR_SECRET_KEY = "f9e3191d096de7449f03fbfd03031f6b7ec23f1a048a53cbdb545c115a3b293e";
var UNENCRYPTED_KEY_PAIR_PUBLIC_KEY = "95b922ce1f3b69b60dd8949867be8694703509ef8a20ec83e436aa08a22edda4";
var WRONG_UNENCRYPTED_KEY_PAIR_SECRET_KEY = "xxxxxxxxxx6de7449f03fbfd03031f6b7ec23f1a048a53cbdb545c115a3b293e";
var STORAGE_VALUE_FOR_UNENCRYPTED_KEY_PAIR = "unencrypted:20000000".concat(UNENCRYPTED_KEY_PAIR_SECRET_KEY, "20000000").concat(UNENCRYPTED_KEY_PAIR_PUBLIC_KEY);
var WRONG_STORAGE_VALUE_FOR_UNENCRYPTED_KEY_PAIR = "unencrypted:20000000".concat(WRONG_UNENCRYPTED_KEY_PAIR_SECRET_KEY, "20000000").concat(UNENCRYPTED_KEY_PAIR_PUBLIC_KEY);
// encrypted keys
var ENCRYPTED_KEY_PAIR_SECRET_KEY = "4273203d533f2195bb3a8f9ee83b0f9fe4329676c7459c3f3faf9529bb9162b1";
var ENCRYPTED_KEY_PAIR_PUBLIC_KEY = "07730bb7916108406471722f19dab5474d6b59282f4f2c4741fabca4574374b9";
var STORAGE_VALUE_FOR_ENCRYPTED_KEY_PAIR = "encrypted:ec5d6c48eb2e27423533f56d4fcea010d6711055fda0f3bd146b555e88ef4bf5e3ec447bab58537e55c2ff87aa9e5e08cf41db3f472d55fa766fa48bf122004e6ab4421142329055989bdf51bd2307a2fe24f0babea4bceb90eee91347188e3b6f0f23d1e3fff690f10ebd1c593d2167c773baf2967b60fde51c71cae64c6b3c";
var PASSWORD = "aaa";
var WRONG_PASSWORD = "wrongPassword";
test("key pair should be able to be generated from mnemonic", function () {
    var mnemonic = new Mnemonic_1.Mnemonic(Mnemonic_1.MnemonicLength.Twelve);
    var keyPair = KeyPair_1.KeyPair.fromMnemonic(mnemonic);
    expect(keyPair.getStorageValue().keyPairType).toEqual(KeyPair_1.KeyPairType.Raw);
});
test("key pair should be able to be generated from mnemonic with encryption", function () {
    var mnemonic = new Mnemonic_1.Mnemonic(Mnemonic_1.MnemonicLength.Twelve);
    var keyPair = KeyPair_1.KeyPair.fromMnemonic(mnemonic, PASSWORD);
    expect(keyPair.getStorageValue().keyPairType).toEqual(KeyPair_1.KeyPairType.Encrypted);
});
test.skip("key pair from a certain mnemonic should be repeatable", function () {
    var mnemonic_test = Mnemonic_1.Mnemonic.fromString("safe tortoise bridge pumpkin pigeon brother design that tide prepare trade elephant");
    var firstKeyPair = KeyPair_1.KeyPair.fromMnemonic(mnemonic_test, PASSWORD);
    var secondKeyPair = KeyPair_1.KeyPair.fromMnemonic(mnemonic_test, PASSWORD);
    expect(firstKeyPair.getStorageValue().value).toEqual(secondKeyPair.getStorageValue().value);
});
test("key pair should be able to be generated from storage value", function () {
    var storageValue = {
        value: STORAGE_VALUE_FOR_UNENCRYPTED_KEY_PAIR,
        keyPairType: KeyPair_1.KeyPairType.Raw
    };
    var keyPair = KeyPair_1.KeyPair.fromStorageValue(storageValue, KeyPair_1.KeyPairType.Raw);
    expect(keyPair.getStorageValue().keyPairType).toEqual(KeyPair_1.KeyPairType.Raw);
});
test("key pair should be able to be generated from encrypted storage value", function () {
    var storageValue = {
        value: STORAGE_VALUE_FOR_ENCRYPTED_KEY_PAIR,
        keyPairType: KeyPair_1.KeyPairType.Encrypted
    };
    var keyPair = KeyPair_1.KeyPair.fromStorageValue(storageValue, KeyPair_1.KeyPairType.Encrypted, PASSWORD);
    expect(keyPair.getStorageValue().keyPairType).toEqual(KeyPair_1.KeyPairType.Encrypted);
});
test("key pair should not be able to be generated from encrypted storage value with a wrong password", function () {
    var storageValue = {
        value: STORAGE_VALUE_FOR_ENCRYPTED_KEY_PAIR,
        keyPairType: KeyPair_1.KeyPairType.Encrypted
    };
    var runFailingCall = function () {
        var keyPair = KeyPair_1.KeyPair.fromStorageValue(storageValue, KeyPair_1.KeyPairType.Encrypted, WRONG_PASSWORD);
    };
    var expectedError = "Error: could not decrypt the key pair with given password";
    expect(runFailingCall).toThrowError(expectedError);
});
test("should be able to retrieve a public and secret keys from the unencrypted storage value", function () {
    var storageValue = {
        value: STORAGE_VALUE_FOR_UNENCRYPTED_KEY_PAIR,
        keyPairType: KeyPair_1.KeyPairType.Raw
    };
    var keyPair = KeyPair_1.KeyPair.fromStorageValue(storageValue, KeyPair_1.KeyPairType.Raw);
    expect(keyPair.getSecretKeyAsHex()).toEqual(UNENCRYPTED_KEY_PAIR_SECRET_KEY);
    expect(keyPair.getPublicKeyAsHex()).toEqual(UNENCRYPTED_KEY_PAIR_PUBLIC_KEY);
});
test("should not be able to retrieve a public or secret keys from the faulty unencrypted storage value", function () {
    var storageValue = {
        value: WRONG_STORAGE_VALUE_FOR_UNENCRYPTED_KEY_PAIR,
        keyPairType: KeyPair_1.KeyPairType.Raw
    };
    var runFailingCall = function () {
        KeyPair_1.KeyPair.fromStorageValue(storageValue, KeyPair_1.KeyPairType.Raw);
    };
    expect(runFailingCall).toThrowError("Error: signature error");
});
test("should be able to retrieve a public and secret keys from the encrypted KeyPair storage value", function () {
    var storageValue = {
        value: STORAGE_VALUE_FOR_ENCRYPTED_KEY_PAIR,
        keyPairType: KeyPair_1.KeyPairType.Encrypted
    };
    var keyPair = KeyPair_1.KeyPair.fromStorageValue(storageValue, KeyPair_1.KeyPairType.Encrypted, PASSWORD);
    var secretKeyAsHex = keyPair.getSecretKeyAsHex();
    var publicKeyAsHex = keyPair.getPublicKeyAsHex();
    expect(secretKeyAsHex).toEqual(ENCRYPTED_KEY_PAIR_SECRET_KEY);
    expect(keyPair.getPublicKeyAsHex()).toEqual(ENCRYPTED_KEY_PAIR_PUBLIC_KEY);
});
