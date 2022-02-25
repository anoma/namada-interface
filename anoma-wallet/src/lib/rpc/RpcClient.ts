import { HttpClient } from "@cosmjs/tendermint-rpc";
import { JsonRpcSuccessResponse } from "@cosmjs/json-rpc";
import { fromBase64 } from "@cosmjs/encoding";
import { BinaryReader, deserialize } from "borsh";
import { Buffer } from "buffer";

import RpcClientBase from "./RpcClientBase";
import { schemaAmount, TokenAmount } from "schema";
import { amountFromMicro, createJsonRpcRequest } from "utils/helpers";
import { AbciResponse } from "./types";

class RpcClient extends RpcClientBase {
  public async queryBalance(token: string, owner?: string): Promise<number> {
    const client = new HttpClient(this.endpoint);
    const path = `value/#${token}/balance/#${owner}`;
    const request = createJsonRpcRequest("abci_query", [path, "", "0", false]);

    try {
      const jsonRpcSuccessResponse: JsonRpcSuccessResponse =
        await client.execute(request);
      const { response }: { response: AbciResponse } =
        jsonRpcSuccessResponse.result;
      if (response.code === 1) {
        return -2;
      }
      const valueAsByteArray = fromBase64(response.value || "0") as Buffer;
      const decoded = deserialize(schemaAmount, TokenAmount, valueAsByteArray);
      return amountFromMicro(decoded.micro.toNumber());
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async queryEpoch(): Promise<number> {
    const client = new HttpClient(this.endpoint);
    const path = "epoch";
    const request = createJsonRpcRequest("abci_query", [path, "", "0", false]);

    try {
      const json: JsonRpcSuccessResponse = await client.execute(request);
      const { response }: { response: AbciResponse } = json.result;

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
    const client = new HttpClient(this.endpoint);
    const path = `has_key/#${address}/?`;
    const request = createJsonRpcRequest("abci_query", [path, "", "0", false]);

    try {
      const jsonRpcSuccessResponse: JsonRpcSuccessResponse =
        await client.execute(request);
      const { response }: { response: AbciResponse } =
        jsonRpcSuccessResponse.result;
      // borsh serialises true to 1 which in base64 is AQ==
      if (response.code === 0 && response && response.value === "AQ==") {
        return true;
      }
      return false;
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

export default RpcClient;
