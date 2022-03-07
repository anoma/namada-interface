"use strict";
exports.__esModule = true;
exports.WalletFileManager = void 0;
var toml_1 = require("@iarna/toml");
var KeyPair_1 = require("./KeyPair");
var WalletFileManager = /** @class */ (function () {
    function WalletFileManager(tomlString, promptForPassword) {
        var _this = this;
        this.setKeyPairByAlias = function (alias, keyPair, force) {
            if (!force && alias in _this.keys) {
                throw new Error("key exists already");
            }
            _this.keys[alias] = keyPair;
            return _this.keys;
        };
        this.getKeyPairByAlias = function (alias) {
            try {
                return _this.keys[alias];
            }
            catch (error) {
                throw error;
            }
        };
        this.generateWalletFileKeys = function () {
            var keyPairs = {};
            var keys = Object.getOwnPropertyNames(_this.keys);
            if (keys.length === 0) {
                return undefined;
            }
            keys.forEach(function (key) {
                var keyPair = _this.keys[key];
                keyPairs[key] = keyPair.getStorageValue().value;
            });
            return keyPairs;
        };
        this.generateStorageFile = function () {
            var fileContent = _this.generateWalletFileKeys();
            var toml = (0, toml_1.stringify)({ keys: fileContent });
            return toml.trim();
        };
        this.keys = {};
        var parsed = (0, toml_1.parse)(tomlString);
        if (!("keys" in parsed)) {
            return;
        }
        Object.getOwnPropertyNames(parsed.keys).forEach(function (key) {
            try {
                var keysAsStorageValue = KeyPair_1.KeyPair.storageValueStringToStorageValue(parsed.keys[key]);
                var keyPair = void 0;
                // based on whether we have an encrypted key pair we call one of the 2 signatures
                if (keysAsStorageValue.keyPairType === KeyPair_1.KeyPairType.Encrypted) {
                    var password = promptForPassword(key);
                    keyPair = KeyPair_1.KeyPair.fromStorageValue(keysAsStorageValue, keysAsStorageValue.keyPairType, password);
                }
                else {
                    keyPair = KeyPair_1.KeyPair.fromStorageValue(keysAsStorageValue, keysAsStorageValue.keyPairType);
                }
                _this.keys[key] = keyPair;
            }
            catch (error) {
                throw error;
            }
        });
    }
    return WalletFileManager;
}());
exports.WalletFileManager = WalletFileManager;
