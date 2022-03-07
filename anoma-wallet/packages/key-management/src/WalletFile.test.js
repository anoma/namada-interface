"use strict";
exports.__esModule = true;
var WalletFile_1 = require("./WalletFile");
var KeyPair_1 = require("./KeyPair");
// keys to be used in TOML file
var key1 = "test-key-1";
var key2 = "test-key-2";
var key3 = "test-key-2";
var unencryptedPublicKey = "95b922ce1f3b69b60dd8949867be8694703509ef8a20ec83e436aa08a22edda4";
var unencryptedSecretKey = "f9e3191d096de7449f03fbfd03031f6b7ec23f1a048a53cbdb545c115a3b293e";
var encryptedPublicKey = "07730bb7916108406471722f19dab5474d6b59282f4f2c4741fabca4574374b9";
var encryptedSecretKey = "4273203d533f2195bb3a8f9ee83b0f9fe4329676c7459c3f3faf9529bb9162b1";
var STORAGE_VALUE = "unencrypted:20000000".concat(unencryptedSecretKey, "20000000").concat(unencryptedPublicKey);
// these are what the wallet file contains
var TOML_STRING_UNENCRYPTED = "\n[keys]\n".concat(key1, " = \"unencrypted:20000000").concat(unencryptedSecretKey, "2000000095b922ce1f3b69b60dd8949867be8694703509ef8a20ec83e436aa08a22edda4\"\n").concat(key2, " = \"unencrypted:20000000f9e3191d096de7449f03fbfd03031f6b7ec23f1a048a53cbdb545c115a3b293e20000000").concat(unencryptedPublicKey, "\"\n");
// and one with a encrypted key pair
// the password for the below key-3 is "aaa"
var TOML_STRING_ENCRYPTED = "\n[keys]\n".concat(key1, " = \"unencrypted:20000000").concat(unencryptedSecretKey, "2000000095b922ce1f3b69b60dd8949867be8694703509ef8a20ec83e436aa08a22edda4\"\n").concat(key3, " = \"encrypted:ec5d6c48eb2e27423533f56d4fcea010d6711055fda0f3bd146b555e88ef4bf5e3ec447bab58537e55c2ff87aa9e5e08cf41db3f472d55fa766fa48bf122004e6ab4421142329055989bdf51bd2307a2fe24f0babea4bceb90eee91347188e3b6f0f23d1e3fff690f10ebd1c593d2167c773baf2967b60fde51c71cae64c6b3c\"\n");
test("WalletFile should be able to be initialized from toml string", function () {
    var walletFileManager = new WalletFile_1.WalletFileManager(TOML_STRING_UNENCRYPTED);
    var keyNamesFromFileManager = Object.getOwnPropertyNames(walletFileManager.keys);
    expect(keyNamesFromFileManager.length).toEqual(2);
    expect(keyNamesFromFileManager[0]).toEqual(key1);
    expect(keyNamesFromFileManager[1]).toEqual(key2);
});
test("WalletFile should be able to be initialized with an empty toml string", function () {
    var emptyTomlFile = "";
    var walletFileManager = new WalletFile_1.WalletFileManager(emptyTomlFile);
    var keyNamesFromFileManager = Object.getOwnPropertyNames(walletFileManager.keys);
    expect(keyNamesFromFileManager.length).toEqual(0);
});
test("should be able to add KeyPairs and generate a storage file", function () {
    var emptyTomlFile = "";
    var walletFileManager = new WalletFile_1.WalletFileManager(emptyTomlFile);
    // initialized with an empty string
    expect(walletFileManager.generateStorageFile()).toEqual("");
    var storageValue = {
        value: STORAGE_VALUE,
        keyPairType: KeyPair_1.KeyPairType.Raw
    };
    // add a KeyPair
    var keyPairToAdd = KeyPair_1.KeyPair.fromStorageValue(storageValue, KeyPair_1.KeyPairType.Raw);
    var aliasToUse = "alias1";
    walletFileManager.setKeyPairByAlias(aliasToUse, keyPairToAdd);
    var generatedStorageFile = walletFileManager.generateStorageFile();
    var expectedTomlFile = "[keys]\n".concat(aliasToUse, " = \"unencrypted:20000000").concat(unencryptedSecretKey, "2000000095b922ce1f3b69b60dd8949867be8694703509ef8a20ec83e436aa08a22edda4\"");
    expect(generatedStorageFile.trim()).toEqual(expectedTomlFile.trim());
});
test("Should be able to retrieve correct key pair from initialized unencrypted KeyPair", function () {
    var walletFileManager = new WalletFile_1.WalletFileManager(TOML_STRING_UNENCRYPTED);
    var secretKeyInKeyPair1 = walletFileManager.keys[key1].getSecretKeyAsHex();
    expect(secretKeyInKeyPair1).toEqual(unencryptedSecretKey);
    var publicKeyInKeyPair2 = walletFileManager.keys[key2].getPublicKeyAsHex();
    expect(publicKeyInKeyPair2).toEqual(unencryptedPublicKey);
});
test("Should be able to retrieve correct key pair from initialized encrypted KeyPair", function () {
    var promptForPasswordDefault = function (keyPairAlias) {
        return "aaa";
    };
    var walletFileManager = new WalletFile_1.WalletFileManager(TOML_STRING_ENCRYPTED, promptForPasswordDefault);
    var secretKeyInKeyPair2 = walletFileManager.keys[key3].getSecretKeyAsHex();
    expect(secretKeyInKeyPair2).toEqual(encryptedSecretKey);
    var publicKeyInKeyPair2 = walletFileManager.keys[key3].getPublicKeyAsHex();
    expect(publicKeyInKeyPair2).toEqual(encryptedPublicKey);
});
test("Should not be able to retrieve key pair from initialized encrypted KeyPair", function () {
    var promptForPasswordDefault = function (keyPairAlias) {
        return "wrong_password";
    };
    var runFailingCall = function () {
        var _walletFileManager = new WalletFile_1.WalletFileManager(TOML_STRING_ENCRYPTED, promptForPasswordDefault);
    };
    expect(runFailingCall).toThrowError("Error: could not decrypt the key pair with given password");
});
test("should not be able to overwrite a KeyPairs without explicitly enforcing it", function () {
    var emptyTomlFile = "";
    var walletFileManager = new WalletFile_1.WalletFileManager(emptyTomlFile);
    // initialized with an empty string
    expect(walletFileManager.generateStorageFile()).toEqual("");
    var storageValue = {
        value: STORAGE_VALUE,
        keyPairType: KeyPair_1.KeyPairType.Raw
    };
    // add a KeyPair
    var keyPairToAdd = KeyPair_1.KeyPair.fromStorageValue(storageValue, KeyPair_1.KeyPairType.Raw);
    var aliasToUse = "alias1";
    walletFileManager.setKeyPairByAlias(aliasToUse, keyPairToAdd);
    // try to override a key
    var runFailingCall = function () {
        walletFileManager.setKeyPairByAlias(aliasToUse, keyPairToAdd);
    };
    expect(runFailingCall).toThrowError();
});
test("should be able to overwrite a KeyPairs when explicitly enforcing it", function () {
    var emptyTomlFile = "";
    var walletFileManager = new WalletFile_1.WalletFileManager(emptyTomlFile);
    // initialized with an empty string
    expect(walletFileManager.generateStorageFile()).toEqual("");
    var storageValue = {
        value: STORAGE_VALUE,
        keyPairType: KeyPair_1.KeyPairType.Raw
    };
    var unencryptedSecretKey2 = "f9e3191d096de7449f03fbfd03031f6b7ec23f1a048a53cbdb545c115a3b293f";
    var storageValue2 = {
        value: "unencrypted:20000000".concat(unencryptedSecretKey2, "20000000").concat(unencryptedPublicKey),
        keyPairType: KeyPair_1.KeyPairType.Raw
    };
    // The key pairs that we are going to set
    var keyPairToAdd = KeyPair_1.KeyPair.fromStorageValue(storageValue, KeyPair_1.KeyPairType.Raw);
    var keyPairToAdd2 = KeyPair_1.KeyPair.fromStorageValue(storageValue2, KeyPair_1.KeyPairType.Raw);
    var aliasToUse = "alias1";
    // set a KeyPair by alias
    walletFileManager.setKeyPairByAlias(aliasToUse, keyPairToAdd);
    // retrieve the KeyPair behind the alias
    var storageValueBeforeResetting = walletFileManager
        .getKeyPairByAlias(aliasToUse)
        .getStorageValue();
    // override a KeyPair by alias by using force true
    walletFileManager.setKeyPairByAlias(aliasToUse, keyPairToAdd2, true);
    // retrieve the KeyPair again behind the same alias as before
    var storageValueAfterResetting = walletFileManager
        .getKeyPairByAlias(aliasToUse)
        .getStorageValue();
    // assert that the value behind the alias has changed
    expect(JSON.stringify(storageValueBeforeResetting)).not.toEqual(JSON.stringify(storageValueAfterResetting));
    // also assert that we only have one keyPair under keys
    expect(Object.getOwnPropertyNames(walletFileManager.keys).length).toEqual(1);
});
