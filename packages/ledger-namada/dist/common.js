"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializePath = exports.processErrorResponse = exports.errorCodeToString = exports.ERROR_DESCRIPTION = exports.LedgerError = exports.ERROR_CODE = exports.SIGN_VALUES_P2 = exports.P2_VALUES = exports.P1_VALUES = exports.PAYLOAD_TYPE = exports.CHUNK_SIZE = void 0;
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
exports.CHUNK_SIZE = 250;
exports.PAYLOAD_TYPE = {
    INIT: 0x00,
    ADD: 0x01,
    LAST: 0x02,
};
exports.P1_VALUES = {
    ONLY_RETRIEVE: 0x00,
    SHOW_ADDRESS_IN_DEVICE: 0x01,
};
exports.P2_VALUES = {
    DEFAULT: 0x00,
};
// noinspection JSUnusedGlobalSymbols
exports.SIGN_VALUES_P2 = {
    DEFAULT: 0x00,
};
exports.ERROR_CODE = {
    NoError: 0x9000,
};
var LedgerError;
(function (LedgerError) {
    LedgerError[LedgerError["U2FUnknown"] = 1] = "U2FUnknown";
    LedgerError[LedgerError["U2FBadRequest"] = 2] = "U2FBadRequest";
    LedgerError[LedgerError["U2FConfigurationUnsupported"] = 3] = "U2FConfigurationUnsupported";
    LedgerError[LedgerError["U2FDeviceIneligible"] = 4] = "U2FDeviceIneligible";
    LedgerError[LedgerError["U2FTimeout"] = 5] = "U2FTimeout";
    LedgerError[LedgerError["Timeout"] = 14] = "Timeout";
    LedgerError[LedgerError["NoErrors"] = 36864] = "NoErrors";
    LedgerError[LedgerError["DeviceIsBusy"] = 36865] = "DeviceIsBusy";
    LedgerError[LedgerError["ErrorDerivingKeys"] = 26626] = "ErrorDerivingKeys";
    LedgerError[LedgerError["ExecutionError"] = 25600] = "ExecutionError";
    LedgerError[LedgerError["WrongLength"] = 26368] = "WrongLength";
    LedgerError[LedgerError["EmptyBuffer"] = 27010] = "EmptyBuffer";
    LedgerError[LedgerError["OutputBufferTooSmall"] = 27011] = "OutputBufferTooSmall";
    LedgerError[LedgerError["DataIsInvalid"] = 27012] = "DataIsInvalid";
    LedgerError[LedgerError["ConditionsNotSatisfied"] = 27013] = "ConditionsNotSatisfied";
    LedgerError[LedgerError["TransactionRejected"] = 27014] = "TransactionRejected";
    LedgerError[LedgerError["BadKeyHandle"] = 27264] = "BadKeyHandle";
    LedgerError[LedgerError["InvalidP1P2"] = 27392] = "InvalidP1P2";
    LedgerError[LedgerError["InstructionNotSupported"] = 27904] = "InstructionNotSupported";
    LedgerError[LedgerError["AppDoesNotSeemToBeOpen"] = 28161] = "AppDoesNotSeemToBeOpen";
    LedgerError[LedgerError["UnknownError"] = 28416] = "UnknownError";
    LedgerError[LedgerError["SignVerifyError"] = 28417] = "SignVerifyError";
})(LedgerError || (exports.LedgerError = LedgerError = {}));
exports.ERROR_DESCRIPTION = {
    [LedgerError.U2FUnknown]: 'U2F: Unknown',
    [LedgerError.U2FBadRequest]: 'U2F: Bad request',
    [LedgerError.U2FConfigurationUnsupported]: 'U2F: Configuration unsupported',
    [LedgerError.U2FDeviceIneligible]: 'U2F: Device Ineligible',
    [LedgerError.U2FTimeout]: 'U2F: Timeout',
    [LedgerError.Timeout]: 'Timeout',
    [LedgerError.NoErrors]: 'No errors',
    [LedgerError.DeviceIsBusy]: 'Device is busy',
    [LedgerError.ErrorDerivingKeys]: 'Error deriving keys',
    [LedgerError.ExecutionError]: 'Execution Error',
    [LedgerError.WrongLength]: 'Wrong Length',
    [LedgerError.EmptyBuffer]: 'Empty Buffer',
    [LedgerError.OutputBufferTooSmall]: 'Output buffer too small',
    [LedgerError.DataIsInvalid]: 'Data is invalid',
    [LedgerError.ConditionsNotSatisfied]: 'Conditions not satisfied',
    [LedgerError.TransactionRejected]: 'Transaction rejected',
    [LedgerError.BadKeyHandle]: 'Bad key handle',
    [LedgerError.InvalidP1P2]: 'Invalid P1/P2',
    [LedgerError.InstructionNotSupported]: 'Instruction not supported',
    [LedgerError.AppDoesNotSeemToBeOpen]: 'App does not seem to be open',
    [LedgerError.UnknownError]: 'Unknown error',
    [LedgerError.SignVerifyError]: 'Sign/verify error',
};
function errorCodeToString(statusCode) {
    if (statusCode in exports.ERROR_DESCRIPTION)
        return exports.ERROR_DESCRIPTION[statusCode];
    return `Unknown Status Code: ${statusCode}`;
}
exports.errorCodeToString = errorCodeToString;
function isDict(v) {
    return typeof v === 'object' && v !== null && !(v instanceof Array) && !(v instanceof Date);
}
function processErrorResponse(response) {
    if (response) {
        if (isDict(response)) {
            if (Object.prototype.hasOwnProperty.call(response, 'statusCode')) {
                return {
                    returnCode: response.statusCode,
                    errorMessage: errorCodeToString(response.statusCode),
                };
            }
            if (Object.prototype.hasOwnProperty.call(response, 'returnCode') && Object.prototype.hasOwnProperty.call(response, 'errorMessage')) {
                return response;
            }
        }
        return {
            returnCode: 0xffff,
            errorMessage: response.toString(),
        };
    }
    return {
        returnCode: 0xffff,
        errorMessage: response.toString(),
    };
}
exports.processErrorResponse = processErrorResponse;
const HARDENED = 0x80000000;
const DEFAULT_DER_PATH_LEN = 6;
const IDENTITY_DER_PATH_LEN = 4; // m/888'/0'/<account>
function serializePath(path) {
    if (!path.startsWith('m')) {
        throw new Error(`Path should start with "m" (e.g "m/44'/5757'/5'/0/3")`);
    }
    const pathArray = path.split('/');
    let allocSize = 0;
    if (pathArray.length === DEFAULT_DER_PATH_LEN || pathArray.length === IDENTITY_DER_PATH_LEN) {
        allocSize = (pathArray.length - 1) * 4 + 1;
    }
    else {
        throw new Error(`Invalid path. (e.g "m/44'/134'/0/0/0"`);
    }
    const buf = Buffer.alloc(allocSize);
    buf.writeUInt8(pathArray.length - 1, 0);
    for (let i = 1; i < pathArray.length; i += 1) {
        let value = 0;
        let child = pathArray[i];
        if (child.endsWith("'")) {
            value += HARDENED;
            child = child.slice(0, -1);
        }
        const childNumber = Number(child);
        if (Number.isNaN(childNumber)) {
            throw new Error(`Invalid path : ${child} is not a number. (e.g "m/44'/461'/5'/0/3")`);
        }
        if (childNumber >= HARDENED) {
            throw new Error('Incorrect child value (bigger or equal to 0x80000000)');
        }
        value += childNumber;
        buf.writeUInt32LE(value, 4 * (i - 1) + 1);
    }
    return buf;
}
exports.serializePath = serializePath;
//# sourceMappingURL=common.js.map