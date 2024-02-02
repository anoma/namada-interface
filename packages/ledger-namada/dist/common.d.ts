/// <reference types="node" />
/** ******************************************************************************
 *  (c) 2018 - 2023 Zondax AG
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
export declare const CHUNK_SIZE = 250;
export declare const PAYLOAD_TYPE: {
    INIT: number;
    ADD: number;
    LAST: number;
};
export declare const P1_VALUES: {
    ONLY_RETRIEVE: number;
    SHOW_ADDRESS_IN_DEVICE: number;
};
export declare const P2_VALUES: {
    DEFAULT: number;
};
export declare const SIGN_VALUES_P2: {
    DEFAULT: number;
};
export declare const ERROR_CODE: {
    NoError: number;
};
export declare enum LedgerError {
    U2FUnknown = 1,
    U2FBadRequest = 2,
    U2FConfigurationUnsupported = 3,
    U2FDeviceIneligible = 4,
    U2FTimeout = 5,
    Timeout = 14,
    NoErrors = 36864,
    DeviceIsBusy = 36865,
    ErrorDerivingKeys = 26626,
    ExecutionError = 25600,
    WrongLength = 26368,
    EmptyBuffer = 27010,
    OutputBufferTooSmall = 27011,
    DataIsInvalid = 27012,
    ConditionsNotSatisfied = 27013,
    TransactionRejected = 27014,
    BadKeyHandle = 27264,
    InvalidP1P2 = 27392,
    InstructionNotSupported = 27904,
    AppDoesNotSeemToBeOpen = 28161,
    UnknownError = 28416,
    SignVerifyError = 28417
}
export declare const ERROR_DESCRIPTION: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    14: string;
    36864: string;
    36865: string;
    26626: string;
    25600: string;
    26368: string;
    27010: string;
    27011: string;
    27012: string;
    27013: string;
    27014: string;
    27264: string;
    27392: string;
    27904: string;
    28161: string;
    28416: string;
    28417: string;
};
export declare function errorCodeToString(statusCode: LedgerError): string;
export declare function processErrorResponse(response: any): any;
export declare function serializePath(path: string): Buffer;
