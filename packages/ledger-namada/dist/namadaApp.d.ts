/// <reference types="node" />
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
import Transport from '@ledgerhq/hw-transport';
import { ResponseAddress, ResponseAppInfo, ResponseBase, ResponseSign, ResponseVersion } from './types';
import { LedgerError } from './common';
export { LedgerError };
export * from './types';
export declare class NamadaApp {
    transport: Transport;
    constructor(transport: Transport);
    prepareChunks(serializedPath: Buffer, message: Buffer): Promise<Buffer[]>;
    getVersion(): Promise<ResponseVersion>;
    getAppInfo(): Promise<ResponseAppInfo>;
    getAddressAndPubKey(path: string): Promise<ResponseAddress>;
    showAddressAndPubKey(path: string): Promise<ResponseAddress>;
    signSendChunk(chunkIdx: number, chunkNum: number, chunk: Buffer, ins: number): Promise<ResponseBase>;
    sign(path: string, message: Buffer): Promise<ResponseSign>;
}
