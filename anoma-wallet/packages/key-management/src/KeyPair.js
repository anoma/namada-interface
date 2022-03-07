"use strict";
exports.__esModule = true;
exports.KeyPair = exports.KeyPairType = void 0;
var anoma_wasm_js_1 = require("./lib/anoma_wasm.js");
var ENCRYPTED_KEY_PREFIX = "encrypted:";
var UNENCRYPTED_KEYS_PREFIX = "20000000";
/**
 * This is the KeyPair entry in the wallet. Unlikely there is
 * a use case for unencrypted, but it is just for debugging and
 * compatibility with the CLI
 */
var KeyPairType;
(function (KeyPairType) {
    KeyPairType[KeyPairType["Encrypted"] = 0] = "Encrypted";
    KeyPairType[KeyPairType["Raw"] = 1] = "Raw";
})(KeyPairType = exports.KeyPairType || (exports.KeyPairType = {}));
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
var KeyPair = /** @class */ (function () {
    function KeyPair() {
        var _this = this;
        this.getStorageValue = function () {
            return _this.storageValue;
        };
        this.getPublicKeyAsHex = function (password) {
            var keyPairAsJsValue = _this.keyPairPointer.from_pointer_to_js_value();
            return toHex(keyPairAsJsValue.public);
        };
        this.getSecretKeyAsHex = function (password) {
            var keyPairAsJsValue = _this.keyPairPointer.from_pointer_to_js_value();
            return toHex(keyPairAsJsValue.secret);
        };
        // packing the process of turning a string containing a KeyPair to WasmKeypair
        this.unencryptedStorageValueToKeyPair = function (storageValueUnencrypted) {
            // remove prefix
            var valueWithStrippedPrefix = storageValueUnencrypted.substring(UNENCRYPTED_KEYS_PREFIX.length);
            // split to public and secret keys
            var _a = valueWithStrippedPrefix.split(UNENCRYPTED_KEYS_PREFIX), _ = _a[0], secretKeyAsHex = _a[1], publicKeyAsHex = _a[2];
            var publicKeyAsByteArray = fromHex(publicKeyAsHex);
            var secretKeyAsByteArray = fromHex(secretKeyAsHex);
            var keyPairAsJsValue = {
                secret: secretKeyAsByteArray,
                public: publicKeyAsByteArray
            };
            // use conversion in wasm
            try {
                var keyPairPointer = anoma_wasm_js_1.Keypair.from_js_value_to_pointer(keyPairAsJsValue);
                return keyPairPointer;
            }
            catch (error) {
                throw error;
            }
        };
        // packing the process of turning a string containing an unencrypted
        // KeyPair to WasmKeypair
        this.encryptedStorageValueToKeyPair = function (storageValueUnencrypted, password) {
            // remove prefix
            var valueWithStrippedPrefix = storageValueUnencrypted.substring(ENCRYPTED_KEY_PREFIX.length);
            // construct the type that reflects KeyPair type in js world
            var encryptedKeyPairAsByteArray = fromHex(valueWithStrippedPrefix);
            try {
                var unencryptedKeyPair = anoma_wasm_js_1.Keypair.decrypt_with_password(encryptedKeyPairAsByteArray, password);
                if (typeof unencryptedKeyPair === "undefined") {
                    throw new Error("could not decrypt the key pair with given password");
                }
                return unencryptedKeyPair;
            }
            catch (error) {
                throw error;
            }
        };
        // getter for self as KeyPair string, this is only for unencrypted
        this.toKeyPairHexString = function () {
            // guard for running this for encrypted
            if (_this.keyPairType === KeyPairType.Encrypted)
                return undefined;
            var keyPairAsJsValue = _this.keyPairPointer.from_pointer_to_js_value();
            var publicKeyAsHex = toHex(keyPairAsJsValue.public);
            var secretKeyAsHex = toHex(keyPairAsJsValue.secret);
            // add prefixes and generate the merged value
            var publicKeyHexWithPrefix = "".concat(UNENCRYPTED_KEYS_PREFIX).concat(publicKeyAsHex);
            var secretKeyHexWithPrefix = "".concat(UNENCRYPTED_KEYS_PREFIX).concat(secretKeyAsHex);
            return "".concat(publicKeyHexWithPrefix).concat(secretKeyHexWithPrefix);
        };
        // turns self to encrypted hex string
        this.encryptWithPassword = function (password) {
            // retrieve the by array of the encrypted KeyPair
            _this.encryptedKeyPair = _this.keyPairPointer.encrypt_with_password(password);
            // encode to hex string for persisting in the client
            var encryptedKeyPairAsHex = Buffer.from(_this.encryptedKeyPair).toString("hex");
            return encryptedKeyPairAsHex;
        };
    }
    KeyPair.fromMnemonic = function (mnemonic, password) {
        var self = new KeyPair();
        var keyPairPointer = anoma_wasm_js_1.Keypair.from_mnemonic(mnemonic.value, 1);
        self.keyPairPointer = keyPairPointer;
        self.keyPairType = password ? KeyPairType.Encrypted : KeyPairType.Raw;
        if (self.keyPairType === KeyPairType.Raw) {
            var keyPairAsHex = self.toKeyPairHexString();
            var storageValue = {
                value: "unencrypted:".concat(keyPairAsHex),
                keyPairType: self.keyPairType
            };
            self.storageValue = storageValue;
        }
        else {
            var keyPairEncryptedAsHex = self.encryptWithPassword(password);
            var storageValue = {
                keyPairType: self.keyPairType,
                value: "encrypted:".concat(keyPairEncryptedAsHex)
            };
            self.storageValue = storageValue;
            self.encryptedKeyPair = Buffer.from(keyPairEncryptedAsHex);
        }
        return self;
    };
    // TODO: remove the KeyPairType from here and derive from the string
    KeyPair.fromStorageValue = function (storageValue, keyPairType, password) {
        var self = new KeyPair();
        self.keyPairType = keyPairType;
        self.storageValue = storageValue;
        // the KeyPair is to be persisted either Encrypted or Raw (unencrypted)
        try {
            if (storageValue.keyPairType === KeyPairType.Raw) {
                var keyPairPointer = self.unencryptedStorageValueToKeyPair(storageValue.value);
                self.keyPairPointer = keyPairPointer;
            }
            else {
                var keyPairPointer = self.encryptedStorageValueToKeyPair(storageValue.value, password);
                self.keyPairPointer = keyPairPointer;
            }
            return self;
        }
        catch (error) {
            throw new Error(error);
        }
    };
    // turns a storage value string to StorageValue object
    // "unencrypted:20000000f9e3191d096... -> StorageValue
    // "encrypted:ec5d6c48eb2e27423533f... -> StorageValue
    KeyPair.storageValueStringToStorageValue = function (storageValueString) {
        var storageValue;
        if (storageValueString.startsWith("unencrypted:")) {
            storageValue = {
                value: storageValueString,
                keyPairType: KeyPairType.Raw
            };
        }
        else if (storageValueString.startsWith("encrypted:")) {
            storageValue = {
                value: storageValueString,
                keyPairType: KeyPairType.Encrypted
            };
        }
        return storageValue;
    };
    return KeyPair;
}());
exports.KeyPair = KeyPair;
// utils for encodeing/decoding hex
var HEX_STRINGS = "0123456789abcdef";
var MAP_HEX = {
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
    F: 15
};
// Fast Uint8Array to hex
function toHex(bytes) {
    return Array.from(bytes || [])
        .map(function (b) { return HEX_STRINGS[b >> 4] + HEX_STRINGS[b & 15]; })
        .join("");
}
// Mimics Buffer.from(x, 'hex') logic
// Stops on first non-hex string and returns
// https://github.com/nodejs/node/blob/v14.18.1/src/string_bytes.cc#L246-L261
function fromHex(hexString) {
    var bytes = new Uint8Array(Math.floor((hexString || "").length / 2));
    var i;
    for (i = 0; i < bytes.length; i++) {
        var a = MAP_HEX[hexString[i * 2]];
        var b = MAP_HEX[hexString[i * 2 + 1]];
        if (a === undefined || b === undefined) {
            break;
        }
        bytes[i] = (a << 4) | b;
    }
    return i === bytes.length ? bytes : bytes.slice(0, i);
}
