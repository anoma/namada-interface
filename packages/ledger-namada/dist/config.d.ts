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
export declare const CLA = 87;
export declare const INS: {
    GET_VERSION: number;
    GET_PUBLIC_KEY: number;
    SIGN: number;
    GET_MASP_ADDRESS: number;
    GET_IVK: number;
    GET_OVK: number;
    GET_NF: number;
};
export declare const SALT_LEN = 8;
export declare const HASH_LEN = 32;
export declare const PK_LEN_PLUS_TAG = 33;
export declare const SIG_LEN_PLUS_TAG = 65;
