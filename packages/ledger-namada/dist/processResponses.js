"use strict";
/** ******************************************************************************
 *  (c) 2018 - 2022 Zondax AG
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ******************************************************************************* */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processGetAddrResponse = exports.getSignatureResponse = void 0;
const common_1 = require("./common");
const config_1 = require("./config");
function getSignatureResponse(response) {
    console.log('Processing get signature response');
    // App sign response: [ pubkey(33) | raw_salt(8) | raw_signature(65) | wrapper_salt(8) | wrapper_signature(65) |
    // raw_indices_len(1) | wrapper_indices_len(1) | indices(wrapper_indices_len) ]
    let offset = 0;
    const pubkey = Buffer.from(response.subarray(offset, offset + config_1.PK_LEN_PLUS_TAG));
    offset += config_1.PK_LEN_PLUS_TAG;
    const raw_salt = Buffer.from(response.subarray(offset, offset + config_1.SALT_LEN));
    offset += config_1.SALT_LEN;
    const raw_signature = Buffer.from(response.subarray(offset, offset + config_1.SIG_LEN_PLUS_TAG));
    offset += config_1.SIG_LEN_PLUS_TAG;
    const wrapper_salt = Buffer.from(response.subarray(offset, offset + config_1.SALT_LEN));
    offset += config_1.SALT_LEN;
    const wrapper_signature = Buffer.from(response.subarray(offset, offset + config_1.SIG_LEN_PLUS_TAG));
    offset += config_1.SIG_LEN_PLUS_TAG;
    const raw_indices_len = response[offset];
    offset += 1;
    const raw_indices = Buffer.from(response.subarray(offset, offset + raw_indices_len));
    offset += raw_indices_len;
    const wrapper_indices_len = response[offset];
    offset += 1;
    const wrapper_indices = Buffer.from(response.subarray(offset, offset + wrapper_indices_len));
    offset += wrapper_indices_len;
    return {
        pubkey,
        raw_salt,
        raw_signature,
        wrapper_salt,
        wrapper_signature,
        raw_indices,
        wrapper_indices,
    };
}
exports.getSignatureResponse = getSignatureResponse;
function processGetAddrResponse(response) {
    console.log('Processing get address response');
    const errorCodeData = response.subarray(-2);
    const returnCode = errorCodeData[0] * 256 + errorCodeData[1];
    const publicKey = Buffer.from(response.subarray(0, config_1.PK_LEN_PLUS_TAG));
    const address = Buffer.from(response.subarray(config_1.PK_LEN_PLUS_TAG, -2));
    return {
        publicKey,
        address,
        returnCode,
        errorMessage: (0, common_1.errorCodeToString)(returnCode),
    };
}
exports.processGetAddrResponse = processGetAddrResponse;
// Not used yet
// function processGetShieldedAddrResponse(response: Buffer) {
//   console.log("Processing get address response")
//   let partialResponse = response
//   const errorCodeData = partialResponse.slice(-2)
//   const returnCode = errorCodeData[0] * 256 + errorCodeData[1]
//   //get public key len (variable)
//   const raw_pkd = Buffer.from(partialResponse.slice(0, 32))
//   //"advance" buffer
//   partialResponse = partialResponse.slice(32)
//   // get the length of the bech32m address
//   const bech32m_len = partialResponse[0]
//   //"advance" buffer
//   partialResponse = partialResponse.slice(1)
//   // get the bech32m encoding of the shielded address
//   const bech32m_addr = Buffer.from(partialResponse.slice(0, bech32m_len))
//   return {
//     raw_pkd,
//     bech32m_len,
//     bech32m_addr,
//     returnCode,
//     errorMessage: errorCodeToString(returnCode),
//   }
// }
// function processIncomingViewingKeyResponse(response: Buffer) {
//   console.log("Processing get IVK response")
//   const partialResponse = response
//   const errorCodeData = partialResponse.slice(-2)
//   const returnCode = errorCodeData[0] * 256 + errorCodeData[1]
//   //get public key len (variable)
//   const raw_ivk = Buffer.from(partialResponse.slice(0, 32))
//   return {
//     raw_ivk,
//     returnCode,
//     errorMessage: errorCodeToString(returnCode),
//   }
// }
// function processNullifierResponse(response: Buffer) {
//   console.log("Processing get nullifier response")
//   const partialResponse = response
//   const errorCodeData = partialResponse.slice(-2)
//   const returnCode = errorCodeData[0] * 256 + errorCodeData[1]
//   const raw_nf = Buffer.from(partialResponse.slice(0, 32))
//   return {
//     raw_nf,
//     returnCode,
//     errorMessage: errorCodeToString(returnCode),
//   }
// }
// function processOutgoingViewingKeyResponse(response: Buffer) {
//   console.log("Processing get OVK response")
//   const partialResponse = response
//   const errorCodeData = partialResponse.slice(-2)
//   const returnCode = errorCodeData[0] * 256 + errorCodeData[1]
//   //get public key len (variable)
//   const raw_ovk = Buffer.from(partialResponse.slice(0, 32))
//   return {
//     raw_ovk,
//     returnCode,
//     errorMessage: errorCodeToString(returnCode),
//   }
// }
//# sourceMappingURL=processResponses.js.map