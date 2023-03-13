import { HttpClient } from "@cosmjs/tendermint-rpc";
import { JsonRpcSuccessResponse } from "@cosmjs/json-rpc";
import { fromBase64 } from "@cosmjs/encoding";
import { BinaryReader, deserialize } from "borsh";
import { Buffer } from "buffer";

import { amountFromMicro, createJsonRpcRequest } from "@anoma/utils";
import { schemaAmount, TokenAmount } from "./schema";
import { AbciResponse, PathType } from "./types";

const ABCI_QUERY_PATH_PREFIX = "/shell/";

class RpcClient {
  private _client: HttpClient;

  constructor(url: string) {
    this._client = new HttpClient(url);
  }

  public async broadcastTxSync(tx: string): Promise<AbciResponse> {
    const request = createJsonRpcRequest("broadcast_tx_sync", [tx]);

    try {
      const json: JsonRpcSuccessResponse = await this._client.execute(request);
      const response: AbciResponse = json.result.response;
      return response;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async getAppliedTx(hash: string): Promise<AbciResponse> {
    const path = `${ABCI_QUERY_PATH_PREFIX}applied/${hash}`;
    const request = createJsonRpcRequest("abci_query", [path, "", "0", false]);
    let TRIES = 40;

    const executeRequest = async (): Promise<AbciResponse> => {
      try {
        const json: JsonRpcSuccessResponse = await this._client.execute(
          request
        );
        const response: AbciResponse = json.result.response;
        return response;
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const executePollRequest = async (): Promise<AbciResponse> => {
      let result = await executeRequest();
      while (result.value === "AA==" && TRIES > 0) {
        TRIES--;
        await wait(1000);
        result = await executeRequest();
      }
      return result;
    };

    const wait = async (ms = 1000): Promise<unknown> => {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    };

    return executePollRequest();
  }

  public async queryBalance(token: string, owner: string): Promise<number> {
    const path = `${ABCI_QUERY_PATH_PREFIX}value/#${token}/balance/#${owner}`;
    const request = createJsonRpcRequest("abci_query", [path, "", "0", false]);

    try {
      const json: JsonRpcSuccessResponse = await this._client.execute(request);
      const response: AbciResponse = json.result.response;

      if (response.code === 1) {
        return -2;
      }
      const valueAsByteArray = fromBase64(response.value || "0");
      const decoded = deserialize(
        schemaAmount,
        TokenAmount,
        Buffer.from(valueAsByteArray)
      );

      // Note: .toNumber() is limited to 53 bits:
      return amountFromMicro(decoded.micro.toNumber());
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async queryEpoch(): Promise<number> {
    const path = `${ABCI_QUERY_PATH_PREFIX}epoch`;
    const request = createJsonRpcRequest("abci_query", [path, "", "0", false]);

    try {
      const json: JsonRpcSuccessResponse = await this._client.execute(request);
      const response: AbciResponse = json.result.response;

      const epochByteArray = fromBase64(response.value || "0");
      const buffer = Buffer.from(epochByteArray);
      const epochReader = new BinaryReader(buffer);
      const epochBN = epochReader.readU64();
      return epochBN.toNumber();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  // util for creating paths for ledger
  // TODO, use more of this util and expand as needed
  // https://github.com/heliaxdev/namada-interface/issues/38#issuecomment-1104968959
  createPath = (pathType: PathType, storageKey?: string): string => {
    switch (pathType) {
      case PathType.HasKey:
      case PathType.Prefix:
      case PathType.Value:
        if (storageKey) {
          return `${ABCI_QUERY_PATH_PREFIX}${pathType}/${storageKey}`;
        }
        throw "cannot create path";
    }
  };

  public async isKnownAddress(address: string): Promise<boolean> {
    const path = `${ABCI_QUERY_PATH_PREFIX}has_key/#${address}/?`;
    const request = createJsonRpcRequest("abci_query", [path, "", "0", false]);

    try {
      const json: JsonRpcSuccessResponse = await this._client.execute(request);
      const response: AbciResponse = json.result.response;
      // borsh serialises true to 1 which in base64 is AQ==
      if (response.code === 0 && response.value === "AQ==") {
        return true;
      }
      return false;
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

export default RpcClient;
