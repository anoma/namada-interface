import { HttpClient } from "@cosmjs/tendermint-rpc";
import { JsonRpcSuccessResponse } from "@cosmjs/json-rpc";
import { fromBase64 } from "@cosmjs/encoding";
import { BinaryReader, deserialize } from "borsh";
import { Buffer } from "buffer";

import RpcClientBase, { RpcClientInitArgs } from "./RpcClientBase";
import { schemaAmount, TokenAmount } from "schema";
import { amountFromMicro, createJsonRpcRequest } from "utils/helpers";
import { AbciResponse } from "./types";

class RpcClient extends RpcClientBase {
  private _client: HttpClient;

  constructor(args: RpcClientInitArgs) {
    super(args);
    this._client = new HttpClient(this.endpoint);
  }

  public async queryBalance(token: string, owner?: string): Promise<number> {
    const path = `value/#${token}/balance/#${owner}`;
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
    const path = "epoch";
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

  public async isKnownAddress(address: string): Promise<boolean> {
    const path = `has_key/#${address}/?`;
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

  public async queryChannel(
    channelId: string,
    portId = "transfer"
  ): Promise<boolean> {
    const path = `#IBC/channelEnds/ports/${portId}/channels/${channelId}`;
    const request = createJsonRpcRequest("abci_query", [path, "", "0", false]);

    try {
      const json: JsonRpcSuccessResponse = await this._client.execute(request);
      const response: AbciResponse = json.result.response;
      if (response.code === 0) {
        // TODO: We are expecting a result encoded as a Protobuf, so it should be handled here:
        return true;
      }
      return false;
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

export default RpcClient;
