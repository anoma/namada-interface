"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamadaApp = exports.LedgerError = void 0;
const common_1 = require("./common");
Object.defineProperty(exports, "LedgerError", { enumerable: true, get: function () { return common_1.LedgerError; } });
const config_1 = require("./config");
const processResponses_1 = require("./processResponses");
__exportStar(require("./types"), exports);
class NamadaApp {
    constructor(transport) {
        if (!transport) {
            throw new Error('Transport has not been defined');
        }
        this.transport = transport;
    }
    async prepareChunks(serializedPath, message) {
        const chunks = [];
        chunks.push(serializedPath);
        for (let i = 0; i < message.length; i += common_1.CHUNK_SIZE) {
            let end = i + common_1.CHUNK_SIZE;
            if (i > message.length) {
                end = message.length;
            }
            chunks.push(message.subarray(i, end));
        }
        return chunks;
    }
    async getVersion() {
        return this.transport.send(config_1.CLA, config_1.INS.GET_VERSION, 0, 0).then((response) => {
            const errorCodeData = response.slice(-2);
            const returnCode = errorCodeData[0] * 256 + errorCodeData[1];
            let targetId = 0;
            if (response.length >= 9) {
                /* eslint-disable no-bitwise */
                targetId = (response[5] << 24) + (response[6] << 16) + (response[7] << 8) + (response[8] << 0);
                /* eslint-enable no-bitwise */
            }
            return {
                returnCode: returnCode,
                errorMessage: (0, common_1.errorCodeToString)(returnCode),
                // ///
                testMode: response[0] !== 0,
                major: response[1],
                minor: response[2],
                patch: response[3],
                deviceLocked: response[4] === 1,
                targetId: targetId.toString(16),
            };
        }, common_1.processErrorResponse);
    }
    async getAppInfo() {
        return this.transport.send(0xb0, 0x01, 0, 0).then(response => {
            const errorCodeData = response.slice(-2);
            const returnCode = errorCodeData[0] * 256 + errorCodeData[1];
            const result = {};
            let appName = 'err';
            let appVersion = 'err';
            let flagLen = 0;
            let flagsValue = 0;
            if (response[0] !== 1) {
                // Ledger responds with format ID 1. There is no spec for any format != 1
                result.errorMessage = 'response format ID not recognized';
                result.returnCode = common_1.LedgerError.DeviceIsBusy;
            }
            else {
                const appNameLen = response[1];
                appName = response.slice(2, 2 + appNameLen).toString('ascii');
                let idx = 2 + appNameLen;
                const appVersionLen = response[idx];
                idx += 1;
                appVersion = response.slice(idx, idx + appVersionLen).toString('ascii');
                idx += appVersionLen;
                const appFlagsLen = response[idx];
                idx += 1;
                flagLen = appFlagsLen;
                flagsValue = response[idx];
            }
            return {
                returnCode,
                errorMessage: (0, common_1.errorCodeToString)(returnCode),
                //
                appName,
                appVersion,
                flagLen,
                flagsValue,
                flagRecovery: (flagsValue & 1) !== 0,
                // eslint-disable-next-line no-bitwise
                flagSignedMcuCode: (flagsValue & 2) !== 0,
                // eslint-disable-next-line no-bitwise
                flagOnboarded: (flagsValue & 4) !== 0,
                // eslint-disable-next-line no-bitwise
                flagPINValidated: (flagsValue & 128) !== 0,
            };
        }, common_1.processErrorResponse);
    }
    async getAddressAndPubKey(path) {
        const serializedPath = (0, common_1.serializePath)(path);
        return this.transport
            .send(config_1.CLA, config_1.INS.GET_PUBLIC_KEY, common_1.P1_VALUES.ONLY_RETRIEVE, 0, serializedPath, [common_1.LedgerError.NoErrors])
            .then(processResponses_1.processGetAddrResponse, common_1.processErrorResponse);
    }
    async showAddressAndPubKey(path) {
        const serializedPath = (0, common_1.serializePath)(path);
        return this.transport
            .send(config_1.CLA, config_1.INS.GET_PUBLIC_KEY, common_1.P1_VALUES.SHOW_ADDRESS_IN_DEVICE, 0, serializedPath, [common_1.LedgerError.NoErrors])
            .then(processResponses_1.processGetAddrResponse, common_1.processErrorResponse);
    }
    async signSendChunk(chunkIdx, chunkNum, chunk, ins) {
        let payloadType = common_1.PAYLOAD_TYPE.ADD;
        const p2 = 0;
        if (chunkIdx === 1) {
            payloadType = common_1.PAYLOAD_TYPE.INIT;
        }
        if (chunkIdx === chunkNum) {
            payloadType = common_1.PAYLOAD_TYPE.LAST;
        }
        return this.transport
            .send(config_1.CLA, ins, payloadType, p2, chunk, [
            common_1.LedgerError.NoErrors,
            common_1.LedgerError.DataIsInvalid,
            common_1.LedgerError.BadKeyHandle,
            common_1.LedgerError.SignVerifyError,
        ])
            .then((response) => {
            const errorCodeData = response.subarray(-2);
            const returnCode = errorCodeData[0] * 256 + errorCodeData[1];
            let errorMessage = (0, common_1.errorCodeToString)(returnCode);
            if (returnCode === common_1.LedgerError.BadKeyHandle ||
                returnCode === common_1.LedgerError.DataIsInvalid ||
                returnCode === common_1.LedgerError.SignVerifyError) {
                errorMessage = `${errorMessage} : ${response.subarray(0, response.length - 2).toString('ascii')}`;
            }
            if (returnCode === common_1.LedgerError.NoErrors && response.length > 2) {
                return {
                    signature: (0, processResponses_1.getSignatureResponse)(response),
                    returnCode,
                    errorMessage,
                };
            }
            return {
                returnCode: returnCode,
                errorMessage: errorMessage,
            };
        }, common_1.processErrorResponse);
    }
    async sign(path, message) {
        const serializedPath = (0, common_1.serializePath)(path);
        return this.prepareChunks(serializedPath, message).then(chunks => {
            return this.signSendChunk(1, chunks.length, chunks[0], config_1.INS.SIGN).then(async (response) => {
                let result = {
                    returnCode: response.returnCode,
                    errorMessage: response.errorMessage,
                };
                for (let i = 1; i < chunks.length; i++) {
                    result = await this.signSendChunk(1 + i, chunks.length, chunks[i], config_1.INS.SIGN);
                    if (result.returnCode !== common_1.LedgerError.NoErrors) {
                        break;
                    }
                }
                return result;
            }, common_1.processErrorResponse);
        }, common_1.processErrorResponse);
    }
}
exports.NamadaApp = NamadaApp;
//# sourceMappingURL=namadaApp.js.map