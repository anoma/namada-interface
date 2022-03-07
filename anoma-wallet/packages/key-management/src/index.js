"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
exports.__esModule = true;
exports.WalletFileManager = exports.KeyPairType = exports.KeyPair = exports.MnemonicLength = exports.Mnemonic = void 0;
var Mnemonic_1 = require("./Mnemonic");
__createBinding(exports, Mnemonic_1, "Mnemonic");
__createBinding(exports, Mnemonic_1, "MnemonicLength");
var KeyPair_1 = require("./KeyPair");
__createBinding(exports, KeyPair_1, "KeyPair");
__createBinding(exports, KeyPair_1, "KeyPairType");
var WalletFile_1 = require("./WalletFile");
__createBinding(exports, WalletFile_1, "WalletFileManager");
// import { Keypair as WasmKeypair } from "./lib/anoma_wasm.js";
// import { Mnemonic } from "./Mnemonic";
// const ENCRYPTED_KEY_PREFIX = "encrypted";
// const UNENCRYPTED_KEY_PREFIX = "unencrypted";
// export class KeyPair {
//   readonly storedKeyPair: StoredKeyPair;
//   publicKey: Uint8Array;
//   secretKey: Uint8Array;
//   keyPairType: KeyPairType;
//   value: string;
//   wasmKeypair: WasmKeypair;
//   encryptedKeyPair: Uint8Array;
//   constructor(
//     mnemonic: Mnemonic,
//     keyPairType: KeyPairType = KeyPairType.Encrypted
//   ) {
//     const keyPair = WasmKeypair.from_mnemonic(mnemonic.value, 1);
//     this.wasmKeypair = keyPair;
//     const serializedKeyPair = keyPair.from_pointer_to_js_value();
//     this.storedKeyPair = this.toStoredKeyPair(serializedKeyPair);
//     this.encryptWithPassword("aaa");
//   }
//   private toStoredKeyPair = (
//     serializedKeyPair: SerializedKeyPair,
//     storedKeyPairType: StoredKeyPairType = StoredKeyPairType.Encrypted
//   ): StoredKeyPair => {
//     // turn them to hex
//     const publicKeyAsHex = Buffer.from(serializedKeyPair.public).toString(
//       "hex"
//     );
//     const secretKeyAsHex = Buffer.from(serializedKeyPair.secret).toString(
//       "hex"
//     );
//     // add prefixes and generate merged
//     const publicKeyHexWithPrefix = `2000000${publicKeyAsHex}`;
//     const secretKeyHexWithPrefix = `2000000${secretKeyAsHex}`;
//     const keypairString = `${publicKeyHexWithPrefix}${secretKeyHexWithPrefix}`;
//     // put the right prefix to the stored string
//     const storedKeyPairPrefix =
//       storedKeyPairType === StoredKeyPairType.Encrypted
//         ? ENCRYPTED_KEY_PREFIX
//         : UNENCRYPTED_KEY_PREFIX;
//     const storedKeyPair: StoredKeyPair = {
//       value: `${storedKeyPairPrefix}: ${keypairString}`,
//       StoredKeyPairType: storedKeyPairType,
//     };
//     return storedKeyPair;
//   };
//   fromMnemonic = (mnemonic: Mnemonic) => {};
//   encryptWithPassword = (password: string) => {
//     this.encryptedKeyPair = this.wasmKeypair.encrypt_with_password(password);
//     console.log(this.encryptedKeyPair, "this.encryptedKeyPair");
//     const encryptedKeyPairAsHex = Buffer.from(this.encryptedKeyPair).toString(
//       "hex"
//     );
//     console.log(encryptedKeyPairAsHex, "encryptedKeyPairAsHex");
//     // from web
//     // 281433bab37eca76c2ddaaf9c4582c4d5ad4d3700db947d15b0f68ea5c94aabba91f4ef9738d85ebd1b5716af59486e31255891b551cb9bbb520ff499fc60b5fc154b789a17aa7801f4516425afc8f9a8479fb912b6afae8227eabd67347c62311209d0e3bc62204feeac8e4f98c91b6f311c9b243c1f4822bd608e9769ca90a
//     // from cli
//     // ec5d6c48eb2e27423533f56d4fcea010d6711055fda0f3bd146b555e88ef4bf5e3ec447bab58537e55c2ff87aa9e5e08cf41db3f472d55fa766fa48bf122004e6ab4421142329055989bdf51bd2307a2fe24f0babea4bceb90eee91347188e3b6f0f23d1e3fff690f10ebd1c593d2167c773baf2967b60fde51c71cae64c6b3c
//   };
//   serialize = (): Uint8Array => {
//     return new Uint8Array();
//   };
//   deserialize = () => {};
//   toBytes = () => {};
// }
// export type SecretKey = string;
// enum KeyPairType {
//   Encrypted,
//   Raw,
// }
// enum StoredKeyPairType {
//   Encrypted,
//   Raw,
// }
// type StoredKeyPair = {
//   StoredKeyPairType: StoredKeyPairType;
//   value: `encrypted: ${string}` | `unencrypted: ${string}`;
// };
// type SerializedKeyPair = {
//   public: Uint8Array;
//   secret: Uint8Array;
// };
